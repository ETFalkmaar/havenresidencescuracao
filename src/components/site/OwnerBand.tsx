import Image from 'next/image';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { siteConfig } from '@/lib/site-config';

export function OwnerBand() {
  const { ownerBand } = siteConfig;
  return (
    <section className="bg-cream-200/40 py-14 sm:py-20">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-widest text-sage-600">
              {ownerBand.eyebrow}
            </p>
            <h2 className="mt-3 font-serif text-4xl font-light text-forest-dark">
              {ownerBand.title}
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-forest-dark/75">
              {ownerBand.description}
            </p>
            <ButtonLink href={ownerBand.cta.href} variant="ghost" className="mt-8">
              {ownerBand.cta.label}
            </ButtonLink>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
            <Image
              src={ownerBand.image.src}
              alt={ownerBand.image.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
