import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatEur, formatDate } from "@/lib/format";

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
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  confirmed:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  cancelled:
    "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
};

export default async function AccountHomePage() {
  const supabase = await createClient();
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
  let unitsById = new Map<string, UnitWithProperty>();
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
        property: p
          ? { name: p.name, slug: p.slug, color_hex: p.color_hex }
          : null,
      });
    }
  }

  const greetingName = profile?.full_name?.split(" ")[0] ?? "";

  return (
    <main className="max-w-5xl mx-auto px-6 py-12 space-y-10">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-2">
          Account
        </p>
        <h1 className="text-3xl font-extralight">
          Welcome{greetingName ? `, ${greetingName}` : ""}.
        </h1>
        <p className="text-sm text-neutral-500 mt-2">
          Your stays, past and upcoming. Status updates appear here as soon as
          we confirm a booking.
        </p>
      </header>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
            My stays ({bookings.length})
          </h2>
          <Link
            href="/#residences"
            className="text-xs underline hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            Book another stay →
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-10 text-center bg-white dark:bg-neutral-950">
            <p className="text-base font-medium">No stays yet</p>
            <p className="text-sm text-neutral-500 max-w-md mx-auto mt-2 leading-relaxed">
              When you book a Haven Residence, it&apos;ll appear here with the
              dates and the latest status.
            </p>
            <Link
              href="/#residences"
              className="inline-block mt-6 px-5 py-2.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium hover:opacity-90 transition"
            >
              Browse residences
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-200 dark:divide-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-950">
            {bookings.map((b) => {
              const unit = unitsById.get(b.unit_id) ?? null;
              const accent = unit?.property?.color_hex ?? "#1E5FBF";
              return (
                <li key={b.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span
                          className="inline-block w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: accent }}
                        />
                        <span className="font-medium">
                          {unit?.property?.name ?? "Stay"}
                        </span>
                        <span
                          className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded ${statusStyles[b.status]}`}
                        >
                          {b.status}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {b.reference}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1.5">
                        {formatDate(b.check_in)} — {formatDate(b.check_out)} ·{" "}
                        {b.num_guests} guest{b.num_guests === 1 ? "" : "s"} ·{" "}
                        {b.stay_type === "long" ? "long stay" : "short stay"}
                      </p>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <p className="font-medium">{formatEur(b.total_eur)}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">total</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
