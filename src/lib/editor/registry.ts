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

  // ---------- Header / footer ----------
  { key: "site.header", kind: "boolean", label: "Show header" },
  { key: "site.footer", kind: "boolean", label: "Show footer" },

  // ---------- Home: hero ----------
  { key: "home.hero", kind: "boolean", label: "Show hero" },
  { key: "home.hero.brandName", kind: "text", label: "Hero brand name" },
  { key: "home.hero.eyebrow", kind: "text", label: "Hero eyebrow (EN)" },
  { key: "home.hero.eyebrow_nl", kind: "text", label: "Hero eyebrow (NL)" },
  { key: "home.hero.title", kind: "text", label: "Hero title (EN)" },
  { key: "home.hero.title_nl", kind: "text", label: "Hero title (NL)" },
  { key: "home.hero.subtitle", kind: "text", label: "Hero subtitle (EN)" },
  { key: "home.hero.subtitle_nl", kind: "text", label: "Hero subtitle (NL)" },
  // legacy keys kept so existing draft edits still resolve
  { key: "home.hero.tagline", kind: "text", label: "Hero tagline (EN, legacy)" },
  { key: "home.hero.tagline_nl", kind: "text", label: "Hero tagline (NL, legacy)" },

  // ---------- Home: residences section ----------
  { key: "home.residences", kind: "boolean", label: "Show residences section" },
  { key: "home.residences.eyebrow", kind: "text", label: "Residences eyebrow (EN)" },
  { key: "home.residences.eyebrow_nl", kind: "text", label: "Residences eyebrow (NL)" },
  { key: "home.residences.title", kind: "text", label: "Residences title (EN)" },
  { key: "home.residences.title_nl", kind: "text", label: "Residences title (NL)" },

  // ---------- Home: trusted-by row ----------
  { key: "home.trusted.caption", kind: "text", label: "Trusted-by caption (EN)" },
  { key: "home.trusted.caption_nl", kind: "text", label: "Trusted-by caption (NL)" },

  // ---------- About page ----------
  { key: "about.title", kind: "text", label: "About title (EN)" },
  { key: "about.title_nl", kind: "text", label: "About title (NL)" },
  { key: "about.body", kind: "text", label: "About body (EN)" },
  { key: "about.body_nl", kind: "text", label: "About body (NL)" },
  { key: "about.stat1.value", kind: "text", label: "About stat 1 — value" },
  { key: "about.stat1.label", kind: "text", label: "About stat 1 — label (EN)" },
  { key: "about.stat1.label_nl", kind: "text", label: "About stat 1 — label (NL)" },
  { key: "about.stat2.value", kind: "text", label: "About stat 2 — value" },
  { key: "about.stat2.label", kind: "text", label: "About stat 2 — label (EN)" },
  { key: "about.stat2.label_nl", kind: "text", label: "About stat 2 — label (NL)" },
  { key: "about.stat3.value", kind: "text", label: "About stat 3 — value" },
  { key: "about.stat3.label", kind: "text", label: "About stat 3 — label (EN)" },
  { key: "about.stat3.label_nl", kind: "text", label: "About stat 3 — label (NL)" },

  // ---------- Gallery page ----------
  { key: "gallery.eyebrow", kind: "text", label: "Gallery eyebrow (EN)" },
  { key: "gallery.eyebrow_nl", kind: "text", label: "Gallery eyebrow (NL)" },
  { key: "gallery.title", kind: "text", label: "Gallery title (EN)" },
  { key: "gallery.title_nl", kind: "text", label: "Gallery title (NL)" },
  { key: "gallery.desc", kind: "text", label: "Gallery description (EN)" },
  { key: "gallery.desc_nl", kind: "text", label: "Gallery description (NL)" },

  // ---------- Reviews page ----------
  { key: "reviews.eyebrow", kind: "text", label: "Reviews eyebrow (EN)" },
  { key: "reviews.eyebrow_nl", kind: "text", label: "Reviews eyebrow (NL)" },
  { key: "reviews.title", kind: "text", label: "Reviews title (EN)" },
  { key: "reviews.title_nl", kind: "text", label: "Reviews title (NL)" },
  { key: "reviews.desc", kind: "text", label: "Reviews description (EN)" },
  { key: "reviews.desc_nl", kind: "text", label: "Reviews description (NL)" },

  // ---------- Property page ----------
  { key: "property.eyebrow", kind: "text", label: "Property eyebrow (EN)" },
  { key: "property.eyebrow_nl", kind: "text", label: "Property eyebrow (NL)" },
  { key: "property.title", kind: "text", label: "Property title (EN)" },
  { key: "property.title_nl", kind: "text", label: "Property title (NL)" },
  { key: "property.desc", kind: "text", label: "Property description (EN)" },
  { key: "property.desc_nl", kind: "text", label: "Property description (NL)" },

  // ---------- Contact page ----------
  { key: "contact.eyebrow", kind: "text", label: "Contact eyebrow (EN)" },
  { key: "contact.eyebrow_nl", kind: "text", label: "Contact eyebrow (NL)" },
  { key: "contact.title", kind: "text", label: "Contact title (EN)" },
  { key: "contact.title_nl", kind: "text", label: "Contact title (NL)" },
  { key: "contact.desc", kind: "text", label: "Contact description (EN)" },
  { key: "contact.desc_nl", kind: "text", label: "Contact description (NL)" },

  // ---------- Legacy home about/contact (kept so old edits still resolve) ----------
  { key: "home.about", kind: "boolean", label: "Show home about (legacy)" },
  { key: "home.about.eyebrow", kind: "text", label: "Home about eyebrow (EN, legacy)" },
  { key: "home.about.eyebrow_nl", kind: "text", label: "Home about eyebrow (NL, legacy)" },
  { key: "home.about.title", kind: "text", label: "Home about title (EN, legacy)" },
  { key: "home.about.title_nl", kind: "text", label: "Home about title (NL, legacy)" },
  { key: "home.about.body", kind: "text", label: "Home about body (EN, legacy)" },
  { key: "home.about.body_nl", kind: "text", label: "Home about body (NL, legacy)" },
  { key: "home.contact", kind: "boolean", label: "Show home contact (legacy)" },
  { key: "home.contact.eyebrow", kind: "text", label: "Home contact eyebrow (EN, legacy)" },
  { key: "home.contact.eyebrow_nl", kind: "text", label: "Home contact eyebrow (NL, legacy)" },
  { key: "home.contact.title", kind: "text", label: "Home contact title (EN, legacy)" },
  { key: "home.contact.title_nl", kind: "text", label: "Home contact title (NL, legacy)" },
  { key: "home.contact.subtitle", kind: "text", label: "Home contact subtitle (EN, legacy)" },
  { key: "home.contact.subtitle_nl", kind: "text", label: "Home contact subtitle (NL, legacy)" },
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
