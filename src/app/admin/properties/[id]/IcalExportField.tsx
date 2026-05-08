"use client";

// Small read-only field showing this unit's outbound iCal feed URL with a
// copy-to-clipboard button. The owner pastes this URL into Airbnb →
// Listing → Calendar → Sync calendars → Import calendar so reservations
// made on havenresidencescuracao.com block dates on Airbnb.

import { useState } from "react";

export function IcalExportField({ unitId }: { unitId: string }) {
  const [copied, setCopied] = useState(false);
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/ical/${unitId}.ics`
      : `/api/ical/${unitId}.ics`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore — fall back to manual select
    }
  }

  return (
    <div>
      <span className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">
        Our iCal feed (give this to Airbnb)
      </span>
      <div className="flex gap-2">
        <input
          readOnly
          value={url}
          onClick={(e) => (e.currentTarget as HTMLInputElement).select()}
          className="flex-1 min-w-0 px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 text-xs font-mono cursor-pointer"
        />
        <button
          type="button"
          onClick={copy}
          className="px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-900 transition whitespace-nowrap"
        >
          {copied ? "Copied ✓" : "Copy URL"}
        </button>
      </div>
      <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
        Paste this URL in Airbnb → Listing → <em>Availability</em> →
        <em> Sync calendars</em> → <em>Import calendar</em>. Airbnb refetches
        every few hours, so reservations made here will show up there
        automatically.
      </p>
    </div>
  );
}
