'use client';
// components/ui/SpinWheel.tsx

import { useState, useRef, useEffect } from 'react';
import { usePetStore } from '@/hooks/usePetStore';
import toast from 'react-hot-toast';

const PRIZES = [
  { label: '+10 XP',        value: 'xp_10',   color: '#5aa352', bg: '#f0f7ee', emoji: '⚡', xp: 10  },
  { label: '+25 XP',        value: 'xp_25',   color: '#0369a1', bg: '#e0f2fe', emoji: '💎', xp: 25  },
  { label: '+50 XP',        value: 'xp_50',   color: '#7c3aed', bg: '#ede9fe', emoji: '👑', xp: 50  },
  { label: 'Try Again',     value: 'nothing', color: '#a67640', bg: '#fdf9ed', emoji: '🥲', xp: 0   },
  { label: '+15 XP',        value: 'xp_15',   color: '#d97706', bg: '#fef3c7', emoji: '🔥', xp: 15  },
  { label: 'Streak Shield', value: 'shield',  color: '#0891b2', bg: '#e0f2fe', emoji: '🛡️', xp: 20  },
  { label: '+5 XP',         value: 'xp_5',    color: '#5aa352', bg: '#f0f7ee', emoji: '🌿', xp: 5   },
  { label: 'JACKPOT 100!',  value: 'jackpot', color: '#ef4444', bg: '#fef2f2', emoji: '🎰', xp: 100 },
];

const SPIN_KEY = 'capydo-last-spin';

function canSpin() {
  const last = localStorage.getItem(SPIN_KEY);
  if (!last) return true;
  return new Date(last).toDateString() !== new Date().toDateString();
}

function timeUntilNextSpin() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const diff = tomorrow.getTime() - Date.now();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m`;
}

export default function SpinWheel({ onClose }: { onClose: () => void }) {
  const { addXp } = usePetStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<typeof PRIZES[0] | null>(null);
  const [rotation, setRotation] = useState(0);
  const [available, setAvailable] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');
  const animRef = useRef<number>(0);

  useEffect(() => {
    setAvailable(canSpin());
    setTimeLeft(timeUntilNextSpin());
    drawWheel(0);
  }, []);

  const drawWheel = (rot: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const cx = canvas.width / 2, cy = canvas.height / 2;
    const r = cx - 8;
    const sliceAngle = (2 * Math.PI) / PRIZES.length;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    PRIZES.forEach((prize, i) => {
      const startAngle = rot + i * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = i % 2 === 0 ? prize.color : prize.color + 'cc';
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.font = '16px serif';
      ctx.textAlign = 'right';
      ctx.fillText(prize.emoji, r - 10, 5);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 10px sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 3;
      ctx.fillText(prize.label, r - 32, 5);
      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, Math.PI * 2);
    const g = ctx.createRadialGradient(cx - 5, cy - 5, 2, cx, cy, 28);
    g.addColorStop(0, '#fef3c7');
    g.addColorStop(1, '#f59e0b');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#78350f';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎰', cx, cy);
  };

  const spin = () => {
    if (spinning || !available) return;
    setSpinning(true);
    setResult(null);
    const winIndex = Math.floor(Math.random() * PRIZES.length);
    const sliceAngle = (2 * Math.PI) / PRIZES.length;
    const extraSpins = 5 + Math.random() * 3;
    const targetAngle = extraSpins * Math.PI * 2 + (Math.PI * 2 - winIndex * sliceAngle - sliceAngle / 2);
    const startTime = performance.now();
    const duration = 4000 + Math.random() * 1000;
    const startRot = rotation;

    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentRot = startRot + targetAngle * eased;
      setRotation(currentRot);
      drawWheel(currentRot);
      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        const prize = PRIZES[winIndex];
        setResult(prize);
        if (prize.xp > 0) addXp(prize.xp, 'task');
        localStorage.setItem(SPIN_KEY, new Date().toISOString());
        setAvailable(false);
        setTimeLeft(timeUntilNextSpin());
        if (prize.value === 'jackpot') toast.success('🎰 JACKPOT! +100 XP!!!');
        else if (prize.value === 'nothing') toast('Better luck tomorrow! 🥲', { icon: '🎰' });
        else toast.success(`${prize.emoji} You won ${prize.label}!`);
      }
    };
    animRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => () => cancelAnimationFrame(animRef.current), []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-sm animate-bounce-in rounded-3xl p-6 text-center relative"
        style={{ backgroundColor: 'var(--bg-card)', border: '2px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
          style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>✕</button>
        <h2 className="text-2xl font-extrabold mb-1" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>🎰 Daily Spin</h2>
        <p className="text-xs font-semibold mb-4" style={{ color: 'var(--text-muted)' }}>
          {available ? 'Spin once a day for bonus rewards!' : `Next spin in ${timeLeft}`}
        </p>
        <div className="flex justify-center mb-1">
          <div style={{ width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: '20px solid #f59e0b', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
        </div>
        <div className="flex justify-center mb-4">
          <canvas ref={canvasRef} width={280} height={280}
            style={{ borderRadius: '50%', boxShadow: spinning ? '0 0 40px rgba(245,158,11,0.6)' : '0 4px 20px rgba(0,0,0,0.2)', transition: 'box-shadow 0.3s' }} />
        </div>
        {result && (
          <div className="mb-4 px-4 py-3 rounded-2xl animate-bounce-in"
            style={{ backgroundColor: result.bg, border: `2px solid ${result.color}40` }}>
            <p className="text-2xl mb-1">{result.emoji}</p>
            <p className="font-extrabold text-lg" style={{ color: result.color, fontFamily: "'Baloo 2', cursive" }}>
              {result.value === 'jackpot' ? '🎉 JACKPOT!!!' : result.value === 'nothing' ? 'Try again tomorrow!' : `You won ${result.label}!`}
            </p>
            {result.xp > 0 && <p className="text-sm font-bold" style={{ color: result.color }}>+{result.xp} XP added!</p>}
          </div>
        )}
        <button onClick={spin} disabled={spinning || !available}
          className="w-full py-3.5 rounded-2xl font-extrabold text-base transition-all disabled:opacity-50"
          style={{
            background: available && !spinning ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'var(--bg-secondary)',
            color: available && !spinning ? 'white' : 'var(--text-muted)',
            boxShadow: available && !spinning ? '0 4px 20px rgba(245,158,11,0.4)' : 'none',
            fontFamily: "'Baloo 2', cursive",
          }}>
          {spinning ? '🌀 Spinning...' : available ? '🎰 SPIN!' : `⏰ Come back in ${timeLeft}`}
        </button>
        <div className="grid grid-cols-4 gap-1.5 mt-4">
          {PRIZES.map(p => (
            <div key={p.value} className="flex flex-col items-center gap-0.5 p-1.5 rounded-xl"
              style={{ backgroundColor: p.bg, border: `1px solid ${p.color}30` }}>
              <span style={{ fontSize: 14 }}>{p.emoji}</span>
              <span style={{ fontSize: 8, fontWeight: 700, color: p.color, textAlign: 'center', lineHeight: 1.2 }}>{p.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}