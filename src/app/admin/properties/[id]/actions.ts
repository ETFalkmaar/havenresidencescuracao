"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: true } | { ok: false; error: string };

const PROPERTY_STATUSES = ["active", "coming_soon", "draft", "archived"] as const;
const PARKING_TYPES = ["private", "public", "street", "none"] as const;
const UTILITIES_SYSTEMS = ["included", "metered", "prepaid_card"] as const;

function trimOrNull(v: FormDataEntryValue | null): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length > 0 ? t : null;
}

function asEnum<T extends readonly string[]>(
  value: FormDataEntryValue | null,
  allowed: T,
): T[number] | null {
  if (typeof value !== "string") return null;
  return (allowed as readonly string[]).includes(value)
    ? (value as T[number])
    : null;
}

export async function updateProperty(
  propertyId: string,
  formData: FormData,
): Promise<ActionResult> {
  const slug = trimOrNull(formData.get("slug"));
  const name = trimOrNull(formData.get("name"));
  const status = asEnum(formData.get("status"), PROPERTY_STATUSES);
  const parking = asEnum(formData.get("parking"), PARKING_TYPES);
  const utilities = asEnum(formData.get("utilities"), UTILITIES_SYSTEMS);

  if (!slug || !name) {
    return { ok: false, error: "Slug and name are required." };
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return {
      ok: false,
      error: "Slug must be lowercase letters, numbers, or hyphens.",
    };
  }
  if (!status || !parking || !utilities) {
    return { ok: false, error: "Invalid status / parking / utilities value." };
  }

  const availableFromRaw = trimOrNull(formData.get("available_from"));

  const payload = {
    slug,
    name,
    color_name: trimOrNull(formData.get("color_name")) ?? "blue",
    color_hex: trimOrNull(formData.get("color_hex")),
    tagline: trimOrNull(formData.get("tagline")),
    short_description: trimOrNull(formData.get("short_description")),
    description: trimOrNull(formData.get("description")),
    address: trimOrNull(formData.get("address")) ?? "",
    city: trimOrNull(formData.get("city")) ?? "",
    country: trimOrNull(formData.get("country")) ?? "Curaçao",
    status,
    parking,
    is_gated: formData.get("is_gated") === "on",
    pets_allowed: formData.get("pets_allowed") === "on",
    utilities,
    utilities_notes: trimOrNull(formData.get("utilities_notes")),
    available_from: availableFromRaw || null,
  };

  const supabase = await createClient();

  // Get the previous slug so we can revalidate the old public route too
  const { data: prev } = await supabase
    .from("properties")
    .select("slug")
    .eq("id", propertyId)
    .single();
  const prevSlug = (prev as { slug: string } | null)?.slug;

  const { error } = await supabase
    .from("properties")
    .update(payload)
    .eq("id", propertyId);

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Slug is already in use by another residence." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/properties");
  revalidatePath(`/admin/properties/${propertyId}`);
  revalidatePath("/", "layout");
  if (prevSlug && prevSlug !== slug) revalidatePath(`/${prevSlug}`);
  revalidatePath(`/${slug}`);

  return { ok: true };
}

export async function addPhoto({
  propertyId,
  url,
  altText,
}: {
  propertyId: string;
  url: string;
  altText?: string;
}): Promise<ActionResult> {
  if (!url) return { ok: false, error: "Missing URL." };
  const supabase = await createClient();

  const { data: maxRow } = await supabase
    .from("photos")
    .select("position")
    .eq("property_id", propertyId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextPos =
    ((maxRow as { position: number } | null)?.position ?? -1) + 1;

  const { data: existingHero } = await supabase
    .from("photos")
    .select("id")
    .eq("property_id", propertyId)
    .eq("is_hero", true)
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("photos").insert({
    property_id: propertyId,
    url,
    alt_text: altText ?? null,
    position: nextPos,
    is_hero: !existingHero,
  });
  if (error) return { ok: false, error: error.message };

  // If this is the first photo, also set property.hero_image_url
  if (!existingHero) {
    await supabase
      .from("properties")
      .update({ hero_image_url: url })
      .eq("id", propertyId);
  }

  await revalidateAfterPhotoChange(supabase, propertyId);
  return { ok: true };
}

export async function deletePhoto({
  photoId,
  propertyId,
}: {
  photoId: string;
  propertyId: string;
}): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: photo } = await supabase
    .from("photos")
    .select("url, is_hero")
    .eq("id", photoId)
    .single();

  const photoRow = photo as { url: string; is_hero: boolean } | null;
  if (!photoRow) return { ok: false, error: "Photo not found." };

  // Try to delete the underlying Storage object too (best-effort).
  const path = extractStoragePath(photoRow.url);
  if (path) {
    await supabase.storage.from("property-media").remove([path]);
  }

  const { error } = await supabase.from("photos").delete().eq("id", photoId);
  if (error) return { ok: false, error: error.message };

  // If the deleted photo was the hero, promote the next one (lowest position).
  if (photoRow.is_hero) {
    const { data: next } = await supabase
      .from("photos")
      .select("id, url")
      .eq("property_id", propertyId)
      .order("position", { ascending: true })
      .limit(1)
      .maybeSingle();
    const nextRow = next as { id: string; url: string } | null;
    if (nextRow) {
      await supabase
        .from("photos")
        .update({ is_hero: true })
        .eq("id", nextRow.id);
      await supabase
        .from("properties")
        .update({ hero_image_url: nextRow.url })
        .eq("id", propertyId);
    } else {
      await supabase
        .from("properties")
        .update({ hero_image_url: null })
        .eq("id", propertyId);
    }
  }

  await revalidateAfterPhotoChange(supabase, propertyId);
  return { ok: true };
}

