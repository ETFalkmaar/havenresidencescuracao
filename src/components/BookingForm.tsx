"use client";

import { useMemo, useState, useTransition } from "react";
import { DayPicker, type DateRange, type Matcher } from "react-day-picker";
import "react-day-picker/style.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { calculatePrice, type StayType, type Season, type UnitForPricing } from "@/lib/pricing";
import { formatEur } from "@/lib/format";
import { createBooking } from "@/app/actions/bookings";

type Unit = UnitForPricing & {
  id: string;
  max_guests: number;
};

type BlockedRange = { check_in: string; check_out: string };

type SignedInUser = {
  email: string;
  fullName: string | null;
  phone: string | null;
} | null;

export function BookingForm({
  unit,
  seasons,
  blocked,
  signedInUser,
  accent,
  propertySlug,
  locale,
}: {
  unit: Unit;
  seasons: Season[];
  blocked: BlockedRange[];
  signedInUser: SignedInUser;
  accent: string;
  propertySlug: string;
  locale: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{ reference: string } | null>(
    null,
  );

  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [guests, setGuests] = useState(2);
  const [stayPref, setStayPref] = useState<"auto" | "short" | "long">("auto");
  const [name, setName] = useState(signedInUser?.fullName ?? "");
  const [phone, setPhone] = useState(signedInUser?.phone ?? "");
  const [notes, setNotes] = useState("");

  // react-day-picker disabled matcher
  const disabledMatchers = useMemo<Matcher[]>(() => {
    const past: Matcher = { before: new Date(new Date().setHours(0, 0, 0, 0)) };
    const ranges: Matcher[] = blocked.map((b) => ({
      from: new Date(b.check_in + "T00:00:00"),
      to: addDays(new Date(b.check_out + "T00:00:00"), -1),
    }));
    return [past, ...ranges];
  }, [blocked]);

  function addDays(d: Date, n: number) {
    const copy = new Date(d);
    copy.setDate(copy.getDate() + n);
    return copy;
  }

  // Auto-decide stay type based on length
  const computedStayType: StayType = useMemo(() => {
    if (stayPref !== "auto") return stayPref;
    if (!range?.from || !range?.to) return "short";
    const months =
      (range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return months >= unit.min_long_stay_months &&
      unit.long_stay_monthly_price_eur !== null
      ? "long"
      : "short";
  }, [stayPref, range, unit.min_long_stay_months, unit.long_stay_monthly_price_eur]);

  const breakdown = useMemo(() => {
    if (!range?.from || !range?.to) return null;
    return calculatePrice(unit, seasons, range.from, range.to, computedStayType);
  }, [unit, seasons, range, computedStayType]);

  // Format YYYY-MM-DD using LOCAL date components. Date.toISOString() would
  // serialize via UTC which silently shifts the calendar day for any timezone
  // east of UTC — e.g. picking June 15 in CEST stored as June 14.
  function isoDate(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function submit() {
    setError(null);
    if (!signedInUser) {
      router.push(`/login?next=${encodeURIComponent("/" + propertySlug)}`);
      return;
    }
    if (!range?.from || !range?.to) {
      setError("Pick check-in and check-out dates.");
      return;
    }
    if (!name.trim()) {
      setError("Please enter the name for the booking.");
      return;
    }
    if (guests < 1 || guests > unit.max_guests) {
      setError(`Guests must be between 1 and ${unit.max_guests}.`);
      return;
    }
    startTransition(async () => {
      const result = await createBooking({
        unitId: unit.id,
        checkIn: isoDate(range.from!),
        checkOut: isoDate(range.to!),
        numGuests: guests,
        stayType: computedStayType,
        guestName: name.trim(),
        guestPhone: phone.trim() || null,
        notes: notes.trim() || null,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setConfirmation({ reference: result.reference });
    });
  }

  // Stable booking style override for react-day-picker
  const dpStyle = `
    .rdp-root { --rdp-accent-color: ${accent}; --rdp-accent-background-color: ${accent}33; }
    .rdp-day_button:hover:not([disabled]) { background-color: ${accent}22; }
    .rdp-selected .rdp-day_button { background-color: ${accent} !important; color: white; border-color: ${accent}; }
    .rdp-range_middle .rdp-day_button { background-color: ${accent}33 !important; }
    .rdp-range_start .rdp-day_button, .rdp-range_end .rdp-day_button { background-color: ${accent} !important; color: white; }
  `;

  if (confirmation) {
    return (
      <div
        className="rounded-xl border p-8 text-center space-y-4 bg-white/60 dark:bg-neutral-950/60 backdrop-blur"
        style={{ borderColor: accent }}
      >
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
          Booking received
        </p>
        <h3 className="text-2xl font-light">Thank you{name ? `, ${name.split(" ")[0]}` : ""}.</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-md mx-auto">
          Your reservation reference is{" "}
          <span className="font-mono font-medium">{confirmation.reference}</span>
          . We&apos;ve recorded the request and a host will confirm by email
          within 24 hours. You can check status under{" "}
          <Link href="/account" className="underline">
            My stays
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <style dangerouslySetInnerHTML={{ __html: dpStyle }} />

      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 space-y-5">
        <p className="text-xs uppercase tracking-widest text-neutral-500">
          Pick your dates
        </p>
        <DayPicker
          mode="range"
          selected={range}
          onSelect={setRange}
          numberOfMonths={2}
          disabled={disabledMatchers}
          showOutsideDays={false}
          className="text-sm"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4 space-y-3">
          <label className="block text-xs uppercase tracking-widest text-neutral-500">
            Guests
          </label>
          <input
            type="number"
            min={1}
            max={unit.max_guests}
            value={guests}
            onChange={(e) => setGuests(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
          />
          <p className="text-xs text-neutral-500">Max {unit.max_guests}</p>
        </div>

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4 space-y-3">
          <label className="block text-xs uppercase tracking-widest text-neutral-500">
            Stay type
          </label>
          <select
            value={stayPref}
            onChange={(e) => setStayPref(e.target.value as "auto" | "short" | "long")}
            className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
          >
            <option value="auto">Auto (best fit)</option>
            <option value="short">Short stay (per night)</option>
            <option value="long">
              Long stay ({unit.min_long_stay_months}+ months)
            </option>
          </select>
        </div>
      </div>

      {breakdown && (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 space-y-3">
          <p className="text-xs uppercase tracking-widest text-neutral-500">
            Price breakdown
          </p>
          <ul className="text-sm space-y-1.5 text-neutral-700 dark:text-neutral-300">
            {breakdown.stay_type === "long" ? (
              <li className="flex justify-between">
                <span>
                  {breakdown.months} months ×{" "}
                  {formatEur(breakdown.per_month ?? 0, locale)}
                </span>
                <span>{formatEur(breakdown.subtotal, locale)}</span>
              </li>
            ) : (
              <li className="flex justify-between">
                <span>
                  {breakdown.nights} night{breakdown.nights === 1 ? "" : "s"}{" "}
                  (avg {formatEur(breakdown.per_night, locale)})
                </span>
                <span>{formatEur(breakdown.subtotal, locale)}</span>
              </li>
            )}
            <li className="flex justify-between text-neutral-500">
              <span>Cleaning fee</span>
              <span>{formatEur(breakdown.cleaning_fee, locale)}</span>
            </li>
          </ul>
          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-900 flex justify-between text-sm font-medium">
            <span>Total</span>
            <span>{formatEur(breakdown.total, locale)}</span>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 space-y-4">
        <p className="text-xs uppercase tracking-widest text-neutral-500">
          Booking details
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
          />
          <input
            placeholder="Phone (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
          />
        </div>
        <textarea
          rows={3}
          placeholder="Anything we should know? (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 resize-y"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={pending || !range?.from || !range?.to}
          className="px-6 py-3 rounded-lg text-white text-sm font-medium tracking-wide hover:opacity-90 transition disabled:opacity-50"
          style={{ backgroundColor: accent }}
        >
          {pending
            ? "Booking…"
            : signedInUser
              ? "Confirm booking"
              : "Sign in to book"}
        </button>
        {!signedInUser && (
          <p className="text-xs text-neutral-500">
            You&apos;ll be sent to sign in, then back here to confirm.
          </p>
        )}
      </div>
    </div>
  );
}
