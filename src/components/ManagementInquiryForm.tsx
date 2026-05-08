"use client";

import { useState, useTransition } from "react";
import { submitManagementInquiry } from "@/app/actions/management-inquiry";
import type { Translations } from "@/lib/i18n/translations";

export function ManagementInquiryForm({
  accent = "#1e5fbf",
  t,
}: {
  accent?: string;
  t: Translations["management"];
}) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
          const result = await submitManagementInquiry(formData);
          if (result.ok) {
            setStatus("ok");
            (e.target as HTMLFormElement).reset();
          } else {
            setStatus("error");
            setErrorMsg(result.error ?? t.formError);
          }
        });
      }}
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <input
          name="name"
          required
          placeholder={t.formNamePlaceholder}
          className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-offset-1 transition"
          style={{ ["--tw-ring-color" as string]: accent }}
        />
        <input
          name="email"
          type="email"
          required
          placeholder={t.formEmailPlaceholder}
          className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-offset-1"
          style={{ ["--tw-ring-color" as string]: accent }}
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <input
          name="phone"
          placeholder={t.formPhonePlaceholder}
          className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-offset-1"
          style={{ ["--tw-ring-color" as string]: accent }}
        />
        <input
          name="address"
          placeholder={t.formAddressPlaceholder}
          className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-offset-1"
          style={{ ["--tw-ring-color" as string]: accent }}
        />
      </div>
      <textarea
        name="message"
        required
        rows={5}
        placeholder={t.formMessagePlaceholder}
        className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-offset-1 resize-y"
        style={{ ["--tw-ring-color" as string]: accent }}
      />

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="px-6 py-3 rounded-lg text-white text-sm font-medium tracking-wide transition disabled:opacity-50"
          style={{ backgroundColor: accent }}
        >
          {pending ? t.formSubmitting : t.formSubmit}
        </button>

        {status === "ok" && (
          <span className="text-sm text-emerald-600 dark:text-emerald-400">
            {t.formSuccess}
          </span>
        )}
        {status === "error" && (
          <span className="text-sm text-red-600 dark:text-red-400">
            {errorMsg ?? t.formError}
          </span>
        )}
      </div>
    </form>
  );
}
