// Trustpilot business profile fetcher.
//
// We use the public Business Unit endpoint:
//   GET https://api.trustpilot.com/v1/business-units/find?name=<host>
//   GET https://api.trustpilot.com/v1/business-units/{id}/reviews?perPage=10&orderBy=createdat.desc
//
// Trustpilot requires an API key — the owner pastes it once on /admin/settings.
// All requests happen server-side so the key is never exposed to the browser.

import type { FetchResult } from "./types";

const TRUSTPILOT_API = "https://api.trustpilot.com/v1";

export async function fetchTrustpilot({
  businessUnit,
  apiKey,
}: {
  businessUnit: string;
  apiKey: string;
}): Promise<FetchResult> {
  try {
    // 1) Resolve business unit ID by domain/name
    const findRes = await fetch(
      `${TRUSTPILOT_API}/business-units/find?name=${encodeURIComponent(businessUnit)}`,
      {
        headers: { apikey: apiKey },
        // Trustpilot blocks if Accept header is wrong on some plans
        cache: "no-store",
      },
    );
    if (!findRes.ok) {
      return {
        ok: false,
        error: `Trustpilot lookup failed (${findRes.status}). Check the business unit slug or API key.`,
      };
    }
    const unit = (await findRes.json()) as {
      id?: string;
      score?: { trustScore?: number; stars?: number };
      numberOfReviews?: { total?: number };
      websiteUrl?: string;
      profileUrl?: string;
    };
    if (!unit.id) {
      return { ok: false, error: "Trustpilot business unit not found." };
    }

    // 2) Fetch recent reviews
    let reviews: {
      consumer?: { displayName?: string };
      stars?: number;
      text?: string;
      title?: string;
      language?: string;
      createdAt?: string;
    }[] = [];
    try {
      const reviewsRes = await fetch(
        `${TRUSTPILOT_API}/business-units/${unit.id}/reviews?perPage=10&orderBy=createdat.desc`,
        { headers: { apikey: apiKey }, cache: "no-store" },
      );
      if (reviewsRes.ok) {
        const json = (await reviewsRes.json()) as { reviews?: typeof reviews };
        reviews = json.reviews ?? [];
      }
    } catch {
      // Aggregate without reviews is still useful.
    }

    return {
      ok: true,
      aggregate: {
        source: "trustpilot",
        url: unit.profileUrl ?? null,
        rating: unit.score?.stars ?? unit.score?.trustScore ?? null,
        total_reviews: unit.numberOfReviews?.total ?? null,
        recent_reviews: reviews.map((r) => ({
          author: r.consumer?.displayName ?? "Trustpilot user",
          rating: r.stars ?? 0,
          body: (r.text ?? r.title ?? "").trim() || null,
          language: r.language ?? null,
          created_at: r.createdAt ?? new Date().toISOString(),
          source: "trustpilot",
        })),
        last_sync_error: null,
      },
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Trustpilot fetch failed.",
    };
  }
}
