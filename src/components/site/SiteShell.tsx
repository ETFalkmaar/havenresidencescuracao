import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n/server";
import { loadOverlay, pickText } from "@/lib/editor/overrides";
import { isEditorPreview } from "@/lib/editor/mode";
import type { SiteSettings } from "@/lib/types";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

/**
 * Wraps every public-facing page (home, about, gallery, reviews, property,
 * contact, account) so the header/footer + auth state are consistent.
 */
export async function SiteShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { lang } = await getTranslations();
  const editorPreview = await isEditorPreview();
  const { overlay } = await loadOverlay(editorPreview ? "draft" : "published");

  const [{ data: settingsRow }, { data: { user } }] = await Promise.all([
    supabase.from("site_settings").select("*").eq("id", 1).single(),
    supabase.auth.getUser(),
  ]);

  const settings = (settingsRow ?? null) as SiteSettings | null;

  let isAdmin = false;
  if (user) {
    const { data: adminRow } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();
    isAdmin = !!adminRow;
  }

  const brandName =
    pickText(overlay, "home.hero.brandName", "text", null) ??
    settings?.brand_name ??
    "Haven Residence";

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <SiteHeader
        brandName={brandName}
        lang={lang}
        signedIn={!!user}
        isAdmin={isAdmin}
      />
      <main className="flex-1 pt-[88px]">{children}</main>
      <SiteFooter settings={settings} lang={lang} />
    </div>
  );
}
