'use client';
// app/dashboard/page.tsx

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TrendingUp, Plus, ArrowRight, Flame } from 'lucide-react';
import { useTaskStore } from '@/hooks/useTaskStore';
import { useDailyStore } from '@/hooks/useDailyStore';
import { useAuth } from '@/hooks/useAuth';
import { useWidgetStore } from '@/hooks/useWidgetStore';
import { getGreeting, formatDueDate, isOverdue, getPriorityConfig, cn } from '@/utils';
import { format } from 'date-fns';
import ShareCard from '@/components/ShareCard';
import DailyChallenge from '@/components/DailyChallenge';
import WidgetCustomizer from '@/components/WidgetCustomizer';
import dynamic from 'next/dynamic';
const StreakPetCard = dynamic(
  () => import('@/components/StreakPet').then(m => m.StreakPetCard),
  { ssr: false }
);

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { tasks, loading, getStats } = useTaskStore();
  const { activities, fetchActivities, toggleActivity, getStats: getDailyStats } = useDailyStore();
  const { getEnabled } = useWidgetStore();
  const [showShare, setShowShare] = useState(false);
  const [mounted, setMounted] = useState(false);

  const stats = getStats();
  const dailyStats = getDailyStats();
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Friend';
  const enabledWidgets = getEnabled();

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { fetchActivities(); }, []);

  const recentTasks = tasks
    .filter((t) => t.status !== 'completed' && t.status !== 'archived')
    .slice(0, 5);

  const STAT_CARDS = [
    { label: 'Total Tasks',  value: stats.total,     icon: '/icon-check.png',     bg: 'bg-cream-100' },
    { label: 'Completed',    value: stats.completed,  icon: '/icon-check.png',     bg: 'bg-moss-50'   },
    { label: 'Pending',      value: stats.pending,    icon: '/icon-stopwatch.png', bg: 'bg-cream-200' },
    { label: 'Overdue',      value: stats.overdue,    icon: '/icon-priority.png',  bg: stats.overdue > 0 ? 'bg-red-50' : 'bg-cream-100' },
  ];

  const renderWidget = (id: string) => {
    switch (id) {
      case 'greeting':
        return (
          <div key="greeting" className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-bark-400 text-sm font-semibold mb-1">{format(new Date(), 'EEEE, MMMM d')}</p>
              <h1 className="text-3xl font-extrabold text-bark-600" style={{ fontFamily: "'Baloo 2', cursive" }}>
                {getGreeting()}, {displayName}! 🌿
              </h1>
              <p className="text-bark-400 font-medium mt-1">
                {stats.pending === 0
                  ? "You're all caught up! Amazing work ✨"
                  : `You have ${stats.pending} task${stats.pending !== 1 ? 's' : ''} to tackle today.`}
              </p>
            </div>
            <Image src="/logo.png" alt="CapyDo" width={64} height={64}
              className="rounded-2xl shadow-bark animate-float hidden sm:block cursor-pointer hover:scale-110 transition-transform"
              onClick={() => setShowShare(true)} />
          </div>
        );

      case 'stats':
        return (
          <div key="stats" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STAT_CARDS.map((card) => (
              <div key={card.label} className={`card ${card.bg} border-0 card-lift`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-white/60 flex items-center justify-center">
                    <Image src={card.icon} alt={card.label} width={24} height={24} className="object-contain" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-bark-600" style={{ fontFamily: "'Baloo 2', cursive" }}>
                  {card.value}
                </div>
                <div className="text-sm text-bark-400 font-semibold mt-0.5">{card.label}</div>
              </div>
            ))}
          </div>
        );

      case 'progress':
        return stats.total > 0 ? (
          <div key="progress" className="card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Image src="/icon-analytics.png" alt="progress" width={20} height={20} className="object-contain" />
                <span className="font-bold text-bark-600">Completion Rate</span>
              </div>
              <span className="text-2xl font-extrabold text-moss-500" style={{ fontFamily: "'Baloo 2', cursive" }}>
                {stats.completionRate}%
              </span>
            </div>
            <div className="h-3 bg-cream-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-moss-400 to-moss-300 rounded-full transition-all duration-700"
                style={{ width: `${stats.completionRate}%` }} />
            </div>
            <div className="flex justify-between text-xs text-bark-400 font-semibold mt-2">
              <span>{stats.completed} completed</span>
              <span>{stats.pending} remaining</span>
            </div>
          </div>
        ) : null;

      case 'challenge':
        return <DailyChallenge key="challenge" mode="compact" />;

      case 'habits':
        return activities.length > 0 ? (
          <div key="habits" className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Image src="/icon-daily.png" alt="habits" width={22} height={22} className="object-contain" />
                <h2 className="text-lg font-extrabold text-bark-600" style={{ fontFamily: "'Baloo 2', cursive" }}>Today's Habits</h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-bark-400">{dailyStats.completedToday}/{dailyStats.total} done</span>
                <Link href="/dashboard/daily" className="flex items-center gap-1 text-sm text-moss-500 font-bold hover:text-moss-600 transition-colors">
                  View all <ArrowRight size={14} />
                </Link>
              </div>
            </div>
            <div className="h-2 bg-cream-200 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-gradient-to-r from-moss-400 to-moss-300 rounded-full transition-all duration-700"
                style={{ width: `${dailyStats.completionRate}%` }} />
            </div>
            <div className="flex flex-col gap-2">
              {activities.slice(0, 5).map((activity) => (
                <button key={activity.id} onClick={() => toggleActivity(activity.id)}
                  className={cn('flex items-center gap-3 p-2.5 rounded-xl transition-all text-left hover:bg-cream-50 group', activity.completed_today && 'opacity-60')}>
                  <div className={cn('w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all', activity.completed_today ? 'border-transparent' : 'border-bark-300')}
                    style={activity.completed_today ? { backgroundColor: activity.color } : {}}>
                    {activity.completed_today && <span className="text-white text-xs font-bold">✓</span>}
                  </div>
                  <span className="text-lg flex-shrink-0">{activity.icon}</span>
                  <span className={cn('font-semibold text-sm text-bark-600 flex-1', activity.completed_today && 'line-through text-bark-400')}>{activity.title}</span>
                  {(activity.streak ?? 0) > 1 && (
                    <span className="flex items-center gap-0.5 text-xs font-bold text-amber-500">
                      <Image src="/ic-fire.png" alt="streak" width={12} height={12} className="object-contain" /> {activity.streak}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div key="habits-empty" onClick={() => router.push('/dashboard/daily')}
            className="card card-lift flex items-center gap-4 border-dashed border-2 border-cream-300 bg-cream-50/50 hover:border-moss-300 transition-colors group cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-moss-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Image src="/icon-daily.png" alt="daily" width={32} height={32} className="object-contain" />
            </div>
            <div>
              <p className="font-extrabold text-bark-500" style={{ fontFamily: "'Baloo 2', cursive" }}>Start Daily Habits</p>
              <p className="text-bark-400 text-sm font-medium">Track activities that reset every day</p>
            </div>
            <ArrowRight size={18} className="text-bark-300 ml-auto group-hover:text-moss-500 transition-colors" />
          </div>
        );

      case 'tasks':
        return (
          <div key="tasks" className="card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-extrabold text-bark-600" style={{ fontFamily: "'Baloo 2', cursive" }}>Pending Tasks</h2>
              <Link href="/dashboard/tasks" className="flex items-center gap-1 text-sm text-moss-500 font-bold hover:text-moss-600 transition-colors">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            {loading ? (
              <div className="flex flex-col gap-3">{[1,2,3].map((i) => <div key={i} className="h-14 rounded-xl shimmer" />)}</div>
            ) : recentTasks.length === 0 ? (
              <div className="text-center py-10">
                <Image src="/icon-check.png" alt="all clear" width={56} height={56} className="object-contain mx-auto mb-3" />
                <p className="font-bold text-bark-500 mb-1">All clear!</p>
                <p className="text-bark-400 text-sm font-medium">No pending tasks right now.</p>
                <button onClick={() => router.push('/dashboard/tasks')}
                  className="btn-primary inline-flex items-center gap-2 mt-4 text-sm">
                  <Plus size={16} /> Add a Task
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {recentTasks.map((task) => {
                  const priority = getPriorityConfig(task.priority);
                  const overdue = isOverdue(task.due_date, task.status);
                  return (
                    <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-cream-50 transition-colors group">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: priority.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-bark-600 text-sm truncate">{task.title}</p>
                        {task.due_date && (
                          <p className={`text-xs font-medium mt-0.5 ${overdue ? 'text-red-500' : 'text-bark-400'}`}>
                            {overdue ? '⚠️ Overdue · ' : '📅 '}{formatDueDate(task.due_date)}
                          </p>
                        )}
                      </div>
                      {task.category && (
                        <span className="hidden sm:flex text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0"
                          style={{ backgroundColor: task.category.color + '25', color: task.category.color }}>
                          {task.category.icon} {task.category.name}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 'pomodoro':
        return (
          <div key="pomodoro" onClick={() => router.push('/dashboard/pomodoro')}
            className="card card-lift flex items-center gap-4 hover:border-red-300 transition-colors group cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Image src="/pomodoro_work.png" alt="pomodoro" width={40} height={40} className="object-contain" />
            </div>
            <div>
              <p className="font-extrabold text-bark-500" style={{ fontFamily: "'Baloo 2', cursive" }}>Start Pomodoro</p>
              <p className="text-bark-400 text-sm font-medium">Focus timer — 25 min work sessions</p>
            </div>
            <ArrowRight size={18} className="text-bark-300 ml-auto group-hover:text-red-400 transition-colors" />
          </div>
        );

      case 'mood':
        return (
          <div key="mood" onClick={() => router.push('/dashboard/tracker')}
            className="card card-lift flex items-center gap-4 hover:border-purple-300 transition-colors group cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Image src="/icon-mood.png" alt="mood" width={32} height={32} className="object-contain" />
            </div>
            <div>
              <p className="font-extrabold text-bark-500" style={{ fontFamily: "'Baloo 2', cursive" }}>Log Your Mood</p>
              <p className="text-bark-400 text-sm font-medium">How are you feeling today?</p>
            </div>
            <ArrowRight size={18} className="text-bark-300 ml-auto group-hover:text-purple-400 transition-colors" />
          </div>
        );

      case 'share':
        return (
          <button key="share" onClick={() => setShowShare(true)}
            className="card card-lift flex items-center gap-4 border-dashed border-2 border-bark-200 bg-cream-50/50 hover:border-bark-400 transition-colors group w-full text-left">
            <div className="w-12 h-12 rounded-xl bg-bark-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Image src="/icon-analytics.png" alt="share" width={32} height={32} className="object-contain" />
            </div>
            <div>
              <p className="font-extrabold text-bark-500" style={{ fontFamily: "'Baloo 2', cursive" }}>Share Your Progress</p>
              <p className="text-bark-400 text-sm font-medium">Generate a shareable progress card</p>
            </div>
            <ArrowRight size={18} className="text-bark-300 ml-auto group-hover:text-bark-500 transition-colors" />
          </button>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-7 animate-fade-in">
      <div className="flex items-center justify-between">
        <div />
        <WidgetCustomizer />
      </div>
      <StreakPetCard />
      {mounted && enabledWidgets.map((w) => renderWidget(w.id))}
      {showShare && <ShareCard onClose={() => setShowShare(false)} />}
    </div>
  );
}