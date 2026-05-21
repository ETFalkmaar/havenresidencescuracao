import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PropertyCard } from '@/components/site/PropertyCard';
import { getProperties } from '@/lib/properties';

export const metadata: Metadata = {
  title: 'Accommodaties',
  description: 'Ontdek alle accommodaties van Haven Residences op Curaçao.',
};

export default async function AccommodatiesPage() {
  const properties = await getProperties();
  return (
    <main className="py-20">
      <Container>
        <SectionHeading
          eyebrow="Ons aanbod"
          title="Alle accommodaties"
        />
        <p className="mx-auto mt-6 max-w-2xl text-center leading-relaxed text-forest-dark/70">
          Zorgvuldig geselecteerde woningen op de mooiste plekken van Curaçao,
          elk met eigen karakter en alle comfort voor een onvergetelijk verblijf.
        </p>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.slug} property={property} pillLabel="Blue Haven" />
          ))}
        </div>
      </Container>
    </main>
  );
}
