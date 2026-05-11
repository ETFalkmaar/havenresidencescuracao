import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SiteShell } from "@/components/site/SiteShell";
import { HomeHero, type HeroSlide } from "@/components/site/HomeHero";
import { PropertyTile, type PropertyTileData } from "@/components/site/PropertyTile";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/Reveal";
import { getTranslations, getLocale } from "@/lib/i18n/server";
import { type Property, type SiteSettings, type Unit } from "@/lib/types";
import { loadOverlay, pickText, pickBool } from "@/lib/editor/overrides";
import { isEditorPreview } from "@/lib/editor/mode";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const { lang } = await getTranslations();
  const locale = getLocale(lang);

  const editorPreview = await isEditorPreview();
  const { overlay } = await loadOverlay(editorPreview ? "draft" : "published");

  const [settingsRes, propertiesRes, unitsRes] = await Promise.all([
    supabase.from("site_settings").select("*").eq("id", 1).single(),
    supabase.from("properties").select("*").order("position", { ascending: true }),
    supabase
      .from("units")
      .select("property_id, base_price_eur, bedrooms, bathrooms, max_guests"),
  ]);

  const settings = (settingsRes.data ?? null) as SiteSettings | null;
  const allProperties = (propertiesRes.data ?? []) as Property[];
  const units = (unitsRes.data ?? []) as Pick<
    Unit,
    "property_id" | "base_price_eur" | "bedrooms" | "bathrooms" | "max_guests"
  >[];

  const properties = allProperties
    .filter((p) => p.status === "active" || p.status === "coming_soon")
    .filter((p) => !pickBool(overlay, `prop:${p.id}`, "hidden", false));

  // Build slideshow: pull up to 4 photos per property, interleave so guests
  // see a mix of Blue Haven (house) and Green Haven (10 apartments).
  const slidesPerProperty: { property: Property; urls: string[] }[] = [];
  for (const p of properties) {
    const { data: photoRows } = await supabase
      .from("photos")
      .select("url, position, is_hero")
      .eq("property_id", p.id)
      .order("is_hero", { ascending: false })
      .order("position", { ascending: true })
      .limit(4);
    const urls = ((photoRows ?? []) as { url: string }[])
      .map((r) => r.url)
      .filter(Boolean);
    if (urls.length === 0 && p.hero_image_url) urls.push(p.hero_image_url);
    if (urls.length > 0) slidesPerProperty.push({ property: p, urls });
  }

  // Interleave photos from each property so the slideshow alternates.
  const heroSlides: HeroSlide[] = [];
  const maxLen = Math.max(...slidesPerProperty.map((g) => g.urls.length), 0);
  for (let i = 0; i < maxLen; i++) {
    for (const g of slidesPerProperty) {
      if (i < g.urls.length) {
        heroSlides.push({
          url: g.urls[i]!,
          propertyName:
            pickText(overlay, `prop:${g.property.id}`, "name", null) ??
            g.property.name,
          propertySlug: g.property.slug,
          city: g.property.city,
          isComingSoon: g.property.status === "coming_soon",
        });
      }
    }
  }

  // Aggregate units per property for the tile grid
  const aggByProperty = new Map<
    string,
    {
      from_price: number | null;
      bedrooms: number | null;
      bathrooms: number | null;
      max_guests: number | null;
    }
  >();
  for (const u of units) {
    const cur = aggByProperty.get(u.property_id) ?? {
      from_price: null,
      bedrooms: null,
      bathrooms: null,
      max_guests: null,
    };
    cur.from_price =
      cur.from_price === null ? u.base_price_eur : Math.min(cur.from_price, u.base_price_eur);
    cur.bedrooms = Math.max(cur.bedrooms ?? 0, u.bedrooms ?? 0) || null;
    cur.bathrooms = Math.max(cur.bathrooms ?? 0, u.bathrooms ?? 0) || null;
    cur.max_guests = Math.max(cur.max_guests ?? 0, u.max_guests ?? 0) || null;
    aggByProperty.set(u.property_id, cur);
  }

  // ----- Hero copy (no fake stats / "trusted by 15k" claims) -----
  const heroTitleKey = "home.hero.title";
  const heroTitle =
    pickText(overlay, heroTitleKey, "text", null) ??
    (lang === "nl"
      ? "Vind je volgende verblijf, voel je direct thuis"
      : "Find your next stay, feel right at home");

  const collectionEyebrow =
    pickText(overlay, "home.residences.eyebrow", "text", null) ??
    (lang === "nl" ? "Onze residenties" : "Our residences");
  const collectionTitle =
    pickText(overlay, "home.residences.title", "text", null) ??
    (lang === "nl"
      ? "Een huis en tien appartementen, allemaal op Curaçao."
      : "One house and ten apartments, all on Curaçao.");

  const showHero = !pickBool(overlay, "home.hero", "hidden", false);
  const showResidences = !pickBool(overlay, "home.residences", "hidden", false);

  const tile = {
    bedrooms: lang === "nl" ? "slaapkamers" : "bedrooms",
    baths: lang === "nl" ? "badkamers" : "baths",
    guests: lang === "nl" ? "gasten" : "guests",
    nightLabel: lang === "nl" ? "nacht" : "night",
    comingSoon: lang === "nl" ? "Binnenkort" : "Coming soon",
    pricingSoon: lang === "nl" ? "Prijzen volgen binnenkort" : "Pricing announced soon",
  };

  return (
    <SiteShell>
      {showHero && heroSlides.length > 0 && (
        <HomeHero
          title={heroTitle}
          slides={heroSlides}
          viewLabel={lang === "nl" ? "Bekijk de residentie" : "View property"}
          comingSoonLabel={lang === "nl" ? "Binnenkort" : "Coming soon"}
          availabilityLabel={
            lang === "nl" ? "Beschikbaarheid" : "Check availability"
          }
          availabilityHref="/contact"
        />
      )}

      {showResidences && (
        <section
          id="residences"
          className="py-20 lg:py-28 max-w-6xl mx-auto px-6"
          data-edit-id="home.residences"
          data-edit-prop="hidden"
        >
          <Reveal>
            <SectionHeading
              eyebrow={collectionEyebrow}
              title={
                <span data-edit-id="home.residences.title" data-edit-prop="text">
                  {collectionTitle}
                </span>
              }
              description={
                lang === "nl"
                  ? "Persoonlijk gerund, eerlijk geprijsd. Geen lobby's, gewoon de sleutel tot een plek die jouwe is."
                  : "Personally run, fairly priced. No lobbies — just the keys to a place that's yours."
              }
            />
          </Reveal>

          <StaggerGroup
            staggerChildren={0.12}
            className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
          >
            {properties.slice(0, 8).map((p) => {
              const agg = aggByProperty.get(p.id) ?? {
                from_price: null,
                bedrooms: null,
                bathrooms: null,
                max_guests: null,
              };
              const data: PropertyTileData = {
                slug: p.slug,
                name: pickText(overlay, `prop:${p.id}`, "name", null) ?? p.name,
                city: p.city,
                bedrooms: agg.bedrooms,
                bathrooms: agg.bathrooms,
                max_guests: agg.max_guests,
                rating: null,
                rating_count: null,
                hero_image_url:
                  pickText(overlay, `prop:${p.id}`, "hero_image_url", null) ??
                  p.hero_image_url,
                from_price_eur: agg.from_price,
                status: p.status,
                available_from: p.available_from,
              };
              return (
                <StaggerItem key={p.id}>
                  <PropertyTile property={data} locale={locale} t={tile} />
                </StaggerItem>
              );
            })}
          </StaggerGroup>

          <div className="mt-12 flex items-center justify-center gap-3">
            <Link
              href="/property"
              className="group inline-flex items-center gap-2.5 pl-2 pr-6 py-2 rounded-full bg-ink text-white text-[14px] font-medium hover:bg-ink-soft transition shadow-pill"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 12h12M13 6l6 6-6 6" />
                </svg>
              </span>
              {lang === "nl" ? "Meer residenties" : "View more Property"}
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center px-5 py-2.5 rounded-full bg-paper-warm hover:bg-paper-tint text-ink text-[14px] font-medium transition border border-black/5"
            >
              {lang === "nl" ? "Beschikbaarheid" : "Check Availability"}
            </Link>
          </div>
        </section>
      )}

      {/* Locations — neighbourhoods on Curaçao */}
      <section className="bg-ink text-white">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="font-display font-bold text-4xl md:text-5xl leading-tight tracking-tight">
                {lang === "nl"
                  ? "Dichtbij alles wat telt"
                  : "Stay close to what matters most"}
              </h2>
              <p className="mt-4 text-white/70 text-[15px] leading-relaxed">
                {lang === "nl"
                  ? "Onze residenties liggen centraal op Curaçao, dichtbij stranden, restaurants en het historische Willemstad."
                  : "Our residences are centrally located on Curaçao, close to beaches, restaurants and historic Willemstad."}
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid md:grid-cols-3 gap-10">
            {[
              {
                flag: "🇨🇼",
                city: "Willemstad",
                hood: "Pietermaai",
                body:
                  lang === "nl"
                    ? "Op loopafstand van de cafés, kunst en het kleurrijke Handelskade."
                    : "Walking distance from the cafés, art and colourful Handelskade.",
              },
              {
                flag: "🌴",
                city: "Jan Thiel",
                hood: "Caracasbaai",
                body:
                  lang === "nl"
                    ? "Strand, zwemmen met schildpadden en de bekende beach clubs."
                    : "Beach, swimming with turtles and the famous beach clubs.",
              },
              {
                flag: "🪸",
                city: "Westpunt",
                hood: "Kleine Knip · Grote Knip",
                body:
                  lang === "nl"
                    ? "Wilde stranden, kliffen en de mooiste duikplekken van het eiland."
                    : "Wild beaches, cliffs and the island's best dive spots.",
              },
            ].map((loc) => (
              <Reveal key={loc.city}>
                <div className="border-t border-white/15 pt-7">
                  <div className="text-3xl mb-3" aria-hidden>
                    {loc.flag}
                  </div>
                  <h3 className="font-display font-semibold text-2xl">{loc.city}</h3>
                  <p className="text-sm text-white/60 mt-1">{loc.hood}</p>
                  <p className="text-sm text-white/80 mt-4 leading-relaxed">{loc.body}</p>
                  <Link
                    href="/property"
                    className="mt-5 inline-flex items-center text-brand-400 text-sm hover:text-brand-100 transition"
                  >
                    {lang === "nl" ? "Bekijk residenties" : "View residences"} →
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Ready-to-check-in CTA */}
      <section className="relative">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-b from-paper to-paper-tint"
        />
        <div className="max-w-3xl mx-auto px-6 py-24 md:py-32 text-center">
          <Reveal>
            <p className="text-[12px] tracking-[0.3em] uppercase text-ink-mute mb-5">
              {lang === "nl" ? "Klaar om in te checken" : "Ready to check in"}
            </p>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-ink leading-tight">
              {lang === "nl"
                ? "Plan je verblijf op Curaçao."
                : "Plan your stay on Curaçao."}
            </h2>
            <p className="mt-5 text-ink-mute text-[15px] leading-relaxed">
              {lang === "nl"
                ? "Stuur een aanvraag of bericht ons rechtstreeks. We reageren meestal binnen 24 uur."
                : "Send a request or message us directly — we typically reply within 24 hours."}
            </p>
            <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2.5 pl-2 pr-6 py-2 rounded-full bg-brand-500 hover:bg-brand-600 text-white text-[14px] font-medium transition shadow-pill"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                  <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 12h12M13 6l6 6-6 6" />
                  </svg>
                </span>
                {lang === "nl" ? "Beschikbaarheid" : "Check availability"}
              </Link>
              {settings?.whatsapp_number && (
                <a
                  href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, "")}`}
                  className="inline-flex items-center px-5 py-2.5 rounded-full bg-paper-warm hover:bg-paper-tint text-ink text-[14px] font-medium transition border border-black/5"
                >
                  {lang === "nl" ? "Stuur WhatsApp" : "Contact host"}
                </a>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
