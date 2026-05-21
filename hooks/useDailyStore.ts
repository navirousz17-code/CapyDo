import { create } from 'zustand';
import { DailyActivity, DailyActivityFormData } from '@/types/daily';
import toast from 'react-hot-toast';

interface DailyStore {
  activities: DailyActivity[];
  loading: boolean;

  fetchActivities: () => Promise<void>;
  createActivity: (data: DailyActivityFormData) => Promise<DailyActivity | null>;
  updateActivity: (id: string, data: Partial<DailyActivityFormData>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  toggleActivity: (id: string) => Promise<void>;

  getStats: () => { total: number; completedToday: number; completionRate: number };
}

export const useDailyStore = create<DailyStore>((set, get) => ({
  activities: [],
  loading: false,

  fetchActivities: async () => {
    set({ loading: true });
    try {
      const res = await fetch('/api/daily-activities');
      if (!res.ok) throw new Error();
      const data = await res.json();
      set({ activities: data });
    } catch {
      console.error('Failed to fetch daily activities');
    } finally {
      set({ loading: false });
    }
  },

  createActivity: async (data) => {
    try {
      const res = await fetch('/api/daily-activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create activity');
      const activity = await res.json();
      set((s) => ({ activities: [...s.activities, activity] }));
      return activity;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create activity');
      return null;
    }
  },

  updateActivity: async (id, data) => {
    try {
      const res = await fetch(`/api/daily-activities/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      set((s) => ({
        activities: s.activities.map((a) =>
          a.id === id ? { ...a, ...updated } : a
        ),
      }));
    } catch {
      toast.error('Failed to update activity');
    }
  },

  deleteActivity: async (id) => {
    try {
      const res = await fetch(`/api/daily-activities/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      set((s) => ({ activities: s.activities.filter((a) => a.id !== id) }));
      toast.success('Activity deleted');
    } catch {
      toast.error('Failed to delete activity');
    }
  },

  toggleActivity: async (id) => {
    // Optimistic update
    set((s) => ({
      activities: s.activities.map((a) =>
        a.id === id ? { ...a, completed_today: !a.completed_today, streak: !a.completed_today ? (a.streak ?? 0) + 1 : Math.max(0, (a.streak ?? 0) - 1) } : a
      ),
    }));

    try {
      const res = await fetch(`/api/daily-activities/${id}/toggle`, { method: 'POST' });
      if (!res.ok) throw new Error();
      const { completed } = await res.json();
      // Refetch to get accurate streak
      get().fetchActivities();
    } catch {
      // Revert
      get().fetchActivities();
      toast.error('Failed to update activity');
    }
  },

  getStats: () => {
    const { activities } = get();
    const total = activities.length;
    const completedToday = activities.filter((a) => a.completed_today).length;
    const completionRate = total > 0 ? Math.round((completedToday / total) * 100) : 0;
    return { total, completedToday, completionRate };
  },
}));
