"use client";

import { useState, useTransition } from "react";
import { signIn, signUpFirstAdmin } from "./actions";

export function LoginForm({ allowSignUp }: { allowSignUp: boolean }) {
  const [mode, setMode] = useState<"signin" | "signup">(
    allowSignUp ? "signup" : "signin",
  );
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {allowSignUp && mode === "signup" && (
        <div className="rounded-md border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
          No admin exists yet. The account you create here will become the
          first owner.
        </div>
      )}

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          setInfo(null);
          const formData = new FormData(e.currentTarget);
          startTransition(async () => {
            const action = mode === "signup" ? signUpFirstAdmin : signIn;
            const result = await action(formData);
            if (!result.ok) {
              setError(result.error);
            } else if (mode === "signup") {
              setInfo(
                "Account created. Check your inbox to confirm your email, then sign in.",
              );
              setMode("signin");
            }
          });
        }}
      >
        <div>
          <label
            htmlFor="email"
            className="block text-xs uppercase tracking-widest text-neutral-500 mb-2"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-xs uppercase tracking-widest text-neutral-500 mb-2"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            required
            minLength={8}
            className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
          />
          {mode === "signup" && (
            <p className="text-xs text-neutral-500 mt-1.5">
              At least 8 characters.
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full px-5 py-3 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium tracking-wide hover:opacity-90 transition disabled:opacity-50"
        >
          {pending
            ? mode === "signup"
              ? "Creating…"
              : "Signing in…"
            : mode === "signup"
              ? "Create owner account"
              : "Sign in"}
        </button>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {info && (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">{info}</p>
        )}
      </form>

      {allowSignUp && (
        <button
          type="button"
          onClick={() => {
            setMode((m) => (m === "signin" ? "signup" : "signin"));
            setError(null);
            setInfo(null);
          }}
          className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition"
        >
          {mode === "signin"
            ? "Setting up the very first admin? Switch to sign-up."
            : "Already confirmed your email? Switch to sign-in."}
        </button>
      )}
    </div>
  );
}
