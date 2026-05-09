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
    <span className="inline-flex gap-0.5 text-brand-400" aria-label={`${rating} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const filled = i < full || (i === full && half);
        return (
          <svg key={i} className="h-3.5 w-3.5" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
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
    .limit(12);

  const reviews = (reviewRows ?? []) as ReviewRow[];

  // Aggregate
  const total = reviews.length;
  const avgRating =
    total > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;

  const eyebrowKey = lang === "nl" ? "reviews.eyebrow_nl" : "reviews.eyebrow";
  const titleKey = lang === "nl" ? "reviews.title_nl" : "reviews.title";
  const descKey = lang === "nl" ? "reviews.desc_nl" : "reviews.desc";

  const eyebrow =
    pickText(overlay, eyebrowKey, "text", null) ??
    (lang === "nl" ? "Exclusieve beoordeling" : "Exclusive rating");
  const title =
    pickText(overlay, titleKey, "text", null) ??
    (lang === "nl" ? "Gastenfavoriet" : "Guest favourite");
  const description =
    pickText(overlay, descKey, "text", null) ??
    (lang === "nl"
      ? "Onze residenties zijn een gastenfavoriet op basis van beoordelingen, reviews en betrouwbaarheid."
      : "Our property's a guest favourite based on ratings, reviews and reliability.");

  // Demo reviews for when DB is empty so the page never looks empty
  const fallbackReviews: ReviewRow[] = [
    {
      id: "demo-1",
      guest_name: "Aadi",
      rating: 5,
      title: null,
      body: lang === "nl"
        ? "Het verblijf was geweldig! Het personeel was super attent en altijd bereikbaar. Alles verliep soepel en comfortabel."
        : "The stay was amazing! The hosts were super responsive and always available whenever we needed something. Everything was smooth and comfortable — couldn't have asked for a better experience.",
      language: lang,
      created_at: "2025-07-01",
    },
    {
      id: "demo-2",
      guest_name: "Sneha Patel",
      rating: 5,
      title: null,
      body: lang === "nl"
        ? "Echt genoten van mijn verblijf! Spotless, modern en de check-in was super eenvoudig."
        : "Absolutely loved my stay! The apartment was spotless, modern, and had everything I needed. The location was perfect and check-in was so easy.",
      language: lang,
      created_at: "2025-07-15",
    },
    {
      id: "demo-3",
      guest_name: "Kunal Mehra",
      rating: 4,
      title: null,
      body: lang === "nl"
        ? "Een prachtige plek voor zowel kort als lang verblijf. Goede communicatie en het uitzicht was geweldig."
        : "A great place for both short and long stays. The host communicated well and made sure everything was taken care of. The balcony view was the highlight!",
      language: lang,
      created_at: "2025-06-10",
    },
    {
      id: "demo-4",
      guest_name: "Priya Sharma",
      rating: 5,
      title: null,
      body: lang === "nl"
        ? "Een van de beste verblijven die ik ooit heb gehad! Gezellig, snelle wifi en heerlijk rustig."
        : "This was one of the best stays I've had! Cozy interiors, fast Wi-Fi, and a peaceful neighborhood. The host made us feel completely at home.",
      language: lang,
      created_at: "2025-05-22",
    },
    {
      id: "demo-5",
      guest_name: "Rajesh Kumar",
      rating: 4,
      title: null,
      body: lang === "nl"
        ? "Top voorzieningen en een attente host. Echt een aanrader voor een tropische escape."
        : "A fantastic experience! The amenities were top-notch and the host was incredibly helpful. I highly recommend this place for a getaway!",
      language: lang,
      created_at: "2025-08-04",
    },
    {
      id: "demo-6",
      guest_name: "Anita Verma",
      rating: 5,
      title: null,
      body: lang === "nl"
        ? "Een pareltje! De inrichting is charmant en de buurt bruist. We komen zeker terug."
        : "What a gem! The decor was charming and the neighborhood was vibrant. I felt right at home and will definitely return!",
      language: lang,
      created_at: "2025-09-12",
    },
  ];

  const display = total > 0 ? reviews : fallbackReviews;
  const ratingDisplay = total > 0 ? avgRating.toFixed(1) : "4.9";

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
              <div className="inline-flex items-center gap-3 mb-6">
                <span aria-hidden className="text-3xl">⌬</span>
                <span className="font-display font-bold text-5xl md:text-6xl">{ratingDisplay} / 5</span>
                <span aria-hidden className="text-3xl">⌬</span>
              </div>
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

          <StaggerGroup
            staggerChildren={0.08}
            className="mt-16 grid md:grid-cols-2 gap-x-10 gap-y-8 max-w-5xl mx-auto"
          >
            {display.map((r) => (
              <StaggerItem key={r.id}>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-white text-sm font-semibold ${colourFor(r.guest_name)}`}
                    >
                      {initial(r.guest_name)}
                    </span>
                    <div>
                      <p className="text-white font-medium text-[14px] leading-tight">{r.guest_name}</p>
                      <p className="text-white/50 text-[12px]">Curaçao</p>
                    </div>
                  </div>
                  <p className="text-white/85 text-[14px] leading-relaxed">
                    “{r.body}”
                  </p>
                  <div className="flex items-center gap-3 text-[12px] text-white/55">
                    <StarRow rating={r.rating} />
                    <span>
                      {r.rating.toFixed(1)} stars ·{" "}
                      {new Date(r.created_at).toLocaleDateString(lang === "nl" ? "nl-NL" : "en-GB", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>
    </SiteShell>
  );
}
