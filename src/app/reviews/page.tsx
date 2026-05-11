import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SiteShell } from "@/components/site/SiteShell";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/Reveal";
import { getTranslations } from "@/lib/i18n/server";
import { loadOverlay, pickText } from "@/lib/editor/overrides";
import { isEditorPreview } from "@/lib/editor/mode";
import type { ExternalReview } from "@/lib/reviews/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Reviews",
};

type AggregateRow = {
  source: "trustpilot" | "google";
  url: string | null;
  rating: number | null;
  total_reviews: number | null;
  recent_reviews: ExternalReview[] | null;
  last_synced_at: string | null;
};

const COLOURS = [
  "bg-amber-500",
  "bg-emerald-500",
  "bg-purple-500",
  "bg-rose-500",
  "bg-blue-500",
  "bg-sky-500",
  "bg-orange-500",
  "bg-fuchsia-500",
];

function initial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

function colourFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return COLOURS[Math.abs(h) % COLOURS.length];
}

function StarRow({ rating, mute = false }: { rating: number; mute?: boolean }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span
      className={`inline-flex gap-0.5 ${mute ? "text-white/50" : "text-amber-400"}`}
      aria-label={`${rating} out of 5`}
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const filled = i < full || (i === full && half);
        return (
          <svg
            key={i}
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill={filled ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01z" />
          </svg>
        );
      })}
    </span>
  );
}

function SourceBadge({ source }: { source: "trustpilot" | "google" }) {
  if (source === "trustpilot") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-medium tracking-wide">
        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4-6.2-4.6-6.2 4.6 2.4-7.4L2 9.4h7.6L12 2z" />
        </svg>
        Trustpilot
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-300 text-[11px] font-medium tracking-wide">
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.3c1.9-1.8 3-4.4 3-7.3zM12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.5c-.9.6-2 1-3.4 1a5.9 5.9 0 0 1-5.6-4.1H3v2.6A10 10 0 0 0 12 22zm-5.6-7.9a6 6 0 0 1 0-4.2V7.3H3a10 10 0 0 0 0 9.4l3.4-2.6zM12 5.9c1.5 0 2.8.5 3.9 1.5l2.9-2.9C17 2.9 14.7 2 12 2A10 10 0 0 0 3 7.3l3.4 2.6A5.9 5.9 0 0 1 12 5.9z" />
      </svg>
      Google
    </span>
  );
}

