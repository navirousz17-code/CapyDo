'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, TrendingUp, RefreshCw, Lock, Zap, Trophy } from 'lucide-react';
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

function getStageForXp(xp: number) {
  return [...PET_STAGES].reverse().find((s) => xp >= s.minXp) ?? PET_STAGES[0];
}

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [data, setData] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/profile/${username}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [username]);

  if (loading) return (
    <div className="min-h-screen parchment-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Image src="/logo.png" alt="TODEI-LIST" width={60} height={60} className="rounded-xl animate-float" />
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
  const rankProgress = nextRank
    ? ((xp - currentRank.xp) / (nextRank.xp - currentRank.xp)) * 100
    : 100;

  const earnedBadges = BADGE_DEFINITIONS.filter((b) => (stats.badges ?? []).includes(b.id));

  const glowColor = {
    egg:       'rgba(255,230,100,0.3)',
    hatchling: 'rgba(120,200,255,0.3)',
    baby:      'rgba(255,180,80,0.3)',
    child:     'rgba(255,100,50,0.4)',
    teen:      'rgba(140,60,255,0.5)',
    adult:     'rgba(255,150,0,0.6)',
  }[petStage.stage];

  return (
    <div className="min-h-screen parchment-bg flex flex-col items-center py-12 px-6">
      <style>{`
        @keyframes petFloat { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
        @keyframes petGlow  { 0%,100% { opacity:0.4; } 50% { opacity:0.9; } }
      `}</style>

      {/* Nav */}
      <div className="w-full max-w-lg mb-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="TODEI-LIST" width={36} height={36} className="rounded-lg" />
          <span className="font-extrabold text-bark-600" style={{ fontFamily: "'Baloo 2', cursive" }}>TODEI-LIST</span>
        </Link>
        <Link href="/auth/signup" className="btn-primary text-sm">Join Free</Link>
      </div>

      <div className="w-full max-w-lg flex flex-col gap-4">

        {/* Profile header */}
        <div className="card text-center animate-bounce-in">
          {profile.avatar_url ? (
            <Image src={profile.avatar_url} alt={displayName} width={80} height={80}
              className="rounded-2xl object-cover mx-auto mb-4" style={{ width: 80, height: 80 }} />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-moss-300 to-moss-400 flex items-center justify-center text-white text-3xl font-bold shadow-bark mx-auto mb-4">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="text-2xl font-extrabold text-bark-600 mb-1" style={{ fontFamily: "'Baloo 2', cursive" }}>
            {displayName}
          </h1>
          <p className="text-bark-400 text-sm font-semibold mb-1">@{profile.username}</p>
          <p className="text-bark-400 text-xs font-medium mb-3">Member since {joinedYear}</p>

          {/* Rank pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3"
            style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a' }}>
            <Image src={currentRank.image} alt={currentRank.label} width={16} height={16} className="object-contain" />
            <span className="text-xs font-extrabold text-amber-700">{currentRank.label}</span>
            <span className="text-xs font-bold text-amber-500">{xp} XP</span>
          </div>

          {profile.bio && (
            <p className="text-bark-500 font-medium text-sm bg-cream-50 rounded-xl px-4 py-3 border border-cream-200">
              {profile.bio}
            </p>
          )}
        </div>

        {/* Pet showcase */}
        <div className="card flex items-center gap-5 animate-slide-up"
          style={{ boxShadow: `0 4px 30px ${glowColor}` }}>
          <div className="relative flex-shrink-0 flex items-center justify-center" style={{ width: 90, height: 90 }}>
            <div className="absolute inset-0 rounded-full"
              style={{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`, animation: 'petGlow 2.5s ease-in-out infinite' }} />
            <Image src={petStage.image} alt={petStage.name} width={82} height={82}
              className="object-contain relative z-10"
              style={{
                filter: petStage.stage === 'adult'
                  ? 'drop-shadow(0 0 16px rgba(255,160,0,0.8))'
                  : petStage.stage === 'teen'
                  ? 'drop-shadow(0 0 14px rgba(140,60,255,0.8))'
                  : 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))',
                animation: 'petFloat 3s ease-in-out infinite',
              }} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>Pet Companion</p>
            <p className="text-lg font-extrabold text-bark-600" style={{ fontFamily: "'Baloo 2', cursive" }}>{petStage.name}</p>
            <p className="text-xs font-semibold text-bark-400 mb-2">{petStage.vibe}</p>
            <div className="flex items-center gap-1.5 mb-1">
              <Zap size={11} className="text-amber-500" />
              <span className="text-xs font-bold text-bark-500">{petXp} XP</span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden bg-cream-200">
              <div className="h-full rounded-full"
                style={{
                  width: `${Math.min(((petXp - petStage.minXp) / Math.max(petStage.maxXp - petStage.minXp, 1)) * 100, 100)}%`,
                  background: petStage.stage === 'adult'
                    ? 'linear-gradient(90deg,#f59e0b,#fbbf24)'
                    : petStage.stage === 'teen'
                    ? 'linear-gradient(90deg,#7c3aed,#a855f7)'
                    : 'linear-gradient(90deg,#5aa352,#82c97a)',
                }} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card text-center card-lift bg-moss-50 border-moss-200">
            <div className="text-3xl font-extrabold text-moss-600 mb-1" style={{ fontFamily: "'Baloo 2', cursive" }}>
              {stats.completed}
            </div>
            <div className="flex items-center justify-center gap-1 text-xs font-semibold text-bark-400">
              <CheckCircle2 size={12} /> Tasks Completed
            </div>
          </div>
          <div className="card text-center card-lift bg-cream-100 border-cream-300">
            <div className="text-3xl font-extrabold text-bark-600 mb-1" style={{ fontFamily: "'Baloo 2', cursive" }}>
              {stats.completionRate}%
            </div>
            <div className="flex items-center justify-center gap-1 text-xs font-semibold text-bark-400">
              <TrendingUp size={12} /> Completion Rate
            </div>
          </div>
          <div className="card text-center card-lift bg-amber-50 border-amber-100 col-span-2">
            <div className="text-3xl font-extrabold text-amber-600 mb-1" style={{ fontFamily: "'Baloo 2', cursive" }}>
              {stats.habitCount}
            </div>
            <div className="flex items-center justify-center gap-1 text-xs font-semibold text-bark-400">
              <RefreshCw size={12} /> Daily Habits Tracked
            </div>
          </div>
        </div>

        {/* Rank progress */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={15} className="text-amber-500" />
            <h2 className="font-extrabold text-bark-600" style={{ fontFamily: "'Baloo 2', cursive" }}>Rank</h2>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <Image src={currentRank.image} alt={currentRank.label} width={36} height={36} className="object-contain" />
            <div className="flex-1">
              <p className="font-bold text-sm text-bark-600">{currentRank.label}</p>
              <p className="text-xs text-bark-400">{xp} XP earned</p>
            </div>
            {nextRank && (
              <Image src={nextRank.image} alt={nextRank.label} width={36} height={36} className="object-contain opacity-30" />
            )}
          </div>
          <div className="h-2.5 rounded-full overflow-hidden bg-cream-200">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${rankProgress}%`, background: 'linear-gradient(90deg,#5aa352,#82c97a)' }} />
          </div>
          {nextRank && (
            <p className="text-xs mt-1 text-right font-semibold text-bark-400">
              {nextRank.xp - xp} XP to {nextRank.label}
            </p>
          )}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-cream-200">
            {XP_MILESTONES.map((m) => (
              <div key={m.label} className="flex flex-col items-center gap-0.5">
                <Image src={m.image} alt={m.label} width={24} height={24} className="object-contain"
                  style={{ opacity: xp >= m.xp ? 1 : 0.25 }} />
                <span className="text-[8px] font-bold text-bark-400">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Badges */}
        {earnedBadges.length > 0 && (
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <span>🏆</span>
              <h2 className="font-extrabold text-bark-600" style={{ fontFamily: "'Baloo 2', cursive" }}>
                Badges <span className="text-sm text-bark-400 font-semibold">({earnedBadges.length})</span>
              </h2>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {BADGE_DEFINITIONS.map((badge) => {
                const earned = (stats.badges ?? []).includes(badge.id);
                const rarity = RARITY_COLORS[badge.rarity];
                return (
                  <div key={badge.id}
                    className="flex flex-col items-center gap-1 p-2 rounded-2xl transition-all"
                    style={{
                      backgroundColor: earned ? rarity.bg : '#f5f0e8',
                      border: earned ? `1.5px solid ${rarity.border}` : '1.5px solid transparent',
                      opacity: earned ? 1 : 0.3,
                      filter: earned ? 'none' : 'grayscale(1)',
                    }}
                    title={badge.name}
                  >
                    <Image src={badge.image} alt={badge.name} width={44} height={44} className="object-contain" />
                    <span className="text-[9px] font-bold text-center leading-tight"
                      style={{ color: earned ? rarity.text : '#a0927a' }}>
                      {badge.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Progress ring */}
        <div className="card flex items-center gap-6">
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#faf2d3" strokeWidth="12" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#5aa352" strokeWidth="12"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - stats.completionRate / 100)}`}
                strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-extrabold text-bark-600">{stats.completionRate}%</span>
            </div>
          </div>
          <div>
            <p className="font-extrabold text-bark-600 mb-1" style={{ fontFamily: "'Baloo 2', cursive" }}>Overall Progress</p>
            <p className="text-sm text-bark-400 font-medium">{stats.completed} of {stats.total} tasks completed</p>
            <p className="text-xs text-bark-400 font-medium mt-0.5">
              Tracking {stats.habitCount} daily habit{stats.habitCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="card text-center bg-gradient-to-br from-moss-50 to-cream-100 border-moss-200">
          <p className="font-bold text-bark-500 mb-3 text-sm">Want to track your own productivity?</p>
          <Link href="/auth/signup" className="btn-primary inline-flex items-center gap-2">
            🌿 Join TODEI-LIST Free
          </Link>
        </div>
      </div>
    </div>
  );
}