'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { MobileNav } from '@/components/site/MobileNav';
import { siteConfig } from '@/lib/site-config';

export function SiteHeader() {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      if (Math.abs(y - lastY.current) < 6) return;
      // Verbergen tijdens neerwaarts scrollen voorbij de balkhoogte,
      // direct terugbrengen bij opwaarts scrollen.
      setHidden(y > lastY.current && y > 96);
      lastY.current = y;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b border-black/[0.04] bg-cream-100/80 backdrop-blur transition-transform duration-300 ${
        hidden ? '-translate-y-full lg:translate-y-0' : 'translate-y-0'
      }`}
    >
      <Container>
        <div className="flex h-20 items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3" aria-label={siteConfig.name}>
            <Image
              src="/branding/haven-mark.png"
              alt=""
              width={48}
              height={48}
              priority
              className="h-12 w-12 shrink-0 object-contain"
            />
            <span className="whitespace-nowrap font-serif text-lg font-medium tracking-wide text-forest-dark sm:text-xl">
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

          <div className="flex items-center gap-1 sm:gap-2">
            <ButtonLink
              href={siteConfig.reserveCta.href}
              className="hidden lg:inline-flex"
            >
              {siteConfig.reserveCta.label}
            </ButtonLink>
            <MobileNav />
          </div>
        </div>
      </Container>
    </header>
  );
}
