import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./SettingsForm";

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

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .single();

  const settings = (data ?? {
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

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-extralight">Settings</h1>
      <p className="text-sm text-neutral-500 mt-1 mb-10">
        Brand info, contact details, and social links shown across the site.
      </p>

      <SettingsForm settings={settings} />
    </main>
  );
}
