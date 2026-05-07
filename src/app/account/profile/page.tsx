import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("user_id", user!.id)
    .maybeSingle();
  const profile =
    (data as { full_name: string | null; phone: string | null } | null) ?? {
      full_name: null,
      phone: null,
    };

  return (
    <main className="max-w-2xl mx-auto px-6 py-12 space-y-10">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-2">
          Account
        </p>
        <h1 className="text-3xl font-extralight">Profile</h1>
        <p className="text-sm text-neutral-500 mt-2">
          Your contact info — used on bookings and confirmations.
        </p>
      </header>
      <ProfileForm initial={profile} email={user!.email!} />
    </main>
  );
}
