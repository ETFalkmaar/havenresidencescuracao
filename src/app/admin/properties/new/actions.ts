"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CreateResult = { ok: true; id: string } | { ok: false; error: string };

function trimOrNull(v: FormDataEntryValue | null): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length > 0 ? t : null;
}

export async function createProperty(formData: FormData): Promise<CreateResult> {
  const name = trimOrNull(formData.get("name"));
  const slug = trimOrNull(formData.get("slug"));
  const color_name = trimOrNull(formData.get("color_name")) ?? "blue";
  const color_hex = trimOrNull(formData.get("color_hex"));
  const status =
    (trimOrNull(formData.get("status")) as
      | "active"
      | "coming_soon"
      | "draft"
      | "archived"
      | null) ?? "coming_soon";
  const address = trimOrNull(formData.get("address"));
  const city = trimOrNull(formData.get("city"));
  const country = trimOrNull(formData.get("country")) ?? "Curaçao";
  const tagline = trimOrNull(formData.get("tagline"));
  const base_price_eur_raw = trimOrNull(formData.get("base_price_eur"));
  const base_price_eur =
    base_price_eur_raw !== null ? Number(base_price_eur_raw) : 100;

  if (!name || !slug || !address || !city) {
    return {
      ok: false,
      error: "Name, slug, address and city are required.",
    };
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return {
      ok: false,
      error: "Slug must be lowercase letters, numbers and hyphens only.",
    };
  }

  const supabase = await createClient();

  // Get next position
  const { data: posRow } = await supabase
    .from("properties")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextPos =
    ((posRow as { position: number } | null)?.position ?? 0) + 1;

  const { data: created, error: insErr } = await supabase
    .from("properties")
    .insert({
      slug,
      name,
      color_name,
      color_hex,
      tagline,
      address,
      city,
      country,
      status,
      position: nextPos,
    })
    .select("id")
    .single();

  if (insErr) {
    if (insErr.code === "23505") {
      return { ok: false, error: "Slug is already in use." };
    }
    return { ok: false, error: insErr.message };
  }

  const newPropertyId = (created as { id: string } | null)?.id;
  if (!newPropertyId) {
    return { ok: false, error: "Property created but ID not returned." };
  }

  // Create a default main unit so the property is bookable.
  const { error: unitErr } = await supabase.from("units").insert({
    property_id: newPropertyId,
    slug: "main",
    name: `${name} — Main Apartment`,
    description: null,
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 2,
    base_price_eur: Number.isFinite(base_price_eur) ? base_price_eur : 100,
    cleaning_fee_eur: 0,
    min_short_stay_nights: 1,
    min_long_stay_months: 4,
    status: "active",
    position: 1,
  });

  if (unitErr) {
    // Don't fail the whole creation; surface a soft warning instead.
    console.error("Default unit creation failed:", unitErr);
  }

  revalidatePath("/admin/properties");
  revalidatePath("/admin");
  revalidatePath("/");

  redirect(`/admin/properties/${newPropertyId}`);
}
