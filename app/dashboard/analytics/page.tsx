'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, CheckCircle2, AlertTriangle, Flame, Star, Calendar, BarChart3, RefreshCw } from 'lucide-react';
import { cn } from '@/utils';

interface WeeklyDataPoint { date: string; label: string; completed: number; created: number; }
interface HeatmapPoint { date: string; label: string; count: number; rate: number; totalActivities: number; }
interface CategoryData { name: string; color: string; icon: string; total: number; completed: number; }
interface AnalyticsData {
  weeklyData: WeeklyDataPoint[];
  heatmapData: HeatmapPoint[];
  categoryData: CategoryData[];
  stats: { totalTasks: number; completedTasks: number; overdueTasks: number; avgCompletionRate: number; bestDay: string; longestStreak: number; };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-10 w-48 bg-cream-200 rounded-xl" />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-28 bg-cream-200 rounded-2xl" />)}
      </div>
      <div className="h-64 bg-cream-200 rounded-2xl" />
      <div className="h-48 bg-cream-200 rounded-2xl" />
    </div>
  );

  if (!data) return <div className="card text-center py-16 text-bark-400">Failed to load analytics</div>;

  const { weeklyData, heatmapData, categoryData, stats } = data;
  const maxCompleted = Math.max(...weeklyData.map((d) => d.completed), 1);
  const maxCreated = Math.max(...weeklyData.map((d) => d.created), 1);
  const maxBar = Math.max(maxCompleted, maxCreated);

  const getHeatColor = (rate: number, total: number) => {
    if (total === 0) return '#faf2d3';
    if (rate === 0) return '#faf2d3';
    if (rate <= 25) return '#dceeda';
    if (rate <= 50) return '#b3d9ae';
    if (rate <= 75) return '#82bf7b';
    return '#3d7e37';
  };

  return (
    <div className="flex flex-col gap-7 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-bark-600" style={{ fontFamily: "'Baloo 2', cursive" }}>
          Analytics 📊
        </h1>
        <p className="text-bark-400 text-sm font-medium mt-0.5">Your productivity at a glance</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Total Tasks', value: stats.totalTasks, icon: CheckCircle2, bg: 'bg-cream-100', color: 'text-bark-600', iconColor: 'text-bark-400' },
          { label: 'Completed', value: stats.completedTasks, icon: CheckCircle2, bg: 'bg-moss-50', color: 'text-moss-600', iconColor: 'text-moss-400' },
          { label: 'Completion Rate', value: `${stats.avgCompletionRate}%`, icon: TrendingUp, bg: 'bg-cream-200', color: 'text-bark-600', iconColor: 'text-bark-400' },
          { label: 'Overdue', value: stats.overdueTasks, icon: AlertTriangle, bg: stats.overdueTasks > 0 ? 'bg-red-50' : 'bg-cream-100', color: stats.overdueTasks > 0 ? 'text-red-600' : 'text-bark-600', iconColor: stats.overdueTasks > 0 ? 'text-red-400' : 'text-bark-400' },
          { label: 'Best Day', value: stats.bestDay, icon: Star, bg: 'bg-amber-50', color: 'text-amber-600', iconColor: 'text-amber-400' },
          { label: 'Longest Streak', value: `${stats.longestStreak}d`, icon: Flame, bg: 'bg-orange-50', color: 'text-orange-600', iconColor: 'text-orange-400' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`card ${s.bg} border-0 card-lift`}>
              <div className={`w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center ${s.iconColor} mb-3`}>
                <Icon size={16} />
              </div>
              <div className={`text-3xl font-extrabold ${s.color}`} style={{ fontFamily: "'Baloo 2', cursive" }}>
                {s.value}
              </div>
              <div className="text-xs text-bark-400 font-semibold mt-0.5">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Weekly bar chart */}
      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 size={18} className="text-bark-400" />
          <h2 className="text-lg font-extrabold text-bark-600" style={{ fontFamily: "'Baloo 2', cursive" }}>
            Last 7 Days
          </h2>
          <div className="flex items-center gap-4 ml-auto text-xs font-semibold">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-moss-400 inline-block" /> Completed</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-cream-300 inline-block" /> Created</span>
          </div>
        </div>
        <div className="flex items-end gap-3 h-48">
          {weeklyData.map((day) => (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end gap-1 h-40">
                {/* Created bar */}
                <div className="flex-1 flex flex-col justify-end">
                  <div
                    className="w-full bg-cream-300 rounded-t-lg transition-all duration-700"
                    style={{ height: `${maxBar > 0 ? (day.created / maxBar) * 100 : 0}%`, minHeight: day.created > 0 ? '8px' : '0' }}
                    title={`${day.created} created`}
                  />
                </div>
                {/* Completed bar */}
                <div className="flex-1 flex flex-col justify-end">
                  <div
                    className="w-full bg-moss-400 rounded-t-lg transition-all duration-700"
                    style={{ height: `${maxBar > 0 ? (day.completed / maxBar) * 100 : 0}%`, minHeight: day.completed > 0 ? '8px' : '0' }}
                    title={`${day.completed} completed`}
                  />
                </div>
              </div>
              <span className="text-xs font-bold text-bark-400">{day.label}</span>
              <span className="text-xs font-semibold text-moss-500">{day.completed > 0 ? day.completed : ''}</span>
            </div>
          ))}
        </div>
        {stats.completedTasks === 0 && (
          <p className="text-center text-bark-400 text-sm font-medium mt-4">Complete some tasks to see your chart! 🌿</p>
        )}
      </div>

      {/* Habit Heatmap */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <RefreshCw size={18} className="text-bark-400" />
          <h2 className="text-lg font-extrabold text-bark-600" style={{ fontFamily: "'Baloo 2', cursive" }}>
            Habit Heatmap — Last 30 Days
          </h2>
        </div>
        <div className="grid grid-cols-10 gap-1.5">
          {heatmapData.map((day) => (
            <div
              key={day.date}
              className="aspect-square rounded-md cursor-default transition-transform hover:scale-110 group relative"
              style={{ backgroundColor: getHeatColor(day.rate, day.totalActivities) }}
              title={`${day.label}: ${day.count}/${day.totalActivities} habits (${day.rate}%)`}
            >
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-bark-600 text-cream-50 text-xs font-semibold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                {day.label}: {day.count}/{day.totalActivities}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-4 justify-end">
          <span className="text-xs text-bark-400 font-semibold">Less</span>
          {['#faf2d3', '#dceeda', '#b3d9ae', '#82bf7b', '#3d7e37'].map((c) => (
            <div key={c} className="w-4 h-4 rounded" style={{ backgroundColor: c }} />
          ))}
          <span className="text-xs text-bark-400 font-semibold">More</span>
        </div>
        {data.heatmapData[0]?.totalActivities === 0 && (
          <p className="text-center text-bark-400 text-sm font-medium mt-3">Add daily activities to see your habit heatmap! 🌿</p>
        )}
      </div>

      {/* Category breakdown */}
      {categoryData.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <Calendar size={18} className="text-bark-400" />
            <h2 className="text-lg font-extrabold text-bark-600" style={{ fontFamily: "'Baloo 2', cursive" }}>
              Tasks by Category
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {categoryData.map((cat) => {
              const rate = cat.total > 0 ? Math.round((cat.completed / cat.total) * 100) : 0;
              return (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cat.icon}</span>
                      <span className="font-bold text-bark-600 text-sm">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-semibold text-bark-400">
                      <span>{cat.completed}/{cat.total} done</span>
                      <span className="font-bold" style={{ color: cat.color }}>{rate}%</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-cream-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${rate}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Donut-style summary */}
      {stats.totalTasks > 0 && (
        <div className="card bg-gradient-to-br from-moss-50 to-cream-100 border-moss-200">
          <h2 className="text-lg font-extrabold text-bark-600 mb-4" style={{ fontFamily: "'Baloo 2', cursive" }}>
            Overall Summary
          </h2>
          <div className="flex items-center gap-6">
            {/* Circle progress */}
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#faf2d3" strokeWidth="12" />
                <circle
                  cx="50" cy="50" r="40" fill="none"
                  stroke="#5aa352" strokeWidth="12"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - stats.avgCompletionRate / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-extrabold text-bark-600" style={{ fontFamily: "'Baloo 2', cursive" }}>
                  {stats.avgCompletionRate}%
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-moss-400" />
                <span className="text-sm font-semibold text-bark-500">{stats.completedTasks} completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cream-300" />
                <span className="text-sm font-semibold text-bark-500">{stats.totalTasks - stats.completedTasks} remaining</span>
              </div>
              {stats.overdueTasks > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-300" />
                  <span className="text-sm font-semibold text-red-500">{stats.overdueTasks} overdue</span>
                </div>
              )}
              <div className="flex items-center gap-2 mt-1">
                <Flame size={14} className="text-amber-500" />
                <span className="text-sm font-bold text-amber-600">Best day: {stats.bestDay}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}