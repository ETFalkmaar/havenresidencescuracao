"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DayPicker, type DateRange, type Matcher } from "react-day-picker";
import "react-day-picker/style.css";
import { calculatePrice, type StayType, type Season } from "@/lib/pricing";
import { formatEur } from "@/lib/format";
import { createBooking } from "@/app/actions/bookings";
import type { Translations } from "@/lib/i18n/translations";
import type { Lang } from "@/lib/i18n/translations";

type Residence = {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  photo: string | null;
  status: "active" | "coming_soon" | "draft" | "archived";
  availableFrom: string | null;
  colorHex: string;
  unit:
    | {
        id: string;
        base_price_eur: number;
        cleaning_fee_eur: number;
        long_stay_monthly_price_eur: number | null;
        min_long_stay_months: number;
        max_guests: number;
        bedrooms: number;
        bathrooms: number;
      }
    | null;
  seasons: Season[];
  blocked: { check_in: string; check_out: string }[];
};

type SignedInUser = {
  email: string;
  fullName: string | null;
  phone: string | null;
} | null;

export function BookingFlow({
  residences,
  initialSlug,
  signedInUser,
  locale,
  t,
  lang,
}: {
  residences: Residence[];
  initialSlug: string | null;
  signedInUser: SignedInUser;
  locale: string;
  t: Translations["booking"];
  lang: Lang;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{
    reference: string;
    residenceName: string;
  } | null>(null);

  // Pick the requested residence if it's bookable; otherwise the first active one.
  const defaultResidence =
    residences.find(
      (r) => r.slug === initialSlug && r.status === "active" && r.unit,
    ) ??
    residences.find((r) => r.status === "active" && r.unit) ??
    residences[0];

  const [selectedId, setSelectedId] = useState<string>(
    defaultResidence?.id ?? "",
  );
  const selected = residences.find((r) => r.id === selectedId) ?? defaultResidence;

  const [range, setRange] = useState<DateRange | undefined>();
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [name, setName] = useState(signedInUser?.fullName ?? "");
  const [phone, setPhone] = useState(signedInUser?.phone ?? "");
  const [notes, setNotes] = useState("");

  // Reset dates when residence changes (different availability).
  useEffect(() => {
    setRange(undefined);
  }, [selectedId]);

  const disabledMatchers: Matcher[] = useMemo(() => {
    const list: Matcher[] = [{ before: new Date() }];
    if (!selected?.unit) return list;
    for (const b of selected.blocked) {
      list.push({
        from: new Date(b.check_in + "T00:00:00Z"),
        to: new Date(
          new Date(b.check_out + "T00:00:00Z").getTime() - 24 * 60 * 60 * 1000,
        ),
      });
    }
    return list;
  }, [selected]);

  const stayType: StayType = useMemo<StayType>(() => {
    if (!range?.from || !range?.to || !selected?.unit) return "short";
    const months =
      (range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return selected.unit.long_stay_monthly_price_eur &&
      months >= selected.unit.min_long_stay_months
      ? "long"
      : "short";
  }, [range, selected]);

  const breakdown = useMemo(() => {
    if (!range?.from || !range?.to || !selected?.unit) return null;
    return calculatePrice(
      selected.unit,
      selected.seasons,
      range.from,
      range.to,
      stayType,
    );
  }, [range, selected, stayType]);

  const guestsLabel = lang === "nl" ? "Volwassenen" : "Adults";
  const childrenLabel = lang === "nl" ? "Kinderen (< 12)" : "Children (under 12)";

  function submit() {
    if (!selected?.unit) return;
    if (!range?.from || !range?.to) {
      setError(t.pickDatesError);
      return;
    }
    if (!name.trim()) {
      setError(t.nameRequired);
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await createBooking({
        unitId: selected.unit!.id,
        checkIn: toIsoDate(range.from!),
        checkOut: toIsoDate(range.to!),
        numGuests: adults,
        numChildren: children,
        stayType,
        guestName: name.trim(),
        guestPhone: phone.trim() || null,
        notes: notes.trim() || null,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setConfirmation({
        reference: result.reference,
        residenceName: selected.name,
      });
      // Refresh server data (account page, admin lists).
      router.refresh();
    });
  }

  // ---------- Confirmation screen ----------
  if (confirmation) {
    return (
      <section className="max-w-3xl mx-auto px-6 py-12">
        <div className="rounded-3xl bg-white border border-black/10 shadow-pill p-8 md:p-12 text-center">
          <p className="text-[12px] tracking-[0.3em] uppercase text-emerald-600 mb-4">
            {t.bookingReceived}
          </p>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-ink mb-3">
            {t.thankYou}
            {name ? `, ${name.split(" ")[0]}` : ""}.
          </h2>
          <p className="text-ink-mute leading-relaxed max-w-md mx-auto">
            {t.referenceLine1}{" "}
            <span className="font-mono font-semibold text-ink">
              {confirmation.reference}
            </span>
            . {t.referenceLine2}{" "}
            <Link
              href="/account"
              className="text-brand-500 hover:underline font-medium"
            >
              {t.myStays}
            </Link>
            .
          </p>
        </div>
      </section>
    );
  }

  // ---------- Main form ----------
  return (
    <section className="max-w-5xl mx-auto px-6 pb-24 space-y-8">
      {/* Step 1 — pick a residence */}
      <div className="space-y-4">
        <p className="text-[12px] tracking-[0.3em] uppercase text-ink-mute">
          {lang === "nl" ? "1 · Kies je residentie" : "1 · Pick your residence"}
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {residences.map((r) => {
            const isComingSoon = r.status === "coming_soon" || !r.unit;
            const isSelected = r.id === selected?.id;
            return (
              <button
                key={r.id}
                type="button"
                disabled={isComingSoon}
                onClick={() => setSelectedId(r.id)}
                className={`relative text-left rounded-3xl overflow-hidden border transition group ${
                  isSelected
                    ? "border-ink shadow-pill"
                    : "border-black/10 hover:border-black/30"
                } ${isComingSoon ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                aria-pressed={isSelected}
              >
                <div className="relative aspect-[16/10] bg-paper-warm">
                  {r.photo && (
                    <Image
                      src={r.photo}
                      alt={r.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover"
                    />
                  )}
                  {isComingSoon && (
                    <span className="absolute top-3 left-3 inline-flex items-center px-3 py-1 rounded-full bg-ink text-white text-[10px] tracking-[0.25em] uppercase font-semibold">
                      {lang === "nl" ? "Binnenkort" : "Coming soon"}
                      {r.availableFrom
                        ? ` · ${new Date(r.availableFrom).toLocaleDateString(locale, { month: "short", year: "numeric" })}`
                        : ""}
                    </span>
                  )}
                  {isSelected && !isComingSoon && (
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white text-ink text-[11px] tracking-wide font-semibold shadow-sm">
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {lang === "nl" ? "Gekozen" : "Selected"}
                    </span>
                  )}
                </div>
                <div className="p-4 bg-white">
                  <p className="text-[11px] tracking-[0.25em] uppercase text-ink-mute">
                    {r.city ? `${r.city} · Curaçao` : "Curaçao"}
                  </p>
                  <p className="font-display font-semibold text-ink text-[17px] mt-1">
                    {r.name}
                  </p>
                  {r.unit && !isComingSoon && (
                    <p className="text-[13px] text-ink-mute mt-1">
                      {r.unit.bedrooms} {lang === "nl" ? "slaapk." : "bed"} ·{" "}
                      {r.unit.bathrooms} {lang === "nl" ? "badk." : "bath"} ·{" "}
                      {lang === "nl" ? "max" : "up to"} {r.unit.max_guests}{" "}
                      {lang === "nl" ? "gasten" : "guests"}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2 — date picker (only when a bookable residence is selected) */}
      {selected?.unit ? (
        <>
          <DayPickerStyles accent={selected.colorHex} />

          <div className="space-y-4">
            <p className="text-[12px] tracking-[0.3em] uppercase text-ink-mute">
              {lang === "nl"
                ? `2 · Kies je data — ${selected.name}`
                : `2 · Pick your dates — ${selected.name}`}
            </p>
            <div className="rounded-3xl border border-black/10 bg-white p-5 md:p-7 overflow-x-auto">
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
          </div>

          {/* Step 3 — adults, children, name, phone, notes */}
          <div className="space-y-4">
            <p className="text-[12px] tracking-[0.3em] uppercase text-ink-mute">
              {lang === "nl" ? "3 · Gasten en gegevens" : "3 · Guests and details"}
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <NumberField
                label={guestsLabel}
                value={adults}
                onChange={setAdults}
                min={1}
                max={selected.unit.max_guests}
              />
              <NumberField
                label={childrenLabel}
                value={children}
                onChange={setChildren}
                min={0}
                max={Math.max(0, selected.unit.max_guests - 1)}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <TextField
                label={t.yourName}
                value={name}
                onChange={setName}
                placeholder={t.yourName}
              />
              <TextField
                label={t.phoneOptional}
                value={phone}
                onChange={setPhone}
                placeholder={t.phoneOptional}
              />
            </div>

            <TextArea
              label={lang === "nl" ? "Opmerkingen (optioneel)" : "Notes (optional)"}
              value={notes}
              onChange={setNotes}
              placeholder={t.notesPlaceholder}
            />
          </div>

          {/* Price breakdown */}
          {breakdown && (
            <div className="rounded-3xl border border-black/10 bg-white p-5 md:p-7 space-y-3">
              <p className="text-[12px] tracking-[0.3em] uppercase text-ink-mute">
                {t.priceBreakdown}
              </p>
              <ul className="text-sm space-y-1.5 text-ink">
                {stayType === "short" ? (
                  <li className="flex justify-between">
                    <span>
                      {breakdown.nights}{" "}
                      {breakdown.nights === 1
                        ? lang === "nl"
                          ? "nacht"
                          : "night"
                        : lang === "nl"
                          ? "nachten"
                          : "nights"}{" "}
                      ({formatEur(breakdown.subtotal / breakdown.nights, locale)} avg)
                    </span>
                    <span>{formatEur(breakdown.subtotal, locale)}</span>
                  </li>
                ) : (
                  <li className="flex justify-between">
                    <span>
                      {breakdown.months}{" "}
                      {lang === "nl" ? "maanden" : "months"}
                    </span>
                    <span>{formatEur(breakdown.subtotal, locale)}</span>
                  </li>
                )}
                {breakdown.cleaning_fee > 0 && (
                  <li className="flex justify-between text-ink-mute">
                    <span>{t.cleaningFee}</span>
                    <span>{formatEur(breakdown.cleaning_fee, locale)}</span>
                  </li>
                )}
              </ul>
              <div className="pt-3 border-t border-black/10 flex justify-between text-base font-semibold text-ink">
                <span>{t.total}</span>
                <span>{formatEur(breakdown.total, locale)}</span>
              </div>
            </div>
          )}

          {/* Submit */}
          {!signedInUser ? (
            <div className="rounded-3xl border border-black/10 bg-paper-warm p-5 md:p-7 flex items-center justify-between gap-4 flex-wrap">
              <p className="text-sm text-ink-mute max-w-md">{t.signInHint}</p>
              <Link
                href={`/login?next=${encodeURIComponent("/book?property=" + selected.slug)}`}
                className="inline-flex items-center px-5 py-2.5 rounded-full bg-ink text-white text-[14px] font-medium hover:bg-ink-soft transition"
              >
                {t.signInToBook}
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {error && (
                <p className="text-sm text-rose-600 flex-1">{error}</p>
              )}
              <button
                type="button"
                onClick={submit}
                disabled={pending || !range?.from || !range?.to}
                className="ml-auto inline-flex items-center gap-2.5 pl-2 pr-6 py-2 rounded-full bg-ink text-white text-[15px] font-medium hover:bg-ink-soft transition shadow-pill disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                {pending ? t.booking : t.confirmBooking}
              </button>
            </div>
          )}
        </>
      ) : (
        // No bookable residence (the selected one is coming soon and there's
        // no fallback active one)
        <div className="rounded-3xl border border-black/10 bg-paper-warm p-8 text-center">
          <p className="font-display font-semibold text-xl text-ink">
            {lang === "nl"
              ? "Deze residentie is binnenkort beschikbaar"
              : "This residence is coming soon"}
          </p>
          <p className="text-sm text-ink-mute mt-2 max-w-md mx-auto">
            {lang === "nl"
              ? "Stuur ons een bericht en je hoort als eerste wanneer boekingen openen."
              : "Send us a message and you'll be the first to hear when bookings open."}
          </p>
          <Link
            href="/contact"
            className="inline-block mt-5 px-5 py-2.5 rounded-full bg-ink text-white text-[13px] font-medium hover:bg-ink-soft transition"
          >
            {lang === "nl" ? "Stuur bericht" : "Send message"}
          </Link>
        </div>
      )}
    </section>
  );
}

// Inject light-mode-friendly DayPicker styles tied to the residence accent.
function DayPickerStyles({ accent }: { accent: string }) {
  const css = `
    .rdp-root {
      --rdp-accent-color: ${accent};
      --rdp-accent-background-color: ${accent}33;
      color: #0b0b0b;
      background: transparent;
    }
    .rdp-month_caption, .rdp-caption_label { color: #0b0b0b; font-weight: 600; }
    .rdp-weekday { color: #525252; }
    .rdp-day_button { color: #0b0b0b; }
    .rdp-day_button:hover:not([disabled]) { background-color: ${accent}1a; color: #0b0b0b; }
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
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4">
      <label className="block text-[11px] uppercase tracking-widest text-ink-mute mb-2">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          aria-label="Decrease"
          className="h-9 w-9 rounded-full border border-black/10 hover:bg-paper-warm transition text-ink"
        >
          −
        </button>
        <span className="flex-1 text-center font-display font-semibold text-xl text-ink">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          aria-label="Increase"
          className="h-9 w-9 rounded-full border border-black/10 hover:bg-paper-warm transition text-ink"
        >
          +
        </button>
      </div>
      <p className="text-[11px] text-ink-mute mt-2">max {max}</p>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-widest text-ink-mute">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full px-4 py-3 rounded-2xl border border-black/10 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-ink/20"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-widest text-ink-mute">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="mt-1 w-full px-4 py-3 rounded-2xl border border-black/10 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-ink/20 resize-y"
      />
    </label>
  );
}

function toIsoDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
