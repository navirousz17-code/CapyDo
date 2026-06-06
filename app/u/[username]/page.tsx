'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, TrendingUp, RefreshCw, Lock, Zap, Trophy, Star, Flame, MessageCircle } from 'lucide-react';
import { BADGE_DEFINITIONS, RARITY_COLORS } from '@/lib/badges';
import { PET_STAGES } from '@/hooks/usePetStore';

interface PublicProfile {
  profile: {
    full_name: string | null;
    username: string;
    bio: string | null;
    avatar_url: string | null;
    created_at: string;
  };
  stats: {
    total: number;
    completed: number;
    completionRate: number;
    habitCount: number;
    badges?: string[];
    xp?: number;
    petXp?: number;
    currentStreak?: number;
  };
}

const XP_MILESTONES = [
  { xp: 50,   label: 'Seedling',  image: '/rank_seedling.png'  },
  { xp: 150,  label: 'Sprout',    image: '/rank_sprout.png'    },
  { xp: 300,  label: 'Sapling',   image: '/rank_sapling.png'   },
  { xp: 500,  label: 'Explorer',  image: '/rank_explorer.png'  },
  { xp: 750,  label: 'Champion',  image: '/rank_champion.png'  },
  { xp: 1000, label: 'Legend',    image: '/rank_legend.png'    },
];

// Accessories unlocked by XP
const ACCESSORIES = [
  { id: 'bow',     image: '/acc-bow.png',     label: 'Bow',     requiredXp: 0,    position: { top: '-18px', left: '50%', transform: 'translateX(-50%)' } },
  { id: 'glasses', image: '/acc-glasses.png', label: 'Glasses', requiredXp: 150,  position: { top: '30px',  left: '50%', transform: 'translateX(-60%)' } },
  { id: 'hat',     image: '/acc-hat.png',     label: 'Hat',     requiredXp: 300,  position: { top: '-24px', left: '50%', transform: 'translateX(-50%)' } },
  { id: 'halo',    image: '/acc-halo.png',    label: 'Halo',    requiredXp: 500,  position: { top: '-28px', left: '50%', transform: 'translateX(-50%)' } },
  { id: 'crown',   image: '/acc-crown.png',   label: 'Crown',   requiredXp: 750,  position: { top: '-26px', left: '50%', transform: 'translateX(-50%)' } },
  { id: 'wings',   image: '/acc-wings.png',   label: 'Wings',   requiredXp: 1000, position: { top: '20px',  left: '-20px' } },
];

// Titles earned from XP/badges
const TITLES = [
  { label: '🌱 Seedling',       requiredXp: 0    },
  { label: '✨ Rising Star',     requiredXp: 150  },
  { label: '🎯 Task Hunter',     requiredXp: 300  },
  { label: '⚡ Productivity Pro', requiredXp: 500 },
  { label: '🏆 Champion',        requiredXp: 750  },
  { label: '👑 LEGEND',          requiredXp: 1000 },
];

