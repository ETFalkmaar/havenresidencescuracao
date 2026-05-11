"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export type Slide = {
  url: string;
  propertyName: string;
  propertySlug: string;
  city: string | null;
  isComingSoon: boolean;
};

const SLIDE_INTERVAL_MS = 5000;

export function PropertyShowcase({
  slides,
  ctaLabel,
  comingSoonLabel,
}: {
  slides: Slide[];
  ctaLabel: string;
  comingSoonLabel: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [slides.length]);

  if (slides.length === 0) return null;
  const current = slides[index]!;

  return (
    <section className="relative max-w-6xl mx-auto px-6 mt-6 md:mt-10">
      <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden bg-paper-warm shadow-soft">
        <AnimatePresence mode="sync">
          <motion.div
            key={current.url + index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={current.url}
              alt={current.propertyName}
              fill
              priority={index === 0}
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Bottom gradient so caption is always readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent pointer-events-none" />

        {/* Caption + CTA */}
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-10 flex items-end justify-between gap-4 flex-wrap">
          <div className="text-white">
            <p className="text-[11px] md:text-[12px] tracking-[0.3em] uppercase text-white/75 mb-2">
              {current.city ? `${current.city} · Curaçao` : "Curaçao"}
            </p>
            <h2 className="font-display font-bold text-2xl md:text-4xl leading-tight">
              {current.propertyName}
            </h2>
          </div>

          <Link
            href={`/${current.propertySlug}`}
            className="group inline-flex items-center gap-2.5 pl-2 pr-5 py-2 rounded-full bg-white text-ink text-[14px] font-medium hover:bg-paper-warm transition shadow-pill"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white">
              <svg
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
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
            {current.isComingSoon ? comingSoonLabel : ctaLabel}
          </Link>
        </div>

        {/* Slide indicators */}
        {slides.length > 1 && (
          <div className="absolute top-5 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Show slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-8 bg-white" : "w-3 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
