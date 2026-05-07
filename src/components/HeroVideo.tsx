"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

export function HeroVideo({
  videoUrl,
  posterUrl,
  brandName,
  tagline,
}: {
  videoUrl: string | null;
  posterUrl: string | null;
  brandName: string;
  tagline: string | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Parallax: video moves slower than scroll, text drifts up & fades
  const yMedia = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const opacityText = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const scaleMedia = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  return (
    <section
      ref={ref}
      className="relative h-screen min-h-[640px] w-full overflow-hidden bg-neutral-950"
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
        className="relative h-full max-w-7xl mx-auto px-6 lg:px-10 flex flex-col justify-end pb-24 lg:pb-32 text-white"
      >
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-xs lg:text-sm uppercase tracking-[0.4em] text-white/85 mb-5"
        >
          Curaçao · since 2026
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl md:text-7xl lg:text-[7.5rem] font-extralight leading-[1] tracking-tight max-w-5xl"
        >
          {brandName}
        </motion.h1>
        {tagline && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 text-base md:text-xl text-white/90 max-w-2xl font-light"
          >
            {tagline}
          </motion.p>
        )}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 flex gap-3 flex-wrap"
        >
          <a
            href="#residences"
            className="group inline-flex items-center gap-2 px-7 py-3.5 bg-white text-neutral-900 rounded-full text-sm font-medium tracking-wide hover:bg-white/95 transition shadow-2xl"
          >
            Explore residences
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </a>
          <a
            href="#contact"
            className="px-7 py-3.5 border border-white/40 backdrop-blur-sm rounded-full text-sm font-medium tracking-wide hover:bg-white/10 transition"
          >
            Get in touch
          </a>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-white/60 text-[10px] tracking-[0.3em] uppercase"
        >
          <span>Scroll</span>
          <motion.span
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="block w-px h-8 bg-white/40"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
