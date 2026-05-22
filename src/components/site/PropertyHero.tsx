import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import type { PropertyData } from '@/lib/properties';

export function PropertyHero({ property }: { property: PropertyData }) {
  return (
    <section className="relative h-[65vh] min-h-[480px] w-full overflow-hidden">
      <Image
        src={property.heroPhoto.src}
        alt={property.heroPhoto.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/20 to-black/65" />
      <div className="absolute inset-0 flex items-end pb-16">
        <Container>
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-widest text-white/85">
              {property.location}
            </p>
            <h1 className="mt-3 font-serif text-4xl font-light leading-tight text-white sm:text-6xl lg:text-7xl">
              {property.name}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
              {property.shortDescription}
            </p>
          </div>
        </Container>
      </div>
    </section>
  );
}
