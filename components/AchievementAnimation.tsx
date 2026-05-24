'use client';
// components/AchievementAnimation.tsx
// Usage:
//   <AchievementAnimation type="evolution" title="Dark Kalbo" subtitle="😈 Dark aura activated" image="/pet_teen.png" onDismiss={() => ...} />
//   <AchievementAnimation type="quest"     title="Fire Fighter" subtitle="+100 XP earned!" onDismiss={() => ...} />
//   <AchievementAnimation type="rank"      title="Champion!" subtitle="You reached a new rank" image="/rank_champion.png" onDismiss={() => ...} />
//   <AchievementAnimation type="badge"     title="Centurion" subtitle="Complete 100 tasks" image="/badge_centurion.png" onDismiss={() => ...} />

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

export type AchievementType = 'evolution' | 'quest' | 'rank' | 'badge';

interface Props {
  type: AchievementType;
  title: string;
  subtitle?: string;
  image?: string;
  onDismiss: () => void;
}

// ── Particle generator ────────────────────────────────────────────────────────
function Particles({ count, colors, spread = 'radial' }: { count: number; colors: string[]; spread?: 'radial' | 'up' | 'burst' }) {
  const particles = Array.from({ length: count }, (_, i) => {
    const angle = spread === 'up'
      ? -90 + (Math.random() - 0.5) * 120
      : spread === 'burst'
      ? (i / count) * 360
      : Math.random() * 360;
    const distance = 80 + Math.random() * 180;
    const size = 3 + Math.random() * 8;
    const duration = 0.8 + Math.random() * 1.2;
    const delay = Math.random() * 0.4;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const tx = Math.cos((angle * Math.PI) / 180) * distance;
    const ty = Math.sin((angle * Math.PI) / 180) * distance;
    return { tx, ty, size, duration, delay, color };
  });

  return (
    <>
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            animation: `particleFly ${p.duration}s ease-out ${p.delay}s forwards`,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
          } as React.CSSProperties}
        />
      ))}
    </>
  );
}

// ── Shockwave ring ────────────────────────────────────────────────────────────
function ShockwaveRing({ color, delay = 0 }: { color: string; delay?: number }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: 80, height: 80,
        border: `3px solid ${color}`,
        top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        animation: `shockwave 0.8s ease-out ${delay}s forwards`,
        opacity: 0,
      }}
    />
  );
}

// ── Light rays ────────────────────────────────────────────────────────────────
function LightRays({ color }: { color: string }) {
  return (
    <>
      {Array.from({ length: 12 }, (_, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            width: 2,
            height: '45%',
            background: `linear-gradient(to top, transparent, ${color})`,
            top: '50%',
            left: '50%',
            transformOrigin: '50% 0%',
            transform: `translate(-50%, 0) rotate(${i * 30}deg)`,
            animation: `rayPulse 1.5s ease-in-out ${i * 0.05}s infinite alternate`,
            opacity: 0.6,
          }}
        />
      ))}
    </>
  );
}

