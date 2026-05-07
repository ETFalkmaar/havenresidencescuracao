import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Already signed in — let /admin decide whether they're authorized.
    redirect("/admin");
  }

  // Detect whether any admin exists yet → only show bootstrap if 0 admins.
  // Uses a SECURITY DEFINER RPC because anon RLS hides admin_users entirely.
  // After the first admin is created, public sign-up is disabled at the
  // Supabase level too; new admins are added via /admin/team.
  const { data: countData } = await supabase.rpc("admin_users_count");
  const allowSignUp = ((countData as number | null) ?? 0) === 0;

  return (
    <main className="min-h-screen grid place-items-center px-6 py-16 bg-neutral-50 dark:bg-neutral-950">
      <div className="w-full max-w-md space-y-8">
        <div>
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.3em] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition"
          >
            ← Back to site
          </Link>
          <h1 className="mt-6 text-3xl font-extralight">Admin</h1>
          <p className="text-sm text-neutral-500 mt-2">
            {allowSignUp
              ? "Sign in to manage Haven Residence."
              : "Sign in with the credentials your admin shared with you."}
          </p>
        </div>

        <LoginForm allowSignUp={allowSignUp} />
      </div>
    </main>
  );
}
