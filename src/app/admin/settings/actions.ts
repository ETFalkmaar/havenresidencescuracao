"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: true } | { ok: false; error: string };

function trimOrNull(v: FormDataEntryValue | null): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length > 0 ? t : null;
}

async function ensureAdmin(): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };
  const { data: row } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!row) return { ok: false, error: "Not authorized." };
  return { ok: true };
}

/**
 * Save just the Airbnb iCal URL on a unit. Used by the
 * "Connect Airbnb" wizard on /admin/settings — a lighter alternative
 * to the full UnitEditor form.
 */
export async function setUnitAirbnbIcal(
  unitId: string,
  url: string,
): Promise<ActionResult> {
  const guard = await ensureAdmin();
  if (!guard.ok) return guard;

  const trimmed = url.trim();
  if (trimmed && !/^https?:\/\//i.test(trimmed)) {
    return { ok: false, error: "URL must start with http(s)://" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("units")
    .update({ airbnb_ical_url: trimmed || null })
    .eq("id", unitId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/settings");
  revalidatePath(`/admin/properties`);
  return { ok: true };
}

export async function updateSiteSettings(formData: FormData): Promise<ActionResult> {
  const brand_name = (formData.get("brand_name") as string | null)?.trim();
  if (!brand_name) {
    return { ok: false, error: "Brand name is required." };
  }

  const payload = {
    brand_name,
    brand_tagline: trimOrNull(formData.get("brand_tagline")),
    brand_tagline_nl: trimOrNull(formData.get("brand_tagline_nl")),
    brand_description: trimOrNull(formData.get("brand_description")),
    brand_description_nl: trimOrNull(formData.get("brand_description_nl")),
    contact_email: trimOrNull(formData.get("contact_email")),
    whatsapp_number: trimOrNull(formData.get("whatsapp_number")),
    emergency_phone: trimOrNull(formData.get("emergency_phone")),
    instagram_url: trimOrNull(formData.get("instagram_url")),
    tiktok_url: trimOrNull(formData.get("tiktok_url")),
    google_review_url: trimOrNull(formData.get("google_review_url")),
    trustpilot_url: trimOrNull(formData.get("trustpilot_url")),
  };

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .update(payload)
    .eq("id", 1);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return { ok: true };
}
