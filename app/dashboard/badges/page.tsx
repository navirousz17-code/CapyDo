'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { BADGE_DEFINITIONS, RARITY_COLORS, BadgeDef } from '@/lib/badges';
import { Lock } from 'lucide-react';
import { cn } from '@/utils';

interface EarnedBadge {
  badge_id: string;
  earned_at: string;
}

export default function BadgesPage() {
  const [earned, setEarned] = useState<EarnedBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/badges')
      .then((r) => r.json())
      .then((data) => { setEarned(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const earnedIds = new Set(earned.map((b: EarnedBadge) => b.badge_id));
  const earnedCount = earnedIds.size;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-bark-600" style={{ fontFamily: "'Baloo 2', cursive" }}>
          Achievements 🏆
        </h1>
        <p className="text-bark-400 text-sm font-medium mt-0.5">
          {earnedCount}/{BADGE_DEFINITIONS.length} badges unlocked
        </p>
      </div>

      {/* Progress */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-bark-600">Collection Progress</span>
          <span className="font-extrabold text-bark-500" style={{ fontFamily: "'Baloo 2', cursive" }}>
            {earnedCount}/{BADGE_DEFINITIONS.length}
          </span>
        </div>
        <div className="h-3 bg-cream-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${(earnedCount / BADGE_DEFINITIONS.length) * 100}%`,
              background: 'linear-gradient(90deg, #f59e0b, #f97316)',
            }}
          />
        </div>
        {earnedCount === BADGE_DEFINITIONS.length && (
          <p className="text-center text-sm font-bold text-amber-600 mt-3">
            🎊 Complete collection! You're a legend! 🎊
          </p>
        )}
      </div>

      {/* Badges grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-48 rounded-2xl shimmer" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {BADGE_DEFINITIONS.map((badge: BadgeDef) => {
            const isEarned = earnedIds.has(badge.id);
            const rarity = RARITY_COLORS[badge.rarity as keyof typeof RARITY_COLORS];
            const earnedBadge = earned.find((e) => e.badge_id === badge.id);

            return (
              <div
                key={badge.id}
                className={cn('card text-center card-lift relative overflow-hidden', !isEarned && 'opacity-60')}
                style={isEarned ? { border: `2px solid ${rarity.border}`, background: `linear-gradient(135deg, ${rarity.bg}, white)` } : {}}
              >
                {/* Rarity label */}
                <div
                  className="text-xs font-bold px-2 py-0.5 rounded-full inline-block mb-3"
                  style={isEarned
                    ? { backgroundColor: rarity.border + '30', color: rarity.text, border: `1px solid ${rarity.border}` }
                    : { backgroundColor: '#f0f0f0', color: '#999' }
                  }
                >
                  {rarity.label}
                </div>

                {/* Badge image */}
                <div className="flex justify-center mb-3 relative">
                  {isEarned ? (
                    <Image
                      src={badge.image}
                      alt={badge.name}
                      width={90}
                      height={90}
                      className="drop-shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-cream-200 flex items-center justify-center relative">
                      <Image
                        src={badge.image}
                        alt={badge.name}
                        width={90}
                        height={90}
                        className="opacity-20"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Lock size={28} className="text-bark-400" />
                      </div>
                    </div>
                  )}
                </div>

                <h3 className="font-extrabold text-sm text-bark-600 mb-1" style={{ fontFamily: "'Baloo 2', cursive" }}>
                  {isEarned ? badge.name : '???'}
                </h3>
                <p className="text-xs text-bark-400 font-medium leading-snug">
                  {isEarned ? badge.description : 'Keep going to unlock!'}
                </p>

                {isEarned && earnedBadge && (
                  <p className="text-xs text-bark-300 font-semibold mt-2">
                    🗓️ {new Date(earnedBadge.earned_at).toLocaleDateString()}
                  </p>
                )}

                {isEarned && (
                  <div className="absolute top-2 right-2 text-lg">✨</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}