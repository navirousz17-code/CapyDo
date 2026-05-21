import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const today = new Date();
  const thirtyDaysAgo = subDays(today, 29);

  // All tasks
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, category:categories(*)')
    .eq('user_id', user.id);

  // All daily activity completions (last 30 days)
  const { data: habitCompletions } = await supabase
    .from('daily_activity_completions')
    .select('completed_date, activity_id')
    .eq('user_id', user.id)
    .gte('completed_date', thirtyDaysAgo.toISOString().split('T')[0]);

  // All daily activities
  const { data: dailyActivities } = await supabase
    .from('daily_activities')
    .select('id, title, icon, color')
    .eq('user_id', user.id);

  if (!tasks) return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });

  // --- Weekly chart: tasks completed per day (last 7 days) ---
  const last7Days = eachDayOfInterval({ start: subDays(today, 6), end: today });
  const weeklyData = last7Days.map((day) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const completed = tasks.filter((t) => {
      if (!t.completed_at) return false;
      return format(new Date(t.completed_at), 'yyyy-MM-dd') === dayStr;
    }).length;
    const created = tasks.filter((t) => {
      return format(new Date(t.created_at), 'yyyy-MM-dd') === dayStr;
    }).length;
    return { date: dayStr, label: format(day, 'EEE'), completed, created };
  });

  // --- Habit heatmap: last 30 days ---
  const last30Days = eachDayOfInterval({ start: thirtyDaysAgo, end: today });
  const totalActivities = dailyActivities?.length ?? 0;
  const heatmapData = last30Days.map((day) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const count = habitCompletions?.filter((c) => c.completed_date === dayStr).length ?? 0;
    const rate = totalActivities > 0 ? Math.round((count / totalActivities) * 100) : 0;
    return { date: dayStr, label: format(day, 'MMM d'), count, rate, totalActivities };
  });

  // --- Category breakdown ---
  const categoryMap: Record<string, { name: string; color: string; icon: string; total: number; completed: number }> = {};
  tasks.forEach((t) => {
    const catId = t.category_id ?? 'none';
    const catName = t.category?.name ?? 'Uncategorized';
    const catColor = t.category?.color ?? '#c4965a';
    const catIcon = t.category?.icon ?? '📁';
    if (!categoryMap[catId]) categoryMap[catId] = { name: catName, color: catColor, icon: catIcon, total: 0, completed: 0 };
    categoryMap[catId].total++;
    if (t.status === 'completed') categoryMap[catId].completed++;
  });
  const categoryData = Object.values(categoryMap).sort((a, b) => b.total - a.total);

  // --- Overall stats ---
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const overdueTasks = tasks.filter((t) => {
    if (!t.due_date || t.status === 'completed') return false;
    return new Date(t.due_date) < new Date(format(today, 'yyyy-MM-dd'));
  }).length;
  const avgCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Best day of week
  const dayTotals: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
  tasks.filter((t) => t.completed_at).forEach((t) => {
    const day = format(new Date(t.completed_at!), 'EEE');
    dayTotals[day] = (dayTotals[day] ?? 0) + 1;
  });
  const bestDay = Object.entries(dayTotals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A';

  // Longest task streak (consecutive days with at least 1 completion)
  let longestStreak = 0;
  let currentStreak = 0;
  last30Days.forEach((day) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const hasCompletion = tasks.some((t) => t.completed_at && format(new Date(t.completed_at), 'yyyy-MM-dd') === dayStr);
    if (hasCompletion) { currentStreak++; longestStreak = Math.max(longestStreak, currentStreak); }
    else currentStreak = 0;
  });

  return NextResponse.json({
    weeklyData,
    heatmapData,
    categoryData,
    stats: { totalTasks, completedTasks, overdueTasks, avgCompletionRate, bestDay, longestStreak },
  });
}