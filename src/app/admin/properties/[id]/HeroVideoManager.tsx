"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { setHeroVideo, removeHeroVideo } from "./actions";

export function HeroVideoManager({
  propertyId,
  propertySlug,
  currentUrl,
}: {
  propertyId: string;
  propertySlug: string;
  currentUrl: string | null;
}) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startMutation] = useTransition();

  async function handleFile(file: File | null) {
    if (!file) return;
    setError(null);
    setUploading(true);

    const ext = (file.name.split(".").pop() || "mp4").toLowerCase();
    const safeExt = ["mp4", "webm"].includes(ext) ? ext : "mp4";
    const path = `properties/${propertySlug}/hero-${Date.now()}.${safeExt}`;

    const supabase = createClient();
    try {
      const { error: upErr } = await supabase.storage
        .from("property-media")
        .upload(path, file, {
          contentType: file.type || `video/${safeExt}`,
          upsert: false,
        });
      if (upErr) {
        setError(upErr.message);
        setUploading(false);
        return;
      }

      const { data } = supabase.storage
        .from("property-media")
        .getPublicUrl(path);

      const result = await setHeroVideo({
        propertyId,
        url: data.publicUrl,
      });
      if (!result.ok) setError(result.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      router.refresh();
    }
  }

  function remove() {
    if (
      !confirm(
        "Remove the hero video? The MP4 will be deleted from storage. The hero photo will be used instead until you upload a new video.",
      )
    )
      return;
    setError(null);
    startMutation(async () => {
      const result = await removeHeroVideo({ propertyId });
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-4 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-950">
      <div className="flex items-baseline justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-medium">Hero video</h3>
          <p className="text-xs text-neutral-500 mt-1">
            Optional MP4 / WebM that auto-plays muted on the residence&apos;s hero. Falls back to the hero photo if missing or on slow networks.
          </p>
        </div>
        <label
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium tracking-wide transition cursor-pointer ${
            uploading
              ? "bg-neutral-300 dark:bg-neutral-800 text-neutral-500"
              : "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90"
          }`}
        >
          <span>
            {uploading
              ? "Uploading…"
              : currentUrl
                ? "Replace video"
                : "Upload video"}
          </span>
          <input
            type="file"
            accept="video/mp4,video/webm"
            disabled={uploading}
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            className="hidden"
          />
        </label>
      </div>

      {currentUrl ? (
        <div className="space-y-3">
          <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-900">
            <video
              key={currentUrl}
              src={currentUrl}
              controls
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-xs text-neutral-500 break-all">
              {currentUrl.split("/").pop()}
            </p>
            <button
              type="button"
              onClick={remove}
              disabled={uploading || pending}
              className="text-xs px-3 py-1.5 rounded-md border border-red-300 dark:border-red-900 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition disabled:opacity-50"
            >
              {pending ? "Removing…" : "Remove video"}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-neutral-500 py-4 text-center border border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg">
          No hero video yet. The hero photo will be shown.
        </p>
      )}

      {error && (
        <pre className="text-xs text-red-600 dark:text-red-400 whitespace-pre-wrap">
          {error}
        </pre>
      )}
    </div>
  );
}
