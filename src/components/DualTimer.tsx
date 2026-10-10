import React, { useState, useEffect, useRef } from 'react';
import { Team } from '../types';
import { sound } from '../utils/audio';
import { Play, Pause, RotateCcw, Volume2, Timer, Zap, Flag } from 'lucide-react';

interface DualTimerProps {
  teamA: Team;
  teamB: Team;
  isStandalone?: boolean;
}

export const DualTimer: React.FC<DualTimerProps> = ({ teamA, teamB, isStandalone = false }) => {
  // Mode: Countdown (تنازلي) vs Stopwatch (تصاعدي)
  const [activeMode, setActiveMode] = useState<'countdown' | 'stopwatch'>('countdown');

  // Countdown state
  const [countdownInitial, setCountdownInitial] = useState<number>(60);
  const [countdownLeft, setCountdownLeft] = useState<number>(60);
  const [isCountdownRunning, setIsCountdownRunning] = useState<boolean>(false);

  // Stopwatch state
  const [stopwatchMs, setStopwatchMs] = useState<number>(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState<boolean>(false);
  const [teamATime, setTeamATime] = useState<number | null>(null);
  const [teamBTime, setTeamBTime] = useState<number | null>(null);

  const countdownTimerRef = useRef<number | null>(null);
  const stopwatchTimerRef = useRef<number | null>(null);

  // Countdown effect
  useEffect(() => {
    if (isCountdownRunning) {
      countdownTimerRef.current = window.setInterval(() => {
        setCountdownLeft((prev) => {
          if (prev <= 1) {
            sound.playTimerEnd();
            setIsCountdownRunning(false);
            return 0;
          }
          if (prev <= 6 && prev > 1) {
            sound.playTimerBeep();
          }
          return prev - 1;
        });
      }, 1000);
    } else if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }
    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [isCountdownRunning]);

  // Stopwatch effect
  useEffect(() => {
    if (isStopwatchRunning) {
      const startTime = Date.now() - stopwatchMs;
      stopwatchTimerRef.current = window.setInterval(() => {
        setStopwatchMs(Date.now() - startTime);
      }, 30);
    } else if (stopwatchTimerRef.current) {
      clearInterval(stopwatchTimerRef.current);
    }
    return () => {
      if (stopwatchTimerRef.current) clearInterval(stopwatchTimerRef.current);
    };
  }, [isStopwatchRunning]);

  const handleCountdownToggle = () => {
    sound.playTick();
    if (!isCountdownRunning && countdownLeft === 0) {
      setCountdownLeft(countdownInitial);
    }
    setIsCountdownRunning((prev) => !prev);
  };

  const handleCountdownReset = () => {
    sound.playTick();
    setIsCountdownRunning(false);
    setCountdownLeft(countdownInitial);
  };

  const handlePresetSelect = (seconds: number) => {
    sound.playTick();
    setIsCountdownRunning(false);
    setCountdownInitial(seconds);
    setCountdownLeft(seconds);
  };

  const handleStopwatchToggle = () => {
    sound.playTick();
    setIsStopwatchRunning((prev) => !prev);
  };

  const handleStopwatchReset = () => {
    sound.playTick();
    setIsStopwatchRunning(false);
    setStopwatchMs(0);
    setTeamATime(null);
    setTeamBTime(null);
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatStopwatch = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const centis = Math.floor((ms % 1000) / 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centis
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <div
      className={`w-full bg-[#0A0E23] border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl relative select-none ${
        isStandalone ? 'min-h-screen flex flex-col justify-center' : ''
      }`}
    >
      {/* Mode Tabs */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveMode('countdown')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-changa transition-all ${
              activeMode === 'countdown'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40 border border-purple-400'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Timer className="w-4 h-4" />
            <span>مؤقت العد التنازلي</span>
          </button>
          <button
            onClick={() => setActiveMode('stopwatch')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-changa transition-all ${
              activeMode === 'stopwatch'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/40 border border-amber-400'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>ساعة الإيقاف (Stopwatch)</span>
          </button>
        </div>

        <button
          onClick={() => sound.playTimerBeep()}
          className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          title="اختبار الصوت"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>

      {/* MODE 1: COUNTDOWN */}
      {activeMode === 'countdown' && (
        <div className="flex flex-col items-center justify-center py-6">
          {/* Preset Buttons */}
          <div className="flex items-center gap-2 mb-6 flex-wrap justify-center">
            {[30, 45, 60, 90, 120, 180, 300].map((sec) => (
              <button
                key={sec}
                onClick={() => handlePresetSelect(sec)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  countdownInitial === sec
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/60'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {sec < 60 ? `${sec}ث` : `${sec / 60}د`}
              </button>
            ))}
          </div>

          {/* Large Countdown Display */}
          <div
            className={`font-orbitron font-extrabold text-6xl sm:text-8xl md:text-9xl tracking-tight mb-8 tabular-nums transition-colors ${
              countdownLeft <= 5 && countdownLeft > 0
                ? 'text-rose-500 animate-pulse drop-shadow-[0_0_35px_rgba(244,63,94,0.6)]'
                : countdownLeft === 0
                ? 'text-rose-600 drop-shadow-[0_0_35px_rgba(244,63,94,0.8)]'
                : 'text-white drop-shadow-[0_0_30px_rgba(168,85,247,0.3)]'
            }`}
          >
            {formatCountdown(countdownLeft)}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleCountdownToggle}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold font-changa text-base transition-all active:scale-95 shadow-lg ${
                isCountdownRunning
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/40'
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/40'
              }`}
            >
              {isCountdownRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              <span>{isCountdownRunning ? 'إيقاف مؤقت' : 'بدء المؤقت'}</span>
            </button>

            <button
              onClick={handleCountdownReset}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold font-changa text-sm transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إعادة ضبط</span>
            </button>
          </div>
        </div>
      )}

      {/* MODE 2: STOPWATCH */}
      {activeMode === 'stopwatch' && (
        <div className="flex flex-col items-center justify-center py-6">
          <div className="font-orbitron font-extrabold text-6xl sm:text-7xl md:text-8xl tracking-tight mb-6 tabular-nums text-amber-300 drop-shadow-[0_0_30px_rgba(245,158,11,0.3)]">
            {formatStopwatch(stopwatchMs)}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={handleStopwatchToggle}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold font-changa text-base transition-all active:scale-95 shadow-lg ${
                isStopwatchRunning
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/40'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/40'
              }`}
            >
              {isStopwatchRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              <span>{isStopwatchRunning ? 'إيقاف' : 'تشغيل'}</span>
            </button>

            <button
              onClick={handleStopwatchReset}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 font-bold font-changa text-sm transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>تصفير</span>
            </button>
          </div>

          {/* Team Lap Splits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
            {/* Team A Split */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/40 flex items-center justify-between">
              <div>
                <span className="text-xs text-purple-300 font-bold font-changa block">{teamA.name}</span>
                <span className="font-orbitron font-extrabold text-xl text-white">
                  {teamATime !== null ? formatStopwatch(teamATime) : '--:--.--'}
                </span>
              </div>
              <button
                onClick={() => {
                  sound.playTick();
                  setTeamATime(stopwatchMs);
                }}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold font-changa flex items-center gap-1"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>تسجيل الوقت</span>
              </button>
            </div>

            {/* Team B Split */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/40 flex items-center justify-between">
              <div>
                <span className="text-xs text-cyan-300 font-bold font-changa block">{teamB.name}</span>
                <span className="font-orbitron font-extrabold text-xl text-white">
                  {teamBTime !== null ? formatStopwatch(teamBTime) : '--:--.--'}
                </span>
              </div>
              <button
                onClick={() => {
                  sound.playTick();
                  setTeamBTime(stopwatchMs);
                }}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-changa flex items-center gap-1"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>تسجيل الوقت</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
