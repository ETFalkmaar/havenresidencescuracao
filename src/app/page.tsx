import { createClient } from "@/lib/supabase/server";
import { AnimatedHeader } from "@/components/AnimatedHeader";
import { Footer } from "@/components/Footer";
import { AnimatedPropertyCard } from "@/components/AnimatedPropertyCard";
import { InquiryForm } from "@/components/InquiryForm";
import { HeroVideo } from "@/components/HeroVideo";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/Reveal";
import type { Property, SiteSettings, Unit } from "@/lib/types";

export const revalidate = 60;

export default async function Home() {
  const supabase = await createClient();

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

  const fromPriceByProperty = new Map<string, number>();
  for (const u of units) {
    const current = fromPriceByProperty.get(u.property_id);
    if (current === undefined || u.base_price_eur < current) {
      fromPriceByProperty.set(u.property_id, u.base_price_eur);
    }
  }

  const heroProperty =
    properties.find((p) => p.status === "active") ?? properties[0];

  const brandName = settings?.brand_name ?? "Haven Residence";
  const brandTagline = settings?.brand_tagline ?? null;

  return (
    <>
      <AnimatedHeader brandName={brandName} />

      <HeroVideo
        videoUrl={heroProperty?.hero_video_url ?? null}
        posterUrl={heroProperty?.hero_image_url ?? null}
        brandName={brandName}
        tagline={brandTagline}
      />

      {/* Residences */}
      <section
        id="residences"
        className="py-28 lg:py-40 max-w-7xl mx-auto px-6 lg:px-10"
        style={{ perspective: 1200 }}
      >
        <Reveal className="mb-14 lg:mb-20 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-500 mb-4">
            The collection
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extralight leading-[1.05] tracking-tight">
            Each Haven, a different shade of Curaçao.
          </h2>
        </Reveal>

        <StaggerGroup
          staggerChildren={0.18}
          className="grid md:grid-cols-2 gap-7 lg:gap-10"
        >
          {properties.map((p) => (
            <StaggerItem key={p.id}>
              <AnimatedPropertyCard
                property={{
                  slug: p.slug,
                  name: p.name,
                  tagline: p.tagline,
                  short_description: p.short_description,
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
        {/* Subtle decorative gradient orb */}
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
              Our story
            </p>
            <h2 className="text-4xl md:text-5xl font-extralight leading-tight tracking-tight mb-6">
              Local hospitality, residential calm.
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="space-y-5 text-neutral-700 dark:text-neutral-300 leading-relaxed text-[17px]">
              <p>
                {settings?.brand_description ??
                  "Haven Residence is a small, owner-run collection of stays across Curaçao. Each residence has its own character — from beachfront resort living to leafy island neighborhoods — but all share the same standard: thoughtful interiors, genuine local welcome, and the kind of details that turn a holiday into a return."}
              </p>
              <p>
                We host short escapes and longer winter residencies. Whatever
                the length, you&apos;re welcomed in person, given the keys to
                the island, and reachable around the clock if you need us.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-28 lg:py-40 max-w-4xl mx-auto px-6 lg:px-10">
        <Reveal className="mb-12 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-500 mb-4">
            Inquire
          </p>
          <h2 className="text-4xl md:text-5xl font-extralight leading-tight tracking-tight">
            Plan your stay.
          </h2>
          <p className="mt-5 text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xl mx-auto">
            Tell us when you&apos;d like to come and which residence speaks to
            you. We typically reply within 24 hours.
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <InquiryForm />
        </Reveal>
      </section>

      <Footer settings={settings ?? null} />
    </>
  );
}
