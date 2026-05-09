import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
// Image used for the property gallery grid below; the avatar row uses inline initials.
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

  // Pull a few photos to populate the gallery grid
  const [{ data: settingsRow }, { data: photoRows }] = await Promise.all([
    supabase.from("site_settings").select("*").eq("id", 1).single(),
    supabase
      .from("photos")
      .select("url")
      .order("position", { ascending: true })
      .limit(8),
  ]);

  const settings = (settingsRow ?? null) as SiteSettings | null;
  const photos = ((photoRows ?? []) as { url: string }[])
    .map((r) => r.url)
    .filter(Boolean);

  // Editor-overridable copy
  const titleKey = lang === "nl" ? "about.title_nl" : "about.title";
  const bodyKey = lang === "nl" ? "about.body_nl" : "about.body";
  const stat1ValueKey = "about.stat1.value";
  const stat1LabelKey = lang === "nl" ? "about.stat1.label_nl" : "about.stat1.label";
  const stat2ValueKey = "about.stat2.value";
  const stat2LabelKey = lang === "nl" ? "about.stat2.label_nl" : "about.stat2.label";
  const stat3ValueKey = "about.stat3.value";
  const stat3LabelKey = lang === "nl" ? "about.stat3.label_nl" : "about.stat3.label";

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

  const stat1Value = pickText(overlay, stat1ValueKey, "text", null) ?? "4.9 / 5";
  const stat1Label =
    pickText(overlay, stat1LabelKey, "text", null) ??
    (lang === "nl" ? "Exclusieve beoordeling" : "Exclusive rating");

  const stat2Value = pickText(overlay, stat2ValueKey, "text", null) ?? "34+";
  const stat2Label =
    pickText(overlay, stat2LabelKey, "text", null) ??
    (lang === "nl" ? "Reizigers uit landen" : "Travelers from countries");

  const stat3Value = pickText(overlay, stat3ValueKey, "text", null) ?? "4,74,500+";
  const stat3Label =
    pickText(overlay, stat3LabelKey, "text", null) ??
    (lang === "nl" ? "Tevreden gasten" : "happy guests booking");

  // Pad to 8 photos with a placeholder gradient if too few
  const gridPhotos: (string | null)[] = [...photos];
  while (gridPhotos.length < 8) gridPhotos.push(null);

  return (
    <SiteShell>
      <section className="max-w-6xl mx-auto px-6 pt-12 md:pt-20 pb-16 md:pb-24">
        <Reveal>
          <div className="flex items-center gap-3 text-[13px] text-ink-mute mb-6">
            <div className="flex -space-x-2">
              {[
                { initial: "A", color: "bg-amber-500" },
                { initial: "S", color: "bg-emerald-500" },
                { initial: "K", color: "bg-purple-500" },
                { initial: "P", color: "bg-rose-500" },
              ].map((a, i) => (
                <span
                  key={i}
                  className={`h-8 w-8 rounded-full ring-2 ring-paper text-white text-xs font-semibold flex items-center justify-center ${a.color}`}
                  aria-hidden
                >
                  {a.initial}
                </span>
              ))}
              <span className="h-8 w-8 rounded-full ring-2 ring-paper bg-brand-500 text-white text-xs font-semibold flex items-center justify-center">
                +
              </span>
            </div>
            {lang === "nl" ? "4.8 ⋅ 474k+ reviews" : "4.8 rate by 474k+ reviews"}
          </div>
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
              {[
                { value: stat1Value, label: stat1Label, key: "stat1" },
                { value: stat2Value, label: stat2Label, key: "stat2" },
                { value: stat3Value, label: stat3Label, key: "stat3" },
              ].map((s, i) => (
                <div key={s.key} className={`pb-7 ${i < 2 ? "border-b border-black/10" : ""}`}>
                  <div
                    className="font-display font-bold text-3xl md:text-4xl text-ink leading-tight"
                    data-edit-id={`about.${s.key}.value`}
                    data-edit-prop="text"
                  >
                    {s.value}
                  </div>
                  <div
                    className="mt-2 text-[14px] text-ink-mute"
                    data-edit-id={
                      lang === "nl" ? `about.${s.key}.label_nl` : `about.${s.key}.label`
                    }
                    data-edit-prop="text"
                  >
                    {s.label}
                  </div>
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
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
