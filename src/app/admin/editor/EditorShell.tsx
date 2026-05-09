"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  publishChanges,
  discardDrafts,
  setEditorPreview,
  saveEdit,
} from "./actions";
import { VersionSidebar } from "./VersionSidebar";
import { UltraPanel } from "./UltraPanel";
import { ProfessionalPanel } from "./ProfessionalPanel";
import { PreviewFrame } from "./PreviewFrame";
import type {
  SiteVersion,
  SiteActionLogRow,
  SiteUltraConfig,
} from "@/lib/editor/types";

type Tab = "professional" | "ultra";
type Device = "desktop" | "tablet" | "mobile";

const DEVICE_WIDTHS: Record<Device, number> = {
  desktop: 1280,
  tablet: 820,
  mobile: 414,
};

export function EditorShell({
  versions,
  actions,
  ultra,
  admins,
  draftPendingCount,
}: {
  versions: SiteVersion[];
  actions: SiteActionLogRow[];
  ultra: SiteUltraConfig | null;
  admins: { user_id: string; email: string }[];
  draftPendingCount: number;
}) {
  const [tab, setTab] = useState<Tab>("professional");
  const [device, setDevice] = useState<Device>("desktop");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(draftPendingCount);
  const [iframeKey, setIframeKey] = useState(0);
  const [selected, setSelected] = useState<{ targetKey: string; prop: string } | null>(
    null,
  );

  // Listen to messages from the iframe (overlay).
  useEffect(() => {
    function onMsg(e: MessageEvent) {
      if (!e.data || e.data.source !== "haven-editor") return;
      if (e.data.type === "saved") {
        setPendingCount((n) => n + 1);
        setInfo("Saved (draft)");
        setTimeout(() => setInfo(null), 1800);
      }
      if (e.data.type === "openPanel") {
        setSelected({ targetKey: e.data.targetKey, prop: e.data.prop });
      }
      if (e.data.type === "exit") {
        setIframeKey((k) => k + 1);
      }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  function refreshPreview() {
    setIframeKey((k) => k + 1);
  }

  function doPublish() {
    const description = prompt(
      "Short description for this version (e.g. 'Updated hero copy'):",
      "Published changes",
    );
    if (description === null) return;
    const label = prompt(
      "Optional label (leave blank for none):",
      "",
    );
    setError(null);
    startTransition(async () => {
      const result = await publishChanges(label?.trim() || null, description.trim() || "Published changes");
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setPendingCount(0);
      setInfo("Published 🎉");
      setTimeout(() => setInfo(null), 2400);
      refreshPreview();
    });
  }

  function doDiscard() {
    if (!confirm("Discard all draft changes? This cannot be undone (but published versions are kept).")) return;
    setError(null);
    startTransition(async () => {
      const result = await discardDrafts();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setPendingCount(0);
      setInfo("Drafts discarded");
      setTimeout(() => setInfo(null), 1800);
      refreshPreview();
    });
  }

  async function doExit() {
    await setEditorPreview(false);
    window.location.href = "/admin";
  }

  async function applyEditorEdit(
    targetKey: string,
    prop: string,
    value: unknown,
    changeType: "text" | "image" | "color" | "visibility" | "layout",
    description: string,
  ) {
    setError(null);
    const r = await saveEdit(targetKey, prop, value, changeType, description);
    if (!r.ok) {
      setError(r.error);
      return false;
    }
    setPendingCount((n) => n + 1);
    refreshPreview();
    return true;
  }

  const previewWidth = DEVICE_WIDTHS[device];

  // --- aggregate stats for the panel header ---
  const stats = useMemo(
    () => ({
      versions: versions.length,
      actions: actions.length,
      pending: pendingCount,
    }),
    [versions.length, actions.length, pendingCount],
  );

  return (
    <div className="h-[calc(100vh-65px)] flex flex-col bg-neutral-100 dark:bg-neutral-950">
      {/* Top bar */}
      <div className="h-12 px-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setSidebarOpen((o) => !o)}
          className="px-2.5 py-1.5 rounded-md text-xs border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
        >
          {sidebarOpen ? "◀ Hide history" : "▶ Show history"}
        </button>

        <div className="h-5 border-l border-neutral-300 dark:border-neutral-700 mx-1" />

        <div className="inline-flex rounded-md border border-neutral-300 dark:border-neutral-700 overflow-hidden">
          <button
            onClick={() => setTab("professional")}
            type="button"
            className={`px-3 py-1.5 text-xs ${
              tab === "professional"
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "hover:bg-neutral-50 dark:hover:bg-neutral-800"
            }`}
          >
            Professional
          </button>
          <button
            onClick={() => setTab("ultra")}
            type="button"
            className={`px-3 py-1.5 text-xs border-l border-neutral-300 dark:border-neutral-700 ${
              tab === "ultra"
                ? "bg-amber-500 text-white"
                : "hover:bg-neutral-50 dark:hover:bg-neutral-800"
            }`}
          >
            Ultra-Professional
          </button>
        </div>

        <div className="h-5 border-l border-neutral-300 dark:border-neutral-700 mx-1" />

        <div className="inline-flex rounded-md border border-neutral-300 dark:border-neutral-700 overflow-hidden text-xs">
          {(["desktop", "tablet", "mobile"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDevice(d)}
              type="button"
              className={`px-2.5 py-1.5 capitalize border-l first:border-l-0 border-neutral-300 dark:border-neutral-700 ${
                device === d
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "hover:bg-neutral-50 dark:hover:bg-neutral-800"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          {stats.versions} versions · {stats.actions} actions
        </span>

        {info ? <span className="text-xs text-emerald-600">✓ {info}</span> : null}
        {error ? <span className="text-xs text-red-600 max-w-[260px] truncate">{error}</span> : null}
        {pending ? <span className="text-xs text-neutral-500">working…</span> : null}

        {pendingCount > 0 ? (
          <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-amber-100 text-amber-800">
            {pendingCount} draft change{pendingCount === 1 ? "" : "s"}
          </span>
        ) : null}

        <button
          type="button"
          onClick={refreshPreview}
          className="px-2.5 py-1.5 rounded-md text-xs border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
        >
          ↻
        </button>

        <button
          type="button"
          onClick={doDiscard}
          disabled={pending || pendingCount === 0}
          className="px-3 py-1.5 rounded-md text-xs border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50"
        >
          Discard
        </button>
        <button
          type="button"
          onClick={doPublish}
          disabled={pending || pendingCount === 0}
          className="px-3 py-1.5 rounded-md text-xs bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          Publish
        </button>
        <button
          type="button"
          onClick={doExit}
          className="px-3 py-1.5 rounded-md text-xs border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
        >
          Exit
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {sidebarOpen ? (
          <VersionSidebar
            versions={versions}
            actions={actions}
            admins={admins}
            onChanged={refreshPreview}
          />
        ) : null}

        {/* Preview area */}
        <div className="flex-1 relative overflow-auto bg-neutral-200 dark:bg-neutral-950 grid place-items-start justify-center p-6">
          <div
            className="bg-white shadow-xl rounded-lg overflow-hidden transition-all"
            style={{ width: previewWidth, maxWidth: "100%" }}
          >
            <PreviewFrame iframeKey={iframeKey} />
          </div>
        </div>

        {/* Right panel */}
        <aside className="w-[340px] flex-shrink-0 border-l border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-y-auto">
          {tab === "professional" ? (
            <ProfessionalPanel
              selected={selected}
              onApply={applyEditorEdit}
              onClearSelection={() => setSelected(null)}
            />
          ) : (
            <UltraPanel ultra={ultra} onChanged={refreshPreview} />
          )}
        </aside>
      </div>
    </div>
  );
}
