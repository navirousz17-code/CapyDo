'use client';
// app/dashboard/challenge/page.tsx

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Trophy, Target } from 'lucide-react';
import { useChallengeStore } from '@/hooks/useChallengeStore';
import { useTaskStore } from '@/hooks/useTaskStore';
import { useDailyStore } from '@/hooks/useDailyStore';
import DailyChallenge from '@/components/DailyChallenge';
import AchievementAnimation from '@/components/AchievementAnimation';

const XP_MILESTONES = [
  { xp: 50,   label: 'Seedling',  image: '/rank_seedling.png'  },
  { xp: 150,  label: 'Sprout',    image: '/rank_sprout.png'    },
  { xp: 300,  label: 'Sapling',   image: '/rank_sapling.png'   },
  { xp: 500,  label: 'Explorer',  image: '/rank_explorer.png'  },
  { xp: 750,  label: 'Champion',  image: '/rank_champion.png'  },
  { xp: 1000, label: 'Legend',    image: '/rank_legend.png'    },
];

const ALL_CHALLENGES = [
  { image: '/quest_first_step.png',      title: 'First Step',      description: 'Complete at least 1 task today',    xp: 30  },
  { image: '/quest_task_trio.png',       title: 'Task Trio',       description: 'Complete 3 tasks today',             xp: 50  },
  { image: '/quest_priority_slayer.png', title: 'Priority Slayer', description: 'Complete 1 high-priority task',      xp: 75  },
  { image: '/quest_debt_clearer.png',    title: 'Debt Clearer',    description: 'Complete 1 overdue task',            xp: 80  },
  { image: '/quest_fire_fighter.png',    title: 'Fire Fighter',    description: 'Complete an urgent task',            xp: 100 },
  { image: '/quest_high_five.png',       title: 'High Five',       description: 'Complete 5 tasks today',             xp: 100 },
  { image: '/quest_perfect_day.png',     title: 'Perfect Day',     description: 'Complete all your daily habits',     xp: 120 },
  { image: '/quest_double_threat.png',   title: 'Double Threat',   description: 'Complete 2 high or urgent tasks',   xp: 150 },
];

