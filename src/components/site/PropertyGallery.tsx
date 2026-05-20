import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import type { PropertyData, Room } from '@/lib/properties';

function RoomBlock({ room }: { room: Room }) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="font-serif text-2xl text-forest-dark">{room.label}</h3>
        {room.amenities.length > 0 ? (
          <span className="text-xs uppercase tracking-widest text-sage-600">
            {room.amenities.length}{' '}
            {room.amenities.length === 1 ? 'voorziening' : 'voorzieningen'}
          </span>
        ) : null}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {room.photos.map((photo, i) => (
          <div
            key={photo.src}
            className={`relative aspect-[4/3] overflow-hidden rounded-xl ${
              i === 0 && room.photos.length > 3 ? 'lg:col-span-2 lg:row-span-2 lg:aspect-square' : ''
            }`}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
      {room.amenities.length > 0 ? (
        <Card className="mt-5 p-5">
          <div className="flex flex-wrap gap-2">
            {room.amenities.map((amenity) => (
              <span
                key={amenity}
                className="rounded-full bg-sage-50 px-3 py-1 text-xs text-sage-800"
              >
                {amenity}
              </span>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}

export function PropertyGallery({ property }: { property: PropertyData }) {
  return (
    <div className="space-y-16">
      {property.rooms.map((room) => (
        <RoomBlock key={room.slug} room={room} />
      ))}
    </div>
  );
}
