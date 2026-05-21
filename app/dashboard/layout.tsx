import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import DashboardShell from '@/components/layout/DashboardShell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect('/auth/login');

  return <DashboardShell user={session.user}>{children}</DashboardShell>;
}
