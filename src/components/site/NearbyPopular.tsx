"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export type NearbySpot = {
  name: string;
  blurb: string;
  /** Google Maps search URL — opens in a new tab. */
  mapsUrl: string;
  /** Optional external website (skipped when null). */
  websiteUrl: string | null;
  /** Small emoji shown left of the name. */
  emoji: string;
};

export type NearbyRegion = {
  id: string;
  /** Header shown on the tab. */
  label: string;
  /** Headline shown above the cards once the tab is active. */
  title: string;
  /** Subtitle / area description. */
  blurb: string;
  spots: NearbySpot[];
};

export function NearbyPopular({
  eyebrow,
  heading,
  intro,
  viewMapLabel,
  visitWebsiteLabel,
  regions,
}: {
  eyebrow: string;
  heading: string;
  intro: string;
  viewMapLabel: string;
  visitWebsiteLabel: string;
  regions: NearbyRegion[];
}) {
  const [activeId, setActiveId] = useState<string>(regions[0]?.id ?? "");
  const activeIndex = Math.max(
    0,
    regions.findIndex((r) => r.id === activeId),
  );
  const active = regions[activeIndex] ?? regions[0];

  function go(delta: number) {
    const next = (activeIndex + delta + regions.length) % regions.length;
    setActiveId(regions[next]!.id);
  }

  if (!active) return null;

  return (
    <section className="bg-ink text-white">
      <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-[12px] tracking-[0.3em] uppercase text-white/55 mb-4">
            {eyebrow}
          </p>
          <h2 className="font-display font-bold text-4xl md:text-5xl leading-tight tracking-tight">
            {heading}
          </h2>
          <p className="mt-4 text-white/70 text-[15px] leading-relaxed">
            {intro}
          </p>
        </div>

        {/* Region tabs — also act as the slider's dots */}
        <div className="mt-12 flex items-center justify-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous region"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          {regions.map((r) => {
            const isActive = r.id === activeId;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setActiveId(r.id)}
                className={`relative px-5 py-2.5 rounded-full text-[14px] font-medium transition ${
                  isActive
                    ? "text-ink"
                    : "text-white/75 hover:text-white"
                }`}
                aria-pressed={isActive}
              >
                {isActive && (
                  <motion.span
                    layoutId="nearby-active-tab"
                    className="absolute inset-0 rounded-full bg-white"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative">{r.label}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next region"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>

        {/* Active region content — crossfade between regions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mt-12"
          >
            <div className="text-center mb-10 max-w-xl mx-auto">
              <h3 className="font-display font-bold text-2xl md:text-3xl">
                {active.title}
              </h3>
              <p className="mt-3 text-white/65 text-sm leading-relaxed">
                {active.blurb}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {active.spots.map((s, i) => (
                <motion.div
                  key={`${active.id}-${i}`}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.05 * i,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="rounded-3xl border border-white/10 bg-white/5 hover:bg-white/[0.08] transition p-6 flex flex-col"
                >
                  <div className="text-3xl mb-3" aria-hidden>
                    {s.emoji}
                  </div>
                  <p className="font-display font-semibold text-lg leading-tight">
                    {s.name}
                  </p>
                  <p className="mt-2 text-sm text-white/70 leading-relaxed flex-1">
                    {s.blurb}
                  </p>
                  <div className="mt-5 flex gap-2 flex-wrap">
                    <a
                      href={s.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-ink text-[12px] font-medium hover:bg-paper-warm transition"
                    >
                      <svg
                        className="h-3.5 w-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {viewMapLabel}
                    </a>
                    {s.websiteUrl && (
                      <a
                        href={s.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-[12px] font-medium transition border border-white/20"
                      >
                        <svg
                          className="h-3.5 w-3.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M10 14a5 5 0 0 0 7.54.54l3-3a5 5 0 1 0-7.07-7.07L11.76 6.18" />
                          <path d="M14 10a5 5 0 0 0-7.54-.54l-3 3a5 5 0 1 0 7.07 7.07l1.71-1.71" />
                        </svg>
                        {visitWebsiteLabel}
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
