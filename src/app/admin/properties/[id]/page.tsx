import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PropertyForm } from "./PropertyForm";
import { PhotoManager } from "./PhotoManager";
import { UnitEditor } from "./UnitEditor";
import { AmenitiesPicker } from "./AmenitiesPicker";
import { PricingSeasonsEditor } from "./PricingSeasonsEditor";
import type {
  Property,
  Photo,
  Unit,
  Amenity,
  PricingSeason,
} from "@/lib/types";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

type UnitAmenityRow = { unit_id: string; amenity_id: string };

export default async function PropertyEditPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [propertyRes, photosRes, unitsRes, amenitiesRes] = await Promise.all([
    supabase.from("properties").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("photos")
      .select("*")
      .eq("property_id", id)
      .order("position", { ascending: true }),
    supabase
      .from("units")
      .select("*")
      .eq("property_id", id)
      .order("position", { ascending: true }),
    supabase.from("amenities").select("*").order("category", { ascending: true }),
  ]);

  const property = propertyRes.data as Property | null;
  if (!property) notFound();

  const photos = (photosRes.data ?? []) as Photo[];
  const units = (unitsRes.data ?? []) as Unit[];
  const allAmenities = (amenitiesRes.data ?? []) as Amenity[];

  const unitIds = units.map((u) => u.id);
  let unitAmenities: UnitAmenityRow[] = [];
  let pricingSeasons: PricingSeason[] = [];
  if (unitIds.length > 0) {
    const [uaRes, psRes] = await Promise.all([
      supabase
        .from("unit_amenities")
        .select("unit_id, amenity_id")
        .in("unit_id", unitIds),
      supabase
        .from("pricing_seasons")
        .select("*")
        .in("unit_id", unitIds)
        .order("start_date", { ascending: true }),
    ]);
    unitAmenities = (uaRes.data ?? []) as UnitAmenityRow[];
    pricingSeasons = (psRes.data ?? []) as PricingSeason[];
  }

  const amenitiesByUnit = new Map<string, string[]>();
  for (const row of unitAmenities) {
    const list = amenitiesByUnit.get(row.unit_id) ?? [];
    list.push(row.amenity_id);
    amenitiesByUnit.set(row.unit_id, list);
  }
  const seasonsByUnit = new Map<string, PricingSeason[]>();
  for (const s of pricingSeasons) {
    const list = seasonsByUnit.get(s.unit_id) ?? [];
    list.push(s);
    seasonsByUnit.set(s.unit_id, list);
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-12 space-y-12">
      <header className="space-y-2">
        <Link
          href="/admin/properties"
          className="text-xs uppercase tracking-[0.3em] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition"
        >
          ← All residences
        </Link>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-extralight">{property.name}</h1>
            <p className="text-sm text-neutral-500 mt-1">
              /{property.slug}
              {" · "}
              <Link
                href={`/${property.slug}`}
                target="_blank"
                className="hover:underline"
              >
                view public page ↗
              </Link>
            </p>
          </div>
        </div>
      </header>

      <section className="space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
          Photos
        </h2>
        <PhotoManager
          propertyId={property.id}
          propertySlug={property.slug}
          photos={photos.map((p) => ({
            id: p.id,
            url: p.url,
            alt_text: p.alt_text,
            position: p.position,
            is_hero: p.is_hero,
          }))}
        />
      </section>

      {units.length > 0 && (
        <section className="space-y-5">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
            Units · pricing · amenities
          </h2>
          {units.map((unit) => (
            <div key={unit.id} className="space-y-5">
              <UnitEditor unit={unit} propertyId={property.id} />
              <PricingSeasonsEditor
                unitId={unit.id}
                propertyId={property.id}
                basePrice={unit.base_price_eur}
                initialSeasons={seasonsByUnit.get(unit.id) ?? []}
              />
              <AmenitiesPicker
                unitId={unit.id}
                propertyId={property.id}
                allAmenities={allAmenities}
                selectedIds={amenitiesByUnit.get(unit.id) ?? []}
              />
            </div>
          ))}
        </section>
      )}

      <section className="space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
          Residence details
        </h2>
        <PropertyForm property={property} />
      </section>
    </main>
  );
}
