'use client';
// app/dashboard/photobooth/page.tsx

import { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Download, Share2, RefreshCw, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePetStore, getStageForXp } from '@/hooks/usePetStore';
import { useTaskStore } from '@/hooks/useTaskStore';
import { useDailyStore } from '@/hooks/useDailyStore';
import toast from 'react-hot-toast';

// ── FRAMES ───────────────────────────────────────────────────────────────────
const FRAMES = [
  {
    id: 'cozy-forest',
    name: 'Cozy Forest',
    category: 'nature',
    emoji: '🌿',
    border: 'linear-gradient(135deg, #5aa352, #82c97a, #2c5f28)',
    innerBg: 'linear-gradient(160deg, #f0f7ee 0%, #d4edcc 100%)',
    cornerColor: '#5aa352',
    textColor: '#1a3c1f',
    accentColor: '#5aa352',
    overlay: 'rgba(90,163,82,0.08)',
  },
  {
    id: 'shadow-monarch',
    name: 'Shadow Monarch',
    category: 'epic',
    emoji: '👑',
    border: 'linear-gradient(135deg, #7c3aed, #4f46e5, #1e1b4b)',
    innerBg: 'linear-gradient(160deg, #0f0a1e 0%, #1a1040 100%)',
    cornerColor: '#a855f7',
    textColor: '#e9d5ff',
    accentColor: '#a855f7',
    overlay: 'rgba(124,58,237,0.15)',
  },
  {
    id: 'golden-fire',
    name: 'Golden Fire',
    category: 'epic',
    emoji: '🔥',
    border: 'linear-gradient(135deg, #f59e0b, #ef4444, #dc2626)',
    innerBg: 'linear-gradient(160deg, #1c0a00 0%, #2d1000 100%)',
    cornerColor: '#f59e0b',
    textColor: '#fef3c7',
    accentColor: '#f59e0b',
    overlay: 'rgba(245,158,11,0.12)',
  },
  {
    id: 'pixel-quest',
    name: 'Pixel Quest',
    category: 'gaming',
    emoji: '🎮',
    border: 'linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6)',
    innerBg: 'linear-gradient(160deg, #0c1220 0%, #0f172a 100%)',
    cornerColor: '#06b6d4',
    textColor: '#e0f2fe',
    accentColor: '#06b6d4',
    overlay: 'rgba(6,182,212,0.1)',
  },
  {
    id: 'kawaii-dream',
    name: 'Kawaii Dream',
    category: 'cute',
    emoji: '🎀',
    border: 'linear-gradient(135deg, #f472b6, #e879f9, #a855f7)',
    innerBg: 'linear-gradient(160deg, #fdf2f8 0%, #fce7f3 100%)',
    cornerColor: '#f472b6',
    textColor: '#831843',
    accentColor: '#ec4899',
    overlay: 'rgba(244,114,182,0.08)',
  },
  {
    id: 'ocean-deep',
    name: 'Ocean Deep',
    category: 'nature',
    emoji: '🌊',
    border: 'linear-gradient(135deg, #0369a1, #0891b2, #06b6d4)',
    innerBg: 'linear-gradient(160deg, #0c1a2e 0%, #0f2744 100%)',
    cornerColor: '#38bdf8',
    textColor: '#e0f2fe',
    accentColor: '#38bdf8',
    overlay: 'rgba(56,189,248,0.1)',
  },
  {
    id: 'sunset-vibes',
    name: 'Sunset Vibes',
    category: 'cute',
    emoji: '🌅',
    border: 'linear-gradient(135deg, #f97316, #ec4899, #8b5cf6)',
    innerBg: 'linear-gradient(160deg, #fff7ed 0%, #fce7f3 100%)',
    cornerColor: '#f97316',
    textColor: '#7c2d12',
    accentColor: '#f97316',
    overlay: 'rgba(249,115,22,0.08)',
  },
  {
    id: 'void-crystal',
    name: 'Void Crystal',
    category: 'epic',
    emoji: '💎',
    border: 'linear-gradient(135deg, #1e1b4b, #312e81, #4c1d95)',
    innerBg: 'linear-gradient(160deg, #030712 0%, #0f0a1e 100%)',
    cornerColor: '#6366f1',
    textColor: '#c7d2fe',
    accentColor: '#818cf8',
    overlay: 'rgba(99,102,241,0.12)',
  },
];

