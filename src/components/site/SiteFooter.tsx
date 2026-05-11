import Link from "next/link";
import type { Lang } from "@/lib/i18n/translations";

type Settings = {
  brand_name: string;
  brand_tagline: string | null;
  brand_tagline_nl: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  contact_email: string | null;
  whatsapp_number: string | null;
};

export function SiteFooter({
  settings,
  lang,
}: {
  settings: Settings | null;
  lang: Lang;
}) {
  const year = new Date().getFullYear();
  const brand = settings?.brand_name ?? "Haven Residence";
  const tagline =
    (lang === "nl" ? settings?.brand_tagline_nl : settings?.brand_tagline) ??
    settings?.brand_tagline ??
    null;

  const links = [
    { href: "/about", label: lang === "nl" ? "Over ons" : "About" },
    { href: "/gallery", label: lang === "nl" ? "Galerij" : "Gallery" },
    { href: "/reviews", label: lang === "nl" ? "Reviews" : "Reviews" },
    { href: "/property", label: lang === "nl" ? "Residenties" : "Property" },
    { href: "/contact", label: lang === "nl" ? "Contact" : "Contact us" },
  ];

  return (
    <footer className="bg-paper-tint border-t border-black/5 mt-24">
      <div className="max-w-6xl mx-auto px-6 py-14 grid md:grid-cols-3 gap-10">
        <div>
          <Link href="/" className="flex items-center gap-2 group w-fit">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white text-sm font-semibold">
              {brand.charAt(0).toUpperCase()}
            </span>
            <span className="font-display font-bold text-ink text-xl tracking-tight lowercase">
              {brand}
            </span>
          </Link>
          {tagline && (
            <p className="mt-4 text-sm text-ink-mute leading-relaxed max-w-sm">
              {tagline}
            </p>
          )}
        </div>

        <nav className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-ink-mute hover:text-ink transition"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="text-sm space-y-3">
          {settings?.contact_email && (
            <a
              href={`mailto:${settings.contact_email}`}
              className="block text-ink-mute hover:text-ink transition"
            >
              {settings.contact_email}
            </a>
          )}
          {settings?.whatsapp_number && (
            <a
              href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, "")}`}
              className="block text-ink-mute hover:text-ink transition"
            >
              WhatsApp · {settings.whatsapp_number}
            </a>
          )}
          <div className="flex gap-3 pt-2">
            {settings?.instagram_url && (
              <a
                href={settings.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white border border-black/5 text-ink-mute hover:text-ink hover:shadow-pill transition"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            )}
            {settings?.tiktok_url && (
              <a
                href={settings.tiktok_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white border border-black/5 text-ink-mute hover:text-ink hover:shadow-pill transition"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.62a8.16 8.16 0 0 0 4.77 1.5v-3.4a4.85 4.85 0 0 1-1.84-.03Z" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-black/5">
        <div className="max-w-6xl mx-auto px-6 py-5 text-xs text-ink-mute flex flex-col md:flex-row md:justify-between gap-3 flex-wrap">
          <p>
            © {year} {brand}. {lang === "nl" ? "Alle rechten voorbehouden." : "All rights reserved."}
          </p>
          <nav className="flex flex-wrap gap-4">
            <Link href="/privacy" className="hover:text-ink transition">
              {lang === "nl" ? "Privacybeleid" : "Privacy policy"}
            </Link>
            <Link href="/cookies" className="hover:text-ink transition">
              {lang === "nl" ? "Cookiebeleid" : "Cookie policy"}
            </Link>
            <span>Curaçao</span>
          </nav>
        </div>
      </div>
    </footer>
  );
}
