import Link from 'next/link';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { siteConfig } from '@/lib/site-config';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/[0.04] bg-cream-100/80 backdrop-blur">
      <Container>
        <div className="flex h-20 items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3" aria-label={siteConfig.name}>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-600 font-serif text-sm font-medium tracking-wider text-white">
              {siteConfig.monogram}
            </span>
            <span className="hidden font-serif text-xl font-medium tracking-wide text-forest-dark sm:inline">
              {siteConfig.name}
            </span>
          </Link>

          <nav aria-label="Hoofdnavigatie" className="hidden lg:block">
            <ul className="flex items-center gap-8 text-sm text-forest-dark">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-sage-700"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <ButtonLink href={siteConfig.reserveCta.href}>
            {siteConfig.reserveCta.label}
          </ButtonLink>
        </div>
      </Container>
    </header>
  );
}
