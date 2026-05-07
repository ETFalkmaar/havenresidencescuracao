import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

type Search = Promise<{ next?: string }>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const { next } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(next ?? "/account");

  return (
    <main className="min-h-screen grid place-items-center px-6 py-16 bg-neutral-950 text-white">
      <div className="w-full max-w-md space-y-8">
        <div>
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.3em] text-white/50 hover:text-white transition"
          >
            ← Back to site
          </Link>
          <h1 className="mt-6 text-3xl font-extralight">Welcome back</h1>
          <p className="text-sm text-white/60 mt-2">
            Sign in to book or to view your stays.
          </p>
        </div>

        <LoginForm next={next} />
      </div>
    </main>
  );
}
