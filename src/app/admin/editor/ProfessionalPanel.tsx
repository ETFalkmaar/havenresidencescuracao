"use client";

import { useMemo, useState } from "react";
import { EDITABLE_REGISTRY, REGISTRY_BY_KEY, changeTypeFor } from "@/lib/editor/registry";
import type { EditableElement } from "@/lib/editor/types";

type ApplyFn = (
  targetKey: string,
  prop: string,
  value: unknown,
  changeType: "text" | "image" | "color" | "visibility" | "layout",
  description: string,
) => Promise<boolean>;

const FONTS = [
  "Inter",
  "Helvetica Neue",
  "Georgia",
  "Playfair Display",
  "Cormorant Garamond",
  "DM Serif Display",
  "Merriweather",
  "Roboto",
  "Lato",
  "Source Sans Pro",
];

const SECTIONS: { title: string; keys: string[] }[] = [
  {
    title: "Site theme",
    keys: ["site.theme.primary", "site.theme.accent", "site.theme.fontHeading", "site.theme.fontBody"],
  },
  {
    title: "Header & footer",
    keys: ["site.header", "site.footer"],
  },
  {
    title: "Hero",
    keys: [
      "home.hero",
      "home.hero.brandName",
      "home.hero.tagline",
      "home.hero.tagline_nl",
    ],
  },
  {
    title: "Residences section",
    keys: [
      "home.residences",
      "home.residences.eyebrow",
      "home.residences.eyebrow_nl",
      "home.residences.title",
      "home.residences.title_nl",
    ],
  },
  {
    title: "About section",
    keys: [
      "home.about",
      "home.about.eyebrow",
      "home.about.eyebrow_nl",
      "home.about.title",
      "home.about.title_nl",
      "home.about.body",
      "home.about.body_nl",
      "home.about.body2",
      "home.about.body2_nl",
    ],
  },
  {
    title: "Contact section",
    keys: [
      "home.contact",
      "home.contact.eyebrow",
      "home.contact.eyebrow_nl",
      "home.contact.title",
      "home.contact.title_nl",
      "home.contact.subtitle",
      "home.contact.subtitle_nl",
    ],
  },
];

export function ProfessionalPanel({
  selected,
  onApply,
  onClearSelection,
}: {
  selected: { targetKey: string; prop: string } | null;
  onApply: ApplyFn;
  onClearSelection: () => void;
}) {
  const [search, setSearch] = useState("");

  const filteredSections = useMemo(() => {
    if (!search) return SECTIONS;
    const q = search.toLowerCase();
    return SECTIONS.map((s) => ({
      ...s,
      keys: s.keys.filter((k) => {
        const e = REGISTRY_BY_KEY[k];
        return (
          k.toLowerCase().includes(q) ||
          (e?.label ?? "").toLowerCase().includes(q)
        );
      }),
    })).filter((s) => s.keys.length > 0);
  }, [search]);

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-sm font-semibold mb-1">Professional editor</h2>
        <p className="text-xs text-neutral-500">
          Edit text and visibility directly here, or click any element on the
          left preview to use the floating toolbar.
        </p>
      </div>

      {selected ? (
        <SelectedElementPanel
          selected={selected}
          onApply={onApply}
          onClear={onClearSelection}
        />
      ) : null}

      <input
        type="text"
        placeholder="Search editable elements…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full text-xs px-2 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"
      />

      <div className="space-y-5">
        {filteredSections.map((s) => (
          <details key={s.title} open={!!search} className="group">
            <summary className="cursor-pointer text-[11px] uppercase tracking-wider text-neutral-500 select-none">
              {s.title}
            </summary>
            <div className="mt-2 space-y-2">
              {s.keys.map((k) => {
                const e = REGISTRY_BY_KEY[k];
                if (!e) return null;
                return <Field key={k} editable={e} onApply={onApply} />;
              })}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

function SelectedElementPanel({
  selected,
  onApply,
  onClear,
}: {
  selected: { targetKey: string; prop: string };
  onApply: ApplyFn;
  onClear: () => void;
}) {
  const e = REGISTRY_BY_KEY[selected.targetKey];
  return (
    <div className="rounded-md border border-blue-300 bg-blue-50 dark:bg-blue-950/30 p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] uppercase tracking-wider text-blue-600">Selected</span>
        <button onClick={onClear} className="text-[10px] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">×</button>
      </div>
      <div className="text-xs font-medium">{e?.label ?? selected.targetKey}</div>
      <div className="text-[10px] text-neutral-500 mb-2">
        {selected.targetKey} · {selected.prop}
      </div>
      {e ? <Field editable={e} onApply={onApply} /> : null}
    </div>
  );
}

function Field({
  editable,
  onApply,
}: {
  editable: EditableElement;
  onApply: ApplyFn;
}) {
  const [value, setValue] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function commit(prop: string, val: unknown, descSuffix = "") {
    setBusy(true);
    setDone(false);
    const ct = changeTypeFor(editable.kind);
    // Restrict to the change types the editor mutation supports here
    // (CSS / JS / mixed go through the Ultra panel, not this commit path).
    type AllowedCt = "text" | "image" | "color" | "visibility" | "layout";
    const allowed: AllowedCt =
      ct === "text" || ct === "image" || ct === "color" || ct === "visibility" || ct === "layout"
        ? ct
        : "text";
    const ok = await onApply(
      editable.key,
      prop,
      val,
      allowed,
      `${editable.label} ${descSuffix}`.trim(),
    );
    setBusy(false);
    if (ok) {
      setDone(true);
      setTimeout(() => setDone(false), 1200);
    }
  }

  if (editable.kind === "boolean") {
    return (
      <div className="flex items-center justify-between">
        <span className="text-xs">{editable.label}</span>
        <div className="flex gap-1">
          <button
            type="button"
            disabled={busy}
            onClick={() => commit("hidden", false, "shown")}
            className="text-[10px] px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50"
          >
            Show
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => commit("hidden", true, "hidden")}
            className="text-[10px] px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50"
          >
            Hide
          </button>
          {done ? <span className="text-[10px] text-emerald-600">✓</span> : null}
        </div>
      </div>
    );
  }

  if (editable.kind === "color") {
    return (
      <label className="flex items-center justify-between gap-2">
        <span className="text-xs">{editable.label}</span>
        <input
          type="color"
          onChange={(e) => commit("color_hex", e.target.value, `→ ${e.target.value}`)}
          className="h-7 w-12 rounded border border-neutral-300 dark:border-neutral-700"
        />
      </label>
    );
  }

  if (editable.kind === "fontFamily") {
    return (
      <label className="flex items-center justify-between gap-2">
        <span className="text-xs">{editable.label}</span>
        <select
          onChange={(e) => commit("fontFamily", e.target.value, `→ ${e.target.value}`)}
          className="text-xs px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"
          defaultValue=""
        >
          <option value="" disabled>
            Choose font…
          </option>
          {FONTS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </label>
    );
  }

  // Default: text
  return (
    <div>
      <div className="text-[11px] text-neutral-600 dark:text-neutral-400 mb-1">
        {editable.label}
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={2}
        placeholder="(leave blank to inherit)"
        className="w-full text-xs px-2 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 resize-none"
      />
      <div className="mt-1 flex justify-end">
        <button
          type="button"
          disabled={busy}
          onClick={() => commit("text", value)}
          className="text-[10px] px-2 py-1 rounded bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 disabled:opacity-50"
        >
          Save
        </button>
        {done ? <span className="ml-2 text-[10px] text-emerald-600">✓</span> : null}
      </div>
    </div>
  );
}

// Used elsewhere
export const _registry = EDITABLE_REGISTRY;
