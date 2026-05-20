import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { blueBayParadise } from '@/lib/properties/blue-bay-paradise';
import { PropertyCard } from './PropertyCard';

const PROPERTIES = [blueBayParadise];

export function PropertyGrid() {
  return (
    <section className="py-20">
      <Container>
        <SectionHeading
          eyebrow="Onze accommodaties"
          title="Ontdek jouw perfecte verblijf"
        />
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {PROPERTIES.map((property) => (
            <PropertyCard
              key={property.slug}
              property={property}
              pillLabel="Blue Bay"
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
