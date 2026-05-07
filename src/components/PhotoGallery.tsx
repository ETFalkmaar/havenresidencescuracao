"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

type Photo = {
  id: string;
  url: string;
  alt_text: string | null;
};

export function PhotoGallery({
  photos,
  propertyName,
  accent,
}: {
  photos: Photo[];
  propertyName: string;
  accent: string;
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
      <div className="grid md:grid-cols-3 gap-3">
        {photos.map((photo, i) => (
          <motion.button
            key={photo.id}
            type="button"
            onClick={() => setActiveIndex(i)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.7,
              delay: i * 0.06,
              ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{ scale: 1.015 }}
            className="relative aspect-[4/3] rounded-xl overflow-hidden bg-neutral-200 dark:bg-neutral-900 group cursor-zoom-in will-change-transform"
          >
            <Image
              src={photo.url}
              alt={photo.alt_text ?? propertyName}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition" />
          </motion.button>
        ))}
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
                alt={photos[activeIndex].alt_text ?? propertyName}
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
                  {photos[activeIndex].alt_text}
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