export async function setHeroPhoto({
  photoId,
  propertyId,
}: {
  photoId: string;
  propertyId: string;
}): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: photo } = await supabase
    .from("photos")
    .select("url")
    .eq("id", photoId)
    .single();

  const photoRow = photo as { url: string } | null;
  if (!photoRow) return { ok: false, error: "Photo not found." };

  await supabase
    .from("photos")
    .update({ is_hero: false })
    .eq("property_id", propertyId);
  const { error } = await supabase
    .from("photos")
    .update({ is_hero: true })
    .eq("id", photoId);
  if (error) return { ok: false, error: error.message };

  await supabase
    .from("properties")
    .update({ hero_image_url: photoRow.url })
    .eq("id", propertyId);

  await revalidateAfterPhotoChange(supabase, propertyId);
  return { ok: true };
}

export async function movePhoto({
  photoId,
  propertyId,
  direction,
}: {
  photoId: string;
  propertyId: string;
  direction: "up" | "down";
}): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("photos")
    .select("id, position")
    .eq("property_id", propertyId)
    .order("position", { ascending: true });

  const list =
    (rows ?? []) as { id: string; position: number }[];
  const idx = list.findIndex((p) => p.id === photoId);
  if (idx === -1) return { ok: false, error: "Photo not found." };

  const targetIdx = direction === "up" ? idx - 1 : idx + 1;
  if (targetIdx < 0 || targetIdx >= list.length) return { ok: true };

  const a = list[idx];
  const b = list[targetIdx];

  await supabase.from("photos").update({ position: b.position }).eq("id", a.id);
  await supabase.from("photos").update({ position: a.position }).eq("id", b.id);

  await revalidateAfterPhotoChange(supabase, propertyId);
  return { ok: true };
}

async function revalidateAfterPhotoChange(
  supabase: Awaited<ReturnType<typeof createClient>>,
  propertyId: string,
) {
  const { data } = await supabase
    .from("properties")
    .select("slug")
    .eq("id", propertyId)
    .single();
  const slug = (data as { slug: string } | null)?.slug;
  revalidatePath(`/admin/properties/${propertyId}`);
  revalidatePath("/admin/properties");
  revalidatePath("/");
  if (slug) revalidatePath(`/${slug}`);
}

function extractStoragePath(url: string): string | null {
  // Public URL format:
  // https://<ref>.supabase.co/storage/v1/object/public/property-media/<path>
  const marker = "/storage/v1/object/public/property-media/";
  const i = url.indexOf(marker);
  if (i === -1) return null;
  return url.slice(i + marker.length);
}

// ========== UNIT ==========

