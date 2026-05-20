import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { RoomPhotoManager, type RoomWithPhotos } from './RoomPhotoManager';

export const metadata = { title: "Foto's beheren" };

export default async function AdminPropertyPhotosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: property } = await supabase
    .from('properties')
    .select('id, name, slug')
    .eq('id', id)
    .maybeSingle();

  if (!property) notFound();

  const { data: roomsData } = await supabase
    .from('property_rooms')
    .select(
      `id, slug, label, display_order,
       property_photos ( id, src, alt, display_order )`
    )
    .eq('property_id', id)
    .order('display_order');

  const rooms: RoomWithPhotos[] = (roomsData ?? []).map((r) => ({
    id: r.id,
    slug: r.slug,
    label: r.label,
    photos: [...(r.property_photos ?? [])].sort(
      (a, b) => a.display_order - b.display_order
    ),
  }));

  return (
    <div>
      <Link
        href={`/admin/properties/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-forest-dark/60 hover:text-sage-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        Terug naar {property.name}
      </Link>
      <h1 className="mt-3 font-serif text-4xl font-light text-forest-dark">
        Foto&apos;s
      </h1>
      <p className="mt-1 text-sm text-forest-dark/60">
        Beheer foto&apos;s per ruimte. Nieuwe uploads worden direct opgeslagen
        in Supabase Storage en verschijnen op de live site na opslaan.
      </p>

      <div className="mt-10 space-y-10">
        {rooms.map((room) => (
          <RoomPhotoManager
            key={room.id}
            room={room}
            propertyName={property.name}
            propertySlug={property.slug}
          />
        ))}
      </div>
    </div>
  );
}
