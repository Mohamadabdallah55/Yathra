import React from 'react';
import {
  Gamepad2,
  Trophy,
  Swords,
  Timer,
  Tv,
  Users,
  Smartphone,
  Keyboard,
  Maximize,
  Download,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'match' | 'arena' | 'library' | 'standings' | 'timer' | 'broadcast';
  setActiveTab: (tab: 'match' | 'arena' | 'library' | 'standings' | 'timer' | 'broadcast') => void;
  onOpenTeamsModal: () => void;
  onOpenResetModal: () => void;
  onOpenMobileConnectModal: () => void;
  onToggleStageView: () => void;
  onOpenHotkeys: () => void;
  canInstallPwa?: boolean;
  onInstallPwa?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenTeamsModal,
  onOpenMobileConnectModal,
  onToggleStageView,
  onOpenHotkeys,
  canInstallPwa,
  onInstallPwa,
}) => {
  const navTabs = [
    { id: 'match', label: 'المباراة الحية', icon: Swords },
    { id: 'arena', label: 'حلبة البان والبيك', icon: Gamepad2 },
    { id: 'library', label: 'مكتبة الألعاب', icon: Users },
    { id: 'standings', label: 'جدول الترتيب', icon: Trophy },
    { id: 'timer', label: 'المؤقت المزدوج', icon: Timer },
    { id: 'broadcast', label: 'شاشة البث (TV)', icon: Tv },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-[#070B19]/95 backdrop-blur-md border-b border-slate-800/80 shadow-lg px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Title */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-purple-600 to-indigo-600 flex items-center justify-center font-orbitron font-extrabold text-lg text-white shadow-md shadow-purple-500/30">
              CE
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black font-changa text-white tracking-wide flex items-center gap-2">
                <span>دوري صراع النخبة</span>
                <span className="text-[10px] font-orbitron font-bold px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60 uppercase">
                  LEAGUE 2026
                </span>
              </h1>
              <p className="text-[11px] font-mono text-slate-400">CLASH OF ELITES TOURNAMENT</p>
            </div>
          </div>

          {/* Quick Actions (Mobile view) */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              onClick={onOpenMobileConnectModal}
              className="p-2 rounded-lg bg-emerald-950/50 border border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/60"
              title="ربط ريموت الهاتف"
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleStageView}
              className="p-2 rounded-lg bg-indigo-950/50 border border-indigo-700/60 text-indigo-300 hover:bg-indigo-900/60"
              title="عرض شاشة المسرح"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-changa transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 border border-purple-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Top Control Tools (Desktop) */}
        <div className="hidden md:flex items-center gap-2">
          {canInstallPwa && onInstallPwa && (
            <button
              onClick={onInstallPwa}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-950/40 text-cyan-300 border border-cyan-800/60 hover:bg-cyan-900/50 text-xs font-semibold transition-all"
              title="تثبيت التطبيق على الجهاز"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تثبيت</span>
            </button>
          )}

          <button
            onClick={onOpenTeamsModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:text-white text-xs font-semibold transition-all"
          >
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span>الفرق</span>
          </button>

          <button
            onClick={onOpenMobileConnectModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-600/60 hover:bg-emerald-900/60 text-xs font-bold transition-all shadow-sm shadow-emerald-900/30"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>ريموت الهاتف</span>
          </button>

          <button
            onClick={onToggleStageView}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-950/50 text-indigo-300 border border-indigo-700/60 hover:bg-indigo-900/60 text-xs font-semibold transition-all"
            title="شاشة العرض الميداني للمسرح"
          >
            <Maximize className="w-3.5 h-3.5 text-indigo-400" />
            <span>المسرح</span>
          </button>

          <button
            onClick={onOpenHotkeys}
            className="p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700 transition-colors"
            title="اختصارات لوحة المفاتيح"
          >
            <Keyboard className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
