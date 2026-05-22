import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Bath, Bed, Sparkles, Users } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { IconStat } from '@/components/ui/IconStat';
import { PropertyBookingCard } from '@/components/site/PropertyBookingCard';
import { PropertyGallery } from '@/components/site/PropertyGallery';
import { PropertyHero } from '@/components/site/PropertyHero';
import { getAllSlugs, getPropertyBySlug } from '@/lib/properties';

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) return {};
  return {
    title: property.name,
    description: property.shortDescription,
  };
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  return (
    <>
      <PropertyHero property={property} />

      <section className="py-12 sm:py-16">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
            <div className="space-y-12">
              <div>
                <div className="flex flex-wrap gap-x-8 gap-y-3 border-b border-black/[0.06] pb-6">
                  <IconStat icon={Users} label={`${property.stay.maxGuests} gasten`} />
                  <IconStat icon={Bed} label={`${property.stay.bedrooms} slaapkamers`} />
                  <IconStat icon={Bed} label={`${property.stay.beds} bedden`} />
                  <IconStat
                    icon={Bath}
                    label={`${property.stay.bathrooms} badkamer${
                      property.stay.bathrooms === 1 ? '' : 's'
                    }`}
                  />
                </div>
                <p className="mt-6 max-w-2xl leading-relaxed text-forest-dark/80">
                  {property.description}
                </p>
              </div>

              <div>
                <h2 className="font-serif text-3xl font-light text-forest-dark">
                  In de kijker
                </h2>
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  {property.highlights.map((h) => (
                    <div key={h.title} className="flex gap-3">
                      <Sparkles
                        className="mt-1 h-5 w-5 shrink-0 text-sage-600"
                        strokeWidth={1.5}
                      />
                      <div>
                        <h3 className="font-medium text-forest-dark">{h.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-forest-dark/70">
                          {h.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="font-serif text-3xl font-light text-forest-dark">
                  De woning per ruimte
                </h2>
                <div className="mt-8">
                  <PropertyGallery property={property} />
                </div>
              </div>

              <div className="grid gap-8 border-t border-black/[0.06] pt-12 sm:grid-cols-2">
                <div>
                  <h3 className="font-serif text-2xl font-light text-forest-dark">
                    Huisregels
                  </h3>
                  <ul className="mt-4 space-y-2 text-sm leading-relaxed text-forest-dark/80">
                    {property.houseRules.map((rule) => (
                      <li key={rule} className="flex gap-2">
                        <span className="text-sage-600">·</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-light text-forest-dark">
                    Annulering
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-forest-dark/80">
                    {property.cancellationPolicy}
                  </p>
                </div>
              </div>
            </div>

            <aside className="order-first lg:order-none">
              <PropertyBookingCard property={property} />
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