// ── EVOLUTION animation ───────────────────────────────────────────────────────
function EvolutionAnimation({ title, subtitle, image, onDismiss }: Omit<Props, 'type'>) {
  const [phase, setPhase] = useState(0); // 0=flash 1=reveal 2=idle

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(5,0,20,0.92)', backdropFilter: 'blur(12px)', animation: 'fadeInBg 0.2s ease forwards' }}>

      {/* Screen flash */}
      {phase === 0 && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: '#a855f7', animation: 'screenFlash 0.3s ease forwards' }} />
      )}

      {/* Rotating outer aura */}
      <div className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'conic-gradient(#7c3aed, #a855f7, #f59e0b, #7c3aed)',
          filter: 'blur(40px)', opacity: 0.35,
          animation: 'slowRotate 4s linear infinite',
        }} />

      {/* Shockwaves */}
      <ShockwaveRing color="#a855f7" delay={0.1} />
      <ShockwaveRing color="#f59e0b" delay={0.4} />
      <ShockwaveRing color="#a855f7" delay={0.7} />

      {/* Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <Particles count={40} colors={['#a855f7','#7c3aed','#f59e0b','#fbbf24','#ffffff']} spread="burst" />
      </div>

      {/* Card */}
      <div className="relative flex flex-col items-center gap-5 px-10 py-10 rounded-3xl z-10"
        style={{
          background: 'linear-gradient(160deg,#0d0520,#1e0a3c 50%,#0d0520)',
          border: '1.5px solid rgba(180,120,255,0.5)',
          boxShadow: '0 0 120px rgba(150,80,255,0.6), 0 0 240px rgba(255,160,0,0.15)',
          animation: 'epicPop 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.15s both',
          maxWidth: 360, width: '100%',
        }}>

        {/* Floating particles inside card */}
        {[...Array(12)].map((_, i) => (
          <div key={i} className="absolute w-1 h-1 rounded-full pointer-events-none"
            style={{
              backgroundColor: i % 2 === 0 ? '#fbbf24' : '#a78bfa',
              top: `${10 + (i * 7) % 80}%`,
              left: `${5 + (i * 9) % 90}%`,
              animation: `floatDot ${1.2 + (i % 3) * 0.3}s ease-in-out infinite alternate`,
              opacity: 0.9,
            }} />
        ))}

        <div className="text-[11px] font-black tracking-[0.35em] uppercase" style={{ color: '#a78bfa', letterSpacing: '0.3em' }}>
          ✦ Evolution Unlocked ✦
        </div>

        {image && (
          <div className="relative" style={{ filter: 'drop-shadow(0 0 40px rgba(255,160,0,0.9))', animation: 'heroFloat 2.5s ease-in-out infinite' }}>
            <div className="absolute inset-0 rounded-full"
              style={{ background: 'conic-gradient(#a855f7, transparent 60%, #a855f7)', animation: 'slowRotate 3s linear infinite', filter: 'blur(12px)', opacity: 0.8 }} />
            <Image src={image} alt={title} width={160} height={160} className="object-contain relative z-10" />
          </div>
        )}

        <div className="text-center">
          <div className="text-3xl font-black shimmerGold" style={{ fontFamily: "'Baloo 2', cursive" }}>{title}</div>
          {subtitle && <div className="text-sm mt-1.5 font-semibold" style={{ color: '#c4b5fd' }}>{subtitle}</div>}
        </div>

        <button onClick={onDismiss}
          className="px-10 py-3 rounded-2xl text-sm font-black tracking-widest uppercase transition-all hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: 'white', boxShadow: '0 4px 24px rgba(124,58,237,0.6)', letterSpacing: '0.15em' }}>
          AMAZING!! 🔥
        </button>
      </div>
    </div>
  );
}

// ── QUEST COMPLETE animation ──────────────────────────────────────────────────
function QuestAnimation({ title, subtitle, image, onDismiss }: Omit<Props, 'type'>) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,10,0,0.88)', backdropFilter: 'blur(10px)', animation: 'fadeInBg 0.2s ease forwards' }}>

      {/* Gold light rays from center */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <LightRays color="rgba(251,191,36,0.5)" />
      </div>

      {/* Particles shooting up */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <Particles count={50} colors={['#fbbf24','#f59e0b','#22c55e','#86efac','#ffffff']} spread="up" />
      </div>

      {/* Shockwaves */}
      <ShockwaveRing color="#fbbf24" delay={0} />
      <ShockwaveRing color="#22c55e" delay={0.3} />

      {/* Card */}
      <div className="relative flex flex-col items-center gap-5 px-10 py-10 rounded-3xl z-10"
        style={{
          background: 'linear-gradient(160deg,#051a05,#0a2e0a 50%,#051a05)',
          border: '1.5px solid rgba(34,197,94,0.5)',
          boxShadow: '0 0 100px rgba(34,197,94,0.4), 0 0 200px rgba(251,191,36,0.2)',
          animation: 'epicPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s both',
          maxWidth: 340, width: '100%',
        }}>

        <div className="text-[11px] font-black tracking-[0.3em] uppercase" style={{ color: '#4ade80' }}>
          ✦ Quest Complete ✦
        </div>

        {image ? (
          <div style={{ filter: 'drop-shadow(0 0 30px rgba(251,191,36,0.8))', animation: 'heroFloat 2s ease-in-out infinite' }}>
            <Image src={image} alt={title} width={120} height={120} className="object-contain" />
          </div>
        ) : (
          <div className="text-7xl" style={{ animation: 'heroFloat 2s ease-in-out infinite', filter: 'drop-shadow(0 0 20px rgba(251,191,36,0.8))' }}>
            🎯
          </div>
        )}

        {/* Stamp effect */}
        <div className="text-center" style={{ animation: 'stampIn 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.3s both' }}>
          <div className="text-2xl font-black" style={{ fontFamily: "'Baloo 2', cursive", color: '#fbbf24' }}>{title}</div>
          {subtitle && <div className="text-sm mt-1 font-bold" style={{ color: '#4ade80' }}>{subtitle}</div>}
        </div>

        {/* XP burst */}
        <div className="px-6 py-2 rounded-full font-black text-lg"
          style={{
            background: 'linear-gradient(135deg,#15803d,#22c55e)',
            color: 'white',
            boxShadow: '0 4px 20px rgba(34,197,94,0.5)',
            animation: 'stampIn 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.5s both',
          }}>
          ⚡ XP EARNED!
        </div>

        <button onClick={onDismiss}
          className="text-xs font-bold transition-all hover:opacity-70"
          style={{ color: '#4ade80' }}>
          Continue →
        </button>
      </div>
    </div>
  );
}

