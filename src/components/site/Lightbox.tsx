"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect } from "react";

/**
 * Full-screen image viewer. Supports:
 *   - prev / next via on-screen arrows OR arrow keys
 *   - close via the X button, click on the backdrop, or Esc
 *   - swipe (drag) on touch / mobile
 *   - locks page scroll while open
 */
export function Lightbox({
  open,
  images,
  index,
  title,
  onClose,
  onIndexChange,
}: {
  open: boolean;
  images: string[];
  index: number;
  title?: string;
  onClose: () => void;
  onIndexChange: (next: number) => void;
}) {
  const total = images.length;
  const safeIndex = ((index % total) + total) % total;

  const prev = useCallback(() => {
    onIndexChange((index - 1 + total) % total);
  }, [index, total, onIndexChange]);

  const next = useCallback(() => {
    onIndexChange((index + 1) % total);
  }, [index, total, onIndexChange]);

  // Lock body scroll + global key bindings while open.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, prev, next, onClose]);

  if (!open || total === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="lightbox-root"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label={title ?? "Photo viewer"}
        onClick={(e) => {
          // Click on backdrop closes; click on image / controls doesn't.
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between gap-4 px-4 md:px-8 py-4 text-white">
          <div className="text-sm md:text-base">
            {title && (
              <span className="font-display font-semibold mr-3">{title}</span>
            )}
            <span className="text-white/60">
              {safeIndex + 1} / {total}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 backdrop-blur transition"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 6L18 18M6 18L18 6" />
            </svg>
          </button>
        </div>

        {/* Image stage */}
        <motion.div
          key={images[safeIndex]}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.25}
          onDragEnd={(_, info) => {
            if (info.offset.x > 80) prev();
            else if (info.offset.x < -80) next();
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="relative w-full h-full flex items-center justify-center px-4 md:px-16"
        >
          <div className="relative w-full max-w-6xl aspect-[4/3] md:aspect-[3/2]">
            <Image
              src={images[safeIndex]!}
              alt={title ? `${title} — photo ${safeIndex + 1}` : `Photo ${safeIndex + 1}`}
              fill
              sizes="100vw"
              priority
              className="object-contain select-none"
              draggable={false}
            />
          </div>
        </motion.div>

        {/* Prev / next */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous photo"
              className="absolute top-1/2 -translate-y-1/2 left-3 md:left-6 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white backdrop-blur transition"
            >
              <svg
                className="h-6 w-6"
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
            <button
              type="button"
              onClick={next}
              aria-label="Next photo"
              className="absolute top-1/2 -translate-y-1/2 right-3 md:right-6 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white backdrop-blur transition"
            >
              <svg
                className="h-6 w-6"
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
          </>
        )}

        {/* Bottom dots */}
        {total > 1 && total <= 12 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Show photo ${i + 1}`}
                onClick={() => onIndexChange(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === safeIndex ? "w-7 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
