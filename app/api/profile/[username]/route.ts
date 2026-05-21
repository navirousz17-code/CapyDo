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

  // Get public stats
  const { data: tasks } = await supabase
    .from('tasks')
    .select('status, created_at')
    .eq('user_id', profile.id);

  const { data: activities } = await supabase
    .from('daily_activities')
    .select('id')
    .eq('user_id', profile.id);

  const total = tasks?.length ?? 0;
  const completed = tasks?.filter((t) => t.status === 'completed').length ?? 0;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return NextResponse.json({
    profile,
    stats: { total, completed, completionRate, habitCount: activities?.length ?? 0 },
  });
}