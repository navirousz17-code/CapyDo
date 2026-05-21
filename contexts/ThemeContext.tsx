'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type ThemeId = 'default' | 'dark' | 'forest' | 'sunset' | 'ocean';

export interface Theme {
  id: ThemeId;
  name: string;
  emoji: string;
  description: string;
  vars: Record<string, string>;
}

export const THEMES: Theme[] = [
  {
    id: 'default',
    name: 'Parchment',
    emoji: '📜',
    description: 'Warm and cozy earthy tones',
    vars: {
      '--bg-primary': '#fefdf8',
      '--bg-secondary': '#fdf9ed',
      '--bg-card': '#ffffff',
      '--bg-sidebar': '#ffffff',
      '--text-primary': '#5c4022',
      '--text-secondary': '#a67640',
      '--text-muted': '#c4965a',
      '--accent': '#7d5a30',
      '--accent-hover': '#5c4022',
      '--accent-text': '#fefdf8',
      '--border': '#faf2d3',
      '--border-strong': '#d9b98f',
      '--success': '#5aa352',
      '--success-bg': '#f0f7ee',
      '--danger': '#dc2626',
      '--shadow': 'rgba(125, 90, 48, 0.1)',
    },
  },
  {
    id: 'dark',
    name: 'Midnight',
    emoji: '🌙',
    description: 'Dark and sleek night mode',
    vars: {
      '--bg-primary': '#0f0f13',
      '--bg-secondary': '#1a1a24',
      '--bg-card': '#1e1e2e',
      '--bg-sidebar': '#16161f',
      '--text-primary': '#e2e0ff',
      '--text-secondary': '#a09ec0',
      '--text-muted': '#6c6a8a',
      '--accent': '#7c6fcd',
      '--accent-hover': '#6457b8',
      '--accent-text': '#ffffff',
      '--border': '#2a2a3e',
      '--border-strong': '#3a3a54',
      '--success': '#4ade80',
      '--success-bg': '#052e16',
      '--danger': '#f87171',
      '--shadow': 'rgba(0,0,0,0.4)',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    emoji: '🌲',
    description: 'Deep greens of the forest',
    vars: {
      '--bg-primary': '#f0f7ee',
      '--bg-secondary': '#e8f5e3',
      '--bg-card': '#ffffff',
      '--bg-sidebar': '#f5fbf2',
      '--text-primary': '#1a3c1f',
      '--text-secondary': '#2c5f28',
      '--text-muted': '#5aa352',
      '--accent': '#2c5f28',
      '--accent-hover': '#1a3c1f',
      '--accent-text': '#f0f7ee',
      '--border': '#dceeda',
      '--border-strong': '#82bf7b',
      '--success': '#3d7e37',
      '--success-bg': '#dcfce7',
      '--danger': '#dc2626',
      '--shadow': 'rgba(44, 95, 40, 0.15)',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    emoji: '🌅',
    description: 'Warm oranges and pinks',
    vars: {
      '--bg-primary': '#fff7ed',
      '--bg-secondary': '#ffedd5',
      '--bg-card': '#ffffff',
      '--bg-sidebar': '#fff9f5',
      '--text-primary': '#7c2d12',
      '--text-secondary': '#c2410c',
      '--text-muted': '#ea580c',
      '--accent': '#c2410c',
      '--accent-hover': '#9a3412',
      '--accent-text': '#fff7ed',
      '--border': '#fed7aa',
      '--border-strong': '#fb923c',
      '--success': '#16a34a',
      '--success-bg': '#dcfce7',
      '--danger': '#dc2626',
      '--shadow': 'rgba(194, 65, 12, 0.15)',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    emoji: '🌊',
    description: 'Cool blues and teals',
    vars: {
      '--bg-primary': '#f0f9ff',
      '--bg-secondary': '#e0f2fe',
      '--bg-card': '#ffffff',
      '--bg-sidebar': '#f5faff',
      '--text-primary': '#0c4a6e',
      '--text-secondary': '#0369a1',
      '--text-muted': '#0ea5e9',
      '--accent': '#0369a1',
      '--accent-hover': '#075985',
      '--accent-text': '#f0f9ff',
      '--border': '#bae6fd',
      '--border-strong': '#38bdf8',
      '--success': '#059669',
      '--success-bg': '#d1fae5',
      '--danger': '#dc2626',
      '--shadow': 'rgba(3, 105, 161, 0.15)',
    },
  },
];

interface ThemeContextType {
  theme: Theme;
  setTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: THEMES[0],
  setTheme: () => {},
});

export function ThemeProvider({ children, initialTheme }: { children: React.ReactNode; initialTheme?: ThemeId }) {
  const [themeId, setThemeId] = useState<ThemeId>(initialTheme ?? 'default');

  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(theme.vars).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });
    localStorage.setItem('todei-theme', themeId);
  }, [themeId, theme]);

  useEffect(() => {
    const saved = localStorage.getItem('todei-theme') as ThemeId | null;
    if (saved && THEMES.find((t) => t.id === saved)) setThemeId(saved);
  }, []);

  const setTheme = (id: ThemeId) => {
    setThemeId(id);
    // Save to DB
    fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: id }),
    }).catch(() => {});
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);