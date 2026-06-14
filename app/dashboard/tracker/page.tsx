'use client';
// app/dashboard/tracker/page.tsx

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Play, Square, Trash2, Loader2 } from 'lucide-react';
import { useTimeStore } from '@/hooks/useTimeStore';
import { useTaskStore } from '@/hooks/useTaskStore';

// ── Mood config ──────────────────────────────────────────────────────────────
const MOODS = [
  { value: 1, image: '/mood_rough.png',   label: 'Rough',    color: '#ef4444' },
  { value: 2, image: '/mood_meh.png',     label: 'Meh',      color: '#f97316' },
  { value: 3, image: '/mood_okay.png',    label: 'Okay',     color: '#eab308' },
  { value: 4, image: '/mood_good.png',    label: 'Good',     color: '#22c55e' },
  { value: 5, image: '/mood_amazing.png', label: 'Amazing!', color: '#8b5cf6' },
];

const ENERGY = [
  { value: 1, label: '🪫 Drained' },
  { value: 2, label: '😴 Tired' },
  { value: 3, label: '⚡ Normal' },
  { value: 4, label: '🔋 Energized' },
  { value: 5, label: '🚀 Unstoppable' },
];

// ── Live timer display ───────────────────────────────────────────────────────
function LiveTimer({ startedAt }: { startedAt: string }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = new Date(startedAt).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <span className="font-extrabold tabular-nums" style={{ fontFamily: "'Baloo 2', cursive", color: '#ef4444' }}>
      {h > 0 && `${pad(h)}:`}{pad(m)}:{pad(s)}
    </span>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function TrackerPage() {
  const {
    logs, activeLog, moods, todayMood, loading,
    fetchLogs, startTimer, stopTimer, deleteLog,
    fetchMoods, saveMood, formatDuration,
  } = useTimeStore();
  const { tasks } = useTaskStore();

  const [tab, setTab] = useState<'time' | 'mood'>('time');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [stopping, setStopping] = useState(false);

  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [selectedEnergy, setSelectedEnergy] = useState<number>(3);
  const [moodNote, setMoodNote] = useState('');
  const [savingMood, setSavingMood] = useState(false);

  useEffect(() => {
    fetchLogs();
    fetchMoods();
  }, []);

  useEffect(() => {
    if (todayMood) {
      setSelectedMood(todayMood.mood);
      setSelectedEnergy(todayMood.energy ?? 3);
      setMoodNote(todayMood.note ?? '');
    }
  }, [todayMood]);

  const handleStart = async () => {
    if (!selectedTaskId) return;
    await startTimer(selectedTaskId);
  };

  const handleStop = async () => {
    setStopping(true);
    await stopTimer();
    setStopping(false);
  };

  const handleSaveMood = async () => {
    if (!selectedMood) return;
    setSavingMood(true);
    await saveMood(selectedMood, selectedEnergy, moodNote);
    setSavingMood(false);
  };

  const pendingTasks = tasks.filter((t) => t.status !== 'completed' && t.status !== 'archived');

  const groupedLogs = logs.reduce((acc: Record<string, typeof logs>, log) => {
    const date = new Date(log.started_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {});

  const totalToday = logs
    .filter((l) => l.ended_at && new Date(l.started_at).toDateString() === new Date().toDateString())
    .reduce((sum, l) => sum + (l.duration_seconds ?? 0), 0);

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold flex items-center gap-2"
          style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>
          Tracker
          <Image src="/icon-stopwatch.png" alt="tracker" width={32} height={32} className="object-contain" />
        </h1>
        <p className="font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Log your time and track your mood every day.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        {[
          { key: 'time', label: 'Time Tracker', icon: '/icon-stopwatch.png' },
          { key: 'mood', label: 'Mood Tracker', icon: '/icon-mood.png' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as 'time' | 'mood')}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all"
            style={tab === t.key
              ? { backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
              : { color: 'var(--text-muted)' }
            }
          >
            <Image src={t.icon} alt={t.label} width={20} height={20} className="object-contain" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TIME TRACKER TAB ── */}
      {tab === 'time' && (
        <div className="flex flex-col gap-5">
          {/* Active timer banner */}
          {activeLog && (
            <div className="card flex items-center gap-4 animate-bounce-in"
              style={{ backgroundColor: '#fef2f2', border: '2px solid #fca5a5' }}>
              <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold mb-0.5" style={{ color: '#ef4444' }}>TIMER RUNNING</p>
                <p className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                  {activeLog.task?.title ?? 'Unknown task'}
                </p>
                <LiveTimer startedAt={activeLog.started_at} />
              </div>
              <button onClick={handleStop} disabled={stopping}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all"
                style={{ backgroundColor: '#ef4444', color: 'white' }}>
                {stopping ? <Loader2 size={14} className="animate-spin" /> : <Square size={14} />}
                Stop
              </button>
            </div>
          )}

          {/* Start timer */}
          {!activeLog && (
            <div className="card flex flex-col gap-3">
              <h2 className="font-extrabold flex items-center gap-2"
                style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>
                <Image src="/icon-stopwatch.png" alt="start" width={22} height={22} className="object-contain" />
                Start Timer
              </h2>
              <select className="input-field" value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}>
                <option value="">Select a task...</option>
                {pendingTasks.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
              <button onClick={handleStart} disabled={!selectedTaskId}
                className="btn-primary flex items-center justify-center gap-2 disabled:opacity-40">
                <Play size={16} /> Start Tracking
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Today',    value: formatDuration(totalToday),               icon: '/icon-stopwatch.png' },
              { label: 'Sessions', value: logs.filter((l) => l.ended_at).length,    icon: '/icon-check.png'     },
              { label: 'Active',   value: activeLog ? '1' : '0',                    icon: '/icon-active.png'    },
            ].map((s) => (
              <div key={s.label} className="card text-center border-0" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="flex justify-center mb-1">
                  <Image src={s.icon} alt={s.label} width={32} height={32} className="object-contain" />
                </div>
                <div className="text-xl font-extrabold" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>
                  {s.value}
                </div>
                <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Log history */}
          <div className="card">
            <h2 className="font-extrabold mb-4 flex items-center gap-2"
              style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>
              <Image src="/icon-history.png" alt="history" width={22} height={22} className="object-contain" />
              History
            </h2>
            {loading ? (
              <div className="flex flex-col gap-2">
                {[1,2,3].map((i) => <div key={i} className="h-12 rounded-xl shimmer" />)}
              </div>
            ) : logs.filter((l) => l.ended_at).length === 0 ? (
              <div className="text-center py-8">
                <Image src="/icon-stopwatch.png" alt="no logs" width={48} height={48} className="object-contain mx-auto mb-2" />
                <p className="font-semibold" style={{ color: 'var(--text-secondary)' }}>No time logged yet</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Start a timer above!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {Object.entries(groupedLogs).map(([date, dateLogs]) => (
                  <div key={date}>
                    <p className="text-xs font-extrabold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{date}</p>
                    <div className="flex flex-col gap-2">
                      {dateLogs.filter((l) => l.ended_at).map((log) => (
                        <div key={log.id} className="flex items-center gap-3 p-3 rounded-xl group"
                          style={{ backgroundColor: 'var(--bg-secondary)' }}>
                          <Image src="/icon-stopwatch.png" alt="log" width={16} height={16} className="object-contain flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                              {log.task?.title ?? 'Unknown task'}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              {new Date(log.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {log.ended_at && ` → ${new Date(log.ended_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                            </p>
                          </div>
                          <span className="font-extrabold text-sm flex-shrink-0"
                            style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--success)' }}>
                            {formatDuration(log.duration_seconds ?? 0)}
                          </span>
                          <button onClick={() => deleteLog(log.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400 flex-shrink-0"
                            style={{ color: 'var(--text-muted)' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MOOD TRACKER TAB ── */}
      {tab === 'mood' && (
        <div className="flex flex-col gap-5">
          <div className="card">
            <h2 className="font-extrabold mb-1 flex items-center gap-2"
              style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>
              <Image src="/icon-mood.png" alt="mood" width={24} height={24} className="object-contain" />
              How are you feeling today?
            </h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>

            {/* Mood picker */}
            <div className="flex justify-between gap-2 mb-5">
              {MOODS.map((m) => (
                <button key={m.value} onClick={() => setSelectedMood(m.value)}
                  className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all hover:scale-105"
                  style={selectedMood === m.value
                    ? { backgroundColor: m.color + '25', border: `2px solid ${m.color}`, transform: 'scale(1.08)' }
                    : { backgroundColor: 'var(--bg-secondary)', border: '2px solid transparent' }
                  }>
                  <Image src={m.image} alt={m.label} width={56} height={56} className="object-contain" />
                  <span className="text-xs font-bold"
                    style={{ color: selectedMood === m.value ? m.color : 'var(--text-muted)' }}>
                    {m.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Energy picker */}
            <div className="mb-4">
              <p className="text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>Energy level:</p>
              <div className="flex gap-2 flex-wrap">
                {ENERGY.map((e) => (
                  <button key={e.value} onClick={() => setSelectedEnergy(e.value)}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
                    style={selectedEnergy === e.value
                      ? { backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }
                      : { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
                    }>
                    {e.label}
                  </button>
                ))}
              </div>
            </div>

            <textarea className="input-field resize-none mb-4" rows={2}
              placeholder="Any notes about today? (optional)"
              value={moodNote} onChange={(e) => setMoodNote(e.target.value)} />

            <button onClick={handleSaveMood} disabled={!selectedMood || savingMood}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40">
              {savingMood
                ? <Loader2 size={16} className="animate-spin" />
                : <Image src="/icon-check.png" alt="save" width={18} height={18} className="object-contain" />
              }
              {todayMood ? "Update Today's Mood" : 'Save Mood'}
            </button>
          </div>

          {/* Mood history */}
          <div className="card">
            <h2 className="font-extrabold mb-4 flex items-center gap-2"
              style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>
              <Image src="/icon-history.png" alt="history" width={22} height={22} className="object-contain" />
              Mood History
            </h2>
            {moods.length === 0 ? (
              <div className="text-center py-8">
                <Image src="/mood_okay.png" alt="no moods" width={64} height={64} className="object-contain mx-auto mb-2" />
                <p className="font-semibold" style={{ color: 'var(--text-secondary)' }}>No mood entries yet</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Log your first mood above!</p>
              </div>
            ) : (
              <>
                {/* Mini chart */}
                <div className="flex items-end gap-1.5 h-16 mb-4">
                  {moods.slice(0, 14).reverse().map((m) => {
                    const moodConfig = MOODS.find((mo) => mo.value === m.mood)!;
                    return (
                      <div key={m.id} className="flex-1 flex flex-col items-center gap-1"
                        title={`${moodConfig.label} — ${m.date}`}>
                        <div className="w-full rounded-t-lg transition-all"
                          style={{ height: `${(m.mood / 5) * 100}%`, backgroundColor: moodConfig.color, minHeight: '4px' }} />
                        <Image src={moodConfig.image} alt={moodConfig.label} width={16} height={16} className="object-contain" />
                      </div>
                    );
                  })}
                </div>

                {/* List */}
                <div className="flex flex-col gap-2">
                  {moods.slice(0, 7).map((m) => {
                    const moodConfig = MOODS.find((mo) => mo.value === m.mood)!;
                    const energyConfig = ENERGY.find((e) => e.value === (m.energy ?? 3))!;
                    return (
                      <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl"
                        style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <Image src={moodConfig.image} alt={moodConfig.label} width={36} height={36} className="object-contain flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm" style={{ color: moodConfig.color }}>{moodConfig.label}</span>
                            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{energyConfig.label}</span>
                          </div>
                          {m.note && (
                            <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>{m.note}</p>
                          )}
                        </div>
                        <span className="text-xs font-semibold flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                          {new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Tip */}
          <div className="rounded-2xl p-4 text-sm font-semibold flex items-start gap-3"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
            <Image src="/icon-mood.png" alt="tip" width={20} height={20} className="object-contain flex-shrink-0 mt-0.5" />
            <span>Tracking your mood daily helps you spot patterns — maybe you're most productive on Tuesdays, or your mood dips mid-week. Knowledge is power! 🌿</span>
          </div>
        </div>
      )}
    </div>
  );
}