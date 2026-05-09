import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatEur, formatDate } from "@/lib/format";
import { getTranslations } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

type Booking = {
  id: string;
  reference: string;
  unit_id: string;
  check_in: string;
  check_out: string;
  num_guests: number;
  stay_type: "short" | "long";
  total_eur: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  created_at: string;
};

type UnitWithProperty = {
  id: string;
  name: string;
  property: { name: string; slug: string; color_hex: string | null } | null;
};

const statusStyles: Record<Booking["status"], string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-paper-warm text-ink-mute",
  completed: "bg-brand-100 text-brand-700",
};

export default async function AccountHomePage() {
  const supabase = await createClient();
  const { lang } = await getTranslations();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("user_id", user!.id)
    .maybeSingle();
  const profile = profileRow as { full_name: string | null; phone: string | null } | null;

  const { data: bookingsData } = await supabase
    .from("bookings")
    .select("*")
    .eq("guest_user_id", user!.id)
    .order("check_in", { ascending: false });
  const bookings = (bookingsData ?? []) as Booking[];

  const unitIds = Array.from(new Set(bookings.map((b) => b.unit_id)));
  const unitsById = new Map<string, UnitWithProperty>();
  if (unitIds.length > 0) {
    const { data: unitsData } = await supabase
      .from("units")
      .select("id, name, property_id")
      .in("id", unitIds);
    const propertyIds = Array.from(
      new Set((unitsData ?? []).map((u) => (u as { property_id: string }).property_id)),
    );
    const { data: propsData } = await supabase
      .from("properties")
      .select("id, name, slug, color_hex")
      .in("id", propertyIds);
    type PRow = { id: string; name: string; slug: string; color_hex: string | null };
    const propsById = new Map<string, PRow>();
    for (const p of (propsData ?? []) as PRow[]) propsById.set(p.id, p);
    type URow = { id: string; name: string; property_id: string };
    for (const u of (unitsData ?? []) as URow[]) {
      const p = propsById.get(u.property_id) ?? null;
      unitsById.set(u.id, {
        id: u.id,
        name: u.name,
        property: p ? { name: p.name, slug: p.slug, color_hex: p.color_hex } : null,
      });
    }
  }

  const greetingName = profile?.full_name?.split(" ")[0] ?? "";
  const tr =
    lang === "nl"
      ? {
          eyebrow: "Account",
          welcome: greetingName ? `Welkom terug, ${greetingName}.` : "Welkom terug.",
          subtitle: "Je verblijven, verleden en toekomst. Statusupdates verschijnen hier zodra we een boeking bevestigen.",
          myStays: "Mijn verblijven",
          bookAnother: "Boek een nieuw verblijf",
          noStaysTitle: "Nog geen verblijven",
          noStaysBody: "Wanneer je een Haven Residence boekt verschijnt het hier met de data en de laatste status.",
          browseLink: "Bekijk residenties",
          guests: (n: number) => `${n} ${n === 1 ? "gast" : "gasten"}`,
          longStay: "lang verblijf",
          shortStay: "kort verblijf",
          total: "totaal",
          statusLabels: {
            pending: "wacht",
            confirmed: "bevestigd",
            cancelled: "geannuleerd",
            completed: "afgerond",
          },
        }
      : {
          eyebrow: "Account",
          welcome: greetingName ? `Welcome back, ${greetingName}.` : "Welcome back.",
          subtitle: "Your stays, past and upcoming. Status updates appear here as soon as we confirm a booking.",
          myStays: "My stays",
          bookAnother: "Book another stay",
          noStaysTitle: "No stays yet",
          noStaysBody: "When you book a Haven Residence, it'll appear here with the dates and the latest status.",
          browseLink: "Browse residences",
          guests: (n: number) => `${n} ${n === 1 ? "guest" : "guests"}`,
          longStay: "long stay",
          shortStay: "short stay",
          total: "total",
          statusLabels: {
            pending: "pending",
            confirmed: "confirmed",
            cancelled: "cancelled",
            completed: "completed",
          },
        };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
      <header>
        <p className="text-[12px] uppercase tracking-[0.3em] text-ink-mute mb-3">
          {tr.eyebrow}
        </p>
        <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight">
          {tr.welcome}
        </h1>
        <p className="mt-3 text-ink-mute leading-relaxed max-w-xl">{tr.subtitle}</p>
      </header>

      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.3em] text-ink-mute">
            {tr.myStays} ({bookings.length})
          </h2>
          <Link
            href="/property"
            className="text-[13px] text-ink-mute hover:text-ink transition"
          >
            {tr.bookAnother} →
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="rounded-3xl border border-black/5 bg-paper-warm p-12 text-center">
            <p className="font-display font-semibold text-xl text-ink">
              {tr.noStaysTitle}
            </p>
            <p className="text-sm text-ink-mute max-w-md mx-auto mt-3 leading-relaxed">
              {tr.noStaysBody}
            </p>
            <Link
              href="/property"
              className="inline-block mt-7 px-5 py-2.5 rounded-full bg-ink text-white text-[13px] font-medium hover:bg-ink-soft transition shadow-pill"
            >
              {tr.browseLink}
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-black/5 border border-black/5 rounded-3xl overflow-hidden bg-white shadow-pill">
            {bookings.map((b) => {
              const unit = unitsById.get(b.unit_id) ?? null;
              const accent = unit?.property?.color_hex ?? "#1F6BF0";
              return (
                <li key={b.id} className="px-6 py-5 hover:bg-paper-tint transition">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span
                          className="inline-block w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: accent }}
                        />
                        <span className="font-medium text-ink">
                          {unit?.property?.name ?? "Stay"}
                        </span>
                        <span
                          className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded ${statusStyles[b.status]}`}
                        >
                          {tr.statusLabels[b.status]}
                        </span>
                        <span className="text-xs text-ink-mute">{b.reference}</span>
                      </div>
                      <p className="text-xs text-ink-mute mt-1.5">
                        {formatDate(b.check_in)} — {formatDate(b.check_out)} ·{" "}
                        {tr.guests(b.num_guests)} ·{" "}
                        {b.stay_type === "long" ? tr.longStay : tr.shortStay}
                      </p>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <p className="font-medium text-ink">{formatEur(b.total_eur)}</p>
                      <p className="text-xs text-ink-mute mt-0.5">{tr.total}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
