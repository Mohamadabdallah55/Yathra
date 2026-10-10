import {
  CurrentMatch,
  MatchRecord,
  Team,
  LeagueRow,
  CategoryKey,
  CardState,
  GameItem,
  DualTimerSyncState,
} from '../types';
import { INITIAL_TEAMS, DEFAULT_GAMES } from '../data/defaultGames';
import { webrtcSync } from './webrtcSync';

const STORAGE_KEYS = {
  TEAMS: 'tahadi5_teams_v1',
  GAMES: 'tahadi5_games_v1',
  CURRENT_MATCH: 'tahadi5_current_match_v1',
  MATCHES_HISTORY: 'tahadi5_matches_history_v1',
  SELECTED_CATEGORIES: 'tahadi5_selected_categories_v1',
  CARD_STATES: 'tahadi5_card_states_v1',
  TIMER_SYNC: 'tahadi5_timer_sync_v1',
  ARENA_COLUMN_GAMES: 'tahadi5_arena_column_games_v1',
};

// Cross-tab broadcast channel & WebSocket real-time network sync
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('tahadi_5_channel');
  } catch {
    broadcastChannel = null;
  }
}

// Active subscribers registry
const subscribers = new Set<(type: string, payload: unknown) => void>();

// Real-Time WebSocket client for remote mobile controller
let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

let isServerApiAvailable = true;
let apiFailures = 0;
let reconnectDelay = 3000;

function connectWebSocket() {
  if (typeof window === 'undefined' || typeof WebSocket === 'undefined') return;
  try {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      reconnectDelay = 3000;
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'FULL_STATE_SYNC' && data.payload) {
          Object.entries(data.payload).forEach(([type, payload]) => {
            syncIncomingUpdate(type, payload);
          });
        } else if (data.type) {
          syncIncomingUpdate(data.type, data.payload);
        }
      } catch {
        // Safe ignore
      }
    };

    socket.onclose = () => {
      socket = null;
      if (!reconnectTimer && isServerApiAvailable) {
        reconnectTimer = setTimeout(() => {
          reconnectTimer = null;
          reconnectDelay = Math.min(reconnectDelay * 1.5, 30000);
          connectWebSocket();
        }, reconnectDelay);
      }
    };

    socket.onerror = () => {
      socket?.close();
    };
  } catch {
    // Ignore in unsupported environments
  }
}

// Initialize socket immediately on client
if (typeof window !== 'undefined') {
  connectWebSocket();

  // Also fetch initial cached state from server on startup
  fetch('/api/state')
    .then((r) => {
      if (!r.ok) {
        isServerApiAvailable = false;
        return null;
      }
      return r.json();
    })
    .then((cachedState) => {
      if (cachedState && typeof cachedState === 'object') {
        Object.entries(cachedState).forEach(([type, payload]) => {
          syncIncomingUpdate(type, payload);
        });
      }
    })
    .catch(() => {
      apiFailures++;
      if (apiFailures >= 2) isServerApiAvailable = false;
    });

  // Safe periodic poll only if server API is proven available
  setInterval(() => {
    if (!isServerApiAvailable) return;
    if (!socket || socket.readyState !== 1) { // 1 = WebSocket.OPEN
      fetch('/api/state')
        .then((r) => {
          if (!r.ok) {
            apiFailures++;
            if (apiFailures >= 3) isServerApiAvailable = false;
            return null;
          }
          apiFailures = 0;
          return r.json();
        })
        .then((cachedState) => {
          if (cachedState && typeof cachedState === 'object') {
            Object.entries(cachedState).forEach(([type, payload]) => {
              syncIncomingUpdate(type, payload);
            });
          }
        })
        .catch(() => {
          apiFailures++;
          if (apiFailures >= 3) isServerApiAvailable = false;
        });
    }
  }, 4000);
}

// Throttled local storage writer with in-memory batching to eliminate synchronous frame drops
const pendingWrites = new Map<string, string>();
let writeBatchScheduled = false;

function batchSetLocalStorage(key: string, value: string) {
  pendingWrites.set(key, value);
  if (!writeBatchScheduled && typeof window !== 'undefined') {
    writeBatchScheduled = true;
    requestAnimationFrame(() => {
      try {
        pendingWrites.forEach((v, k) => {
          localStorage.setItem(k, v);
        });
        pendingWrites.clear();
      } catch {}
      writeBatchScheduled = false;
    });
  }
}

