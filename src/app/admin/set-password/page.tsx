import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "../login/actions";
import { SetPasswordForm } from "./SetPasswordForm";

export const dynamic = "force-dynamic";

export default async function SetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data } = await supabase
    .from("admin_users")
    .select("password_set")
    .eq("user_id", user.id)
    .maybeSingle();

  const row = data as { password_set: boolean } | null;
  if (row?.password_set) redirect("/admin");

  return (
    <main className="min-h-screen grid place-items-center px-6 py-16 bg-neutral-50 dark:bg-neutral-950">
      <div className="w-full max-w-md space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-500 mb-3">
            One-time setup
          </p>
          <h1 className="text-3xl font-extralight">Choose your password</h1>
          <p className="text-sm text-neutral-500 mt-3 leading-relaxed">
            You signed in with a temporary password. Pick a strong one of
            your own — it&apos;ll replace the temp password and from now on
            only you know it.
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
