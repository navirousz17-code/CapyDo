export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  image: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const BADGE_DEFINITIONS: BadgeDef[] = [
  {
    id: 'first_task',
    name: 'First Step',
    description: 'Complete your very first task!',
    image: '/badge_first_task.png',
    rarity: 'common',
  },
  {
    id: 'streak_7',
    name: '7-Day Streak',
    description: 'Maintain a 7-day habit streak!',
    image: '/badge_streak_7.png',
    rarity: 'rare',
  },
  {
    id: 'streak_30',
    name: '30-Day Legend',
    description: 'Maintain a 30-day habit streak!',
    image: '/badge_streak_30.png',
    rarity: 'legendary',
  },
  {
    id: 'perfect_day',
    name: 'Perfect Day',
    description: 'Complete ALL tasks in a single day!',
    image: '/badge_perfect_day.png',
    rarity: 'rare',
  },
  {
    id: 'speed_runner',
    name: 'Speed Runner',
    description: 'Complete 5 tasks in one day!',
    image: '/badge_speed_runner.png',
    rarity: 'rare',
  },
  {
    id: 'organizer',
    name: 'The Organizer',
    description: 'Create 5 different categories!',
    image: '/badge_organizer.png',
    rarity: 'common',
  },
  {
    id: 'habit_master',
    name: 'Habit Master',
    description: 'Complete all daily habits for 7 days straight!',
    image: '/badge_habit_master.png',
    rarity: 'epic',
  },
  {
    id: 'centurion',
    name: 'Centurion',
    description: 'Complete 100 tasks total!',
    image: '/badge_centurion.png',
    rarity: 'legendary',
  },
];

export const RARITY_COLORS = {
  common: { bg: '#f0f7ee', border: '#82bf7b', text: '#2c5f28', label: 'Common' },
  rare: { bg: '#e0f2fe', border: '#38bdf8', text: '#0369a1', label: 'Rare' },
  epic: { bg: '#f3e8ff', border: '#c084fc', text: '#7e22ce', label: 'Epic' },
  legendary: { bg: '#fff7ed', border: '#fb923c', text: '#c2410c', label: 'Legendary' },
};

export async function checkAndAwardBadge(badgeId: string): Promise<boolean> {
  try {
    const res = await fetch('/api/badges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ badge_id: badgeId }),
    });
    const data = await res.json();
    return data.newly_earned === true;
  } catch {
    return false;
  }
}