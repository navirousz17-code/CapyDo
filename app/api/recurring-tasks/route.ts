// app/api/recurring-tasks/route.ts
// Place at: app/api/recurring-tasks/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('recurring_tasks')
    .select('*, category:categories(id, name, color, icon)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { title, description, priority, category_id, interval, day_of_week, day_of_month } = body;

  if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 });
  if (!interval) return NextResponse.json({ error: 'Interval required' }, { status: 400 });

  const { data, error } = await supabase
    .from('recurring_tasks')
    .insert({
      user_id: user.id,
      title: title.trim(),
      description: description?.trim() || null,
      priority: priority || 'medium',
      category_id: category_id || null,
      interval,
      day_of_week: interval === 'weekly' ? day_of_week : null,
      day_of_month: interval === 'monthly' ? day_of_month : null,
    })
    .select('*, category:categories(id, name, color, icon)')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}