// ── RANK UP animation ─────────────────────────────────────────────────────────
function RankAnimation({ title, subtitle, image, onDismiss }: Omit<Props, 'type'>) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setPhase(1), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-[300] flex flex-col items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.95)', animation: 'fadeInBg 0.15s ease forwards' }}>

      {/* Cinematic black bars */}
      <div className="fixed top-0 left-0 right-0 h-16 z-10 pointer-events-none"
        style={{ backgroundColor: '#000', animation: 'barSlideIn 0.3s ease forwards' }} />
      <div className="fixed bottom-0 left-0 right-0 h-16 z-10 pointer-events-none"
        style={{ backgroundColor: '#000', animation: 'barSlideIn 0.3s ease forwards' }} />

      {/* Background light burst */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(251,191,36,0.25) 0%, transparent 65%)',
            animation: 'burstIn 0.5s ease-out 0.3s both',
          }} />
      </div>

      {/* Shockwaves */}
      <ShockwaveRing color="#f59e0b" delay={0.3} />
      <ShockwaveRing color="#fbbf24" delay={0.55} />
      <ShockwaveRing color="#f59e0b" delay={0.8} />

      {/* Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <Particles count={60} colors={['#f59e0b','#fbbf24','#fef3c7','#ffffff','#d97706']} spread="burst" />
      </div>

      {/* Main content — slams in */}
      <div className="relative z-20 flex flex-col items-center gap-4"
        style={{ animation: 'slamIn 0.5s cubic-bezier(0.22,1,0.36,1) 0.25s both' }}>

        <div className="text-xs font-black tracking-[0.4em] uppercase mb-2" style={{ color: '#f59e0b', opacity: 0.8 }}>
          ◆ &nbsp; Rank Up &nbsp; ◆
        </div>

        {image && (
          <div style={{
            filter: 'drop-shadow(0 0 50px rgba(251,191,36,1))',
            animation: 'heroFloat 2s ease-in-out infinite',
          }}>
            <Image src={image} alt={title} width={180} height={180} className="object-contain" />
          </div>
        )}

        <div className="text-center mt-2">
          <div className="text-4xl font-black shimmerGold" style={{ fontFamily: "'Baloo 2', cursive", letterSpacing: '-0.02em' }}>
            {title}
          </div>
          {subtitle && (
            <div className="text-sm font-semibold mt-2" style={{ color: 'rgba(255,255,255,0.6)' }}>{subtitle}</div>
          )}
        </div>

        {/* Horizontal shine line */}
        <div className="w-48 h-px mt-2" style={{ background: 'linear-gradient(90deg, transparent, #f59e0b, transparent)', animation: 'shineLine 1.5s ease-in-out infinite' }} />

        <button onClick={onDismiss}
          className="mt-4 px-10 py-3 rounded-2xl text-sm font-black tracking-widest uppercase transition-all hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg,#d97706,#f59e0b,#fbbf24)', color: '#1a0a00', boxShadow: '0 4px 30px rgba(245,158,11,0.6)', letterSpacing: '0.15em' }}>
          LEGENDARY 👑
        </button>
      </div>
    </div>
  );
}

