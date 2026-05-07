"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/app/(auth)/actions";

export function ProfileForm({
  initial,
  email,
}: {
  initial: { full_name: string | null; phone: string | null };
  email: string;
}) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        setStatus("idle");
        setError(null);
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
          const result = await updateProfile(formData);
          if (result.ok) setStatus("ok");
          else {
            setStatus("error");
            setError(result.error);
          }
        });
      }}
    >
      <div>
        <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">
          Email
        </label>
        <input
          value={email}
          disabled
          className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 text-neutral-500"
        />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">
          Full name
        </label>
        <input
          name="full_name"
          defaultValue={initial.full_name ?? ""}
          className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
        />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">
          Phone
        </label>
        <input
          name="phone"
          defaultValue={initial.phone ?? ""}
          className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
        />
      </div>
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        {status === "ok" && (
          <span className="text-sm text-emerald-600 dark:text-emerald-400">
            Saved.
          </span>
        )}
        {status === "error" && (
          <span className="text-sm text-red-600 dark:text-red-400">
            {error ?? "Could not save."}
          </span>
        )}
      </div>
    </form>
  );
}
