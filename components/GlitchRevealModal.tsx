'use client';
// components/GlitchRevealModal.tsx

import { useEffect, useState } from 'react';
import { usePetStore, PET_STAGES } from '@/hooks/usePetStore';
import { Zap, Trophy, Flame, Star, Shield, Target } from 'lucide-react';

interface GlitchRevealModalProps {
  title: string;
  subtitle?: string;
  image?: string;
  ctaLabel?: string;
  onEnter: () => void;
  onClose: () => void;
}

const STAGE_BG: Record<string, string> = {
  egg: '/bg_egg.png', hatchling: '/bg_hatchling.png', baby: '/bg_baby.png',
  child: '/bg_child.png', teen: '/bg_teen.png', adult: '/bg_adult.png',
};

const STAGE_THEME: Record<string, { primary: string; secondary: string; glow: string; bar: string; titleColor: string }> = {
  egg:       { primary: '#fbbf24', secondary: '#f59e0b', glow: 'rgba(251,191,36,0.6)',  bar: 'linear-gradient(90deg,#f59e0b,#fbbf24)',          titleColor: '#ffffff' },
  hatchling: { primary: '#60a5fa', secondary: '#3b82f6', glow: 'rgba(96,165,250,0.6)', bar: 'linear-gradient(90deg,#3b82f6,#60a5fa)',            titleColor: '#ffffff' },
  baby:      { primary: '#fb923c', secondary: '#f97316', glow: 'rgba(251,146,60,0.6)', bar: 'linear-gradient(90deg,#f97316,#fb923c)',            titleColor: '#ffffff' },
  child:     { primary: '#f87171', secondary: '#ef4444', glow: 'rgba(248,113,113,0.7)',bar: 'linear-gradient(90deg,#ef4444,#f87171)',            titleColor: '#ffffff' },
  teen:      { primary: '#c084fc', secondary: '#a855f7', glow: 'rgba(192,132,252,0.8)',bar: 'linear-gradient(90deg,#7c3aed,#a855f7,#c084fc)',   titleColor: '#ffffff' },
  adult:     { primary: '#f97316', secondary: '#a855f7', glow: 'rgba(249,115,22,0.5)', bar: 'linear-gradient(90deg,#a855f7,#f97316,#fbbf24)',   titleColor: '#ffffff' },
};