function syncIncomingUpdate(type: string, payload: unknown) {
  // Sync to local storage with throttled batching
  try {
    if (type === 'TEAMS_UPDATED') batchSetLocalStorage(STORAGE_KEYS.TEAMS, JSON.stringify(payload));
    if (type === 'MATCH_UPDATED') batchSetLocalStorage(STORAGE_KEYS.CURRENT_MATCH, JSON.stringify(payload));
    if (type === 'HISTORY_UPDATED') batchSetLocalStorage(STORAGE_KEYS.MATCHES_HISTORY, JSON.stringify(payload));
    if (type === 'CATEGORIES_UPDATED') batchSetLocalStorage(STORAGE_KEYS.SELECTED_CATEGORIES, JSON.stringify(payload));
    if (type === 'CARDS_UPDATED') batchSetLocalStorage(STORAGE_KEYS.CARD_STATES, JSON.stringify(payload));
    if (type === 'GAMES_UPDATED') batchSetLocalStorage(STORAGE_KEYS.GAMES, JSON.stringify(payload));
    if (type === 'ARENA_GAMES_UPDATED') batchSetLocalStorage(STORAGE_KEYS.ARENA_COLUMN_GAMES, JSON.stringify(payload));
  } catch {}

  // Notify registered React hooks
  subscribers.forEach((handler) => {
    try {
      handler(type, payload);
    } catch {}
  });
}

// Initialize WebRTC listener & provider for serverless peer sync (GitHub Pages & custom domains)
if (typeof window !== 'undefined') {
  webrtcSync.onMessage((type, payload) => {
    syncIncomingUpdate(type, payload);
  });

  webrtcSync.setFullStateProvider(() => {
    const fullState: Record<string, unknown> = {};
    try {
      const teams = localStorage.getItem(STORAGE_KEYS.TEAMS);
      if (teams) fullState['TEAMS_UPDATED'] = JSON.parse(teams);
      const match = localStorage.getItem(STORAGE_KEYS.CURRENT_MATCH);
      if (match) fullState['MATCH_UPDATED'] = JSON.parse(match);
      const history = localStorage.getItem(STORAGE_KEYS.MATCHES_HISTORY);
      if (history) fullState['HISTORY_UPDATED'] = JSON.parse(history);
      const cards = localStorage.getItem(STORAGE_KEYS.CARD_STATES);
      if (cards) fullState['CARDS_UPDATED'] = JSON.parse(cards);
      const arena = localStorage.getItem(STORAGE_KEYS.ARENA_COLUMN_GAMES);
      if (arena) fullState['ARENA_GAMES_UPDATED'] = JSON.parse(arena);
    } catch {}
    return fullState;
  });
}

// Broadcast to local tabs, server WebSocket, server REST, and serverless WebRTC (PeerJS)
export function broadcastMessage(type: string, payload: unknown) {
  // 1. WebRTC DataChannel (direct peer-to-peer between phone & laptop, 100% serverless)
  try {
    webrtcSync.broadcast(type, payload);
  } catch {}

  // 2. BroadcastChannel (same browser tabs)
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type, payload, timestamp: Date.now() });
    } catch {}
  }

  // 3. WebSocket (remote mobile phone / other devices if Node.js server available)
  if (socket && socket.readyState === WebSocket.OPEN) {
    try {
      socket.send(JSON.stringify({ type, payload }));
    } catch {}
  } else {
    // 4. Fallback POST to server if socket is reconnecting
    try {
      fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, payload }),
      }).catch(() => {});
    } catch {}
  }
}

export function subscribeToBroadcast(handler: (type: string, payload: unknown) => void): () => void {
  subscribers.add(handler);

  // BroadcastChannel listener
  const bcListener = (event: MessageEvent) => {
    if (event.data && event.data.type) {
      handler(event.data.type, event.data.payload);
    }
  };
  broadcastChannel?.addEventListener('message', bcListener);

  return () => {
    subscribers.delete(handler);
    broadcastChannel?.removeEventListener('message', bcListener);
  };
}

// Teams
export function loadTeams(): Team[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEAMS);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(INITIAL_TEAMS));
  } catch {}
  return INITIAL_TEAMS;
}

