"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type ActionResult = { ok: true } | { ok: false; error: string };

async function ensureAdmin(): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { data: row } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!row) return { ok: false, error: "Not authorized." };
  return { ok: true };
}

// Temporary password every new admin gets on creation. They are FORCED to
// change it on first sign-in by the password_set=false flag in admin_users
// (the admin layout intercepts and shows SetPasswordForm before any UI).
const TEMP_PASSWORD = "welkom123";

export async function promoteAdmin(formData: FormData): Promise<ActionResult> {
  const guard = await ensureAdmin();
  if (!guard.ok) return guard;

  const email = (formData.get("email") as string | null)?.trim().toLowerCase();
  const role = (formData.get("role") as string | null)?.trim() || "admin";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Enter a valid email." };
  }

  const admin = createAdminClient();

  // 1) Try to find an existing auth.users row by email.
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({
    perPage: 200,
    page: 1,
  });
  if (listErr) return { ok: false, error: listErr.message };

  let target = list.users.find(
    (u) => (u.email ?? "").toLowerCase() === email,
  );

  // 2) Auto-create the user if they don't exist yet — no need for the owner
  //    to open Supabase Dashboard. One form, one click.
  if (!target) {
    const { data: created, error: createErr } =
      await admin.auth.admin.createUser({
        email,
        password: TEMP_PASSWORD,
        email_confirm: true, // skip mail verification for owner-trusted invite
      });
    if (createErr || !created.user) {
      return {
        ok: false,
        error:
          createErr?.message ??
          "Could not create the Supabase user. Check the email is not already registered.",
      };
    }
    target = created.user;
  }

  // 3) Upsert into admin_users with password_set=false → forces them to
  //    choose a new password on first sign-in.
  const { error: insErr } = await admin.from("admin_users").upsert({
    user_id: target.id,
    email,
    role,
    password_set: false,
  });
  if (insErr) return { ok: false, error: insErr.message };

  revalidatePath("/admin/team");
  revalidatePath("/admin");
  return { ok: true };
}

export async function demoteAdmin(userId: string): Promise<ActionResult> {
  const guard = await ensureAdmin();
  if (!guard.ok) return guard;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user?.id === userId) {
    return { ok: false, error: "You can't remove yourself." };
  }

  // Don't allow demoting the last owner.
  const admin = createAdminClient();
  const { count } = await admin
    .from("admin_users")
    .select("user_id", { count: "exact", head: true });
  if ((count ?? 0) <= 1) {
    return { ok: false, error: "There must be at least one admin." };
  }

  const { error } = await admin
    .from("admin_users")
    .delete()
    .eq("user_id", userId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/team");
  return { ok: true };
}

export async function setOwnPassword(formData: FormData): Promise<ActionResult> {
  const password = (formData.get("password") as string | null) ?? "";
  const confirm = (formData.get("confirm") as string | null) ?? "";

  if (password.length < 10) {
    return { ok: false, error: "Password must be at least 10 characters." };
  }
  if (password === "welkom123" || password.toLowerCase() === "welkom123") {
    return {
      ok: false,
      error: "Choose a different password than the temporary one.",
    };
  }
  if (password !== confirm) {
    return { ok: false, error: "Passwords don't match." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { error: updErr } = await supabase.auth.updateUser({ password });
  if (updErr) return { ok: false, error: updErr.message };

  // Mark password_set=true via service role (the row may have been seeded
  // as password_set=false; this is the moment we know they've taken control).
  const admin = createAdminClient();
  const { error: dbErr } = await admin
    .from("admin_users")
    .update({ password_set: true })
    .eq("user_id", user.id);
  if (dbErr) return { ok: false, error: dbErr.message };

  revalidatePath("/admin");
  revalidatePath("/admin/team");
  return { ok: true };
}
