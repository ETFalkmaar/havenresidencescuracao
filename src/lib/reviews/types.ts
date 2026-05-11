// Shared types for the Trustpilot + Google Reviews integration.

export type ReviewSource = "trustpilot" | "google";

export type ExternalReview = {
  author: string;
  rating: number; // 1-5
  body: string | null;
  language: string | null;
  created_at: string; // ISO 8601
  source: ReviewSource;
};

export type ExternalReviewAggregate = {
  source: ReviewSource;
  url: string | null;
  rating: number | null; // 0-5
  total_reviews: number | null;
  recent_reviews: ExternalReview[];
  last_synced_at: string | null;
  last_sync_error: string | null;
};

export type FetchResult =
  | { ok: true; aggregate: Omit<ExternalReviewAggregate, "last_synced_at"> }
  | { ok: false; error: string };
