import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { SiteShell } from "@/components/site/SiteShell";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/Reveal";
import { getTranslations } from "@/lib/i18n/server";
import { localized, type SiteSettings } from "@/lib/types";
import { loadOverlay, pickText } from "@/lib/editor/overrides";
import { isEditorPreview } from "@/lib/editor/mode";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "About",
};

export default async function AboutPage() {
  const supabase = await createClient();
  const { lang } = await getTranslations();
  const editorPreview = await isEditorPreview();
  const { overlay } = await loadOverlay(editorPreview ? "draft" : "published");

  const [{ data: settingsRow }, { data: photoRows }, propCountRes, unitCountRes] =
    await Promise.all([
      supabase.from("site_settings").select("*").eq("id", 1).single(),
      supabase
        .from("photos")
        .select("url")
        .order("position", { ascending: true })
        .limit(8),
      supabase
        .from("properties")
        .select("*", { count: "exact", head: true })
        .in("status", ["active", "coming_soon"]),
      supabase
        .from("units")
        .select("*", { count: "exact", head: true })
        .eq("status", "active"),
    ]);

  const settings = (settingsRow ?? null) as SiteSettings | null;
  const photos = ((photoRows ?? []) as { url: string }[])
    .map((r) => r.url)
    .filter(Boolean);

  const residenceCount = propCountRes.count ?? 0;
  const unitCount = unitCountRes.count ?? 0;

  // Editor-overridable copy
  const titleKey = lang === "nl" ? "about.title_nl" : "about.title";
  const bodyKey = lang === "nl" ? "about.body_nl" : "about.body";

  const title =
    pickText(overlay, titleKey, "text", null) ??
    (lang === "nl"
      ? "Waar comfort gastvrijheid ontmoet"
      : "Where comfort meets convenience");

  const fallbackBody = localized(
    settings?.brand_description ?? null,
    settings?.brand_description_nl ?? null,
    lang,
  );

  const body =
    pickText(overlay, bodyKey, "text", null) ??
    fallbackBody ??
    (lang === "nl"
      ? "Welkom op een plek die direct als thuis voelt. Doordachte interieurs, zachte verlichting en praktische voorzieningen zorgen dat je verblijf moeiteloos verloopt — of je nu komt voor een korte escape of een langere periode."
      : "Welcome to a place that feels like home from the moment you walk in. Thoughtfully designed interiors, soft lighting, and practical amenities come together to make your stay effortless. Whether you're here for a short getaway or a longer stay, everything is set up to help you relax, work, and feel at ease.");

  // Honest facts — no invented ratings, no invented guest counts.
  const facts = [
    {
      value: String(residenceCount),
      label: lang === "nl" ? "Residenties op Curaçao" : "Residences on Curaçao",
    },
    {
      value: String(unitCount),
      label: lang === "nl" ? "Beschikbare units" : "Available units",
    },
    {
      value: "24h",
      label:
        lang === "nl"
          ? "Persoonlijke reactie op aanvragen"
          : "Personal reply to inquiries",
    },
  ];

  // Pad to 8 photos with a placeholder gradient if too few
  const gridPhotos: (string | null)[] = [...photos];
  while (gridPhotos.length < 8) gridPhotos.push(null);

  return (
    <SiteShell>
      <section className="max-w-6xl mx-auto px-6 pt-12 md:pt-20 pb-16 md:pb-24">
        <Reveal>
          <p className="text-[12px] tracking-[0.3em] uppercase text-ink-mute mb-6">
            {lang === "nl" ? "Over ons" : "About us"}
          </p>
        </Reveal>

        <div className="grid lg:grid-cols-3 gap-12 lg:gap-20 items-start">
          <div className="lg:col-span-2">
            <Reveal>
              <h1
                className="font-display font-bold text-5xl md:text-7xl text-ink leading-[1] tracking-tight"
                data-edit-id={titleKey}
                data-edit-prop="text"
              >
                {title}
              </h1>
            </Reveal>
            <Reveal delay={0.15}>
              <p
                className="mt-8 text-ink-mute text-[16px] md:text-[17px] leading-relaxed max-w-2xl"
                data-edit-id={bodyKey}
                data-edit-prop="text"
              >
                {body}
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.25}>
            <div className="space-y-7">
              {facts.map((s, i) => (
                <div
                  key={i}
                  className={`pb-7 ${i < facts.length - 1 ? "border-b border-black/10" : ""}`}
                >
                  <div className="font-display font-bold text-3xl md:text-4xl text-ink leading-tight">
                    {s.value}
                  </div>
                  <div className="mt-2 text-[14px] text-ink-mute">{s.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Gallery grid */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <StaggerGroup
          staggerChildren={0.06}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
        >
          {gridPhotos.map((url, i) => (
            <StaggerItem key={i}>
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-paper-warm shadow-pill">
                {url ? (
                  <Image
                    src={url}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-paper-tint to-paper-warm" />
                )}
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>

        {settings?.instagram_url && (
          <div className="mt-8 flex justify-center">
            <a
              href={settings.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-ink text-white text-[13px] font-medium hover:bg-ink-soft transition shadow-pill"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
              {lang === "nl" ? "Volg ons" : "Follow us"}
            </a>
          </div>
        )}
      </section>
    </SiteShell>
  );
}
