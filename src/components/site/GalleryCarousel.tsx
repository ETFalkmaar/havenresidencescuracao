"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Lightbox } from "./Lightbox";

export function GalleryCarousel({
  title,
  slug,
  photos,
  isComingSoon = false,
  availableFrom = null,
  viewLabel,
  availabilityLabel,
  comingSoonLabel,
}: {
  title: string;
  slug: string;
  photos: string[];
  isComingSoon?: boolean;
  availableFrom?: string | null;
  viewLabel: string;
  availabilityLabel: string;
  comingSoonLabel?: string;
}) {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  if (photos.length === 0) return null;

  function prev() {
    setIndex((i) => (i - 1 + photos.length) % photos.length);
  }
  function next() {
    setIndex((i) => (i + 1) % photos.length);
  }

  return (
    <div className="space-y-4">
      {/* Header row: residence name + CTAs (or coming-soon badge) */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <h3 className="font-display font-semibold text-2xl text-ink">{title}</h3>
        {isComingSoon ? (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-ink text-white text-[11px] tracking-[0.25em] uppercase font-semibold">
            {comingSoonLabel ?? "Coming soon"}
            {availableFrom
              ? ` · ${new Date(availableFrom).toLocaleDateString(undefined, {
                  month: "short",
                  year: "numeric",
                })}`
              : ""}
          </span>
        ) : (
          <div className="flex gap-2 flex-wrap">
            <Link
              href={`/${slug}`}
              className="group inline-flex items-center gap-2 pl-1.5 pr-4 py-1.5 rounded-full bg-ink text-white text-[13px] font-medium hover:bg-ink-soft transition shadow-pill"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
                <svg
                  className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
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
              {viewLabel}
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center px-4 py-2 rounded-full bg-paper-warm hover:bg-paper-tint text-ink text-[13px] font-medium transition border border-black/5"
            >
              {availabilityLabel}
            </Link>
          </div>
        )}
      </div>

      {/* Image stage — click to open lightbox */}
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        aria-label={`Open ${title} photos full screen`}
        className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden bg-paper-warm shadow-pill group block"
      >
        <Image
          key={photos[index]}
          src={photos[index]!}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-[700ms] group-hover:scale-[1.02]"
        />
        {/* Hover hint: expand icon */}
        <span className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white opacity-0 group-hover:opacity-100 transition">
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
        </span>

        {photos.length > 1 && (
          <>
            {/* Prev */}
            <span
              role="button"
              tabIndex={0}
              aria-label="Previous image"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  prev();
                }
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-ink/85 hover:bg-ink text-white transition opacity-0 group-hover:opacity-100 cursor-pointer"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </span>
            {/* Next */}
            <span
              role="button"
              tabIndex={0}
              aria-label="Next image"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  next();
                }
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-ink/85 hover:bg-ink text-white transition opacity-0 group-hover:opacity-100 cursor-pointer"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </span>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {photos.map((_, i) => (
                <span
                  key={i}
                  role="button"
                  tabIndex={0}
                  aria-label={`Show image ${i + 1}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIndex(i);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      setIndex(i);
                    }
                  }}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    i === index ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </button>

      <Lightbox
        open={lightboxOpen}
        images={photos}
        index={index}
        title={title}
        onClose={() => setLightboxOpen(false)}
        onIndexChange={setIndex}
      />
    </div>
  );
}
