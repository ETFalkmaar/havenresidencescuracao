import { createClient } from "@/lib/supabase/server";
import { SiteShell } from "@/components/site/SiteShell";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/Reveal";
import { getTranslations } from "@/lib/i18n/server";
import { loadOverlay, pickText } from "@/lib/editor/overrides";
import { isEditorPreview } from "@/lib/editor/mode";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Reviews",
};

type ReviewRow = {
  id: string;
  guest_name: string;
  rating: number;
  title: string | null;
  body: string | null;
  language: string | null;
  created_at: string;
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

function StarRow({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span
      className="inline-flex gap-0.5 text-brand-400"
      aria-label={`${rating} out of 5`}
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const filled = i < full || (i === full && half);
        return (
          <svg
            key={i}
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill={filled ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01z" />
          </svg>
        );
      })}
    </span>
  );
}

export default async function ReviewsPage() {
  const supabase = await createClient();
  const { lang } = await getTranslations();
  const editorPreview = await isEditorPreview();
  const { overlay } = await loadOverlay(editorPreview ? "draft" : "published");

  const { data: reviewRows } = await supabase
    .from("reviews")
    .select("id, guest_name, rating, title, body, language, created_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(24);

  const reviews = (reviewRows ?? []) as ReviewRow[];

  // Aggregate — only meaningful when we actually have published reviews.
  const total = reviews.length;
  const avgRating =
    total > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;

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
      ? "Alleen reviews van gasten die daadwerkelijk bij ons hebben verbleven, zonder filter en zonder selectie."
      : "Only reviews from guests who actually stayed with us — no filtering, no cherry-picking.");

  return (
    <SiteShell>
      <section className="bg-ink text-white">
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-24">
          <Reveal>
            <div className="text-center max-w-xl mx-auto">
              <p
                className="text-[12px] tracking-[0.3em] uppercase text-white/60 mb-6"
                data-edit-id={eyebrowKey}
                data-edit-prop="text"
              >
                {eyebrow}
              </p>
              {total > 0 && (
                <div className="inline-flex items-center gap-3 mb-6">
                  <StarRow rating={avgRating} />
                  <span className="font-display font-semibold text-2xl">
                    {avgRating.toFixed(1)} / 5
                  </span>
                  <span className="text-white/55 text-sm">
                    · {total} {lang === "nl" ? "reviews" : "reviews"}
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

          {total === 0 ? (
            <div className="mt-16 max-w-md mx-auto rounded-3xl border border-white/15 p-10 text-center">
              <p className="font-display font-semibold text-xl text-white">
                {lang === "nl"
                  ? "Nog geen reviews gepubliceerd"
                  : "No reviews published yet"}
              </p>
              <p className="text-sm text-white/65 mt-3 leading-relaxed">
                {lang === "nl"
                  ? "Onze residenties zijn pas geopend. Reviews verschijnen hier zodra gasten ze met ons delen."
                  : "Our residences have just opened. Reviews will appear here as guests share them with us."}
              </p>
            </div>
          ) : (
            <StaggerGroup
              staggerChildren={0.08}
              className="mt-16 grid md:grid-cols-2 gap-x-10 gap-y-8 max-w-5xl mx-auto"
            >
              {reviews.map((r) => (
                <StaggerItem key={r.id}>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-white text-sm font-semibold ${colourFor(r.guest_name)}`}
                      >
                        {initial(r.guest_name)}
                      </span>
                      <div>
                        <p className="text-white font-medium text-[14px] leading-tight">
                          {r.guest_name}
                        </p>
                        <p className="text-white/50 text-[12px]">Curaçao</p>
                      </div>
                    </div>
                    {r.body && (
                      <p className="text-white/85 text-[14px] leading-relaxed">
                        “{r.body}”
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-[12px] text-white/55">
                      <StarRow rating={r.rating} />
                      <span>
                        {r.rating.toFixed(1)} ·{" "}
                        {new Date(r.created_at).toLocaleDateString(
                          lang === "nl" ? "nl-NL" : "en-GB",
                          { month: "long", year: "numeric" },
                        )}
                      </span>
                    </div>
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
