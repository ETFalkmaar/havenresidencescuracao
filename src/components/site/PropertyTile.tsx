"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { formatEur } from "@/lib/format";

export type PropertyTileData = {
  slug: string;
  name: string;
  city: string;
  bedrooms: number | null;
  bathrooms: number | null;
  max_guests: number | null;
  rating: number | null;
  rating_count: number | null;
  hero_image_url: string | null;
  from_price_eur: number | null;
  status: "active" | "coming_soon" | "draft" | "archived";
  available_from: string | null;
};

export function PropertyTile({
  property,
  locale,
  t,
}: {
  property: PropertyTileData;
  locale: string;
  t: {
    bedrooms: string;
    baths: string;
    guests: string;
    nightLabel: string;
    comingSoon: string;
    pricingSoon: string;
  };
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [4, -4]), {
    stiffness: 250,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-4, 4]), {
    stiffness: 250,
    damping: 22,
  });

  const isComingSoon = property.status === "coming_soon";

  function onMouseMove(e: React.MouseEvent<HTMLAnchorElement | HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const Inner = (
    <motion.div
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="will-change-transform"
    >
      <div className="rounded-3xl overflow-hidden bg-paper-warm aspect-[4/5] relative shadow-pill group">
        {property.hero_image_url ? (
          <Image
            src={property.hero_image_url}
            alt={property.name}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            className={`object-cover transition-transform duration-[800ms] ${
              isComingSoon ? "" : "group-hover:scale-[1.05]"
            }`}
          />
        ) : null}
        {/* Top-left rating chip */}
        {property.rating && (
          <div className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 text-ink text-[12px] font-medium shadow-sm">
            <svg className="h-3 w-3 text-brand-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01z" />
            </svg>
            {property.rating.toFixed(1)}
            {property.rating_count ? (
              <span className="text-ink-mute">
                ({property.rating_count.toLocaleString()})
              </span>
            ) : null}
          </div>
        )}
        {isComingSoon && (
          <div className="absolute top-3 right-3 inline-flex items-center px-2.5 py-1 rounded-full bg-ink text-white text-[11px] tracking-widest uppercase">
            {t.comingSoon}
          </div>
        )}
      </div>

      <div className="pt-4">
        <h3 className="font-display font-semibold text-ink text-[17px] leading-tight">
          {property.name}
        </h3>
        <p className="text-ink-mute text-[13px] mt-1 leading-snug">
          {[
            property.max_guests ? `${property.max_guests} ${t.guests}` : null,
            property.bedrooms ? `${property.bedrooms} ${t.bedrooms}` : null,
            property.bathrooms ? `${property.bathrooms} ${t.baths}` : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <div className="mt-3 flex items-baseline gap-2">
          {property.from_price_eur !== null && !isComingSoon ? (
            <>
              <span className="font-display font-semibold text-ink text-[17px]">
                {formatEur(property.from_price_eur, locale)}
              </span>
              <span className="text-ink-mute text-[13px]">/ {t.nightLabel}</span>
            </>
          ) : (
            <span className="text-ink-mute text-[13px]">{t.pricingSoon}</span>
          )}
        </div>
      </div>
    </motion.div>
  );

  if (isComingSoon) {
    return <div className="block">{Inner}</div>;
  }
  return (
    <Link href={`/${property.slug}`} className="block">
      {Inner}
    </Link>
  );
}
