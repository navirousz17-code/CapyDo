// app/api/recurring-tasks/[id]/route.ts
// Place at: app/api/recurring-tasks/[id]/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  const { data, error } = await supabase
    .from('recurring_tasks')
    .update(body)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .select('*, category:categories(id, name, color, icon)')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabase
    .from('recurring_tasks')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// Spawn: manually trigger a task spawn from a recurring template
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Get the recurring task
  const { data: rt, error: rtErr } = await supabase
    .from('recurring_tasks')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (rtErr || !rt) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Calculate next due date
  const today = new Date();
  let dueDate = today.toISOString().split('T')[0];

  if (rt.interval === 'weekly' && rt.day_of_week != null) {
    const d = new Date();
    const diff = (rt.day_of_week - d.getDay() + 7) % 7 || 7;
    d.setDate(d.getDate() + diff);
    dueDate = d.toISOString().split('T')[0];
  } else if (rt.interval === 'monthly' && rt.day_of_month != null) {
    const d = new Date(today.getFullYear(), today.getMonth(), rt.day_of_month);
    if (d <= today) d.setMonth(d.getMonth() + 1);
    dueDate = d.toISOString().split('T')[0];
  }

  // Create real task
  const { data: task, error: taskErr } = await supabase
    .from('tasks')
    .insert({
      user_id: user.id,
      title: rt.title,
      description: rt.description,
      priority: rt.priority,
      category_id: rt.category_id,
      due_date: dueDate,
      status: 'pending',
    })
    .select()
    .single();

  if (taskErr) return NextResponse.json({ error: taskErr.message }, { status: 500 });

  // Update last_spawned_at
  await supabase
    .from('recurring_tasks')
    .update({ last_spawned_at: today.toISOString().split('T')[0] })
    .eq('id', params.id);

  return NextResponse.json(task);
}