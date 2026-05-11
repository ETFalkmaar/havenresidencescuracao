import { createClient } from "@/lib/supabase/server";
import { SiteShell } from "@/components/site/SiteShell";
import { BookingFlow } from "./BookingFlow";
import { getTranslations, getLocale } from "@/lib/i18n/server";
import type { Property, Unit, PricingSeason } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Book your stay",
};

type SearchParams = Promise<{ property?: string }>;

export default async function BookPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { property: requestedSlug } = await searchParams;
  const supabase = await createClient();
  const { lang, t } = await getTranslations();
  const locale = getLocale(lang);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Pull every visible residence + its first active unit + photos + seasons.
  const { data: propertyRows } = await supabase
    .from("properties")
    .select("*")
    .in("status", ["active", "coming_soon"])
    .order("position");

  const allProperties = (propertyRows ?? []) as Property[];

  const propertyIds = allProperties.map((p) => p.id);
  const [unitsRes, photosRes, seasonsRes, profileRes] = await Promise.all([
    supabase
      .from("units")
      .select("*")
      .in("property_id", propertyIds)
      .eq("status", "active")
      .order("position"),
    supabase
      .from("photos")
      .select("property_id, url, is_hero, position")
      .in("property_id", propertyIds)
      .order("is_hero", { ascending: false })
      .order("position"),
    supabase
      .from("pricing_seasons")
      .select("unit_id, start_date, end_date, price_multiplier, fixed_price_eur"),
    user
      ? supabase
          .from("profiles")
          .select("full_name, phone")
          .eq("user_id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const units = (unitsRes.data ?? []) as Unit[];
  const photos = (photosRes.data ?? []) as {
    property_id: string;
    url: string;
    is_hero: boolean;
    position: number;
  }[];
  const seasons = (seasonsRes.data ?? []) as (PricingSeason & {
    unit_id: string;
  })[];
  const profile = profileRes.data as {
    full_name: string | null;
    phone: string | null;
  } | null;

  // Pull blocked-date ranges for each unit so the date picker can grey them out.
  // We pull from the bookings table only — external (Airbnb) blocks live in
  // a separate table that we ignore per the project rules.
  const unitIds = units.map((u) => u.id);
  const { data: blockedRows } = await supabase
    .from("bookings")
    .select("unit_id, check_in, check_out")
    .in("unit_id", unitIds.length > 0 ? unitIds : ["00000000-0000-0000-0000-000000000000"])
    .in("status", ["pending", "confirmed"]);
  const blocked = (blockedRows ?? []) as {
    unit_id: string;
    check_in: string;
    check_out: string;
  }[];

  // Hand the residence list to the client component so it can show a
  // residence selector + the booking form for the chosen one.
  const residences = allProperties.map((p) => {
    const unit = units.find((u) => u.property_id === p.id);
    const photo =
      photos.find((ph) => ph.property_id === p.id && ph.is_hero)?.url ??
      photos.find((ph) => ph.property_id === p.id)?.url ??
      p.hero_image_url ??
      null;
    const propertySeasons = unit
      ? seasons
          .filter((s) => s.unit_id === unit.id)
          .map((s) => ({
            start_date: s.start_date,
            end_date: s.end_date,
            price_multiplier:
              s.price_multiplier === null ? null : Number(s.price_multiplier),
            fixed_price_eur:
              s.fixed_price_eur === null ? null : Number(s.fixed_price_eur),
          }))
      : [];
    const unitBlocked = unit
      ? blocked
          .filter((b) => b.unit_id === unit.id)
          .map((b) => ({ check_in: b.check_in, check_out: b.check_out }))
      : [];

    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      city: p.city,
      photo,
      status: p.status,
      availableFrom: p.available_from,
      colorHex: p.color_hex ?? "#1F6BF0",
      unit: unit
        ? {
            id: unit.id,
            base_price_eur: Number(unit.base_price_eur),
            cleaning_fee_eur: Number(unit.cleaning_fee_eur),
            long_stay_monthly_price_eur:
              unit.long_stay_monthly_price_eur === null
                ? null
                : Number(unit.long_stay_monthly_price_eur),
            min_long_stay_months: unit.min_long_stay_months,
            max_guests: unit.max_guests,
            bedrooms: unit.bedrooms,
            bathrooms: unit.bathrooms,
          }
        : null,
      seasons: propertySeasons,
      blocked: unitBlocked,
    };
  });

  return (
    <SiteShell>
      <section className="max-w-5xl mx-auto px-6 pt-10 md:pt-16 pb-8">
        <p className="text-[12px] tracking-[0.3em] uppercase text-ink-mute mb-4">
          {lang === "nl" ? "Direct boeken" : "Book online"}
        </p>
        <h1 className="font-display font-bold text-5xl md:text-6xl text-ink leading-[1.05] tracking-tight">
          {lang === "nl"
            ? "Boek jouw verblijf"
            : "Book your stay"}
        </h1>
        <p className="mt-4 text-ink-mute text-[16px] leading-relaxed max-w-xl">
          {lang === "nl"
            ? "Kies een residentie, kies je data en bevestig — geen wachttijd, je boeking is direct gereserveerd en wordt opgeslagen op je account."
            : "Pick a residence, pick your dates and confirm — no waiting, your booking is reserved instantly and saved to your account."}
        </p>
      </section>

      <BookingFlow
        residences={residences}
        initialSlug={requestedSlug ?? null}
        signedInUser={
          user
            ? {
                email: user.email!,
                fullName: profile?.full_name ?? null,
                phone: profile?.phone ?? null,
              }
            : null
        }
        locale={locale}
        t={t.booking}
        lang={lang}
      />
    </SiteShell>
  );
}
