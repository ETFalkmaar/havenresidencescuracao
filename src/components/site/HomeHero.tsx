"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const SLIDE_INTERVAL_MS = 6000;

export function HomeHero({
  images,
  eyebrow,
  title,
  subtitle,
  primaryCta,
  primaryHref,
  secondaryCta,
  secondaryHref,
}: {
  images: string[];
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryCta: string;
  primaryHref: string;
  secondaryCta: string;
  secondaryHref: string;
}) {
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const yMedia = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const scaleMedia = useTransform(scrollYProgress, [0, 1], [1, 1.06]);
  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);
  const opacityText = useTransform(scrollYProgress, [0, 0.7], [1, 0.3]);

  useEffect(() => {
    if (images.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <section ref={ref} className="relative -mt-[88px] pt-[88px] overflow-hidden">
      {/* Background photo with soft fade-to-paper at the bottom */}
      <motion.div
        className="absolute inset-0 -z-10"
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
                alt=""
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover"
              />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-paper/0 via-paper/30 to-paper" />
        <div className="absolute inset-0 bg-gradient-to-r from-paper/30 via-transparent to-paper/30" />
      </motion.div>

      <motion.div
        style={{ y: yText, opacity: opacityText }}
        className="relative max-w-6xl mx-auto px-6 pt-24 pb-32 md:pt-36 md:pb-44 lg:pt-44 lg:pb-56"
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2 mb-8 text-[12px] tracking-wide text-ink-mute"
        >
          <span aria-hidden className="text-ink-mute/70">⌬</span>
          {eyebrow}
          <span aria-hidden className="text-ink-mute/70">⌬</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="font-display font-bold text-ink text-5xl md:text-7xl lg:text-[7.5rem] leading-[0.95] tracking-tight max-w-4xl"
          data-edit-id="home.hero.title"
          data-edit-prop="text"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 text-ink-mute text-[16px] md:text-[18px] max-w-md leading-relaxed"
          data-edit-id="home.hero.subtitle"
          data-edit-prop="text"
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="mt-9 flex flex-wrap gap-3"
        >
          <Link
            href={primaryHref}
            className="group inline-flex items-center gap-2.5 pl-2 pr-6 py-2 rounded-full bg-ink text-white text-[15px] font-medium hover:bg-ink-soft transition shadow-pill"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
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
            {primaryCta}
          </Link>

          <Link
            href={secondaryHref}
            className="inline-flex items-center px-6 py-3 rounded-full bg-paper-warm hover:bg-paper-tint text-ink text-[15px] font-medium transition border border-black/5"
          >
            {secondaryCta}
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
