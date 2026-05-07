"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setOwnPassword } from "../team/actions";

export function SetPasswordForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const router = useRouter();

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        setOk(false);
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
          const result = await setOwnPassword(formData);
          if (result.ok) {
            setOk(true);
            router.refresh();
          } else {
            setError(result.error);
          }
        });
      }}
    >
      <div>
        <label
          htmlFor="password"
          className="block text-xs uppercase tracking-widest text-neutral-500 mb-2"
        >
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={10}
          className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
        />
        <p className="text-xs text-neutral-500 mt-1.5">
          At least 10 characters. Don&apos;t reuse the temporary password.
        </p>
      </div>

      <div>
        <label
          htmlFor="confirm"
          className="block text-xs uppercase tracking-widest text-neutral-500 mb-2"
        >
          Confirm new password
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={10}
          className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full px-5 py-3 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium tracking-wide hover:opacity-90 transition disabled:opacity-50"
      >
        {pending ? "Saving…" : "Set new password"}
      </button>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {ok && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          Password updated. Loading dashboard…
        </p>
      )}
    </form>
  );
}
