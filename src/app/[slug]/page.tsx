import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SiteShell } from "@/components/site/SiteShell";
import { PropertyHeroSlideshow } from "@/components/site/PropertyHeroSlideshow";
import { InquiryForm } from "@/components/InquiryForm";
import { BookingForm } from "@/components/BookingForm";
import { PhotoGallery } from "@/components/PhotoGallery";
import { Reveal } from "@/components/Reveal";
import { formatEur, formatDate } from "@/lib/format";
import { getTranslations, getLocale } from "@/lib/i18n/server";
import { fmt } from "@/lib/i18n/translations";
import {
  localized,
  type Property,
  type Unit,
  type Photo,
  type Amenity,
  type PricingSeason,
  type SiteSettings,
} from "@/lib/types";

export const revalidate = 0;
export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select(
      "name, tagline, tagline_nl, short_description, short_description_nl, hero_image_url",
    )
    .eq("slug", slug)
    .maybeSingle();

  const property = data as Pick<
    Property,
    | "name"
    | "tagline"
    | "tagline_nl"
    | "short_description"
    | "short_description_nl"
    | "hero_image_url"
  > | null;
  if (!property) return { title: "Not found" };

  // Metadata is rendered for both languages — pick best-available text.
  const tagline = property.tagline ?? property.tagline_nl;
  const shortDesc = property.short_description ?? property.short_description_nl;

  return {
    title: property.name,
    description: tagline ?? shortDesc ?? undefined,
    openGraph: {
      title: property.name,
      description: tagline ?? shortDesc ?? undefined,
      images: property.hero_image_url ? [property.hero_image_url] : undefined,
    },
  };
}

type AmenityRow = {
  amenity_id: string;
  amenities: Pick<Amenity, "name" | "slug" | "category"> | null;
};

type BlockedRange = { check_in: string; check_out: string };

