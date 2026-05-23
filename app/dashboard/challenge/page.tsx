'use client';
// app/dashboard/challenge/page.tsx
// Place this file at: app/dashboard/challenge/page.tsx

import { useEffect } from 'react';
import Image from 'next/image';
import { Sparkles, Trophy, Zap, Target } from 'lucide-react';
import { useChallengeStore } from '@/hooks/useChallengeStore';
import { useTaskStore } from '@/hooks/useTaskStore';
import { useDailyStore } from '@/hooks/useDailyStore';
import DailyChallenge from '@/components/DailyChallenge';

const XP_MILESTONES = [
  { xp: 50,  label: 'Seedling',   emoji: '🌱' },
  { xp: 150, label: 'Sprout',     emoji: '🌿' },
  { xp: 300, label: 'Sapling',    emoji: '🌳' },
  { xp: 500, label: 'Explorer',   emoji: '🗺️' },
  { xp: 750, label: 'Champion',   emoji: '🏆' },
  { xp: 1000,label: 'Legend',     emoji: '⚡' },
];

// All challenges in the pool for display
const ALL_CHALLENGES = [
  { emoji: '🌱', title: 'First Step',      description: 'Complete at least 1 task today',           xp: 30  },
  { emoji: '✅', title: 'Task Trio',        description: 'Complete 3 tasks today',                   xp: 50  },
  { emoji: '⚡', title: 'Priority Slayer', description: 'Complete 1 high-priority task',             xp: 75  },
  { emoji: '⏰', title: 'Debt Clearer',    description: 'Complete 1 overdue task',                   xp: 80  },
  { emoji: '🔥', title: 'Fire Fighter',    description: 'Complete an urgent task',                   xp: 100 },
  { emoji: '🖐️', title: 'High Five',       description: 'Complete 5 tasks today',                   xp: 100 },
  { emoji: '🌟', title: 'Perfect Day',     description: 'Complete all your daily habits',            xp: 120 },
  { emoji: '💪', title: 'Double Threat',   description: 'Complete 2 high or urgent tasks',           xp: 150 },
];

export default function ChallengePage() {
  const { challenge, progress, completed, fetchChallenge } = useChallengeStore();
  const { getStats } = useTaskStore();
  const { getStats: getDailyStats } = useDailyStore();

  useEffect(() => { fetchChallenge(); }, []);

  const taskStats = getStats();
  const dailyStats = getDailyStats();

  // Simulated total XP based on completed tasks + habits (rough estimate)
  const estimatedXP = taskStats.completed * 20 + dailyStats.completedToday * 15 + (completed && challenge ? challenge.xp : 0);
  const currentMilestone = XP_MILESTONES.filter((m) => estimatedXP >= m.xp).pop() ?? XP_MILESTONES[0];
  const nextMilestone = XP_MILESTONES.find((m) => estimatedXP < m.xp);
  const xpToNext = nextMilestone ? nextMilestone.xp - estimatedXP : 0;
  const milestoneProgress = nextMilestone
    ? ((estimatedXP - (currentMilestone?.xp ?? 0)) / (nextMilestone.xp - (currentMilestone?.xp ?? 0))) * 100
    : 100;

  return (
    <div className="flex flex-col gap-7 animate-fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Image
          src="/daily_challenge.png"
          alt="Daily Challenge"
          width={64}
          height={64}
          className="drop-shadow-lg animate-float"
        />
        <div>
          <h1
            className="text-3xl font-extrabold"
            style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}
          >
            Daily Quest 🎯
          </h1>
          <p className="font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            A new challenge awaits every day. Complete it to earn XP!
          </p>
        </div>
      </div>

      {/* Today's challenge — full widget */}
      <DailyChallenge mode="full" />

      {/* XP / Rank card */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={18} style={{ color: 'var(--success)' }} />
          <h2
            className="font-extrabold text-lg"
            style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}
          >
            Your Rank
          </h2>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            {currentMilestone.emoji}
          </div>
          <div className="flex-1">
            <p
              className="text-xl font-extrabold"
              style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}
            >
              {currentMilestone.label}
            </p>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
              {estimatedXP} XP earned
            </p>
            {nextMilestone && (
              <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {xpToNext} XP to {nextMilestone.emoji} {nextMilestone.label}
              </p>
            )}
          </div>
          <div
            className="text-right flex-shrink-0"
            style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}
          >
            <span className="text-2xl font-extrabold">{estimatedXP}</span>
            <span className="text-sm font-bold ml-1" style={{ color: 'var(--text-muted)' }}>XP</span>
          </div>
        </div>

        {/* Milestone progress bar */}
        {nextMilestone && (
          <div>
            <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${milestoneProgress}%`,
                  background: 'linear-gradient(90deg, var(--success), #82c97a)',
                }}
              />
            </div>
            <div className="flex justify-between text-xs font-semibold mt-1.5" style={{ color: 'var(--text-muted)' }}>
              <span>{currentMilestone.emoji} {currentMilestone.label}</span>
              <span>{nextMilestone.emoji} {nextMilestone.label}</span>
            </div>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: '✅', label: 'Tasks Done',    value: taskStats.completed },
          { icon: '🔄', label: 'Habits Today',  value: `${dailyStats.completedToday}/${dailyStats.total}` },
          { icon: '⚡', label: 'Total XP',      value: estimatedXP },
        ].map((s) => (
          <div key={s.label} className="card text-center border-0" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div
              className="text-2xl font-extrabold"
              style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}
            >
              {s.value}
            </div>
            <div className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* All possible challenges */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Target size={18} style={{ color: 'var(--success)' }} />
          <h2
            className="font-extrabold text-lg"
            style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}
          >
            Quest Board
          </h2>
          <span className="text-xs font-semibold ml-1" style={{ color: 'var(--text-muted)' }}>
            All possible daily quests
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {ALL_CHALLENGES.map((c) => {
            const isToday = challenge?.title === c.title;
            return (
              <div
                key={c.title}
                className="flex items-center gap-3 p-3 rounded-xl transition-all"
                style={{
                  backgroundColor: isToday ? 'var(--bg-secondary)' : 'transparent',
                  border: isToday ? '1px solid var(--border-strong)' : '1px solid transparent',
                }}
              >
                <span className="text-xl flex-shrink-0">{c.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    {c.title}
                    {isToday && (
                      <span
                        className="text-xs font-extrabold px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
                      >
                        TODAY
                      </span>
                    )}
                  </p>
                  <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {c.description}
                  </p>
                </div>
                <span
                  className="text-xs font-extrabold flex-shrink-0 px-2 py-1 rounded-lg"
                  style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}
                >
                  +{c.xp} XP
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tip */}
      <div
        className="rounded-2xl p-4 text-sm font-semibold"
        style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
      >
        💡 Challenges are picked smartly based on your pending tasks. Urgent tasks? You'll get a firefighting quest. Lots of habits? A Perfect Day quest. They refresh every midnight 🌙
      </div>
    </div>
  );
}