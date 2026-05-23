// app/api/time-logs/route.ts
// Place at: app/api/time-logs/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get('task_id');

  let query = supabase
    .from('time_logs')
    .select('*, task:tasks(id, title)')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false });

  if (taskId) query = query.eq('task_id', taskId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { task_id, note } = await req.json();
  if (!task_id) return NextResponse.json({ error: 'task_id required' }, { status: 400 });

  const { data, error } = await supabase
    .from('time_logs')
    .insert({ user_id: user.id, task_id, note, started_at: new Date().toISOString() })
    .select('*, task:tasks(id, title)')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}