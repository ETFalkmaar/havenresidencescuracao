"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Full-bleed photo slideshow used as the hero on every residence detail
 * page (/[slug]). All property photos stack on top of each other; the
 * active one is opacity:1 and the rest 0, with a 1.4s crossfade. The
 * active slide advances every 5 seconds.
 */
const SLIDE_INTERVAL_MS = 5000;

export function PropertyHeroSlideshow({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [images.length]);

  if (images.length === 0) return null;

  return (
    <>
      {images.map((src, i) => (
        <motion.div
          key={src}
          initial={false}
          animate={{ opacity: i === index ? 1 : 0 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
          aria-hidden={i !== index}
        >
          <Image
            src={src}
            alt={alt}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
      ))}

      {/* Slide indicators (only when there's more than one) */}
      {images.length > 1 && (
        <div className="absolute top-[110px] md:top-[120px] left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show photo ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-8 bg-white" : "w-3 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </>
  );
}
