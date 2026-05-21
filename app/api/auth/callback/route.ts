import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);

    // Seed default categories for new user
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: existing } = await supabase
          .from('categories')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        if (!existing || existing.length === 0) {
          await supabase.rpc('seed_default_categories', { p_user_id: user.id });
        }
      }
    } catch (e) {
      console.error('Failed to seed categories:', e);
    }
  }

  return NextResponse.redirect(new URL('/dashboard', request.url));
}
