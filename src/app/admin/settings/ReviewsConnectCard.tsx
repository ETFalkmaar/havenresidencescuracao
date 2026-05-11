"use client";

import { useState, useTransition } from "react";
import {
  connectExternalReviews,
  syncExternalReviews,
  disconnectExternalReviews,
} from "./actions";

type ConnectionStatus = {
  source: "trustpilot" | "google";
  rating: number | null;
  total_reviews: number | null;
  last_synced_at: string | null;
  last_sync_error: string | null;
};

export function ReviewsConnectCard({
  trustpilotBusinessUnit,
  hasTrustpilotKey,
  googlePlaceId,
  hasGoogleKey,
  statuses,
}: {
  trustpilotBusinessUnit: string | null;
  hasTrustpilotKey: boolean;
  googlePlaceId: string | null;
  hasGoogleKey: boolean;
  statuses: ConnectionStatus[];
}) {
  const tpStatus = statuses.find((s) => s.source === "trustpilot");
  const gStatus = statuses.find((s) => s.source === "google");

  return (
    <section className="rounded-3xl bg-white border border-black/5 shadow-pill p-6 md:p-8">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h2 className="font-display font-semibold text-2xl text-ink">
            Review integrations
          </h2>
          <p className="text-sm text-ink-mute mt-1 max-w-xl">
            Connect Trustpilot or Google so the latest rating and reviews
            appear automatically on the public site. We never publish anything
            until you connect.
          </p>
        </div>
        <RefreshButton />
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <ConnectCard
          source="trustpilot"
          title="Trustpilot"
          accent="bg-emerald-500"
          businessUnitOrPlaceId={trustpilotBusinessUnit}
          hasKey={hasTrustpilotKey}
          status={tpStatus}
          fields={[
            {
              name: "trustpilot_business_unit",
              label: "Business unit (domain)",
              placeholder: "havenresidencescuracao.com",
              defaultValue: trustpilotBusinessUnit ?? "",
              help: "Open your Trustpilot profile page — the part after trustpilot.com/review/ is your slug.",
            },
            {
              name: "trustpilot_api_key",
              label: "API key (server-only)",
              placeholder: hasKey(hasTrustpilotKey)
                ? "•••••••••• (saved)"
                : "Paste your Trustpilot API key",
              defaultValue: "",
              type: "password",
              help: "Generate at business.trustpilot.com → Integrations → API access.",
            },
          ]}
        />

        <ConnectCard
          source="google"
          title="Google Reviews"
          accent="bg-blue-500"
          businessUnitOrPlaceId={googlePlaceId}
          hasKey={hasGoogleKey}
          status={gStatus}
          fields={[
            {
              name: "google_place_id",
              label: "Google Place ID",
              placeholder: "ChIJ...",
              defaultValue: googlePlaceId ?? "",
              help: "Find your Place ID at developers.google.com/maps/documentation/places/web-service/place-id.",
            },
            {
              name: "google_api_key",
              label: "Google Maps API key (server-only)",
              placeholder: hasKey(hasGoogleKey)
                ? "•••••••••• (saved)"
                : "Paste your Maps API key",
              defaultValue: "",
              type: "password",
              help: "Create at Google Cloud Console → APIs → Credentials. Enable the Places API.",
            },
          ]}
        />
      </div>
    </section>
  );
}

function hasKey(v: boolean) {
  return v;
}

function RefreshButton() {
  const [pending, start] = useTransition();
  const [info, setInfo] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  return (
    <div className="flex items-center gap-3">
      {info && (
        <span
          className={`text-xs ${info.kind === "ok" ? "text-emerald-600" : "text-rose-600"}`}
        >
          {info.msg}
        </span>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setInfo(null);
          start(async () => {
            const res = await syncExternalReviews();
            setInfo(
              res.ok
                ? { kind: "ok", msg: "Refreshed ✓" }
                : { kind: "err", msg: res.error },
            );
            setTimeout(() => setInfo(null), 4000);
          });
        }}
        className="px-4 py-2 rounded-full bg-paper-warm hover:bg-paper-tint border border-black/5 text-[13px] font-medium text-ink transition disabled:opacity-50"
      >
        {pending ? "Refreshing…" : "Refresh now"}
      </button>
    </div>
  );
}

function ConnectCard({
  source,
  title,
  accent,
  businessUnitOrPlaceId,
  hasKey,
  status,
  fields,
}: {
  source: "trustpilot" | "google";
  title: string;
  accent: string;
  businessUnitOrPlaceId: string | null;
  hasKey: boolean;
  status: ConnectionStatus | undefined;
  fields: {
    name: string;
    label: string;
    placeholder: string;
    defaultValue: string;
    type?: string;
    help?: string;
  }[];
}) {
  const [pending, start] = useTransition();
  const [info, setInfo] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  const connected =
    !!businessUnitOrPlaceId && hasKey && !!status && !status.last_sync_error;

  return (
    <div className="rounded-2xl border border-black/5 bg-paper-tint p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <span
            className={`h-9 w-9 rounded-full ${accent} text-white inline-flex items-center justify-center text-sm font-semibold`}
          >
            {title.charAt(0)}
          </span>
          <div>
            <p className="font-display font-semibold text-ink">{title}</p>
            <p
              className={`text-xs ${
                connected ? "text-emerald-600" : "text-ink-mute"
              }`}
            >
              {connected
                ? `Connected · ${status?.rating?.toFixed(1) ?? "—"} / 5 (${status?.total_reviews ?? 0} reviews)`
                : status?.last_sync_error
                  ? "Connection error"
                  : "Not connected"}
            </p>
          </div>
        </div>
        {connected && (
          <DisconnectButton source={source} />
        )}
      </div>

      {status?.last_sync_error && (
        <div className="mb-4 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
          {status.last_sync_error}
        </div>
      )}

      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          setInfo(null);
          start(async () => {
            const res = await connectExternalReviews(fd);
            setInfo(
              res.ok
                ? { kind: "ok", msg: "Connected and synced ✓" }
                : { kind: "err", msg: res.error },
            );
            setTimeout(() => setInfo(null), 5000);
          });
        }}
      >
        {fields.map((f) => (
          <label key={f.name} className="block">
            <span className="text-[11px] uppercase tracking-widest text-ink-mute">
              {f.label}
            </span>
            <input
              name={f.name}
              type={f.type ?? "text"}
              defaultValue={f.defaultValue}
              placeholder={f.placeholder}
              autoComplete="off"
              className="mt-1 w-full px-3 py-2 rounded-lg bg-white border border-black/10 focus:border-ink/40 outline-none text-[14px]"
            />
            {f.help && (
              <span className="block text-[11px] text-ink-mute mt-1 leading-snug">
                {f.help}
              </span>
            )}
          </label>
        ))}

        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center px-5 py-2 rounded-full bg-ink text-white text-[13px] font-medium hover:bg-ink-soft transition disabled:opacity-50"
          >
            {pending ? "Connecting…" : connected ? "Update & resync" : "Connect"}
          </button>
          {info && (
            <span
              className={`text-xs ${info.kind === "ok" ? "text-emerald-600" : "text-rose-600"}`}
            >
              {info.msg}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

function DisconnectButton({ source }: { source: "trustpilot" | "google" }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Disconnect ${source}? The reviews will disappear from the public site.`)) {
          return;
        }
        start(async () => {
          await disconnectExternalReviews(source);
        });
      }}
      className="text-xs text-ink-mute hover:text-rose-600 transition"
    >
      {pending ? "Disconnecting…" : "Disconnect"}
    </button>
  );
}
