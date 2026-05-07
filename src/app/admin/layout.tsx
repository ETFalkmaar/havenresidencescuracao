import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./login/actions";
import { SetPasswordForm } from "./set-password/SetPasswordForm";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware should redirect anon users to /admin/login before they
  // reach the layout. The login page itself short-circuits there too.
  // We still defensively render bare for the rare case where a public
  // route (login) reaches this layout.
  if (!user) {
    return <>{children}</>;
  }

  // Signed in: check admin_users
  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("user_id, role, email, password_set")
    .eq("user_id", user.id)
    .maybeSingle();

  let isAdmin = !!adminRow;
  let passwordSet = (adminRow as { password_set: boolean } | null)?.password_set ?? false;

  // Bootstrap: if no admin exists yet, claim the role for this user.
  if (!isAdmin) {
    const { data, error } = await supabase.rpc("bootstrap_first_admin");
    const result = data as { ok: boolean; error?: string } | null;
    if (!error && result?.ok) {
      // Re-read the row so we use the actual password_set the RPC inserted
      // (defaults to false → forces a password change for users who came in
      // via a temp password set in the Supabase dashboard).
      const { data: refetched } = await supabase
        .from("admin_users")
        .select("password_set")
        .eq("user_id", user.id)
        .maybeSingle();
      isAdmin = true;
      passwordSet =
        (refetched as { password_set: boolean } | null)?.password_set ?? false;
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

  // Admin but still on a temp password → force password change.
  if (!passwordSet) {
    return (
      <main className="min-h-screen grid place-items-center px-6 py-16 bg-neutral-50 dark:bg-neutral-950">
        <div className="w-full max-w-md space-y-8">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-neutral-500 mb-3">
              One-time setup
            </p>
            <h1 className="text-3xl font-extralight">Choose your password</h1>
            <p className="text-sm text-neutral-500 mt-3 leading-relaxed">
              You signed in as <strong>{user.email}</strong> with a temporary
              password. Pick a strong one of your own now — it replaces the
              temp password and from this moment only you know it.
            </p>
          </div>

          <SetPasswordForm />

          <form action={signOut}>
            <button
              type="submit"
              className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition"
            >
              Cancel and sign out
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      <header className="border-b border-neutral-200 dark:border-neutral-900 bg-white/80 dark:bg-neutral-950/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-8 flex-wrap">
            <Link
              href="/admin"
              className="text-sm font-medium tracking-wide hover:opacity-80 transition"
            >
              Haven Residence · Admin
            </Link>
            <nav className="hidden md:flex gap-6 text-sm text-neutral-600 dark:text-neutral-400">
              <Link
                href="/admin"
                className="hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/properties"
                className="hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Residences
              </Link>
              <Link
                href="/admin/units"
                className="hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Units
              </Link>
              <Link
                href="/admin/inquiries"
                className="hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Inquiries
              </Link>
              <Link
                href="/admin/bookings"
                className="hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Bookings
              </Link>
              <Link
                href="/admin/team"
                className="hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Team
              </Link>
              <Link
                href="/admin/settings"
                className="hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Settings
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden sm:inline text-neutral-500 text-xs">
              {user.email}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-medium hover:opacity-90 transition"
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
