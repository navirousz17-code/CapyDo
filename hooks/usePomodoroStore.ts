import { create } from 'zustand';

export type PomodoroMode = 'work' | 'break' | 'longBreak';

interface PomodoroStore {
  mode: PomodoroMode;
  timeLeft: number;       // seconds
  isRunning: boolean;
  sessionsCompleted: number;
  workDuration: number;       // minutes
  breakDuration: number;
  longBreakDuration: number;
  longBreakEvery: number;     // every N sessions

  start: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void;
  tick: () => void;
  setWorkDuration: (m: number) => void;
  setBreakDuration: (m: number) => void;
}

export const usePomodoroStore = create<PomodoroStore>((set, get) => ({
  mode: 'work',
  timeLeft: 25 * 60,
  isRunning: false,
  sessionsCompleted: 0,
  workDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  longBreakEvery: 4,

  start: () => set({ isRunning: true }),
  pause: () => set({ isRunning: false }),

  reset: () => {
    const { mode, workDuration, breakDuration, longBreakDuration } = get();
    const dur = mode === 'work' ? workDuration : mode === 'break' ? breakDuration : longBreakDuration;
    set({ isRunning: false, timeLeft: dur * 60 });
  },

  skip: () => {
    const { mode, sessionsCompleted, workDuration, breakDuration, longBreakDuration, longBreakEvery } = get();
    if (mode === 'work') {
      const next = sessionsCompleted + 1;
      const nextMode: PomodoroMode = next % longBreakEvery === 0 ? 'longBreak' : 'break';
      const dur = nextMode === 'longBreak' ? longBreakDuration : breakDuration;
      set({ mode: nextMode, timeLeft: dur * 60, isRunning: false, sessionsCompleted: next });
    } else {
      set({ mode: 'work', timeLeft: workDuration * 60, isRunning: false });
    }
  },

  tick: () => {
    const { timeLeft, mode, sessionsCompleted, workDuration, breakDuration, longBreakDuration, longBreakEvery } = get();
    if (timeLeft > 1) {
      set({ timeLeft: timeLeft - 1 });
    } else {
      // Session ended
      if (mode === 'work') {
        const next = sessionsCompleted + 1;
        const nextMode: PomodoroMode = next % longBreakEvery === 0 ? 'longBreak' : 'break';
        const dur = nextMode === 'longBreak' ? longBreakDuration : breakDuration;
        set({ mode: nextMode, timeLeft: dur * 60, isRunning: false, sessionsCompleted: next });
      } else {
        set({ mode: 'work', timeLeft: workDuration * 60, isRunning: false });
      }
    }
  },

  setWorkDuration: (m) => set({ workDuration: m, mode: 'work', timeLeft: m * 60, isRunning: false }),
  setBreakDuration: (m) => set({ breakDuration: m }),
}));