import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { publicSignOut } from "@/app/(auth)/actions";

export const dynamic = "force-dynamic";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <header className="border-b border-neutral-200 dark:border-neutral-900 bg-white/80 dark:bg-neutral-950/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-8 flex-wrap">
            <Link
              href="/"
              className="text-sm font-light tracking-wide hover:opacity-80 transition"
            >
              Haven Residence
            </Link>
            <nav className="hidden sm:flex gap-6 text-sm text-neutral-600 dark:text-neutral-400">
              <Link
                href="/account"
                className="hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                My stays
              </Link>
              <Link
                href="/account/profile"
                className="hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Profile
              </Link>
              <Link
                href="/account/security"
                className="hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Security
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden sm:inline text-neutral-500 text-xs">
              {user.email}
            </span>
            <form action={publicSignOut}>
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
