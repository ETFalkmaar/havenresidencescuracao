"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export type HeroSlide = {
  url: string;
  propertyName: string;
  propertySlug: string;
  city: string | null;
  isComingSoon: boolean;
};

const SLIDE_INTERVAL_MS = 5000;

export function HomeHero({
  title,
  slides,
  viewLabel,
  comingSoonLabel,
  availabilityLabel,
  availabilityHref,
}: {
  title: string;
  slides: HeroSlide[];
  viewLabel: string;
  comingSoonLabel: string;
  availabilityLabel: string;
  availabilityHref: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [slides.length]);

  const current = slides[index];
  if (!current) return null;

  return (
    <section className="relative -mt-[88px] min-h-[88vh] md:min-h-[100vh] flex items-end overflow-hidden bg-ink">
      {/* All slides stacked; framer-motion fades each one in / out by index. */}
      <div className="absolute inset-0">
        {slides.map((s, i) => (
          <motion.div
            key={s.url}
            initial={false}
            animate={{ opacity: i === index ? 1 : 0 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
            aria-hidden={i !== index}
          >
            <Image
              src={s.url}
              alt={s.propertyName}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
        ))}
      </div>

      {/* Soft dark overlay only at the bottom so the heading stays readable. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

      {/* Slide indicators */}
      {slides.length > 1 && (
        <div className="absolute top-[112px] md:top-[120px] left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index
                  ? "w-8 bg-white"
                  : "w-3 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}

      {/* Foreground content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-16 md:pb-24 lg:pb-32 pt-32 text-white">
        <div
          key={`caption-${index}`}
          className="flex items-center gap-3 flex-wrap mb-5 animate-fadeUp"
        >
          <p className="text-[12px] tracking-[0.3em] uppercase text-white/85">
            {current.city ? `${current.city} · Curaçao` : "Curaçao"}
          </p>
          <span className="text-white/40" aria-hidden>
            ·
          </span>
          <p className="text-[12px] tracking-[0.3em] uppercase text-white/85">
            {current.propertyName}
          </p>
          {current.isComingSoon && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white text-ink text-[10px] tracking-[0.25em] uppercase font-semibold">
              {comingSoonLabel}
            </span>
          )}
        </div>

        <h1
          className="font-display font-bold text-white text-5xl md:text-7xl lg:text-[7.5rem] leading-[0.95] tracking-tight max-w-5xl drop-shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
          data-edit-id="home.hero.title"
          data-edit-prop="text"
        >
          {title}
        </h1>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            href={`/${current.propertySlug}`}
            className="group inline-flex items-center gap-2.5 pl-2 pr-6 py-2 rounded-full bg-white text-ink text-[15px] font-medium hover:bg-paper-warm transition shadow-pill"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-ink text-white">
              <svg
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 12h12M13 6l6 6-6 6" />
              </svg>
            </span>
            {viewLabel}
          </Link>

          <Link
            href={availabilityHref}
            className="inline-flex items-center px-6 py-3 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur text-white text-[15px] font-medium transition border border-white/30"
          >
            {availabilityLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