export default async function PropertyPage({ params }: { params: Params }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { lang, t } = await getTranslations();
  const locale = getLocale(lang);

  const {
    data: { user: signedInUser },
  } = await supabase.auth.getUser();

  const propertyRes = await supabase
    .from("properties")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  const property = propertyRes.data as Property | null;

  if (!property || property.status === "draft" || property.status === "archived") {
    notFound();
  }

  const [unitsRes, photosRes, settingsRes] = await Promise.all([
    supabase
      .from("units")
      .select("*")
      .eq("property_id", property.id)
      .eq("status", "active")
      .order("position"),
    supabase
      .from("photos")
      .select("*")
      .eq("property_id", property.id)
      .order("position"),
    supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
  ]);

  const units = (unitsRes.data ?? []) as Unit[];
  const photos = (photosRes.data ?? []) as Photo[];
  const settings = (settingsRes.data ?? null) as SiteSettings | null;

  const unit = units[0];

  const [amenitiesRes, seasonsRes, blockedRes, profileRes] = await Promise.all([
    unit
      ? supabase
          .from("unit_amenities")
          .select("amenity_id, amenities(name, slug, category)")
          .eq("unit_id", unit.id)
      : Promise.resolve({ data: [] as AmenityRow[] }),
    unit
      ? supabase
          .from("pricing_seasons")
          .select("*")
          .eq("unit_id", unit.id)
          .order("start_date")
      : Promise.resolve({ data: [] as PricingSeason[] }),
    unit
      ? supabase.rpc("unit_blocked_ranges", { p_unit_id: unit.id })
      : Promise.resolve({ data: [] as BlockedRange[] }),
    signedInUser
      ? supabase
          .from("profiles")
          .select("full_name, phone")
          .eq("user_id", signedInUser.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const amenities = (amenitiesRes.data ?? []) as AmenityRow[];
  const seasons = (seasonsRes.data ?? []) as PricingSeason[];
  const blocked = (blockedRes.data ?? []) as BlockedRange[];
  const profile = (profileRes.data ?? null) as
    | { full_name: string | null; phone: string | null }
    | null;

  const accent = property.color_hex ?? "#1E5FBF";
  const isComingSoon = property.status === "coming_soon";
  const td = t.detail;

  const parkingLabel: Record<string, string> = {
    private: td.parkingPrivate,
    public: td.parkingPublic,
    street: td.parkingStreet,
    none: td.parkingNone,
  };

  const utilitiesLabel: Record<string, string> = {
    included: td.utilitiesIncluded,
    metered: td.utilitiesMetered,
    prepaid_card: td.utilitiesPrepaid,
  };

  const galleryPhotos = photos.slice(1).map((p) => ({
    id: p.id,
    url: p.url,
    alt_text: p.alt_text,
  }));

  const canBook = !isComingSoon && unit !== undefined;

  return (
    <SiteShell>
      {/* Hero — full-bleed photo slideshow that rotates every 5 seconds. */}
      <section className="relative h-[88vh] min-h-[560px] w-full overflow-hidden -mt-[88px] bg-ink">
        <PropertyHeroSlideshow
          images={(() => {
            const seen = new Set<string>();
            const urls: string[] = [];
            for (const p of photos) {
              if (p.url && !seen.has(p.url)) {
                seen.add(p.url);
                urls.push(p.url);
              }
            }
            // Fallback to hero_image_url if there are no photos at all.
            if (urls.length === 0 && property.hero_image_url) {
              urls.push(property.hero_image_url);
            }
            return urls;
          })()}
          alt={property.name}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/15 to-black/80 pointer-events-none" />

        <div className="relative h-full max-w-7xl mx-auto px-6 lg:px-10 flex flex-col justify-end pb-16 lg:pb-24 text-white">
          <Reveal delay={0.1}>
            <Link
              href="/"
              className="text-[12px] tracking-[0.3em] uppercase text-white/70 hover:text-white transition inline-block mb-6"
            >
              ← {td.allResidences}
            </Link>
          </Reveal>

          {/* Eyebrow: CITY · COUNTRY — uses the same uppercase-tracked
              treatment as the homepage hero caption. */}
          <Reveal delay={0.2}>
            <p className="text-[12px] md:text-[13px] tracking-[0.3em] uppercase text-white/85 mb-4">
              {property.city} · {property.country}
            </p>
          </Reveal>

          {property.logo_url && (
            <Reveal delay={0.25}>
              <div className="mb-5 flex">
                <div className="relative h-24 w-24 md:h-28 md:w-28 lg:h-32 lg:w-32 drop-shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                  <Image
                    src={property.logo_url}
                    alt={property.name}
                    fill
                    priority
                    sizes="128px"
                    className="object-contain"
                  />
                </div>
              </div>
            </Reveal>
          )}

          {/* Residence name — same display font (Manrope bold) as the
              homepage hero heading. */}
          <Reveal delay={0.3}>
            <h1 className="font-display font-bold text-white text-5xl md:text-7xl lg:text-[6.5rem] leading-[0.95] tracking-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
              {property.name}
            </h1>
          </Reveal>

          <Reveal delay={0.45}>
            <p className="mt-5 text-lg md:text-xl text-white/85 max-w-2xl">
              {localized(property.tagline, property.tagline_nl, lang)}
            </p>
          </Reveal>
          <Reveal delay={0.55}>
            <p className="mt-2 text-sm text-white/60">
              {property.address}
            </p>
          </Reveal>

          {isComingSoon && (
            <Reveal delay={0.7}>
              <span
                className="inline-flex items-center mt-6 px-4 py-2 rounded-full bg-white text-ink text-[11px] tracking-[0.25em] uppercase font-semibold"
              >
                {td.comingSoon}
                {property.available_from
                  ? ` · ${formatDate(property.available_from, locale)}`
                  : ""}
              </span>
            </Reveal>
          )}
        </div>
      </section>

      {/* Description */}
      <section className="max-w-5xl mx-auto px-6 lg:px-10 py-20 lg:py-28 grid md:grid-cols-3 gap-10">
        <Reveal className="md:col-span-2">
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-500 mb-4">
            {td.aboutResidence}
          </p>
          <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed text-lg whitespace-pre-line">
            {localized(property.description, property.description_nl, lang) ??
              localized(
                property.short_description,
                property.short_description_nl,
                lang,
              )}
          </p>
        </Reveal>
        {unit && !isComingSoon && (
          <Reveal delay={0.2} as="div" className="md:col-span-1">
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 sticky top-24 space-y-3 text-sm bg-white/50 dark:bg-neutral-950/50 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                {td.from}
              </p>
              <p>
                <span className="text-3xl font-light">
                  {formatEur(unit.base_price_eur, locale)}
                </span>
                <span className="text-neutral-500"> {td.perNight}</span>
              </p>
              {unit.long_stay_monthly_price_eur && (
                <p className="text-neutral-600 dark:text-neutral-400">
                  {formatEur(unit.long_stay_monthly_price_eur, locale)}{" "}
                  {td.perMonth} {fmt(td.forLongStays, { n: unit.min_long_stay_months })}
                </p>
              )}
              <ul className="pt-3 space-y-1 text-neutral-600 dark:text-neutral-400">
                <li>
                  {unit.bedrooms} {td.bedrooms} · {unit.bathrooms} {td.bathrooms}
                </li>
                <li>{fmt(td.upToGuests, { n: unit.max_guests })}</li>
                {unit.size_m2 && <li>{unit.size_m2} m²</li>}
                <li>
                  {td.cleaningFee} {formatEur(unit.cleaning_fee_eur, locale)}
                </li>
              </ul>
              <a
                href="#book"
                className="block text-center mt-4 px-5 py-3 rounded-lg text-white text-sm font-medium tracking-wide transition hover:opacity-90"
                style={{ backgroundColor: accent }}
              >
                {td.requestToBook}
              </a>
            </div>
          </Reveal>
        )}
      </section>

      {/* Photo gallery */}
      {galleryPhotos.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-20">
          <PhotoGallery
            photos={galleryPhotos}
            propertyName={property.name}
            accent={accent}
          />
        </section>
      )}

      {/* Amenities + property features */}
      <section className="bg-neutral-50 dark:bg-neutral-950 border-y border-neutral-200 dark:border-neutral-900 py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid md:grid-cols-2 gap-16">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.4em] text-neutral-500 mb-4">
              {td.features}
            </p>
            <h2 className="text-3xl font-extralight mb-8">
              {td.whatThisOffers}
            </h2>
            <ul className="grid grid-cols-2 gap-3 text-sm text-neutral-700 dark:text-neutral-300">
              {amenities.map((row) => {
                const a = row.amenities;
                if (!a) return null;
                return (
                  <li key={a.slug} className="flex items-start gap-2">
                    <span
                      className="mt-1.5 inline-block w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: accent }}
                    />
                    <span>{a.name}</span>
                  </li>
                );
              })}
            </ul>
          </Reveal>

          <Reveal delay={0.15}>
            <p className="text-xs uppercase tracking-[0.4em] text-neutral-500 mb-4">
              {td.details}
            </p>
            <h2 className="text-3xl font-extralight mb-8">{td.practicalInfo}</h2>
            <dl className="space-y-5 text-sm">
              <div className="flex justify-between gap-6 border-b border-neutral-200 dark:border-neutral-900 pb-4">
                <dt className="text-neutral-500">{td.parking}</dt>
                <dd className="text-right">{parkingLabel[property.parking]}</dd>
              </div>
              <div className="flex justify-between gap-6 border-b border-neutral-200 dark:border-neutral-900 pb-4">
                <dt className="text-neutral-500">{td.gatedProperty}</dt>
                <dd className="text-right">
                  {property.is_gated ? td.yes : td.no}
                </dd>
              </div>
              <div className="flex justify-between gap-6 border-b border-neutral-200 dark:border-neutral-900 pb-4">
                <dt className="text-neutral-500">{td.pets}</dt>
                <dd className="text-right">
                  {property.pets_allowed ? td.allowed : td.notAllowed}
                </dd>
              </div>
              <div className="flex justify-between gap-6 border-b border-neutral-200 dark:border-neutral-900 pb-4">
                <dt className="text-neutral-500">{td.utilities}</dt>
                <dd className="text-right">
                  {utilitiesLabel[property.utilities]}
                  {property.utilities_notes && (
                    <span className="block text-xs text-neutral-500 mt-1">
                      {property.utilities_notes}
                    </span>
                  )}
                </dd>
              </div>
              {unit && (
                <div className="flex justify-between gap-6 border-b border-neutral-200 dark:border-neutral-900 pb-4">
                  <dt className="text-neutral-500">{td.minStay}</dt>
                  <dd className="text-right">
                    {unit.min_short_stay_nights} {td.nightsShort} ·{" "}
                    {unit.min_long_stay_months} {td.monthsLong}
                  </dd>
                </div>
              )}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* Pricing seasons */}
      {seasons.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 lg:px-10 py-20">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.4em] text-neutral-500 mb-4">
              {td.seasonalRates}
            </p>
            <h2 className="text-3xl font-extralight mb-8">
              {td.highSeasonPeriods}
            </h2>
          </Reveal>
          <ul className="space-y-3">
            {seasons.map((s, i) => (
              <Reveal key={s.id} delay={i * 0.05} as="li">
                <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-900 py-3 text-sm">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-neutral-500 text-xs">
                      {formatDate(s.start_date, locale)} —{" "}
                      {formatDate(s.end_date, locale)}
                    </p>
                  </div>
                  <div className="text-right">
                    {s.fixed_price_eur ? (
                      <span className="font-medium">
                        {formatEur(s.fixed_price_eur, locale)} {td.perNight}
                      </span>
                    ) : s.price_multiplier && unit ? (
                      <span className="font-medium">
                        {formatEur(
                          unit.base_price_eur * Number(s.price_multiplier),
                          locale,
                        )}{" "}
                        {td.perNight}
                      </span>
                    ) : null}
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>
          <p className="mt-4 text-xs text-neutral-500">
            {fmt(td.otherDates, {
              price: unit ? formatEur(unit.base_price_eur, locale) : "—",
            })}
          </p>
        </section>
      )}

      {/* Booking — only when the residence is active. Coming-soon residences
          skip this block; guests can still use the question form below. */}
      {canBook && unit && (
        <section
          id="book"
          className="border-t border-black/5 py-20 lg:py-28 bg-paper"
        >
          <div className="max-w-3xl mx-auto px-6 lg:px-10">
            <Reveal>
              <p className="text-[12px] uppercase tracking-[0.3em] text-ink-mute mb-4">
                {t.booking.bookOnline}
              </p>
              <h2 className="font-display font-bold text-3xl md:text-4xl mb-4 tracking-tight text-ink">
                {fmt(td.stayAt, { name: property.name })}
              </h2>
              <p className="text-ink-mute mb-8 leading-relaxed">
                {t.booking.bookSubtext}
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <BookingForm
                unit={{
                  id: unit.id,
                  base_price_eur: Number(unit.base_price_eur),
                  cleaning_fee_eur: Number(unit.cleaning_fee_eur),
                  long_stay_monthly_price_eur:
                    unit.long_stay_monthly_price_eur === null
                      ? null
                      : Number(unit.long_stay_monthly_price_eur),
                  min_long_stay_months: unit.min_long_stay_months,
                  max_guests: unit.max_guests,
                }}
                seasons={seasons.map((s) => ({
                  start_date: s.start_date,
                  end_date: s.end_date,
                  price_multiplier:
                    s.price_multiplier === null ? null : Number(s.price_multiplier),
                  fixed_price_eur:
                    s.fixed_price_eur === null ? null : Number(s.fixed_price_eur),
                }))}
                blocked={blocked}
                signedInUser={
                  signedInUser
                    ? {
                        email: signedInUser.email!,
                        fullName: profile?.full_name ?? null,
                        phone: profile?.phone ?? null,
                      }
                    : null
                }
                accent={accent}
                propertySlug={property.slug}
                locale={locale}
                t={t.booking}
              />
            </Reveal>
          </div>
        </section>
      )}

      {/* Coming-soon block — replaces booking with a notify / wait-list CTA. */}
      {isComingSoon && (
        <section
          id="notify"
          className="border-t border-black/5 py-20 lg:py-28 bg-paper-tint"
        >
          <div className="max-w-3xl mx-auto px-6 lg:px-10 text-center">
            <Reveal>
              <p className="text-[12px] uppercase tracking-[0.3em] text-ink-mute mb-4">
                {lang === "nl" ? "Binnenkort" : "Coming soon"}
              </p>
              <h2 className="font-display font-bold text-3xl md:text-5xl mb-4 tracking-tight text-ink">
                {lang === "nl"
                  ? "Boekingen openen binnenkort"
                  : "Bookings open soon"}
              </h2>
              <p className="text-ink-mute leading-relaxed max-w-xl mx-auto">
                {lang === "nl"
                  ? `${property.name} is bijna klaar voor onze eerste gasten. Laat ons je gegevens achter en je hoort als eerste wanneer boekingen openen — geen wachtlijst, geen verplichting.`
                  : `${property.name} is almost ready for our first guests. Leave your details and you'll be the first to hear when bookings open — no waitlist, no obligation.`}
              </p>
              {property.available_from && (
                <p className="mt-4 text-[12px] uppercase tracking-[0.3em] text-ink-mute">
                  {lang === "nl" ? "Verwacht open" : "Expected to open"} ·{" "}
                  {new Date(property.available_from).toLocaleDateString(locale, {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
            </Reveal>
          </div>
        </section>
      )}

      {/* Questions section — always present, 24h reply. */}
      <section
        id="ask"
        className="border-t border-black/5 py-20 lg:py-28 bg-paper-tint"
      >
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <Reveal>
            <div className="text-center mb-10">
              <p className="text-[12px] uppercase tracking-[0.3em] text-ink-mute mb-4">
                {lang === "nl" ? "Vragen?" : "Questions?"}
              </p>
              <h2 className="font-display font-bold text-3xl md:text-5xl tracking-tight text-ink leading-tight">
                {lang === "nl"
                  ? "Stuur ons een bericht"
                  : "Send us a message"}
              </h2>
              <p className="mt-4 text-ink-mute leading-relaxed">
                {lang === "nl"
                  ? "We reageren binnen 24 uur. Schoonmaak, sleutels, ligging, lange verblijven — vraag het ons gerust."
                  : "We reply within 24 hours. Cleaning, keys, location, longer stays — ask us anything."}
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="rounded-3xl bg-white border border-black/5 shadow-pill p-6 md:p-8">
              <InquiryForm
                propertyId={property.id}
                accent="#0B0B0B"
                t={t.inquiry}
              />
            </div>
          </Reveal>
        </div>
      </section>

    </SiteShell>
  );
}
