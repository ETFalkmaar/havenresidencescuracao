"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { setBrandLogo } from "./actions";

/**
 * Brand-wide logo: appears on the homepage hero and (small) in the
 * header pill. Used everywhere `Haven Residences` shows as a name.
 */
export function BrandLogoCard({ currentUrl }: { currentUrl: string | null }) {
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
      const path = `branding/brand-logo-${Date.now()}.${safeExt}`;
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
        const result = await setBrandLogo(data.publicUrl);
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
    if (!confirm("Remove the brand logo?")) return;
    start(async () => {
      const result = await setBrandLogo(null);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <section className="rounded-3xl bg-white border border-black/5 shadow-pill p-6 md:p-8">
      <h2 className="font-display font-semibold text-2xl text-ink">
        Brand logo
      </h2>
      <p className="text-sm text-ink-mute mt-1 max-w-xl">
        Shown on the homepage hero and in the header pill. Use the
        Blue Haven Residences logo if it is the main one for the brand.
        Square or near-square PNG with a transparent background works best.
      </p>

      <div className="mt-6 flex items-center gap-6 flex-wrap">
        <div className="relative h-32 w-32 rounded-2xl bg-paper-warm border border-black/5 overflow-hidden grid place-items-center">
          {currentUrl ? (
            <Image
              src={currentUrl}
              alt="Brand logo"
              fill
              sizes="128px"
              className="object-contain p-2"
            />
          ) : (
            <span className="text-[11px] tracking-widest uppercase text-ink-mute">
              No logo
            </span>
          )}
        </div>
        <div className="space-y-3">
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
            className="inline-flex items-center px-5 py-2.5 rounded-full bg-ink text-white text-[13px] font-medium hover:bg-ink-soft transition disabled:opacity-50"
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
              className="ml-3 text-[13px] text-ink-mute hover:text-rose-600 transition disabled:opacity-50"
            >
              Remove
            </button>
          )}
          {error && (
            <p className="text-xs text-rose-600 mt-2 max-w-xs">{error}</p>
          )}
        </div>
      </div>
    </section>
  );
}
