"use client";

import { useState, useTransition } from "react";
import { savePricingSeasons } from "./actions";
import type { PricingSeason } from "@/lib/types";

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100";

type EditableSeason = {
  id?: string;
  tempId: string;
  name: string;
  start_date: string;
  end_date: string;
  price_multiplier: string; // keep as string in form
  fixed_price_eur: string;
};

function toEditable(s: PricingSeason): EditableSeason {
  return {
    id: s.id,
    tempId: s.id,
    name: s.name,
    start_date: s.start_date,
    end_date: s.end_date,
    price_multiplier: s.price_multiplier?.toString() ?? "",
    fixed_price_eur: s.fixed_price_eur?.toString() ?? "",
  };
}

export function PricingSeasonsEditor({
  unitId,
  propertyId,
  basePrice,
  initialSeasons,
}: {
  unitId: string;
  propertyId: string;
  basePrice: number;
  initialSeasons: PricingSeason[];
}) {
  const [seasons, setSeasons] = useState<EditableSeason[]>(
    initialSeasons.map(toEditable),
  );
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function update(idx: number, patch: Partial<EditableSeason>) {
    setSeasons((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  }

  function add() {
    setSeasons((prev) => [
      ...prev,
      {
        tempId: `new-${Date.now()}-${prev.length}`,
        name: "",
        start_date: "",
        end_date: "",
        price_multiplier: "1.50",
        fixed_price_eur: "",
      },
    ]);
  }

  function remove(idx: number) {
    setSeasons((prev) => {
      const target = prev[idx];
      if (target.id) setDeletedIds((d) => [...d, target.id!]);
      return prev.filter((_, i) => i !== idx);
    });
  }

  function save() {
    setStatus("idle");
    setErrorMsg(null);
    const payload = seasons.map((s) => ({
      id: s.id,
      name: s.name.trim(),
      start_date: s.start_date,
      end_date: s.end_date,
      price_multiplier:
        s.price_multiplier.trim() === "" ? null : Number(s.price_multiplier),
      fixed_price_eur:
        s.fixed_price_eur.trim() === "" ? null : Number(s.fixed_price_eur),
    }));
    startTransition(async () => {
      const result = await savePricingSeasons(
        unitId,
        propertyId,
        payload,
        deletedIds,
      );
      if (result.ok) {
        setStatus("ok");
        setDeletedIds([]);
      } else {
        setStatus("error");
        setErrorMsg(result.error);
      }
    });
  }

  function previewPrice(s: EditableSeason): string | null {
    const fix = s.fixed_price_eur.trim();
    if (fix !== "" && !Number.isNaN(Number(fix))) return `€${Number(fix).toFixed(0)}/night (fixed)`;
    const mul = s.price_multiplier.trim();
    if (mul !== "" && !Number.isNaN(Number(mul))) {
      const total = basePrice * Number(mul);
      return `€${total.toFixed(0)}/night (×${Number(mul).toFixed(2)})`;
    }
    return null;
  }

  return (
    <div className="space-y-5 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-950">
      <div className="flex items-baseline justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-medium">Seasonal pricing</h3>
          <p className="text-xs text-neutral-500 mt-1">
            Base price: €{basePrice.toFixed(0)}/night. Use a multiplier (e.g.
            1.5 = +50%) or override with a fixed price.
          </p>
        </div>
        <button
          type="button"
          onClick={add}
          className="px-3 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition"
        >
          + Add season
        </button>
      </div>

      {seasons.length === 0 ? (
        <p className="text-sm text-neutral-500 py-4 text-center">
          No seasonal pricing rules yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {seasons.map((s, idx) => (
            <li
              key={s.tempId}
              className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 space-y-3"
            >
              <div className="flex items-start gap-3">
                <input
                  value={s.name}
                  onChange={(e) => update(idx, { name: e.target.value })}
                  placeholder="High Season — Christmas"
                  className={`${inputCls} flex-1`}
                />
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="px-2 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded transition"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
              <div className="grid sm:grid-cols-4 gap-3">
                <input
                  type="date"
                  value={s.start_date}
                  onChange={(e) => update(idx, { start_date: e.target.value })}
                  className={inputCls}
                />
                <input
                  type="date"
                  value={s.end_date}
                  onChange={(e) => update(idx, { end_date: e.target.value })}
                  className={inputCls}
                />
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  value={s.price_multiplier}
                  onChange={(e) =>
                    update(idx, {
                      price_multiplier: e.target.value,
                      fixed_price_eur:
                        e.target.value !== "" ? "" : s.fixed_price_eur,
                    })
                  }
                  placeholder="× multiplier"
                  className={inputCls}
                />
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={s.fixed_price_eur}
                  onChange={(e) =>
                    update(idx, {
                      fixed_price_eur: e.target.value,
                      price_multiplier:
                        e.target.value !== "" ? "" : s.price_multiplier,
                    })
                  }
                  placeholder="€ fixed"
                  className={inputCls}
                />
              </div>
              {previewPrice(s) && (
                <p className="text-xs text-neutral-500">
                  → {previewPrice(s)}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-4 pt-2 border-t border-neutral-200 dark:border-neutral-900">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="px-5 py-2.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save seasons"}
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
