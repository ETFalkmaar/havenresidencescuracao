import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTranslations } from "@/lib/i18n/server";
import { SettingsForm } from "./SettingsForm";
import { AirbnbConnectCard } from "./AirbnbConnectCard";
import { ReviewsConnectCard } from "./ReviewsConnectCard";
import { BrandLogoCard } from "./BrandLogoCard";

export const dynamic = "force-dynamic";

type Settings = {
  brand_name: string;
  brand_tagline: string | null;
  brand_tagline_nl: string | null;
  brand_description: string | null;
  brand_description_nl: string | null;
  contact_email: string | null;
  whatsapp_number: string | null;
  emergency_phone: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  google_review_url: string | null;
  trustpilot_url: string | null;
  logo_url: string | null;
};

type UnitWithProperty = {
  id: string;
  name: string;
  airbnb_ical_url: string | null;
  property_id: string;
  properties: { name: string } | { name: string }[] | null;
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const { lang } = await getTranslations();
  const tr = lang === "nl"
    ? {
        title: "Instellingen",
        subtitle: "Merkinformatie, contactgegevens, sociale links en integraties.",
      }
    : {
        title: "Settings",
        subtitle: "Brand info, contact details, social links, and integrations.",
      };

  // Note: the API-key columns are excluded for anon/authenticated, so we use
  // the service-role client for them. Everything else uses the user client.
  const admin = createAdminClient();
  const [settingsRes, unitsRes, reviewIntegrationsRes, statusesRes] =
    await Promise.all([
      supabase.from("site_settings").select("*").eq("id", 1).single(),
      supabase
        .from("units")
        .select("id, name, airbnb_ical_url, property_id, properties(name)")
        .order("created_at", { ascending: true }),
      admin
        .from("site_settings")
        .select(
          "trustpilot_business_unit, trustpilot_api_key, google_place_id, google_api_key",
        )
        .eq("id", 1)
        .maybeSingle(),
      admin
        .from("external_review_aggregates")
        .select("source, rating, total_reviews, last_synced_at, last_sync_error")
        .is("property_id", null),
    ]);

  const settings = (settingsRes.data ?? {
    brand_name: "Haven Residence",
    brand_tagline: null,
    brand_tagline_nl: null,
    brand_description: null,
    brand_description_nl: null,
    contact_email: null,
    whatsapp_number: null,
    emergency_phone: null,
    instagram_url: null,
    tiktok_url: null,
    google_review_url: null,
    trustpilot_url: null,
    logo_url: null,
  }) as Settings;

  const units = ((unitsRes.data ?? []) as UnitWithProperty[]).map((u) => {
    // Supabase typings sometimes hand back a single object, sometimes an
    // array, depending on relationship hints. Normalise to a string.
    const propName = Array.isArray(u.properties)
      ? u.properties[0]?.name
      : u.properties?.name;
    return {
      id: u.id,
      name: u.name,
      airbnb_ical_url: u.airbnb_ical_url,
      property_name: propName ?? "",
    };
  });

  return (
    <main className="max-w-3xl mx-auto px-6 py-12 space-y-12">
      <header>
        <h1 className="text-3xl font-extralight">{tr.title}</h1>
        <p className="text-sm text-neutral-500 mt-1">{tr.subtitle}</p>
      </header>

      <BrandLogoCard currentUrl={settings.logo_url} />

      <AirbnbConnectCard units={units} />

      <ReviewsConnectCard
        trustpilotBusinessUnit={
          (reviewIntegrationsRes.data?.trustpilot_business_unit as string | null) ?? null
        }
        hasTrustpilotKey={!!reviewIntegrationsRes.data?.trustpilot_api_key}
        googlePlaceId={
          (reviewIntegrationsRes.data?.google_place_id as string | null) ?? null
        }
        hasGoogleKey={!!reviewIntegrationsRes.data?.google_api_key}
        statuses={
          (statusesRes.data ?? []) as {
            source: "trustpilot" | "google";
            rating: number | null;
            total_reviews: number | null;
            last_synced_at: string | null;
            last_sync_error: string | null;
          }[]
        }
      />

      <SettingsForm settings={settings} />
    </main>
  );
}
