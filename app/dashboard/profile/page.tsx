'use client';

import { useEffect, useState, useRef } from 'react';
import { User, Bell, Globe, Save, Loader2, Copy, Check, Camera } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTaskStore } from '@/hooks/useTaskStore';
import { useDailyStore } from '@/hooks/useDailyStore';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { cn } from '@/utils';
import Image from 'next/image';

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  bio: string | null;
  username: string | null;
  is_public: boolean;
  theme: string;
  notification_daily_summary: boolean;
  notification_due_reminders: boolean;
  avatar_url: string | null;
}

const THEMES = [
  {
    id: 'default', name: 'Parchment', emoji: '📜', description: 'Warm and cozy earthy tones',
    vars: {
      '--bg-primary': '#fefdf8', '--bg-secondary': '#fdf9ed', '--bg-card': '#ffffff',
      '--bg-sidebar': '#ffffff', '--text-primary': '#5c4022', '--text-secondary': '#a67640',
      '--accent': '#7d5a30', '--accent-hover': '#5c4022', '--accent-text': '#fefdf8',
      '--border': '#faf2d3', '--border-strong': '#d9b98f',
    },
  },
  {
    id: 'dark', name: 'Midnight', emoji: '🌙', description: 'Dark and sleek night mode',
    vars: {
      '--bg-primary': '#0f0f13', '--bg-secondary': '#1a1a24', '--bg-card': '#1e1e2e',
      '--bg-sidebar': '#16161f', '--text-primary': '#e2e0ff', '--text-secondary': '#a09ec0',
      '--accent': '#7c6fcd', '--accent-hover': '#6457b8', '--accent-text': '#ffffff',
      '--border': '#2a2a3e', '--border-strong': '#3a3a54',
    },
  },
  {
    id: 'forest', name: 'Forest', emoji: '🌲', description: 'Deep greens of the forest',
    vars: {
      '--bg-primary': '#f0f7ee', '--bg-secondary': '#e8f5e3', '--bg-card': '#ffffff',
      '--bg-sidebar': '#f5fbf2', '--text-primary': '#1a3c1f', '--text-secondary': '#2c5f28',
      '--accent': '#2c5f28', '--accent-hover': '#1a3c1f', '--accent-text': '#f0f7ee',
      '--border': '#dceeda', '--border-strong': '#82bf7b',
    },
  },
  {
    id: 'sunset', name: 'Sunset', emoji: '🌅', description: 'Warm oranges and pinks',
    vars: {
      '--bg-primary': '#fff7ed', '--bg-secondary': '#ffedd5', '--bg-card': '#ffffff',
      '--bg-sidebar': '#fff9f5', '--text-primary': '#7c2d12', '--text-secondary': '#c2410c',
      '--accent': '#c2410c', '--accent-hover': '#9a3412', '--accent-text': '#fff7ed',
      '--border': '#fed7aa', '--border-strong': '#fb923c',
    },
  },
  {
    id: 'ocean', name: 'Ocean', emoji: '🌊', description: 'Cool blues and teals',
    vars: {
      '--bg-primary': '#f0f9ff', '--bg-secondary': '#e0f2fe', '--bg-card': '#ffffff',
      '--bg-sidebar': '#f5faff', '--text-primary': '#0c4a6e', '--text-secondary': '#0369a1',
      '--accent': '#0369a1', '--accent-hover': '#075985', '--accent-text': '#f0f9ff',
      '--border': '#bae6fd', '--border-strong': '#38bdf8',
    },
  },
];

