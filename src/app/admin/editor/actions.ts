"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { RegistryChangeType } from "@/lib/editor/registry";

export type ActionResult = { ok: true; data?: unknown } | { ok: false; error: string };

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

export async function saveEdit(
  targetKey: string,
  prop: string,
  value: unknown,
  changeType: RegistryChangeType,
  description: string,
): Promise<ActionResult> {
  const guard = await ensureAdmin();
  if (!guard.ok) return guard;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("editor_save_draft", {
    p_target_key: targetKey,
    p_prop: prop,
    p_value: value as never,
    p_change_type: changeType,
    p_description: description,
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/editor");
  return { ok: true, data };
}

export async function publishChanges(
  label: string | null,
  description: string,
): Promise<ActionResult> {
  const guard = await ensureAdmin();
  if (!guard.ok) return guard;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("editor_publish", {
    p_label: label,
    p_description: description,
  });

  if (error) return { ok: false, error: error.message };

  // Invalidate every public page so live readers pick up the new published values.
  revalidatePath("/", "layout");
  revalidatePath("/admin/editor");
  return { ok: true, data };
}

export async function discardDrafts(): Promise<ActionResult> {
  const guard = await ensureAdmin();
  if (!guard.ok) return guard;

  const supabase = await createClient();
  const { error } = await supabase.rpc("editor_discard_drafts");
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/editor");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function restoreVersion(versionId: string): Promise<ActionResult> {
  const guard = await ensureAdmin();
  if (!guard.ok) return guard;

  const supabase = await createClient();
  const { error } = await supabase.rpc("editor_restore_version", {
    p_version_id: versionId,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/editor");
  return { ok: true };
}

export async function pinVersion(versionId: string, pinned: boolean): Promise<ActionResult> {
  const guard = await ensureAdmin();
  if (!guard.ok) return guard;

  const supabase = await createClient();
  const { error } = await supabase.rpc("editor_pin_version", {
    p_version_id: versionId,
    p_pinned: pinned,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/editor");
  return { ok: true };
}

export async function setVersionNote(
  versionId: string,
  notes: string,
  label: string | null,
): Promise<ActionResult> {
  const guard = await ensureAdmin();
  if (!guard.ok) return guard;

  const supabase = await createClient();
  const { error } = await supabase.rpc("editor_set_version_note", {
    p_version_id: versionId,
    p_notes: notes,
    p_label: label,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/editor");
  return { ok: true };
}

export async function saveUltra(
  field: "css" | "js" | "head",
  value: string,
  description: string,
): Promise<ActionResult> {
  const guard = await ensureAdmin();
  if (!guard.ok) return guard;

  const supabase = await createClient();
  const { error } = await supabase.rpc("editor_save_ultra", {
    p_field: field,
    p_value: value,
    p_description: description,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/editor");
  return { ok: true };
}

/**
 * Toggle the editor preview cookie. When set the public-site SSR loads
 * draft overlays instead of published. Only admins can call this.
 */
export async function setEditorPreview(enabled: boolean): Promise<ActionResult> {
  const guard = await ensureAdmin();
  if (!guard.ok) return guard;

  const cookieStore = await cookies();
  if (enabled) {
    cookieStore.set("editor_preview", "1", {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 4, // 4 h
    });
  } else {
    cookieStore.delete("editor_preview");
  }
  return { ok: true };
}
