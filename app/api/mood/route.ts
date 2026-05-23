// app/api/mood/route.ts
// Place at: app/api/mood/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('mood_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(30);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { mood, note, energy } = await req.json();
  if (!mood || mood < 1 || mood > 5) return NextResponse.json({ error: 'Mood must be 1-5' }, { status: 400 });

  const today = new Date().toISOString().split('T')[0];

  // Upsert — one entry per day
  const { data, error } = await supabase
    .from('mood_entries')
    .upsert({
      user_id: user.id,
      mood,
      note: note?.trim() || null,
      energy: energy || null,
      date: today,
    }, { onConflict: 'user_id,date' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}