import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const today = new Date().toISOString().split('T')[0];

  // Get all activities
  const { data: activities, error } = await supabase
    .from('daily_activities')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get today's completions
  const { data: completions } = await supabase
    .from('daily_activity_completions')
    .select('activity_id, completed_date')
    .eq('user_id', user.id)
    .gte('completed_date', today);

  const completedIds = new Set(completions?.map((c) => c.activity_id) ?? []);

  // Get streak data (last 30 days completions)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const { data: allCompletions } = await supabase
    .from('daily_activity_completions')
    .select('activity_id, completed_date')
    .eq('user_id', user.id)
    .gte('completed_date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('completed_date', { ascending: false });

  // Compute streaks per activity
  const streakMap: Record<string, number> = {};
  if (allCompletions) {
    const byActivity: Record<string, string[]> = {};
    allCompletions.forEach((c) => {
      if (!byActivity[c.activity_id]) byActivity[c.activity_id] = [];
      byActivity[c.activity_id].push(c.completed_date);
    });

    Object.entries(byActivity).forEach(([actId, dates]) => {
      const sorted = [...new Set(dates)].sort().reverse();
      let streak = 0;
      const now = new Date();
      for (let i = 0; i < sorted.length; i++) {
        const expected = new Date(now);
        expected.setDate(expected.getDate() - i);
        const expectedStr = expected.toISOString().split('T')[0];
        if (sorted[i] === expectedStr) streak++;
        else break;
      }
      streakMap[actId] = streak;
    });
  }

  const enriched = (activities ?? []).map((a) => ({
    ...a,
    completed_today: completedIds.has(a.id),
    streak: streakMap[a.id] ?? 0,
  }));

  return NextResponse.json(enriched);
}

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, icon, color } = await request.json();
  if (!title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

  const { data, error } = await supabase
    .from('daily_activities')
    .insert({ user_id: user.id, title: title.trim(), icon: icon || '⭐', color: color || '#82bf7b' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ...data, completed_today: false, streak: 0 }, { status: 201 });
}
