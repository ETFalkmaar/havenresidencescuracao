import { createClient } from "@/lib/supabase/server";
import { SiteShell } from "@/components/site/SiteShell";
import { SectionHeading } from "@/components/site/SectionHeading";
import { GalleryCarousel } from "@/components/site/GalleryCarousel";
import { Reveal } from "@/components/Reveal";
import { getTranslations } from "@/lib/i18n/server";
import { type Property } from "@/lib/types";
import { loadOverlay, pickText } from "@/lib/editor/overrides";
import { isEditorPreview } from "@/lib/editor/mode";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gallery",
};

// Map the lucide-style icon name (stored in `amenities.icon`) to an emoji we
// can render without pulling in the lucide library.
const ICON_EMOJI: Record<string, string> = {
  wifi: "📶",
  wind: "❄️",
  "tree-palm": "🌴",
  umbrella: "🏖️",
  bed: "🛏️",
  utensils: "🍽️",
  shield: "🛡️",
  waves: "🏊",
  car: "🚗",
  sparkles: "✨",
  lock: "🔒",
  tv: "📺",
  "washing-machine": "🧺",
  kitchen: "🍳",
  pool: "🏊",
  ac: "❄️",
  cleaning: "🧴",
  parking: "🚗",
  outdoor: "🪑",
};

export default async function GalleryPage() {
  const supabase = await createClient();
  const { lang } = await getTranslations();
  const editorPreview = await isEditorPreview();
  const { overlay } = await loadOverlay(editorPreview ? "draft" : "published");

  const [{ data: amenityRows }, { data: propertyRows }] = await Promise.all([
    supabase
      .from("amenities")
      .select("name, icon, slug")
      .order("name", { ascending: true })
      .limit(12),
    supabase.from("properties").select("*").order("position", { ascending: true }),
  ]);

  const properties = (propertyRows ?? []) as Property[];

  // Group photos per property: take up to 6 per property
  const propertyPhotos: { property: Property; photos: string[] }[] = [];
  for (const p of properties.slice(0, 4)) {
    const { data: photos } = await supabase
      .from("photos")
      .select("url")
      .eq("property_id", p.id)
      .order("is_hero", { ascending: false })
      .order("position", { ascending: true })
      .limit(6);
    const list = ((photos ?? []) as { url: string }[]).map((x) => x.url).filter(Boolean);
    if (list.length > 0) propertyPhotos.push({ property: p, photos: list });
  }

  const amenities = (amenityRows ?? []) as { name: string; icon: string | null; slug: string }[];

  const titleKey = lang === "nl" ? "gallery.title_nl" : "gallery.title";
  const eyebrowKey = lang === "nl" ? "gallery.eyebrow_nl" : "gallery.eyebrow";
  const descKey = lang === "nl" ? "gallery.desc_nl" : "gallery.desc";

  const title =
    pickText(overlay, titleKey, "text", null) ??
    (lang === "nl" ? "Zie de ruimte voor je aankomt" : "See the space before you arrive");
  const eyebrow =
    pickText(overlay, eyebrowKey, "text", null) ??
    (lang === "nl" ? "Premium galerij" : "Premium Gallery");
  const description =
    pickText(overlay, descKey, "text", null) ??
    (lang === "nl"
      ? "Een nadere blik. Onze galerij toont precies wat je zult ervaren — van rustige slaapkamers en stijlvolle woonruimtes tot moderne keukens en buitenruimtes om te onthaasten."
      : "Take a closer look inside. Our gallery shows exactly what you'll experience — from calm bedrooms and stylish living areas to modern kitchens and outdoor spaces made for unwinding.");

  return (
    <SiteShell>
      <section className="max-w-6xl mx-auto px-6 pt-12 md:pt-20">
        <Reveal>
          <SectionHeading
            eyebrow={eyebrow}
            title={
              <span data-edit-id={titleKey} data-edit-prop="text">
                {title}
              </span>
            }
            description={
              <span data-edit-id={descKey} data-edit-prop="text">
                {description}
              </span>
            }
          />
        </Reveal>

        {/* Amenities chips */}
        {amenities.length > 0 && (
          <div className="mt-12 flex flex-wrap gap-3 justify-center max-w-3xl mx-auto">
            {amenities.map((a) => {
              const emoji =
                (a.icon ? ICON_EMOJI[a.icon] : null) ??
                ICON_EMOJI[a.slug] ??
                "✦";
              return (
                <span
                  key={a.slug}
                  className="amenity-chip inline-flex items-center gap-2 px-4 py-2 rounded-full bg-paper-warm border border-black/5 text-[13px] text-ink"
                >
                  <span aria-hidden className="text-base">
                    {emoji}
                  </span>
                  {a.name}
                </span>
              );
            })}
          </div>
        )}
      </section>

      {/* Carousels per property */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-28">
        {propertyPhotos.length === 0 ? (
          <p className="text-center text-ink-mute">
            {lang === "nl"
              ? "Foto's volgen binnenkort."
              : "Photos coming soon."}
          </p>
        ) : (
          <div className="grid lg:grid-cols-2 gap-10">
            {propertyPhotos.map(({ property, photos }) => (
              <Reveal key={property.id}>
                <GalleryCarousel
                  title={property.name}
                  slug={property.slug}
                  photos={photos}
                  isComingSoon={property.status === "coming_soon"}
                  availableFrom={property.available_from}
                  viewLabel={lang === "nl" ? "Bekijk residentie" : "View property"}
                  availabilityLabel={
                    lang === "nl" ? "Beschikbaarheid" : "Check availability"
                  }
                  comingSoonLabel={
                    lang === "nl" ? "Binnenkort beschikbaar" : "Coming soon"
                  }
                />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </SiteShell>
  );
}
