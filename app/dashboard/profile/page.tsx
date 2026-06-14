'use client';

import { useEffect, useState, useRef } from 'react';
import { LogOut, Bell, Globe, Save, Loader2, Copy, Check, Camera, ImagePlus, Crown, ChevronRight, Settings, User, Palette, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTaskStore } from '@/hooks/useTaskStore';
import { useDailyStore } from '@/hooks/useDailyStore';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { cn } from '@/utils';
import Image from 'next/image';

interface Profile {
  id: string; full_name: string | null; email: string; bio: string | null;
  username: string | null; is_public: boolean; theme: string;
  notification_daily_summary: boolean; notification_due_reminders: boolean;
  avatar_url: string | null; banner_url: string | null; title: string | null;
  banner_preset: string | null; // ✅ NEW — save preset choice too
}

const TITLES = [
  { id: 'none',             label: 'No Title',          emoji: '—',  requiredXp: 0    },
  { id: 'seedling',         label: 'Seedling',           emoji: '🌱', requiredXp: 0    },
  { id: 'task_hunter',      label: 'Task Hunter',        emoji: '🎯', requiredXp: 50   },
  { id: 'habit_builder',    label: 'Habit Builder',      emoji: '🔄', requiredXp: 100  },
  { id: 'rising_star',      label: 'Rising Star',        emoji: '⭐', requiredXp: 150  },
  { id: 'productivity_pro', label: 'Productivity Pro',   emoji: '⚡', requiredXp: 300  },
  { id: 'capybara_lord',    label: 'Capybara Lord',      emoji: '🦫', requiredXp: 500  },
  { id: 'shadow_grinder',   label: 'Shadow Grinder',     emoji: '👤', requiredXp: 750  },
  { id: 'legend',           label: 'LEGEND',             emoji: '👑', requiredXp: 1000 },
];

 const BANNER_PRESETS = [
  { id: 'none',    label: 'Default',  style: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' },
  { id: 'forest',  label: 'Forest',   style: 'linear-gradient(135deg, #0a1628 0%, #1a3c1f 40%, #5aa352 100%)' },
  { id: 'sunset',  label: 'Sunset',   style: 'linear-gradient(135deg, #1a0a00 0%, #7c2d12 40%, #f97316 100%)' },
  { id: 'ocean',   label: 'Ocean',    style: 'linear-gradient(135deg, #020617 0%, #0c4a6e 40%, #0891b2 100%)' },
  { id: 'shadow',  label: 'Shadow',   style: 'linear-gradient(135deg, #030712 0%, #1e1b4b 40%, #7c3aed 100%)' },
  { id: 'golden',  label: 'Golden',   style: 'linear-gradient(135deg, #1c0a00 0%, #92400e 40%, #f59e0b 100%)' },
  { id: 'crimson', label: 'Crimson',  style: 'linear-gradient(135deg, #0a0000 0%, #7f1d1d 40%, #ef4444 100%)' },
  { id: 'void',    label: 'Void',     style: 'linear-gradient(135deg, #000000 0%, #0f0a1e 50%, #4c1d95 100%)' },
];

const THEMES = [
  { id: 'default', name: 'Parchment', emoji: '📜', vars: { '--bg-primary': '#fefdf8', '--bg-secondary': '#fdf9ed', '--bg-card': '#ffffff', '--bg-sidebar': '#ffffff', '--text-primary': '#5c4022', '--text-secondary': '#a67640', '--accent': '#7d5a30', '--accent-hover': '#5c4022', '--accent-text': '#fefdf8', '--border': '#faf2d3', '--border-strong': '#d9b98f' } },
  { id: 'dark',    name: 'Midnight',  emoji: '🌙', vars: { '--bg-primary': '#0f0f13', '--bg-secondary': '#1a1a24', '--bg-card': '#1e1e2e', '--bg-sidebar': '#16161f', '--text-primary': '#e2e0ff', '--text-secondary': '#a09ec0', '--accent': '#7c6fcd', '--accent-hover': '#6457b8', '--accent-text': '#ffffff', '--border': '#2a2a3e', '--border-strong': '#3a3a54' } },
  { id: 'forest',  name: 'Forest',    emoji: '🌲', vars: { '--bg-primary': '#f0f7ee', '--bg-secondary': '#e8f5e3', '--bg-card': '#ffffff', '--bg-sidebar': '#f5fbf2', '--text-primary': '#1a3c1f', '--text-secondary': '#2c5f28', '--accent': '#2c5f28', '--accent-hover': '#1a3c1f', '--accent-text': '#f0f7ee', '--border': '#dceeda', '--border-strong': '#82bf7b' } },
  { id: 'sunset',  name: 'Sunset',    emoji: '🌅', vars: { '--bg-primary': '#fff7ed', '--bg-secondary': '#ffedd5', '--bg-card': '#ffffff', '--bg-sidebar': '#fff9f5', '--text-primary': '#7c2d12', '--text-secondary': '#c2410c', '--accent': '#c2410c', '--accent-hover': '#9a3412', '--accent-text': '#fff7ed', '--border': '#fed7aa', '--border-strong': '#fb923c' } },
  { id: 'ocean',   name: 'Ocean',     emoji: '🌊', vars: { '--bg-primary': '#f0f9ff', '--bg-secondary': '#e0f2fe', '--bg-card': '#ffffff', '--bg-sidebar': '#f5faff', '--text-primary': '#0c4a6e', '--text-secondary': '#0369a1', '--accent': '#0369a1', '--accent-hover': '#075985', '--accent-text': '#f0f9ff', '--border': '#bae6fd', '--border-strong': '#38bdf8' } },
];

function applyThemeVars(themeId: string) {
  const theme = THEMES.find(t => t.id === themeId);
  if (!theme) return;
  Object.entries(theme.vars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
  if (themeId === 'dark') { document.body.style.backgroundColor = '#0f0f13'; document.body.style.color = '#e2e0ff'; }
  else { document.body.style.backgroundColor = ''; document.body.style.color = ''; }
  localStorage.setItem('capydo-theme', themeId);
}

type Section = 'overview' | 'appearance' | 'account' | 'notifications';

export default function ProfilePage() {
  const { user } = useAuth();
  const { getStats } = useTaskStore();
  const { getStats: getDailyStats } = useDailyStore();
  const stats = getStats();
  const dailyStats = getDailyStats();
  const fileRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [activeTheme, setActiveTheme] = useState('default');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [bannerPreset, setBannerPreset] = useState('none');
  const [selectedTitle, setSelectedTitle] = useState('none');
  const [userXp, setUserXp] = useState(0);
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [username, setUsername] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [dailySummary, setDailySummary] = useState(true);
  const [dueReminders, setDueReminders] = useState(true);

  useEffect(() => {
    fetch('/api/profile').then(r => r.json()).then(p => {
      setProfile(p);
      setFullName(p.full_name ?? '');
      setBio(p.bio ?? '');
      setUsername(p.username ?? '');
      setIsPublic(p.is_public ?? false);
      setDailySummary(p.notification_daily_summary ?? true);
      setDueReminders(p.notification_due_reminders ?? true);
      setAvatarUrl(p.avatar_url ?? null);
      // ✅ Restore banner from Supabase on load
      setBannerUrl(p.banner_url ?? null);
      setBannerPreset(p.banner_preset ?? 'none');
      setSelectedTitle(p.title ?? 'none');
      const savedTheme = localStorage.getItem('capydo-theme') || p.theme || 'default';
      setActiveTheme(savedTheme);
      applyThemeVars(savedTheme);
      setLoading(false);
    }).catch(() => setLoading(false));

    try {
      const d = localStorage.getItem('capydo-pet-store');
      if (d) setUserXp(JSON.parse(d)?.state?.xp ?? 0);
    } catch {}
    if ('Notification' in window) setNotifEnabled(Notification.permission === 'granted');
  }, []);

  const handleThemeChange = (themeId: string) => {
    setActiveTheme(themeId);
    applyThemeVars(themeId);
    fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: themeId }),
    }).catch(() => {});
    toast.success(`Theme: ${THEMES.find(t => t.id === themeId)?.name} 🎨`);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Max 2MB'); return; }
    setUploadingAvatar(true);
    try {
      const path = `avatars/${user.id}.${file.name.split('.').pop()}`;
      const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: publicUrl }),
      });
      const url = publicUrl + '?t=' + Date.now();
      setAvatarUrl(url);
      window.dispatchEvent(new CustomEvent('avatar-updated', { detail: { avatarUrl: url } }));
      toast.success('Photo updated! 🦫');
    } catch { toast.error('Upload failed'); }
    finally { setUploadingAvatar(false); }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return; }
    setUploadingBanner(true);
    try {
      const path = `banners/${user.id}.${file.name.split('.').pop()}`;
      const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
      const url = publicUrl + '?t=' + Date.now();
      // ✅ Save banner_url + clear preset to Supabase immediately
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banner_url: url, banner_preset: null }),
      });
      setBannerUrl(url);
      setBannerPreset('none');
      toast.success('Banner saved! 🎨');
    } catch { toast.error('Upload failed'); }
    finally { setUploadingBanner(false); }
  };

  // ✅ NEW: save preset immediately when selected
  const handlePresetChange = async (presetId: string) => {
    setBannerPreset(presetId);
    setBannerUrl(null);
    try {
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banner_url: null, banner_preset: presetId }),
      });
      toast.success('Banner saved! 🎨');
    } catch {
      toast.error('Failed to save banner');
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
          title: selectedTitle === 'none' ? null : selectedTitle,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProfile(data);
      toast.success('Saved! 🦫');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const copyProfileLink = () => {
    if (!username) { toast.error('Set a username first!'); return; }
    navigator.clipboard.writeText(`${window.location.origin}/u/${username}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied!');
  };

  const displayName = fullName || user?.email?.split('@')[0] || 'Friend';
  const currentTitle = TITLES.find(t => t.id === selectedTitle);

  // ✅ Compute banner background — custom upload takes priority, else preset
  const bannerBg = bannerUrl
    ? `url(${bannerUrl}) center/cover no-repeat`
    : (BANNER_PRESETS.find(b => b.id === bannerPreset)?.style ?? BANNER_PRESETS[0].style);

  const NAV_SECTIONS = [
    { id: 'overview',      label: 'Overview',      icon: User     },
    { id: 'appearance',    label: 'Appearance',    icon: Palette  },
    { id: 'account',       label: 'Account',       icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell     },
  ] as const;

  if (loading) return (
    <div className="min-h-screen animate-pulse">
      <div className="h-72 rounded-3xl shimmer mb-6" />
      <div className="h-40 rounded-2xl shimmer" />
    </div>
  );

  return (
    <div className="flex flex-col gap-0 animate-fade-in -m-5 md:-m-7">
      <style>{`
        @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        @keyframes glitch { 0%,100%{clip-path:inset(0 0 100% 0)} 10%{clip-path:inset(30% 0 50% 0)} 20%{clip-path:inset(80% 0 5% 0)} 30%{clip-path:inset(10% 0 85% 0)} 40%{clip-path:inset(60% 0 20% 0)} 50%{clip-path:inset(0 0 100% 0)} }
        .banner-vignette { background: linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.15) 100%), linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%); }
      `}</style>

      {/* ── CINEMATIC BANNER ── */}
      <div className="relative w-full overflow-hidden" style={{ minHeight: 340, background: bannerBg }}>
        {/* Scanlines */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)', pointerEvents:'none', zIndex:1 }} />
        {/* Vignette — pointerEvents none so it never blocks clicks */}
        <div className="banner-vignette absolute inset-0" style={{ zIndex:2, pointerEvents:'none' }} />

        {/* ✅ Change Banner button — z-index 20 so it's always above vignette */}
        <button
          onClick={() => bannerRef.current?.click()}
          className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold backdrop-blur-md transition-all hover:scale-105 active:scale-95"
          style={{ backgroundColor:'rgba(255,255,255,0.12)', color:'white', border:'1px solid rgba(255,255,255,0.2)', zIndex:20 }}
        >
          {uploadingBanner
            ? <Loader2 size={12} className="animate-spin" />
            : <ImagePlus size={12} />
          }
          {uploadingBanner ? 'Uploading...' : 'Change Banner'}
        </button>
        <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />

        {/* Content */}
        <div className="relative flex flex-col justify-end h-full px-6 md:px-10 pb-8 pt-16" style={{ minHeight:340, zIndex:10 }}>
          <div className="mb-4">
            <span className="text-xs font-black tracking-[0.3em] uppercase" style={{ color:'rgba(255,255,255,0.5)' }}>
              CapyDo · Profile
            </span>
          </div>

          <div className="flex items-end gap-5">
            {/* Avatar */}
            <div className="relative group flex-shrink-0">
              <div className="rounded-2xl overflow-hidden" style={{ width:96, height:96, border:'3px solid rgba(255,255,255,0.3)', boxShadow:'0 0 40px rgba(0,0,0,0.5)' }}>
                {avatarUrl
                  ? <Image src={avatarUrl} alt="Avatar" width={96} height={96} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-white text-4xl font-black" style={{ background:'linear-gradient(135deg, rgba(124,58,237,0.8), rgba(239,68,68,0.8))' }}>{displayName[0].toUpperCase()}</div>
                }
              </div>
              <button onClick={() => fileRef.current?.click()} disabled={uploadingAvatar}
                className="absolute inset-0 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)' }}>
                {uploadingAvatar ? <Loader2 size={20} className="text-white animate-spin" /> : <Camera size={20} className="text-white" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>

            {/* Name + stats */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight"
                  style={{ textShadow:'0 2px 20px rgba(0,0,0,0.8)', fontFamily:"'Baloo 2', cursive" }}>
                  {displayName}
                </h1>
                {currentTitle && currentTitle.id !== 'none' && (
                  <span className="px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase"
                    style={{ background:'linear-gradient(135deg, rgba(245,158,11,0.9), rgba(239,68,68,0.9))', color:'white', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.2)', boxShadow:'0 0 20px rgba(245,158,11,0.4)' }}>
                    {currentTitle.emoji} {currentTitle.label}
                  </span>
                )}
              </div>
              {username && <p className="text-sm font-bold mb-3" style={{ color:'rgba(255,255,255,0.6)' }}>@{username}</p>}
              <div className="flex gap-4 flex-wrap">
                {[
                  { value: stats.completed,                          label: 'TASKS',  color: '#4ade80' },
                  { value: `${dailyStats.completedToday}/${dailyStats.total}`, label: 'HABITS', color: '#60a5fa' },
                  { value: userXp,                                   label: 'XP',     color: '#fbbf24' },
                  { value: `${stats.completionRate}%`,               label: 'RATE',   color: '#f472b6' },
                ].map(s => (
                  <div key={s.label}>
                    <p className="text-xl font-black" style={{ color:s.color, textShadow:`0 0 20px ${s.color}80`, fontFamily:"'Baloo 2', cursive" }}>{s.value}</p>
                    <p className="text-[10px] font-black tracking-[0.2em]" style={{ color:'rgba(255,255,255,0.4)' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT AREA ── */}
      <div className="flex flex-col md:flex-row gap-0" style={{ backgroundColor:'var(--bg-primary)' }}>

        {/* Side nav */}
        <div className="md:w-56 flex-shrink-0 flex md:flex-col gap-1 p-4 overflow-x-auto md:overflow-x-visible"
          style={{ borderRight:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }}>
          {NAV_SECTIONS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveSection(id)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap"
              style={activeSection === id
                ? { backgroundColor:'var(--accent)', color:'var(--accent-text)' }
                : { color:'var(--text-secondary)', backgroundColor:'transparent' }}>
              <Icon size={16} />
              {label}
              {activeSection === id && <ChevronRight size={14} className="ml-auto hidden md:block" />}
            </button>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 p-5 md:p-8 max-w-2xl">

          {/* ── OVERVIEW ── */}
          {activeSection === 'overview' && (
            <div className="flex flex-col gap-5">
              <h2 className="text-xl font-extrabold" style={{ fontFamily:"'Baloo 2', cursive", color:'var(--text-primary)' }}>Your Profile</h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider mb-2" style={{ color:'var(--text-muted)' }}>Display Name</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="input-field" placeholder="Your name" maxLength={60} />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider mb-2" style={{ color:'var(--text-muted)' }}>Username</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color:'var(--text-muted)' }}>@</span>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} className="input-field pl-8" placeholder="yourname" maxLength={30} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider mb-2" style={{ color:'var(--text-muted)' }}>Bio</label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)} className="input-field resize-none" rows={3} placeholder="Tell the world about yourself..." maxLength={200} />
                  <p className="text-xs mt-1" style={{ color:'var(--text-muted)' }}>{bio.length}/200</p>
                </div>
              </div>

              <div className="rounded-2xl p-4 flex items-center justify-between" style={{ backgroundColor:'var(--bg-secondary)', border:'1px solid var(--border)' }}>
                <div>
                  <p className="font-bold text-sm" style={{ color:'var(--text-primary)' }}>Public Profile</p>
                  <p className="text-xs mt-0.5" style={{ color:'var(--text-muted)' }}>Let others find and view your profile</p>
                </div>
                <button onClick={() => setIsPublic(!isPublic)}
                  className={cn('relative w-12 h-6 rounded-full transition-colors flex-shrink-0')}
                  style={{ backgroundColor: isPublic ? 'var(--accent)' : 'var(--bg-secondary)', border:'1px solid var(--border)' }}>
                  <div className={cn('absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform', isPublic ? 'translate-x-7' : 'translate-x-1')} />
                </button>
              </div>

              {isPublic && username && (
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor:'var(--bg-secondary)', border:'1px solid var(--border)' }}>
                  <Globe size={14} style={{ color:'var(--text-muted)', flexShrink:0 }} />
                  <span className="text-xs font-semibold flex-1 truncate" style={{ color:'var(--text-secondary)' }}>{typeof window !== 'undefined' ? window.location.origin : ''}/u/{username}</span>
                  <button onClick={copyProfileLink} className="flex items-center gap-1 text-xs font-bold flex-shrink-0" style={{ color:'var(--accent)' }}>
                    {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              )}

              <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center justify-center gap-2 py-3">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {/* ── APPEARANCE ── */}
          {activeSection === 'appearance' && (
            <div className="flex flex-col gap-6">
              <h2 className="text-xl font-extrabold" style={{ fontFamily:"'Baloo 2', cursive", color:'var(--text-primary)' }}>Appearance</h2>

              {/* Banner presets — ✅ each click saves immediately to Supabase */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-3" style={{ color:'var(--text-muted)' }}>Banner Style</label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {BANNER_PRESETS.map(b => (
                    <button key={b.id}
                      onClick={() => handlePresetChange(b.id)}
                      className="relative h-14 rounded-xl overflow-hidden transition-all"
                      style={{
                        background: b.style,
                        border: bannerPreset === b.id && !bannerUrl ? '2px solid var(--accent)' : '2px solid transparent',
                        transform: bannerPreset === b.id && !bannerUrl ? 'scale(1.05)' : 'scale(1)',
                        boxShadow: bannerPreset === b.id && !bannerUrl ? '0 0 16px rgba(0,0,0,0.3)' : 'none',
                      }}>
                      {bannerPreset === b.id && !bannerUrl && (
                        <div className="absolute inset-0 flex items-center justify-center"><Check size={14} color="white" /></div>
                      )}
                      <span className="absolute bottom-1 left-0 right-0 text-center text-[8px] font-bold text-white"
                        style={{ textShadow:'0 1px 3px rgba(0,0,0,0.9)' }}>{b.label}</span>
                    </button>
                  ))}
                </div>
                <button onClick={() => bannerRef.current?.click()}
                  className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                  style={{ backgroundColor:'var(--bg-secondary)', color:'var(--text-secondary)', border:'1px dashed var(--border-strong)' }}>
                  <ImagePlus size={14} /> Upload Custom Banner
                </button>
              </div>

              {/* Title picker */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-1" style={{ color:'var(--text-muted)' }}>Nameplate Title</label>
                <p className="text-xs mb-3" style={{ color:'var(--text-muted)' }}>You have {userXp} XP</p>
                <div className="grid grid-cols-2 gap-2">
                  {TITLES.map(title => {
                    const unlocked = userXp >= title.requiredXp;
                    const isSelected = selectedTitle === title.id;
                    return (
                      <button key={title.id} onClick={() => unlocked && setSelectedTitle(title.id)} disabled={!unlocked}
                        className="flex items-center gap-2.5 p-3 rounded-xl text-left transition-all"
                        style={{ backgroundColor: isSelected ? 'var(--accent)' : 'var(--bg-secondary)', border: isSelected ? 'none' : '1px solid var(--border)', opacity: unlocked ? 1 : 0.4, transform: isSelected ? 'scale(1.02)' : 'scale(1)' }}>
                        <span style={{ fontSize:18 }}>{title.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate" style={{ color: isSelected ? 'var(--accent-text)' : 'var(--text-primary)' }}>{title.label}</p>
                          <p className="text-xs" style={{ color: isSelected ? 'var(--accent-text)' : 'var(--text-muted)', opacity:0.7 }}>{title.requiredXp === 0 ? 'Default' : `${title.requiredXp} XP`}</p>
                        </div>
                        {isSelected && <Check size={12} style={{ color:'var(--accent-text)', flexShrink:0 }} />}
                        {!unlocked && <span style={{ fontSize:10 }}>🔒</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Theme */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-3" style={{ color:'var(--text-muted)' }}>App Theme</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {THEMES.map(t => (
                    <button key={t.id} onClick={() => handleThemeChange(t.id)}
                      className="flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                      style={{ backgroundColor: activeTheme === t.id ? 'var(--accent)' : 'var(--bg-secondary)', border: activeTheme === t.id ? 'none' : '1px solid var(--border)', transform: activeTheme === t.id ? 'scale(1.02)' : 'scale(1)' }}>
                      <span className="text-xl">{t.emoji}</span>
                      <p className="font-bold text-sm" style={{ color: activeTheme === t.id ? 'var(--accent-text)' : 'var(--text-primary)' }}>{t.name}</p>
                      {activeTheme === t.id && <Check size={14} className="ml-auto" style={{ color:'var(--accent-text)' }} />}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center justify-center gap-2 py-3">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {/* ── ACCOUNT ── */}
          {activeSection === 'account' && (
            <div className="flex flex-col gap-5">
              <h2 className="text-xl font-extrabold" style={{ fontFamily:"'Baloo 2', cursive", color:'var(--text-primary)' }}>Account</h2>
              <div className="rounded-2xl p-4" style={{ backgroundColor:'var(--bg-secondary)', border:'1px solid var(--border)' }}>
                <p className="text-xs font-black uppercase tracking-wider mb-1" style={{ color:'var(--text-muted)' }}>Email</p>
                <p className="font-bold" style={{ color:'var(--text-primary)' }}>{user?.email}</p>
              </div>
              <div className="rounded-2xl p-4" style={{ backgroundColor:'var(--bg-secondary)', border:'1px solid var(--border)' }}>
                <p className="text-xs font-black uppercase tracking-wider mb-1" style={{ color:'var(--text-muted)' }}>Member Since</p>
                <p className="font-bold" style={{ color:'var(--text-primary)' }}>
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' }) : '—'}
                </p>
              </div>
              <div className="rounded-2xl p-4" style={{ backgroundColor:'rgba(239,68,68,0.05)', border:'1px solid rgba(239,68,68,0.2)' }}>
                <p className="font-bold text-sm mb-1" style={{ color:'#ef4444' }}>Danger Zone</p>
                <p className="text-xs mb-3" style={{ color:'var(--text-muted)' }}>These actions are permanent and cannot be undone.</p>
                <button onClick={() => window.location.href = '/dashboard/settings'}
                  className="text-xs font-bold px-3 py-2 rounded-xl transition-all"
                  style={{ backgroundColor:'rgba(239,68,68,0.1)', color:'#ef4444' }}>
                  Manage in Settings →
                </button>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeSection === 'notifications' && (
            <div className="flex flex-col gap-5">
              <h2 className="text-xl font-extrabold" style={{ fontFamily:"'Baloo 2', cursive", color:'var(--text-primary)' }}>Notifications</h2>
              {!notifEnabled ? (
                <div className="rounded-2xl p-4 flex items-center gap-4" style={{ backgroundColor:'var(--bg-secondary)', border:'1px solid var(--border)' }}>
                  <Bell size={24} style={{ color:'var(--text-muted)', flexShrink:0 }} />
                  <div className="flex-1">
                    <p className="font-bold text-sm" style={{ color:'var(--text-primary)' }}>Enable Notifications</p>
                    <p className="text-xs" style={{ color:'var(--text-muted)' }}>Get reminders for due tasks and daily summaries</p>
                  </div>
                  <button onClick={async () => {
                    const p = await Notification.requestPermission();
                    if (p === 'granted') { setNotifEnabled(true); toast.success('Enabled! 🔔'); }
                  }} className="btn-primary text-sm flex-shrink-0">Enable</button>
                </div>
              ) : (
                <div className="rounded-2xl p-3" style={{ backgroundColor:'var(--success-bg)', border:'1px solid var(--success)' }}>
                  <p className="text-sm font-bold" style={{ color:'var(--success)' }}>🔔 Notifications are enabled</p>
                </div>
              )}
              {[
                { label: 'Morning Summary', desc: 'Daily recap at 8am',    value: dailySummary,  set: setDailySummary  },
                { label: 'Due Date Alerts', desc: 'When tasks are due',    value: dueReminders,  set: setDueReminders  },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-4 rounded-2xl" style={{ backgroundColor:'var(--bg-secondary)', border:'1px solid var(--border)' }}>
                  <div>
                    <p className="font-bold text-sm" style={{ color:'var(--text-primary)' }}>{item.label}</p>
                    <p className="text-xs" style={{ color:'var(--text-muted)' }}>{item.desc}</p>
                  </div>
                  <button onClick={() => item.set(!item.value)}
                    className="relative w-12 h-6 rounded-full transition-colors flex-shrink-0"
                    style={{ backgroundColor: item.value ? 'var(--accent)' : 'var(--bg-secondary)', border:'1px solid var(--border)' }}>
                    <div className={cn('absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform', item.value ? 'translate-x-7' : 'translate-x-1')} />
                  </button>
                </div>
              ))}
              <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center justify-center gap-2 py-3">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}