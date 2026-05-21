import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { siteConfig } from '@/lib/site-config';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://havenresidencescuracao.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: siteConfig.name,
    template: `%s · ${siteConfig.name}`,
  },
  description: 'Boutique vakantieverhuur op Curaçao',
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: 'Boutique vakantieverhuur op Curaçao',
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: 'Boutique vakantieverhuur op Curaçao',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="bg-cream-100 font-sans text-forest-dark antialiased">
        {children}
      </body>
    </html>
  );
}
