"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type AuthResult = { ok: true } | { ok: false; error: string };
export type SignUpResult =
  | { ok: true; needsVerification: boolean }
  | { ok: false; error: string };

function emailValid(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function originUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

export async function publicSignUp(formData: FormData): Promise<SignUpResult> {
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";
  const fullName = (formData.get("full_name") as string | null)?.trim() || null;

  if (!emailValid(email) || password.length < 8) {
    return {
      ok: false,
      error: "Enter a valid email and a password of at least 8 characters.",
    };
  }

  const supabase = await createClient();
  const origin = await originUrl();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/account`,
      data: { full_name: fullName },
    },
  });
  if (error) return { ok: false, error: error.message };

  // Did Supabase auto-create a session, or do we need email verification?
  const needsVerification = !data.session;
  return { ok: true, needsVerification };
}

export async function publicSignIn(formData: FormData): Promise<AuthResult> {
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";
  const next = (formData.get("next") as string | null) || "/account";

  if (!emailValid(email) || password.length < 1) {
    return { ok: false, error: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };

  // Check whether MFA is required for this session
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: mfaData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (mfaData && mfaData.nextLevel === "aal2" && mfaData.currentLevel !== "aal2") {
      redirect("/login/mfa?next=" + encodeURIComponent(next));
    }
  }
  redirect(next.startsWith("/") ? next : "/account");
}

export async function publicSignOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function updateProfile(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const fullName = (formData.get("full_name") as string | null)?.trim() || null;
  const phone = (formData.get("phone") as string | null)?.trim() || null;

  const { error } = await supabase
    .from("profiles")
    .upsert({ user_id: user.id, full_name: fullName, phone });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/account");
  return { ok: true };
}
