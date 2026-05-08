"use client";

import { useState, useTransition } from "react";
import { updateUnit } from "./actions";
import { IcalExportField } from "./IcalExportField";
import type { Unit } from "@/lib/types";

const inputCls =
  "w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">
      {children}
    </span>
  );
}

export function UnitEditor({
  unit,
  propertyId,
}: {
  unit: Unit;
  propertyId: string;
}) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  return (
    <form
      className="space-y-6 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-950"
      onSubmit={(e) => {
        e.preventDefault();
        setStatus("idle");
        setErrorMsg(null);
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
          const result = await updateUnit(unit.id, propertyId, formData);
          if (result.ok) setStatus("ok");
          else {
            setStatus("error");
            setErrorMsg(result.error);
          }
        });
      }}
    >
      <div className="flex items-baseline justify-between flex-wrap gap-3">
        <h3 className="text-lg font-medium">{unit.name}</h3>
        <span className="text-xs text-neutral-500">unit slug: /{unit.slug}</span>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <label>
          <Label>Display name</Label>
          <input name="name" defaultValue={unit.name} required className={inputCls} />
        </label>
        <label>
          <Label>Slug</Label>
          <input
            name="slug"
            defaultValue={unit.slug}
            required
            pattern="[a-z0-9-]+"
            className={inputCls}
          />
        </label>
      </div>

      <label>
        <Label>Description</Label>
        <textarea
          name="description"
          defaultValue={unit.description ?? ""}
          rows={3}
          className={inputCls}
        />
      </label>

      <div>
        <p className="text-xs uppercase tracking-widest text-neutral-500 mb-3">
          Capacity
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <label>
            <Label>Bedrooms</Label>
            <input
              name="bedrooms"
              type="number"
              min={0}
              step={1}
              defaultValue={unit.bedrooms}
              className={inputCls}
            />
          </label>
          <label>
            <Label>Bathrooms</Label>
            <input
              name="bathrooms"
              type="number"
              min={0}
              step={0.5}
              defaultValue={unit.bathrooms}
              className={inputCls}
            />
          </label>
          <label>
            <Label>Max guests</Label>
            <input
              name="max_guests"
              type="number"
              min={1}
              step={1}
              defaultValue={unit.max_guests}
              className={inputCls}
            />
          </label>
          <label>
            <Label>Size m²</Label>
            <input
              name="size_m2"
              type="number"
              min={0}
              step={1}
              defaultValue={unit.size_m2 ?? ""}
              className={inputCls}
            />
          </label>
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-widest text-neutral-500 mb-3">
          Pricing
        </p>
        <div className="grid sm:grid-cols-2 gap-5">
          <label>
            <Label>Base price (€ / night)</Label>
            <input
              name="base_price_eur"
              type="number"
              min={0}
              step={1}
              defaultValue={unit.base_price_eur}
              required
              className={inputCls}
            />
          </label>
          <label>
            <Label>Cleaning fee (€)</Label>
            <input
              name="cleaning_fee_eur"
              type="number"
              min={0}
              step={1}
              defaultValue={unit.cleaning_fee_eur}
              className={inputCls}
            />
          </label>
          <label>
            <Label>Long-stay rate (€ / month)</Label>
            <input
              name="long_stay_monthly_price_eur"
              type="number"
              min={0}
              step={1}
              defaultValue={unit.long_stay_monthly_price_eur ?? ""}
              className={inputCls}
            />
            <p className="text-xs text-neutral-500 mt-1.5">
              Optional. Shown for stays of {unit.min_long_stay_months}+ months.
            </p>
          </label>
          <label>
            <Label>Min nights (short stay)</Label>
            <input
              name="min_short_stay_nights"
              type="number"
              min={1}
              step={1}
              defaultValue={unit.min_short_stay_nights}
              className={inputCls}
            />
          </label>
          <label>
            <Label>Min months (long stay)</Label>
            <input
              name="min_long_stay_months"
              type="number"
              min={1}
              step={1}
              defaultValue={unit.min_long_stay_months}
              className={inputCls}
            />
          </label>
          <label>
            <Label>Status</Label>
            <select
              name="status"
              defaultValue={unit.status}
              className={inputCls}
            >
              <option value="active">Active (bookable)</option>
              <option value="hidden">Hidden</option>
            </select>
          </label>
        </div>
      </div>

      <div className="space-y-5">
        <p className="text-xs uppercase tracking-widest text-neutral-500">
          Airbnb calendar sync (two-way)
        </p>

        <label className="block">
          <Label>Airbnb iCal URL (Airbnb → us)</Label>
          <input
            name="airbnb_ical_url"
            type="url"
            defaultValue={unit.airbnb_ical_url ?? ""}
            placeholder="https://www.airbnb.com/calendar/ical/…"
            className={inputCls}
          />
          <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
            Paste the iCal export URL from your Airbnb listing. The site polls
            it once an hour and grays out Airbnb-booked dates in the public
            booking calendar so you never get a double booking.
          </p>
        </label>

        <IcalExportField unitId={unit.id} />
      </div>

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium tracking-wide hover:opacity-90 transition disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save unit"}
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
