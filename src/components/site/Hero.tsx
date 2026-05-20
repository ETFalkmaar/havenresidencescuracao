import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { siteConfig } from '@/lib/site-config';
import { HeroCarousel } from './HeroCarousel';

export function Hero() {
  const { hero } = siteConfig;

  return (
    <section className="relative h-[85vh] min-h-[600px] w-full overflow-hidden">
      <HeroCarousel images={hero.images} intervalMs={hero.intervalMs} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/60" />
      <div className="absolute inset-0 flex items-end pb-28">
        <Container>
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-widest text-white/85">
              {hero.eyebrow}
            </p>
            <h1 className="mt-3 font-serif text-5xl font-light leading-tight text-white sm:text-6xl lg:text-7xl">
              {hero.title}
            </h1>
            <p className="mt-4 max-w-md font-serif text-xl text-white/95 sm:text-2xl">
              {hero.subtitle}
            </p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/85">
              {hero.description}
            </p>
            <ButtonLink href={hero.cta.href} className="mt-8">
              {hero.cta.label}
            </ButtonLink>
          </div>
        </Container>
      </div>
    </section>
  );
}
