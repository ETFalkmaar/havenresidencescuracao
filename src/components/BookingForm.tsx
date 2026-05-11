"use client";

import { useMemo, useState, useTransition } from "react";
import { DayPicker, type DateRange, type Matcher } from "react-day-picker";
import "react-day-picker/style.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { calculatePrice, type StayType, type Season, type UnitForPricing } from "@/lib/pricing";
import { formatEur } from "@/lib/format";
import { createBooking } from "@/app/actions/bookings";
import { fmt, type Translations } from "@/lib/i18n/translations";

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
  t,
}: {
  unit: Unit;
  seasons: Season[];
  blocked: BlockedRange[];
  signedInUser: SignedInUser;
  accent: string;
  propertySlug: string;
  locale: string;
  t: Translations["booking"];
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
      setError(t.pickDatesError);
      return;
    }
    if (!name.trim()) {
      setError(t.nameRequired);
      return;
    }
    if (guests < 1 || guests > unit.max_guests) {
      setError(fmt(t.guestsRange, { n: unit.max_guests }));
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
    .rdp-root {
      --rdp-accent-color: ${accent};
      --rdp-accent-background-color: ${accent}33;
      color: #0b0b0b;
      background: transparent;
    }
    .rdp-month_caption, .rdp-caption_label, .rdp-weekday {
      color: #0b0b0b;
    }
    .rdp-weekday { color: #525252; }
    .rdp-day { color: #0b0b0b; }
    .rdp-day_button { color: #0b0b0b; }
    .rdp-day_button:hover:not([disabled]) {
      background-color: ${accent}1a;
      color: #0b0b0b;
    }
    .rdp-disabled .rdp-day_button, .rdp-day_button[disabled] {
      color: #c4c4c4;
      text-decoration: line-through;
    }
    .rdp-selected .rdp-day_button {
      background-color: ${accent} !important;
      color: white !important;
      border-color: ${accent};
    }
    .rdp-range_middle .rdp-day_button {
      background-color: ${accent}33 !important;
      color: #0b0b0b !important;
    }
    .rdp-range_start .rdp-day_button, .rdp-range_end .rdp-day_button {
      background-color: ${accent} !important;
      color: white !important;
    }
    .rdp-nav button { color: ${accent}; }
  `;

  if (confirmation) {
    return (
      <div
        className="rounded-xl border p-8 text-center space-y-4 bg-white/90 backdrop-blur"
        style={{ borderColor: accent }}
      >
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
          {t.bookingReceived}
        </p>
        <h3 className="text-2xl font-light">
          {t.thankYou}
          {name ? `, ${name.split(" ")[0]}` : ""}.
        </h3>
        <p className="text-sm text-ink-mute leading-relaxed max-w-md mx-auto">
          {t.referenceLine1}{" "}
          <span className="font-mono font-medium">{confirmation.reference}</span>
          . {t.referenceLine2}{" "}
          <Link href="/account" className="underline">
            {t.myStays}
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <style dangerouslySetInnerHTML={{ __html: dpStyle }} />

      <div className="rounded-xl border border-black/10 bg-white p-5 space-y-5">
        <p className="text-xs uppercase tracking-widest text-neutral-500">
          {t.pickDates}
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
        <div className="rounded-xl border border-black/10 bg-white p-4 space-y-3">
          <label className="block text-xs uppercase tracking-widest text-neutral-500">
            {t.guests}
          </label>
          <input
            type="number"
            min={1}
            max={unit.max_guests}
            value={guests}
            onChange={(e) => setGuests(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 rounded-lg border border-black/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
          />
          <p className="text-xs text-neutral-500">
            {t.max} {unit.max_guests}
          </p>
        </div>

        <div className="rounded-xl border border-black/10 bg-white p-4 space-y-3">
          <label className="block text-xs uppercase tracking-widest text-neutral-500">
            {t.stayType}
          </label>
          <select
            value={stayPref}
            onChange={(e) => setStayPref(e.target.value as "auto" | "short" | "long")}
            className="w-full px-3 py-2 rounded-lg border border-black/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
          >
            <option value="auto">{t.stayAuto}</option>
            <option value="short">{t.stayShort}</option>
            <option value="long">
              {fmt(t.stayLong, { n: unit.min_long_stay_months })}
            </option>
          </select>
        </div>
      </div>

      {breakdown && (
        <div className="rounded-xl border border-black/10 bg-white p-5 space-y-3">
          <p className="text-xs uppercase tracking-widest text-neutral-500">
            {t.priceBreakdown}
          </p>
          <ul className="text-sm space-y-1.5 text-ink">
            {breakdown.stay_type === "long" ? (
              <li className="flex justify-between">
                <span>
                  {fmt(t.months, {
                    n: breakdown.months,
                    price: formatEur(breakdown.per_month ?? 0, locale),
                  })}
                </span>
                <span>{formatEur(breakdown.subtotal, locale)}</span>
              </li>
            ) : (
              <li className="flex justify-between">
                <span>
                  {fmt(t.nightAvg, {
                    n: breakdown.nights,
                    plural: breakdown.nights === 1 ? "" : locale === "nl-NL" ? "en" : "s",
                    price: formatEur(breakdown.per_night, locale),
                  })}
                </span>
                <span>{formatEur(breakdown.subtotal, locale)}</span>
              </li>
            )}
            <li className="flex justify-between text-neutral-500">
              <span>{t.cleaningFee}</span>
              <span>{formatEur(breakdown.cleaning_fee, locale)}</span>
            </li>
          </ul>
          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-900 flex justify-between text-sm font-medium">
            <span>{t.total}</span>
            <span>{formatEur(breakdown.total, locale)}</span>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-black/10 bg-white p-5 space-y-4">
        <p className="text-xs uppercase tracking-widest text-neutral-500">
          {t.bookingDetails}
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <input
            placeholder={t.yourName}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-black/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
          />
          <input
            placeholder={t.phoneOptional}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-black/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
          />
        </div>
        <textarea
          rows={3}
          placeholder={t.notesPlaceholder}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-black/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 resize-y"
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
            ? t.booking
            : signedInUser
              ? t.confirmBooking
              : t.signInToBook}
        </button>
        {!signedInUser && (
          <p className="text-xs text-neutral-500">{t.signInHint}</p>
        )}
      </div>
    </div>
  );
}
