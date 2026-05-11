"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Tilt3D } from "./Tilt3D";

type Photo = {
  id: string;
  url: string;
  alt_text: string | null;
};

/**
 * Translate an English alt_text caption to Dutch on the fly so we don't
 * need a second alt_text_nl column. Falls back to the original string when
 * no mapping is found — captions are short and predictable.
 */
function translateCaption(caption: string | null, lang: "en" | "nl"): string {
  if (!caption) return "";
  if (lang === "en") return caption;
  const map: Record<string, string> = {
    "Private pool": "Privézwembad",
    "Pool with tropical entrance": "Zwembad met tropische entree",
    "Pool deck with outdoor dining": "Zwembaddek met buiten eten",
    "Pool with view and loungers": "Zwembad met uitzicht en ligstoelen",
    "Pool and wood terrace": "Zwembad en houten terras",
    "Pool — exterior view": "Zwembad — buitenaanzicht",
    "Lounge by the pool": "Loungehoek bij het zwembad",
    "Living & dining room": "Woon- en eetkamer",
    "Living & dining — wide angle": "Woon- en eetkamer — wijd zicht",
    "Living room with Smart TV": "Woonkamer met Smart TV",
    "Living room — terrace view": "Woonkamer — uitzicht op terras",
    "Living room — pool view": "Woonkamer — uitzicht op zwembad",
    "Kitchen with breakfast bar": "Keuken met ontbijtbar",
    "Bedroom 1": "Slaapkamer 1",
    "Bedroom 1 — wide angle": "Slaapkamer 1 — wijd zicht",
    "Bedroom 1 — art shelf": "Slaapkamer 1 — kunstplank",
    "Bedroom 2": "Slaapkamer 2",
    "Bathroom with double sink": "Badkamer met dubbele wastafel",
    "Terrace with palm and view": "Terras met palm en uitzicht",
    "Sunset terrace with wine": "Zonsondergangterras",
    "Blue Bay Resort — view": "Blue Bay Resort — uitzicht",
    "Blue Bay beach at sunset": "Blue Bay strand bij zonsondergang",
    "Blue Bay beach club": "Blue Bay beach club",
  };
  return map[caption] ?? caption;
}

export function PhotoGallery({
  photos,
  propertyName,
  accent,
  lang = "en",
}: {
  photos: Photo[];
  propertyName: string;
  accent: string;
  lang?: "en" | "nl";
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (activeIndex === null) return;
      if (e.key === "Escape") setActiveIndex(null);
      if (e.key === "ArrowRight")
        setActiveIndex((i) => (i === null ? null : (i + 1) % photos.length));
      if (e.key === "ArrowLeft")
        setActiveIndex((i) =>
          i === null ? null : (i - 1 + photos.length) % photos.length,
        );
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, photos.length]);

  if (photos.length === 0) return null;

  return (
    <>
      <div
        className="grid md:grid-cols-3 gap-x-3 gap-y-6"
        style={{ perspective: 1200 }}
      >
        {photos.map((photo, i) => {
          const caption = translateCaption(photo.alt_text, lang);
          return (
            <motion.figure
              key={photo.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.7,
                delay: i * 0.06,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex flex-col"
            >
              <Tilt3D intensity={5}>
                <button
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-neutral-200 dark:bg-neutral-900 group cursor-zoom-in will-change-transform shadow-lg hover:shadow-2xl transition-shadow duration-500"
                  style={{ transform: "translateZ(0)" }}
                  aria-label={caption || propertyName}
                >
                  <Image
                    src={photo.url}
                    alt={caption || propertyName}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition" />
                </button>
              </Tilt3D>
              {caption && (
                <figcaption className="mt-2.5 px-1 text-[13px] text-neutral-700 dark:text-neutral-300 font-medium tracking-tight">
                  {caption}
                </figcaption>
              )}
            </motion.figure>
          );
        })}
      </div>

      <AnimatePresence>
        {activeIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setActiveIndex(null)}
          >
            <button
              type="button"
              onClick={() => setActiveIndex(null)}
              className="absolute top-5 right-5 text-white/80 hover:text-white text-2xl leading-none w-10 h-10 rounded-full hover:bg-white/10 transition"
              aria-label="Close gallery"
            >
              ✕
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex(
                  (i) => (i! - 1 + photos.length) % photos.length,
                );
              }}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-3xl w-12 h-12 rounded-full hover:bg-white/10 transition"
              aria-label="Previous"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex((i) => (i! + 1) % photos.length);
              }}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-3xl w-12 h-12 rounded-full hover:bg-white/10 transition"
              aria-label="Next"
            >
              ›
            </button>

            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full h-full max-w-6xl max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={photos[activeIndex].url}
                alt={
                  translateCaption(photos[activeIndex].alt_text, lang) ||
                  propertyName
                }
                fill
                priority
                sizes="100vw"
                className="object-contain"
              />
              {photos[activeIndex].alt_text && (
                <p
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/80 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full"
                  style={{ borderColor: accent }}
                >
                  {translateCaption(photos[activeIndex].alt_text, lang)}
                </p>
              )}
            </motion.div>

            <p className="absolute bottom-5 right-5 text-xs text-white/60 tracking-widest uppercase">
              {activeIndex + 1} / {photos.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
