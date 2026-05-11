import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SiteShell } from "@/components/site/SiteShell";
import { SectionHeading } from "@/components/site/SectionHeading";
import { PropertyTile, type PropertyTileData } from "@/components/site/PropertyTile";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/Reveal";
import { getTranslations, getLocale } from "@/lib/i18n/server";
import { type Property, type Unit } from "@/lib/types";
import { loadOverlay, pickText, pickBool } from "@/lib/editor/overrides";
import { isEditorPreview } from "@/lib/editor/mode";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Property",
};

export default async function PropertyPage() {
  const supabase = await createClient();
  const { lang } = await getTranslations();
  const locale = getLocale(lang);
  const editorPreview = await isEditorPreview();
  const { overlay } = await loadOverlay(editorPreview ? "draft" : "published");

  const [{ data: propertyRows }, { data: unitRows }] = await Promise.all([
    supabase.from("properties").select("*").order("position", { ascending: true }),
    supabase
      .from("units")
      .select("property_id, base_price_eur, bedrooms, bathrooms, max_guests"),
  ]);

  const allProps = (propertyRows ?? []) as Property[];
  const units = (unitRows ?? []) as Pick<
    Unit,
    "property_id" | "base_price_eur" | "bedrooms" | "bathrooms" | "max_guests"
  >[];

  const properties = allProps
    .filter((p) => p.status !== "draft" && p.status !== "archived")
    .filter((p) => !pickBool(overlay, `prop:${p.id}`, "hidden", false));

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

  const tile = {
    bedrooms: lang === "nl" ? "slaapkamers" : "bedrooms",
    baths: lang === "nl" ? "badkamers" : "baths",
    guests: lang === "nl" ? "gasten" : "guests",
    nightLabel: lang === "nl" ? "nacht" : "night",
    comingSoon: lang === "nl" ? "Binnenkort" : "Coming soon",
    pricingSoon: lang === "nl" ? "Prijzen volgen" : "Pricing soon",
  };

  const titleKey = lang === "nl" ? "property.title_nl" : "property.title";
  const eyebrowKey = lang === "nl" ? "property.eyebrow_nl" : "property.eyebrow";
  const descKey = lang === "nl" ? "property.desc_nl" : "property.desc";

  const eyebrow =
    pickText(overlay, eyebrowKey, "text", null) ??
    (lang === "nl" ? "De collectie" : "Live the destination");
  const title =
    pickText(overlay, titleKey, "text", null) ??
    (lang === "nl"
      ? "Niet alleen een kamer. Een plek die deel wordt van het avontuur."
      : "Not just a room. A place that becomes part of the adventure.");
  const description =
    pickText(overlay, descKey, "text", null) ??
    (lang === "nl"
      ? "Onze residenties zijn zorgvuldig gekozen voor wie meer wil dan een vakantie. Centraal gelegen, met persoonlijke aandacht en alles op loopafstand."
      : "Our residences are carefully chosen for travellers who want more than a vacation. Centrally located, personally cared for, and everything within reach.");

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
      </section>

      {/* Grid */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-20">
        {properties.length === 0 ? (
          <p className="text-center text-ink-mute">
            {lang === "nl"
              ? "Er zijn nog geen residenties beschikbaar."
              : "No residences available yet."}
          </p>
        ) : (
          <StaggerGroup
            staggerChildren={0.1}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
          >
            {properties.map((p) => {
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
        )}
      </section>

      {/* Things to know */}
      <section className="bg-ink text-white">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <Reveal>
            <h2 className="font-display font-bold text-4xl md:text-5xl mb-12">
              {lang === "nl" ? "Goed om te weten" : "Things to know"}
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: "🔍",
                title: lang === "nl" ? "Huisregels" : "House rules",
                items: [
                  lang === "nl" ? "Inchecken na 15:00" : "Check-in after 3:00 pm",
                  lang === "nl" ? "Uitchecken voor 11:00" : "Checkout before 11:00 am",
                  lang === "nl" ? "Geen feesten of luide muziek" : "No parties or loud music",
                  lang === "nl" ? "Roken is niet toegestaan" : "No smoking indoors",
                ],
              },
              {
                icon: "🛡️",
                title: lang === "nl" ? "Veiligheid" : "Safety & property",
                items: [
                  lang === "nl" ? "Rookmelder aanwezig" : "Smoke alarm on property",
                  lang === "nl" ? "Brandblusser beschikbaar" : "Fire extinguisher available",
                  lang === "nl" ? "EHBO-kit aanwezig" : "First-aid kit provided",
                  lang === "nl" ? "Beveiligde residentie" : "Gated property",
                ],
              },
              {
                icon: "🗓️",
                title: lang === "nl" ? "Annuleringsbeleid" : "Cancellation policy",
                items: [
                  lang === "nl" ? "Gratis annulering tot 7 dagen" : "Free cancellation up to 7 days",
                  lang === "nl" ? "Daarna gedeeltelijke restitutie" : "Partial refund after that",
                  lang === "nl" ? "Persoonlijk overleg mogelijk" : "Personal arrangements possible",
                ],
              },
            ].map((b, i) => (
              <Reveal key={i}>
                <div>
                  <div className="text-3xl mb-3">{b.icon}</div>
                  <h3 className="font-display font-semibold text-xl mb-4">{b.title}</h3>
                  <ul className="space-y-2 text-sm text-white/80">
                    {b.items.map((it, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-white/40" aria-hidden>·</span>
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/book"
              className="group inline-flex items-center gap-2.5 pl-2 pr-6 py-2 rounded-full bg-brand-500 hover:bg-brand-600 text-white text-[14px] font-medium transition shadow-pill"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 12h12M13 6l6 6-6 6" />
                </svg>
              </span>
              {lang === "nl" ? "Beschikbaarheid checken" : "Check availability"}
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
