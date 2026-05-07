import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { InquiryForm } from "@/components/InquiryForm";
import { formatEur, formatDate } from "@/lib/format";
import type {
  Property,
  Unit,
  Photo,
  Amenity,
  PricingSeason,
  SiteSettings,
} from "@/lib/types";

export const revalidate = 60;
export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select("name, tagline, short_description, hero_image_url")
    .eq("slug", slug)
    .single();

  const property = data as Pick<Property, "name" | "tagline" | "short_description" | "hero_image_url"> | null;
  if (!property) return { title: "Not found" };

  return {
    title: property.name,
    description: property.tagline ?? property.short_description ?? undefined,
    openGraph: {
      title: property.name,
      description: property.tagline ?? property.short_description ?? undefined,
      images: property.hero_image_url ? [property.hero_image_url] : undefined,
    },
  };
}

const parkingLabel: Record<string, string> = {
  private: "Private parking inside gated grounds",
  public: "Public street parking",
  street: "Street parking",
  none: "No parking",
};

const utilitiesLabel: Record<string, string> = {
  included: "Utilities included",
  metered: "Metered — settled at end of stay",
  prepaid_card: "Prepaid utility cards",
};

type AmenityRow = { amenity_id: string; amenities: Pick<Amenity, "name" | "slug" | "category"> | null };

