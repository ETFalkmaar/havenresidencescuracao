'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type AuthResult = { error: string } | { ok: true };

export async function signIn(formData: FormData): Promise<AuthResult> {
  const email = (formData.get('email') as string | null)?.trim();
  const password = formData.get('password') as string | null;

  if (!email || !password) {
    return { error: 'Vul email en wachtwoord in.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  revalidatePath('/admin', 'layout');
  redirect('/admin');
}

export async function signUp(formData: FormData): Promise<AuthResult> {
  const email = (formData.get('email') as string | null)?.trim();
  const password = formData.get('password') as string | null;

  if (!email || !password) {
    return { error: 'Vul email en wachtwoord in.' };
  }
  if (password.length < 8) {
    return { error: 'Wachtwoord moet minstens 8 tekens lang zijn.' };
  }

  const supabase = await createClient();
  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });
  if (signUpError) return { error: signUpError.message };

  // Probeer admin te claimen — werkt alleen als er nog geen admin is.
  await supabase.rpc('claim_admin_if_first');

  revalidatePath('/admin', 'layout');
  redirect('/admin');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/admin', 'layout');
  redirect('/admin/login');
}