// ── BADGE UNLOCK animation ────────────────────────────────────────────────────
function BadgeAnimation({ title, subtitle, image, onDismiss }: Omit<Props, 'type'>) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,5,20,0.9)', backdropFilter: 'blur(10px)', animation: 'fadeInBg 0.2s ease forwards' }}>

      {/* Star burst background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="absolute"
            style={{
              width: 3, height: '35%',
              background: 'linear-gradient(to top, transparent, rgba(99,102,241,0.5))',
              top: '50%', left: '50%',
              transformOrigin: '50% 0%',
              transform: `translate(-50%, 0) rotate(${i * 45}deg)`,
              animation: `starRay 1s ease-out ${i * 0.05}s both`,
            }} />
        ))}
      </div>

      <ShockwaveRing color="#818cf8" delay={0} />
      <ShockwaveRing color="#a5b4fc" delay={0.35} />

      {/* Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <Particles count={45} colors={['#818cf8','#a5b4fc','#e0e7ff','#fbbf24','#ffffff']} spread="radial" />
      </div>

      {/* Card */}
      <div className="relative flex flex-col items-center gap-5 px-10 py-10 rounded-3xl z-10"
        style={{
          background: 'linear-gradient(160deg,#05051a,#0f0f2e 50%,#05051a)',
          border: '1.5px solid rgba(129,140,248,0.5)',
          boxShadow: '0 0 100px rgba(99,102,241,0.5), 0 0 200px rgba(99,102,241,0.15)',
          animation: 'epicPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s both',
          maxWidth: 340, width: '100%',
        }}>

        <div className="text-[11px] font-black tracking-[0.3em] uppercase" style={{ color: '#a5b4fc' }}>
          ✦ Badge Unlocked ✦
        </div>

        {image && (
          <div className="relative" style={{ animation: 'spinIn 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.2s both' }}>
            {/* Shine sweep */}
            <div className="absolute inset-0 rounded-full pointer-events-none overflow-hidden z-10"
              style={{ animation: 'shineSweep 1.5s ease-in-out 0.8s both' }}>
              <div className="absolute top-0 bottom-0 w-1/3"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)', animation: 'sweepAcross 1.5s ease 0.8s both' }} />
            </div>
            <Image src={image} alt={title} width={140} height={140} className="object-contain relative z-0"
              style={{ filter: 'drop-shadow(0 0 30px rgba(129,140,248,0.9))' }} />
          </div>
        )}

        <div className="text-center" style={{ animation: 'stampIn 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.5s both' }}>
          <div className="text-2xl font-black" style={{ fontFamily: "'Baloo 2', cursive", color: '#e0e7ff' }}>{title}</div>
          {subtitle && <div className="text-sm mt-1 font-semibold" style={{ color: '#a5b4fc' }}>{subtitle}</div>}
        </div>

        <button onClick={onDismiss}
          className="px-10 py-3 rounded-2xl text-sm font-black tracking-widest uppercase transition-all hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg,#4338ca,#6366f1,#818cf8)', color: 'white', boxShadow: '0 4px 24px rgba(99,102,241,0.6)', letterSpacing: '0.15em' }}>
          EPIC!! ✨
        </button>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function AchievementAnimation({ type, title, subtitle, image, onDismiss }: Props) {
  return (
    <>
      <style global jsx>{`
        @keyframes fadeInBg { from { opacity:0 } to { opacity:1 } }
        @keyframes screenFlash { 0% { opacity:0.9 } 100% { opacity:0 } }
        @keyframes epicPop { 0% { transform:scale(0.2) rotate(-8deg); opacity:0 } 100% { transform:scale(1) rotate(0deg); opacity:1 } }
        @keyframes slamIn { 0% { transform:scale(2) translateY(-40px); opacity:0 } 100% { transform:scale(1) translateY(0); opacity:1 } }
        @keyframes stampIn { 0% { transform:scale(1.6); opacity:0 } 100% { transform:scale(1); opacity:1 } }
        @keyframes spinIn { 0% { transform:rotate(-180deg) scale(0); opacity:0 } 100% { transform:rotate(0deg) scale(1); opacity:1 } }
        @keyframes heroFloat { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-12px) } }
        @keyframes slowRotate { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }
        @keyframes shockwave { 0% { transform:translate(-50%,-50%) scale(1); opacity:0.8 } 100% { transform:translate(-50%,-50%) scale(8); opacity:0 } }
        @keyframes particleFly { 0% { transform:translate(-50%,-50%) scale(1); opacity:1 } 100% { transform:translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0); opacity:0 } }
        @keyframes rayPulse { from { opacity:0.3; transform:translate(-50%,0) rotate(var(--r)) scaleY(0.7) } to { opacity:0.8; transform:translate(-50%,0) rotate(var(--r)) scaleY(1) } }
        @keyframes burstIn { from { transform:scale(0); opacity:0 } to { transform:scale(1); opacity:1 } }
        @keyframes barSlideIn { from { transform:translateY(0) } to { transform:translateY(0) } }
        @keyframes floatDot { from { transform:translateY(0) } to { transform:translateY(-8px) } }
        @keyframes shineLine { 0%,100% { opacity:0.4; transform:scaleX(0.8) } 50% { opacity:1; transform:scaleX(1.2) } }
        @keyframes starRay { from { transform:translate(-50%,0) rotate(var(--r)) scaleY(0); opacity:0 } to { transform:translate(-50%,0) rotate(var(--r)) scaleY(1); opacity:1 } }
        @keyframes sweepAcross { from { left:-33% } to { left:133% } }
        @keyframes shimmerGoldAnim { 0% { background-position:-200% center } 100% { background-position:200% center } }
        .shimmerGold {
          background: linear-gradient(90deg,#fbbf24,#f59e0b,#fef3c7,#f59e0b,#fbbf24);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmerGoldAnim 2s linear infinite;
        }
      `}</style>

      {type === 'evolution' && <EvolutionAnimation title={title} subtitle={subtitle} image={image} onDismiss={onDismiss} />}
      {type === 'quest'     && <QuestAnimation     title={title} subtitle={subtitle} image={image} onDismiss={onDismiss} />}
      {type === 'rank'      && <RankAnimation      title={title} subtitle={subtitle} image={image} onDismiss={onDismiss} />}
      {type === 'badge'     && <BadgeAnimation     title={title} subtitle={subtitle} image={image} onDismiss={onDismiss} />}
    </>
  );
}