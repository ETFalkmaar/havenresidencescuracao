import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SecurityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="max-w-2xl mx-auto px-6 py-12 space-y-10">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-2">
          Account
        </p>
        <h1 className="text-3xl font-extralight">Security</h1>
        <p className="text-sm text-neutral-500 mt-2">
          Sign-in details and two-factor authentication.
        </p>
      </header>

      <section className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-950 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
          Email
        </h2>
        <p className="text-sm">{user?.email}</p>
        <p className="text-xs text-neutral-500">
          Email is verified. Changing email is not yet self-service — contact
          support.
        </p>
      </section>

      <section className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-950 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
          Two-factor authentication (TOTP)
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Two-factor with an authenticator app (Google Authenticator, 1Password,
          Authy, etc.) adds a second code on top of your password. The
          enrollment UI is being prepared; until then, you can enable it from
          the Supabase user dashboard if you have access. We&apos;ll surface
          the QR-code enrollment here as soon as it ships.
        </p>
        <span className="inline-block text-[10px] uppercase tracking-widest px-2 py-1 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200">
          Coming next
        </span>
      </section>
    </main>
  );
}
