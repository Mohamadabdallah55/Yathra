import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Award, Sparkles, X, ArrowLeft, RotateCcw, Swords } from 'lucide-react';
import { Team, CurrentMatch } from '../types';
import { GameIcon } from './GameIcons';
import { sound } from '../utils/audio';

interface VictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  winnerTeam: Team;
  loserTeam: Team;
  currentMatch: CurrentMatch;
  onNextMatch: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  onClose,
  winnerTeam,
  loserTeam,
  currentMatch,
  onNextMatch,
}) => {
  useEffect(() => {
    if (isOpen) {
      sound.playMatchPoint();

      // Launch victory fireworks confetti
      try {
        const count = 200;
        const defaults = {
          origin: { y: 0.7 },
        };

        const fire = (particleRatio: number, opts: confetti.Options) => {
          confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio),
          });
        };

        fire(0.25, {
          spread: 26,
          startVelocity: 55,
          colors: [winnerTeam.color, '#F59E0B', '#FFFFFF'],
        });
        fire(0.2, {
          spread: 60,
          colors: [winnerTeam.color, '#10B981', '#38BDF8'],
        });
        fire(0.35, {
          spread: 100,
          decay: 0.91,
          scalar: 0.8,
        });
        fire(0.1, {
          spread: 120,
          startVelocity: 25,
          decay: 0.92,
          scalar: 1.2,
        });
        fire(0.1, {
          spread: 120,
          startVelocity: 45,
        });
      } catch {}
    }
  }, [isOpen, winnerTeam]);

  if (!isOpen) return null;

  const winnerScore = Math.max(currentMatch.teamAScore, currentMatch.teamBScore);
  const loserScore = Math.min(currentMatch.teamAScore, currentMatch.teamBScore);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in" dir="rtl">
      <div className="relative w-full max-w-xl bg-[#090D1E] border border-amber-500/40 rounded-3xl p-6 sm:p-8 text-center shadow-2xl overflow-hidden">
        {/* Glow backdrop behind trophy */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: winnerTeam.color }}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Crown & Trophy Icon */}
        <div className="relative inline-block mb-4 mt-2">
          <div
            className="w-24 h-24 rounded-3xl mx-auto flex items-center justify-center shadow-2xl animate-bounce"
            style={{
              backgroundColor: `${winnerTeam.color}25`,
              border: `2px solid ${winnerTeam.color}`,
              boxShadow: `0 0 35px ${winnerTeam.color}50`,
            }}
          >
            <Trophy className="w-12 h-12 text-amber-400 drop-shadow-md" />
          </div>
          <div className="absolute -top-2 -right-2 bg-amber-500 text-slate-950 p-1.5 rounded-full shadow-lg">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
        </div>

        {/* Winner Announcement */}
        <div className="space-y-1 mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400/90 font-mono">
            ★ بطل المواجهة الميدانية ★
          </span>
          <h2 className="text-3xl sm:text-4xl font-changa font-black text-white">
            فوز فريق {winnerTeam.name}
          </h2>
          <div className="text-sm font-mono font-bold" style={{ color: winnerTeam.color }}>
            {winnerTeam.shortName}
          </div>
        </div>

        {/* Match Final Score Display */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-6 max-w-md mx-auto shadow-inner">
          <div className="text-xs text-slate-400 mb-2">النتيجة النهائية للمباراة (Best of 5)</div>
          <div className="flex items-center justify-center gap-6">
            <div className="flex flex-col items-center">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-1.5 shadow"
                style={{ backgroundColor: `${winnerTeam.color}25`, border: `1.5px solid ${winnerTeam.color}` }}
              >
                <GameIcon name={winnerTeam.logo || 'crown'} className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-white font-changa truncate max-w-[100px]">{winnerTeam.name}</span>
            </div>

            <div className="flex items-center gap-3 font-mono font-black text-3xl">
              <span className="text-amber-400">{winnerScore}</span>
              <span className="text-slate-600">:</span>
              <span className="text-slate-400">{loserScore}</span>
            </div>

            <div className="flex flex-col items-center opacity-70">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-1.5 shadow"
                style={{ backgroundColor: `${loserTeam.color}20`, border: `1.5px solid ${loserTeam.color}50` }}
              >
                <GameIcon name={loserTeam.logo || 'shield'} className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-slate-400 font-changa truncate max-w-[100px]">{loserTeam.name}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onNextMatch}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02]"
          >
            <RotateCcw className="w-4 h-4" />
            بدء المواجهة التالية وتصفير النتيجة
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-colors"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};

export default VictoryModal;
