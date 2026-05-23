'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import {
  LayoutDashboard, CheckSquare, FolderOpen, LogOut,
  Menu, X, RefreshCw, BarChart3, Zap, UserCircle, Trophy, Timer, Repeat, Target, Hourglass, Users
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils';
import { useAuth } from '@/hooks/useAuth';
import { useTaskStore } from '@/hooks/useTaskStore';
import { useRealtime } from '@/hooks/useRealtime';
import { useDailyStore } from '@/hooks/useDailyStore';
import { usePetStore } from '@/hooks/usePetStore';
import MascotReaction from '@/components/MascotReaction';
import BadgeUnlock from '@/components/BadgeUnlock';
import StreakPet from '@/components/StreakPet';
import VoiceInput from '@/components/VoiceInput';

interface Props {
  user: User;
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: '/dashboard',            label: 'Dashboard',        icon: LayoutDashboard },
  { href: '/dashboard/inbox',      label: 'Priority Inbox',   icon: Zap },
  { href: '/dashboard/tasks',      label: 'My Tasks',         icon: CheckSquare },
  { href: '/dashboard/daily',      label: 'Daily Activities', icon: RefreshCw },
  { href: '/dashboard/analytics',  label: 'Analytics',        icon: BarChart3 },
  { href: '/dashboard/badges',     label: 'Achievements',     icon: Trophy },
  { href: '/dashboard/categories', label: 'Categories',       icon: FolderOpen },
  { href: '/dashboard/profile',    label: 'Profile',          icon: UserCircle },
  { href: '/dashboard/pomodoro',   label: 'Pomodoro',         icon: Timer },
  { href: '/dashboard/challenge',  label: 'Daily Quest',      icon: Target },
  { href: '/dashboard/recurring',  label: 'Recurring',        icon: Repeat },
  { href: '/dashboard/tracker', label: 'Tracker', icon: Hourglass },
  { href: '/dashboard/social', label: 'Social', icon: Users },
];

const THEMES: Record<string, Record<string, string>> = {
  default: {
    '--bg-primary': '#fefdf8', '--bg-secondary': '#fdf9ed', '--bg-card': '#ffffff',
    '--bg-sidebar': '#ffffff', '--text-primary': '#5c4022', '--text-secondary': '#a67640',
    '--text-muted': '#c4965a', '--accent': '#7d5a30', '--accent-hover': '#5c4022',
    '--accent-text': '#fefdf8', '--border': '#faf2d3', '--border-strong': '#d9b98f',
    '--success': '#5aa352', '--success-bg': '#f0f7ee',
  },
  dark: {
    '--bg-primary': '#0f0f13', '--bg-secondary': '#1a1a24', '--bg-card': '#1e1e2e',
    '--bg-sidebar': '#16161f', '--text-primary': '#e2e0ff', '--text-secondary': '#a09ec0',
    '--text-muted': '#6c6a8a', '--accent': '#7c6fcd', '--accent-hover': '#6457b8',
    '--accent-text': '#ffffff', '--border': '#2a2a3e', '--border-strong': '#3a3a54',
    '--success': '#4ade80', '--success-bg': '#052e16',
  },
  forest: {
    '--bg-primary': '#e8f5e3', '--bg-secondary': '#d4edcc', '--bg-card': '#f5fbf2',
    '--bg-sidebar': '#edf7e8', '--text-primary': '#1a3c1f', '--text-secondary': '#2c5f28',
    '--text-muted': '#4a8c44', '--accent': '#2c5f28', '--accent-hover': '#1a3c1f',
    '--accent-text': '#f0f7ee', '--border': '#b8ddb0', '--border-strong': '#6aad62',
    '--success': '#3d7e37', '--success-bg': '#dcfce7',
  },
  sunset: {
    '--bg-primary': '#fff3e8', '--bg-secondary': '#ffe8d0', '--bg-card': '#fffaf6',
    '--bg-sidebar': '#fff5ed', '--text-primary': '#6b2300', '--text-secondary': '#b83a00',
    '--text-muted': '#d4520a', '--accent': '#c2410c', '--accent-hover': '#9a3412',
    '--accent-text': '#fff7ed', '--border': '#fdc9a0', '--border-strong': '#f97c3c',
    '--success': '#16a34a', '--success-bg': '#dcfce7',
  },
  ocean: {
    '--bg-primary': '#e8f4fd', '--bg-secondary': '#d0e9f9', '--bg-card': '#f4faff',
    '--bg-sidebar': '#eaf4fc', '--text-primary': '#0a3352', '--text-secondary': '#0b5a8a',
    '--text-muted': '#1282c4', '--accent': '#0369a1', '--accent-hover': '#024f7c',
    '--accent-text': '#e8f4fd', '--border': '#a8d8f0', '--border-strong': '#4fb3e8',
    '--success': '#059669', '--success-bg': '#d1fae5',
  },
};

