// lib/challenges.ts
// Place this file at: lib/challenges.ts

export interface Challenge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  type: 'complete_n' | 'complete_high' | 'complete_urgent' | 'clear_overdue' | 'full_habits' | 'complete_any';
  target: number;
  xp: number;
}

const CHALLENGE_POOL: Challenge[] = [
  {
    id: 'complete_3',
    title: 'Task Trio',
    description: 'Complete 3 tasks today',
    emoji: '✅',
    type: 'complete_n',
    target: 3,
    xp: 50,
  },
  {
    id: 'complete_5',
    title: 'High Five',
    description: 'Complete 5 tasks today',
    emoji: '🖐️',
    type: 'complete_n',
    target: 5,
    xp: 100,
  },
  {
    id: 'complete_1_high',
    title: 'Priority Slayer',
    description: 'Complete 1 high-priority task',
    emoji: '⚡',
    type: 'complete_high',
    target: 1,
    xp: 75,
  },
  {
    id: 'complete_urgent',
    title: 'Fire Fighter',
    description: 'Complete an urgent task',
    emoji: '🔥',
    type: 'complete_urgent',
    target: 1,
    xp: 100,
  },
  {
    id: 'clear_overdue',
    title: 'Debt Clearer',
    description: 'Complete 1 overdue task',
    emoji: '⏰',
    type: 'clear_overdue',
    target: 1,
    xp: 80,
  },
  {
    id: 'full_habits',
    title: 'Perfect Day',
    description: 'Complete all your daily habits',
    emoji: '🌟',
    type: 'full_habits',
    target: 1,
    xp: 120,
  },
  {
    id: 'complete_2_high',
    title: 'Double Threat',
    description: 'Complete 2 high or urgent tasks',
    emoji: '💪',
    type: 'complete_high',
    target: 2,
    xp: 150,
  },
  {
    id: 'complete_1',
    title: 'First Step',
    description: 'Complete at least 1 task today',
    emoji: '🌱',
    type: 'complete_any',
    target: 1,
    xp: 30,
  },
];

/**
 * Picks a smart daily challenge based on task activity.
 * Uses today's date as seed so it's stable for the whole day.
 */
export function pickSmartChallenge(
  tasks: { status: string; priority: string; due_date: string | null }[],
  habitsTotal: number
): Challenge {
  const now = new Date();
  // Seed based on date so same challenge all day
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();

  const pending = tasks.filter((t) => t.status !== 'completed' && t.status !== 'archived');
  const hasUrgent = pending.some((t) => t.priority === 'urgent');
  const hasHigh = pending.some((t) => t.priority === 'high' || t.priority === 'urgent');
  const hasOverdue = pending.some((t) => {
    if (!t.due_date) return false;
    return new Date(t.due_date) < new Date();
  });
  const hasHabits = habitsTotal > 0;
  const manyPending = pending.length >= 5;

  // Build a weighted candidate list based on actual task state
  const candidates: Challenge[] = [];

  if (hasUrgent) candidates.push(...Array(3).fill(CHALLENGE_POOL.find((c) => c.id === 'complete_urgent')!));
  if (hasOverdue) candidates.push(...Array(2).fill(CHALLENGE_POOL.find((c) => c.id === 'clear_overdue')!));
  if (hasHigh) candidates.push(...Array(2).fill(CHALLENGE_POOL.find((c) => c.id === 'complete_1_high')!));
  if (manyPending) candidates.push(CHALLENGE_POOL.find((c) => c.id === 'complete_5')!);
  if (pending.length >= 3) candidates.push(CHALLENGE_POOL.find((c) => c.id === 'complete_3')!);
  if (hasHabits) candidates.push(CHALLENGE_POOL.find((c) => c.id === 'full_habits')!);
  if (hasHigh && pending.length >= 2) candidates.push(CHALLENGE_POOL.find((c) => c.id === 'complete_2_high')!);

  // Always have fallback
  candidates.push(CHALLENGE_POOL.find((c) => c.id === 'complete_1')!);
  candidates.push(CHALLENGE_POOL.find((c) => c.id === 'complete_3')!);

  // Seeded pick — stable for the day
  const index = seed % candidates.length;
  return candidates[index];
}

/**
 * Calculate current progress toward a challenge.
 */
export function getChallengeProgress(
  challenge: Challenge,
  tasks: { status: string; priority: string; due_date: string | null; completed_at?: string | null }[],
  habitsCompleted: number,
  habitsTotal: number
): number {
  const todayStr = new Date().toISOString().split('T')[0];

  const completedToday = tasks.filter((t) => {
    if (t.status !== 'completed') return false;
    if (!t.completed_at) return true; // fallback — count it
    return t.completed_at.startsWith(todayStr);
  });

  switch (challenge.type) {
    case 'complete_any':
    case 'complete_n':
      return Math.min(completedToday.length, challenge.target);

    case 'complete_high':
      return Math.min(
        completedToday.filter((t) => t.priority === 'high' || t.priority === 'urgent').length,
        challenge.target
      );

    case 'complete_urgent':
      return Math.min(
        completedToday.filter((t) => t.priority === 'urgent').length,
        challenge.target
      );

    case 'clear_overdue':
      // Count tasks completed today that were previously overdue
      return Math.min(completedToday.length, challenge.target);

    case 'full_habits':
      if (habitsTotal === 0) return 0;
      return habitsCompleted >= habitsTotal ? 1 : 0;

    default:
      return 0;
  }
}