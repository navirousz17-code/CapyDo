// app/api/activity-feed/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Get accepted friends
  const { data: friendships } = await supabase
    .from('friendships')
    .select('requester_id, addressee_id')
    .eq('status', 'accepted')
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

  const friendIds = (friendships ?? []).map((f) =>
    f.requester_id === user.id ? f.addressee_id : f.requester_id
  );

  const allIds = [user.id, ...friendIds];

  // Fetch activity without join first
  const { data: activities, error } = await supabase
    .from('activity_feed')
    .select('*')
    .in('user_id', allIds)
    .order('created_at', { ascending: false })
    .limit(30);

  if (error) {
    console.error('Activity feed error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch profiles separately
  const userIds = [...new Set((activities ?? []).map((a) => a.user_id))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url')
    .in('id', userIds);

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));

  const result = (activities ?? []).map((a) => ({
    ...a,
    profile: profileMap[a.user_id] ?? null,
  }));

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { type, title, description, emoji } = await req.json();

  const { data, error } = await supabase
    .from('activity_feed')
    .insert({ user_id: user.id, type, title, description, emoji })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}