export function saveTeams(teams: Team[]) {
  try {
    batchSetLocalStorage(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
    broadcastMessage('TEAMS_UPDATED', teams);
  } catch {}
}

// Games library
export function loadGames(): GameItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GAMES);
    if (raw) {
      const parsed: GameItem[] = JSON.parse(raw);
      // Migrate "من أكون" to Family Feud if existing in localStorage
      let hasMigrated = false;
      parsed.forEach((g) => {
        if (g.id === 'g-who-am-i' && g.nameAr !== 'Family Feud') {
          g.nameAr = 'Family Feud';
          g.nameEn = 'FAMILY FEUD';
          g.description = 'تخمين أكثر الإجابات شيوعاً في استطلاعات الرأي والتحديات التنافسية الذكية';
          hasMigrated = true;
        }
      });

      // Ensure any new default games (like new 1v1 games) are added to library
      DEFAULT_GAMES.forEach((dg) => {
        if (!parsed.some((p) => p.id === dg.id)) {
          parsed.push(dg);
          hasMigrated = true;
        }
      });

      if (hasMigrated) {
        localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(parsed));
      }

      if (parsed.length >= 22) {
        return parsed;
      }
    }
  } catch {}
  try {
    localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(DEFAULT_GAMES));
  } catch {}
  return DEFAULT_GAMES;
}

export function saveGames(games: GameItem[]) {
  try {
    batchSetLocalStorage(STORAGE_KEYS.GAMES, JSON.stringify(games));
    broadcastMessage('GAMES_UPDATED', games);
  } catch {}
}

// Selected categories for match (5 categories)
export function loadSelectedCategories(): CategoryKey[] {
  const allCategories: CategoryKey[] = ['digital', 'mental', 'physical', 'fan_vote', '1v1'];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SELECTED_CATEGORIES);
    if (raw) {
      const parsed: CategoryKey[] = JSON.parse(raw);
      // Migrate legacy 'captains' to '1v1'
      const migrated = parsed.map((c) => (c === 'captains' ? '1v1' : c));
      const filtered = migrated.filter((c) => allCategories.includes(c as CategoryKey));
      const unique = Array.from(new Set(filtered)) as CategoryKey[];
      if (unique.length >= 3) {
        // Enforce canonical order: 1: digital, 2: mental, 3: physical, 4: fan_vote, 5: 1v1 (last)
        unique.sort((a, b) => allCategories.indexOf(a) - allCategories.indexOf(b));
        localStorage.setItem(STORAGE_KEYS.SELECTED_CATEGORIES, JSON.stringify(unique));
        return unique;
      }
    }
    localStorage.setItem(STORAGE_KEYS.SELECTED_CATEGORIES, JSON.stringify(allCategories));
    return allCategories;
  } catch {}
  return allCategories;
}

export function saveSelectedCategories(categories: CategoryKey[]) {
  const allCategories: CategoryKey[] = ['digital', 'mental', 'physical', 'fan_vote', '1v1'];
  const sorted = [...categories].sort((a, b) => allCategories.indexOf(a) - allCategories.indexOf(b));
  try {
    batchSetLocalStorage(STORAGE_KEYS.SELECTED_CATEGORIES, JSON.stringify(sorted));
    broadcastMessage('CATEGORIES_UPDATED', sorted);
  } catch {}
}

// Current Match
export function loadCurrentMatch(teams: Team[]): CurrentMatch {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_MATCH);
    if (raw) return JSON.parse(raw);
    const initial: CurrentMatch = {
      teamAId: teams[0]?.id || 'team-1',
      teamBId: teams[1]?.id || 'team-2',
      teamAScore: 0,
      teamBScore: 0,
      activeGameId: null,
      currentRound: 1,
      rounds: [],
    };
    localStorage.setItem(STORAGE_KEYS.CURRENT_MATCH, JSON.stringify(initial));
    return initial;
  } catch {}
  return {
    teamAId: teams[0]?.id || 'team-1',
    teamBId: teams[1]?.id || 'team-2',
    teamAScore: 0,
    teamBScore: 0,
    activeGameId: null,
    currentRound: 1,
    rounds: [],
  };
}

export function saveCurrentMatch(match: CurrentMatch) {
  try {
    batchSetLocalStorage(STORAGE_KEYS.CURRENT_MATCH, JSON.stringify(match));
    broadcastMessage('MATCH_UPDATED', match);
  } catch {}
}

// Matches History
export function loadMatchesHistory(): MatchRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MATCHES_HISTORY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveMatchesHistory(matches: MatchRecord[]) {
  try {
    batchSetLocalStorage(STORAGE_KEYS.MATCHES_HISTORY, JSON.stringify(matches));
    broadcastMessage('HISTORY_UPDATED', matches);
  } catch {}
}