export default async function PropertyPage({ params }: { params: Params }) {
  const { slug } = await params;
  const supabase = await createClient();

  const propertyRes = await supabase
    .from("properties")
    .select("*")
    .eq("slug", slug)
    .single();
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
    supabase.from("site_settings").select("*").eq("id", 1).single(),
  ]);

  const units = (unitsRes.data ?? []) as Unit[];
  const photos = (photosRes.data ?? []) as Photo[];
  const settings = (settingsRes.data ?? null) as SiteSettings | null;

  const unit = units[0];

  const [amenitiesRes, seasonsRes] = await Promise.all([
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
  ]);

  const amenities = (amenitiesRes.data ?? []) as AmenityRow[];
  const seasons = (seasonsRes.data ?? []) as PricingSeason[];

  const accent = property.color_hex ?? "#1E5FBF";
  const isComingSoon = property.status === "coming_soon";

  return (
    <>
      <Header brandName={settings?.brand_name ?? "Haven Residence"} />

      {/* Hero */}
      <section className="relative h-[80vh] min-h-[500px] w-full overflow-hidden">
        {property.hero_image_url && (
          <Image
            src={property.hero_image_url}
            alt={property.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />

        <div className="relative h-full max-w-7xl mx-auto px-6 lg:px-10 flex flex-col justify-end pb-16 lg:pb-24 text-white">
          <Link href="/" className="text-xs uppercase tracking-[0.3em] text-white/70 mb-6 hover:text-white transition">
            ← All residences
          </Link>
          <div
            className="h-0.5 w-16 mb-5"
            style={{ backgroundColor: accent }}
          />
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extralight leading-[1.05]">
            {property.name}
          </h1>
          <p className="mt-4 text-lg md:text-xl text-white/85 max-w-2xl font-light">
            {property.tagline}
          </p>
          <p className="mt-2 text-sm text-white/60">
            {property.address} · {property.city}, {property.country}
          </p>

          {isComingSoon && (
            <div className="mt-6">
              <span
                className="inline-block text-[11px] tracking-widest uppercase px-4 py-2 rounded-full text-white"
                style={{ backgroundColor: accent }}
              >
                Coming soon
                {property.available_from
                  ? ` · ${formatDate(property.available_from)}`
                  : ""}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Description */}
      <section className="max-w-5xl mx-auto px-6 lg:px-10 py-20 lg:py-28 grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-3">
            About this residence
          </p>
          <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed text-lg whitespace-pre-line">
            {property.description ?? property.short_description}
          </p>
        </div>
        {unit && !isComingSoon && (
          <aside className="md:col-span-1">
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 sticky top-6 space-y-3 text-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                From
              </p>
              <p>
                <span className="text-3xl font-light">{formatEur(unit.base_price_eur)}</span>
                <span className="text-neutral-500"> / night</span>
              </p>
              {unit.long_stay_monthly_price_eur && (
                <p className="text-neutral-600 dark:text-neutral-400">
                  {formatEur(unit.long_stay_monthly_price_eur)} / month for {unit.min_long_stay_months}+ month stays
                </p>
              )}
              <ul className="pt-3 space-y-1 text-neutral-600 dark:text-neutral-400">
                <li>{unit.bedrooms} bedrooms · {unit.bathrooms} baths</li>
                <li>Up to {unit.max_guests} guests</li>
                {unit.size_m2 && <li>{unit.size_m2} m²</li>}
                <li>Cleaning fee: {formatEur(unit.cleaning_fee_eur)}</li>
              </ul>
              <a
                href="#inquire"
                className="block text-center mt-4 px-5 py-3 rounded-lg text-white text-sm font-medium tracking-wide transition"
                style={{ backgroundColor: accent }}
              >
                Request to book
              </a>
            </div>
          </aside>
        )}
      </section>

      {/* Photo gallery */}
      {photos.length > 1 && (
        <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-20">
          <div className="grid md:grid-cols-3 gap-3">
            {photos.slice(1, 7).map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-[4/3] rounded-xl overflow-hidden bg-neutral-200 dark:bg-neutral-900"
              >
                <Image
                  src={photo.url}
                  alt={photo.alt_text ?? property.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Amenities + property features */}
      <section className="bg-neutral-50 dark:bg-neutral-950 border-y border-neutral-200 dark:border-neutral-900 py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid md:grid-cols-2 gap-16">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-3">
              Features
            </p>
            <h2 className="text-3xl font-extralight mb-8">What this residence offers</h2>
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
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-3">
              The details
            </p>
            <h2 className="text-3xl font-extralight mb-8">Practical info</h2>
            <dl className="space-y-5 text-sm">
              <div className="flex justify-between gap-6 border-b border-neutral-200 dark:border-neutral-900 pb-4">
                <dt className="text-neutral-500">Parking</dt>
                <dd className="text-right">{parkingLabel[property.parking]}</dd>
              </div>
              <div className="flex justify-between gap-6 border-b border-neutral-200 dark:border-neutral-900 pb-4">
                <dt className="text-neutral-500">Gated property</dt>
                <dd className="text-right">{property.is_gated ? "Yes" : "No"}</dd>
              </div>
              <div className="flex justify-between gap-6 border-b border-neutral-200 dark:border-neutral-900 pb-4">
                <dt className="text-neutral-500">Pets</dt>
                <dd className="text-right">
                  {property.pets_allowed ? "Allowed" : "Not allowed"}
                </dd>
              </div>
              <div className="flex justify-between gap-6 border-b border-neutral-200 dark:border-neutral-900 pb-4">
                <dt className="text-neutral-500">Utilities</dt>
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
                  <dt className="text-neutral-500">Minimum stay</dt>
                  <dd className="text-right">
                    {unit.min_short_stay_nights} nights (short) ·{" "}
                    {unit.min_long_stay_months} months (long)
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </section>

      {/* Pricing seasons */}
      {seasons.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 lg:px-10 py-20">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-3">
            Seasonal rates
          </p>
          <h2 className="text-3xl font-extralight mb-8">High season periods</h2>
          <ul className="space-y-3">
            {seasons.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-900 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-neutral-500 text-xs">
                    {formatDate(s.start_date)} — {formatDate(s.end_date)}
                  </p>
                </div>
                <div className="text-right">
                  {s.fixed_price_eur ? (
                    <span className="font-medium">{formatEur(s.fixed_price_eur)} / night</span>
                  ) : s.price_multiplier && unit ? (
                    <span className="font-medium">
                      {formatEur(unit.base_price_eur * Number(s.price_multiplier))} / night
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-neutral-500">
            All other dates: {unit ? formatEur(unit.base_price_eur) : "—"} per night.
          </p>
        </section>
      )}

      {/* Inquiry */}
      <section
        id="inquire"
        className="border-t border-neutral-200 dark:border-neutral-900 py-20 lg:py-28"
      >
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-3">
            Inquire
          </p>
          <h2 className="text-3xl md:text-4xl font-extralight mb-4">
            {isComingSoon ? "Reserve early access" : `Stay at ${property.name}`}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8">
            {isComingSoon
              ? "We'll notify you the moment bookings open."
              : "Tell us your dates and we'll come back with availability and a personal welcome."}
          </p>
          <InquiryForm propertyId={property.id} accent={accent} />
        </div>
      </section>

      <Footer settings={settings ?? null} />
    </>
  );
}
