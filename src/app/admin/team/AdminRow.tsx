"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { demoteAdmin } from "./actions";

type Admin = {
  user_id: string;
  email: string;
  role: string;
  password_set: boolean;
  created_at: string;
};

export function AdminRow({
  admin,
  isSelf,
}: {
  admin: Admin;
  isSelf: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function remove() {
    if (
      !confirm(
        `Remove ${admin.email} from the admin team? Their Supabase account stays — only their admin access is revoked.`,
      )
    )
      return;
    setError(null);
    startTransition(async () => {
      const result = await demoteAdmin(admin.user_id);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <li className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-medium">{admin.email}</span>
          <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400">
            {admin.role}
          </span>
          {!admin.password_set && (
            <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200">
              Pending password
            </span>
          )}
          {isSelf && (
            <span className="text-[10px] uppercase tracking-widest text-neutral-400">
              you
            </span>
          )}
        </div>
        <p className="text-xs text-neutral-500 mt-0.5">
          Added {new Date(admin.created_at).toLocaleDateString("en-GB")}
        </p>
        {error && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
        )}
      </div>
      {!isSelf && (
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          className="text-xs px-3 py-1.5 rounded-md border border-red-300 dark:border-red-900 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition disabled:opacity-50"
        >
          {pending ? "Removing…" : "Revoke"}
        </button>
      )}
    </li>
  );
}
