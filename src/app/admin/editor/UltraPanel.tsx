"use client";

import { useState, useTransition } from "react";
import { saveUltra } from "./actions";
import type { SiteUltraConfig } from "@/lib/editor/types";

type Field = "css" | "js" | "head";

const TABS: { key: Field; label: string; placeholder: string }[] = [
  {
    key: "css",
    label: "Custom CSS",
    placeholder: "/* Custom CSS — applies to the entire site */\n.hero h1 { letter-spacing: -0.04em; }",
  },
  {
    key: "js",
    label: "Custom JavaScript",
    placeholder: "// Custom JS — runs once after the page loads.\n// Example analytics, third-party widgets, etc.\nconsole.log('hello from custom JS');",
  },
  {
    key: "head",
    label: "<head> snippets",
    placeholder: "<!-- Tags injected near the top of <body> (Google Analytics, Pixel, etc.) -->",
  },
];

export function UltraPanel({
  ultra,
  onChanged,
}: {
  ultra: SiteUltraConfig | null;
  onChanged: () => void;
}) {
  const [field, setField] = useState<Field>("css");
  const [css, setCss] = useState(ultra?.custom_css_draft ?? ultra?.custom_css_published ?? "");
  const [js, setJs] = useState(ultra?.custom_js_draft ?? ultra?.custom_js_published ?? "");
  const [head, setHead] = useState(ultra?.head_html_draft ?? ultra?.head_html_published ?? "");
  const [pending, startTransition] = useTransition();
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function valueFor(f: Field) {
    if (f === "css") return css;
    if (f === "js") return js;
    return head;
  }

  function setValueFor(f: Field, v: string) {
    if (f === "css") return setCss(v);
    if (f === "js") return setJs(v);
    return setHead(v);
  }

  function save() {
    setError(null);
    setInfo(null);
    const value = valueFor(field);
    const description = `Updated ${field === "head" ? "<head> snippets" : field === "js" ? "Custom JS" : "Custom CSS"}`;
    startTransition(async () => {
      const r = await saveUltra(field, value, description);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setInfo("Saved (draft)");
      setTimeout(() => setInfo(null), 1500);
      onChanged();
    });
  }

  return (
    <div className="p-4 space-y-3">
      <div>
        <h2 className="text-sm font-semibold mb-1">Ultra-Professional</h2>
        <p className="text-xs text-neutral-500">
          Inject custom CSS, JavaScript, or HTML snippets. Saved as a draft —
          press Publish in the top bar to push live.
        </p>
        <p className="mt-2 text-[11px] text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 rounded p-2">
          ⚠ Custom JS and head HTML run with full page privileges. Only paste
          code from sources you trust.
        </p>
      </div>

      <div className="inline-flex rounded-md border border-neutral-300 dark:border-neutral-700 overflow-hidden text-xs">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setField(t.key)}
            type="button"
            className={`px-2.5 py-1.5 ${
              field === t.key
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "hover:bg-neutral-50 dark:hover:bg-neutral-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <textarea
        value={valueFor(field)}
        onChange={(e) => setValueFor(field, e.target.value)}
        spellCheck={false}
        placeholder={TABS.find((t) => t.key === field)?.placeholder}
        rows={18}
        className="w-full font-mono text-[11px] leading-snug px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 resize-y"
      />

      <div className="flex items-center gap-2 justify-between">
        <div className="text-[10px] text-neutral-500">
          {field === "css" && ultra?.custom_css_published ? "Published version exists." : null}
          {field === "js" && ultra?.custom_js_published ? "Published version exists." : null}
          {field === "head" && ultra?.head_html_published ? "Published version exists." : null}
        </div>
        <div className="flex gap-2 items-center">
          {info ? <span className="text-[10px] text-emerald-600">✓ {info}</span> : null}
          {error ? <span className="text-[10px] text-red-600 max-w-[140px] truncate">{error}</span> : null}
          <button
            onClick={save}
            disabled={pending}
            className="text-xs px-3 py-1.5 rounded bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 disabled:opacity-50"
          >
            Save draft
          </button>
        </div>
      </div>

      <details className="mt-4 group" open={false}>
        <summary className="cursor-pointer text-[11px] uppercase tracking-wider text-neutral-500 select-none">
          Coming soon (placeholders)
        </summary>
        <div className="mt-2 text-[11px] text-neutral-500 space-y-1.5 px-1">
          <div>· A/B testing for hero variants</div>
          <div>· Save section as reusable template</div>
          <div>· Conditional visibility (date ranges, audiences)</div>
          <div>· Performance budget warnings</div>
          <div>· Schema.org / structured data editor</div>
          <div className="pt-2 italic">
            These features are scaffolded in the database schema (templates, ab_tests,
            head HTML) but the UI is not finished — see CLAUDE.md for the
            full roadmap.
          </div>
        </div>
      </details>
    </div>
  );
}
