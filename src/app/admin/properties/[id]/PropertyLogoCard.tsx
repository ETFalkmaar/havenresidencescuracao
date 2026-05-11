"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { setPropertyLogo } from "./actions";

/**
 * Per-property logo (e.g. the green olive-tree logo for Green Haven).
 * Appears at the top of the residence detail hero and on the property
 * tile if no fallback is in place.
 */
export function PropertyLogoCard({
  propertyId,
  propertySlug,
  currentUrl,
}: {
  propertyId: string;
  propertySlug: string;
  currentUrl: string | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function onPick(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    const file = files[0]!;
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const safeExt = ["png", "jpg", "jpeg", "webp", "svg"].includes(ext)
        ? ext
        : "png";
      const supabase = createClient();
      const path = `properties/${propertySlug}/logo-${Date.now()}.${safeExt}`;
      const { error: upErr } = await supabase.storage
        .from("property-media")
        .upload(path, file, {
          contentType: file.type || `image/${safeExt}`,
          upsert: false,
        });
      if (upErr) {
        setError(upErr.message);
        return;
      }
      const { data } = supabase.storage.from("property-media").getPublicUrl(path);
      start(async () => {
        const result = await setPropertyLogo({
          propertyId,
          url: data.publicUrl,
        });
        if (!result.ok) setError(result.error);
        else router.refresh();
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "upload failed");
    } finally {
      setUploading(false);
    }
  }

  function remove() {
    if (!confirm("Remove this residence's logo?")) return;
    start(async () => {
      const result = await setPropertyLogo({ propertyId, url: null });
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-neutral-500 mb-3">
        Logo
      </p>
      <div className="flex items-center gap-5 flex-wrap">
        <div className="relative h-28 w-28 rounded-2xl bg-neutral-100 border border-black/5 overflow-hidden grid place-items-center">
          {currentUrl ? (
            <Image
              src={currentUrl}
              alt="Residence logo"
              fill
              sizes="112px"
              className="object-contain p-2"
            />
          ) : (
            <span className="text-[10px] tracking-widest uppercase text-neutral-400">
              No logo
            </span>
          )}
        </div>
        <div className="space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
            onChange={(e) => onPick(e.target.files)}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={pending || uploading}
            className="inline-flex items-center px-4 py-2 rounded-full bg-neutral-900 text-white text-[13px] font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {uploading
              ? "Uploading…"
              : currentUrl
                ? "Replace logo"
                : "Upload logo"}
          </button>
          {currentUrl && (
            <button
              type="button"
              onClick={remove}
              disabled={pending || uploading}
              className="ml-3 text-[12px] text-neutral-500 hover:text-rose-600 transition disabled:opacity-50"
            >
              Remove
            </button>
          )}
          <p className="text-[11px] text-neutral-500 max-w-xs">
            PNG with transparent background works best (square or near-square).
          </p>
          {error && <p className="text-[11px] text-rose-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
