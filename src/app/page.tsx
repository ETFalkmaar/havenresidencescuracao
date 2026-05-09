import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SiteShell } from "@/components/site/SiteShell";
import { HomeHero } from "@/components/site/HomeHero";
import { TrustedBy } from "@/components/site/TrustedBy";
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
    supabase.from("units").select("property_id, base_price_eur, bedrooms, bathrooms, max_guests"),
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

  // Hero photos: first active property's gallery (max 7)
  const heroSlideshowProperty =
    properties.find((p) => p.status === "active") ?? properties[0];
  let heroImages: string[] = [];
  if (heroSlideshowProperty) {
    const { data: heroPhotos } = await supabase
      .from("photos")
      .select("url, position, is_hero")
      .eq("property_id", heroSlideshowProperty.id)
      .order("is_hero", { ascending: false })
      .order("position", { ascending: true })
      .limit(7);
    heroImages = (heroPhotos ?? [])
      .map((p) => (p as { url: string }).url)
      .filter(Boolean);
    if (heroImages.length === 0 && heroSlideshowProperty.hero_image_url) {
      heroImages = [heroSlideshowProperty.hero_image_url];
    }
  }

  // Per-property aggregates (from-price, beds/baths/guests min/max)
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

  // Editor-overridable hero copy
  const heroEyebrowKey = "home.hero.eyebrow";
  const heroTitleKey = "home.hero.title";
  const heroSubtitleKey = "home.hero.subtitle";

  const heroEyebrow =
    pickText(overlay, heroEyebrowKey, "text", null) ??
    (lang === "nl"
      ? "Gastenfavoriet · 4.8 ⋅ 474k+ reviews"
      : "Guest Favorites · 4.8 rate by 474k+ reviews");

  const heroTitle =
    pickText(overlay, heroTitleKey, "text", null) ??
    (lang === "nl"
      ? "Vind je volgende verblijf, voel je direct thuis"
      : "Find your next stay, feel right at home");

  const heroSubtitle =
    pickText(overlay, heroSubtitleKey, "text", null) ??
    (lang === "nl"
      ? "Ontdek alles op één plek, controleer beschikbaarheid en reserveer jouw ideale tweede thuis op Curaçao."
      : "In one location, look at all aspects, verify availability, and reserve your ideal home away from home on Curaçao.");

  const trustedCaption =
    pickText(overlay, "home.trusted.caption", "text", null) ??
    (lang === "nl"
      ? "Vertrouwd door 15k+ huiseigenaren wereldwijd"
      : "Trusted by 15k+ property owners from around the world");

  const collectionEyebrow =
    pickText(overlay, "home.residences.eyebrow", "text", null) ??
    (lang === "nl" ? "Beleef de bestemming" : "Live the destination");
  const collectionTitle =
    pickText(overlay, "home.residences.title", "text", null) ??
    (lang === "nl"
      ? "Niet alleen een kamer. Een plek die deel wordt van het avontuur."
      : "Not just a room. A place that becomes part of the adventure.");

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
      {showHero && (
        <HomeHero
          images={heroImages}
          eyebrow={heroEyebrow}
          title={heroTitle}
          subtitle={heroSubtitle}
          primaryCta={lang === "nl" ? "Bekijk residenties" : "View Property"}
          primaryHref="/property"
          secondaryCta={lang === "nl" ? "Beschikbaarheid" : "Check Availability"}
          secondaryHref="/contact"
        />
      )}

      <TrustedBy caption={trustedCaption} />

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
                  ? "Een kleine, persoonlijk geleide collectie. Geen lobby's, wel sleutels."
                  : "A small, owner-run collection. No lobbies — just keys to a place that's yours."
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
                rating: 4.8,
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

      {/* Stay close to what matters most — locations strip */}
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
                  ? "Centraal op Curaçao met directe toegang tot de mooiste stranden, restaurants en het oude Willemstad."
                  : "Centrally located on Curaçao with direct access to the best beaches, restaurants and historic Willemstad."}
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid md:grid-cols-3 gap-10">
            {[
              {
                flag: "🇨🇼",
                city: "Willemstad",
                hood: lang === "nl" ? "Pietermaai · 0000XX" : "Pietermaai · 0000XX",
                body:
                  lang === "nl"
                    ? "Op loopafstand van de cafés, kunst en het kleurrijke Handelskade. Een rustig hoekje in de bruisende stad."
                    : "Walking distance from the cafés, art and colourful Handelskade. A quiet corner in a vibrant city.",
              },
              {
                flag: "🌴",
                city: "Jan Thiel",
                hood: lang === "nl" ? "Caracasbaai" : "Caracasbaai",
                body:
                  lang === "nl"
                    ? "Strand, zwemmen met schildpadden en de beroemde beach clubs van Jan Thiel."
                    : "Beach, swimming with turtles and the famous Jan Thiel beach clubs.",
              },
              {
                flag: "🪸",
                city: "Westpunt",
                hood: lang === "nl" ? "Kleine Knip · Grote Knip" : "Kleine Knip · Grote Knip",
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
                    {lang === "nl" ? "Bekijk residenties" : "View on map"} →
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
                ? "Stuur een aanvraag, kijk of er open data zijn, of stuur ons een bericht. We reageren meestal binnen 24 uur."
                : "Send a request, see open dates, or message us — we typically reply within 24 hours."}
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
