import { createClient } from "@/lib/supabase/server";
import { formatEur, formatDate } from "@/lib/format";
import { getTranslations } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

type BookingRow = {
  id: string;
  reference: string;
  unit_id: string;
  stay_type: "short" | "long";
  check_in: string;
  check_out: string;
  num_guests: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  total_eur: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  created_at: string;
};

const statusStyles: Record<BookingRow["status"], string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  confirmed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  cancelled: "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
};

export default async function BookingsListPage() {
  const supabase = await createClient();
  const { lang } = await getTranslations();
  const tr = lang === "nl"
    ? {
        title: "Boekingen",
        subtitle: "Reserveringgeschiedenis en lopende aanvragen.",
        empty: "Nog geen boekingen",
        emptyBody:
          "De volledige self-service-boekingsflow met online betalen volgt in de volgende fase (Stripe-integratie, vereist je Stripe-abonnement). Tot die tijd accepteer je boekingen handmatig via het aanvraagformulier op de publieke site — elke aanvraag verschijnt onder",
        emptyBodyEnd: ".",
        inquiriesLabel: "Aanvragen",
        guest: "gast",
        guests: "gasten",
        shortStay: "kort",
        longStay: "lang",
        total: "totaal",
      }
    : {
        title: "Bookings",
        subtitle: "Reservation history and pending requests.",
        empty: "No bookings yet",
        emptyBody:
          "The full self-service booking flow with online payment will be wired in the next phase (Stripe integration, requires the Stripe subscription on your end). Until then, accept bookings manually via the inquiry form on the public site — every inquiry shows up in",
        emptyBodyEnd: ".",
        inquiriesLabel: "Inquiries",
        guest: "guest",
        guests: "guests",
        shortStay: "short",
        longStay: "long",
        total: "total",
      };

  const { data } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  const bookings = (data ?? []) as BookingRow[];

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extralight">{tr.title}</h1>
        <p className="text-sm text-neutral-500 mt-1">{tr.subtitle}</p>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-10 text-center space-y-3">
          <p className="text-base font-medium">{tr.empty}</p>
          <p className="text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
            {tr.emptyBody}{" "}
            <span className="font-medium">{tr.inquiriesLabel}</span>
            {tr.emptyBodyEnd}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-neutral-200 dark:divide-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-950">
          {bookings.map((b) => (
            <li key={b.id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-medium">{b.guest_name}</span>
                    <span
                      className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded ${
                        statusStyles[b.status]
                      }`}
                    >
                      {b.status}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {b.reference}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    {formatDate(b.check_in)} — {formatDate(b.check_out)} ·{" "}
                    {b.num_guests}{" "}
                    {b.num_guests === 1 ? tr.guest : tr.guests} ·{" "}
                    {b.stay_type === "short" ? tr.shortStay : tr.longStay}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {b.guest_email}
                    {b.guest_phone ? ` · ${b.guest_phone}` : ""}
                  </p>
                </div>
                <div className="text-right whitespace-nowrap">
                  <p className="font-medium">{formatEur(b.total_eur)}</p>
                  <p className="text-xs text-neutral-500">{tr.total}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
