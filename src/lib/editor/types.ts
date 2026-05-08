// Editor / overlay types — shared between SSR loader, public-site overlay,
// and admin editor.

export type EditorChangeType =
  | "text"
  | "image"
  | "color"
  | "layout"
  | "visibility"
  | "css"
  | "js"
  | "head"
  | "restore"
  | "publish"
  | "discard"
  | "mixed";

export type SiteEdit = {
  target_key: string;
  prop: string;
  draft_value: unknown;
  published_value: unknown;
  draft_updated_at: string;
  draft_updated_by: string | null;
  published_at: string | null;
  published_by: string | null;
};

export type SiteVersion = {
  id: string;
  label: string | null;
  description: string;
  change_type: EditorChangeType;
  snapshot: { edits: { target_key: string; prop: string; value: unknown }[] };
  custom_css: string | null;
  custom_js: string | null;
  head_html: string | null;
  thumbnail_url: string | null;
  is_pinned: boolean;
  notes: string | null;
  created_at: string;
  created_by: string | null;
  created_by_email?: string | null;
};

export type SiteActionLogRow = {
  id: string;
  target_key: string | null;
  prop: string | null;
  action: string;
  change_type: EditorChangeType;
  description: string;
  old_value: unknown;
  new_value: unknown;
  version_id: string | null;
  performed_at: string;
  performed_by: string | null;
  performed_by_email: string | null;
};

export type SiteUltraConfig = {
  custom_css_draft: string | null;
  custom_css_published: string | null;
  custom_js_draft: string | null;
  custom_js_published: string | null;
  head_html_draft: string | null;
  head_html_published: string | null;
  ab_tests: unknown[];
  templates: unknown[];
};

// In-memory map: target_key -> { prop -> value }
export type OverlayMap = Record<string, Record<string, unknown>>;

export type OverlayMode = "published" | "draft";

// What kind of property is the editor editing? Used to pick the right UI control.
export type EditableKind =
  | "text"            // single-line or paragraph text
  | "richText"        // future: HTML
  | "imageUrl"        // image URL (with upload)
  | "color"           // hex color
  | "boolean"         // visibility, etc.
  | "fontFamily"
  | "fontSize"
  | "spacing"
  | "url";

export type EditableElement = {
  // unique key in the catalog
  key: string;          // e.g. "home.hero.tagline"
  kind: EditableKind;
  label: string;        // human-readable for the editor sidebar
  description?: string;
};
