"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { type ReactNode } from "react";
import { formatEur } from "@/lib/format";
import type { Translations } from "@/lib/i18n/translations";

type PropertyCardData = {
  slug: string;
  name: string;
  tagline: string | null;
  short_description: string | null;
  city: string;
  status: "active" | "coming_soon" | "draft" | "archived";
  color_hex: string | null;
  hero_image_url: string | null;
  available_from: string | null;
  from_price_eur: number | null;
};

function CardInner({ children }: { children: ReactNode }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), {
    stiffness: 200,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), {
    stiffness: 200,
    damping: 20,
  });

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="will-change-transform"
    >
      {children}
    </motion.div>
  );
}

function CardBody({
  property,
  isComingSoon,
  accent,
  t,
  locale,
}: {
  property: PropertyCardData;
  isComingSoon: boolean;
  accent: string;
  t: Translations["card"];
  locale: string;
}) {
  return (
    <div
      className="relative aspect-[4/5] w-full"
      style={{ transform: "translateZ(0)" }}
    >
      {property.hero_image_url && (
        <Image
          src={property.hero_image_url}
          alt={property.name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className={`object-cover transition-transform duration-[900ms] ${
            isComingSoon ? "" : "group-hover:scale-[1.06]"
          }`}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

      {isComingSoon && (
        <div className="absolute top-5 left-5">
          <span
            className="text-[11px] tracking-widest uppercase px-3 py-1.5 rounded-full text-white shadow-lg"
            style={{ backgroundColor: accent }}
          >
            {t.comingSoon}
            {property.available_from
              ? ` · ${new Date(property.available_from).toLocaleString(locale, {
                  month: "long",
                  year: "numeric",
                })}`
              : ""}
          </span>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-7 lg:p-9 text-white">
        <div
          className="h-0.5 w-10 mb-5 transition-all duration-700 group-hover:w-24"
          style={{ backgroundColor: accent }}
        />
        <h3 className="text-2xl lg:text-3xl font-light mb-1">{property.name}</h3>
        <p className="text-sm text-white/70 mb-3 tracking-wide">
          {property.city}, Curaçao
        </p>
        {property.tagline && (
          <p className="text-sm text-white/90 mb-5 max-w-md leading-relaxed">
            {property.tagline}
          </p>
        )}
        <div className="flex items-center justify-between">
          {property.from_price_eur !== null && !isComingSoon ? (
            <span className="text-sm">
              <span className="text-white/55">{t.from} </span>
              <span className="font-medium">
                {formatEur(property.from_price_eur, locale)}
              </span>
              <span className="text-white/55"> {t.perNight}</span>
            </span>
          ) : (
            <span className="text-sm text-white/55">
              {isComingSoon ? t.pricingSoon : ""}
            </span>
          )}
          {!isComingSoon && (
            <span className="text-xs uppercase tracking-[0.25em] opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition">
              {t.discover} →
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function AnimatedPropertyCard({
  property,
  t,
  locale,
}: {
  property: PropertyCardData;
  t: Translations["card"];
  locale: string;
}) {
  const isComingSoon = property.status === "coming_soon";
  const accent = property.color_hex ?? "#1E5FBF";

  if (isComingSoon) {
    return (
      <CardInner>
        <div className="group relative overflow-hidden rounded-2xl bg-neutral-200 dark:bg-neutral-900 cursor-default shadow-xl">
          <CardBody
            property={property}
            isComingSoon
            accent={accent}
            t={t}
            locale={locale}
          />
        </div>
      </CardInner>
    );
  }

  return (
    <CardInner>
      <Link
        href={`/${property.slug}`}
        className="group block relative overflow-hidden rounded-2xl bg-neutral-200 dark:bg-neutral-900 shadow-xl hover:shadow-2xl transition-shadow duration-500"
      >
        <CardBody
          property={property}
          isComingSoon={false}
          accent={accent}
          t={t}
          locale={locale}
        />
      </Link>
    </CardInner>
  );
}
