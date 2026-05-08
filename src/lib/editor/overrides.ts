// Server-only loader for editor overrides.
//
// Public pages call `loadPublishedOverlay()`; the editor preview
// calls `loadDraftOverlay()`. Both return a flat OverlayMap that
// callers index by `target_key`/`prop` to pull overrides.

import { createClient } from "@/lib/supabase/server";
import type {
  OverlayMap,
  OverlayMode,
  SiteEdit,
  SiteUltraConfig,
} from "./types";

type LoadResult = {
  overlay: OverlayMap;
  customCss: string | null;
  customJs: string | null;
  headHtml: string | null;
};

export async function loadOverlay(mode: OverlayMode): Promise<LoadResult> {
  const supabase = await createClient();

  const [editsRes, ultraRes] = await Promise.all([
    supabase.from("site_edits").select("target_key, prop, draft_value, published_value"),
    supabase
      .from("site_ultra_config")
      .select(
        "custom_css_draft, custom_css_published, custom_js_draft, custom_js_published, head_html_draft, head_html_published",
      )
      .eq("id", 1)
      .maybeSingle(),
  ]);

  const overlay: OverlayMap = {};
  const rows = (editsRes.data ?? []) as Pick<
    SiteEdit,
    "target_key" | "prop" | "draft_value" | "published_value"
  >[];
  for (const row of rows) {
    const value = mode === "draft" ? row.draft_value : row.published_value;
    if (value === null || value === undefined) continue;
    overlay[row.target_key] ??= {};
    overlay[row.target_key][row.prop] = value;
  }

  const ultra = ultraRes.data as SiteUltraConfig | null;
  return {
    overlay,
    customCss:
      mode === "draft"
        ? ultra?.custom_css_draft ?? ultra?.custom_css_published ?? null
        : ultra?.custom_css_published ?? null,
    customJs:
      mode === "draft"
        ? ultra?.custom_js_draft ?? ultra?.custom_js_published ?? null
        : ultra?.custom_js_published ?? null,
    headHtml:
      mode === "draft"
        ? ultra?.head_html_draft ?? ultra?.head_html_published ?? null
        : ultra?.head_html_published ?? null,
  };
}

/**
 * Convenience helper for the public site — loads published overlays.
 * Always returns a result; on error falls back to empty (so a database
 * hiccup never breaks the site).
 */
export async function loadPublishedOverlay(): Promise<LoadResult> {
  try {
    return await loadOverlay("published");
  } catch {
    return { overlay: {}, customCss: null, customJs: null, headHtml: null };
  }
}

/**
 * Read a string override at `target_key.prop`, returning `fallback`
 * if no override exists.
 */
export function pickText(
  overlay: OverlayMap,
  target_key: string,
  prop: string,
  fallback: string | null | undefined,
): string | null {
  const value = overlay[target_key]?.[prop];
  if (typeof value === "string") return value;
  return fallback ?? null;
}

/**
 * Read a boolean override (used for visibility/hidden).
 */
export function pickBool(
  overlay: OverlayMap,
  target_key: string,
  prop: string,
  fallback: boolean,
): boolean {
  const value = overlay[target_key]?.[prop];
  if (typeof value === "boolean") return value;
  return fallback;
}

/**
 * Read any override (caller asserts the type).
 */
export function pickAny<T = unknown>(
  overlay: OverlayMap,
  target_key: string,
  prop: string,
  fallback: T,
): T {
  const value = overlay[target_key]?.[prop];
  return (value === null || value === undefined ? fallback : value) as T;
}

/** True if the override map has anything for this target. */
export function hasOverride(overlay: OverlayMap, target_key: string): boolean {
  return overlay[target_key] !== undefined;
}
