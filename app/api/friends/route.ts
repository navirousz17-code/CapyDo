// app/api/friends/route.ts
// Place at: app/api/friends/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Get all friendships involving this user
  const { data, error } = await supabase
    .from('friendships')
    .select(`
      *,
      requester:profiles!friendships_requester_id_fkey(id, username, full_name, avatar_url),
      addressee:profiles!friendships_addressee_id_fkey(id, username, full_name, avatar_url)
    `)
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
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