// Card ban/pick states
export function loadCardStates(): Record<string, CardState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CARD_STATES);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

export function saveCardStates(states: Record<string, CardState>) {
  try {
    batchSetLocalStorage(STORAGE_KEYS.CARD_STATES, JSON.stringify(states));
    broadcastMessage('CARDS_UPDATED', states);
  } catch {}
}

// Timer Sync
export function saveTimerSync(state: DualTimerSyncState) {
  try {
    batchSetLocalStorage(STORAGE_KEYS.TIMER_SYNC, JSON.stringify(state));
    broadcastMessage('TIMER_SYNC', state);
  } catch {}
}

export function loadTimerSync(): DualTimerSyncState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TIMER_SYNC);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

// Compute League Standings based on completed match history
export function computeStandings(teams: Team[], matches: MatchRecord[]): LeagueRow[] {
  const map: Record<string, LeagueRow> = {};

  teams.forEach((t) => {
    map[t.id] = {
      teamId: t.id,
      team: t,
      played: 0,
      won: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      points: 0,
      form: [],
    };
  });

  // Sort matches chronologically to track form
  const sortedMatches = [...matches].sort((a, b) => a.timestamp - b.timestamp);

  sortedMatches.forEach((m) => {
    const rowA = map[m.teamAId];
    const rowB = map[m.teamBId];

    if (rowA && rowB) {
      rowA.played += 1;
      rowB.played += 1;

      rowA.gf += m.teamAScore;
      rowA.ga += m.teamBScore;
      rowB.gf += m.teamBScore;
      rowB.ga += m.teamAScore;

      if (m.teamAScore > m.teamBScore) {
        rowA.won += 1;
        rowA.points += 3;
        rowA.form.push('W');

        rowB.lost += 1;
        rowB.form.push('L');
      } else if (m.teamBScore > m.teamAScore) {
        rowB.won += 1;
        rowB.points += 3;
        rowB.form.push('W');

        rowA.lost += 1;
        rowA.form.push('L');
      }
    }
  });

  // Calculate goal/round differences
  Object.values(map).forEach((r) => {
    r.gd = r.gf - r.ga;
    // Keep last 5 matches for form
    r.form = r.form.slice(-5);
  });

  // Sort by Points DESC -> GD DESC -> GF DESC -> Won DESC
  return Object.values(map).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return b.won - a.won;
  });
}

export const DEFAULT_ARENA_COLUMN_GAMES: Record<string, string[]> = {
  digital: ['g-fc27', 'g-rocket-league', 'g-clash-royale'],
  mental: ['g-shans', 'g-photo-match', 'g-letters-game'],
  physical: ['g-penalty-shoot', 'g-football-2v2', 'g-bottle-flip-xo'],
  fan_vote: ['g-box-of-liars', 'g-stop-timer', 'g-fan-vote'],
  '1v1': ['g-fatal-fury', 'g-throw-challenge', 'g-fc27-1v1'],
  captains: ['g-fatal-fury', 'g-throw-challenge', 'g-fc27-1v1'],
};

export function loadArenaColumnGames(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ARENA_COLUMN_GAMES);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Clean check: if each of the 5 categories has exactly 3 games
      const v1v1 = parsed['1v1'] || parsed.captains;
      const is1v1Valid = v1v1 && v1v1.length === 3;
      const isFanVoteValid = parsed.fan_vote && parsed.fan_vote.length === 3;
      if (
        parsed.digital?.length === 3 &&
        parsed.mental?.length === 3 &&
        parsed.physical?.length === 3 &&
        is1v1Valid &&
        isFanVoteValid
      ) {
        parsed['1v1'] = v1v1;
        return parsed;
      }
    }
  } catch {}
  localStorage.setItem(STORAGE_KEYS.ARENA_COLUMN_GAMES, JSON.stringify(DEFAULT_ARENA_COLUMN_GAMES));
  return DEFAULT_ARENA_COLUMN_GAMES;
}

export function saveArenaColumnGames(gamesMap: Record<string, string[]>) {
  try {
    localStorage.setItem(STORAGE_KEYS.ARENA_COLUMN_GAMES, JSON.stringify(gamesMap));
    broadcastMessage('ARENA_GAMES_UPDATED', gamesMap);
  } catch {}
}

