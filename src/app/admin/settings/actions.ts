"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { fetchTrustpilot } from "@/lib/reviews/trustpilot";
import { fetchGoogle } from "@/lib/reviews/google";
import type { ReviewSource } from "@/lib/reviews/types";

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

// ---------- External reviews: Trustpilot + Google ----------

type ConnectionInput = {
  trustpilot_business_unit?: string | null;
  trustpilot_api_key?: string | null;
  google_place_id?: string | null;
  google_api_key?: string | null;
};

async function getKeys(): Promise<ConnectionInput | null> {
  const supabase = await createClient();
  // RLS hides api keys from anon/authenticated — but admins read via the
  // admin-server client. We pull what we need with the service-role client.
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();
  const { data } = await admin
    .from("site_settings")
    .select(
      "trustpilot_business_unit, trustpilot_api_key, google_place_id, google_api_key",
    )
    .eq("id", 1)
    .maybeSingle();
  return (data as ConnectionInput | null) ?? null;
}

/**
 * Save the Trustpilot and/or Google connection details. Empty strings clear
 * the field (effectively disconnect). When credentials are provided we
 * immediately attempt a sync and report errors back so the owner sees
 * "Connected" right away — or knows their slug / key is wrong.
 */
export async function connectExternalReviews(
  formData: FormData,
): Promise<ActionResult> {
  const guard = await ensureAdmin();
  if (!guard.ok) return guard;

  const payload = {
    trustpilot_business_unit: trimOrNull(formData.get("trustpilot_business_unit")),
    trustpilot_api_key: trimOrNull(formData.get("trustpilot_api_key")),
    google_place_id: trimOrNull(formData.get("google_place_id")),
    google_api_key: trimOrNull(formData.get("google_api_key")),
  };

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .update(payload)
    .eq("id", 1);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/settings");
  // Kick off a sync so the public site picks up the new data immediately.
  const syncRes = await syncExternalReviews();
  if (!syncRes.ok) return syncRes;
  return { ok: true };
}

/**
 * Hit Trustpilot + Google for the configured account(s) and upsert the
 * aggregate row + the recent reviews JSON. Called automatically after a
 * connect, but also exposed as its own "Refresh" button in the admin UI.
 */
export async function syncExternalReviews(): Promise<ActionResult> {
  const guard = await ensureAdmin();
  if (!guard.ok) return guard;

  const cfg = await getKeys();
  if (!cfg) return { ok: false, error: "Could not read site settings." };

  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();

  const errors: string[] = [];

  async function upsertAggregate(
    source: ReviewSource,
    aggregate: {
      url: string | null;
      rating: number | null;
      total_reviews: number | null;
      recent_reviews: unknown;
      last_sync_error: string | null;
    },
  ) {
    const { error } = await admin
      .from("external_review_aggregates")
      .upsert(
        {
          property_id: null,
          source,
          url: aggregate.url,
          rating: aggregate.rating,
          total_reviews: aggregate.total_reviews,
          recent_reviews: aggregate.recent_reviews,
          last_sync_error: aggregate.last_sync_error,
          last_synced_at: new Date().toISOString(),
          badge_html: null,
        },
        { onConflict: "source", ignoreDuplicates: false },
      );
    if (error) errors.push(`${source}: ${error.message}`);
  }

  if (cfg.trustpilot_business_unit && cfg.trustpilot_api_key) {
    const r = await fetchTrustpilot({
      businessUnit: cfg.trustpilot_business_unit,
      apiKey: cfg.trustpilot_api_key,
    });
    if (r.ok) {
      await upsertAggregate("trustpilot", r.aggregate);
    } else {
      errors.push(`Trustpilot: ${r.error}`);
      await upsertAggregate("trustpilot", {
        url: null,
        rating: null,
        total_reviews: null,
        recent_reviews: [],
        last_sync_error: r.error,
      });
    }
  }

  if (cfg.google_place_id && cfg.google_api_key) {
    const r = await fetchGoogle({
      placeId: cfg.google_place_id,
      apiKey: cfg.google_api_key,
    });
    if (r.ok) {
      await upsertAggregate("google", r.aggregate);
    } else {
      errors.push(`Google: ${r.error}`);
      await upsertAggregate("google", {
        url: null,
        rating: null,
        total_reviews: null,
        recent_reviews: [],
        last_sync_error: r.error,
      });
    }
  }

  revalidatePath("/reviews");
  revalidatePath("/admin/settings");

  if (errors.length > 0) {
    return { ok: false, error: errors.join(" · ") };
  }
  return { ok: true };
}

/** Remove the Trustpilot or Google aggregate (used by "Disconnect" buttons). */
export async function disconnectExternalReviews(
  source: ReviewSource,
): Promise<ActionResult> {
  const guard = await ensureAdmin();
  if (!guard.ok) return guard;

  const supabase = await createClient();

  // Clear credentials
  const clear =
    source === "trustpilot"
      ? { trustpilot_business_unit: null, trustpilot_api_key: null }
      : { google_place_id: null, google_api_key: null };
  await supabase.from("site_settings").update(clear).eq("id", 1);

  // Remove aggregate row
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();
  await admin
    .from("external_review_aggregates")
    .delete()
    .eq("source", source)
    .is("property_id", null);

  revalidatePath("/reviews");
  revalidatePath("/admin/settings");
  return { ok: true };
}
