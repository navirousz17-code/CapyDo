'use client';
// app/dashboard/umbra/page.tsx

import { useState, useEffect, useRef } from 'react';

function VoidIntro({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState(0);
  const [imploding, setImplode] = useState(false);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 4000),
      setTimeout(() => setPhase(4), 6000),
      setTimeout(() => setPhase(5), 8000),
      setTimeout(() => setPhase(6), 10000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const stars = Array.from({ length: 220 }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      r: Math.random() * 1.2, phase: Math.random() * Math.PI * 2, speed: 0.005 + Math.random() * 0.012,
    }));
    const particles = Array.from({ length: 80 }, () => ({
      angle: Math.random() * Math.PI * 2, dist: 300 + Math.random() * 500,
      speed: 0.3 + Math.random() * 0.8, size: 1 + Math.random() * 2,
      hue: 260 + Math.random() * 40, opacity: Math.random(),
    }));
    let t = 0;
    const draw = () => {
      const w = canvas.width, h = canvas.height, cx = w / 2, cy = h / 2;
      ctx.fillStyle = '#02010a'; ctx.fillRect(0, 0, w, h);
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.55);
      grd.addColorStop(0, 'rgba(88,28,220,0.18)');
      grd.addColorStop(0.4, 'rgba(60,10,140,0.08)');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
      stars.forEach(s => {
        const twinkle = 0.15 + 0.85 * Math.abs(Math.sin(t * s.speed + s.phase));
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r * twinkle, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,185,255,${twinkle * 0.55})`; ctx.fill();
      });
      particles.forEach(p => {
        p.dist -= p.speed;
        if (p.dist < 20) p.dist = 300 + Math.random() * 500;
        const px = cx + Math.cos(p.angle) * p.dist, py = cy + Math.sin(p.angle) * p.dist;
        const fade = Math.max(0, 1 - p.dist / 500);
        ctx.beginPath(); ctx.arc(px, py, p.size * fade, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},90%,70%,${fade * 0.7})`; ctx.fill();
      });
      for (let y = 0; y < h; y += 3) { ctx.fillStyle = 'rgba(0,0,0,0.03)'; ctx.fillRect(0, y, w, 1); }
      t++; animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, []);

  const handleEnter = () => { setImplode(true); setTimeout(onComplete, 1200); };
  const fade = (show: boolean, delay = 0, duration = 1): React.CSSProperties => ({
    opacity: show ? 1 : 0,
    transition: `opacity ${duration}s ease ${delay}s`,
    pointerEvents: show ? 'auto' : 'none',
  });

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#02010a', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', ...(imploding ? { animation: 'implode 1.2s ease-in forwards' } : {}) }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '22%', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 5, ...fade(phase >= 1, 0.2, 1.5) }}>
        <p style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 'clamp(9px,1.1vw,11px)', letterSpacing: '0.55em', color: 'rgba(196,181,253,0.45)', margin: 0, animation: phase >= 1 ? 'whisperFlicker 4s ease-in-out infinite' : 'none' }}>THE VOID HAS BEEN WATCHING</p>
      </div>
      <div style={{ position: 'absolute', zIndex: 4, width: 180, height: 180, left: '50%', top: '50%', transform: 'translate(-50%,-50%)', ...fade(phase >= 1, 0.5, 1.2), animation: phase >= 2 ? 'sigilPulse 2s ease-in-out infinite' : 'none' }}>
        <img src="/assets/aura_ring.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 0 30px rgba(168,85,247,0.9))', opacity: 0.75 }} />
      </div>
      {[{ img: '/assets/aura_arcane.png', color: '#38bdf8', deg: 0 }, { img: '/assets/aura_corruption.png', color: '#ef4444', deg: 120 }, { img: '/assets/aura_sovereign.png', color: '#fbbf24', deg: 240 }].map((o, i) => {
        const rad = (o.deg * Math.PI) / 180, dist = 260;
        return (
          <div key={i} style={{ position: 'absolute', left: `calc(50% + ${Math.round(Math.cos(rad) * dist)}px)`, top: `calc(50% + ${Math.round(Math.sin(rad) * dist)}px)`, width: 80, height: 80, transform: 'translate(-50%,-50%)', zIndex: 5, ...fade(phase >= 2, i * 0.3, 1.2), animation: phase >= 2 ? `orbStream${i} 3s ease-out forwards, orbBob 4s ease-in-out ${i * 0.6}s infinite` : 'none' }}>
            <img src={o.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0.7, filter: `drop-shadow(0 0 12px ${o.color})` }} />
          </div>
        );
      })}
      <div style={{ position: 'absolute', zIndex: 6, width: 340, height: 340, left: '50%', top: '50%', transform: 'translate(-50%,-50%)', ...fade(phase >= 3, 0, 2), animation: phase >= 3 ? 'fragmentArise 2s ease-out forwards' : 'none' }}>
        <img src="/assets/entity_fragment.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 0 40px rgba(120,80,220,0.8)) blur(1px)', opacity: 0.6 }} />
      </div>
      <div style={{ position: 'absolute', zIndex: 7, width: 480, height: 480, left: '50%', top: '50%', transform: 'translate(-50%,-50%)', ...fade(phase >= 4, 0, 1.8), animation: phase >= 4 ? 'entityRise 1.8s ease-out forwards, entityFloat 6s ease-in-out 2s infinite' : 'none' }}>
        <img src="/assets/entity_bound.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 0 60px rgba(168,85,247,0.85)) drop-shadow(0 0 100px rgba(100,50,200,0.4))' }} />
      </div>
      {[{ size: 560, speed: '18s', opacity: 0.5 }, { size: 420, speed: '12s', opacity: 0.4 }].map((r, i) => (
        <div key={i} style={{ position: 'absolute', zIndex: 5, width: r.size, height: r.size, left: '50%', top: '50%', transform: 'translate(-50%,-50%)', ...fade(phase >= 4, i * 0.4, 1.5), animation: phase >= 4 ? `ringRotate${i} ${r.speed} linear infinite` : 'none' }}>
          <img src="/assets/aura_ring.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: r.opacity, filter: 'drop-shadow(0 0 16px rgba(168,85,247,0.6))' }} />
        </div>
      ))}
      <div style={{ position: 'absolute', zIndex: 6, width: 600, height: 600, left: '50%', top: '50%', transform: 'translate(-50%,-50%)', ...fade(phase >= 4, 0.2, 1.5), animation: phase >= 4 ? 'breathe 4s ease-in-out infinite' : 'none' }}>
        <img src="/assets/entity_wings_energy.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0.45, filter: 'drop-shadow(0 0 35px rgba(168,85,247,0.7))' }} />
      </div>
      <div style={{ position: 'absolute', zIndex: 3, left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: phase >= 5 ? '160vmax' : '200px', height: phase >= 5 ? '160vmax' : '200px', transition: 'width 2.5s cubic-bezier(.16,1,.3,1), height 2.5s cubic-bezier(.16,1,.3,1), opacity 2s ease', opacity: phase >= 5 ? 0.18 : 0, pointerEvents: 'none' }}>
        <img src="/assets/aura_null.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 0 60px rgba(168,85,247,0.5))' }} />
      </div>
      <div style={{ position: 'absolute', zIndex: 8, width: 460, height: 160, left: '50%', top: 'calc(50% + 200px)', transform: 'translateX(-50%)', ...fade(phase >= 5, 0.3, 1.2), animation: phase >= 5 ? 'breathe 5s ease-in-out infinite' : 'none' }}>
        <img src="/assets/aura_base.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0.65, filter: 'drop-shadow(0 0 24px rgba(168,85,247,0.7))' }} />
      </div>
      <div style={{ position: 'absolute', zIndex: 9, width: 90, height: 90, left: '50%', top: 'calc(50% - 130px)', transform: 'translateX(-50%)', ...fade(phase >= 5, 0.5, 1), animation: phase >= 5 ? 'corePulse 1.8s ease-in-out infinite' : 'none' }}>
        <img src="/assets/entity_core_glow.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 0 20px rgba(168,85,247,1))' }} />
      </div>
      <div style={{ position: 'absolute', bottom: '12%', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.8rem', zIndex: 10, ...fade(phase >= 6, 0, 1.5) }}>
        <div style={{ animation: phase >= 6 ? 'logoDescend 1.2s ease-out forwards' : 'none' }}>
        </div>
        <p style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '9px', letterSpacing: '0.5em', color: 'rgba(196,181,253,0.4)', margin: 0, textAlign: 'center', animation: phase >= 6 ? 'whisperFlicker 3s ease-in-out infinite' : 'none' }}>YOUR ASCENT AWAITS</p>
        <button onClick={handleEnter} style={{ position: 'relative', fontFamily: "'Orbitron',sans-serif", fontSize: '11px', fontWeight: 700, letterSpacing: '0.3em', color: '#fff', background: 'linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%)', border: 'none', padding: '1rem 2.8rem', clipPath: 'polygon(16px 0%,calc(100% - 16px) 0%,100% 50%,calc(100% - 16px) 100%,16px 100%,0% 50%)', boxShadow: '0 0 40px rgba(124,58,237,0.7)', cursor: 'pointer', animation: phase >= 6 ? 'ctaPulse 2s ease-in-out infinite' : 'none' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}>
          ENTER THE VOID ✦
        </button>
        <button onClick={handleEnter} style={{ background: 'none', border: 'none', fontFamily: "'Orbitron',sans-serif", fontSize: '8px', letterSpacing: '0.35em', color: 'rgba(196,181,253,0.25)', cursor: 'pointer' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(196,181,253,0.5)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(196,181,253,0.25)')}>SKIP INTRO</button>
      </div>
      <div style={{ position: 'absolute', bottom: '4%', left: '50%', transform: 'translateX(-50%)', zIndex: 5, textAlign: 'center', opacity: phase >= 1 && phase < 6 ? 1 : 0, transition: 'opacity 1s ease 0.3s' }}>
        <p style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '8px', letterSpacing: '0.6em', color: 'rgba(168,85,247,0.3)', margin: 0, animation: 'whisperFlicker 5s ease-in-out infinite' }}>✦ &nbsp; UMBRA IV &nbsp; ✦</p>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
        @keyframes whisperFlicker{0%,100%{opacity:.4}40%{opacity:.9}70%{opacity:.55}}
        @keyframes sigilPulse{0%,100%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.08)}}
        @keyframes fragmentArise{from{opacity:0;transform:translate(-50%,-50%) scale(.7) translateY(40px);filter:blur(12px)}to{opacity:1;transform:translate(-50%,-50%) scale(1) translateY(0);filter:blur(1px)}}
        @keyframes entityRise{from{opacity:0;transform:translate(-50%,-50%) scale(.6) translateY(60px);filter:blur(14px)}to{opacity:1;transform:translate(-50%,-50%) scale(1) translateY(0);filter:blur(0)}}
        @keyframes entityFloat{0%,100%{transform:translate(-50%,-50%) translateY(0)}50%{transform:translate(-50%,-50%) translateY(-16px)}}
        @keyframes ringRotate0{from{transform:translate(-50%,-50%) rotate(0deg)}to{transform:translate(-50%,-50%) rotate(360deg)}}
        @keyframes ringRotate1{from{transform:translate(-50%,-50%) rotate(0deg)}to{transform:translate(-50%,-50%) rotate(-360deg)}}
        @keyframes breathe{0%,100%{opacity:.42;transform:translate(-50%,-50%) scale(1)}50%{opacity:.72;transform:translate(-50%,-50%) scale(1.04)}}
        @keyframes corePulse{0%,100%{opacity:.8;transform:translateX(-50%) scale(1)}50%{opacity:1;transform:translateX(-50%) scale(1.12)}}
        @keyframes orbBob{0%,100%{transform:translate(-50%,-50%) translateY(0)}50%{transform:translate(-50%,-50%) translateY(-12px)}}
        @keyframes orbStream0{from{opacity:0;transform:translate(-50%,-50%) scale(.3) translateY(80px)}to{opacity:1;transform:translate(-50%,-50%) scale(1) translateY(0)}}
        @keyframes orbStream1{from{opacity:0;transform:translate(-50%,-50%) scale(.3) translateY(80px)}to{opacity:1;transform:translate(-50%,-50%) scale(1) translateY(0)}}
        @keyframes orbStream2{from{opacity:0;transform:translate(-50%,-50%) scale(.3) translateY(80px)}to{opacity:1;transform:translate(-50%,-50%) scale(1) translateY(0)}}
        @keyframes logoDescend{from{opacity:0;transform:translateY(-24px);filter:blur(8px)}to{opacity:1;transform:translateY(0);filter:blur(0)}}
        @keyframes ctaPulse{0%,100%{box-shadow:0 0 40px rgba(124,58,237,.7)}50%{box-shadow:0 0 70px rgba(124,58,237,1)}}
        @keyframes implode{0%{transform:scale(1);opacity:1;filter:blur(0)}40%{transform:scale(1.08);opacity:1;filter:blur(2px)}100%{transform:scale(0);opacity:0;filter:blur(30px)}}
      `}</style>
    </div>
  );
}

// ── COMING SOON ───────────────────────────────────────────────────────────────
function ComingSoonPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [glitchText, setGlitchText] = useState('UMBRA');
  const [visible, setVisible] = useState(false);
  const glitchChars = '!@#$%ΨΩΔΛφ∞≈×÷█▓▒░';

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      r: Math.random() * 1.3, phase: Math.random() * Math.PI * 2, speed: 0.003 + Math.random() * 0.01,
    }));
    // Lightning cracks
    const cracks: { x: number; y: number; angle: number; life: number; maxLife: number }[] = [];
    let t = 0;
    const draw = () => {
      const w = canvas.width, h = canvas.height, cx = w / 2, cy = h / 2;
      ctx.fillStyle = '#02010a'; ctx.fillRect(0, 0, w, h);
      // Deep glow
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.8);
      grd.addColorStop(0, 'rgba(88,28,220,0.1)');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
      // Stars
      stars.forEach(s => {
        const twinkle = 0.1 + 0.9 * Math.abs(Math.sin(t * s.speed + s.phase));
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r * twinkle, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,185,255,${twinkle * 0.35})`; ctx.fill();
      });
      // Random lightning crack
      if (Math.random() < 0.01) {
        cracks.push({ x: cx + (Math.random() - 0.5) * 300, y: cy + (Math.random() - 0.5) * 300, angle: Math.random() * Math.PI * 2, life: 0, maxLife: 8 });
      }
      cracks.forEach((c, i) => {
        c.life++;
        const progress = c.life / c.maxLife;
        ctx.strokeStyle = `rgba(168,85,247,${(1 - progress) * 0.8})`;
        ctx.lineWidth = (1 - progress) * 2;
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(c.x + Math.cos(c.angle) * 80 * progress, c.y + Math.sin(c.angle) * 80 * progress);
        ctx.stroke();
        if (c.life >= c.maxLife) cracks.splice(i, 1);
      });
      // Scanlines
      for (let y = 0; y < h; y += 4) { ctx.fillStyle = 'rgba(0,0,0,0.02)'; ctx.fillRect(0, y, w, 1); }
      t++; animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, []);

  // Glitch title
  useEffect(() => {
    const original = 'UMBRA';
    let glitching = false;
    const trigger = () => {
      if (glitching) return;
      glitching = true;
      let count = 0;
      const interval = setInterval(() => {
        if (count > 10) { setGlitchText(original); glitching = false; clearInterval(interval); return; }
        setGlitchText(original.split('').map(c => Math.random() > 0.45 ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : c).join(''));
        count++;
      }, 55);
    };
    const id = setInterval(trigger, 2500 + Math.random() * 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#02010a',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', fontFamily: "'Orbitron', sans-serif",
      opacity: visible ? 1 : 0, transition: 'opacity 1.5s ease',
    }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />

      {/* Big glow behind everything */}
      <div style={{
        position: 'absolute', width: '70vw', height: '70vw', maxWidth: 700,
        borderRadius: '50%', left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
        background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
        animation: 'glowBreath 5s ease-in-out infinite', pointerEvents: 'none', zIndex: 1,
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>

        {/* Top whisper */}
        <p style={{ fontSize: 9, letterSpacing: '0.7em', color: 'rgba(168,85,247,0.35)', margin: '0 0 32px', animation: 'whisperFlicker 4s ease-in-out infinite' }}>
          ✦ &nbsp; THE VOID HAS CHOSEN YOU &nbsp; ✦
        </p>

        {/* MASSIVE LOGO */}
        <div style={{ position: 'relative', marginBottom: 0, animation: 'floatLogo 5s ease-in-out infinite' }}>
          {/* Glow rings behind logo */}
          <div style={{
            position: 'absolute', inset: -60, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 65%)',
            animation: 'glowBreath 3s ease-in-out infinite',
          }} />
          <img src="/assets/Umbra_logo.png" alt="UMBRA"
            style={{ width: 'clamp(280px, 40vw, 520px)', objectFit: 'contain', filter: 'drop-shadow(0 0 60px rgba(168,85,247,1)) drop-shadow(0 0 120px rgba(124,58,237,0.6))', position: 'relative', zIndex: 2 }}
          />
        </div>

        {/* Entity below logo */}
        <div style={{ position: 'relative', width: 'clamp(200px, 30vw, 380px)', height: 'clamp(200px, 30vw, 380px)', marginTop: -40, animation: 'entityFloat 5s ease-in-out infinite' }}>
          <div style={{
            position: 'absolute', inset: -40, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)',
            animation: 'glowBreath 4s ease-in-out infinite',
          }} />
          <img src="/assets/aura_ring.png" alt="" style={{
            position: 'absolute', inset: -50, width: 'calc(100% + 100px)', height: 'calc(100% + 100px)',
            objectFit: 'contain', opacity: 0.3, animation: 'ringRotate0 15s linear infinite',
            filter: 'drop-shadow(0 0 12px rgba(168,85,247,0.5))',
          }} />
          <img src="/assets/entity_bound.png" alt="" style={{
            width: '100%', height: '100%', objectFit: 'contain',
            filter: 'drop-shadow(0 0 50px rgba(168,85,247,0.9)) drop-shadow(0 0 100px rgba(100,50,200,0.5))',
            position: 'relative', zIndex: 2,
          }} />
        </div>

        {/* GLITCH COMING SOON */}
        <div style={{ marginTop: 8, marginBottom: 16 }}>
          {/* Scary subtitle */}
          <p style={{
            fontSize: 'clamp(9px,1.2vw,11px)', letterSpacing: '0.8em',
            color: 'rgba(168,85,247,0.5)', margin: '0 0 10px',
            animation: 'whisperFlicker 2.5s ease-in-out infinite',
          }}>
            ✦ &nbsp; COMING SOON &nbsp; ✦
          </p>

          {/* BIG scary glitch text */}
          <h1 style={{
            fontSize: 'clamp(52px,9vw,110px)', fontWeight: 900,
            letterSpacing: '0.12em', margin: '0 0 4px', lineHeight: 1,
            background: 'linear-gradient(180deg, #e9d5ff 0%, #a855f7 35%, #7c3aed 65%, #3b0764 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 40px rgba(168,85,247,0.7))',
            textShadow: 'none',
            animation: 'titleShake 8s ease-in-out infinite',
          }}>
            {glitchText}
          </h1>

          <p style={{
            fontSize: 'clamp(10px,1.4vw,13px)', letterSpacing: '0.25em',
            color: 'rgba(196,181,253,0.45)', margin: 0,
            fontFamily: 'sans-serif', fontWeight: 300,
          }}>
            TWO REALMS &nbsp;·&nbsp; ONE PURPOSE &nbsp;·&nbsp; INFINITE DARKNESS
          </p>
        </div>

        {/* Thin divider */}
        <div style={{ width: 200, height: 1, background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.4), transparent)', margin: '20px 0' }} />

        {/* Notify CTA */}
        <button
          style={{
            fontFamily: "'Orbitron', sans-serif", fontSize: '10px', fontWeight: 700,
            letterSpacing: '0.3em', color: 'rgba(196,181,253,0.85)',
            background: 'transparent', border: '1px solid rgba(168,85,247,0.35)',
            padding: '14px 40px', borderRadius: 99, cursor: 'pointer',
            transition: 'all 0.3s', boxShadow: '0 0 20px rgba(124,58,237,0.15)',
            marginBottom: 28,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.18)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 50px rgba(124,58,237,0.5)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(168,85,247,0.7)'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(124,58,237,0.15)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(168,85,247,0.35)'; (e.currentTarget as HTMLElement).style.color = 'rgba(196,181,253,0.85)'; }}
          onClick={() => alert('You will be notified when Umbra launches 🌑')}
        >
          NOTIFY ME WHEN IT LAUNCHES
        </button>

        {/* Bottom rune */}
        <p style={{ fontSize: 8, letterSpacing: '0.7em', color: 'rgba(168,85,247,0.18)', margin: 0, animation: 'whisperFlicker 6s ease-in-out infinite' }}>
          ✦ &nbsp; UMBRA IV &nbsp; · &nbsp; TODEI-LIST &nbsp; ✦
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
        @keyframes whisperFlicker{0%,100%{opacity:.4}40%{opacity:1}70%{opacity:.55}}
        @keyframes glowBreath{0%,100%{transform:translate(-50%,-50%) scale(1);opacity:0.7}50%{transform:translate(-50%,-50%) scale(1.12);opacity:1}}
        @keyframes floatLogo{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes entityFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
        @keyframes ringRotate0{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes titleShake{0%,100%{transform:skewX(0deg) skewY(0deg)}92%{transform:skewX(0deg) skewY(0deg)}93%{transform:skewX(-2deg) skewY(0.5deg)}94%{transform:skewX(2deg) skewY(-0.5deg)}95%{transform:skewX(0deg) skewY(0deg)}}
      `}</style>
    </div>
  );
}

export default function UmbraPage() {
  const [showIntro, setShowIntro] = useState(true);
  return showIntro ? <VoidIntro onComplete={() => setShowIntro(false)} /> : <ComingSoonPage />;
}