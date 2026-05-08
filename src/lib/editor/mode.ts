// Detect whether the current request is in editor preview mode.
//
// Editor preview is granted only to authenticated admins who have set the
// `editor_preview=1` cookie via the admin UI. We re-check admin every time
// to prevent a leftover cookie on a non-admin browser from leaking drafts.

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function isEditorPreview(): Promise<boolean> {
  const cookieStore = await cookies();
  if (cookieStore.get("editor_preview")?.value !== "1") return false;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return Boolean(data);
}

export async function isEditorOverlayRequested(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get("editor_overlay")?.value === "1";
}
