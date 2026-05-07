"use client";

import { useState, useTransition } from "react";
import { createProperty } from "./actions";

const inputCls =
  "w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">
      {children}
    </span>
  );
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const PRESETS = [
  { name: "Blue", hex: "#1E5FBF" },
  { name: "Green", hex: "#2F7D55" },
  { name: "Coral", hex: "#D86B5C" },
  { name: "Sand", hex: "#C8A86F" },
  { name: "Stone", hex: "#5C6970" },
  { name: "Sunset", hex: "#E0824B" },
];

export function NewPropertyForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [colorName, setColorName] = useState("Blue");
  const [colorHex, setColorHex] = useState("#1E5FBF");

  function pickPreset(preset: { name: string; hex: string }) {
    setColorName(preset.name);
    setColorHex(preset.hex);
  }

  return (
    <form
      className="space-y-7"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);
        formData.set("color_name", colorName);
        formData.set("color_hex", colorHex);
        startTransition(async () => {
          const result = await createProperty(formData);
          if (!result.ok) setError(result.error);
        });
      }}
    >
      <label>
        <Label>Name</Label>
        <input
          name="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setSlug((current) =>
              current === slugify(name) || current === ""
                ? slugify(e.target.value)
                : current,
            );
          }}
          placeholder="Coral Haven Residence"
          required
          className={inputCls}
        />
      </label>

      <label>
        <Label>Slug (URL)</Label>
        <input
          name="slug"
          value={slug}
          onChange={(e) => setSlug(slugify(e.target.value))}
          placeholder="coral-haven-residence"
          required
          pattern="[a-z0-9-]+"
          className={inputCls}
        />
        <p className="text-xs text-neutral-500 mt-1.5">
          URL becomes <code>/{slug || "your-slug"}</code>. Auto-suggested from name.
        </p>
      </label>

      <label>
        <Label>Tagline</Label>
        <input
          name="tagline"
          placeholder="A short, evocative line for the hero & cards"
          className={inputCls}
        />
      </label>

      <div>
        <Label>Brand color</Label>
        <div className="flex flex-wrap gap-2 mb-3">
          {PRESETS.map((p) => {
            const active = p.name === colorName;
            return (
              <button
                type="button"
                key={p.name}
                onClick={() => pickPreset(p)}
                className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border transition text-sm ${
                  active
                    ? "border-neutral-900 dark:border-neutral-100"
                    : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600"
                }`}
              >
                <span
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: p.hex }}
                />
                {p.name}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input
            value={colorName}
            onChange={(e) => setColorName(e.target.value)}
            placeholder="Color name"
            className={inputCls}
          />
          <input
            value={colorHex}
            onChange={(e) => setColorHex(e.target.value)}
            placeholder="#1E5FBF"
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <label>
          <Label>Status</Label>
          <select name="status" defaultValue="coming_soon" className={inputCls}>
            <option value="active">Active (live, bookable)</option>
            <option value="coming_soon">Coming soon</option>
            <option value="draft">Draft (hidden)</option>
          </select>
        </label>
        <label>
          <Label>Base price (€/night)</Label>
          <input
            name="base_price_eur"
            type="number"
            min={0}
            step={1}
            defaultValue={150}
            className={inputCls}
          />
          <p className="text-xs text-neutral-500 mt-1.5">
            For the default main unit; can fine-tune later.
          </p>
        </label>
      </div>

      <label>
        <Label>Address</Label>
        <input name="address" required className={inputCls} />
      </label>
      <div className="grid sm:grid-cols-2 gap-5">
        <label>
          <Label>City</Label>
          <input name="city" required className={inputCls} />
        </label>
        <label>
          <Label>Country</Label>
          <input name="country" defaultValue="Curaçao" className={inputCls} />
        </label>
      </div>

      <div className="flex items-center gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <button
          type="submit"
          disabled={pending}
          className="px-6 py-3 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium tracking-wide hover:opacity-90 transition disabled:opacity-50"
        >
          {pending ? "Creating…" : "Create residence"}
        </button>
        {error && (
          <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
        )}
      </div>

      <p className="text-xs text-neutral-500">
        After creation you&apos;ll land on the full edit page where you can
        upload photos, set seasonal pricing, pick amenities, and write the
        long description.
      </p>
    </form>
  );
}
