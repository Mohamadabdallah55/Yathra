import React, { useState, useMemo } from 'react';
import {
  Gamepad2,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Sparkles,
  Swords,
  Users,
  Flame,
  Brain,
  Zap,
} from 'lucide-react';
import { GameItem, CardState, BanPickStatus, Team, CategoryKey } from '../types';
import { CATEGORIES } from '../data/defaultGames';
import { GameIcon } from './GameIcons';

interface GamesLibraryMapProps {
  games: GameItem[];
  cardStates: Record<string, CardState>;
  activeGameId: string | null;
  teamA: Team;
  teamB: Team;
  onSetCardStatus: (gameId: string, status: BanPickStatus) => void;
  onSetActiveGame: (gameId: string) => void;
}

export const GamesLibraryMap: React.FC<GamesLibraryMapProps> = ({
  games,
  cardStates,
  activeGameId,
  teamA,
  teamB,
  onSetCardStatus,
  onSetActiveGame,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | 'all'>('all');

  // Filter games based on search and selected category
  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchesCategory = selectedCategory === 'all' || game.categoryId === selectedCategory;
      const matchesSearch =
        game.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (game.description && game.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [games, selectedCategory, searchQuery]);

  const getStatusBadge = (gameId: string) => {
    const cardState = cardStates[gameId];
    const status = cardState ? cardState.status : 'available';

    if (gameId === activeGameId || status === 'current') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse flex items-center gap-1">
          <Play className="w-3 h-3 fill-amber-300" /> جارية الآن
        </span>
      );
    }

    switch (status) {
      case 'picked_team_a':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
            مختارة ({teamA.name})
          </span>
        );
      case 'picked_team_b':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            مختارة ({teamB.name})
          </span>
        );
      case 'banned_team_a':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            محظورة ({teamA.name})
          </span>
        );
      case 'banned_team_b':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            محظورة ({teamB.name})
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            مكتملة ✓
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
            متاحة للاختيار
          </span>
        );
    }
  };

  return (
    <div className="w-full space-y-6" dir="rtl">
      {/* Search & Filter Header Bar */}
      <div className="bg-[#0C1226] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-changa font-bold text-white flex items-center gap-2">
                مكتبة الألعاب المعتمدة في البطولة
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {filteredGames.length} لعبة
                </span>
              </h2>
              <p className="text-xs text-slate-400">استعراض تفاصيل وتصنيفات الألعاب والتحكم بحالة الحظر والاختيار</p>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم اللعبة أو الوصف..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Categories Tab Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800'
            }`}
          >
            جميع الفئات ({games.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = games.filter((g) => g.categoryId === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'text-white shadow-lg'
                    : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800'
                }`}
                style={isSelected ? { backgroundColor: cat.accentColor } : {}}
              >
                <span>{cat.nameAr}</span>
                <span className="text-[10px] opacity-80">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Games Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGames.map((game) => {
          const cat = CATEGORIES.find((c) => c.id === game.categoryId);
          const isActive = game.id === activeGameId;

          return (
            <div
              key={game.id}
              className={`bg-[#0C1226] border rounded-2xl p-4 transition-all flex flex-col justify-between shadow-lg relative overflow-hidden group ${
                isActive
                  ? 'border-amber-500 ring-2 ring-amber-500/30 bg-amber-950/10'
                  : 'border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/50'
              }`}
            >
              {/* Header Info */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md p-1.5 shrink-0"
                      style={{
                        backgroundColor: `${cat?.accentColor || '#6366F1'}20`,
                        border: `1.5px solid ${cat?.accentColor || '#6366F1'}60`,
                      }}
                    >
                      <GameIcon name={game.iconType} className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-changa font-bold text-base text-white group-hover:text-amber-300 transition-colors">
                          {game.nameAr}
                        </h3>
                      </div>
                      <div className="text-xs text-slate-400 font-mono">{game.nameEn}</div>
                    </div>
                  </div>
                  <div>{getStatusBadge(game.id)}</div>
                </div>

                {/* Description & Category */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: cat?.accentColor || '#6366F1' }}
                    />
                    <span>{cat?.nameAr || 'فئة عامة'}</span>
                  </div>
                  {game.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {game.description}
                    </p>
                  )}
                  {game.rules && (
                    <div className="text-[11px] text-indigo-300/80 bg-indigo-950/30 border border-indigo-900/50 rounded-lg p-2 mt-2">
                      <span className="font-semibold text-indigo-200">القوانين: </span>
                      {game.rules}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                {/* Active Game Action */}
                <button
                  onClick={() => onSetActiveGame(game.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl font-bold transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-800/90 hover:bg-amber-600/30 hover:border-amber-500 text-slate-300 hover:text-amber-300 border border-slate-700'
                  }`}
                >
                  <Play className={`w-3.5 h-3.5 ${isActive ? 'fill-current' : ''}`} />
                  <span>{isActive ? 'اللعبة النشطة' : 'تفعيل للعب'}</span>
                </button>

                {/* Quick Pick Team A */}
                <button
                  onClick={() => onSetCardStatus(game.id, 'picked_team_a')}
                  title={`اختيار لصالح ${teamA.name}`}
                  className="p-1.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/40 text-purple-300 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>

                {/* Quick Ban Team B */}
                <button
                  onClick={() => onSetCardStatus(game.id, 'banned_team_b')}
                  title={`حظر بواسطة ${teamB.name}`}
                  className="p-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                </button>

                {/* Reset to available */}
                <button
                  onClick={() => onSetCardStatus(game.id, 'available')}
                  title="إعادة تعيين إلى متاح"
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GamesLibraryMap;
