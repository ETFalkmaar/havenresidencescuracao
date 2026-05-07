"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { publicSignUp } from "../actions";

export function SignUpForm({ next }: { next?: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        setInfo(null);
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
          const result = await publicSignUp(formData);
          if (!result.ok) {
            setError(result.error);
            return;
          }
          if (result.needsVerification) {
            setInfo(
              "Account created. Check your inbox for a confirmation email — click the link to activate your account, then sign in.",
            );
          } else {
            window.location.href = next ?? "/account";
          }
        });
      }}
    >
      <div>
        <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">
          Full name
        </label>
        <input
          name="full_name"
          required
          autoComplete="name"
          className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
        />
      </div>
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
          minLength={8}
          autoComplete="new-password"
          className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
        />
        <p className="text-xs text-neutral-500 mt-1.5">At least 8 characters.</p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full px-5 py-3 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium tracking-wide hover:opacity-90 transition disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create account"}
      </button>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {info && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">{info}</p>
      )}

      <p className="text-xs text-neutral-500 pt-2">
        Already have an account?{" "}
        <Link
          href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="underline hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
