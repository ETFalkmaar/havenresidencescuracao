import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasAnonKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  let connectionStatus: "ok" | "error" = "ok";
  let errorMessage: string | null = null;

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.getSession();
    if (error) throw error;
  } catch (err) {
    connectionStatus = "error";
    errorMessage = err instanceof Error ? err.message : "Unknown error";
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="max-w-2xl w-full space-y-8">
        <header className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-widest text-neutral-500">
            Curaçao
          </p>
          <h1 className="text-5xl md:text-6xl font-light tracking-tight">
            Haven Residences
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Site under construction.
          </p>
        </header>

        <section className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
            System status
          </h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span
                className={
                  supabaseUrl
                    ? "inline-block w-2 h-2 rounded-full bg-emerald-500"
                    : "inline-block w-2 h-2 rounded-full bg-red-500"
                }
              />
              <span>Supabase URL configured: {supabaseUrl ? "yes" : "no"}</span>
            </li>
            <li className="flex items-center gap-2">
              <span
                className={
                  hasAnonKey
                    ? "inline-block w-2 h-2 rounded-full bg-emerald-500"
                    : "inline-block w-2 h-2 rounded-full bg-red-500"
                }
              />
              <span>Anon key configured: {hasAnonKey ? "yes" : "no"}</span>
            </li>
            <li className="flex items-center gap-2">
              <span
                className={
                  connectionStatus === "ok"
                    ? "inline-block w-2 h-2 rounded-full bg-emerald-500"
                    : "inline-block w-2 h-2 rounded-full bg-red-500"
                }
              />
              <span>
                Supabase connection:{" "}
                {connectionStatus === "ok"
                  ? "ok"
                  : `error — ${errorMessage}`}
              </span>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