export default function ChallengePage() {
  const { challenge, progress, completed, fetchChallenge } = useChallengeStore();
  const { getStats } = useTaskStore();
  const { getStats: getDailyStats } = useDailyStore();

  const [showRankAnim, setShowRankAnim] = useState(false);
  const [newRank, setNewRank] = useState<typeof XP_MILESTONES[0] | null>(null);
  const prevMilestoneRef = useRef<string | null>(null);

  useEffect(() => { fetchChallenge(); }, []);

  const taskStats = getStats();
  const dailyStats = getDailyStats();

  const estimatedXP = taskStats.completed * 20 + dailyStats.completedToday * 15 + (completed && challenge ? challenge.xp : 0);
  const currentMilestone = XP_MILESTONES.filter((m) => estimatedXP >= m.xp).pop() ?? XP_MILESTONES[0];
  const nextMilestone = XP_MILESTONES.find((m) => estimatedXP < m.xp);
  const xpToNext = nextMilestone ? nextMilestone.xp - estimatedXP : 0;
  const milestoneProgress = nextMilestone
    ? ((estimatedXP - (currentMilestone?.xp ?? 0)) / (nextMilestone.xp - (currentMilestone?.xp ?? 0))) * 100
    : 100;

  // Detect rank up
  useEffect(() => {
    if (prevMilestoneRef.current && prevMilestoneRef.current !== currentMilestone.label) {
      setNewRank(currentMilestone);
      setShowRankAnim(true);
    }
    prevMilestoneRef.current = currentMilestone.label;
  }, [currentMilestone.label]);

  return (
    <div className="flex flex-col gap-7 animate-fade-in max-w-2xl mx-auto">

      {/* Epic rank up animation */}
      {showRankAnim && newRank && (
        <AchievementAnimation
          type="rank"
          title={newRank.label}
          subtitle="You reached a new rank!"
          image={newRank.image}
          onDismiss={() => setShowRankAnim(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <Image src="/daily_challenge.png" alt="Daily Challenge" width={64} height={64} className="drop-shadow-lg animate-float" />
        <div>
          <h1 className="text-3xl font-extrabold" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>
            Daily Quest 🎯
          </h1>
          <p className="font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            A new challenge awaits every day. Complete it to earn XP!
          </p>
        </div>
      </div>

      {/* Today's challenge */}
      <DailyChallenge mode="full" />

      {/* XP / Rank card */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={18} style={{ color: 'var(--success)' }} />
          <h2 className="font-extrabold text-lg" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>
            Your Rank
          </h2>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden"
            style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <Image src={currentMilestone.image} alt={currentMilestone.label} width={56} height={56} className="object-contain" />
          </div>
          <div className="flex-1">
            <p className="text-xl font-extrabold" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>
              {currentMilestone.label}
            </p>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{estimatedXP} XP earned</p>
            {nextMilestone && (
              <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {xpToNext} XP to{' '}
                <Image src={nextMilestone.image} alt={nextMilestone.label} width={14} height={14} className="inline object-contain" />{' '}
                {nextMilestone.label}
              </p>
            )}
          </div>
          <div className="text-right flex-shrink-0" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>
            <span className="text-2xl font-extrabold">{estimatedXP}</span>
            <span className="text-sm font-bold ml-1" style={{ color: 'var(--text-muted)' }}>XP</span>
          </div>
        </div>

        {nextMilestone && (
          <div>
            <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${milestoneProgress}%`, background: 'linear-gradient(90deg, var(--success), #82c97a)' }} />
            </div>
            <div className="flex justify-between text-xs font-semibold mt-1.5" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1">
                <Image src={currentMilestone.image} alt={currentMilestone.label} width={14} height={14} className="inline object-contain" />
                {currentMilestone.label}
              </span>
              <span className="flex items-center gap-1">
                <Image src={nextMilestone.image} alt={nextMilestone.label} width={14} height={14} className="inline object-contain" />
                {nextMilestone.label}
              </span>
            </div>
          </div>
        )}

        {/* All rank milestones row */}
        <div className="flex items-center justify-between mt-5 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          {XP_MILESTONES.map((m) => {
            const reached = estimatedXP >= m.xp;
            const isCurrent = currentMilestone.label === m.label;
            return (
              <div key={m.label} className="flex flex-col items-center gap-1" title={`${m.label} — ${m.xp} XP`}>
                <div className="rounded-xl p-1 transition-all"
                  style={{ backgroundColor: isCurrent ? 'var(--bg-secondary)' : 'transparent', border: isCurrent ? '2px solid var(--success)' : '2px solid transparent', opacity: reached ? 1 : 0.35 }}>
                  <Image src={m.image} alt={m.label} width={32} height={32} className="object-contain" />
                </div>
                <span className="text-[9px] font-bold" style={{ color: isCurrent ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {m.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: '✅', label: 'Tasks Done',   value: taskStats.completed },
          { icon: '🔄', label: 'Habits Today', value: `${dailyStats.completedToday}/${dailyStats.total}` },
          { icon: '⚡', label: 'Total XP',     value: estimatedXP },
        ].map((s) => (
          <div key={s.label} className="card text-center border-0" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-extrabold" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>
              {s.value}
            </div>
            <div className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quest Board */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Target size={18} style={{ color: 'var(--success)' }} />
          <h2 className="font-extrabold text-lg" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>
            Quest Board
          </h2>
          <span className="text-xs font-semibold ml-1" style={{ color: 'var(--text-muted)' }}>All possible daily quests</span>
        </div>

        <div className="flex flex-col gap-2">
          {ALL_CHALLENGES.map((c) => {
            const isToday = challenge?.title === c.title;
            return (
              <div key={c.title} className="flex items-center gap-3 p-3 rounded-xl transition-all"
                style={{ backgroundColor: isToday ? 'var(--bg-secondary)' : 'transparent', border: isToday ? '1px solid var(--border-strong)' : '1px solid transparent' }}>
                <Image src={c.image} alt={c.title} width={36} height={36} className="object-contain flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    {c.title}
                    {isToday && (
                      <span className="text-xs font-extrabold px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}>
                        TODAY
                      </span>
                    )}
                  </p>
                  <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>{c.description}</p>
                </div>
                <span className="text-xs font-extrabold flex-shrink-0 px-2 py-1 rounded-lg"
                  style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
                  +{c.xp} XP
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tip */}
      <div className="rounded-2xl p-4 text-sm font-semibold"
        style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
        💡 Challenges are picked smartly based on your pending tasks. Urgent tasks? You'll get a firefighting quest. Lots of habits? A Perfect Day quest. They refresh every midnight 🌙
      </div>
    </div>
  );
}