// ── FILTERS ──────────────────────────────────────────────────────────────────
const FILTERS = [
  { id: 'none',        name: 'Original',  emoji: '✨', css: 'none' },
  { id: 'warm',        name: 'Warm',      emoji: '🌅', css: 'sepia(0.3) saturate(1.4) brightness(1.05)' },
  { id: 'cool',        name: 'Cool',      emoji: '❄️', css: 'hue-rotate(180deg) saturate(0.8) brightness(1.1)' },
  { id: 'dark',        name: 'Dark',      emoji: '🌑', css: 'brightness(0.7) contrast(1.3) saturate(1.2)' },
  { id: 'vintage',     name: 'Vintage',   emoji: '📷', css: 'sepia(0.6) contrast(1.1) brightness(0.95)' },
  { id: 'glitch',      name: 'Glitch',    emoji: '⚡', css: 'hue-rotate(90deg) saturate(2) contrast(1.5)' },
  { id: 'holo',        name: 'Holo',      emoji: '🌈', css: 'hue-rotate(45deg) saturate(1.8) brightness(1.1)' },
  { id: 'sparkle',     name: 'Sparkle',   emoji: '💫', css: 'brightness(1.2) saturate(1.5) contrast(0.9)' },
  { id: 'shadow',      name: 'Shadow',    emoji: '👤', css: 'brightness(0.5) contrast(2) saturate(0.5)' },
  { id: 'neon',        name: 'Neon',      emoji: '🔮', css: 'saturate(3) brightness(0.8) contrast(1.4)' },
  { id: 'pastel',      name: 'Pastel',    emoji: '🎨', css: 'saturate(0.6) brightness(1.15) contrast(0.9)' },
  { id: 'cinematic',   name: 'Cinematic', emoji: '🎬', css: 'contrast(1.2) saturate(0.85) brightness(0.9)' },
];

// ── STICKERS ─────────────────────────────────────────────────────────────────
const STICKERS = [
  '⭐', '💫', '✨', '🔥', '💥', '👑', '💎', '🌿',
  '🦫', '🎯', '⚡', '🌊', '🎀', '💜', '🖤', '🤍',
  '🏆', '🎮', '😤', '😎', '🤩', '💪', '🗡️', '🛡️',
];

interface PlacedSticker {
  id: string;
  emoji: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
}

const XP_MILESTONES = [
  { xp: 0,    label: 'Egg',      rank: '🥚' },
  { xp: 50,   label: 'Seedling', rank: '🌱' },
  { xp: 150,  label: 'Sprout',   rank: '🌿' },
  { xp: 300,  label: 'Sapling',  rank: '🌳' },
  { xp: 500,  label: 'Explorer', rank: '⚔️' },
  { xp: 750,  label: 'Champion', rank: '🏆' },
  { xp: 1000, label: 'Legend',   rank: '👑' },
];

function getRank(xp: number) {
  return [...XP_MILESTONES].reverse().find(m => xp >= m.xp) ?? XP_MILESTONES[0];
}

