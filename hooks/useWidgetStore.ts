'use client';
// hooks/useWidgetStore.ts
// Place at: hooks/useWidgetStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Widget {
  id: string;
  label: string;
  emoji: string;
  enabled: boolean;
  order: number;
}

const DEFAULT_WIDGETS: Widget[] = [
  { id: 'greeting',   label: 'Greeting & Date',     emoji: '👋', enabled: true,  order: 0 },
  { id: 'stats',      label: 'Task Stats',           emoji: '📊', enabled: true,  order: 1 },
  { id: 'progress',   label: 'Completion Rate',      emoji: '📈', enabled: true,  order: 2 },
  { id: 'challenge',  label: 'Daily Challenge',      emoji: '🎯', enabled: true,  order: 3 },
  { id: 'habits',     label: 'Today\'s Habits',      emoji: '🔄', enabled: true,  order: 4 },
  { id: 'tasks',      label: 'Pending Tasks',        emoji: '✅', enabled: true,  order: 5 },
  { id: 'pomodoro',   label: 'Pomodoro Quick-Start', emoji: '🍅', enabled: false, order: 6 },
  { id: 'mood',       label: 'Mood Check-in',        emoji: '😊', enabled: false, order: 7 },
  { id: 'share',      label: 'Share Progress',       emoji: '📤', enabled: true,  order: 8 },
];

interface WidgetStore {
  widgets: Widget[];
  editMode: boolean;

  toggleWidget: (id: string) => void;
  reorder: (fromIndex: number, toIndex: number) => void;
  setEditMode: (v: boolean) => void;
  reset: () => void;
  getEnabled: () => Widget[];
}

export const useWidgetStore = create<WidgetStore>()(
  persist(
    (set, get) => ({
      widgets: DEFAULT_WIDGETS,
      editMode: false,

      toggleWidget: (id) =>
        set((s) => ({
          widgets: s.widgets.map((w) =>
            w.id === id ? { ...w, enabled: !w.enabled } : w
          ),
        })),

      reorder: (fromIndex, toIndex) =>
        set((s) => {
          const sorted = [...s.widgets].sort((a, b) => a.order - b.order);
          const [moved] = sorted.splice(fromIndex, 1);
          sorted.splice(toIndex, 0, moved);
          return {
            widgets: sorted.map((w, i) => ({ ...w, order: i })),
          };
        }),

      setEditMode: (v) => set({ editMode: v }),

      reset: () => set({ widgets: DEFAULT_WIDGETS }),

      getEnabled: () =>
        get()
          .widgets.filter((w) => w.enabled)
          .sort((a, b) => a.order - b.order),
    }),
    { name: 'todei-widgets' }
  )
);