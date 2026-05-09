import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { setEditorPreview } from "./actions";
import { EditorShell } from "./EditorShell";
import type {
  SiteVersion,
  SiteActionLogRow,
  SiteUltraConfig,
} from "@/lib/editor/types";

export const dynamic = "force-dynamic";

export default async function EditorPage() {
  const supabase = await createClient();

  // Force-on the editor preview cookie + overlay cookie when the page loads.
  // Both are short-lived so anonymous users on the same browser later don't
  // see drafts or chrome.
  const cookieStore = await cookies();
  if (cookieStore.get("editor_preview")?.value !== "1") {
    await setEditorPreview(true);
  }
  cookieStore.set("editor_overlay", "1", {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 4,
  });

  const [versionsRes, actionsRes, ultraRes, adminsRes, editsRes] = await Promise.all([
    supabase
      .from("site_versions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("site_action_log")
      .select("*")
      .order("performed_at", { ascending: false })
      .limit(300),
    supabase.from("site_ultra_config").select("*").eq("id", 1).maybeSingle(),
    supabase.from("admin_users").select("user_id, email"),
    supabase
      .from("site_edits")
      .select("target_key, prop, draft_value, published_value, draft_updated_at"),
  ]);

  const versions = (versionsRes.data ?? []) as SiteVersion[];
  const actions = (actionsRes.data ?? []) as SiteActionLogRow[];
  const ultra = (ultraRes.data ?? null) as SiteUltraConfig | null;
  const admins = (adminsRes.data ?? []) as { user_id: string; email: string }[];

  const draftPending = (editsRes.data ?? []).filter(
    (r: { draft_value: unknown; published_value: unknown }) =>
      JSON.stringify(r.draft_value) !== JSON.stringify(r.published_value),
  );

  return (
    <EditorShell
      versions={versions}
      actions={actions}
      ultra={ultra}
      admins={admins}
      draftPendingCount={draftPending.length}
    />
  );
}
