// Vercel-cron-driven Airbnb iCal sync.
//
// Cron schedule lives in vercel.json. Vercel sends an Authorization header
// with the project's CRON_SECRET; we reject anything else so the endpoint
// can't be triggered from outside.
//
// For each unit with a non-null airbnb_ical_url:
//   1. fetch the feed
//   2. parse VEVENTs
//   3. upsert into external_blocked_dates (keyed by source UID)
//   4. delete rows whose UID disappeared from the feed (= cancelled bookings)

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parseICal } from "@/lib/ical";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SyncReport = {
  unitId: string;
  unitSlug: string;
  fetched: number;
  upserted: number;
  removed: number;
  error: string | null;
};

function isAuthorized(req: Request): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return true; // local dev: allow without secret
  const header = req.headers.get("authorization");
  return header === `Bearer ${expected}`;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json(
      { ok: false, error: "missing_supabase_env" },
      { status: 500 },
    );
  }

  const supa = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: units, error: unitsErr } = await supa
    .from("units")
    .select("id, slug, airbnb_ical_url")
    .not("airbnb_ical_url", "is", null);

  if (unitsErr) {
    return NextResponse.json(
      { ok: false, error: unitsErr.message },
      { status: 500 },
    );
  }

  const report: SyncReport[] = [];
  for (const u of units ?? []) {
    const r: SyncReport = {
      unitId: u.id,
      unitSlug: u.slug,
      fetched: 0,
      upserted: 0,
      removed: 0,
      error: null,
    };
    try {
      const res = await fetch(u.airbnb_ical_url as string, {
        cache: "no-store",
        headers: { "User-Agent": "HavenResidence-iCal-Sync/1.0" },
      });
      if (!res.ok) {
        r.error = `fetch_failed_${res.status}`;
        report.push(r);
        continue;
      }
      const text = await res.text();
      const events = parseICal(text);
      r.fetched = events.length;

      // Upsert each event keyed by (unit_id, source, external_uid)
      const rows = events.map((e) => ({
        unit_id: u.id,
        source: "airbnb",
        external_uid: e.uid,
        start_date: e.startDate,
        end_date: e.endDate,
        summary: e.summary,
        last_synced_at: new Date().toISOString(),
      }));
      if (rows.length > 0) {
        const { error: upErr } = await supa
          .from("external_blocked_dates")
          .upsert(rows, { onConflict: "unit_id,source,external_uid" });
        if (upErr) {
          r.error = upErr.message;
          report.push(r);
          continue;
        }
        r.upserted = rows.length;
      }

      // Remove rows for this unit whose UID is no longer in the feed
      const liveUids = new Set(events.map((e) => e.uid));
      const { data: existing } = await supa
        .from("external_blocked_dates")
        .select("id, external_uid")
        .eq("unit_id", u.id)
        .eq("source", "airbnb");

      const stale = (existing ?? []).filter((row) => !liveUids.has(row.external_uid));
      if (stale.length > 0) {
        const { error: delErr } = await supa
          .from("external_blocked_dates")
          .delete()
          .in(
            "id",
            stale.map((s) => s.id),
          );
        if (delErr) {
          r.error = delErr.message;
        } else {
          r.removed = stale.length;
        }
      }
    } catch (err) {
      r.error = err instanceof Error ? err.message : String(err);
    }
    report.push(r);
  }

  return NextResponse.json({
    ok: true,
    syncedAt: new Date().toISOString(),
    units: report,
  });
}

// Allow admin to trigger an immediate sync via POST without cron secret
// — but only when the caller is an authenticated admin.
export async function POST(req: Request) {
  // Reuse the same logic by reading auth via cookies; the GET handler
  // accepts CRON_SECRET. For simplicity we currently require CRON_SECRET
  // for both; admin manual trigger uses a server action that calls GET.
  return GET(req);
}
