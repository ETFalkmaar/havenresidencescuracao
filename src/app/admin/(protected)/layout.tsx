import { redirect } from 'next/navigation';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { createClient } from '@/lib/supabase/server';

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const { data: adminRow } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!adminRow) {
    redirect('/admin/login?error=not-admin');
  }

  return (
    <div className="min-h-screen bg-cream-100">
      <AdminHeader email={user.email ?? ''} />
      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
    </div>
  );
}
