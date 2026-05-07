import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://havenresidencescuracao.vercel.app",
  ),
  title: {
    default: "Haven Residence — Premium stays on Curaçao",
    template: "%s · Haven Residence",
  },
  description:
    "A curated collection of vacation and long-term residences on the island of Curaçao. Book directly for the best rates and personal service.",
  openGraph: {
    title: "Haven Residence — Premium stays on Curaçao",
    description:
      "A curated collection of vacation and long-term residences on the island of Curaçao.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
