import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PropertyForm } from "./PropertyForm";
import { PhotoManager } from "./PhotoManager";
import type { Property, Photo } from "@/lib/types";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function PropertyEditPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [propertyRes, photosRes] = await Promise.all([
    supabase.from("properties").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("photos")
      .select("*")
      .eq("property_id", id)
      .order("position", { ascending: true }),
  ]);

  const property = propertyRes.data as Property | null;
  if (!property) notFound();

  const photos = (photosRes.data ?? []) as Photo[];

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

      <section className="space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
          Details
        </h2>
        <PropertyForm property={property} />
      </section>
    </main>
  );
}
