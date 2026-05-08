import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./SettingsForm";
import { AirbnbConnectCard } from "./AirbnbConnectCard";

export const dynamic = "force-dynamic";

type Settings = {
  brand_name: string;
  brand_tagline: string | null;
  brand_description: string | null;
  contact_email: string | null;
  whatsapp_number: string | null;
  emergency_phone: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  google_review_url: string | null;
  trustpilot_url: string | null;
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
  const [settingsRes, unitsRes] = await Promise.all([
    supabase.from("site_settings").select("*").eq("id", 1).single(),
    supabase
      .from("units")
      .select("id, name, airbnb_ical_url, property_id, properties(name)")
      .order("created_at", { ascending: true }),
  ]);

  const settings = (settingsRes.data ?? {
    brand_name: "Haven Residence",
    brand_tagline: null,
    brand_description: null,
    contact_email: null,
    whatsapp_number: null,
    emergency_phone: null,
    instagram_url: null,
    tiktok_url: null,
    google_review_url: null,
    trustpilot_url: null,
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
        <h1 className="text-3xl font-extralight">Settings</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Brand info, contact details, social links, and integrations.
        </p>
      </header>

      <AirbnbConnectCard units={units} />

      <SettingsForm settings={settings} />
    </main>
  );
}
