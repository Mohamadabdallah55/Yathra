import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw, Shield, Crown, Zap, Flame, Swords, Target, Skull, Star, Trophy, Palette, Check } from 'lucide-react';
import { Team } from '../types';
import { INITIAL_TEAMS } from '../data/defaultGames';
import { GameIcon } from './GameIcons';

interface TeamsModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
  onSaveTeams: (teams: Team[]) => void;
}

const AVAILABLE_LOGOS = [
  { id: 'crown', label: 'تاج (Crown)', icon: Crown },
  { id: 'shield', label: 'درع (Shield)', icon: Shield },
  { id: 'zap', label: 'برق (Zap)', icon: Zap },
  { id: 'flame', label: 'شعلة (Flame)', icon: Flame },
  { id: 'swords', label: 'سيوف (Swords)', icon: Swords },
  { id: 'target', label: 'هدف (Target)', icon: Target },
  { id: 'skull', label: 'جمجمة (Skull)', icon: Skull },
  { id: 'star', label: 'نجمة (Star)', icon: Star },
  { id: 'trophy', label: 'كأس (Trophy)', icon: Trophy },
];

const PRESET_COLORS = [
  '#A855F7', // Violet
  '#06B6D4', // Cyan
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#F43F5E', // Rose
  '#3B82F6', // Blue
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#EAB308', // Yellow
  '#14B8A6', // Teal
];

export const TeamsModal: React.FC<TeamsModalProps> = ({
  isOpen,
  onClose,
  teams,
  onSaveTeams,
}) => {
  const [editingTeams, setEditingTeams] = useState<Team[]>(teams);
  const [selectedTeamIndex, setSelectedTeamIndex] = useState<number>(0);

  useEffect(() => {
    setEditingTeams(teams);
  }, [teams, isOpen]);

  if (!isOpen) return null;

  const currentTeam = editingTeams[selectedTeamIndex] || editingTeams[0];

  const updateCurrentTeam = (partial: Partial<Team>) => {
    setEditingTeams((prev) =>
      prev.map((t, idx) => (idx === selectedTeamIndex ? { ...t, ...partial } : t))
    );
  };

  const handleSave = () => {
    onSaveTeams(editingTeams);
    onClose();
  };

  const handleResetToDefaults = () => {
    if (window.confirm('هل تريد استعادة بيانات وأسماء الفرق الافتراضية؟')) {
      setEditingTeams(INITIAL_TEAMS);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in" dir="rtl">
      <div className="bg-[#0B1021] border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0E152E]/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-changa font-bold text-white">إدارة وتعديل بيانات الفرق (6 فرق)</h2>
              <p className="text-xs text-slate-400">تخصيص أسماء الفرق، الألوان، وشعارات المنصة الميدانية</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Teams Selector Sidebar */}
          <div className="md:col-span-5 space-y-2 border-b md:border-b-0 md:border-l border-slate-800 pb-4 md:pb-0 md:pl-4">
            <div className="text-xs font-semibold text-slate-400 mb-2 px-1">اختر الفريق للتعديل:</div>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
              {editingTeams.map((team, idx) => {
                const isSelected = idx === selectedTeamIndex;
                return (
                  <button
                    key={team.id}
                    onClick={() => setSelectedTeamIndex(idx)}
                    style={{ borderColor: isSelected ? team.color : undefined }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-right transition-all ${
                      isSelected
                        ? 'bg-slate-800/90 shadow-lg ring-1 ring-inset'
                        : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shadow"
                        style={{ backgroundColor: `${team.color}25`, border: `1.5px solid ${team.color}` }}
                      >
                        <GameIcon name={team.logo || 'crown'} className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-changa font-bold text-sm text-white">{team.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{team.shortName}</div>
                      </div>
                    </div>
                    <div
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: team.color }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Team Editor Form */}
          {currentTeam && (
            <div className="md:col-span-7 space-y-5">
              {/* Preview Banner */}
              <div
                className="p-4 rounded-xl border flex items-center justify-between shadow-inner relative overflow-hidden"
                style={{
                  backgroundColor: `${currentTeam.color}15`,
                  borderColor: `${currentTeam.color}50`,
                }}
              >
                <div className="flex items-center gap-3 z-10">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: `${currentTeam.color}35`, border: `2px solid ${currentTeam.color}` }}
                  >
                    <GameIcon name={currentTeam.logo || 'crown'} className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">معاينة الشعار والبطاقة:</div>
                    <div className="text-xl font-changa font-black text-white">{currentTeam.name}</div>
                    <div className="text-xs font-mono font-semibold" style={{ color: currentTeam.color }}>
                      {currentTeam.shortName}
                    </div>
                  </div>
                </div>
                <div
                  className="px-3 py-1 rounded-full text-xs font-bold text-white shadow"
                  style={{ backgroundColor: currentTeam.color }}
                >
                  معتمد
                </div>
              </div>

              {/* Form inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    اسم الفريق (باللغة العربية):
                  </label>
                  <input
                    type="text"
                    value={currentTeam.name}
                    onChange={(e) => updateCurrentTeam({ name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 font-medium"
                    placeholder="مثال: صقور التحدي"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    الرمز المختصر (Short Name):
                  </label>
                  <input
                    type="text"
                    value={currentTeam.shortName}
                    onChange={(e) => updateCurrentTeam({ shortName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 font-mono uppercase"
                    placeholder="مثال: HAWKS"
                  />
                </div>

                {/* Color Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-slate-400" />
                      لون الفريق الأساسي:
                    </label>
                    <span className="text-xs font-mono text-slate-400">{currentTeam.color}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {PRESET_COLORS.map((clr) => (
                      <button
                        key={clr}
                        type="button"
                        onClick={() => updateCurrentTeam({ color: clr })}
                        className={`w-7 h-7 rounded-lg transition-transform flex items-center justify-center ${
                          currentTeam.color === clr ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: clr }}
                      >
                        {currentTeam.color === clr && <Check className="w-4 h-4 text-white drop-shadow" />}
                      </button>
                    ))}
                    <input
                      type="color"
                      value={currentTeam.color}
                      onChange={(e) => updateCurrentTeam({ color: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      title="لون مخصص"
                    />
                  </div>
                </div>

                {/* Logo Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    أيقونة / شعار الفريق:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {AVAILABLE_LOGOS.map((logoItem) => {
                      const isSel = currentTeam.logo === logoItem.id;
                      return (
                        <button
                          key={logoItem.id}
                          type="button"
                          onClick={() => updateCurrentTeam({ logo: logoItem.id })}
                          className={`flex items-center gap-2 p-2 rounded-xl border text-xs transition-all ${
                            isSel
                              ? 'bg-purple-950/40 border-purple-500 text-white shadow'
                              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                          }`}
                        >
                          <GameIcon name={logoItem.id} className="w-4 h-4" />
                          <span className="truncate">{logoItem.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-[#0E152E]/90">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-rose-400 transition-colors font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            استعادة الفرق الافتراضية
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02]"
            >
              <Save className="w-4 h-4" />
              حفظ التعديلات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamsModal;
