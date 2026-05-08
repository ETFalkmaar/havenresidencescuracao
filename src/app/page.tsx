import { createClient } from "@/lib/supabase/server";
import { AnimatedHeader } from "@/components/AnimatedHeader";
import { Footer } from "@/components/Footer";
import { AnimatedPropertyCard } from "@/components/AnimatedPropertyCard";
import { InquiryForm } from "@/components/InquiryForm";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/Reveal";
import { getTranslations, getLocale } from "@/lib/i18n/server";
import { localized, type Property, type SiteSettings, type Unit } from "@/lib/types";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const { lang, t } = await getTranslations();
  const locale = getLocale(lang);

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

  const properties = allProperties.filter(
    (p) => p.status === "active" || p.status === "coming_soon",
  );

  // Build the hero slideshow: photos from the first active property,
  // ordered by position. Falls back to the property's hero_image_url alone.
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

  const brandName = settings?.brand_name ?? "Haven Residence";
  const brandTagline = localized(
    settings?.brand_tagline ?? null,
    settings?.brand_tagline_nl ?? null,
    lang,
  );
  const brandDescription = localized(
    settings?.brand_description ?? null,
    settings?.brand_description_nl ?? null,
    lang,
  );

  return (
    <>
      <AnimatedHeader
        brandName={brandName}
        lang={lang}
        t={t.nav}
        signedIn={Boolean(signedInUser)}
      />

      <HeroSlideshow
        images={heroImages}
        brandName={brandName}
        tagline={brandTagline}
        t={t.hero}
      />

      {/* Residences */}
      <section
        id="residences"
        className="py-28 lg:py-40 max-w-7xl mx-auto px-6 lg:px-10"
        style={{ perspective: 1200 }}
      >
        <Reveal className="mb-14 lg:mb-20 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-500 mb-4">
            {t.home.collection}
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extralight leading-[1.05] tracking-tight">
            {t.home.collectionTitle}
          </h2>
        </Reveal>

        <StaggerGroup
          staggerChildren={0.18}
          className="grid md:grid-cols-2 gap-7 lg:gap-10"
        >
          {properties.map((p) => (
            <StaggerItem key={p.id}>
              <AnimatedPropertyCard
                t={t.card}
                locale={locale}
                property={{
                  slug: p.slug,
                  name: p.name,
                  tagline: localized(p.tagline, p.tagline_nl, lang),
                  short_description: localized(
                    p.short_description,
                    p.short_description_nl,
                    lang,
                  ),
                  city: p.city,
                  status: p.status,
                  color_hex: p.color_hex,
                  hero_image_url: p.hero_image_url,
                  available_from: p.available_from,
                  from_price_eur: fromPriceByProperty.get(p.id) ?? null,
                }}
              />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* About */}
      <section
        id="about"
        className="py-28 lg:py-40 bg-neutral-50 dark:bg-neutral-950 border-y border-neutral-200 dark:border-neutral-900 relative overflow-hidden"
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
            <p className="text-xs uppercase tracking-[0.4em] text-neutral-500 mb-4">
              {t.home.ourStory}
            </p>
            <h2 className="text-4xl md:text-5xl font-extralight leading-tight tracking-tight mb-6">
              {t.home.ourStoryTitle}
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="space-y-5 text-neutral-700 dark:text-neutral-300 leading-relaxed text-[17px]">
              <p>{brandDescription ?? t.home.ourStoryFallback}</p>
              <p>{t.home.ourStoryParagraph2}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-28 lg:py-40 max-w-4xl mx-auto px-6 lg:px-10">
        <Reveal className="mb-12 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-500 mb-4">
            {t.home.inquire}
          </p>
          <h2 className="text-4xl md:text-5xl font-extralight leading-tight tracking-tight">
            {t.home.planYourStay}
          </h2>
          <p className="mt-5 text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xl mx-auto">
            {t.home.planSubtext}
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <InquiryForm t={t.inquiry} />
        </Reveal>
      </section>

      <Footer settings={settings ?? null} t={t.footer} />
    </>
  );
}
