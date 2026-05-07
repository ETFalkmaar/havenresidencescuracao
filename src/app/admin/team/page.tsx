import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PromoteForm } from "./PromoteForm";
import { AdminRow } from "./AdminRow";

export const dynamic = "force-dynamic";

type Admin = {
  user_id: string;
  email: string;
  role: string;
  password_set: boolean;
  created_at: string;
};

export default async function TeamPage() {
  const userClient = await createClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();

  // Use service role so we can read across all admin rows.
  const admin = createAdminClient();
  const { data } = await admin
    .from("admin_users")
    .select("user_id, email, role, password_set, created_at")
    .order("created_at", { ascending: true });

  const admins = (data ?? []) as Admin[];

  return (
    <main className="max-w-4xl mx-auto px-6 py-12 space-y-10">
      <header>
        <h1 className="text-3xl font-extralight">Team</h1>
        <p className="text-sm text-neutral-500 mt-1">
          The people with access to this admin panel. Public sign-up is
          disabled — accounts can only be created by an existing admin.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
          Current admins ({admins.length})
        </h2>
        <ul className="divide-y divide-neutral-200 dark:divide-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-950">
          {admins.map((a) => (
            <AdminRow
              key={a.user_id}
              admin={a}
              isSelf={a.user_id === user?.id}
            />
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
          Add an admin
        </h2>
        <PromoteForm />
      </section>
    </main>
  );
}