export default function GlitchRevealModal({
  title, subtitle, image, ctaLabel = 'CONTINUE', onEnter, onClose,
}: GlitchRevealModalProps) {
  const [glitching, setGlitching] = useState(false);
  const [visible, setVisible] = useState(false);
  const { xp, getCurrentStage, getXpProgress } = usePetStore();

  const stage = getCurrentStage();
  const progress = getXpProgress();
  const nextStage = PET_STAGES.find(s => s.minXp > stage.maxXp);
  const stageIndex = PET_STAGES.findIndex(s => s.stage === stage.stage);
  const t = STAGE_THEME[stage.stage] ?? STAGE_THEME.egg;
  const stageBg = STAGE_BG[stage.stage] ?? STAGE_BG.egg;
  const isAdult = stage.stage === 'adult';

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const gi = setInterval(() => { setGlitching(true); setTimeout(() => setGlitching(false), 160); }, 3000);
    return () => clearInterval(gi);
  }, []);

  const quote = stage.messages[Math.floor(Date.now() / 1000) % stage.messages.length];

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 250ms ease-out' }}
      onClick={onClose}>

      {/* ── BACKGROUND ── */}
      <div className="absolute inset-0">
        <img src={stageBg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: isAdult ? 'right center' : 'center' }} />
        {/* Only left-side gradient — no orange tint on character */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.75) 38%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.05) 100%)' }} />
        {/* Bottom fade */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 35%)' }} />
        {/* Top fade */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 25%)' }} />
        {/* Subtle scanlines */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.03) 3px, rgba(0,0,0,0.03) 4px)', pointerEvents: 'none' }} />
      </div>

      {/* Frame corners */}
      {[
        { top: 16, left: 16, borderTop: `2px solid ${t.primary}cc`, borderLeft: `2px solid ${t.primary}cc` },
        { top: 16, right: 16, borderTop: `2px solid ${t.primary}cc`, borderRight: `2px solid ${t.primary}cc` },
        { bottom: 16, left: 16, borderBottom: `2px solid ${t.primary}cc`, borderLeft: `2px solid ${t.primary}cc` },
        { bottom: 16, right: 16, borderBottom: `2px solid ${t.primary}cc`, borderRight: `2px solid ${t.primary}cc` },
      ].map((s, i) => <div key={i} style={{ position: 'absolute', width: 32, height: 32, pointerEvents: 'none', ...s }} />)}

      {/* Outer border */}
      <div style={{ position: 'absolute', inset: 12, borderRadius: 12, border: `1px solid ${t.primary}30`, pointerEvents: 'none' }} />

      {/* ── LEFT CONTENT PANEL ── */}
      <div className="absolute inset-0 flex items-center" onClick={e => e.stopPropagation()}>
        <div style={{
          width: '100%', maxWidth: 480, height: '100%',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '40px 48px',
          transform: visible ? 'translateX(0)' : 'translateX(-24px)',
          transition: 'transform 400ms cubic-bezier(0.16,1,0.3,1)',
        }}>

          {/* Top label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ height: 1, width: 28, background: `linear-gradient(to right, ${t.primary}, transparent)` }} />
            <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.3em', textTransform: 'uppercase', color: t.primary }}>
              Stage {stageIndex + 1} / 6
            </span>
            <div style={{ height: 1, width: 28, background: `linear-gradient(to right, ${t.primary}, transparent)` }} />
          </div>

          {/* Title */}
          <div style={{ position: 'relative', marginBottom: 8 }}>
            <h1 style={{
              fontFamily: "'Baloo 2', cursive",
              fontSize: 'clamp(2.8rem, 6vw, 4.5rem)',
              fontWeight: 900, lineHeight: 1,
              textTransform: 'uppercase', color: '#ffffff',
              textShadow: glitching
                ? `4px 0 ${t.primary}, -4px 0 rgba(168,85,247,0.8), 0 0 40px ${t.glow}`
                : `0 0 60px ${t.glow}, 0 2px 0 rgba(0,0,0,0.8)`,
              transform: glitching ? 'translateX(-2px) skewX(-1deg)' : 'none',
              transition: 'all 80ms linear',
              letterSpacing: '-0.02em',
            }}>
              {title}
            </h1>
            {glitching && <>
              <h1 aria-hidden style={{ position: 'absolute', inset: 0, fontFamily: "'Baloo 2', cursive", fontSize: 'clamp(2.8rem, 6vw, 4.5rem)', fontWeight: 900, lineHeight: 1, textTransform: 'uppercase', letterSpacing: '-0.02em', color: t.primary, clipPath: 'inset(15% 0 50% 0)', transform: 'translateX(6px)', mixBlendMode: 'screen', opacity: 0.8 }}>{title}</h1>
              <h1 aria-hidden style={{ position: 'absolute', inset: 0, fontFamily: "'Baloo 2', cursive", fontSize: 'clamp(2.8rem, 6vw, 4.5rem)', fontWeight: 900, lineHeight: 1, textTransform: 'uppercase', letterSpacing: '-0.02em', color: '#facc15', clipPath: 'inset(55% 0 8% 0)', transform: 'translateX(-5px)', mixBlendMode: 'screen', opacity: 0.8 }}>{title}</h1>
            </>}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.25em', textTransform: 'uppercase', color: t.primary, marginBottom: 20 }}>
              ◆ {subtitle} ◆
            </p>
          )}

          {/* Accent line */}
          <div style={{ height: 2, width: '100%', background: `linear-gradient(to right, ${t.primary}, ${t.secondary}80, transparent)`, borderRadius: 99, marginBottom: 24 }} />

          {/* Stats — 2 rows of 3 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
            {[
              { label: 'XP',      value: xp,                                                           icon: '⚡' },
              { label: 'Rank',    value: `${stageIndex + 1} / 6`,                                      icon: '🏆' },
              { label: 'Next',    value: stage.stage === 'adult' ? 'MAX' : `${progress.needed - progress.current}`, icon: '🔥' },
              { label: 'Done',    value: `${progress.percent}%`,                                        icon: '⭐' },
              { label: 'Stage',   value: stage.name.split(' ').slice(-1)[0],                            icon: '🛡️' },
              { label: 'Form',    value: isAdult ? 'FINAL' : stage.vibe.split(' ')[0],                  icon: '🎯' },
            ].map(s => (
              <div key={s.label} style={{ backgroundColor: 'rgba(0,0,0,0.55)', border: `1px solid ${t.primary}25`, borderRadius: 10, padding: '10px 8px', textAlign: 'center', backdropFilter: 'blur(16px)' }}>
                <div style={{ fontSize: 13, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: 'white', fontFamily: "'Baloo 2', cursive", lineHeight: 1, marginBottom: 3 }}>{s.value}</div>
                <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* XP Bar */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: t.primary }}>Level Progress</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>
                {stage.stage === 'adult' ? '🔥 MAX LEVEL' : `${progress.current} / ${progress.needed} XP`}
              </span>
            </div>
            <div style={{ height: 6, borderRadius: 99, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.08)', border: `1px solid ${t.primary}20` }}>
              <div style={{ height: '100%', width: `${progress.percent}%`, background: t.bar, borderRadius: 99, boxShadow: `0 0 10px ${t.glow}`, transition: 'width 1s ease' }} />
            </div>
            {nextStage && <p style={{ textAlign: 'right', fontSize: 9, marginTop: 4, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>→ {nextStage.name} at {nextStage.minXp} XP</p>}
          </div>

          {/* Stage icons */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 18 }}>
            {PET_STAGES.map((s, i) => {
              const unlocked = xp >= s.minXp;
              const isCurrent = i === stageIndex;
              return (
                <div key={s.stage} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ position: 'relative' }}>
                    <img src={s.stageIcon} alt={s.name} width={24} height={24}
                      style={{ objectFit: 'contain', opacity: unlocked ? 1 : 0.15, filter: isCurrent ? `drop-shadow(0 0 6px ${t.primary})` : 'none', transform: isCurrent ? 'scale(1.35)' : 'scale(1)', transition: 'all 0.3s', display: 'block' }} />
                    {isCurrent && <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: `1.5px solid ${t.primary}`, animation: 'ringPulse 1.5s ease-in-out infinite' }} />}
                  </div>
                  <div style={{ width: '100%', height: 2, borderRadius: 99, backgroundColor: unlocked ? t.primary : 'rgba(255,255,255,0.08)' }} />
                </div>
              );
            })}
          </div>

          {/* Quote */}
          <div style={{ backgroundColor: 'rgba(0,0,0,0.45)', border: `1px solid ${t.primary}18`, borderRadius: 10, padding: '10px 14px', marginBottom: 20, backdropFilter: 'blur(16px)' }}>
            <p style={{ fontSize: 12, fontStyle: 'italic', color: 'rgba(255,255,255,0.6)', fontWeight: 600, lineHeight: 1.4 }}>"{quote}"</p>
          </div>

          {/* Buttons */}
          <button onClick={onEnter}
            style={{
              width: '100%', padding: '14px 0', borderRadius: 10,
              fontFamily: "'Baloo 2', cursive", fontWeight: 900, fontSize: 14,
              letterSpacing: '0.2em', textTransform: 'uppercase', color: 'white',
              background: isAdult ? 'linear-gradient(135deg, #7c3aed 0%, #a855f7 35%, #f97316 70%, #fbbf24 100%)' : `linear-gradient(135deg, ${t.secondary}, ${t.primary})`,
              border: `1px solid ${t.primary}60`,
              boxShadow: `0 0 24px ${t.glow}, 0 4px 16px rgba(0,0,0,0.5)`,
              cursor: 'pointer', marginBottom: 8, transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { (e.target as HTMLElement).style.transform = 'scale(1.02)'; (e.target as HTMLElement).style.boxShadow = `0 0 36px ${t.glow}, 0 4px 20px rgba(0,0,0,0.6)`; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'scale(1)'; (e.target as HTMLElement).style.boxShadow = `0 0 24px ${t.glow}, 0 4px 16px rgba(0,0,0,0.5)`; }}>
            {ctaLabel}
          </button>
          <button onClick={onClose}
            style={{ width: '100%', padding: '8px 0', background: 'none', border: 'none', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.6)'}
            onMouseLeave={e => (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.25)'}>
            Close
          </button>
        </div>
      </div>

      <style>{`
        @keyframes ringPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(1.5)} }
      `}</style>
    </div>
  );
}