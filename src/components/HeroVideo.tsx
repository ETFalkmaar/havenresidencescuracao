"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import type { Translations } from "@/lib/i18n/translations";

export function HeroVideo({
  videoUrl,
  posterUrl,
  brandName,
  tagline,
  t,
}: {
  videoUrl: string | null;
  posterUrl: string | null;
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

  return (
    <section
      ref={ref}
      className="relative h-[65vh] min-h-[420px] md:h-[85vh] md:min-h-[640px] w-full overflow-hidden bg-neutral-950"
    >
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={{ y: yMedia, scale: scaleMedia }}
      >
        {videoUrl ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={posterUrl ?? undefined}
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : posterUrl ? (
          <Image
            src={posterUrl}
            alt={brandName}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/80" />
      </motion.div>

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
        >
          {brandName}
        </motion.h1>
        {tagline && (
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 md:mt-6 text-sm md:text-lg text-white/90 max-w-2xl font-light"
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
