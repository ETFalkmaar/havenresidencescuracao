"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { promoteAdmin } from "./actions";

export function PromoteForm() {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  return (
    <form
      className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-950 space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        setStatus("idle");
        setErrorMsg(null);
        const formData = new FormData(e.currentTarget);
        const form = e.currentTarget;
        startTransition(async () => {
          const result = await promoteAdmin(formData);
          if (result.ok) {
            setStatus("ok");
            form.reset();
            router.refresh();
          } else {
            setStatus("error");
            setErrorMsg(result.error);
          }
        });
      }}
    >
      <div>
        <h3 className="text-lg font-medium">Invite an admin</h3>
        <p className="text-sm text-neutral-500 mt-1">
          Two-step process for security:
        </p>
        <ol className="text-xs text-neutral-500 mt-2 space-y-1 list-decimal pl-5">
          <li>
            In Supabase Dashboard → Authentication → Users → <em>Add user</em>,
            create the account with their email and a temporary password
            (e.g. <code className="text-neutral-400">welkom123</code>). Tick
            &quot;Auto Confirm User&quot; so they don&apos;t need to verify
            their email.
          </li>
          <li>
            Come back here, enter their email, and click <em>Promote</em>.
            They&apos;ll be forced to choose a new password on first sign-in.
          </li>
        </ol>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <input
          name="email"
          type="email"
          required
          placeholder="email@example.com"
          className="sm:col-span-2 px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
        />
        <select
          name="role"
          defaultValue="admin"
          className="px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
        >
          <option value="admin">Admin</option>
          <option value="owner">Owner</option>
        </select>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          {pending ? "Promoting…" : "Promote to admin"}
        </button>
        {status === "ok" && (
          <span className="text-sm text-emerald-600 dark:text-emerald-400">
            Promoted. Tell them to sign in with the temp password.
          </span>
        )}
        {status === "error" && (
          <span className="text-sm text-red-600 dark:text-red-400">
            {errorMsg ?? "Could not promote."}
          </span>
        )}
      </div>
    </form>
  );
}
