"use client";

import { useState, useTransition } from "react";
import { submitInquiry } from "@/app/actions/inquiry";

export function InquiryForm({
  propertyId,
  accent = "#111111",
}: {
  propertyId?: string;
  accent?: string;
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
        if (propertyId) formData.set("property_id", propertyId);

        startTransition(async () => {
          const result = await submitInquiry(formData);
          if (result.ok) {
            setStatus("ok");
            (e.target as HTMLFormElement).reset();
          } else {
            setStatus("error");
            setErrorMsg(result.error ?? "Something went wrong.");
          }
        });
      }}
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <input
          name="name"
          required
          placeholder="Your name"
          className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-offset-1 transition"
          style={{ ["--tw-ring-color" as string]: accent }}
        />
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-offset-1"
          style={{ ["--tw-ring-color" as string]: accent }}
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <input
          name="phone"
          placeholder="Phone (optional)"
          className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-offset-1"
          style={{ ["--tw-ring-color" as string]: accent }}
        />
        <input
          name="preferred_dates"
          placeholder="Preferred dates (optional)"
          className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-offset-1"
          style={{ ["--tw-ring-color" as string]: accent }}
        />
      </div>
      <textarea
        name="message"
        required
        rows={4}
        placeholder="Tell us about your stay…"
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
          {pending ? "Sending…" : "Send inquiry"}
        </button>

        {status === "ok" && (
          <span className="text-sm text-emerald-600 dark:text-emerald-400">
            Thank you — we&apos;ll be in touch within 24 hours.
          </span>
        )}
        {status === "error" && (
          <span className="text-sm text-red-600 dark:text-red-400">
            {errorMsg ?? "Could not send. Please try again."}
          </span>
        )}
      </div>
    </form>
  );
}
