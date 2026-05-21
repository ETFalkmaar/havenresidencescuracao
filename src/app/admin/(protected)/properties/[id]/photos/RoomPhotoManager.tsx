'use client';

import Image from 'next/image';
import { useRef, useState, useTransition } from 'react';
import { Trash2, Upload } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { addPhotoRow, deletePhoto } from './actions';

export type RoomWithPhotos = {
  id: string;
  slug: string;
  label: string;
  photos: Array<{
    id: string;
    src: string;
    alt: string;
    display_order: number;
  }>;
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function getStoragePathFromSrc(src: string): string | null {
  // Match Supabase public storage URL pattern, extract path after bucket.
  const match = src.match(/\/storage\/v1\/object\/public\/property-media\/(.+)$/);
  return match ? match[1] : null;
}

export function RoomPhotoManager({
  room,
  propertyName,
  propertySlug,
}: {
  room: RoomWithPhotos;
  propertyName: string;
  propertySlug: string;
}) {
  const [photos, setPhotos] = useState(room.photos);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    setError(null);
    setUploading(true);
    const supabase = createClient();
    const altDefault = `${propertyName}, ${room.label.toLowerCase()}`;

    try {
      for (const file of files) {
        const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
        const baseName = slugify(file.name.replace(/\.[^.]+$/, ''));
        const path = `${room.slug}/${Date.now()}-${baseName}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('property-media')
          .upload(path, file, {
            cacheControl: '31536000',
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from('property-media').getPublicUrl(path);

        const result = await addPhotoRow(room.id, publicUrl, altDefault, propertySlug);
        if ('error' in result) {
          throw new Error(result.error);
        }

        setPhotos((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            src: publicUrl,
            alt: altDefault,
            display_order: prev.length,
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Upload mislukt.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleDelete(photoId: string, src: string) {
    if (!confirm('Foto verwijderen?')) return;
    const storagePath = getStoragePathFromSrc(src);
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    startTransition(async () => {
      const result = await deletePhoto(photoId, storagePath, propertySlug);
      if ('error' in result) {
        setError(result.error);
      }
    });
  }

  return (
    <section className="border-b border-black/[0.06] pb-10 last:border-b-0">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-serif text-2xl text-forest-dark">{room.label}</h2>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-sage-600 px-4 py-2 text-xs font-medium text-sage-700 transition-colors hover:bg-sage-50">
          <Upload className="h-3.5 w-3.5" strokeWidth={1.5} />
          {uploading ? 'Uploaden…' : 'Foto toevoegen'}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            disabled={uploading}
            onChange={handleUpload}
            className="hidden"
          />
        </label>
      </div>

      {error ? (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {photos.length === 0 ? (
          <p className="col-span-full text-sm text-forest-dark/60">
            Nog geen foto&apos;s in deze ruimte.
          </p>
        ) : (
          photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-cream-200"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => handleDelete(photo.id, photo.src)}
                disabled={pending}
                className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-700 opacity-0 transition-opacity hover:bg-white group-hover:opacity-100"
                aria-label="Verwijder foto"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
