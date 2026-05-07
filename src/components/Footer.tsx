import Link from "next/link";

type Settings = {
  brand_name: string;
  brand_tagline: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  contact_email: string | null;
  whatsapp_number: string | null;
};

export function Footer({ settings }: { settings: Settings | null }) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-neutral-950 text-neutral-300 mt-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 grid md:grid-cols-3 gap-12">
        <div>
          <h3 className="text-white text-xl font-light mb-3">
            {settings?.brand_name ?? "Haven Residence"}
          </h3>
          {settings?.brand_tagline && (
            <p className="text-sm text-neutral-400 leading-relaxed">
              {settings.brand_tagline}
            </p>
          )}
        </div>

        <div>
          <h4 className="text-white text-xs font-semibold uppercase tracking-widest mb-4">
            Explore
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/#residences" className="hover:text-white transition">
                Residences
              </Link>
            </li>
            <li>
              <Link href="/#about" className="hover:text-white transition">
                About
              </Link>
            </li>
            <li>
              <Link href="/#contact" className="hover:text-white transition">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-xs font-semibold uppercase tracking-widest mb-4">
            Get in touch
          </h4>
          <ul className="space-y-2 text-sm">
            {settings?.contact_email && (
              <li>
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="hover:text-white transition"
                >
                  {settings.contact_email}
                </a>
              </li>
            )}
            {settings?.whatsapp_number && (
              <li>
                <a
                  href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, "")}`}
                  className="hover:text-white transition"
                >
                  WhatsApp
                </a>
              </li>
            )}
            <li className="flex gap-4 pt-2">
              {settings?.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  Instagram
                </a>
              )}
              {settings?.tiktok_url && (
                <a
                  href={settings.tiktok_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  TikTok
                </a>
              )}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6 text-xs text-neutral-500 flex flex-col md:flex-row md:justify-between gap-2">
          <p>© {year} {settings?.brand_name ?? "Haven Residence"}. All rights reserved.</p>
          <p>Curaçao</p>
        </div>
      </div>
    </footer>
  );
}
