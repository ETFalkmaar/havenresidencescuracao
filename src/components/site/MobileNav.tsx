'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { siteConfig } from '@/lib/site-config';

export function MobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Menu openen"
        aria-expanded={open}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full text-forest-dark transition-colors hover:bg-sage-50"
      >
        <Menu className="h-6 w-6" strokeWidth={1.5} />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-cream-100">
          <div className="flex h-20 shrink-0 items-center justify-between border-b border-black/[0.04] px-6">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3"
              aria-label={siteConfig.name}
            >
              <Image
                src="/branding/haven-mark.png"
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 shrink-0 object-contain"
              />
              <span className="font-serif text-lg font-medium tracking-wide text-forest-dark">
                {siteConfig.name}
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Menu sluiten"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-forest-dark transition-colors hover:bg-sage-50"
            >
              <X className="h-6 w-6" strokeWidth={1.5} />
            </button>
          </div>

          <nav
            aria-label="Hoofdnavigatie"
            className="flex flex-1 flex-col overflow-y-auto px-6 pt-2"
          >
            {siteConfig.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-black/[0.06] py-4 font-serif text-2xl text-forest-dark transition-colors hover:text-sage-700"
              >
                {item.label}
              </Link>
            ))}
            <ButtonLink
              href={siteConfig.reserveCta.href}
              onClick={() => setOpen(false)}
              className="mt-8 w-full"
            >
              {siteConfig.reserveCta.label}
            </ButtonLink>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
