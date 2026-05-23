'use client';
// components/StreakPet.tsx

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { usePetStore, PET_STAGES } from '@/hooks/usePetStore';
import { Zap, ChevronDown, ChevronUp } from 'lucide-react';

// ─────────────────────────────────────────
// HERO CARD — embed this in dashboard/page.tsx
// import { StreakPetCard } from '@/components/StreakPet'
// <StreakPetCard />
// ─────────────────────────────────────────
export function StreakPetCard() {
  const { xp, getCurrentStage, getXpProgress } = usePetStore();
  const stage = getCurrentStage();
  const progress = getXpProgress();
  const nextStage = PET_STAGES.find((s) => s.minXp > stage.maxXp);
  const stageIndex = PET_STAGES.findIndex((s) => s.stage === stage.stage);

  const [pulse, setPulse] = useState(false);
  const prevXp = useRef(xp);

  useEffect(() => {
    if (xp !== prevXp.current) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 700);
      prevXp.current = xp;
      return () => clearTimeout(t);
    }
  }, [xp]);

  const auraColor = {
    egg:       'rgba(255,230,150,0.2)',
    hatchling: 'rgba(180,230,255,0.2)',
    baby:      'rgba(255,200,150,0.25)',
    child:     'rgba(255,120,80,0.25)',
    teen:      'rgba(150,80,255,0.3)',
    adult:     'rgba(255,160,0,0.35)',
  }[stage.stage];

  const glowColor = {
    egg:       'rgba(255,230,100,0.35)',
    hatchling: 'rgba(120,200,255,0.35)',
    baby:      'rgba(255,180,80,0.35)',
    child:     'rgba(255,100,50,0.45)',
    teen:      'rgba(140,60,255,0.55)',
    adult:     'rgba(255,150,0,0.65)',
  }[stage.stage];

  const barColor = stage.stage === 'adult'
    ? 'linear-gradient(90deg,#f59e0b,#fbbf24,#f59e0b)'
    : stage.stage === 'teen'
    ? 'linear-gradient(90deg,#7c3aed,#a855f7)'
    : 'linear-gradient(90deg, var(--accent), var(--success))';

  const xpChips = [
    { label: 'Task', xp: '+10', icon: '✅' },
    { label: 'Habit', xp: '+15', icon: '🔄' },
    { label: 'Quest', xp: '+50', icon: '🎯' },
  ];

  return (
    <>
      <style>{`
        @keyframes cardHeroFloat {
          0%,100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-10px) scale(1.03); }
        }
        @keyframes cardHeroPulse {
          0%   { transform: scale(1); }
          35%  { transform: scale(1.18) translateY(-6px); }
          65%  { transform: scale(0.94); }
          100% { transform: scale(1); }
        }
        @keyframes cardAuraRotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes cardStageGlow {
          0%,100% { opacity: 0.55; }
          50%      { opacity: 1; }
        }
        @keyframes cardShimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .card-hero-float { animation: cardHeroFloat 4s ease-in-out infinite; }
        .card-hero-pulse { animation: cardHeroPulse 0.7s cubic-bezier(0.34,1.56,0.64,1); }
        .card-shimmer-name {
          background: linear-gradient(90deg,#fbbf24,#f59e0b,#fbbf24,#d97706);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: cardShimmer 2s linear infinite;
        }
      `}</style>

      <div
        className="relative w-full rounded-3xl overflow-hidden"
        style={{
          background: 'var(--bg-card)',
          border: '1.5px solid var(--border)',
          boxShadow: `0 8px 48px ${auraColor}, 0 2px 8px rgba(0,0,0,0.05)`,
        }}
      >
        {/* Aura wash */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 65% 50%, ${auraColor} 0%, transparent 65%)` }}
        />

        <div className="relative flex flex-col sm:flex-row items-center gap-6 p-6 md:p-8">

          {/* ── Pet Image ── */}
          <div className="relative flex-shrink-0 flex items-center justify-center" style={{ width: 160, height: 160 }}>
            {/* Rotating aura ring for teen/adult */}
            {(stage.stage === 'teen' || stage.stage === 'adult') && (
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background: `conic-gradient(${glowColor}, transparent 60%, ${glowColor})`,
                  animation: 'cardAuraRotate 3s linear infinite',
                  filter: 'blur(10px)',
                  opacity: 0.75,
                }}
              />
            )}
            {/* Soft glow */}
            <div
              className="absolute inset-6 rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${glowColor} 0%, transparent 75%)`,
                animation: 'cardStageGlow 2.5s ease-in-out infinite',
              }}
            />
            {/* Pet */}
            <div
              className={pulse ? 'card-hero-pulse' : 'card-hero-float'}
              style={{
                position: 'relative',
                zIndex: 2,
                filter: stage.stage === 'adult'
                  ? 'drop-shadow(0 0 22px rgba(255,160,0,0.85))'
                  : stage.stage === 'teen'
                  ? 'drop-shadow(0 0 18px rgba(140,60,255,0.85))'
                  : 'drop-shadow(0 8px 20px rgba(0,0,0,0.18))',
              }}
            >
              <Image src={stage.image} alt={stage.name} width={148} height={148} className="object-contain" priority />
            </div>
          </div>

          {/* ── Info panel ── */}
          <div className="flex-1 w-full flex flex-col gap-4">

            {/* Name + vibe badge */}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-2xl font-black ${stage.stage === 'adult' ? 'card-shimmer-name' : ''}`}
                  style={{ fontFamily: "'Baloo 2', cursive", color: stage.stage === 'adult' ? undefined : 'var(--text-primary)' }}
                >
                  {stage.name}
                </span>
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                >
                  {stage.vibe}
                </span>
              </div>
              <p className="text-sm mt-1 italic" style={{ color: 'var(--text-muted)' }}>
                "{stage.messages[Math.floor(Math.random() * stage.messages.length)]}"
              </p>
            </div>

            {/* XP row */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Zap size={14} style={{ color: 'var(--accent)' }} />
                  <span className="text-sm font-black" style={{ color: 'var(--text-primary)', fontFamily: "'Baloo 2', cursive" }}>
                    {xp} XP
                  </span>
                </div>
                {stage.stage !== 'adult' && nextStage
                  ? <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{progress.current} / {progress.needed} to {nextStage.name}</span>
                  : <span className="text-xs font-black" style={{ color: '#f59e0b' }}>🔥 MAX LEVEL</span>
                }
              </div>

              {/* Bar */}
              <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${progress.percent}%`,
                    background: barColor,
                    boxShadow: stage.stage === 'adult' ? '0 0 10px rgba(255,180,0,0.7)' : stage.stage === 'teen' ? '0 0 10px rgba(168,85,247,0.6)' : 'none',
                  }}
                />
              </div>
            </div>

            {/* Stage progress dots */}
            <div className="flex items-center gap-1.5">
              {PET_STAGES.map((s, i) => (
                <div
                  key={s.stage}
                  className="relative flex-1 flex flex-col items-center gap-1"
                  title={s.name}
                >
                  <div
                    className="w-full h-1.5 rounded-full transition-all duration-500"
                    style={{
                      backgroundColor: i <= stageIndex
                        ? (stage.stage === 'adult' ? '#f59e0b' : stage.stage === 'teen' ? '#a855f7' : 'var(--accent)')
                        : 'var(--bg-secondary)',
                      opacity: i === stageIndex ? 1 : i < stageIndex ? 0.65 : 0.25,
                    }}
                  />
                  {i === stageIndex && (
                    <div
                      className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2"
                      style={{
                        backgroundColor: stage.stage === 'adult' ? '#f59e0b' : stage.stage === 'teen' ? '#a855f7' : 'var(--accent)',
                        borderColor: 'var(--bg-card)',
                        boxShadow: `0 0 8px ${glowColor}`,
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between -mt-1 px-0.5">
              {PET_STAGES.map((s) => (
                <span
                  key={s.stage}
                  className="flex-1 text-center text-[9px] font-bold truncate"
                  style={{ color: s.stage === stage.stage ? 'var(--text-primary)' : 'var(--text-muted)', opacity: s.stage === stage.stage ? 1 : 0.45 }}
                >
                  {s.stage === 'egg' ? '🥚' : s.stage === 'hatchling' ? '👀' : s.stage === 'baby' ? '😄' : s.stage === 'child' ? '😤' : s.stage === 'teen' ? '😈' : '🔥'}
                </span>
              ))}
            </div>

            {/* XP earn chips */}
            <div className="flex gap-2 flex-wrap">
              {xpChips.map((c) => (
                <div
                  key={c.label}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                >
                  <span>{c.icon}</span>
                  <span>{c.label}</span>
                  <span style={{ color: 'var(--accent)' }}>{c.xp} XP</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────
// FLOATING CORNER WIDGET — lives in DashboardShell
// ─────────────────────────────────────────
export default function StreakPet() {
  const {
    xp,
    currentReaction,
    showEvolutionBanner,
    pendingEvolution,
    getCurrentStage,
    getXpProgress,
    dismissEvolutionBanner,
  } = usePetStore();

  const stage = getCurrentStage();
  const progress = getXpProgress();
  const nextStage = PET_STAGES.find((s) => s.minXp > stage.maxXp);

  const [collapsed, setCollapsed] = useState(false);
  const [bouncing, setBouncing] = useState(false);
  const [evolving, setEvolving] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const prevXp = useRef(xp);

  useEffect(() => {
    if (xp !== prevXp.current) {
      setBouncing(true);
      const t = setTimeout(() => setBouncing(false), 600);
      prevXp.current = xp;
      return () => clearTimeout(t);
    }
  }, [xp]);

  useEffect(() => {
    if (showEvolutionBanner) {
      setEvolving(true);
      const t = setTimeout(() => setEvolving(false), 2000);
      return () => clearTimeout(t);
    }
  }, [showEvolutionBanner]);

  const barColor = stage.stage === 'adult'
    ? 'linear-gradient(90deg,#f59e0b,#fbbf24)'
    : stage.stage === 'teen'
    ? 'linear-gradient(90deg,#7c3aed,#a855f7)'
    : 'linear-gradient(90deg, var(--accent), var(--success))';

  return (
    <>
      {/* ── Evolution Banner ── */}
      {showEvolutionBanner && pendingEvolution && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center px-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(8px)', animation: 'floatFadeInBg 0.3s ease forwards' }}
        >
          <div
            className="relative flex flex-col items-center gap-5 px-10 py-10 rounded-3xl"
            style={{
              background: 'linear-gradient(160deg,#0d0520,#1e0a3c 50%,#0d0520)',
              border: '1.5px solid rgba(180,120,255,0.4)',
              boxShadow: '0 0 100px rgba(150,80,255,0.5), 0 0 200px rgba(255,160,0,0.2)',
              animation: 'floatEvoPop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
              maxWidth: 340, width: '100%',
            }}
          >
            {/* Sparkles */}
            {[...Array(10)].map((_, i) => (
              <div key={i} className="absolute w-1 h-1 rounded-full pointer-events-none"
                style={{
                  backgroundColor: i % 2 === 0 ? '#fbbf24' : '#a78bfa',
                  top: `${10 + Math.random() * 80}%`,
                  left: `${5 + Math.random() * 90}%`,
                  animation: `floatStageGlow ${1 + Math.random()}s ease-in-out infinite`,
                  opacity: 0.8,
                }}
              />
            ))}

            <div className="text-[11px] font-black tracking-[0.3em] uppercase" style={{ color: '#a78bfa' }}>✦ Evolution Unlocked ✦</div>

            <div style={{
              filter: evolving ? 'drop-shadow(0 0 30px rgba(255,180,0,1))' : 'drop-shadow(0 0 15px rgba(255,140,0,0.7))',
              animation: 'cardHeroFloat 2s ease-in-out infinite',
            }}>
              <Image src={pendingEvolution.image} alt={pendingEvolution.name} width={156} height={156} className="object-contain" />
            </div>

            <div className="text-center">
              <div className="text-3xl font-black card-shimmer-name" style={{ fontFamily: "'Baloo 2', cursive" }}>
                {pendingEvolution.name}
              </div>
              <div className="text-sm mt-1" style={{ color: '#c4b5fd' }}>{pendingEvolution.vibe}</div>
            </div>

            <button
              onClick={dismissEvolutionBanner}
              className="px-8 py-3 rounded-2xl text-sm font-black tracking-wide transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: 'white', boxShadow: '0 4px 20px rgba(124,58,237,0.5)' }}
            >
              AMAZING!! 🔥
            </button>
          </div>
        </div>
      )}

      {/* ── Floating Corner ── */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-2 select-none">

        {/* Speech bubble */}
        {currentReaction && !collapsed && (
          <div
            className="relative px-3 py-2 rounded-2xl rounded-br-none text-sm font-semibold shadow-lg"
            style={{
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1.5px solid var(--border-strong)',
              maxWidth: 190,
              animation: 'floatBubblePop 0.3s cubic-bezier(0.34,1.56,0.64,1)',
              lineHeight: 1.4,
            }}
          >
            <span className="mr-1">{currentReaction.emoji}</span>
            {currentReaction.message}
            <span className="absolute -bottom-[9px] right-4 w-0 h-0"
              style={{ borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '10px solid var(--border-strong)' }} />
            <span className="absolute -bottom-[7px] right-[17px] w-0 h-0"
              style={{ borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: '9px solid var(--bg-card)' }} />
          </div>
        )}

        {/* Mini XP card */}
        {!collapsed && (
          <div className="w-[152px] rounded-xl px-3 py-2" style={{ backgroundColor: 'var(--bg-card)', border: '1.5px solid var(--border)' }}>
            <div className="flex justify-between mb-1">
              <span className="text-[11px] font-bold" style={{ color: 'var(--text-primary)', fontFamily: "'Baloo 2', cursive" }}>{stage.name}</span>
              <span className="text-[11px] font-bold" style={{ color: 'var(--text-muted)' }}>{xp} XP</span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress.percent}%`, background: barColor }} />
            </div>
            {stage.stage !== 'adult' && nextStage && (
              <div className="text-[9px] mt-0.5 text-right" style={{ color: 'var(--text-muted)' }}>→ {nextStage.name}</div>
            )}
            {stage.stage === 'adult' && (
              <div className="text-[9px] mt-0.5 text-center font-black" style={{ color: '#f59e0b' }}>🔥 MAX LEVEL</div>
            )}
          </div>
        )}

        {/* Pet button */}
        <div className="relative">
          <button
            onClick={() => setCollapsed(c => !c)}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="block transition-transform active:scale-90"
            style={{
              animation: bouncing ? 'cardHeroPulse 0.6s cubic-bezier(0.34,1.56,0.64,1)' : 'cardHeroFloat 3s ease-in-out infinite',
              filter: stage.stage === 'adult'
                ? 'drop-shadow(0 0 10px rgba(255,160,0,0.75))'
                : stage.stage === 'teen'
                ? 'drop-shadow(0 0 10px rgba(140,60,255,0.75))'
                : 'drop-shadow(0 4px 12px rgba(0,0,0,0.22))',
            }}
          >
            <Image src={stage.image} alt={stage.name} width={collapsed ? 58 : 74} height={collapsed ? 58 : 74} className="object-contain transition-all duration-300" />
            <span
              className="absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center shadow"
              style={{ backgroundColor: 'var(--bg-card)', border: '1.5px solid var(--border)' }}
            >
              {collapsed
                ? <ChevronUp size={11} style={{ color: 'var(--text-muted)' }} />
                : <ChevronDown size={11} style={{ color: 'var(--text-muted)' }} />
              }
            </span>
          </button>
          {showTooltip && collapsed && (
            <div
              className="absolute bottom-full right-0 mb-2 px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap pointer-events-none"
              style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
            >
              {stage.name} • {xp} XP
            </div>
          )}
        </div>
      </div>

      {/* Global keyframes */}
      <style jsx global>{`
        @keyframes cardHeroFloat {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes cardHeroPulse {
          0%   { transform: scale(1); }
          35%  { transform: scale(1.2) translateY(-8px); }
          65%  { transform: scale(0.92); }
          100% { transform: scale(1); }
        }
        @keyframes cardShimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes cardStageGlow {
          0%,100% { opacity: 0.55; }
          50%      { opacity: 1; }
        }
        @keyframes floatFadeInBg {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes floatEvoPop {
          0%   { transform: scale(0.3) rotate(-6deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes floatBubblePop {
          0%   { transform: scale(0.5) translateY(10px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes floatStageGlow {
          0%,100% { opacity: 0.4; }
          50%      { opacity: 1; }
        }
        .card-shimmer-name {
          background: linear-gradient(90deg,#fbbf24,#f59e0b,#fbbf24,#d97706);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: cardShimmer 2s linear infinite;
        }
      `}</style>
    </>
  );
}