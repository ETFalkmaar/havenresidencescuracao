// Public iCal feed of a unit's confirmed/pending bookings, formatted for
// Airbnb / Booking.com / VRBO calendar import. The owner pastes this URL
// into Airbnb so any reservation made on havenresidencescuracao.com
// automatically blocks the dates on Airbnb.
//
// Path parameter is the unit UUID (predictable but not enumerable). Only
// dates and a generic "Reserved" summary are exported — guest names,
// emails and references stay private.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function fmtDate(d: string): string {
  // "YYYY-MM-DD" → "YYYYMMDD"
  return d.replace(/-/g, "");
}

function fmtUTC(d: Date): string {
  // "YYYYMMDDTHHmmssZ"
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

function escapeIcal(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    s,
  );
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ unitId: string }> },
) {
  const { unitId: raw } = await ctx.params;
  const unitId = raw.replace(/\.ics$/i, "");
  if (!isUuid(unitId)) {
    return new NextResponse("Invalid unit id", { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return new NextResponse("Server misconfigured", { status: 500 });
  }

  const supa = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: unit } = await supa
    .from("units")
    .select("id, name, slug")
    .eq("id", unitId)
    .maybeSingle();

  if (!unit) {
    return new NextResponse("Unit not found", { status: 404 });
  }

  // Only confirmed/pending/completed bookings count as blocking the calendar.
  // We deliberately do NOT include external_blocked_dates so that imported
  // Airbnb dates aren't echoed back to Airbnb, which would otherwise create
  // a sync loop.
  const { data: bookings } = await supa
    .from("bookings")
    .select("id, check_in, check_out, status")
    .eq("unit_id", unit.id)
    .in("status", ["pending", "confirmed", "completed"]);

  const dtstamp = fmtUTC(new Date());

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Haven Residence Curacao//Bookings//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcal(unit.name)} — Bookings`,
    "X-WR-TIMEZONE:UTC",
  ];

  for (const b of bookings ?? []) {
    const status =
      b.status === "pending" ? "TENTATIVE" : "CONFIRMED";
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:booking-${b.id}@havenresidencescuracao.com`);
    lines.push(`DTSTAMP:${dtstamp}`);
    lines.push(`DTSTART;VALUE=DATE:${fmtDate(b.check_in)}`);
    lines.push(`DTEND;VALUE=DATE:${fmtDate(b.check_out)}`);
    lines.push("SUMMARY:Reserved");
    lines.push(`STATUS:${status}`);
    lines.push("TRANSP:OPAQUE");
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");

  // RFC 5545 requires CRLF line endings.
  const body = lines.join("\r\n") + "\r\n";

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="${unit.slug}.ics"`,
      // Short cache so changes appear quickly on Airbnb (Airbnb itself only
      // re-fetches every few hours, so this is mostly a CDN hint).
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
