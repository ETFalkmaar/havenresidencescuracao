"use client";

import { useState, useTransition } from "react";
import { updateUnitAmenities } from "./actions";
import type { Amenity } from "@/lib/types";

export function AmenitiesPicker({
  unitId,
  propertyId,
  allAmenities,
  selectedIds,
}: {
  unitId: string;
  propertyId: string;
  allAmenities: Amenity[];
  selectedIds: string[];
}) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(selectedIds),
  );
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const grouped = allAmenities.reduce<Record<string, Amenity[]>>((acc, a) => {
    const cat = a.category ?? "other";
    (acc[cat] ||= []).push(a);
    return acc;
  }, {});

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function save() {
    setStatus("idle");
    setErrorMsg(null);
    startTransition(async () => {
      const result = await updateUnitAmenities(
        unitId,
        propertyId,
        Array.from(selected),
      );
      if (result.ok) setStatus("ok");
      else {
        setStatus("error");
        setErrorMsg(result.error);
      }
    });
  }

  return (
    <div className="space-y-5 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-950">
      <div className="flex items-baseline justify-between flex-wrap gap-3">
        <h3 className="text-lg font-medium">Amenities</h3>
        <span className="text-xs text-neutral-500">
          {selected.size} selected
        </span>
      </div>

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <p className="text-xs uppercase tracking-widest text-neutral-500 mb-2.5 capitalize">
            {category}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {items.map((a) => {
              const isOn = selected.has(a.id);
              return (
                <button
                  type="button"
                  key={a.id}
                  onClick={() => toggle(a.id)}
                  className={`text-left text-sm px-3 py-2 rounded-lg border transition ${
                    isOn
                      ? "border-neutral-900 dark:border-neutral-100 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900"
                      : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600"
                  }`}
                >
                  <span className="inline-block w-3 mr-1.5 text-center">
                    {isOn ? "✓" : ""}
                  </span>
                  {a.name}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-4 pt-2 border-t border-neutral-200 dark:border-neutral-900">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="px-5 py-2.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save amenities"}
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
    </div>
  );
}
