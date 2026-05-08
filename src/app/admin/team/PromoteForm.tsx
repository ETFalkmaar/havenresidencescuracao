"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { promoteAdmin } from "./actions";

export function PromoteForm() {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdEmail, setCreatedEmail] = useState<string | null>(null);
  const router = useRouter();

  return (
    <form
      className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-950 space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        setStatus("idle");
        setErrorMsg(null);
        setCreatedEmail(null);
        const formData = new FormData(e.currentTarget);
        const email = (formData.get("email") as string | null) ?? "";
        const form = e.currentTarget;
        startTransition(async () => {
          const result = await promoteAdmin(formData);
          if (result.ok) {
            setStatus("ok");
            setCreatedEmail(email);
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
        <h3 className="text-lg font-medium">Add an admin</h3>
        <p className="text-sm text-neutral-500 mt-1 leading-relaxed">
          Type their email and click <em>Add admin</em>. We&apos;ll create
          their account with a temporary password and force them to choose a
          real one on first sign-in.
        </p>
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

      <div className="flex items-center gap-4 flex-wrap">
        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          {pending ? "Adding…" : "Add admin"}
        </button>
        {status === "error" && (
          <span className="text-sm text-red-600 dark:text-red-400">
            {errorMsg ?? "Could not add admin."}
          </span>
        )}
      </div>

      {status === "ok" && createdEmail && (
        <div className="rounded-lg border border-emerald-300 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-sm text-emerald-900 dark:text-emerald-200 space-y-1">
          <p className="font-medium">Done — admin added.</p>
          <p>
            Tell <strong>{createdEmail}</strong> they can sign in at{" "}
            <code className="text-xs">/admin/login</code> with the temporary
            password{" "}
            <code className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100">
              welkom123
            </code>
            . The site will force them to choose a new one immediately.
          </p>
        </div>
      )}
    </form>
  );
}
