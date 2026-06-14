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
  image: string;       // ← pet image (big, main display)
  stageIcon: string;   // ← stage icon (small progress bar icons)
  vibe: string;
  messages: string[];
}

export const PET_STAGES: PetStage[] = [
  {
    stage: 'egg', name: 'Sleeping Egg', minXp: 0, maxXp: 49,
    image: '/pet_egg.png',           // ← your new capybara pet
    stageIcon: '/stage_egg.png',     // ← small icon in progress bar
    vibe: '😴 Sleeping...',
    messages: ['Zzz... keep going...', '*snores softly*', 'Almost awake... do more tasks...', 'Warm and cozy in here...'],
  },
  {
    stage: 'hatchling', name: 'Hatchling Capydo', minXp: 50, maxXp: 149,
    image: '/pet_hatchling.png',
    stageIcon: '/stage_hatchling.png',
    vibe: '👀 Just hatched!',
    messages: ['W-what is this place??', 'Is that a task? INTERESTING.', "I just hatched and you're already working? Respect.", 'Who are you? Complete more tasks!'],
  },
  {
    stage: 'baby', name: 'Baby Capydo', minXp: 150, maxXp: 299,
    image: '/pet_baby.png',
    stageIcon: '/stage_baby.png',
    vibe: '😄 Happy & clapping!',
    messages: ['YAAAAY you did it!!', 'Clap clap clap!! Go go go!!', 'I believe in you bestie!!', "You're my favorite human!!"],
  },
  {
    stage: 'child', name: 'Feisty Capydo', minXp: 300, maxXp: 499,
    image: '/pet_child.png',
    stageIcon: '/stage_child.png',
    vibe: '😤 Determined!',
    messages: ["LET'S GOOO!! Don't stop now!!", "I'm getting stronger because of YOU.", 'More tasks. MORE. I need it.', "You think that's enough?! DO MORE."],
  },
  {
    stage: 'teen', name: 'Dark Capydo', minXp: 500, maxXp: 749,
    image: '/pet_teen.png',
    stageIcon: '/stage_teen.png',
    vibe: '😈 Dark aura activated',
    messages: ['*says nothing, just stares*', 'Productivity is power.', 'Weak people rest. We grind.', 'The aura grows with every task.', '...not bad. Keep going.'],
  },
  {
    stage: 'adult', name: 'LEGENDARY Capydo', minXp: 750, maxXp: Infinity,
    image: '/pet_adult.png',
    stageIcon: '/stage_adult.png',
    vibe: '🔥 LEGENDARY FORM',
    messages: ['I AM INEVITABLE.', 'Every task fuels the flames.', 'MAXIMUM POWER ACHIEVED.', 'You created a monster. A productive monster.', 'The legend is real. Keep going.'],
  },
];

export function getStageForXp(xp: number): PetStage {
  return [...PET_STAGES].reverse().find((s) => xp >= s.minXp) ?? PET_STAGES[0];
}

export function getXpToNextStage(xp: number): { needed: number; current: number; percent: number } {
  const stage = getStageForXp(xp);
  if (stage.stage === 'adult') return { needed: 0, current: 0, percent: 100 };
  const needed = stage.maxXp + 1 - stage.minXp;
  const current = xp - stage.minXp;
  const percent = Math.min(100, Math.round((current / needed) * 100));
  return { needed, current, percent };
}

// ── Wardrobe / Accessories ───────────────────────────────────────────────────
export interface AccessoryDef {
  id: string;
  name: string;
  image: string;
  cost: number;
  top: string;
  left: string;
  width: string;
}

export const ACCESSORIES: AccessoryDef[] = [
  { id: 'glasses', name: 'Cool Glasses', image: '/acc-glasses.png', cost: 30,  top: '32%',  left: '50%', width: '55%'  },
  { id: 'bow',     name: 'Cute Bow',     image: '/acc-bow.png',     cost: 25,  top: '8%',   left: '72%', width: '32%'  },
  { id: 'hat',     name: 'Wizard Hat',   image: '/acc-hat.png',     cost: 60,  top: '-22%', left: '50%', width: '70%'  },
  { id: 'halo',    name: 'Halo',         image: '/acc-halo.png',    cost: 80,  top: '-18%', left: '50%', width: '60%'  },
  { id: 'crown',   name: 'Royal Crown',  image: '/acc-crown.png',   cost: 120, top: '-20%', left: '50%', width: '65%'  },
  { id: 'wings',   name: 'Angel Wings',  image: '/acc-wings.png',   cost: 150, top: '20%',  left: '50%', width: '110%' },
];

export function getAccessory(id: string | null): AccessoryDef | null {
  if (!id) return null;
  return ACCESSORIES.find((a) => a.id === id) ?? null;
}

interface PetStore {
  xp: number;
  gems: number;
  lastEvolutionStage: EvolutionStage;
  currentReaction: PetReaction | null;
  showEvolutionBanner: boolean;
  pendingEvolution: PetStage | null;
  unlockedAccessories: string[];
  equippedAccessory: string | null;

  getCurrentStage: () => PetStage;
  getXpProgress: () => { needed: number; current: number; percent: number };

  addXp: (amount: number, type: PetReaction['type']) => void;
  onTaskComplete: () => void;
  onHabitComplete: () => void;
  onChallengeComplete: () => void;

  unlockAccessory: (id: string) => boolean;
  equipAccessory: (id: string | null) => void;

  clearReaction: () => void;
  dismissEvolutionBanner: () => void;
}

export const usePetStore = create<PetStore>()(
  persist(
    (set, get) => ({
      xp: 0,
      gems: 0,
      lastEvolutionStage: 'egg',
      currentReaction: null,
      showEvolutionBanner: false,
      pendingEvolution: null,
      unlockedAccessories: [],
      equippedAccessory: null,

      getCurrentStage: () => getStageForXp(get().xp),
      getXpProgress: () => getXpToNextStage(get().xp),

      addXp: (amount, type) => {
        const { xp, lastEvolutionStage, gems } = get();
        const newXp = xp + amount;
        const oldStage = getStageForXp(xp);
        const newStage = getStageForXp(newXp);
        const evolved = newStage.stage !== oldStage.stage && newStage.stage !== lastEvolutionStage;
        const gemsEarned = Math.max(1, Math.round(amount / 5));
        const evolutionGemsBonus = evolved ? 25 : 0;
        const messages = type === 'evolution'
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
          gems: gems + gemsEarned + evolutionGemsBonus,
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

      unlockAccessory: (id) => {
        const acc = getAccessory(id);
        if (!acc) return false;
        const { gems, unlockedAccessories } = get();
        if (unlockedAccessories.includes(id)) return true;
        if (gems < acc.cost) return false;
        set({ gems: gems - acc.cost, unlockedAccessories: [...unlockedAccessories, id] });
        return true;
      },

      equipAccessory: (id) => {
        const { unlockedAccessories } = get();
        if (id && !unlockedAccessories.includes(id)) return;
        set({ equippedAccessory: id });
      },

      clearReaction: () => set({ currentReaction: null }),
      dismissEvolutionBanner: () => set({ showEvolutionBanner: false, pendingEvolution: null }),
    }),
    {
      name: 'capydo-pet-store',
      partialize: (s) => ({
        xp: s.xp,
        gems: s.gems,
        lastEvolutionStage: s.lastEvolutionStage,
        unlockedAccessories: s.unlockedAccessories,
        equippedAccessory: s.equippedAccessory,
      }),
    }
  )
);