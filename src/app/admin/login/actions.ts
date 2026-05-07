"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthResult = { ok: true } | { ok: false; error: string };

function emailValid(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function signIn(formData: FormData): Promise<AuthResult> {
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";

  if (!emailValid(email) || password.length < 8) {
    return { ok: false, error: "Enter a valid email and a password (8+ chars)." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { ok: false, error: error.message };
  }
  redirect("/admin");
}

export async function signUpFirstAdmin(formData: FormData): Promise<AuthResult> {
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";

  if (!emailValid(email) || password.length < 8) {
    return { ok: false, error: "Enter a valid email and a password (8+ chars)." };
  }

  const supabase = await createClient();

  // Refuse if any admin already exists (defense in depth — RPC also enforces this).
  const { data: countData, error: countErr } = await supabase.rpc(
    "admin_users_count",
  );
  if (countErr) {
    return { ok: false, error: "Could not verify admin status." };
  }
  if (((countData as number | null) ?? 0) > 0) {
    return {
      ok: false,
      error: "An admin already exists. Ask the existing admin to invite you.",
    };
  }

  const { error: signUpError } = await supabase.auth.signUp({ email, password });
  if (signUpError) {
    return { ok: false, error: signUpError.message };
  }

  return { ok: true };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
