"use client";

// "Connect Airbnb" guided panel for /admin/settings.
//
// Airbnb has no public OAuth for hosts, so a true 1-click connect is not
// possible. This card is the closest realistic version: a single
// "Connect with Airbnb" button + a 4-step wizard per unit (open Airbnb,
// paste their export URL, copy ours, open Airbnb's import screen).

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setUnitAirbnbIcal } from "./actions";

type UnitRow = {
  id: string;
  name: string;
  property_name: string;
  airbnb_ical_url: string | null;
};

const AIRBNB_HOSTING_URL = "https://www.airbnb.com/hosting/listings";
const AIRBNB_HELP_URL =
  "https://www.airbnb.com/help/article/99/syncing-calendars";

export function AirbnbConnectCard({ units }: { units: UnitRow[] }) {
  const [openUnitId, setOpenUnitId] = useState<string | null>(null);

  const connectedCount = units.filter((u) => u.airbnb_ical_url).length;

  return (
    <section className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-medium flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-rose-500" />
            Calendar sync · Airbnb
          </h2>
          <p className="text-sm text-neutral-500 mt-1 leading-relaxed max-w-2xl">
            Two-way sync via iCal feeds. A reservation made on Airbnb shows
            up here within an hour; one made here shows up on Airbnb within a
            few hours. {connectedCount} of {units.length} units are connected.
          </p>
        </div>
        <a
          href={AIRBNB_HOSTING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium transition shadow-sm"
        >
          Connect with Airbnb
          <span aria-hidden>↗</span>
        </a>
      </header>

      <p className="text-xs text-neutral-500 -mt-3">
        <em>Note:</em> Airbnb doesn&apos;t offer &ldquo;Login with
        Airbnb&rdquo; for individual hosts — only certified channel-manager
        partners can use their API. The button above opens your Airbnb
        hosting dashboard in a new tab; the wizard below walks you through
        the iCal paste-back.
      </p>

      <div className="space-y-3">
        {units.map((u) => (
          <UnitConnectRow
            key={u.id}
            unit={u}
            open={openUnitId === u.id}
            onToggle={() =>
              setOpenUnitId((prev) => (prev === u.id ? null : u.id))
            }
          />
        ))}

        {/* Catch-all CTA for spinning up a brand new residence — its unit
            will appear in this list automatically and gets its own Airbnb
            connect wizard. */}
        <Link
          href="/admin/properties/new"
          className="flex items-center justify-center gap-2 w-full p-4 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-700 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:border-neutral-400 dark:hover:border-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition"
        >
          <span
            aria-hidden
            className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-base font-light leading-none"
          >
            +
          </span>
          <span>Add another residence</span>
        </Link>
      </div>

      <p className="text-xs text-neutral-500">
        Need help on Airbnb&apos;s side? See{" "}
        <a
          href={AIRBNB_HELP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          Airbnb&apos;s calendar-sync help article
        </a>
        .
      </p>
    </section>
  );
}

function UnitConnectRow({
  unit,
  open,
  onToggle,
}: {
  unit: UnitRow;
  open: boolean;
  onToggle: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [airbnbUrl, setAirbnbUrl] = useState(unit.airbnb_ical_url ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const ourFeedUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/ical/${unit.id}.ics`
      : `/api/ical/${unit.id}.ics`;

  const isConnected = !!unit.airbnb_ical_url;

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await setUnitAirbnbIcal(unit.id, airbnbUrl);
      if (result.ok) {
        setSaved(true);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  async function copyOurUrl() {
    try {
      await navigator.clipboard.writeText(ourFeedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  }

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-neutral-100 dark:hover:bg-neutral-900 transition"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold ${
              isConnected
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
            }`}
            aria-hidden
          >
            {isConnected ? "✓" : "!"}
          </span>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{unit.property_name} · {unit.name}</p>
            <p className="text-xs text-neutral-500 truncate">
              {isConnected
                ? "Connected — Airbnb bookings sync into the public calendar."
                : "Not connected yet."}
            </p>
          </div>
        </div>
        <span className="text-xs text-neutral-500 shrink-0">
          {open ? "Hide" : "Setup"} ▾
        </span>
      </button>

      {open && (
        <div className="border-t border-neutral-200 dark:border-neutral-800 p-5 space-y-6 bg-white dark:bg-neutral-950">
          <Step n={1} title="Open Airbnb hosting">
            <a
              href={AIRBNB_HOSTING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium transition"
            >
              Open Airbnb in a new tab ↗
            </a>
            <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
              Sign in with your Airbnb account, pick the listing for{" "}
              <strong>{unit.property_name} · {unit.name}</strong>, then go to{" "}
              <em>Calendar → Availability → Sync calendars → Export</em> and
              copy the iCal URL.
            </p>
          </Step>

          <Step n={2} title="Paste Airbnb's URL here">
            <div className="flex gap-2 flex-wrap">
              <input
                type="url"
                value={airbnbUrl}
                onChange={(e) => setAirbnbUrl(e.target.value)}
                placeholder="https://www.airbnb.com/calendar/ical/…"
                className="flex-1 min-w-0 px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
              />
              <button
                type="button"
                onClick={save}
                disabled={pending}
                className="px-4 py-3 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium hover:opacity-90 transition disabled:opacity-50 whitespace-nowrap"
              >
                {pending ? "Saving…" : "Save"}
              </button>
            </div>
            {error && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                {error}
              </p>
            )}
            {saved && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                Saved. Bookings on Airbnb will appear here within the hour.
              </p>
            )}
          </Step>

          <Step n={3} title="Copy our feed URL">
            <div className="flex gap-2 flex-wrap">
              <input
                readOnly
                value={ourFeedUrl}
                onClick={(e) => (e.currentTarget as HTMLInputElement).select()}
                className="flex-1 min-w-0 px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 text-xs font-mono cursor-pointer"
              />
              <button
                type="button"
                onClick={copyOurUrl}
                className="px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-900 transition whitespace-nowrap"
              >
                {copied ? "Copied ✓" : "Copy URL"}
              </button>
            </div>
          </Step>

          <Step n={4} title="Import on Airbnb">
            <a
              href={AIRBNB_HOSTING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium transition"
            >
              Back to Airbnb ↗
            </a>
            <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
              In the same listing, go to{" "}
              <em>Calendar → Availability → Sync calendars → Import</em> →{" "}
              <em>Import calendar</em>. Paste the URL above and name it{" "}
              <code className="px-1 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-xs">
                Haven Residences website
              </code>
              .
            </p>
          </Step>
        </div>
      )}
    </div>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-800 text-xs font-semibold flex items-center justify-center">
        {n}
      </span>
      <div className="flex-1 min-w-0 space-y-2">
        <p className="text-sm font-medium">{title}</p>
        {children}
      </div>
    </div>
  );
}