function asNumber(v: FormDataEntryValue | null): number | null {
  if (typeof v !== "string" || v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function updateUnit(
  unitId: string,
  propertyId: string,
  formData: FormData,
): Promise<ActionResult> {
  const name = trimOrNull(formData.get("name"));
  const slug = trimOrNull(formData.get("slug"));
  const description = trimOrNull(formData.get("description"));
  const bedrooms = asNumber(formData.get("bedrooms"));
  const bathrooms = asNumber(formData.get("bathrooms"));
  const max_guests = asNumber(formData.get("max_guests"));
  const size_m2 = asNumber(formData.get("size_m2"));
  const base_price_eur = asNumber(formData.get("base_price_eur"));
  const cleaning_fee_eur = asNumber(formData.get("cleaning_fee_eur"));
  const min_short_stay_nights = asNumber(formData.get("min_short_stay_nights"));
  const min_long_stay_months = asNumber(formData.get("min_long_stay_months"));
  const long_stay_monthly_price_eur = asNumber(
    formData.get("long_stay_monthly_price_eur"),
  );
  const status = trimOrNull(formData.get("status")) ?? "active";

  if (!name || !slug || base_price_eur === null) {
    return { ok: false, error: "Name, slug and base price are required." };
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { ok: false, error: "Slug: lowercase, numbers, hyphens only." };
  }
  if (base_price_eur < 0 || (cleaning_fee_eur ?? 0) < 0) {
    return { ok: false, error: "Prices cannot be negative." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("units")
    .update({
      name,
      slug,
      description,
      bedrooms: bedrooms ?? 1,
      bathrooms: bathrooms ?? 1,
      max_guests: max_guests ?? 2,
      size_m2,
      base_price_eur,
      cleaning_fee_eur: cleaning_fee_eur ?? 0,
      min_short_stay_nights: min_short_stay_nights ?? 1,
      min_long_stay_months: min_long_stay_months ?? 4,
      long_stay_monthly_price_eur,
      status,
    })
    .eq("id", unitId);

  if (error) return { ok: false, error: error.message };

  await revalidatePropertyAndPublic(supabase, propertyId);
  return { ok: true };
}

// ========== UNIT AMENITIES ==========

export async function updateUnitAmenities(
  unitId: string,
  propertyId: string,
  amenityIds: string[],
): Promise<ActionResult> {
  const supabase = await createClient();

  // Replace strategy: delete all existing, insert the new set.
  const { error: delErr } = await supabase
    .from("unit_amenities")
    .delete()
    .eq("unit_id", unitId);
  if (delErr) return { ok: false, error: delErr.message };

  if (amenityIds.length > 0) {
    const rows = amenityIds.map((aid) => ({ unit_id: unitId, amenity_id: aid }));
    const { error: insErr } = await supabase.from("unit_amenities").insert(rows);
    if (insErr) return { ok: false, error: insErr.message };
  }

  await revalidatePropertyAndPublic(supabase, propertyId);
  return { ok: true };
}

// ========== PRICING SEASONS ==========

type SeasonInput = {
  id?: string;
  name: string;
  start_date: string;
  end_date: string;
  price_multiplier: number | null;
  fixed_price_eur: number | null;
};

export async function savePricingSeasons(
  unitId: string,
  propertyId: string,
  seasons: SeasonInput[],
  deletedIds: string[],
): Promise<ActionResult> {
  const supabase = await createClient();

  if (deletedIds.length > 0) {
    const { error: delErr } = await supabase
      .from("pricing_seasons")
      .delete()
      .in("id", deletedIds);
    if (delErr) return { ok: false, error: delErr.message };
  }

  for (let i = 0; i < seasons.length; i++) {
    const s = seasons[i];
    if (!s.name || !s.start_date || !s.end_date) {
      return { ok: false, error: `Season #${i + 1}: name and dates required.` };
    }
    if (s.price_multiplier === null && s.fixed_price_eur === null) {
      return {
        ok: false,
        error: `Season "${s.name}": either a multiplier or a fixed price is required.`,
      };
    }

    const payload = {
      unit_id: unitId,
      name: s.name,
      start_date: s.start_date,
      end_date: s.end_date,
      price_multiplier: s.price_multiplier,
      fixed_price_eur: s.fixed_price_eur,
      position: i,
    };

    if (s.id) {
      const { error } = await supabase
        .from("pricing_seasons")
        .update(payload)
        .eq("id", s.id);
      if (error) return { ok: false, error: error.message };
    } else {
      const { error } = await supabase.from("pricing_seasons").insert(payload);
      if (error) return { ok: false, error: error.message };
    }
  }

  await revalidatePropertyAndPublic(supabase, propertyId);
  return { ok: true };
}

async function revalidatePropertyAndPublic(
  supabase: Awaited<ReturnType<typeof createClient>>,
  propertyId: string,
) {
  const { data } = await supabase
    .from("properties")
    .select("slug")
    .eq("id", propertyId)
    .single();
  const slug = (data as { slug: string } | null)?.slug;
  revalidatePath(`/admin/properties/${propertyId}`);
  revalidatePath("/admin/properties");
  revalidatePath("/admin/units");
  revalidatePath("/");
  if (slug) revalidatePath(`/${slug}`);
}
