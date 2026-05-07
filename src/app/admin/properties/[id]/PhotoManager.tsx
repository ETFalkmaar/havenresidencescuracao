"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  addPhoto,
  deletePhoto,
  movePhoto,
  setHeroPhoto,
} from "./actions";

type Photo = {
  id: string;
  url: string;
  alt_text: string | null;
  position: number;
  is_hero: boolean;
};

export function PhotoManager({
  propertyId,
  propertySlug,
  photos,
}: {
  propertyId: string;
  propertySlug: string;
  photos: Photo[];
}) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startMutation] = useTransition();

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);

    const supabase = createClient();
    const errors: string[] = [];

    for (const file of Array.from(files)) {
      try {
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const safeExt = ["jpg", "jpeg", "png", "webp", "avif"].includes(ext)
          ? ext
          : "jpg";
        const path = `properties/${propertySlug}/${crypto.randomUUID()}.${safeExt}`;

        const { error: upErr } = await supabase.storage
          .from("property-media")
          .upload(path, file, {
            contentType: file.type || `image/${safeExt}`,
            upsert: false,
          });

        if (upErr) {
          errors.push(`${file.name}: ${upErr.message}`);
          continue;
        }

        const { data } = supabase.storage
          .from("property-media")
          .getPublicUrl(path);

        const result = await addPhoto({
          propertyId,
          url: data.publicUrl,
          altText: file.name,
        });
        if (!result.ok) errors.push(`${file.name}: ${result.error}`);
      } catch (err) {
        errors.push(
          `${file.name}: ${err instanceof Error ? err.message : "upload failed"}`,
        );
      }
    }

    setUploading(false);
    if (errors.length > 0) setError(errors.join("\n"));
    router.refresh();
  }

  function runAction(promise: Promise<{ ok: boolean; error?: string }>) {
    startMutation(async () => {
      const result = await promise;
      if (!result.ok) setError(result.error ?? "Action failed");
      else {
        setError(null);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {photos.length === 0
            ? "No photos yet — upload your first."
            : `${photos.length} photo${photos.length === 1 ? "" : "s"} · drag the arrows to reorder, click ★ to make hero.`}
        </p>
        <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium cursor-pointer hover:opacity-90 transition">
          <span>{uploading ? "Uploading…" : "Upload photos"}</span>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif"
            disabled={uploading}
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
        </label>
      </div>

      {error && (
        <pre className="text-xs text-red-600 dark:text-red-400 whitespace-pre-wrap">
          {error}
        </pre>
      )}

      {photos.length > 0 && (
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((p, idx) => (
            <li
              key={p.id}
              className="relative aspect-square rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-800 group"
            >
              <Image
                src={p.url}
                alt={p.alt_text ?? ""}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover"
              />

              {p.is_hero && (
                <span className="absolute top-2 left-2 text-[10px] uppercase tracking-widest bg-amber-400 text-neutral-900 px-2 py-1 rounded">
                  Hero
                </span>
              )}

              <div className="absolute inset-x-0 bottom-0 p-2 flex items-center justify-between gap-1 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition">
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={idx === 0 || uploading}
                    title="Move up"
                    onClick={() =>
                      runAction(
                        movePhoto({ photoId: p.id, propertyId, direction: "up" }),
                      )
                    }
                    className="w-7 h-7 rounded bg-white/90 text-neutral-900 text-xs disabled:opacity-30 hover:bg-white"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    disabled={idx === photos.length - 1 || uploading}
                    title="Move down"
                    onClick={() =>
                      runAction(
                        movePhoto({
                          photoId: p.id,
                          propertyId,
                          direction: "down",
                        }),
                      )
                    }
                    className="w-7 h-7 rounded bg-white/90 text-neutral-900 text-xs disabled:opacity-30 hover:bg-white"
                  >
                    →
                  </button>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={p.is_hero || uploading}
                    title="Set as hero"
                    onClick={() =>
                      runAction(setHeroPhoto({ photoId: p.id, propertyId }))
                    }
                    className="w-7 h-7 rounded bg-white/90 text-neutral-900 text-xs disabled:opacity-30 hover:bg-white"
                  >
                    ★
                  </button>
                  <button
                    type="button"
                    disabled={uploading}
                    title="Delete"
                    onClick={() => {
                      if (confirm("Delete this photo? This cannot be undone."))
                        runAction(
                          deletePhoto({ photoId: p.id, propertyId }),
                        );
                    }}
                    className="w-7 h-7 rounded bg-red-500 text-white text-xs hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
