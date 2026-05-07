import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Unit, Property } from "@/lib/types";
import { formatEur } from "@/lib/format";

export const dynamic = "force-dynamic";

type UnitWithProperty = Unit & {
  property?: Pick<Property, "id" | "name" | "slug" | "color_hex"> | null;
};

export default async function UnitsListPage() {
  const supabase = await createClient();
  const [unitsRes, propertiesRes] = await Promise.all([
    supabase.from("units").select("*").order("position", { ascending: true }),
    supabase.from("properties").select("id, name, slug, color_hex"),
  ]);

  const units = (unitsRes.data ?? []) as Unit[];
  const propertiesList = (propertiesRes.data ?? []) as Pick<
    Property,
    "id" | "name" | "slug" | "color_hex"
  >[];
  const propertyById = new Map(propertiesList.map((p) => [p.id, p]));

  const unitsWithProperty: UnitWithProperty[] = units.map((u) => ({
    ...u,
    property: propertyById.get(u.property_id) ?? null,
  }));

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extralight">Units</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Bookable units across all residences. To edit a unit, open its
          residence — units are managed there.
        </p>
      </div>

      {unitsWithProperty.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center">
          <p className="text-neutral-500">No units yet.</p>
        </div>
      ) : (
        <ul className="divide-y divide-neutral-200 dark:divide-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-950">
          {unitsWithProperty.map((u) => {
            const accent = u.property?.color_hex ?? "#1E5FBF";
            return (
              <li key={u.id}>
                <Link
                  href={u.property ? `/admin/properties/${u.property.id}` : "/admin/properties"}
                  className="block px-5 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-3 min-w-0">
                      <span
                        className="mt-1.5 inline-block w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: accent }}
                      />
                      <div className="min-w-0">
                        <p className="font-medium">{u.name}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {u.property?.name ?? "Unknown property"} · {u.bedrooms} bedroom
                          {u.bedrooms === 1 ? "" : "s"} · up to {u.max_guests} guests
                          {u.size_m2 ? ` · ${u.size_m2} m²` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-sm whitespace-nowrap">
                      <span className="font-medium">{formatEur(u.base_price_eur)}</span>
                      <span className="text-neutral-500"> / night</span>
                      {u.long_stay_monthly_price_eur && (
                        <span className="block text-xs text-neutral-500">
                          {formatEur(u.long_stay_monthly_price_eur)} / month
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
