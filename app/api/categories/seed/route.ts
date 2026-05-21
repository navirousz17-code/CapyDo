import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = createRouteHandlerClient({ cookies });

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({ message: 'Categories already exist' });
    }

    const { error } = await supabase.rpc('seed_default_categories', {
      p_user_id: user.id,
    });

    if (error) throw error;

    return NextResponse.json({ message: 'Categories seeded successfully' });
  } catch (err) {
    console.error('Seed error:', err);
    return NextResponse.json({ error: 'Failed to seed categories' }, { status: 500 });
  }
}
