import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const allowed = ['full_name', 'bio', 'username', 'is_public', 'theme', 'notification_daily_summary', 'notification_due_reminders', 'push_subscription', 'avatar_url'];
  const updates: Record<string, unknown> = {};
  allowed.forEach((key) => { if (body[key] !== undefined) updates[key] = body[key]; });

  // Validate username
  if (updates.username) {
    const username = (updates.username as string).toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (username.length < 3) return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 });
    updates.username = username;
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    if (error.message.includes('unique')) return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}