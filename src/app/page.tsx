import { createClient } from "@/lib/supabase/server";
import { AnimatedHeader } from "@/components/AnimatedHeader";
import { Footer } from "@/components/Footer";
import { AnimatedPropertyCard } from "@/components/AnimatedPropertyCard";
import { InquiryForm } from "@/components/InquiryForm";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/Reveal";
import { getTranslations, getLocale } from "@/lib/i18n/server";
import { localized, type Property, type SiteSettings, type Unit } from "@/lib/types";
import { loadOverlay, pickText, pickBool } from "@/lib/editor/overrides";
import { isEditorPreview } from "@/lib/editor/mode";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const { lang, t } = await getTranslations();
  const locale = getLocale(lang);

  const editorPreview = await isEditorPreview();
  const { overlay } = await loadOverlay(editorPreview ? "draft" : "published");

  const {
    data: { user: signedInUser },
  } = await supabase.auth.getUser();

  const [settingsRes, propertiesRes, unitsRes] = await Promise.all([
    supabase.from("site_settings").select("*").eq("id", 1).single(),
    supabase.from("properties").select("*").order("position", { ascending: true }),
    supabase.from("units").select("property_id, base_price_eur"),
  ]);

  const settings = (settingsRes.data ?? null) as SiteSettings | null;
  const allProperties = (propertiesRes.data ?? []) as Property[];
  const units = (unitsRes.data ?? []) as Pick<Unit, "property_id" | "base_price_eur">[];

  const properties = allProperties
    .filter((p) => p.status === "active" || p.status === "coming_soon")
    .filter((p) => !pickBool(overlay, `prop:${p.id}`, "hidden", false));

  const heroSlideshowProperty =
    properties.find((p) => p.status === "active") ?? properties[0];
  let heroImages: string[] = [];
  if (heroSlideshowProperty) {
    const { data: heroPhotos } = await supabase
      .from("photos")
      .select("url, position, is_hero")
      .eq("property_id", heroSlideshowProperty.id)
      .order("is_hero", { ascending: false })
      .order("position", { ascending: true })
      .limit(7);
    heroImages = (heroPhotos ?? [])
      .map((p) => (p as { url: string }).url)
      .filter(Boolean);
    if (heroImages.length === 0 && heroSlideshowProperty.hero_image_url) {
      heroImages = [heroSlideshowProperty.hero_image_url];
    }
  }

  const fromPriceByProperty = new Map<string, number>();
  for (const u of units) {
    const current = fromPriceByProperty.get(u.property_id);
    if (current === undefined || u.base_price_eur < current) {
      fromPriceByProperty.set(u.property_id, u.base_price_eur);
    }
  }

  const brandName =
    pickText(overlay, "home.hero.brandName", "text", null) ??
    settings?.brand_name ??
    "Haven Residence";

  const taglineKey = lang === "nl" ? "home.hero.tagline_nl" : "home.hero.tagline";
  const brandTagline =
    pickText(overlay, taglineKey, "text", null) ??
    localized(
      settings?.brand_tagline ?? null,
      settings?.brand_tagline_nl ?? null,
      lang,
    );

  const aboutBodyKey = lang === "nl" ? "home.about.body_nl" : "home.about.body";
  const aboutBody2Key = lang === "nl" ? "home.about.body2_nl" : "home.about.body2";
  const brandDescription =
    pickText(overlay, aboutBodyKey, "text", null) ??
    localized(
      settings?.brand_description ?? null,
      settings?.brand_description_nl ?? null,
      lang,
    );
  const brandDescription2 =
    pickText(overlay, aboutBody2Key, "text", null) ?? t.home.ourStoryParagraph2;

  // Section visibility
  const showHeader = !pickBool(overlay, "site.header", "hidden", false);
  const showFooter = !pickBool(overlay, "site.footer", "hidden", false);
  const showHero = !pickBool(overlay, "home.hero", "hidden", false);
  const showResidences = !pickBool(overlay, "home.residences", "hidden", false);
  const showAbout = !pickBool(overlay, "home.about", "hidden", false);
  const showContact = !pickBool(overlay, "home.contact", "hidden", false);

  // Section copy
  const residencesEyebrowKey = lang === "nl" ? "home.residences.eyebrow_nl" : "home.residences.eyebrow";
  const residencesTitleKey = lang === "nl" ? "home.residences.title_nl" : "home.residences.title";
  const residencesEyebrow =
    pickText(overlay, residencesEyebrowKey, "text", null) ?? t.home.collection;
  const residencesTitle =
    pickText(overlay, residencesTitleKey, "text", null) ?? t.home.collectionTitle;

  const aboutEyebrowKey = lang === "nl" ? "home.about.eyebrow_nl" : "home.about.eyebrow";
  const aboutTitleKey = lang === "nl" ? "home.about.title_nl" : "home.about.title";
  const aboutEyebrow =
    pickText(overlay, aboutEyebrowKey, "text", null) ?? t.home.ourStory;
  const aboutTitle =
    pickText(overlay, aboutTitleKey, "text", null) ?? t.home.ourStoryTitle;

  const contactEyebrowKey = lang === "nl" ? "home.contact.eyebrow_nl" : "home.contact.eyebrow";
  const contactTitleKey = lang === "nl" ? "home.contact.title_nl" : "home.contact.title";
  const contactSubtitleKey = lang === "nl" ? "home.contact.subtitle_nl" : "home.contact.subtitle";
  const contactEyebrow =
    pickText(overlay, contactEyebrowKey, "text", null) ?? t.home.inquire;
  const contactTitle =
    pickText(overlay, contactTitleKey, "text", null) ?? t.home.planYourStay;
  const contactSubtitle =
    pickText(overlay, contactSubtitleKey, "text", null) ?? t.home.planSubtext;

  return (
    <>
      {showHeader ? (
        <div data-edit-id="site.header" data-edit-prop="hidden">
          <AnimatedHeader
            brandName={brandName}
            lang={lang}
            t={t.nav}
            signedIn={Boolean(signedInUser)}
          />
        </div>
      ) : null}

      {showHero ? (
        <div data-edit-id="home.hero" data-edit-prop="hidden">
          <HeroSlideshow
            images={heroImages}
            brandName={brandName}
            tagline={brandTagline}
            t={t.hero}
          />
        </div>
      ) : null}

      {showResidences ? (
        <section
          id="residences"
          className="py-28 lg:py-40 max-w-7xl mx-auto px-6 lg:px-10"
          style={{ perspective: 1200 }}
          data-edit-id="home.residences"
          data-edit-prop="hidden"
        >
          <Reveal className="mb-14 lg:mb-20 max-w-2xl">
            <p
              className="text-xs uppercase tracking-[0.4em] text-neutral-500 mb-4"
              data-edit-id={residencesEyebrowKey}
              data-edit-prop="text"
            >
              {residencesEyebrow}
            </p>
            <h2
              className="text-4xl md:text-5xl lg:text-6xl font-extralight leading-[1.05] tracking-tight"
              data-edit-id={residencesTitleKey}
              data-edit-prop="text"
            >
              {residencesTitle}
            </h2>
          </Reveal>

          <StaggerGroup
            staggerChildren={0.18}
            className="grid md:grid-cols-2 gap-7 lg:gap-10"
          >
            {properties.map((p) => {
              const propTaglineKey = lang === "nl" ? "tagline_nl" : "tagline";
              const propShortDescKey = lang === "nl" ? "short_description_nl" : "short_description";
              const overrideTagline = pickText(overlay, `prop:${p.id}`, propTaglineKey, null);
              const overrideShort = pickText(overlay, `prop:${p.id}`, propShortDescKey, null);
              const overrideName = pickText(overlay, `prop:${p.id}`, "name", null);
              const overrideHero = pickText(overlay, `prop:${p.id}`, "hero_image_url", null);
              const overrideColor = pickText(overlay, `prop:${p.id}`, "color_hex", null);
              return (
                <StaggerItem key={p.id}>
                  <div data-edit-id={`prop:${p.id}`} data-edit-prop="hidden">
                    <AnimatedPropertyCard
                      t={t.card}
                      locale={locale}
                      property={{
                        slug: p.slug,
                        name: overrideName ?? p.name,
                        tagline:
                          overrideTagline ??
                          localized(p.tagline, p.tagline_nl, lang),
                        short_description:
                          overrideShort ??
                          localized(
                            p.short_description,
                            p.short_description_nl,
                            lang,
                          ),
                        city: p.city,
                        status: p.status,
                        color_hex: overrideColor ?? p.color_hex,
                        hero_image_url: overrideHero ?? p.hero_image_url,
                        available_from: p.available_from,
                        from_price_eur: fromPriceByProperty.get(p.id) ?? null,
                      }}
                    />
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </section>
      ) : null}

      {showAbout ? (
        <section
          id="about"
          className="py-28 lg:py-40 bg-neutral-50 dark:bg-neutral-950 border-y border-neutral-200 dark:border-neutral-900 relative overflow-hidden"
          data-edit-id="home.about"
          data-edit-prop="hidden"
        >
          <div
            aria-hidden
            className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(30, 95, 191, 0.5) 0%, transparent 70%)",
            }}
          />

          <div className="relative max-w-7xl mx-auto px-6 lg:px-10 grid md:grid-cols-2 gap-14 lg:gap-24">
            <Reveal>
              <p
                className="text-xs uppercase tracking-[0.4em] text-neutral-500 mb-4"
                data-edit-id={aboutEyebrowKey}
                data-edit-prop="text"
              >
                {aboutEyebrow}
              </p>
              <h2
                className="text-4xl md:text-5xl font-extralight leading-tight tracking-tight mb-6"
                data-edit-id={aboutTitleKey}
                data-edit-prop="text"
              >
                {aboutTitle}
              </h2>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="space-y-5 text-neutral-700 dark:text-neutral-300 leading-relaxed text-[17px]">
                <p data-edit-id={aboutBodyKey} data-edit-prop="text">
                  {brandDescription ?? t.home.ourStoryFallback}
                </p>
                <p data-edit-id={aboutBody2Key} data-edit-prop="text">
                  {brandDescription2}
                </p>
              </div>
            </Reveal>
          </div>
        </section>
      ) : null}

      {showContact ? (
        <section
          id="contact"
          className="py-28 lg:py-40 max-w-4xl mx-auto px-6 lg:px-10"
          data-edit-id="home.contact"
          data-edit-prop="hidden"
        >
          <Reveal className="mb-12 text-center">
            <p
              className="text-xs uppercase tracking-[0.4em] text-neutral-500 mb-4"
              data-edit-id={contactEyebrowKey}
              data-edit-prop="text"
            >
              {contactEyebrow}
            </p>
            <h2
              className="text-4xl md:text-5xl font-extralight leading-tight tracking-tight"
              data-edit-id={contactTitleKey}
              data-edit-prop="text"
            >
              {contactTitle}
            </h2>
            <p
              className="mt-5 text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xl mx-auto"
              data-edit-id={contactSubtitleKey}
              data-edit-prop="text"
            >
              {contactSubtitle}
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <InquiryForm t={t.inquiry} />
          </Reveal>
        </section>
      ) : null}

      {showFooter ? (
        <div data-edit-id="site.footer" data-edit-prop="hidden">
          <Footer settings={settings ?? null} t={t.footer} />
        </div>
      ) : null}
    </>
  );
}
