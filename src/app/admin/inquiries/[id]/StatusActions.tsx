"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateInquiryStatus } from "../actions";

const OPTIONS: { value: "new" | "replied" | "closed"; label: string }[] = [
  { value: "new", label: "New" },
  { value: "replied", label: "Replied" },
  { value: "closed", label: "Closed" },
];

export function StatusActions({
  id,
  current,
}: {
  id: string;
  current: "new" | "replied" | "closed";
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-widest text-neutral-500">
        Update status
      </p>
      <div className="flex gap-2 flex-wrap">
        {OPTIONS.map((opt) => {
          const active = opt.value === current;
          return (
            <button
              key={opt.value}
              type="button"
              disabled={pending || active}
              onClick={() => {
                setError(null);
                startTransition(async () => {
                  const result = await updateInquiryStatus(id, opt.value);
                  if (!result.ok) setError(result.error);
                  else router.refresh();
                });
              }}
              className={`px-4 py-2 text-xs rounded-lg border transition ${
                active
                  ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-neutral-900 dark:border-neutral-100"
                  : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900"
              } disabled:opacity-50`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