// Banner gradient themes based on rank
const BANNER_THEMES = [
  { gradient: 'linear-gradient(135deg, #d4edcc 0%, #a8d5a0 50%, #7dc47a 100%)', accent: '#2c5f28' },
  { gradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #f59e0b 100%)', accent: '#92400e' },
  { gradient: 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 50%, #3b82f6 100%)', accent: '#1e40af' },
  { gradient: 'linear-gradient(135deg, #fce7f3 0%, #f9a8d4 50%, #ec4899 100%)', accent: '#9d174d' },
  { gradient: 'linear-gradient(135deg, #ede9fe 0%, #c4b5fd 50%, #7c3aed 100%)', accent: '#4c1d95' },
  { gradient: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 30%, #f59e0b 60%, #ef4444 100%)', accent: '#7f1d1d' },
];

function getStageForXp(xp: number) {
  return [...PET_STAGES].reverse().find((s) => xp >= s.minXp) ?? PET_STAGES[0];
}

function getTitle(xp: number) {
  return [...TITLES].reverse().find(t => xp >= t.requiredXp) ?? TITLES[0];
}

function getBannerTheme(xp: number) {
  const idx = Math.min(Math.floor(xp / 200), BANNER_THEMES.length - 1);
  return BANNER_THEMES[idx];
}

function getActiveAccessory(xp: number) {
  return [...ACCESSORIES].reverse().find(a => xp >= a.requiredXp) ?? ACCESSORIES[0];
}

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [data, setData] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'pet'>('overview');
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/profile/${username}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [username]);

  if (loading) return (
    <div className="min-h-screen parchment-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Image src="/logo.png" alt="CapyDo" width={60} height={60} className="rounded-xl animate-float" />
        <div className="flex gap-1">
          {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-bark-400 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
        </div>
      </div>
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen parchment-bg flex flex-col items-center justify-center text-center px-6">
      <Lock size={48} className="text-bark-300 mb-4" />
      <h1 className="text-2xl font-extrabold text-bark-600 mb-2" style={{ fontFamily: "'Baloo 2', cursive" }}>
        Profile not found
      </h1>
      <p className="text-bark-400 font-medium mb-6">This profile doesn't exist or isn't public.</p>
      <Link href="/" className="btn-primary">Go Home</Link>
    </div>
  );

  const { profile, stats } = data!;
  const displayName = profile.full_name || `@${profile.username}`;
  const joinedYear = new Date(profile.created_at).getFullYear();
  const xp = stats.xp ?? stats.completed * 20;
  const petXp = stats.petXp ?? xp;
  const petStage = getStageForXp(petXp);
  const currentRank = XP_MILESTONES.filter((m) => xp >= m.xp).pop() ?? XP_MILESTONES[0];
  const nextRank = XP_MILESTONES.find((m) => xp < m.xp);
  const rankProgress = nextRank ? ((xp - currentRank.xp) / (nextRank.xp - currentRank.xp)) * 100 : 100;
  const earnedBadges = BADGE_DEFINITIONS.filter((b) => (stats.badges ?? []).includes(b.id));
  const rareBadges = earnedBadges.filter(b => b.rarity === 'legendary' || b.rarity === 'epic');
  const title = getTitle(xp);
  const banner = getBannerTheme(xp);
  const activeAccessory = getActiveAccessory(petXp);

  const glowColor = {
    egg:       'rgba(255,230,100,0.4)',
    hatchling: 'rgba(120,200,255,0.4)',
    baby:      'rgba(255,180,80,0.4)',
    child:     'rgba(255,100,50,0.5)',
    teen:      'rgba(140,60,255,0.6)',
    adult:     'rgba(255,150,0,0.7)',
  }[petStage.stage];

  const petFilter = petStage.stage === 'adult'
    ? 'drop-shadow(0 0 20px rgba(255,160,0,0.9))'
    : petStage.stage === 'teen'
    ? 'drop-shadow(0 0 18px rgba(140,60,255,0.9))'
    : 'drop-shadow(0 6px 16px rgba(0,0,0,0.25))';

  return (
    <div className="min-h-screen parchment-bg">
      <style>{`
        @keyframes petFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes petGlow  { 0%,100%{opacity:0.3;transform:scale(1)} 50%{opacity:0.8;transform:scale(1.05)} }
        @keyframes shimmer  { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes badgePop { 0%{transform:scale(1)} 50%{transform:scale(1.15)} 100%{transform:scale(1)} }
        @keyframes floatAcc { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(-4px)} }
        .shimmer-text {
          background: linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 2s linear infinite;
        }
      `}</style>

      {/* Nav */}
      <div className="w-full px-6 py-4 flex items-center justify-between max-w-2xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="CapyDo" width={36} height={36} className="rounded-lg" />
          <span className="font-extrabold text-bark-600" style={{ fontFamily: "'Baloo 2', cursive" }}>capydo.app</span>
        </Link>
        <Link href="/auth/signup" className="btn-primary text-sm">Join Free</Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-16">

        {/* ── BANNER + AVATAR HERO ── */}
        <div className="relative mb-16 animate-bounce-in">
          {/* Banner */}
          <div className="w-full h-44 rounded-3xl overflow-hidden relative"
            style={{ background: banner.gradient, boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
            {/* Decorative circles on banner */}
            <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ position: 'absolute', bottom: -20, left: 40, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
            {/* Rank badge on banner */}
            <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}>
              <Image src={currentRank.image} alt={currentRank.label} width={18} height={18} className="object-contain" />
              <span className="text-xs font-extrabold" style={{ color: 'white' }}>{currentRank.label}</span>
            </div>
            {/* Rare badge spotlight on banner */}
            {rareBadges.length > 0 && (
              <div className="absolute bottom-4 right-4 flex gap-2">
                {rareBadges.slice(0, 3).map(b => (
                  <div key={b.id} className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.4)' }}>
                    <Image src={b.image} alt={b.name} width={28} height={28} className="object-contain" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Avatar — overlapping the banner */}
          <div className="absolute -bottom-12 left-6">
            <div className="relative">
              {/* Avatar ring glow */}
              <div className="absolute inset-0 rounded-2xl"
                style={{ background: banner.gradient, filter: 'blur(8px)', opacity: 0.6, transform: 'scale(1.1)' }} />
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden"
                style={{ border: '3px solid white', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                {profile.avatar_url ? (
                  <Image src={profile.avatar_url} alt={displayName} width={96} height={96}
                    className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold"
                    style={{ background: banner.gradient }}>
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Title pill — bottom right of banner overlap */}
          <div className="absolute -bottom-5 right-4">
            <div className="px-3 py-1.5 rounded-full text-xs font-extrabold"
              style={{ background: banner.gradient, color: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', letterSpacing: '0.05em' }}>
              {title.label}
            </div>
          </div>
        </div>

        {/* Name + bio */}
        <div className="px-2 mb-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold text-bark-600" style={{ fontFamily: "'Baloo 2', cursive" }}>
                {displayName}
              </h1>
              <p className="text-bark-400 text-sm font-semibold">@{profile.username} · member since {joinedYear}</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl flex-shrink-0"
              style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a' }}>
              <Zap size={12} className="text-amber-500" />
              <span className="text-xs font-extrabold text-amber-700">{xp} XP</span>
            </div>
          </div>
          {profile.bio && (
            <p className="text-bark-500 font-medium text-sm mt-3 px-4 py-3 rounded-2xl"
              style={{ backgroundColor: '#fefdf8', border: '1px solid #faf2d3' }}>
              {profile.bio}
            </p>
          )}
        </div>

        {/* Quick stats strip */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {[
            { value: stats.completed, label: 'Done',     icon: <CheckCircle2 size={14} />, color: '#5aa352', bg: 'rgba(90,163,82,0.08)'  },
            { value: `${stats.completionRate}%`, label: 'Rate', icon: <TrendingUp size={14} />,  color: '#0369a1', bg: 'rgba(3,105,161,0.08)'  },
            { value: stats.habitCount, label: 'Habits',  icon: <RefreshCw size={14} />,    color: '#d97706', bg: 'rgba(217,119,6,0.08)'  },
            { value: earnedBadges.length, label: 'Badges', icon: <Trophy size={14} />,      color: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-3 text-center"
              style={{ backgroundColor: s.bg, border: `1px solid ${s.color}30` }}>
              <div className="flex justify-center mb-1" style={{ color: s.color }}>{s.icon}</div>
              <div className="text-lg font-extrabold text-bark-600" style={{ fontFamily: "'Baloo 2', cursive" }}>{s.value}</div>
              <div className="text-[10px] font-bold text-bark-400">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 rounded-2xl mb-5"
          style={{ backgroundColor: '#fdf9ed', border: '1px solid #faf2d3' }}>
          {([
            { key: 'overview', label: '📊 Overview' },
            { key: 'pet',      label: '🐣 Pet'      },
            { key: 'badges',   label: '🏆 Badges'   },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={activeTab === t.key
                ? { backgroundColor: 'white', color: '#5c4022', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
                : { color: '#a67640' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {/* Progress ring + stats */}
            <div className="card">
              <div className="flex items-center gap-6">
                <div className="relative w-28 h-28 flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#faf2d3" strokeWidth="10" />
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#5aa352" strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 38}`}
                      strokeDashoffset={`${2 * Math.PI * 38 * (1 - stats.completionRate / 100)}`} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-extrabold text-bark-600" style={{ fontFamily: "'Baloo 2', cursive" }}>
                      {stats.completionRate}%
                    </span>
                    <span className="text-[9px] font-bold text-bark-400">complete</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-extrabold text-bark-600 text-lg mb-1" style={{ fontFamily: "'Baloo 2', cursive" }}>Overall Progress</p>
                  <p className="text-sm text-bark-400 font-medium">{stats.completed} of {stats.total} tasks done</p>
                  <p className="text-xs text-bark-400 mt-0.5">{stats.habitCount} daily habits tracked</p>
                  {(stats.currentStreak ?? 0) > 0 && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <Flame size={14} className="text-orange-500" />
                      <span className="text-xs font-extrabold text-orange-600">{stats.currentStreak} day streak!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Rank progress */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Trophy size={16} className="text-amber-500" />
                <h2 className="font-extrabold text-bark-600" style={{ fontFamily: "'Baloo 2', cursive" }}>Rank Progress</h2>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <Image src={currentRank.image} alt={currentRank.label} width={44} height={44} className="object-contain" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-extrabold text-bark-600">{currentRank.label}</p>
                    {nextRank && <p className="text-xs text-bark-400">{nextRank.xp - xp} XP to go</p>}
                  </div>
                  <div className="h-3 rounded-full overflow-hidden bg-cream-200">
                    <div className="h-full rounded-full transition-all duration-1000 relative overflow-hidden"
                      style={{ width: `${rankProgress}%`, background: banner.gradient }}>
                      <div className="absolute inset-0 opacity-30"
                        style={{ background: 'linear-gradient(90deg, transparent, white, transparent)', animation: 'shimmer 2s linear infinite', backgroundSize: '200% auto' }} />
                    </div>
                  </div>
                </div>
                {nextRank && (
                  <Image src={nextRank.image} alt={nextRank.label} width={44} height={44} className="object-contain opacity-25" />
                )}
              </div>
              {/* All rank milestones */}
              <div className="flex items-end justify-between pt-3 border-t border-cream-200">
                {XP_MILESTONES.map((m) => (
                  <div key={m.label} className="flex flex-col items-center gap-1">
                    <div className="relative">
                      <Image src={m.image} alt={m.label} width={28} height={28} className="object-contain transition-all"
                        style={{ opacity: xp >= m.xp ? 1 : 0.2, filter: xp >= m.xp ? 'none' : 'grayscale(1)' }} />
                      {xp >= m.xp && m.xp === currentRank.xp && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-moss-400 border-2 border-white" />
                      )}
                    </div>
                    <span className="text-[8px] font-bold text-bark-400" style={{ opacity: xp >= m.xp ? 1 : 0.4 }}>{m.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rare badges spotlight */}
            {rareBadges.length > 0 && (
              <div className="card"
                style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)', border: '1.5px solid #fde68a' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Star size={16} className="text-amber-500" />
                  <h2 className="font-extrabold text-amber-700" style={{ fontFamily: "'Baloo 2', cursive" }}>
                    Rare Badges
                  </h2>
                </div>
                <div className="flex gap-3 flex-wrap">
                  {rareBadges.map(b => {
                    const rarity = RARITY_COLORS[b.rarity];
                    return (
                      <div key={b.id} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl"
                        style={{ backgroundColor: rarity.bg, border: `2px solid ${rarity.border}`, minWidth: 72 }}>
                        <Image src={b.image} alt={b.name} width={48} height={48} className="object-contain" />
                        <span className="text-[9px] font-extrabold text-center" style={{ color: rarity.text }}>{b.name}</span>
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full capitalize"
                          style={{ backgroundColor: rarity.border + '40', color: rarity.text }}>{b.rarity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PET TAB ── */}
        {activeTab === 'pet' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {/* Big pet showcase */}
            <div className="card text-center py-8"
              style={{ background: `radial-gradient(circle at 50% 60%, ${glowColor} 0%, transparent 70%), linear-gradient(135deg, #fefdf8, #fdf9ed)` }}>
              <p className="text-xs font-extrabold uppercase tracking-widest mb-6" style={{ color: '#a67640' }}>
                Pet Companion
              </p>

              {/* Pet with accessory */}
              <div className="relative inline-block mb-6">
                {/* Glow rings */}
                <div className="absolute inset-0 rounded-full"
                  style={{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 65%)`, animation: 'petGlow 2.5s ease-in-out infinite', transform: 'scale(1.5)' }} />

                {/* Accessory overlay */}
                <div className="relative" style={{ width: 160, height: 160 }}>
                  <Image src={petStage.image} alt={petStage.name} width={160} height={160}
                    className="object-contain relative z-10"
                    style={{ filter: petFilter, animation: 'petFloat 3s ease-in-out infinite' }} />
                  {/* Active accessory */}
                  <Image src={activeAccessory.image} alt={activeAccessory.label}
                    width={52} height={52}
                    style={{
                      position: 'absolute',
                      ...activeAccessory.position,
                      objectFit: 'contain',
                      zIndex: 20,
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                      animation: 'floatAcc 2s ease-in-out infinite',
                    }} />
                </div>
              </div>

              <h2 className="text-2xl font-extrabold text-bark-600 mb-1" style={{ fontFamily: "'Baloo 2', cursive" }}>
                {petStage.name}
              </h2>
              <p className="text-sm font-semibold text-bark-400 mb-4">{petStage.vibe}</p>

              {/* XP bar */}
              <div className="max-w-xs mx-auto">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-bark-500 flex items-center gap-1">
                    <Zap size={11} className="text-amber-500" /> {petXp} XP
                  </span>
                  <span className="text-xs font-bold text-bark-400">{petStage.maxXp === Infinity ? 'MAX' : `${petStage.maxXp} XP`}</span>
                </div>
                <div className="h-3 rounded-full overflow-hidden bg-cream-200">
                  <div className="h-full rounded-full"
                    style={{
                      width: `${Math.min(((petXp - petStage.minXp) / Math.max(petStage.maxXp - petStage.minXp, 1)) * 100, 100)}%`,
                      background: petStage.stage === 'adult' ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' : petStage.stage === 'teen' ? 'linear-gradient(90deg,#7c3aed,#a855f7)' : 'linear-gradient(90deg,#5aa352,#82c97a)',
                    }} />
                </div>
              </div>
            </div>

            {/* Accessories showcase */}
            <div className="card">
              <h3 className="font-extrabold text-bark-600 mb-4" style={{ fontFamily: "'Baloo 2', cursive" }}>
                Accessories
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {ACCESSORIES.map(acc => {
                  const unlocked = petXp >= acc.requiredXp;
                  const isActive = activeAccessory.id === acc.id;
                  return (
                    <div key={acc.id} className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all"
                      style={{
                        backgroundColor: isActive ? 'rgba(90,163,82,0.1)' : unlocked ? '#fefdf8' : '#f5f0e8',
                        border: isActive ? '2px solid #5aa352' : unlocked ? '1.5px solid #faf2d3' : '1.5px dashed #e0d5c0',
                        opacity: unlocked ? 1 : 0.5,
                      }}>
                      <Image src={acc.image} alt={acc.label} width={40} height={40}
                        className="object-contain"
                        style={{ filter: unlocked ? 'none' : 'grayscale(1)' }} />
                      <span className="text-[10px] font-bold text-bark-500">{acc.label}</span>
                      {unlocked ? (
                        isActive && <span className="text-[9px] font-extrabold text-moss-500 bg-moss-50 px-1.5 py-0.5 rounded-full">Active</span>
                      ) : (
                        <span className="text-[9px] font-bold text-bark-400">{acc.requiredXp} XP</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-bark-400 font-medium mt-3 text-center">
                Accessories unlock automatically as your pet gains XP ✨
              </p>
            </div>
          </div>
        )}

        {/* ── BADGES TAB ── */}
        {activeTab === 'badges' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {/* Earned count */}
            <div className="flex items-center justify-between px-1">
              <p className="font-extrabold text-bark-600" style={{ fontFamily: "'Baloo 2', cursive" }}>
                {earnedBadges.length} / {BADGE_DEFINITIONS.length} badges earned
              </p>
              <div className="h-2 rounded-full overflow-hidden bg-cream-200 w-32">
                <div className="h-full rounded-full bg-amber-400"
                  style={{ width: `${(earnedBadges.length / BADGE_DEFINITIONS.length) * 100}%` }} />
              </div>
            </div>

            {/* Badge grid */}
            <div className="card">
              <div className="grid grid-cols-4 gap-3">
                {BADGE_DEFINITIONS.map((badge) => {
                  const earned = (stats.badges ?? []).includes(badge.id);
                  const rarity = RARITY_COLORS[badge.rarity];
                  const isHovered = hoveredBadge === badge.id;
                  return (
                    <div key={badge.id}
                      onMouseEnter={() => setHoveredBadge(badge.id)}
                      onMouseLeave={() => setHoveredBadge(null)}
                      className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl transition-all cursor-default relative"
                      style={{
                        backgroundColor: earned ? rarity.bg : '#f5f0e8',
                        border: earned ? `2px solid ${rarity.border}` : '1.5px solid transparent',
                        opacity: earned ? 1 : 0.3,
                        filter: earned ? 'none' : 'grayscale(1)',
                        transform: isHovered && earned ? 'scale(1.08)' : 'scale(1)',
                        boxShadow: isHovered && earned ? `0 8px 24px ${rarity.border}60` : 'none',
                      }}>
                      <Image src={badge.image} alt={badge.name} width={46} height={46} className="object-contain" />
                      <span className="text-[9px] font-bold text-center leading-tight"
                        style={{ color: earned ? rarity.text : '#a0927a' }}>
                        {badge.name}
                      </span>
                      {earned && (
                        <span className="text-[8px] font-extrabold capitalize px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: rarity.border + '40', color: rarity.text }}>
                          {badge.rarity}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="card text-center mt-4"
          style={{ background: 'linear-gradient(135deg, #f0f7ee, #fefdf8)', border: '1.5px solid #b8ddb0' }}>
          <p className="font-bold text-bark-500 mb-3 text-sm">Want your own profile like this?</p>
          <Link href="/auth/signup" className="btn-primary inline-flex items-center gap-2">
            <Image src="/icon-leaf-footer.png" alt="" width={16} height={16} className="object-contain" />
            🦫 Join CapyDo Free
          </Link>
        </div>
      </div>
    </div>
  );
}