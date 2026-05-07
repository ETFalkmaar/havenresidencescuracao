"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { publicSignIn } from "../actions";

export function LoginForm({ next }: { next?: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);
        if (next) formData.set("next", next);
        startTransition(async () => {
          const result = await publicSignIn(formData);
          if (result && !result.ok) setError(result.error);
        });
      }}
    >
      <div>
        <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">
          Email
        </label>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
        />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">
          Password
        </label>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full px-5 py-3 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium tracking-wide hover:opacity-90 transition disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <p className="text-xs text-neutral-500 pt-2">
        New here?{" "}
        <Link
          href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="underline hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
