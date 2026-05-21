import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

interface Params { params: { id: string } }

export async function POST(_req: NextRequest, { params }: Params) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const today = new Date().toISOString().split('T')[0];

  // Check if already completed today
  const { data: existing } = await supabase
    .from('daily_activity_completions')
    .select('id')
    .eq('activity_id', params.id)
    .eq('user_id', user.id)
    .eq('completed_date', today)
    .single();

  if (existing) {
    // Uncomplete it
    await supabase
      .from('daily_activity_completions')
      .delete()
      .eq('id', existing.id);
    return NextResponse.json({ completed: false });
  } else {
    // Complete it
    await supabase
      .from('daily_activity_completions')
      .insert({ activity_id: params.id, user_id: user.id, completed_date: today });
    return NextResponse.json({ completed: true });
  }
}
