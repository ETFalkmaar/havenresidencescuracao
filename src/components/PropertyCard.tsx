import Image from "next/image";
import Link from "next/link";
import { formatEur } from "@/lib/format";

type PropertyCardData = {
  slug: string;
  name: string;
  tagline: string | null;
  short_description: string | null;
  city: string;
  status: "active" | "coming_soon" | "draft" | "archived";
  color_hex: string | null;
  hero_image_url: string | null;
  available_from: string | null;
  from_price_eur: number | null;
};

function CardBody({
  property,
  isComingSoon,
  accent,
}: {
  property: PropertyCardData;
  isComingSoon: boolean;
  accent: string;
}) {
  return (
    <div className="relative aspect-[4/5] w-full">
      {property.hero_image_url && (
        <Image
          src={property.hero_image_url}
          alt={property.name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className={`object-cover transition-transform duration-700 ${
            isComingSoon ? "" : "group-hover:scale-105"
          }`}
          priority={false}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {isComingSoon && (
        <div className="absolute top-5 left-5">
          <span
            className="text-[11px] tracking-widest uppercase px-3 py-1 rounded-full text-white"
            style={{ backgroundColor: accent }}
          >
            Coming soon
            {property.available_from
              ? ` · ${new Date(property.available_from).toLocaleString("en-GB", {
                  month: "long",
                  year: "numeric",
                })}`
              : ""}
          </span>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 text-white">
        <div
          className="h-0.5 w-10 mb-4 transition-all duration-500 group-hover:w-20"
          style={{ backgroundColor: accent }}
        />
        <h3 className="text-2xl lg:text-3xl font-light mb-1">{property.name}</h3>
        <p className="text-sm text-white/80 mb-3">{property.city}, Curaçao</p>
        {property.tagline && (
          <p className="text-sm text-white/90 mb-4 max-w-md leading-relaxed">
            {property.tagline}
          </p>
        )}
        <div className="flex items-center justify-between">
          {property.from_price_eur !== null && !isComingSoon ? (
            <span className="text-sm">
              <span className="text-white/60">from </span>
              <span className="font-medium">{formatEur(property.from_price_eur)}</span>
              <span className="text-white/60"> / night</span>
            </span>
          ) : (
            <span className="text-sm text-white/60">
              {isComingSoon ? "Pricing announced soon" : ""}
            </span>
          )}
          {!isComingSoon && (
            <span className="text-xs uppercase tracking-widest opacity-80 group-hover:opacity-100 transition">
              Discover →
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function PropertyCard({ property }: { property: PropertyCardData }) {
  const isComingSoon = property.status === "coming_soon";
  const accent = property.color_hex ?? "#1E5FBF";

  if (isComingSoon) {
    return (
      <div
        className="group block relative overflow-hidden rounded-2xl bg-neutral-200 dark:bg-neutral-900 cursor-default"
        aria-label={`${property.name} — coming soon`}
      >
        <CardBody property={property} isComingSoon accent={accent} />
      </div>
    );
  }

  return (
    <Link
      href={`/${property.slug}`}
      className="group block relative overflow-hidden rounded-2xl bg-neutral-200 dark:bg-neutral-900"
    >
      <CardBody property={property} isComingSoon={false} accent={accent} />
    </Link>
  );
}
