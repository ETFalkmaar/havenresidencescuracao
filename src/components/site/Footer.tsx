import Link from 'next/link';
import { Facebook, Instagram, Mail, MapPin, Phone, type LucideIcon } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { HavenMark } from '@/components/site/HavenMark';
import { siteConfig } from '@/lib/site-config';

type SocialLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

function buildSocialLinks(): SocialLink[] {
  const links: SocialLink[] = [];
  if (siteConfig.social.instagram) {
    links.push({ href: siteConfig.social.instagram, label: 'Instagram', icon: Instagram });
  }
  if (siteConfig.social.facebook) {
    links.push({ href: siteConfig.social.facebook, label: 'Facebook', icon: Facebook });
  }
  if (siteConfig.contact.email) {
    links.push({ href: `mailto:${siteConfig.contact.email}`, label: 'Email', icon: Mail });
  }
  return links;
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  const socials = buildSocialLinks();
  const hasContact =
    siteConfig.contact.phone || siteConfig.contact.email || siteConfig.contact.address;

  return (
    <footer className="bg-forest-dark text-cream-100">
      <Container>
        <div className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <HavenMark className="h-12 w-12 shrink-0 text-cream-100" />
              <span className="font-serif text-xl">{siteConfig.name}</span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-cream-100/70">
              {siteConfig.tagline}
            </p>
            {socials.length > 0 ? (
              <div className="mt-6 flex gap-4">
                {socials.map(({ href, label, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noreferrer' : undefined}
                    className="text-cream-100/70 transition-colors hover:text-cream-100"
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-widest text-cream-100/60">
              Navigatie
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-cream-100/80 transition-colors hover:text-cream-100"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-widest text-cream-100/60">
              Beheer
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-cream-100/80">
              <li>
                <Link href="/beheer" className="transition-colors hover:text-cream-100">
                  Onze diensten
                </Link>
              </li>
              <li>
                <Link
                  href="/beheer#eigenaren"
                  className="transition-colors hover:text-cream-100"
                >
                  Voor eigenaren
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-cream-100">
                  Contact beheer
                </Link>
              </li>
            </ul>
          </div>

          {hasContact ? (
            <div>
              <h3 className="text-xs uppercase tracking-widest text-cream-100/60">
                Contact
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-cream-100/80">
                {siteConfig.contact.phone ? (
                  <li className="flex items-start gap-2">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
                    <a
                      href={`tel:${siteConfig.contact.phone.replace(/\s/g, '')}`}
                      className="transition-colors hover:text-cream-100"
                    >
                      {siteConfig.contact.phone}
                    </a>
                  </li>
                ) : null}
                {siteConfig.contact.email ? (
                  <li className="flex items-start gap-2">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
                    <a
                      href={`mailto:${siteConfig.contact.email}`}
                      className="transition-colors hover:text-cream-100"
                    >
                      {siteConfig.contact.email}
                    </a>
                  </li>
                ) : null}
                {siteConfig.contact.address ? (
                  <li className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
                    <span>{siteConfig.contact.address}</span>
                  </li>
                ) : null}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 border-t border-cream-100/10 py-6 text-xs text-cream-100/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.legal.companyName || siteConfig.name}. Alle rechten
            voorbehouden.
          </p>
          <ul className="flex gap-6">
            <li>
              <Link href="/privacy" className="transition-colors hover:text-cream-100">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/voorwaarden" className="transition-colors hover:text-cream-100">
                Algemene voorwaarden
              </Link>
            </li>
            <li>
              <Link href="/cookies" className="transition-colors hover:text-cream-100">
                Cookies
              </Link>
            </li>
          </ul>
        </div>
      </Container>
    </footer>
  );
}