export default function PhotoboothPage() {
  const cardRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { xp } = usePetStore();
  const { getStats } = useTaskStore();
  const { getStats: getDailyStats, activities } = useDailyStore();

  const stats = getStats();
  const dailyStats = getDailyStats();
  const petStage = getStageForXp(xp);
  const rank = getRank(xp);
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Friend';
  const longestStreak = Math.max(...activities.map(a => a.streak ?? 0), 0);

  const [selectedFrame, setSelectedFrame] = useState(FRAMES[0]);
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([]);
  const [frameCategory, setFrameCategory] = useState<string>('all');
  const [capturing, setCapturing] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/profile').then(r => r.json()).then(p => {
      if (p.avatar_url) setAvatarUrl(p.avatar_url);
    }).catch(() => {});
  }, []);

  const addSticker = (emoji: string) => {
    const newSticker: PlacedSticker = {
      id: Date.now().toString(),
      emoji,
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
      size: 28 + Math.random() * 20,
      rotation: -15 + Math.random() * 30,
    };
    setPlacedStickers(s => [...s, newSticker]);
  };

  const removeSticker = (id: string) => {
    setPlacedStickers(s => s.filter(st => st.id !== id));
  };

  const handleDownload = async () => {
    setCapturing(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      if (!cardRef.current) return;
      await new Promise(r => setTimeout(r, 200));
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false,
        imageTimeout: 20000,
        onclone: (doc) => {
          doc.querySelectorAll('img').forEach(img => {
            img.style.display = 'block';
            img.style.visibility = 'visible';
            img.style.opacity = '1';
            img.crossOrigin = 'anonymous';
          });
        },
      });
      const link = document.createElement('a');
      link.download = `capydo-photobooth-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Photo saved! 📸');
    } catch {
      toast.error('Try screenshotting manually!');
    } finally {
      setCapturing(false);
    }
  };

  const handleShare = async () => {
    const text = `🦫 Check out my CapyDo pet!\n${petStage.name} · ${xp} XP · ${rank.label} rank\n✅ ${stats.completed} tasks done · 🔥 ${longestStreak} day streak\n\nJoin me at capydo.app`;
    if (navigator.share) {
      await navigator.share({ title: 'My CapyDo Pet', text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    }
  };

  const filteredFrames = frameCategory === 'all' ? FRAMES : FRAMES.filter(f => f.category === frameCategory);

  const petGlow = {
    egg:       '0 0 40px rgba(255,230,100,0.8)',
    hatchling: '0 0 40px rgba(120,200,255,0.8)',
    baby:      '0 0 40px rgba(255,180,80,0.8)',
    child:     '0 0 50px rgba(255,100,50,0.9)',
    teen:      '0 0 60px rgba(140,60,255,1)',
    adult:     '0 0 80px rgba(255,150,0,1)',
  }[petStage.stage];

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold flex items-center gap-2" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>
          📸 Photobooth
        </h1>
        <p className="font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Create your perfect pet card and share it with the world!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── LEFT: PHOTO CARD ── */}
        <div className="flex flex-col gap-4">
          {/* The card */}
          <div
            ref={cardRef}
            style={{
              position: 'relative',
              borderRadius: 24,
              padding: 4,
              background: selectedFrame.border,
              boxShadow: `0 0 40px ${selectedFrame.cornerColor}60, 0 20px 60px rgba(0,0,0,0.3)`,
              filter: selectedFilter.css !== 'none' ? selectedFilter.css : undefined,
            }}
          >
            {/* Inner card */}
            <div style={{
              borderRadius: 20,
              background: selectedFrame.innerBg,
              padding: 20,
              position: 'relative',
              overflow: 'hidden',
              minHeight: 400,
            }}>
              {/* Background overlay pattern */}
              <div style={{
                position: 'absolute', inset: 0,
                background: selectedFrame.overlay,
                backgroundImage: `radial-gradient(circle at 20% 20%, ${selectedFrame.cornerColor}20 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${selectedFrame.accentColor}15 0%, transparent 50%)`,
              }} />

              {/* Corner decorations */}
              {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((pos) => (
                <div key={pos} style={{
                  position: 'absolute',
                  width: 32, height: 32,
                  ...(pos === 'top-left' && { top: 8, left: 8, borderTop: `3px solid ${selectedFrame.cornerColor}`, borderLeft: `3px solid ${selectedFrame.cornerColor}`, borderRadius: '6px 0 0 0' }),
                  ...(pos === 'top-right' && { top: 8, right: 8, borderTop: `3px solid ${selectedFrame.cornerColor}`, borderRight: `3px solid ${selectedFrame.cornerColor}`, borderRadius: '0 6px 0 0' }),
                  ...(pos === 'bottom-left' && { bottom: 8, left: 8, borderBottom: `3px solid ${selectedFrame.cornerColor}`, borderLeft: `3px solid ${selectedFrame.cornerColor}`, borderRadius: '0 0 0 6px' }),
                  ...(pos === 'bottom-right' && { bottom: 8, right: 8, borderBottom: `3px solid ${selectedFrame.cornerColor}`, borderRight: `3px solid ${selectedFrame.cornerColor}`, borderRadius: '0 0 6px 0' }),
                }} />
              ))}

              {/* Content */}
              <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                {/* User info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" width={40} height={40}
                      style={{ borderRadius: 12, objectFit: 'cover', border: `2px solid ${selectedFrame.cornerColor}` }} />
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: selectedFrame.border, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 16, border: `2px solid ${selectedFrame.cornerColor}` }}>
                      {displayName[0].toUpperCase()}
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <p style={{ color: selectedFrame.textColor, fontSize: 14, fontWeight: 900, margin: 0, fontFamily: "'Baloo 2', cursive" }}>{displayName}</p>
                    <p style={{ color: selectedFrame.accentColor, fontSize: 10, fontWeight: 700, margin: 0, letterSpacing: '0.05em' }}>{rank.rank} {rank.label} · {xp} XP</p>
                  </div>
                  <div style={{ fontSize: 10, color: selectedFrame.accentColor, fontWeight: 700, letterSpacing: '0.1em', opacity: 0.7 }}>CapyDo</div>
                </div>

                {/* Pet showcase */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 0' }}>
                  {/* Glow bg */}
                  <div style={{
                    position: 'absolute', width: 200, height: 200, borderRadius: '50%',
                    background: `radial-gradient(circle, ${selectedFrame.cornerColor}30 0%, transparent 70%)`,
                    animation: 'petGlowAnim 3s ease-in-out infinite',
                  }} />
                  {/* Rotating ring */}
                  <div style={{
                    position: 'absolute', width: 220, height: 220, borderRadius: '50%',
                    border: `1px solid ${selectedFrame.cornerColor}40`,
                    animation: 'ringRotate 8s linear infinite',
                  }} />
                  <div style={{
                    position: 'absolute', width: 180, height: 180, borderRadius: '50%',
                    border: `1px dashed ${selectedFrame.accentColor}30`,
                    animation: 'ringRotateReverse 6s linear infinite',
                  }} />
                  {/* Pet image */}
                  <img
                    src={petStage.image}
                    alt={petStage.name}
                    width={160} height={160}
                    style={{
                      objectFit: 'contain',
                      filter: petGlow ? `drop-shadow(${petGlow})` : undefined,
                      position: 'relative', zIndex: 2,
                      animation: 'petFloat 3s ease-in-out infinite',
                    }}
                  />
                </div>

                {/* Pet name + vibe */}
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: selectedFrame.textColor, fontSize: 20, fontWeight: 900, margin: 0, fontFamily: "'Baloo 2', cursive", textShadow: `0 0 20px ${selectedFrame.accentColor}` }}>
                    {petStage.name}
                  </p>
                  <p style={{ color: selectedFrame.accentColor, fontSize: 11, fontWeight: 600, margin: '2px 0 0', letterSpacing: '0.05em' }}>
                    {petStage.vibe}
                  </p>
                </div>

                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, width: '100%', marginTop: 4 }}>
                  {[
                    { label: 'Tasks', value: stats.completed, icon: '✅' },
                    { label: 'Streak', value: `${longestStreak}🔥`, icon: '' },
                    { label: 'Habits', value: `${dailyStats.completedToday}/${dailyStats.total}`, icon: '🔄' },
                  ].map(s => (
                    <div key={s.label} style={{
                      background: `${selectedFrame.cornerColor}20`,
                      border: `1px solid ${selectedFrame.cornerColor}40`,
                      borderRadius: 10, padding: '6px 4px', textAlign: 'center',
                    }}>
                      <div style={{ color: selectedFrame.textColor, fontSize: 14, fontWeight: 900, fontFamily: "'Baloo 2', cursive" }}>{s.value}</div>
                      <div style={{ color: selectedFrame.accentColor, fontSize: 9, fontWeight: 700, letterSpacing: '0.05em' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* XP bar */}
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: selectedFrame.accentColor, fontSize: 9, fontWeight: 700 }}>LEVEL PROGRESS</span>
                    <span style={{ color: selectedFrame.textColor, fontSize: 9, fontWeight: 700 }}>{xp} XP</span>
                  </div>
                  <div style={{ height: 6, background: `${selectedFrame.cornerColor}30`, borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(((xp - petStage.minXp) / Math.max(petStage.maxXp - petStage.minXp, 1)) * 100, 100)}%`,
                      background: selectedFrame.border,
                      borderRadius: 99,
                    }} />
                  </div>
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: 2 }}>
                  <span style={{ color: selectedFrame.accentColor, fontSize: 9, opacity: 0.6, fontWeight: 700, letterSpacing: '0.1em' }}>capydo.app</span>
                  <span style={{ color: selectedFrame.accentColor, fontSize: 9, opacity: 0.6 }}>🦫 {selectedFrame.emoji}</span>
                </div>
              </div>

              {/* Placed stickers */}
              {placedStickers.map(sticker => (
                <div key={sticker.id}
                  onClick={() => removeSticker(sticker.id)}
                  style={{
                    position: 'absolute',
                    left: `${sticker.x}%`, top: `${sticker.y}%`,
                    fontSize: sticker.size,
                    transform: `rotate(${sticker.rotation}deg)`,
                    cursor: 'pointer', zIndex: 10,
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                    userSelect: 'none',
                  }}
                  title="Click to remove">
                  {sticker.emoji}
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button onClick={handleDownload} disabled={capturing}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}>
              {capturing
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Download size={16} />}
              {capturing ? 'Saving...' : 'Download'}
            </button>
            <button onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all"
              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
              <Share2 size={16} /> Share
            </button>
          </div>
        </div>

        {/* ── RIGHT: CONTROLS ── */}
        <div className="flex flex-col gap-4">

          {/* Frames */}
          <div className="card">
            <h3 className="font-extrabold mb-3 flex items-center gap-2" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>
              🖼️ Frames
            </h3>
            {/* Category tabs */}
            <div className="flex gap-1.5 mb-3 flex-wrap">
              {['all', 'nature', 'epic', 'gaming', 'cute'].map(cat => (
                <button key={cat} onClick={() => setFrameCategory(cat)}
                  className="text-xs font-bold px-2.5 py-1 rounded-full capitalize transition-all"
                  style={frameCategory === cat
                    ? { backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }
                    : { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {filteredFrames.map(frame => (
                <button key={frame.id} onClick={() => setSelectedFrame(frame)}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all"
                  style={{
                    background: selectedFrame.id === frame.id ? frame.border : 'var(--bg-secondary)',
                    border: selectedFrame.id === frame.id ? 'none' : '1px solid var(--border)',
                    boxShadow: selectedFrame.id === frame.id ? `0 0 16px ${frame.cornerColor}60` : 'none',
                    transform: selectedFrame.id === frame.id ? 'scale(1.05)' : 'scale(1)',
                  }}>
                  <span style={{ fontSize: 20 }}>{frame.emoji}</span>
                  <span className="text-[9px] font-bold text-center leading-tight"
                    style={{ color: selectedFrame.id === frame.id ? 'white' : 'var(--text-muted)' }}>
                    {frame.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="card">
            <h3 className="font-extrabold mb-3 flex items-center gap-2" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>
              🎨 Filters
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {FILTERS.map(filter => (
                <button key={filter.id} onClick={() => setSelectedFilter(filter)}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all"
                  style={{
                    backgroundColor: selectedFilter.id === filter.id ? 'var(--accent)' : 'var(--bg-secondary)',
                    border: selectedFilter.id === filter.id ? 'none' : '1px solid var(--border)',
                    transform: selectedFilter.id === filter.id ? 'scale(1.05)' : 'scale(1)',
                  }}>
                  <span style={{ fontSize: 18 }}>{filter.emoji}</span>
                  <span className="text-[9px] font-bold"
                    style={{ color: selectedFilter.id === filter.id ? 'var(--accent-text)' : 'var(--text-muted)' }}>
                    {filter.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Stickers */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold flex items-center gap-2" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>
                🎭 Stickers
              </h3>
              {placedStickers.length > 0 && (
                <button onClick={() => setPlacedStickers([])}
                  className="text-xs font-bold px-2 py-1 rounded-lg"
                  style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                  Clear all
                </button>
              )}
            </div>
            <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Tap to add · Click sticker on card to remove</p>
            <div className="grid grid-cols-8 gap-1.5">
              {STICKERS.map(emoji => (
                <button key={emoji} onClick={() => addSticker(emoji)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-lg transition-all hover:scale-125"
                  style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Quick randomize */}
          <button
            onClick={() => {
              setSelectedFrame(FRAMES[Math.floor(Math.random() * FRAMES.length)]);
              setSelectedFilter(FILTERS[Math.floor(Math.random() * FILTERS.length)]);
            }}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all w-full"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
            <RefreshCw size={16} /> Randomize Style
          </button>
        </div>
      </div>

      <style>{`
        @keyframes petFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes petGlowAnim { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.1)} }
        @keyframes ringRotate { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes ringRotateReverse { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
      `}</style>
    </div>
  );
}