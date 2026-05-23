'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Play, Pause, RotateCcw, SkipForward, Settings, X } from 'lucide-react';
import { usePomodoroStore } from '@/hooks/usePomodoroStore';

const MODE_LABELS = {
  work: '🍅 Focus Time',
  break: '☕ Short Break',
  longBreak: '🌿 Long Break',
};

const MODE_COLORS = {
  work: 'text-red-500',
  break: 'text-amber-500',
  longBreak: 'text-moss-500',
};

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export default function PomodoroTimer() {
  const {
    mode, timeLeft, isRunning, sessionsCompleted,
    workDuration, breakDuration,
    start, pause, reset, skip, tick,
    setWorkDuration, setBreakDuration,
  } = usePomodoroStore();

  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Tick every second
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => tick(), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, tick]);

  const totalSeconds = (mode === 'work' ? workDuration : mode === 'break' ? breakDuration : 15) * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const isWork = mode === 'work';
  const mascotSrc = isWork ? '/pomodoro_work.png' : '/pomodoro_break.png';

  // Circumference of SVG circle
  const R = 88;
  const circumference = 2 * Math.PI * R;
  const dashOffset = circumference * (1 - progress / 100);

  return (
    <div className="flex flex-col gap-7 animate-fade-in max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>
            Pomodoro 🍅
          </h1>
          <p className="font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Stay focused, take breaks, get things done.
          </p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all card-lift"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="card animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>
              ⚙️ Settings
            </h2>
            <button onClick={() => setShowSettings(false)} style={{ color: 'var(--text-muted)' }}>
              <X size={18} />
            </button>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-bold mb-1 block" style={{ color: 'var(--text-secondary)' }}>
                Focus duration: <span style={{ color: 'var(--text-primary)' }}>{workDuration} min</span>
              </label>
              <input
                type="range" min={5} max={60} step={5}
                value={workDuration}
                onChange={(e) => setWorkDuration(Number(e.target.value))}
                className="w-full accent-red-500"
              />
            </div>
            <div>
              <label className="text-sm font-bold mb-1 block" style={{ color: 'var(--text-secondary)' }}>
                Break duration: <span style={{ color: 'var(--text-primary)' }}>{breakDuration} min</span>
              </label>
              <input
                type="range" min={1} max={30} step={1}
                value={breakDuration}
                onChange={(e) => setBreakDuration(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Mode label */}
      <div className="flex justify-center gap-3">
        {(['work', 'break', 'longBreak'] as const).map((m) => (
          <span
            key={m}
            className="text-xs font-bold px-3 py-1.5 rounded-full transition-all"
            style={mode === m
              ? { backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }
              : { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }
            }
          >
            {m === 'work' ? '🍅 Focus' : m === 'break' ? '☕ Break' : '🌿 Long Break'}
          </span>
        ))}
      </div>

      {/* Main timer card */}
      <div className="card flex flex-col items-center gap-6 py-10">

        {/* Mascot */}
        <div className={`transition-all duration-500 ${isRunning ? 'animate-float' : ''}`}>
          <Image
            src={mascotSrc}
            alt={isWork ? 'Focus!' : 'Break time!'}
            width={120}
            height={120}
            className="drop-shadow-lg"
          />
        </div>

        {/* Mode label */}
        <p className={`text-base font-extrabold ${MODE_COLORS[mode]}`} style={{ fontFamily: "'Baloo 2', cursive" }}>
          {MODE_LABELS[mode]}
        </p>

        {/* Circular timer */}
        <div className="relative flex items-center justify-center">
          <svg width={200} height={200} className="-rotate-90">
            {/* Track */}
            <circle
              cx={100} cy={100} r={R}
              fill="none"
              stroke="var(--border)"
              strokeWidth={10}
            />
            {/* Progress */}
            <circle
              cx={100} cy={100} r={R}
              fill="none"
              stroke={isWork ? '#ef4444' : '#f59e0b'}
              strokeWidth={10}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          {/* Time display */}
          <div className="absolute flex flex-col items-center">
            <span
              className="text-5xl font-extrabold tabular-nums"
              style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}
            >
              {pad(minutes)}:{pad(seconds)}
            </span>
            <span className="text-xs font-semibold mt-1" style={{ color: 'var(--text-muted)' }}>
              {isWork ? 'keep going!' : 'rest up 💤'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={reset}
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all card-lift"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          >
            <RotateCcw size={18} />
          </button>

          <button
            onClick={isRunning ? pause : start}
            className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-lg hover:scale-105 active:scale-95"
            style={{ backgroundColor: isWork ? '#ef4444' : '#f59e0b', color: 'white' }}
          >
            {isRunning ? <Pause size={26} /> : <Play size={26} />}
          </button>

          <button
            onClick={skip}
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all card-lift"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          >
            <SkipForward size={18} />
          </button>
        </div>
      </div>

      {/* Sessions counter */}
      <div className="card flex items-center justify-between">
        <div>
          <p className="font-extrabold" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>
            Sessions Today
          </p>
          <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Each 🍅 = one completed focus session
          </p>
        </div>
        <div className="flex items-center gap-1 flex-wrap max-w-[140px] justify-end">
          {Array.from({ length: Math.max(sessionsCompleted, 1) }).map((_, i) => (
            <span key={i} className={`text-xl ${i < sessionsCompleted ? 'opacity-100' : 'opacity-20'}`}>🍅</span>
          ))}
          <span
            className="text-2xl font-extrabold ml-2"
            style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}
          >
            ×{sessionsCompleted}
          </span>
        </div>
      </div>

      {/* Tips */}
      <div
        className="rounded-2xl p-4 text-sm font-semibold"
        style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
      >
        {isWork
          ? '💡 Close distracting tabs, put on focus music, and tackle one task at a time.'
          : '🌿 Step away from your screen, stretch, hydrate, or just breathe.'}
      </div>
    </div>
  );
}