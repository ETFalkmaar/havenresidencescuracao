import { createClient } from "@/lib/supabase/server";
import { SiteShell } from "@/components/site/SiteShell";
import { InquiryForm } from "@/components/InquiryForm";
import { Reveal } from "@/components/Reveal";
import { getTranslations } from "@/lib/i18n/server";
import { loadOverlay, pickText } from "@/lib/editor/overrides";
import { isEditorPreview } from "@/lib/editor/mode";
import type { SiteSettings } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Contact",
};

export default async function ContactPage() {
  const supabase = await createClient();
  const { lang, t } = await getTranslations();
  const editorPreview = await isEditorPreview();
  const { overlay } = await loadOverlay(editorPreview ? "draft" : "published");

  const { data: settingsRow } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .single();
  const settings = (settingsRow ?? null) as SiteSettings | null;

  const eyebrowKey = lang === "nl" ? "contact.eyebrow_nl" : "contact.eyebrow";
  const titleKey = lang === "nl" ? "contact.title_nl" : "contact.title";
  const descKey = lang === "nl" ? "contact.desc_nl" : "contact.desc";

  const eyebrow =
    pickText(overlay, eyebrowKey, "text", null) ??
    (lang === "nl" ? "Klaar om in te checken" : "Ready to check in");
  const title =
    pickText(overlay, titleKey, "text", null) ??
    (lang === "nl" ? "Plan je verblijf op Curaçao." : "Plan your stay on Curaçao.");
  const description =
    pickText(overlay, descKey, "text", null) ??
    (lang === "nl"
      ? "Stuur een aanvraag, kijk of er open data zijn, of stuur ons een bericht. We reageren meestal binnen 24 uur."
      : "Send a request to book, see if any dates are open, or message the host for more information. We'll be in touch within 24 hours.");

  return (
    <SiteShell>
      <section className="max-w-3xl mx-auto px-6 pt-12 md:pt-20 pb-12 text-center">
        <Reveal>
          <p
            className="text-[12px] tracking-[0.3em] uppercase text-ink-mute mb-5"
            data-edit-id={eyebrowKey}
            data-edit-prop="text"
          >
            {eyebrow}
          </p>
          <h1
            className="font-display font-bold text-5xl md:text-6xl text-ink leading-[1.05] tracking-tight"
            data-edit-id={titleKey}
            data-edit-prop="text"
          >
            {title}
          </h1>
          <p
            className="mt-5 text-ink-mute text-[16px] leading-relaxed"
            data-edit-id={descKey}
            data-edit-prop="text"
          >
            {description}
          </p>
        </Reveal>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-24">
        <Reveal delay={0.1}>
          <div className="rounded-3xl bg-paper-warm border border-black/5 shadow-pill p-6 md:p-10">
            <InquiryForm t={t.inquiry} accent="#0B0B0B" />
          </div>
        </Reveal>

        <div className="mt-10 grid sm:grid-cols-3 gap-4">
          {settings?.contact_email && (
            <a
              href={`mailto:${settings.contact_email}`}
              className="rounded-2xl bg-white border border-black/5 px-5 py-4 hover:shadow-pill transition group"
            >
              <p className="text-[12px] uppercase tracking-widest text-ink-mute mb-1">
                E-mail
              </p>
              <p className="text-ink font-medium text-[14px] truncate">
                {settings.contact_email}
              </p>
            </a>
          )}
          {settings?.whatsapp_number && (
            <a
              href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, "")}`}
              className="rounded-2xl bg-white border border-black/5 px-5 py-4 hover:shadow-pill transition group"
            >
              <p className="text-[12px] uppercase tracking-widest text-ink-mute mb-1">
                WhatsApp
              </p>
              <p className="text-ink font-medium text-[14px]">
                {settings.whatsapp_number}
              </p>
            </a>
          )}
          {(settings?.instagram_url || settings?.tiktok_url) && (
            <div className="rounded-2xl bg-white border border-black/5 px-5 py-4">
              <p className="text-[12px] uppercase tracking-widest text-ink-mute mb-1">
                {lang === "nl" ? "Volg" : "Follow"}
              </p>
              <div className="flex gap-3 mt-1">
                {settings?.instagram_url && (
                  <a
                    href={settings.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink font-medium text-[14px] hover:text-brand-500 transition"
                  >
                    Instagram
                  </a>
                )}
                {settings?.tiktok_url && (
                  <a
                    href={settings.tiktok_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink font-medium text-[14px] hover:text-brand-500 transition"
                  >
                    TikTok
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
