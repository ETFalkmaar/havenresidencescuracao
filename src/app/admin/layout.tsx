import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./login/actions";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The login page has its own minimal shell — render it without the chrome.
  // We can't distinguish here easily, so the login page is at /admin/login and
  // simply renders inside this layout but skips auth via early-return: we set
  // the children directly when no user is needed.
  // Implementation note: /admin/login is a sibling route — it's matched by
  // this layout. To avoid a redirect loop, we check the user first and only
  // protect non-login routes via a check inside each protected page.
  // For simplicity here, /admin/login renders its own <main> and ignores the
  // layout's chrome by returning early through a different layout? In Next.js
  // App Router, layouts apply to all child routes. We solve this by rendering
  // chrome only when we have a verified admin user, and rendering children
  // bare otherwise.

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not signed in: only the /login route works. Render children bare.
  if (!user) {
    return <>{children}</>;
  }

  // Signed in: check if admin
  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("user_id, role, email")
    .eq("user_id", user.id)
    .maybeSingle();

  // If not admin yet, attempt bootstrap (only succeeds if no admin exists)
  let isAdmin = !!adminRow;
  if (!isAdmin) {
    const { data, error } = await supabase.rpc("bootstrap_first_admin");
    const result = data as { ok: boolean; error?: string } | null;
    if (!error && result?.ok) {
      isAdmin = true;
    }
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen grid place-items-center px-6 py-16 bg-neutral-50 dark:bg-neutral-950">
        <div className="max-w-md w-full text-center space-y-6">
          <h1 className="text-3xl font-extralight">Not authorized</h1>
          <p className="text-sm text-neutral-500">
            The account <strong>{user.email}</strong> is signed in but isn&apos;t
            an admin. Ask the owner to invite you, or sign out and try a
            different account.
          </p>
          <form action={signOut}>
            <button
              type="submit"
              className="px-5 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900 transition"
            >
              Sign out
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      <header className="border-b border-neutral-200 dark:border-neutral-900 bg-white/80 dark:bg-neutral-950/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              href="/admin"
              className="text-sm font-medium tracking-wide hover:opacity-80 transition"
            >
              Haven Residence · Admin
            </Link>
            <nav className="hidden md:flex gap-6 text-sm text-neutral-600 dark:text-neutral-400">
              <Link href="/admin" className="hover:text-neutral-900 dark:hover:text-neutral-100">
                Dashboard
              </Link>
              <Link href="/admin/properties" className="hover:text-neutral-900 dark:hover:text-neutral-100">
                Residences
              </Link>
              <Link href="/admin/units" className="hover:text-neutral-900 dark:hover:text-neutral-100">
                Units
              </Link>
              <Link href="/admin/inquiries" className="hover:text-neutral-900 dark:hover:text-neutral-100">
                Inquiries
              </Link>
              <Link href="/admin/bookings" className="hover:text-neutral-900 dark:hover:text-neutral-100">
                Bookings
              </Link>
              <Link href="/admin/settings" className="hover:text-neutral-900 dark:hover:text-neutral-100">
                Settings
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden sm:inline text-neutral-500">{user.email}</span>
            <form action={signOut}>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-900 transition"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}

