import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PropertyCard } from "@/components/PropertyCard";
import { InquiryForm } from "@/components/InquiryForm";
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
    properties.find((p) => p.status === "active" && p.hero_image_url) ?? properties[0];

  return (
    <>
      <Header brandName={settings?.brand_name ?? "Haven Residence"} />

      {/* Hero */}
      <section className="relative h-screen min-h-[600px] w-full overflow-hidden">
        {heroProperty?.hero_image_url && (
          <Image
            src={heroProperty.hero_image_url}
            alt="Haven Residence — Curaçao"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

        <div className="relative h-full max-w-7xl mx-auto px-6 lg:px-10 flex flex-col justify-end pb-24 lg:pb-32 text-white">
          <p className="text-xs lg:text-sm uppercase tracking-[0.3em] text-white/80 mb-4">
            Curaçao · since 2026
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extralight leading-[1.05] max-w-4xl">
            {settings?.brand_name ?? "Haven Residence"}
          </h1>
          {settings?.brand_tagline && (
            <p className="mt-6 text-base md:text-lg text-white/90 max-w-2xl font-light">
              {settings.brand_tagline}
            </p>
          )}
          <div className="mt-10 flex gap-4">
            <a
              href="#residences"
              className="px-7 py-3.5 bg-white text-neutral-900 rounded-full text-sm font-medium tracking-wide hover:bg-white/90 transition"
            >
              Explore residences
            </a>
            <a
              href="#contact"
              className="px-7 py-3.5 border border-white/40 rounded-full text-sm font-medium tracking-wide hover:bg-white/10 transition"
            >
              Get in touch
            </a>
          </div>
        </div>
      </section>

      {/* Residences */}
      <section id="residences" className="py-24 lg:py-32 max-w-7xl mx-auto px-6 lg:px-10">
        <div className="mb-12 lg:mb-16 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-3">
            The collection
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extralight leading-tight">
            Each Haven, a different shade of Curaçao.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {properties.map((p) => (
            <PropertyCard
              key={p.id}
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
          ))}
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        className="py-24 lg:py-32 bg-neutral-50 dark:bg-neutral-950 border-y border-neutral-200 dark:border-neutral-900"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid md:grid-cols-2 gap-12 lg:gap-20">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-3">
              Our story
            </p>
            <h2 className="text-3xl md:text-4xl font-extralight leading-tight mb-6">
              Local hospitality, residential calm.
            </h2>
          </div>
          <div className="space-y-5 text-neutral-700 dark:text-neutral-300 leading-relaxed">
            <p>
              {settings?.brand_description ??
                "Haven Residence is a small, owner-run collection of stays across Curaçao. Each residence has its own character — from beachfront resort living to leafy island neighborhoods — but all share the same standard: thoughtful interiors, genuine local welcome, and the kind of details that turn a holiday into a return."}
            </p>
            <p>
              We host short escapes and longer winter residencies. Whatever the length, you&apos;re welcomed in person, given the keys to the island, and reachable around the clock if you need us.
            </p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 lg:py-32 max-w-4xl mx-auto px-6 lg:px-10">
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-3">
            Inquire
          </p>
          <h2 className="text-3xl md:text-4xl font-extralight leading-tight">
            Plan your stay.
          </h2>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">
            Tell us when you&apos;d like to come and which residence speaks to you. We typically reply within 24 hours.
          </p>
        </div>
        <InquiryForm />
      </section>

      <Footer settings={settings ?? null} />
    </>
  );
}