function applyTheme(themeId: string) {
  const vars = THEMES[themeId] ?? THEMES.default;
  Object.entries(vars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
}

export default function DashboardShell({ user, children }: Props) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { fetchTasks, fetchCategories, getStats } = useTaskStore();
  const { fetchActivities, getStats: getDailyStats } = useDailyStore();
  const { onTaskComplete, onHabitComplete, onChallengeComplete } = usePetStore();

  useRealtime(user.id);

  useEffect(() => {
    fetchTasks();
    fetchCategories();
    fetchActivities();

    // Apply saved theme
    const savedTheme = localStorage.getItem('todei-theme') || 'default';
    applyTheme(savedTheme);

    // Load avatar
    fetch('/api/profile')
      .then(r => r.json())
      .then(p => {
        if (p.avatar_url) setAvatarUrl(p.avatar_url);
        const theme = localStorage.getItem('todei-theme') || p.theme || 'default';
        applyTheme(theme);
        localStorage.setItem('todei-theme', theme);
      })
      .catch(() => {});

    // Sync avatar updates from profile page
    const avatarHandler = (e: CustomEvent) => {
      setAvatarUrl(e.detail.avatarUrl);
    };
    window.addEventListener('avatar-updated', avatarHandler as EventListener);

    // ── Pet XP event listeners ──────────────────────────────────────
    // These are fired from TaskCard, DailyStore, and ChallengeStore
    // via: window.dispatchEvent(new CustomEvent('pet:task-complete'))
    const onTask = () => onTaskComplete();
    const onHabit = () => onHabitComplete();
    const onChallenge = () => onChallengeComplete();

    window.addEventListener('pet:task-complete', onTask);
    window.addEventListener('pet:habit-complete', onHabit);
    window.addEventListener('pet:challenge-complete', onChallenge);

    return () => {
      window.removeEventListener('avatar-updated', avatarHandler as EventListener);
      window.removeEventListener('pet:task-complete', onTask);
      window.removeEventListener('pet:habit-complete', onHabit);
      window.removeEventListener('pet:challenge-complete', onChallenge);
    };
  }, []);

  const stats = getStats();
  const dailyStats = getDailyStats();
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Friend';

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', transition: 'background-color 0.4s ease, color 0.4s ease' }}>
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/30 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn('fixed top-0 left-0 z-30 h-full w-64 flex flex-col transition-all duration-300', sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')}
        style={{ backgroundColor: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)', boxShadow: '4px 0 24px rgba(0,0,0,0.08)', transition: 'background-color 0.4s ease' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <Image src="/logo.png" alt="TODEI-LIST" width={36} height={36} className="rounded-lg" />
          <span className="text-lg font-extrabold" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>TODEI-LIST</span>
          <button className="ml-auto lg:hidden" style={{ color: 'var(--text-muted)' }} onClick={() => setSidebarOpen(false)}><X size={20} /></button>
        </div>

        {/* User info */}
        <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 shadow-soft" style={{ border: '2px solid var(--border-strong)' }}>
              {avatarUrl ? (
                <Image src={avatarUrl} alt="Avatar" width={40} height={40} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg, var(--success), var(--accent))' }}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{displayName}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { value: stats.pending, label: 'Tasks' },
              { value: stats.completed, label: 'Done' },
              { value: `${dailyStats.completedToday}/${dailyStats.total}`, label: 'Habits' },
            ].map((s) => (
              <div key={s.label} className="rounded-lg p-2" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="text-lg font-extrabold" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>{s.value}</div>
                <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200"
                style={active
                  ? { backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }
                  : { color: 'var(--text-secondary)', backgroundColor: 'transparent' }
                }
                onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-secondary)'; }}
                onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="px-3 py-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={signOut} className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 w-full hover:bg-red-50 hover:text-red-500" style={{ color: 'var(--text-muted)' }}>
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 backdrop-blur px-5 py-3 flex items-center gap-4" style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border)', transition: 'background-color 0.4s ease' }}>
          <button className="lg:hidden" style={{ color: 'var(--text-secondary)' }} onClick={() => setSidebarOpen(true)}><Menu size={22} /></button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden shadow-soft flex-shrink-0" style={{ border: '2px solid var(--border-strong)' }}>
              {avatarUrl ? (
                <Image src={avatarUrl} alt="Avatar" width={32} height={32} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs" style={{ background: 'linear-gradient(135deg, var(--success), var(--accent))' }}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <span className="hidden sm:block text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{displayName}</span>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-7 max-w-6xl w-full mx-auto" style={{ transition: 'background-color 0.4s ease' }}>
          {children}
        </main>
      </div>


      {/* Mascot Reactions 🎭 */}
      <MascotReaction />

      {/* Badge Unlock popup 🏆 */}
      <BadgeUnlock />

      {/* Streak Pet 🐣 */}
      <StreakPet />
      
      <VoiceInput />

    </div>
  );
}