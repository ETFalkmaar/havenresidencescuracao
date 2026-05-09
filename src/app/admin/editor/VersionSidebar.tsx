"use client";

import { useMemo, useState, useTransition } from "react";
import {
  pinVersion,
  restoreVersion,
  setVersionNote,
} from "./actions";
import type { SiteVersion, SiteActionLogRow } from "@/lib/editor/types";

type Tab = "actions" | "versions";

const CHANGE_TYPES: Array<{ key: string; label: string }> = [
  { key: "all", label: "All types" },
  { key: "text", label: "Text" },
  { key: "image", label: "Images" },
  { key: "color", label: "Colors" },
  { key: "layout", label: "Layout" },
  { key: "visibility", label: "Visibility" },
  { key: "css", label: "Custom CSS" },
  { key: "js", label: "Custom JS" },
  { key: "publish", label: "Publish" },
  { key: "restore", label: "Restore" },
];

export function VersionSidebar({
  versions,
  actions,
  admins,
  onChanged,
}: {
  versions: SiteVersion[];
  actions: SiteActionLogRow[];
  admins: { user_id: string; email: string }[];
  onChanged: () => void;
}) {
  const [tab, setTab] = useState<Tab>("actions");
  const [adminFilter, setAdminFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [, startTransition] = useTransition();
  const [activeVersion, setActiveVersion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const adminEmailById = useMemo(() => {
    const m: Record<string, string> = {};
    for (const a of admins) m[a.user_id] = a.email;
    return m;
  }, [admins]);

  const filteredActions = useMemo(() => {
    return actions.filter((a) => {
      if (adminFilter !== "all" && a.performed_by !== adminFilter) return false;
      if (typeFilter !== "all" && a.change_type !== typeFilter) return false;
      if (date) {
        const d = new Date(a.performed_at).toISOString().slice(0, 10);
        if (d !== date) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        if (
          !a.description.toLowerCase().includes(q) &&
          !(a.target_key ?? "").toLowerCase().includes(q) &&
          !(a.performed_by_email ?? "").toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [actions, adminFilter, typeFilter, date, search]);

  const filteredVersions = useMemo(() => {
    return versions.filter((v) => {
      if (adminFilter !== "all" && v.created_by !== adminFilter) return false;
      if (typeFilter !== "all" && v.change_type !== typeFilter) return false;
      if (date) {
        const d = new Date(v.created_at).toISOString().slice(0, 10);
        if (d !== date) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        if (
          !v.description.toLowerCase().includes(q) &&
          !(v.label ?? "").toLowerCase().includes(q) &&
          !(v.notes ?? "").toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [versions, adminFilter, typeFilter, date, search]);

  function handleRestore(v: SiteVersion) {
    if (!confirm(`Restore "${v.label ?? v.description}" into the current draft?\nYou'll still need to Publish for it to go live.`))
      return;
    setError(null);
    startTransition(async () => {
      const r = await restoreVersion(v.id);
      if (!r.ok) setError(r.error);
      else onChanged();
    });
  }

  function handlePin(v: SiteVersion) {
    setError(null);
    startTransition(async () => {
      const r = await pinVersion(v.id, !v.is_pinned);
      if (!r.ok) setError(r.error);
    });
  }

  function handleNote(v: SiteVersion) {
    const notes = prompt("Notes for this version:", v.notes ?? "");
    if (notes === null) return;
    const label = prompt("Optional label:", v.label ?? "");
    if (label === null) return;
    setError(null);
    startTransition(async () => {
      const r = await setVersionNote(v.id, notes, label.trim() || null);
      if (!r.ok) setError(r.error);
    });
  }

  return (
    <aside className="w-[330px] flex-shrink-0 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800">
        <button
          onClick={() => setTab("actions")}
          className={`flex-1 py-2.5 text-xs font-medium ${
            tab === "actions"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
          }`}
        >
          Activity timeline ({actions.length})
        </button>
        <button
          onClick={() => setTab("versions")}
          className={`flex-1 py-2.5 text-xs font-medium ${
            tab === "versions"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
          }`}
        >
          Versions ({versions.length})
        </button>
      </div>

      {/* Filters */}
      <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 space-y-2">
        <input
          type="text"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs px-2 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"
        />
        <div className="flex gap-2">
          <select
            value={adminFilter}
            onChange={(e) => setAdminFilter(e.target.value)}
            className="flex-1 text-xs px-2 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"
          >
            <option value="all">Any admin</option>
            {admins.map((a) => (
              <option key={a.user_id} value={a.user_id}>
                {a.email}
              </option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="flex-1 text-xs px-2 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"
          >
            {CHANGE_TYPES.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full text-xs px-2 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"
        />
      </div>

      {error ? (
        <div className="m-3 text-xs text-red-600 bg-red-50 dark:bg-red-950 p-2 rounded">
          {error}
        </div>
      ) : null}

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {tab === "actions" ? (
          filteredActions.length === 0 ? (
            <Empty label="No matching activity" />
          ) : (
            <ol className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredActions.map((a) => (
                <li key={a.id} className="px-3 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <div className="text-xs text-neutral-900 dark:text-neutral-100">
                    {a.description}
                  </div>
                  <div className="mt-0.5 text-[10px] uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 normal-case">
                      {a.change_type}
                    </span>
                    <span>
                      {formatDate(a.performed_at)}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[10px] text-neutral-500">
                    {a.performed_by_email ??
                      adminEmailById[a.performed_by ?? ""] ??
                      "(unknown)"}
                    {a.target_key ? <span className="text-neutral-400"> · {a.target_key}</span> : null}
                  </div>
                </li>
              ))}
            </ol>
          )
        ) : filteredVersions.length === 0 ? (
          <Empty label="No matching versions" />
        ) : (
          <ol className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {filteredVersions.map((v) => (
              <li
                key={v.id}
                onMouseEnter={() => setActiveVersion(v.id)}
                onMouseLeave={() => setActiveVersion((c) => (c === v.id ? null : c))}
                className={`px-3 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 ${
                  activeVersion === v.id ? "bg-neutral-50 dark:bg-neutral-800/50" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {v.label ? (
                      <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                        {v.label}
                      </div>
                    ) : null}
                    <div className="text-xs text-neutral-700 dark:text-neutral-300 truncate">
                      {v.description}
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-wider text-neutral-500">
                      {formatDate(v.created_at)}
                      {" · "}
                      {adminEmailById[v.created_by ?? ""] ?? "(unknown)"}
                      {v.snapshot?.edits ? (
                        <span className="ml-1 text-neutral-400">
                          ({v.snapshot.edits.length} edits)
                        </span>
                      ) : null}
                    </div>
                    {v.notes ? (
                      <div className="mt-1 text-[10px] italic text-neutral-500">
                        “{v.notes}”
                      </div>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePin(v)}
                    title={v.is_pinned ? "Unpin" : "Pin (never auto-clean)"}
                    className={`text-base ${
                      v.is_pinned ? "text-amber-500" : "text-neutral-300 hover:text-amber-400"
                    }`}
                  >
                    {v.is_pinned ? "★" : "☆"}
                  </button>
                </div>

                <div className="mt-2 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleRestore(v)}
                    className="text-[10px] px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    Restore
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNote(v)}
                    className="text-[10px] px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    Notes
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </aside>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="text-xs text-neutral-500 text-center py-12 px-4">
      {label}
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
