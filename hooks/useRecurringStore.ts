'use client';
// hooks/useRecurringStore.ts
// Place at: hooks/useRecurringStore.ts

import { create } from 'zustand';
import toast from 'react-hot-toast';

export interface RecurringTask {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category_id: string | null;
  category?: { id: string; name: string; color: string; icon: string } | null;
  interval: 'daily' | 'weekly' | 'monthly';
  day_of_week: number | null;
  day_of_month: number | null;
  is_active: boolean;
  last_spawned_at: string | null;
  created_at: string;
}

export interface RecurringFormData {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category_id?: string;
  interval: 'daily' | 'weekly' | 'monthly';
  day_of_week?: number;
  day_of_month?: number;
}

interface RecurringStore {
  tasks: RecurringTask[];
  loading: boolean;

  fetchRecurring: () => Promise<void>;
  createRecurring: (data: RecurringFormData) => Promise<RecurringTask | null>;
  updateRecurring: (id: string, data: Partial<RecurringFormData & { is_active: boolean }>) => Promise<void>;
  deleteRecurring: (id: string) => Promise<void>;
  spawnNow: (id: string) => Promise<void>;
}

export const useRecurringStore = create<RecurringStore>((set, get) => ({
  tasks: [],
  loading: false,

  fetchRecurring: async () => {
    set({ loading: true });
    try {
      const res = await fetch('/api/recurring-tasks');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      set({ tasks: data });
    } catch (err) {
      console.error(err);
    } finally {
      set({ loading: false });
    }
  },

  createRecurring: async (data) => {
    try {
      const res = await fetch('/api/recurring-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create');
      const task = await res.json();
      set((s) => ({ tasks: [task, ...s.tasks] }));
      toast.success('Recurring task created! 🔁');
      return task;
    } catch (err) {
      toast.error('Failed to create recurring task');
      return null;
    }
  },

  updateRecurring: async (id, data) => {
    try {
      const res = await fetch(`/api/recurring-tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update');
      const updated = await res.json();
      set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? updated : t)) }));
    } catch {
      toast.error('Failed to update');
    }
  },

  deleteRecurring: async (id) => {
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
    try {
      const res = await fetch(`/api/recurring-tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Recurring task deleted');
    } catch {
      get().fetchRecurring();
      toast.error('Failed to delete');
    }
  },

  spawnNow: async (id) => {
    try {
      const res = await fetch(`/api/recurring-tasks/${id}`, { method: 'POST' });
      if (!res.ok) throw new Error();
      toast.success('Task spawned to your task list! ✅');
      // Update last_spawned_at locally
      const today = new Date().toISOString().split('T')[0];
      set((s) => ({
        tasks: s.tasks.map((t) => (t.id === id ? { ...t, last_spawned_at: today } : t)),
      }));
    } catch {
      toast.error('Failed to spawn task');
    }
  },
}));