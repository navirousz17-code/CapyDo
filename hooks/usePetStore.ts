'use client';
// hooks/usePetStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type EvolutionStage = 'egg' | 'hatchling' | 'baby' | 'child' | 'teen' | 'adult';

export interface PetReaction {
  message: string;
  emoji: string;
  type: 'task' | 'habit' | 'challenge' | 'evolution';
}

export interface PetStage {
  stage: EvolutionStage;
  name: string;
  minXp: number;
  maxXp: number;
  image: string;
  vibe: string;
  messages: string[];
}

export const PET_STAGES: PetStage[] = [
  {
    stage: 'egg',
    name: 'Sleeping Egg',
    minXp: 0,
    maxXp: 49,
    image: '/pet_egg.png', // ✅ updated
    vibe: '😴 Sleeping...',
    messages: [
      'Zzz... keep going...',
      '*snores softly*',
      'Almost awake... do more tasks...',
      'Warm and cozy in here...',
    ],
  },
  {
    stage: 'hatchling',
    name: 'Hatchling Kalbo',
    minXp: 50,
    maxXp: 149,
    image: '/pet_hatchling.png', // ✅ updated
    vibe: '👀 Just hatched!',
    messages: [
      'W-what is this place??',
      'Is that a task? INTERESTING.',
      "I just hatched and you're already working? Respect.",
      'Who are you? Complete more tasks!',
    ],
  },
  {
    stage: 'baby',
    name: 'Baby Kalbo',
    minXp: 150,
    maxXp: 299,
    image: '/pet_baby.png', // ✅ updated
    vibe: '😄 Happy & clapping!',
    messages: [
      'YAAAAY you did it!!',
      'Clap clap clap!! Go go go!!',
      'I believe in you bestie!!',
      "You're my favorite human!!",
    ],
  },
  {
    stage: 'child',
    name: 'Feisty Kalbo',
    minXp: 300,
    maxXp: 499,
    image: '/pet_child.png', // ✅ updated
    vibe: '😤 Determined!',
    messages: [
      "LET'S GOOO!! Don't stop now!!",
      "I'm getting stronger because of YOU.",
      'More tasks. MORE. I need it.',
      "You think that's enough?! DO MORE.",
    ],
  },
  {
    stage: 'teen',
    name: 'Dark Kalbo',
    minXp: 500,
    maxXp: 749,
    image: '/pet_teen.png', // ✅ updated
    vibe: '😈 Dark aura activated',
    messages: [
      '*says nothing, just stares*',
      'Productivity is power.',
      'Weak people rest. We grind.',
      'The aura grows with every task.',
      '...not bad. Keep going.',
    ],
  },
  {
    stage: 'adult',
    name: 'LEGENDARY Kalbo',
    minXp: 750,
    maxXp: Infinity,
    image: '/pet_adult.png', // ✅ updated
    vibe: '🔥 LEGENDARY FORM',
    messages: [
      'I AM INEVITABLE.',
      'Every task fuels the flames.',
      'MAXIMUM POWER ACHIEVED.',
      'You created a monster. A productive monster.',
      'The legend is real. Keep going.',
    ],
  },
];

export function getStageForXp(xp: number): PetStage {
  return (
    [...PET_STAGES].reverse().find((s) => xp >= s.minXp) ?? PET_STAGES[0]
  );
}

export function getXpToNextStage(xp: number): { needed: number; current: number; percent: number } {
  const stage = getStageForXp(xp);
  if (stage.stage === 'adult') return { needed: 0, current: 0, percent: 100 };
  const needed = stage.maxXp + 1 - stage.minXp;
  const current = xp - stage.minXp;
  const percent = Math.min(100, Math.round((current / needed) * 100));
  return { needed, current, percent };
}

interface PetStore {
  xp: number;
  lastEvolutionStage: EvolutionStage;
  currentReaction: PetReaction | null;
  showEvolutionBanner: boolean;
  pendingEvolution: PetStage | null;

  getCurrentStage: () => PetStage;
  getXpProgress: () => { needed: number; current: number; percent: number };

  addXp: (amount: number, type: PetReaction['type']) => void;
  onTaskComplete: () => void;
  onHabitComplete: () => void;
  onChallengeComplete: () => void;

  clearReaction: () => void;
  dismissEvolutionBanner: () => void;
}

export const usePetStore = create<PetStore>()(
  persist(
    (set, get) => ({
      xp: 0,
      lastEvolutionStage: 'egg',
      currentReaction: null,
      showEvolutionBanner: false,
      pendingEvolution: null,

      getCurrentStage: () => getStageForXp(get().xp),
      getXpProgress: () => getXpToNextStage(get().xp),

      addXp: (amount, type) => {
        const { xp, lastEvolutionStage } = get();
        const newXp = xp + amount;
        const oldStage = getStageForXp(xp);
        const newStage = getStageForXp(newXp);

        const evolved = newStage.stage !== oldStage.stage && newStage.stage !== lastEvolutionStage;

        const messages =
          type === 'evolution'
            ? [`I EVOLVED INTO ${newStage.name.toUpperCase()}!!`, '🔥 POWER RISING 🔥']
            : newStage.messages;
        const message = messages[Math.floor(Math.random() * messages.length)];

        const reaction: PetReaction = {
          message,
          emoji: type === 'task' ? '✅' : type === 'habit' ? '🔄' : type === 'challenge' ? '🎯' : '🔥',
          type,
        };

        set({
          xp: newXp,
          currentReaction: reaction,
          ...(evolved && {
            lastEvolutionStage: newStage.stage,
            showEvolutionBanner: true,
            pendingEvolution: newStage,
          }),
        });

        setTimeout(() => {
          set((s) => (s.currentReaction === reaction ? { currentReaction: null } : {}));
        }, 3000);
      },

      onTaskComplete: () => get().addXp(10, 'task'),
      onHabitComplete: () => get().addXp(15, 'habit'),
      onChallengeComplete: () => get().addXp(50, 'challenge'),

      clearReaction: () => set({ currentReaction: null }),
      dismissEvolutionBanner: () => set({ showEvolutionBanner: false, pendingEvolution: null }),
    }),
    {
      name: 'todei-pet-store',
      partialize: (s) => ({ xp: s.xp, lastEvolutionStage: s.lastEvolutionStage }),
    }
  )
);