function applyThemeVars(themeId: string) {
  const theme = THEMES.find((t) => t.id === themeId);
  if (!theme) return;
  Object.entries(theme.vars).forEach(([key, val]) => {
    document.documentElement.style.setProperty(key, val);
  });
  // Also update Tailwind bg for body
  if (themeId === 'dark') {
    document.body.style.backgroundColor = '#0f0f13';
    document.body.style.color = '#e2e0ff';
  } else {
    document.body.style.backgroundColor = '';
    document.body.style.color = '';
  }
  localStorage.setItem('todei-theme', themeId);
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { getStats } = useTaskStore();
  const { getStats: getDailyStats } = useDailyStore();
  const stats = getStats();
  const dailyStats = getDailyStats();
  const fileRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [activeTheme, setActiveTheme] = useState('default');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [username, setUsername] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [dailySummary, setDailySummary] = useState(true);
  const [dueReminders, setDueReminders] = useState(true);

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((p) => {
        setProfile(p);
        setFullName(p.full_name ?? '');
        setBio(p.bio ?? '');
        setUsername(p.username ?? '');
        setIsPublic(p.is_public ?? false);
        setDailySummary(p.notification_daily_summary ?? true);
        setDueReminders(p.notification_due_reminders ?? true);
        setAvatarUrl(p.avatar_url ?? null);
        const savedTheme = localStorage.getItem('todei-theme') || p.theme || 'default';
        setActiveTheme(savedTheme);
        applyThemeVars(savedTheme);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    if ('Notification' in window) {
      setNotifEnabled(Notification.permission === 'granted');
    }
  }, []);

  const handleThemeChange = (themeId: string) => {
    setActiveTheme(themeId);
    applyThemeVars(themeId);
    fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: themeId }),
    }).catch(() => {});
    toast.success(`Theme changed to ${THEMES.find(t => t.id === themeId)?.name}! 🎨`);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `avatars/${user.id}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path);

      // Save to profile
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: publicUrl }),
      });

      setAvatarUrl(publicUrl + '?t=' + Date.now());
      // Notify DashboardShell to update avatar everywhere
      window.dispatchEvent(new CustomEvent('avatar-updated', { detail: { avatarUrl: publicUrl + '?t=' + Date.now() } }));
      toast.success('Profile picture updated! 🌿');
    } catch (err) {
      toast.error('Failed to upload image. Make sure "avatars" storage bucket exists in Supabase.');
      console.error(err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          bio,
          username: username || null,
          is_public: isPublic,
          notification_daily_summary: dailySummary,
          notification_due_reminders: dueReminders,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProfile(data);
      toast.success('Profile saved! 🌿');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const requestNotifications = async () => {
    if (!('Notification' in window)) { toast.error('Notifications not supported'); return; }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotifEnabled(true);
      toast.success('Notifications enabled! 🔔');
      const now = new Date();
      const next8am = new Date();
      next8am.setHours(8, 0, 0, 0);
      if (now.getHours() >= 8) next8am.setDate(next8am.getDate() + 1);
      setTimeout(() => {
        if (Notification.permission === 'granted') {
          new Notification('🌿 TODEI-LIST Morning Summary', {
            body: `You have ${stats.pending} pending tasks today!`,
            icon: '/logo.png',
          });
        }
      }, next8am.getTime() - now.getTime());
    } else {
      toast.error('Notification permission denied');
    }
  };

  const copyProfileLink = () => {
    if (!username) { toast.error('Set a username first!'); return; }
    navigator.clipboard.writeText(`${window.location.origin}/u/${username}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Profile link copied! 🌿');
  };

  const displayName = fullName || user?.email?.split('@')[0] || 'Friend';

  if (loading) return (
    <div className="flex flex-col gap-6 animate-pulse max-w-2xl">
      {[1, 2, 3, 4].map((i) => <div key={i} className="h-40 bg-cream-200 rounded-2xl" />)}
    </div>
  );

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-extrabold text-bark-600" style={{ fontFamily: "'Baloo 2', cursive" }}>
          Profile & Settings ⚙️
        </h1>
        <p className="text-bark-400 text-sm font-medium mt-0.5">Manage your account and preferences</p>
      </div>

      {/* Profile Info */}
      <div className="card">
        <h2 className="text-lg font-extrabold text-bark-600 mb-5 flex items-center gap-2" style={{ fontFamily: "'Baloo 2', cursive" }}>
          <User size={18} /> Profile Info
        </h2>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-soft border-2 border-cream-200">
              {avatarUrl ? (
                <Image src={avatarUrl} alt="Avatar" width={80} height={80} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-moss-300 to-moss-400 flex items-center justify-center text-white text-3xl font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {/* Upload overlay */}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute inset-0 bg-bark-600/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              {uploadingAvatar ? (
                <Loader2 size={20} className="text-white animate-spin" />
              ) : (
                <Camera size={20} className="text-white" />
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
          <div>
            <p className="font-extrabold text-bark-600" style={{ fontFamily: "'Baloo 2', cursive" }}>{displayName}</p>
            <p className="text-bark-400 text-sm">{user?.email}</p>
            <button
              onClick={() => fileRef.current?.click()}
              className="text-xs text-moss-500 font-bold hover:text-moss-600 transition-colors mt-1 flex items-center gap-1"
            >
              <Camera size={12} /> {avatarUrl ? 'Change photo' : 'Upload photo'}
            </button>
            <div className="flex gap-3 mt-1 text-xs font-semibold text-bark-400">
              <span>✅ {stats.completed} tasks done</span>
              <span>🔄 {dailyStats.completedToday}/{dailyStats.total} habits</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-bark-500 mb-2">Full Name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field" placeholder="Your name" maxLength={60} />
          </div>
          <div>
            <label className="block text-sm font-bold text-bark-500 mb-2">Bio <span className="text-bark-300 font-normal">(optional)</span></label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="input-field resize-none" rows={3} placeholder="Tell the world about yourself..." maxLength={200} />
            <p className="text-xs text-bark-400 mt-1">{bio.length}/200</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-bark-500 mb-2">Username</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-bark-400 font-semibold text-sm">@</span>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} className="input-field pl-8" placeholder="yourname" maxLength={30} />
            </div>
          </div>
        </div>
      </div>

      {/* Public Profile */}
      <div className="card">
        <h2 className="text-lg font-extrabold text-bark-600 mb-4 flex items-center gap-2" style={{ fontFamily: "'Baloo 2', cursive" }}>
          <Globe size={18} /> Public Profile
        </h2>
        <div className="flex items-center justify-between p-4 bg-cream-50 rounded-xl border border-cream-200 mb-4">
          <div>
            <p className="font-bold text-bark-600 text-sm">Make profile public</p>
            <p className="text-xs text-bark-400 font-medium">Share your stats with others</p>
          </div>
          <button onClick={() => setIsPublic(!isPublic)} className={cn('relative w-12 h-6 rounded-full transition-colors', isPublic ? 'bg-moss-400' : 'bg-cream-300')}>
            <div className={cn('absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform', isPublic ? 'translate-x-7' : 'translate-x-1')} />
          </button>
        </div>
        {isPublic && username && (
          <div className="flex items-center gap-2 p-3 bg-moss-50 rounded-xl border border-moss-200">
            <span className="text-sm font-semibold text-bark-500 flex-1 truncate">{typeof window !== 'undefined' ? window.location.origin : ''}/u/{username}</span>
            <button onClick={copyProfileLink} className="flex items-center gap-1.5 text-xs font-bold text-moss-600 hover:text-moss-700 flex-shrink-0">
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        )}
        {isPublic && !username && (
          <p className="text-xs text-amber-600 font-semibold bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
            ⚠️ Set a username above to get your public profile link
          </p>
        )}
      </div>

      {/* Notifications */}
      <div className="card">
        <h2 className="text-lg font-extrabold text-bark-600 mb-4 flex items-center gap-2" style={{ fontFamily: "'Baloo 2', cursive" }}>
          <Bell size={18} /> Notifications
        </h2>
        {!notifEnabled ? (
          <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl border border-amber-200 mb-4">
            <Bell size={24} className="text-amber-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-bark-600 text-sm">Enable browser notifications</p>
              <p className="text-xs text-bark-400 font-medium">Get reminders for due tasks and daily summaries</p>
            </div>
            <button onClick={requestNotifications} className="btn-primary text-sm flex-shrink-0">Enable</button>
          </div>
        ) : (
          <div className="p-3 bg-moss-50 rounded-xl border border-moss-200 mb-4">
            <p className="text-sm font-bold text-moss-600">🔔 Notifications are enabled</p>
          </div>
        )}
        <div className="flex flex-col gap-3">
          {[
            { label: 'Morning daily summary', desc: 'Get a summary every morning at 8am', value: dailySummary, set: setDailySummary },
            { label: 'Due date reminders', desc: 'Get notified when tasks are due', value: dueReminders, set: setDueReminders },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between p-3 bg-cream-50 rounded-xl border border-cream-200">
              <div>
                <p className="font-bold text-bark-600 text-sm">{item.label}</p>
                <p className="text-xs text-bark-400 font-medium">{item.desc}</p>
              </div>
              <button onClick={() => item.set(!item.value)} className={cn('relative w-12 h-6 rounded-full transition-colors flex-shrink-0', item.value ? 'bg-moss-400' : 'bg-cream-300')}>
                <div className={cn('absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform', item.value ? 'translate-x-7' : 'translate-x-1')} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Theme picker — LIVE switching */}
      <div className="card">
        <h2 className="text-lg font-extrabold text-bark-600 mb-2" style={{ fontFamily: "'Baloo 2', cursive" }}>
          🎨 App Theme
        </h2>
        <p className="text-xs text-bark-400 font-medium mb-4">Click a theme to apply it instantly!</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => handleThemeChange(t.id)}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left hover:scale-[1.02]',
                activeTheme === t.id
                  ? 'border-bark-500 bg-cream-100 scale-[1.02] shadow-bark'
                  : 'border-cream-200 hover:border-bark-300 bg-cream-50'
              )}
            >
              <span className="text-2xl">{t.emoji}</span>
              <div className="flex-1">
                <p className="font-bold text-bark-600 text-sm">{t.name}</p>
                <p className="text-xs text-bark-400 font-medium">{t.description}</p>
              </div>
              {activeTheme === t.id && (
                <div className="w-4 h-4 rounded-full bg-moss-400 flex-shrink-0 animate-bounce-in" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Save */}
      <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center justify-center gap-2 py-3 text-base">
        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}