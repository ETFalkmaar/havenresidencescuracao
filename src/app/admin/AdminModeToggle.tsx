"use client";

// Two-button toggle that persists "easy" or "advanced" via cookie.
// Easy mode shows a slim nav with just the things owners use 99% of the
// time; Advanced reveals every section. The cookie is read in the
// layout to decide which nav to render.

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setAdminMode } from "./actions";

export function AdminModeToggle({ mode }: { mode: "easy" | "advanced" }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function set(next: "easy" | "advanced") {
    if (next === mode) return;
    startTransition(async () => {
      await setAdminMode(next);
      router.refresh();
    });
  }

  return (
    <div className="inline-flex items-center rounded-full border border-neutral-300 dark:border-neutral-700 p-0.5 text-[11px] font-medium tracking-widest uppercase">
      <button
        type="button"
        disabled={pending}
        onClick={() => set("easy")}
        className={`px-3 py-1.5 rounded-full transition ${
          mode === "easy"
            ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
            : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
        }`}
      >
        Easy
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => set("advanced")}
        className={`px-3 py-1.5 rounded-full transition ${
          mode === "advanced"
            ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
            : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
        }`}
      >
        Advanced
      </button>
    </div>
  );
}
