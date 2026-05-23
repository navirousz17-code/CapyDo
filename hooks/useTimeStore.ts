'use client';
// hooks/useTimeStore.ts
// Place at: hooks/useTimeStore.ts

import { create } from 'zustand';
import toast from 'react-hot-toast';

export interface TimeLog {
  id: string;
  task_id: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  note: string | null;
  task?: { id: string; title: string } | null;
}

export interface MoodEntry {
  id: string;
  mood: number;
  energy: number | null;
  note: string | null;
  date: string;
  created_at: string;
}

interface TimeStore {
  logs: TimeLog[];
  activeLog: TimeLog | null;
  moods: MoodEntry[];
  todayMood: MoodEntry | null;
  loading: boolean;

  fetchLogs: (taskId?: string) => Promise<void>;
  startTimer: (taskId: string) => Promise<void>;
  stopTimer: () => Promise<void>;
  deleteLog: (id: string) => Promise<void>;

  fetchMoods: () => Promise<void>;
  saveMood: (mood: number, energy: number, note?: string) => Promise<void>;

  getTotalTime: (taskId: string) => number;
  formatDuration: (seconds: number) => string;
}

export const useTimeStore = create<TimeStore>((set, get) => ({
  logs: [],
  activeLog: null,
  moods: [],
  todayMood: null,
  loading: false,

  fetchLogs: async (taskId) => {
    set({ loading: true });
    try {
      const url = taskId ? `/api/time-logs?task_id=${taskId}` : '/api/time-logs';
      const res = await fetch(url);
      const data = await res.json();
      const logs = Array.isArray(data) ? data : [];
      // Find active log (no ended_at)
      const activeLog = logs.find((l: TimeLog) => !l.ended_at) ?? null;
      set({ logs, activeLog });
    } catch {}
    set({ loading: false });
  },

  startTimer: async (taskId) => {
    const { activeLog } = get();
    if (activeLog) {
      toast.error('Stop the current timer first!');
      return;
    }
    try {
      const res = await fetch('/api/time-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: taskId }),
      });
      const log = await res.json();
      set((s) => ({ logs: [log, ...s.logs], activeLog: log }));
      toast.success('Timer started! ⏱️');
    } catch {
      toast.error('Failed to start timer');
    }
  },

  stopTimer: async () => {
    const { activeLog } = get();
    if (!activeLog) return;
    try {
      const res = await fetch(`/api/time-logs/${activeLog.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ended_at: new Date().toISOString() }),
      });
      const updated = await res.json();
      set((s) => ({
        logs: s.logs.map((l) => l.id === activeLog.id ? updated : l),
        activeLog: null,
      }));
      const dur = get().formatDuration(updated.duration_seconds ?? 0);
      toast.success(`Timer stopped! ${dur} logged ✅`);
    } catch {
      toast.error('Failed to stop timer');
    }
  },

  deleteLog: async (id) => {
    set((s) => ({ logs: s.logs.filter((l) => l.id !== id) }));
    try {
      await fetch(`/api/time-logs/${id}`, { method: 'DELETE' });
    } catch {
      get().fetchLogs();
    }
  },

  fetchMoods: async () => {
    try {
      const res = await fetch('/api/mood');
      const data = await res.json();
      const moods = Array.isArray(data) ? data : [];
      const today = new Date().toISOString().split('T')[0];
      const todayMood = moods.find((m: MoodEntry) => m.date === today) ?? null;
      set({ moods, todayMood });
    } catch {}
  },

  saveMood: async (mood, energy, note) => {
    try {
      const res = await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, energy, note }),
      });
      const entry = await res.json();
      set((s) => ({
        todayMood: entry,
        moods: [entry, ...s.moods.filter((m) => m.date !== entry.date)],
      }));
      toast.success('Mood saved! 🌿');
    } catch {
      toast.error('Failed to save mood');
    }
  },

  getTotalTime: (taskId) => {
    const { logs } = get();
    return logs
      .filter((l) => l.task_id === taskId && l.duration_seconds)
      .reduce((sum, l) => sum + (l.duration_seconds ?? 0), 0);
  },

  formatDuration: (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const h = Math.floor(m / 60);
    const mins = m % 60;
    if (h > 0) return `${h}h ${mins}m`;
    return `${m}m`;
  },
}));