export default async function ReviewsPage() {
  const supabase = await createClient();
  const { lang } = await getTranslations();
  const editorPreview = await isEditorPreview();
  const { overlay } = await loadOverlay(editorPreview ? "draft" : "published");

  const { data: aggregateRows } = await supabase
    .from("external_review_aggregates")
    .select("source, url, rating, total_reviews, recent_reviews, last_synced_at")
    .is("property_id", null);

  const aggregates = (aggregateRows ?? []) as AggregateRow[];

  // Combine recent reviews from all sources, newest first.
  const allReviews: ExternalReview[] = aggregates
    .flatMap((a) => a.recent_reviews ?? [])
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 16);

  const totalConnected = aggregates.filter(
    (a) => a.rating !== null || (a.total_reviews ?? 0) > 0,
  ).length;

  // Weighted average across sources
  const totalReviews = aggregates.reduce(
    (sum, a) => sum + (a.total_reviews ?? 0),
    0,
  );
  const weightedRating =
    totalReviews > 0
      ? aggregates.reduce(
          (sum, a) => sum + (a.rating ?? 0) * (a.total_reviews ?? 0),
          0,
        ) / totalReviews
      : 0;

  const eyebrowKey = lang === "nl" ? "reviews.eyebrow_nl" : "reviews.eyebrow";
  const titleKey = lang === "nl" ? "reviews.title_nl" : "reviews.title";
  const descKey = lang === "nl" ? "reviews.desc_nl" : "reviews.desc";

  const eyebrow =
    pickText(overlay, eyebrowKey, "text", null) ??
    (lang === "nl" ? "Gastbeoordelingen" : "Guest reviews");
  const title =
    pickText(overlay, titleKey, "text", null) ??
    (lang === "nl" ? "Wat gasten zeggen" : "What guests say");
  const description =
    pickText(overlay, descKey, "text", null) ??
    (lang === "nl"
      ? "Echte reviews, rechtstreeks gesynchroniseerd vanaf Trustpilot en Google. Niet door ons gefilterd of bewerkt."
      : "Real reviews, synced directly from Trustpilot and Google. Not filtered or edited by us.");

  return (
    <SiteShell>
      <section className="bg-ink text-white">
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-12">
          <Reveal>
            <div className="text-center max-w-xl mx-auto">
              <p
                className="text-[12px] tracking-[0.3em] uppercase text-white/60 mb-6"
                data-edit-id={eyebrowKey}
                data-edit-prop="text"
              >
                {eyebrow}
              </p>
              {totalReviews > 0 && (
                <div className="inline-flex items-center gap-3 mb-6">
                  <StarRow rating={weightedRating} />
                  <span className="font-display font-semibold text-2xl">
                    {weightedRating.toFixed(1)} / 5
                  </span>
                  <span className="text-white/55 text-sm">
                    · {totalReviews} {lang === "nl" ? "reviews" : "reviews"}
                  </span>
                </div>
              )}
              <h1
                className="font-display font-bold text-4xl md:text-5xl tracking-tight"
                data-edit-id={titleKey}
                data-edit-prop="text"
              >
                {title}
              </h1>
              <p
                className="mt-5 text-white/70 max-w-md mx-auto"
                data-edit-id={descKey}
                data-edit-prop="text"
              >
                {description}
              </p>
            </div>
          </Reveal>

          {/* Per-source badge row */}
          {aggregates.length > 0 && (
            <Reveal delay={0.1}>
              <div className="mt-10 grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
                {aggregates.map((a) => (
                  <a
                    key={a.source}
                    href={a.url ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur p-5 transition"
                  >
                    <SourceBadge source={a.source} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-display font-bold text-2xl text-white">
                          {a.rating !== null ? a.rating.toFixed(1) : "—"}
                        </span>
                        <span className="text-white/55 text-sm">/ 5</span>
                      </div>
                      <p className="text-xs text-white/60 mt-0.5">
                        {a.total_reviews ?? 0}{" "}
                        {lang === "nl"
                          ? `reviews op ${a.source === "trustpilot" ? "Trustpilot" : "Google"}`
                          : `reviews on ${a.source === "trustpilot" ? "Trustpilot" : "Google"}`}
                      </p>
                    </div>
                    <span className="text-white/40 group-hover:text-white transition text-sm">
                      ↗
                    </span>
                  </a>
                ))}
              </div>
            </Reveal>
          )}

          {/* Reviews list */}
          {allReviews.length === 0 ? (
            <div className="mt-16 max-w-md mx-auto rounded-3xl border border-white/15 p-10 text-center">
              <p className="font-display font-semibold text-xl text-white">
                {totalConnected === 0
                  ? lang === "nl"
                    ? "Nog geen review-bron gekoppeld"
                    : "No review source connected yet"
                  : lang === "nl"
                    ? "Nog geen reviews gepubliceerd"
                    : "No reviews published yet"}
              </p>
              <p className="text-sm text-white/65 mt-3 leading-relaxed">
                {totalConnected === 0 ? (
                  <>
                    {lang === "nl"
                      ? "De eigenaar kan Trustpilot of Google koppelen vanuit het admin paneel."
                      : "The owner can connect Trustpilot or Google from the admin panel."}{" "}
                    <Link
                      href="/admin/settings"
                      className="text-brand-400 hover:underline"
                    >
                      {lang === "nl" ? "Naar admin" : "Open admin"} →
                    </Link>
                  </>
                ) : lang === "nl" ? (
                  "Reviews verschijnen hier zodra ze op Trustpilot of Google verschijnen."
                ) : (
                  "Reviews will appear here as soon as guests post on Trustpilot or Google."
                )}
              </p>
            </div>
          ) : (
            <StaggerGroup
              staggerChildren={0.06}
              className="mt-16 grid md:grid-cols-2 gap-x-10 gap-y-8 max-w-5xl mx-auto"
            >
              {allReviews.map((r, i) => (
                <StaggerItem key={`${r.source}-${i}-${r.created_at}`}>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-white text-sm font-semibold ${colourFor(r.author)}`}
                        >
                          {initial(r.author)}
                        </span>
                        <div>
                          <p className="text-white font-medium text-[14px] leading-tight">
                            {r.author}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <StarRow rating={r.rating} />
                            <span className="text-white/50 text-[11px]">
                              {r.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <SourceBadge source={r.source} />
                    </div>
                    {r.body && (
                      <p className="text-white/85 text-[14px] leading-relaxed">
                        “{r.body}”
                      </p>
                    )}
                    <p className="text-[11px] text-white/50">
                      {new Date(r.created_at).toLocaleDateString(
                        lang === "nl" ? "nl-NL" : "en-GB",
                        { month: "long", year: "numeric" },
                      )}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
