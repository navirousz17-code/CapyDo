'use client';
// components/DailyChallenge.tsx
// Place this file at: components/DailyChallenge.tsx

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles, RefreshCw } from 'lucide-react';
import { useChallengeStore } from '@/hooks/useChallengeStore';

interface Props {
  /** compact = dashboard widget, full = standalone page */
  mode?: 'compact' | 'full';
}

export default function DailyChallenge({ mode = 'compact' }: Props) {
  const { challenge, progress, completed, loading, fetchChallenge, refreshProgress } = useChallengeStore();
  const [celebrated, setCelebrated] = useState(false);

  useEffect(() => {
    fetchChallenge();
  }, []);

  // Celebrate when newly completed
  useEffect(() => {
    if (completed && !celebrated) {
      setCelebrated(true);
    }
  }, [completed]);

  const progressPct = challenge ? Math.min((progress / challenge.target) * 100, 100) : 0;

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl shimmer" />
          <div className="flex-1">
            <div className="h-4 w-32 rounded shimmer mb-2" />
            <div className="h-3 w-48 rounded shimmer" />
          </div>
        </div>
        <div className="h-3 rounded-full shimmer" />
      </div>
    );
  }

  if (!challenge) return null;

  return (
    <div
      className="card relative overflow-hidden transition-all duration-500"
      style={completed ? { boxShadow: '0 0 0 2px var(--success)' } : {}}
    >
      {/* Completed glow overlay */}
      {completed && (
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(90,163,82,0.08) 0%, rgba(90,163,82,0.04) 100%)',
          }}
        />
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          {/* Asset */}
          <div className={`flex-shrink-0 transition-all duration-500 ${completed ? 'animate-float' : ''}`}>
            <Image
              src="/daily_challenge.png"
              alt="Daily Challenge"
              width={mode === 'full' ? 80 : 56}
              height={mode === 'full' ? 80 : 56}
              className="drop-shadow-md"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="text-xs font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
              >
                Daily Quest
              </span>
              {completed && (
                <span
                  className="text-xs font-extrabold px-2 py-0.5 rounded-full animate-bounce-in"
                  style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}
                >
                  ✓ Done!
                </span>
              )}
            </div>

            <h3
              className="font-extrabold text-base leading-tight"
              style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}
            >
              {challenge.emoji} {challenge.title}
            </h3>
            <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              {challenge.description}
            </p>
          </div>

          {/* XP badge */}
          <div
            className="flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-xl font-extrabold text-center"
            style={{
              backgroundColor: completed ? 'var(--success-bg)' : 'var(--bg-secondary)',
              color: completed ? 'var(--success)' : 'var(--text-muted)',
              fontFamily: "'Baloo 2', cursive",
            }}
          >
            <span className="text-xs leading-none">+{challenge.xp}</span>
            <span className="text-xs leading-none">XP</span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
              Progress
            </span>
            <span className="text-xs font-extrabold" style={{ color: completed ? 'var(--success)' : 'var(--text-primary)' }}>
              {progress} / {challenge.target}
            </span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progressPct}%`,
                background: completed
                  ? 'linear-gradient(90deg, var(--success), #82c97a)'
                  : 'linear-gradient(90deg, var(--accent), var(--text-secondary))',
              }}
            />
          </div>
        </div>

        {/* Completed message */}
        {completed && (
          <div
            className="flex items-center gap-2 p-2.5 rounded-xl text-sm font-semibold mb-3 animate-slide-up"
            style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}
          >
            <Sparkles size={15} />
            Challenge complete! Great work today 🌿
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={refreshProgress}
            className="flex items-center gap-1.5 text-xs font-bold transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <RefreshCw size={12} /> Refresh
          </button>

          {mode === 'compact' && (
            <Link
              href="/dashboard/challenge"
              className="flex items-center gap-1 text-sm font-bold transition-colors"
              style={{ color: 'var(--success)' }}
            >
              View details <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}