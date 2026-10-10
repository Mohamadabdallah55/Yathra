import React from 'react';
import { X, Trophy, Trash2, Calendar, Swords, Award, AlertCircle } from 'lucide-react';
import { MatchRecord } from '../types';

interface MatchHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  matches: MatchRecord[];
  onDeleteMatch: (matchId: string) => void;
}

export const MatchHistoryModal: React.FC<MatchHistoryModalProps> = ({
  isOpen,
  onClose,
  matches,
  onDeleteMatch,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in" dir="rtl">
      <div className="bg-[#0B1021] border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0E152E]/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-changa font-bold text-white">سجل المواجهات المكتملة</h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {matches.length} مواجهة
                </span>
              </div>
              <p className="text-xs text-slate-400">تاريخ نتائج المباريات المنتهية بنظام Best of 5</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Matches List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {matches.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/50 border border-slate-700 mx-auto flex items-center justify-center text-slate-500">
                <Swords className="w-7 h-7" />
              </div>
              <p className="text-sm font-semibold text-slate-400">لا يوجد مباريات مسجلة في الأرشيف حتى الآن</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                عند إنهاء أي مباراة بالضغط على زر "إنهاء المباراة واعتماد النتيجة"، سيتم توثيق تفاصيلها تلقائياً هنا في السجل.
              </p>
            </div>
          ) : (
            matches.map((match) => {
              const isTeamAWinner = match.winnerId === match.teamAId;
              return (
                <div
                  key={match.id}
                  className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-xl p-4 transition-all shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  {/* Teams & Score */}
                  <div className="flex-1 w-full flex items-center justify-between sm:justify-start gap-4">
                    {/* Team A */}
                    <div className={`flex items-center gap-2 flex-1 justify-end ${isTeamAWinner ? 'text-white font-bold' : 'text-slate-400'}`}>
                      {isTeamAWinner && <Award className="w-4 h-4 text-amber-400 shrink-0" />}
                      <span className="font-changa text-sm sm:text-base truncate">{match.teamAName}</span>
                    </div>

                    {/* Score Center */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 shrink-0 font-mono font-black text-lg">
                      <span className={isTeamAWinner ? 'text-amber-400' : 'text-slate-400'}>{match.teamAScore}</span>
                      <span className="text-slate-600">:</span>
                      <span className={!isTeamAWinner ? 'text-amber-400' : 'text-slate-400'}>{match.teamBScore}</span>
                    </div>

                    {/* Team B */}
                    <div className={`flex items-center gap-2 flex-1 justify-start ${!isTeamAWinner ? 'text-white font-bold' : 'text-slate-400'}`}>
                      <span className="font-changa text-sm sm:text-base truncate">{match.teamBName}</span>
                      {!isTeamAWinner && <Award className="w-4 h-4 text-amber-400 shrink-0" />}
                    </div>
                  </div>

                  {/* Date & Meta & Delete */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5 font-sans">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{match.date}</span>
                    </div>

                    <button
                      onClick={() => {
                        if (window.confirm(`هل أنت متأكد من حذف هذه المباراة بين (${match.teamAName} ضد ${match.teamBName})؟`)) {
                          onDeleteMatch(match.id);
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
                      title="حذف هذه المباراة من السجل"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#0E152E]/90 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>يتم تحديث جدول الترتيب تلقائياً بناءً على هذه النتائج المسجلة</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchHistoryModal;
