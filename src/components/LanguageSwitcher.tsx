"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLanguage } from "@/app/actions/language";
import type { Lang } from "@/lib/i18n/translations";

export function LanguageSwitcher({
  current,
  variant = "light",
}: {
  current: Lang;
  variant?: "light" | "dark";
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function pick(next: Lang) {
    if (next === current || pending) return;
    startTransition(async () => {
      await setLanguage(next);
      router.refresh();
    });
  }

  const baseColor = variant === "light" ? "text-white/85" : "text-neutral-400";
  const activeColor =
    variant === "light" ? "text-white" : "text-neutral-900 dark:text-neutral-100";

  return (
    <div
      className={`inline-flex items-center text-xs tracking-widest uppercase ${baseColor} select-none`}
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => pick("en")}
        disabled={pending}
        className={`px-2 py-1 transition ${current === "en" ? activeColor + " font-medium" : "hover:" + activeColor}`}
        aria-pressed={current === "en"}
      >
        EN
      </button>
      <span className={`opacity-40`}>·</span>
      <button
        type="button"
        onClick={() => pick("nl")}
        disabled={pending}
        className={`px-2 py-1 transition ${current === "nl" ? activeColor + " font-medium" : "hover:" + activeColor}`}
        aria-pressed={current === "nl"}
      >
        NL
      </button>
    </div>
  );
}
