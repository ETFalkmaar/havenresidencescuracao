"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: true } | { ok: false; error: string };

function trimOrNull(v: FormDataEntryValue | null): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length > 0 ? t : null;
}

export async function updateSiteSettings(formData: FormData): Promise<ActionResult> {
  const brand_name = (formData.get("brand_name") as string | null)?.trim();
  if (!brand_name) {
    return { ok: false, error: "Brand name is required." };
  }

  const payload = {
    brand_name,
    brand_tagline: trimOrNull(formData.get("brand_tagline")),
    brand_description: trimOrNull(formData.get("brand_description")),
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
