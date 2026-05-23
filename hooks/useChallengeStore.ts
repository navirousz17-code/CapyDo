'use client';
// hooks/useChallengeStore.ts
// Place this file at: hooks/useChallengeStore.ts

import { create } from 'zustand';
import { Challenge, pickSmartChallenge, getChallengeProgress } from '@/lib/challenges';

interface ChallengeStore {
  challenge: Challenge | null;
  progress: number;
  completed: boolean;
  loading: boolean;

  fetchChallenge: () => Promise<void>;
  refreshProgress: () => void;
}

export const useChallengeStore = create<ChallengeStore>((set, get) => ({
  challenge: null,
  progress: 0,
  completed: false,
  loading: false,

  fetchChallenge: async () => {
    set({ loading: true });
    try {
      const [tasksRes, habitsRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/daily-activities'),
      ]);
      const tasks = await tasksRes.json();
      const habits = await habitsRes.json();

      const habitsTotal = Array.isArray(habits) ? habits.length : 0;
      const habitsCompleted = Array.isArray(habits)
        ? habits.filter((h: { completed_today: boolean }) => h.completed_today).length
        : 0;

      const challenge = pickSmartChallenge(tasks, habitsTotal);
      const progress = getChallengeProgress(challenge, tasks, habitsCompleted, habitsTotal);
      const completed = progress >= challenge.target;

      set({ challenge, progress, completed, loading: false });
    } catch (err) {
      console.error('Failed to fetch challenge:', err);
      set({ loading: false });
    }
  },

  refreshProgress: async () => {
    const { challenge } = get();
    if (!challenge) return;
    try {
      const [tasksRes, habitsRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/daily-activities'),
      ]);
      const tasks = await tasksRes.json();
      const habits = await habitsRes.json();

      const habitsTotal = Array.isArray(habits) ? habits.length : 0;
      const habitsCompleted = Array.isArray(habits)
        ? habits.filter((h: { completed_today: boolean }) => h.completed_today).length
        : 0;

      const wasCompleted = get().completed;
      const progress = getChallengeProgress(challenge, tasks, habitsCompleted, habitsTotal);
      const completed = progress >= challenge.target;
      set({ progress, completed });
      if (completed && !wasCompleted) {
        window.dispatchEvent(new CustomEvent('pet:challenge-complete'));
      }
    } catch {}
  },
}));