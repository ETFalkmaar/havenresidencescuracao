import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { getProperties } from '@/lib/properties';
import { PropertyCard } from './PropertyCard';

export async function PropertyGrid() {
  const properties = await getProperties();
  const featured = properties.slice(0, 3);
  return (
    <section className="py-20">
      <Container>
        <SectionHeading
          eyebrow="Onze accommodaties"
          title="Ontdek jouw perfecte verblijf"
        />
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((property) => (
            <PropertyCard
              key={property.slug}
              property={property}
              pillLabel="Blue Haven"
            />
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link
            href="/accommodaties"
            className="inline-flex items-center gap-2 rounded-full border border-sage-600 px-6 py-2 text-sm font-medium text-sage-700 transition-colors hover:bg-sage-50"
          >
            Bekijk alle accommodaties
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
