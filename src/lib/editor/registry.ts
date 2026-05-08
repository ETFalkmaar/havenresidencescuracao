// Catalog of every editable target on the site.
//
// Used by the admin editor sidebar to render a "structured" view of edits
// (in addition to clicking elements directly in the iframe). Adding a new
// editable element to the page = add an entry here AND mark the element with
// `data-edit-id` / `data-edit-prop` in the JSX.

import type { EditableElement } from "./types";

export const EDITABLE_REGISTRY: EditableElement[] = [
  // ---------- Site-wide (theme & brand) ----------
  { key: "site.theme.primary", kind: "color", label: "Primary color", description: "Used for accents and CTAs." },
  { key: "site.theme.accent", kind: "color", label: "Accent color" },
  { key: "site.theme.fontHeading", kind: "fontFamily", label: "Heading font" },
  { key: "site.theme.fontBody", kind: "fontFamily", label: "Body font" },

  // ---------- Header ----------
  { key: "site.header", kind: "boolean", label: "Show header" },

  // ---------- Footer ----------
  { key: "site.footer", kind: "boolean", label: "Show footer" },

  // ---------- Home: hero ----------
  { key: "home.hero.tagline", kind: "text", label: "Hero tagline (EN)" },
  { key: "home.hero.tagline_nl", kind: "text", label: "Hero tagline (NL)" },
  { key: "home.hero.brandName", kind: "text", label: "Hero brand name" },
  { key: "home.hero.cta", kind: "text", label: "Hero CTA label (EN)" },
  { key: "home.hero.cta_nl", kind: "text", label: "Hero CTA label (NL)" },
  { key: "home.hero", kind: "boolean", label: "Show hero" },

  // ---------- Home: residences section ----------
  { key: "home.residences", kind: "boolean", label: "Show residences section" },
  { key: "home.residences.eyebrow", kind: "text", label: "Residences eyebrow (EN)" },
  { key: "home.residences.eyebrow_nl", kind: "text", label: "Residences eyebrow (NL)" },
  { key: "home.residences.title", kind: "text", label: "Residences title (EN)" },
  { key: "home.residences.title_nl", kind: "text", label: "Residences title (NL)" },

  // ---------- Home: about ----------
  { key: "home.about", kind: "boolean", label: "Show about section" },
  { key: "home.about.eyebrow", kind: "text", label: "About eyebrow (EN)" },
  { key: "home.about.eyebrow_nl", kind: "text", label: "About eyebrow (NL)" },
  { key: "home.about.title", kind: "text", label: "About title (EN)" },
  { key: "home.about.title_nl", kind: "text", label: "About title (NL)" },
  { key: "home.about.body", kind: "text", label: "About body (EN)" },
  { key: "home.about.body_nl", kind: "text", label: "About body (NL)" },
  { key: "home.about.body2", kind: "text", label: "About body 2 (EN)" },
  { key: "home.about.body2_nl", kind: "text", label: "About body 2 (NL)" },

  // ---------- Home: contact ----------
  { key: "home.contact", kind: "boolean", label: "Show contact section" },
  { key: "home.contact.eyebrow", kind: "text", label: "Contact eyebrow (EN)" },
  { key: "home.contact.eyebrow_nl", kind: "text", label: "Contact eyebrow (NL)" },
  { key: "home.contact.title", kind: "text", label: "Contact title (EN)" },
  { key: "home.contact.title_nl", kind: "text", label: "Contact title (NL)" },
  { key: "home.contact.subtitle", kind: "text", label: "Contact subtitle (EN)" },
  { key: "home.contact.subtitle_nl", kind: "text", label: "Contact subtitle (NL)" },
];

// Lookup table for fast access.
export const REGISTRY_BY_KEY: Record<string, EditableElement> =
  Object.fromEntries(EDITABLE_REGISTRY.map((e) => [e.key, e]));

// `prop:<id>.*` and `unit:<id>.*` are dynamically registered (see registerProp).
export function inferKind(prop: string): EditableElement["kind"] {
  if (prop === "hidden") return "boolean";
  if (prop === "imageUrl" || prop === "hero_image_url") return "imageUrl";
  if (prop === "color" || prop === "color_hex" || prop.startsWith("theme.")) return "color";
  if (prop === "fontFamily" || prop.endsWith("FontFamily")) return "fontFamily";
  if (prop === "fontSize" || prop.endsWith("FontSize")) return "fontSize";
  if (prop === "url" || prop.endsWith("Url")) return "url";
  return "text";
}

// Allowed change_type values for editor_save_draft.
export type RegistryChangeType =
  | "text"
  | "image"
  | "color"
  | "layout"
  | "visibility"
  | "css"
  | "js"
  | "head"
  | "mixed";

export function changeTypeFor(kind: EditableElement["kind"]): RegistryChangeType {
  switch (kind) {
    case "text":
    case "richText":
    case "url":
      return "text";
    case "imageUrl":
      return "image";
    case "color":
      return "color";
    case "boolean":
      return "visibility";
    case "fontFamily":
    case "fontSize":
    case "spacing":
      return "layout";
  }
}
