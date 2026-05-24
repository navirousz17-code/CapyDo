// app/api/users/[username]/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: { username: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { username } = params;

  // Find profile by username OR full_name
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, bio')
    .or(`username.eq.${username},full_name.eq.${decodeURIComponent(username)}`)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Get their completed tasks count
  const { count: tasksCompleted } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', profile.id)
    .eq('status', 'completed');

  // Get their completed habits count
  const { count: habitsCompleted } = await supabase
    .from('daily_activity_completions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', profile.id);

  // Get their badges
  const { data: badgeRows } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', profile.id);

  const badges = (badgeRows ?? []).map((b) => b.badge_id);

  // Estimate XP from tasks + habits
  const xp = (tasksCompleted ?? 0) * 20 + (habitsCompleted ?? 0) * 5;

  // Get streak from daily activities
  const { data: activities } = await supabase
    .from('daily_activities')
    .select('streak')
    .eq('user_id', profile.id)
    .order('streak', { ascending: false })
    .limit(1);

  const currentStreak = activities?.[0]?.streak ?? 0;

  // Pet XP — same as challenge XP for now
  const petXp = xp;

  return NextResponse.json({
    profile,
    stats: {
      tasksCompleted: tasksCompleted ?? 0,
      habitsCompleted: habitsCompleted ?? 0,
      currentStreak,
      xp,
      badges,
      petXp,
    },
  });
}