import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest, { params }: { params: { username: string } }) {
  const supabase = createRouteHandlerClient({ cookies });

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, full_name, username, bio, avatar_url, is_public, created_at')
    .eq('username', params.username.toLowerCase())
    .eq('is_public', true)
    .single();

  if (error || !profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  // Tasks
  const { data: tasks } = await supabase
    .from('tasks')
    .select('status')
    .eq('user_id', profile.id);

  const total = tasks?.length ?? 0;
  const completed = tasks?.filter((t) => t.status === 'completed').length ?? 0;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Habits
  const { data: activities } = await supabase
    .from('daily_activities')
    .select('id, streak')
    .eq('user_id', profile.id);

  const habitCount = activities?.length ?? 0;
  const currentStreak = Math.max(...(activities ?? []).map((a) => a.streak ?? 0), 0);

  // Badges
  const { data: badgeRows } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', profile.id);

  const badges = (badgeRows ?? []).map((b) => b.badge_id);

  // Habit completions count
  const { count: habitsCompleted } = await supabase
    .from('daily_activity_completions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', profile.id);

  // XP estimate
  const xp = completed * 20 + (habitsCompleted ?? 0) * 5;
  const petXp = xp;

  return NextResponse.json({
    profile,
    stats: {
      total,
      completed,
      completionRate,
      habitCount,
      currentStreak,
      badges,
      xp,
      petXp,
    },
  });
}