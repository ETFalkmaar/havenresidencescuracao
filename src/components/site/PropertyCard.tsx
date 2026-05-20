import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Bath, Bed, Users } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { IconStat } from '@/components/ui/IconStat';
import { Pill } from '@/components/ui/Pill';
import type { PropertyData } from '@/lib/properties/blue-bay-paradise';

export function PropertyCard({
  property,
  pillLabel,
}: {
  property: PropertyData;
  pillLabel?: string;
}) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] w-full">
        <Image
          src={property.heroPhoto.src}
          alt={property.heroPhoto.alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
        {pillLabel ? (
          <div className="absolute left-4 top-4">
            <Pill>{pillLabel}</Pill>
          </div>
        ) : null}
      </div>
      <div className="p-6">
        <h3 className="font-serif text-2xl text-forest-dark">
          {property.name}
        </h3>
        <p className="text-sm text-forest-dark/60">{property.location}</p>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          <IconStat icon={Users} label={`${property.stay.maxGuests} gasten`} />
          <IconStat
            icon={Bed}
            label={`${property.stay.bedrooms} slaapkamers`}
          />
          <IconStat
            icon={Bath}
            label={`${property.stay.bathrooms} badkamer${property.stay.bathrooms === 1 ? '' : 's'}`}
          />
        </div>
        <Link
          href={`/${property.slug}`}
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-sage-700 transition-colors hover:text-sage-800"
        >
          Bekijk details
          <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
        </Link>
      </div>
    </Card>
  );
}
