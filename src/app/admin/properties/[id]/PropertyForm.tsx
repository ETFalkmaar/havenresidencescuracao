"use client";

import { useState, useTransition } from "react";
import { updateProperty } from "./actions";
import type { Property } from "@/lib/types";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">
      {children}
    </span>
  );
}

const inputCls =
  "w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100";

export function PropertyForm({ property }: { property: Property }) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  return (
    <form
      className="space-y-10"
      onSubmit={(e) => {
        e.preventDefault();
        setStatus("idle");
        setErrorMsg(null);
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
          const result = await updateProperty(property.id, formData);
          if (result.ok) setStatus("ok");
          else {
            setStatus("error");
            setErrorMsg(result.error);
          }
        });
      }}
    >
      <section className="space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
          Basics
        </h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <label>
            <Label>Name</Label>
            <input name="name" defaultValue={property.name} required className={inputCls} />
          </label>
          <label>
            <Label>Slug (URL)</Label>
            <input
              name="slug"
              defaultValue={property.slug}
              required
              pattern="[a-z0-9-]+"
              className={inputCls}
            />
            <p className="text-xs text-neutral-500 mt-1.5">
              Lowercase letters, numbers, hyphens only — used in the URL.
            </p>
          </label>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <label>
            <Label>Tagline (EN)</Label>
            <input
              name="tagline"
              defaultValue={property.tagline ?? ""}
              placeholder="Beachfront living on Blue Bay"
              className={inputCls}
            />
          </label>
          <label>
            <Label>Tagline (NL)</Label>
            <input
              name="tagline_nl"
              defaultValue={property.tagline_nl ?? ""}
              placeholder="Strandverblijf aan de Blue Bay"
              className={inputCls}
            />
          </label>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <label>
            <Label>Short description (EN)</Label>
            <textarea
              name="short_description"
              defaultValue={property.short_description ?? ""}
              rows={2}
              className={inputCls}
            />
          </label>
          <label>
            <Label>Short description (NL)</Label>
            <textarea
              name="short_description_nl"
              defaultValue={property.short_description_nl ?? ""}
              rows={2}
              className={inputCls}
            />
          </label>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <label>
            <Label>Long description (EN)</Label>
            <textarea
              name="description"
              defaultValue={property.description ?? ""}
              rows={6}
              className={inputCls}
            />
          </label>
          <label>
            <Label>Long description (NL)</Label>
            <textarea
              name="description_nl"
              defaultValue={property.description_nl ?? ""}
              rows={6}
              className={inputCls}
            />
          </label>
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
          Location
        </h2>
        <label>
          <Label>Address</Label>
          <input name="address" defaultValue={property.address} required className={inputCls} />
        </label>
        <div className="grid sm:grid-cols-2 gap-5">
          <label>
            <Label>City</Label>
            <input name="city" defaultValue={property.city} required className={inputCls} />
          </label>
          <label>
            <Label>Country</Label>
            <input
              name="country"
              defaultValue={property.country}
              className={inputCls}
            />
          </label>
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
          Branding
        </h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <label>
            <Label>Color name</Label>
            <input
              name="color_name"
              defaultValue={property.color_name}
              placeholder="blue"
              className={inputCls}
            />
          </label>
          <label>
            <Label>Color (hex)</Label>
            <input
              name="color_hex"
              defaultValue={property.color_hex ?? ""}
              placeholder="#1E5FBF"
              className={inputCls}
            />
            <p className="text-xs text-neutral-500 mt-1.5">
              Used as accent on the public detail page.
            </p>
          </label>
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
          Visibility
        </h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <label>
            <Label>Status</Label>
            <select
              name="status"
              defaultValue={property.status}
              className={inputCls}
            >
              <option value="active">Active (live, bookable)</option>
              <option value="coming_soon">Coming soon</option>
              <option value="draft">Draft (hidden from public)</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label>
            <Label>Available from (coming-soon date)</Label>
            <input
              name="available_from"
              type="date"
              defaultValue={property.available_from ?? ""}
              className={inputCls}
            />
            <p className="text-xs text-neutral-500 mt-1.5">
              Shown on the coming-soon badge.
            </p>
          </label>
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
          Property features
        </h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <label>
            <Label>Parking</Label>
            <select
              name="parking"
              defaultValue={property.parking}
              className={inputCls}
            >
              <option value="private">Private (gated)</option>
              <option value="public">Public</option>
              <option value="street">Street</option>
              <option value="none">None</option>
            </select>
          </label>
          <label>
            <Label>Utilities</Label>
            <select
              name="utilities"
              defaultValue={property.utilities}
              className={inputCls}
            >
              <option value="included">Included in price</option>
              <option value="metered">Metered (settled at end of stay)</option>
              <option value="prepaid_card">Prepaid utility cards</option>
            </select>
          </label>
        </div>

        <label>
          <Label>Utilities notes</Label>
          <textarea
            name="utilities_notes"
            defaultValue={property.utilities_notes ?? ""}
            rows={2}
            placeholder="Electricity is metered and settled at the end of your stay…"
            className={inputCls}
          />
        </label>

        <div className="flex items-center gap-6 flex-wrap">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="is_gated"
              defaultChecked={property.is_gated}
              className="w-4 h-4 accent-neutral-900 dark:accent-white"
            />
            <span>Gated property</span>
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="pets_allowed"
              defaultChecked={property.pets_allowed}
              className="w-4 h-4 accent-neutral-900 dark:accent-white"
            />
            <span>Pets allowed</span>
          </label>
        </div>
      </section>

      <div className="flex items-center gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <button
          type="submit"
          disabled={pending}
          className="px-6 py-3 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium tracking-wide hover:opacity-90 transition disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
        {status === "ok" && (
          <span className="text-sm text-emerald-600 dark:text-emerald-400">
            Saved.
          </span>
        )}
        {status === "error" && (
          <span className="text-sm text-red-600 dark:text-red-400">
            {errorMsg ?? "Could not save."}
          </span>
        )}
      </div>
    </form>
  );
}
