'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { PropertyData, Room } from '@/lib/properties';

/** Eén foto met de context van de ruimte waar hij bij hoort. */
type GalleryItem = {
  src: string;
  alt: string;
  roomLabel: string;
  roomAmenities: string[];
};

function RoomBlock({
  room,
  startIndex,
  onOpen,
}: {
  room: Room;
  startIndex: number;
  onOpen: (index: number) => void;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="font-serif text-2xl text-forest-dark">{room.label}</h3>
        {room.amenities.length > 0 ? (
          <span className="text-xs uppercase tracking-widest text-sage-600">
            {room.amenities.length}{' '}
            {room.amenities.length === 1 ? 'voorziening' : 'voorzieningen'}
          </span>
        ) : null}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {room.photos.map((photo, i) => (
          <button
            key={photo.src}
            type="button"
            onClick={() => onOpen(startIndex + i)}
            aria-label={`Vergroot foto: ${photo.alt}`}
            className={`group relative aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-xl bg-sage-50 ${
              i === 0 && room.photos.length > 3
                ? 'lg:col-span-2 lg:row-span-2 lg:aspect-square'
                : ''
            }`}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-forest-dark/0 transition-colors duration-300 group-hover:bg-forest-dark/15" />
          </button>
        ))}
      </div>
      {room.amenities.length > 0 ? (
        <Card className="mt-5 p-5">
          <div className="flex flex-wrap gap-2">
            {room.amenities.map((amenity) => (
              <span
                key={amenity}
                className="rounded-full bg-sage-50 px-3 py-1 text-xs text-sage-800"
              >
                {amenity}
              </span>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}

function Lightbox({
  items,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  items: GalleryItem[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const item = items[index];
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/95"
      role="dialog"
      aria-modal="true"
      aria-label={`${item.roomLabel}, foto ${index + 1} van ${items.length}`}
    >
      {/* Bovenbalk: teller + sluiten */}
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-sm tabular-nums text-white/70">
          {index + 1} / {items.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Sluiten"
          className="rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-6 w-6" strokeWidth={1.5} />
        </button>
      </div>

      {/* Foto + navigatiepijlen */}
      <div className="relative flex-1 overflow-hidden">
        <Image
          src={item.src}
          alt={item.alt}
          fill
          sizes="100vw"
          className="object-contain"
          priority
        />
        <button
          type="button"
          onClick={onPrev}
          aria-label="Vorige foto"
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition hover:bg-white/25"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          onClick={onNext}
          aria-label="Volgende foto"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition hover:bg-white/25"
        >
          <ChevronRight className="h-6 w-6" strokeWidth={1.5} />
        </button>
      </div>

      {/* Onderschrift: ruimte + voorzieningen */}
      <div className="px-6 py-6 text-center">
        <p className="font-serif text-2xl text-white">{item.roomLabel}</p>
        {item.roomAmenities.length > 0 ? (
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-white/65">
            {item.roomAmenities.join(' · ')}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function PropertyGallery({ property }: { property: PropertyData }) {
  // Alle foto's plat, met de ruimte-context erbij.
  const items: GalleryItem[] = property.rooms.flatMap((room) =>
    room.photos.map((photo) => ({
      src: photo.src,
      alt: photo.alt,
      roomLabel: room.label,
      roomAmenities: room.amenities,
    })),
  );

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);
  const prev = useCallback(
    () =>
      setActiveIndex((i) =>
        i === null ? null : (i - 1 + items.length) % items.length,
      ),
    [items.length],
  );
  const next = useCallback(
    () => setActiveIndex((i) => (i === null ? null : (i + 1) % items.length)),
    [items.length],
  );

  useEffect(() => {
    if (activeIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    }
    window.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [activeIndex, close, prev, next]);

  // Begin-index van elke ruimte in de platte lijst.
  const roomStart: number[] = [];
  let acc = 0;
  for (const room of property.rooms) {
    roomStart.push(acc);
    acc += room.photos.length;
  }

  return (
    <>
      <div className="space-y-16">
        {property.rooms.map((room, ri) => (
          <RoomBlock
            key={room.slug}
            room={room}
            startIndex={roomStart[ri]}
            onOpen={setActiveIndex}
          />
        ))}
      </div>
      {activeIndex !== null ? (
        <Lightbox
          items={items}
          index={activeIndex}
          onClose={close}
          onPrev={prev}
          onNext={next}
        />
      ) : null}
    </>
  );
}
