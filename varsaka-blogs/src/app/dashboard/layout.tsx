import { Sidebar } from '@/components/sidebar';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('https://loginto.varsaka.com');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('permissions')
    .eq('id', user.id)
    .single();

  if (profile?.permissions && profile.permissions.access_blogs === false) {
    redirect('https://loginto.varsaka.com?error=access_denied');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background text-foreground">
        {children}
      </main>
    </div>
  );
}
