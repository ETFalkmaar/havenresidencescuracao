// Google Places — Place Details fetcher.
//
//   GET https://maps.googleapis.com/maps/api/place/details/json
//     ?place_id=<id>
//     &fields=rating,user_ratings_total,reviews,url,name
//     &reviews_sort=newest
//     &key=<key>
//
// Google's Places API returns up to 5 most-recent reviews on the free tier.
// Costs ~ $0.017 per call — we cache aggregates so we hit it on save +
// once per nightly cron, not per page view.

import type { FetchResult } from "./types";

const PLACES_DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json";

type GooglePlaceResponse = {
  status: string;
  error_message?: string;
  result?: {
    rating?: number;
    user_ratings_total?: number;
    url?: string;
    reviews?: {
      author_name?: string;
      rating?: number;
      text?: string;
      language?: string;
      time?: number; // unix seconds
      relative_time_description?: string;
    }[];
  };
};

export async function fetchGoogle({
  placeId,
  apiKey,
}: {
  placeId: string;
  apiKey: string;
}): Promise<FetchResult> {
  try {
    const url = new URL(PLACES_DETAILS_URL);
    url.searchParams.set("place_id", placeId);
    url.searchParams.set(
      "fields",
      "rating,user_ratings_total,reviews,url,name",
    );
    url.searchParams.set("reviews_sort", "newest");
    url.searchParams.set("key", apiKey);

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) {
      return {
        ok: false,
        error: `Google Places call failed (${res.status}).`,
      };
    }
    const json = (await res.json()) as GooglePlaceResponse;
    if (json.status !== "OK") {
      return {
        ok: false,
        error: `Google Places: ${json.status}${json.error_message ? ` — ${json.error_message}` : ""}`,
      };
    }
    const r = json.result ?? {};
    return {
      ok: true,
      aggregate: {
        source: "google",
        url: r.url ?? null,
        rating: typeof r.rating === "number" ? r.rating : null,
        total_reviews:
          typeof r.user_ratings_total === "number" ? r.user_ratings_total : null,
        recent_reviews: (r.reviews ?? []).map((rev) => ({
          author: rev.author_name ?? "Google user",
          rating: rev.rating ?? 0,
          body: (rev.text ?? "").trim() || null,
          language: rev.language ?? null,
          created_at: rev.time
            ? new Date(rev.time * 1000).toISOString()
            : new Date().toISOString(),
          source: "google",
        })),
        last_sync_error: null,
      },
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Google Places fetch failed.",
    };
  }
}
