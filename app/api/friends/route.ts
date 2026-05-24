// app/api/friends/route.ts
// REPLACE your existing file with this

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // ✅ FIX: fetch friendships without foreign key hints
  const { data: friendships, error } = await supabase
    .from('friendships')
    .select('*')
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Friends fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!friendships || friendships.length === 0) return NextResponse.json([]);

  // ✅ FIX: fetch profiles separately
  const userIds = new Set<string>();
  friendships.forEach((f) => {
    userIds.add(f.requester_id);
    userIds.add(f.addressee_id);
  });

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url')
    .in('id', Array.from(userIds));

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));

  // Attach profiles to friendships
  const enriched = friendships.map((f) => ({
    ...f,
    requester: profileMap[f.requester_id] ?? null,
    addressee: profileMap[f.addressee_id] ?? null,
  }));

  return NextResponse.json(enriched);
}

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { addressee_id } = await req.json();
  if (!addressee_id) return NextResponse.json({ error: 'addressee_id required' }, { status: 400 });
  if (addressee_id === user.id) return NextResponse.json({ error: 'Cannot friend yourself' }, { status: 400 });

  const { data, error } = await supabase
    .from('friendships')
    .insert({ requester_id: user.id, addressee_id, status: 'pending' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Log activity
  await supabase.from('activity_feed').insert({
    user_id: user.id,
    type: 'task_completed',
    title: 'Sent a friend request',
    emoji: '👋',
  });

  return NextResponse.json(data);
}