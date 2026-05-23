'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { BADGE_DEFINITIONS, RARITY_COLORS, BadgeDef } from '@/lib/badges';

const listeners: ((badgeId: string) => void)[] = [];

export function awardBadge(badgeId: string) {
  listeners.forEach((fn) => fn(badgeId));
}

export default function BadgeUnlock() {
  const [queue, setQueue] = useState<BadgeDef[]>([]);
  const [current, setCurrent] = useState<BadgeDef | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = async (badgeId: string) => {
      try {
        const res = await fetch('/api/badges', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ badge_id: badgeId }),
        });
        const data = await res.json();
        if (data.newly_earned) {
          const badge = BADGE_DEFINITIONS.find((b) => b.id === badgeId);
          if (badge) setQueue((q) => [...q, badge]);
        }
      } catch {}
    };
    listeners.push(handler);
    return () => { const i = listeners.indexOf(handler); if (i > -1) listeners.splice(i, 1); };
  }, []);

  useEffect(() => {
    if (queue.length > 0 && !current) {
      const next = queue[0];
      setQueue((q) => q.slice(1));
      setCurrent(next);
      setVisible(true);
      setTimeout(() => {
        setVisible(false);
        setTimeout(() => setCurrent(null), 600);
      }, 5000);
    }
  }, [queue, current]);

  if (!current) return null;

  const rarity = RARITY_COLORS[current.rarity];

  return (
    <>
      <style>{`
        @keyframes badge-entrance {
          0% { transform: translate(-50%, -50%) scale(0) rotate(-10deg); opacity: 0; }
          60% { transform: translate(-50%, -50%) scale(1.1) rotate(3deg); opacity: 1; }
          80% { transform: translate(-50%, -50%) scale(0.97) rotate(-1deg); }
          100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes badge-exit {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
        }
        @keyframes shine {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(200%) rotate(45deg); }
        }
        @keyframes sparkle-float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 1; }
          50% { transform: translateY(-8px) scale(1.2); opacity: 0.7; }
        }
        .badge-in { animation: badge-entrance 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .badge-out { animation: badge-exit 0.5s ease-in forwards; }
        .shine-effect::after {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 40%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: shine 1.5s ease-in-out 0.5s infinite;
          transform: rotate(45deg);
        }
        .sparkle { animation: sparkle-float 1.5s ease-in-out infinite; }
      `}</style>

      {/* Dark overlay */}
      <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" />

      {/* Badge popup */}
      <div
        className={`fixed top-1/2 left-1/2 z-[70] ${visible ? 'badge-in' : 'badge-out'}`}
        style={{ transform: 'translate(-50%, -50%)' }}
      >
        <div
          className="shine-effect relative overflow-hidden rounded-3xl p-8 text-center shadow-2xl"
          style={{
            background: `linear-gradient(135deg, ${rarity.bg}, white)`,
            border: `3px solid ${rarity.border}`,
            minWidth: '300px',
            maxWidth: '360px',
          }}
        >
          {/* Sparkles */}
          <div className="absolute top-4 left-4 text-2xl sparkle" style={{ animationDelay: '0s' }}>✨</div>
          <div className="absolute top-4 right-4 text-2xl sparkle" style={{ animationDelay: '0.5s' }}>⭐</div>
          <div className="absolute bottom-4 left-6 text-xl sparkle" style={{ animationDelay: '0.3s' }}>🌿</div>
          <div className="absolute bottom-4 right-6 text-xl sparkle" style={{ animationDelay: '0.8s' }}>✨</div>

          {/* Header */}
          <p className="text-sm font-extrabold mb-1 uppercase tracking-widest" style={{ color: rarity.text }}>
            🏆 Badge Unlocked!
          </p>
          <p
            className="text-xs font-bold px-3 py-1 rounded-full inline-block mb-5"
            style={{ backgroundColor: rarity.border + '30', color: rarity.text, border: `1px solid ${rarity.border}` }}
          >
            {rarity.label}
          </p>

          {/* Badge image */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full blur-xl opacity-50"
                style={{ backgroundColor: rarity.border }}
              />
              <Image
                src={current.image}
                alt={current.name}
                width={140}
                height={140}
                className="relative z-10 drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Badge info */}
          <h2
            className="text-2xl font-extrabold mb-2"
            style={{ fontFamily: "'Baloo 2', cursive", color: '#5c4022' }}
          >
            {current.name}
          </h2>
          <p className="text-sm font-semibold" style={{ color: '#a67640' }}>
            {current.description}
          </p>

          {/* Dismiss hint */}
          <p className="text-xs mt-5 font-medium" style={{ color: '#c4965a' }}>
            Auto-closing in a moment...
          </p>
        </div>
      </div>
    </>
  );
}