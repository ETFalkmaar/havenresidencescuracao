"use client";

// Cycling photo hero. No video — every 5 seconds the next image fades in.
// Falls back to the single posterUrl if only one image is provided.

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Translations } from "@/lib/i18n/translations";

const SLIDE_INTERVAL_MS = 5000;

export function HeroSlideshow({
  images,
  brandName,
  tagline,
  t,
}: {
  images: string[]; // ordered, hero photo first
  brandName: string;
  tagline: string | null;
  t: Translations["hero"];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const yMedia = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const opacityText = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const scaleMedia = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <section
      ref={ref}
      className="relative h-[65vh] min-h-[420px] md:h-[85vh] md:min-h-[640px] w-full overflow-hidden bg-neutral-950"
    >
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={{ y: yMedia, scale: scaleMedia }}
      >
        <AnimatePresence>
          {images[index] && (
            <motion.div
              key={images[index]}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <Image
                src={images[index]}
                alt={brandName}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover"
              />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/80" />
      </motion.div>

      {/* Slide indicator dots */}
      {images.length > 1 && (
        <div className="absolute bottom-5 right-5 md:bottom-8 md:right-10 z-10 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-8 bg-white" : "w-4 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}

      <motion.div
        style={{ y: yText, opacity: opacityText }}
        className="relative h-full max-w-7xl mx-auto px-6 lg:px-10 flex flex-col justify-end pb-12 md:pb-20 lg:pb-28 text-white"
      >
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-[11px] md:text-xs lg:text-sm uppercase tracking-[0.4em] text-white/85 mb-3 md:mb-5"
        >
          {t.since}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl md:text-6xl lg:text-7xl xl:text-[7rem] font-extralight leading-[1.05] tracking-tight max-w-5xl"
          data-edit-id="home.hero.brandName"
          data-edit-prop="text"
        >
          {brandName}
        </motion.h1>
        {tagline && (
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 md:mt-6 text-sm md:text-lg text-white/90 max-w-2xl font-light"
            data-edit-id="home.hero.tagline.live"
            data-edit-prop="text"
          >
            {tagline}
          </motion.p>
        )}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 md:mt-10 flex gap-3 flex-wrap"
        >
          <a
            href="#residences"
            className="group inline-flex items-center gap-2 px-6 py-3 md:px-7 md:py-3.5 bg-white text-neutral-900 rounded-full text-xs md:text-sm font-medium tracking-wide hover:bg-white/95 transition shadow-2xl"
          >
            {t.explore}
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </a>
          <a
            href="#contact"
            className="px-6 py-3 md:px-7 md:py-3.5 border border-white/40 backdrop-blur-sm rounded-full text-xs md:text-sm font-medium tracking-wide hover:bg-white/10 transition"
          >
            {t.getInTouch}
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
