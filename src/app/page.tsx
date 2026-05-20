import { Hero } from '@/components/site/Hero';
import { OwnerBand } from '@/components/site/OwnerBand';
import { PropertyGrid } from '@/components/site/PropertyGrid';
import { USPGrid } from '@/components/site/USPGrid';

export default function HomePage() {
  return (
    <>
      <Hero />
      <USPGrid />
      <PropertyGrid />
      <OwnerBand />
    </>
  );
}
