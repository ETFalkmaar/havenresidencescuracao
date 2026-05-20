import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';
import type { PropertyData, Room } from './types';

export type {
  PropertyData,
  Room,
  RoomPhoto,
  PropertyHighlight,
  PropertyPricing,
  PropertyStay,
} from './types';

/**
 * Publieke Supabase-client zonder cookies. Werkt zowel tijdens build
 * (generateStaticParams, generateMetadata, sitemap) als bij runtime
 * SSR. RLS afdwingt public-read op published properties via anon key.
 *
 * Voor admin-reads waar je auth-state nodig hebt: gebruik
 * @/lib/supabase/server createClient() vanuit een server-component/action.
 */
function getPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }
  return createSupabaseClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const SELECT_QUERY = `
  *,
  property_highlights ( title, description, display_order ),
  property_house_rules ( rule, display_order ),
  property_rooms (
    slug,
    label,
    display_order,
    room_amenities ( label, display_order ),
    property_photos ( src, alt, display_order )
  )
`;

type DbProperty = {
  slug: string;
  name: string;
  location: string;
  short_description: string;
  description: string;
  hero_photo_src: string;
  hero_photo_alt: string;
  max_guests: number;
  max_guests_note: string | null;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  check_in: string;
  check_out: string;
  base_price_per_night_usd: number;
  cleaning_fee_usd: number;
  deposit_usd: number;
  long_term_nights: number;
  long_term_discount_percent: number;
  min_nights: number;
  high_season_note: string | null;
  cancellation_policy: string;
  property_highlights: Array<{ title: string; description: string; display_order: number }>;
  property_house_rules: Array<{ rule: string; display_order: number }>;
  property_rooms: Array<{
    slug: string;
    label: string;
    display_order: number;
    room_amenities: Array<{ label: string; display_order: number }>;
    property_photos: Array<{ src: string; alt: string; display_order: number }>;
  }>;
};

function mapRoom(r: DbProperty['property_rooms'][number]): Room {
  return {
    slug: r.slug,
    label: r.label,
    amenities: [...r.room_amenities]
      .sort((a, b) => a.display_order - b.display_order)
      .map((a) => a.label),
    photos: [...r.property_photos]
      .sort((a, b) => a.display_order - b.display_order)
      .map((p) => ({ src: p.src, alt: p.alt })),
  };
}

function mapDbToProperty(row: DbProperty): PropertyData {
  return {
    slug: row.slug,
    name: row.name,
    location: row.location,
    shortDescription: row.short_description,
    description: row.description,
    heroPhoto: { src: row.hero_photo_src, alt: row.hero_photo_alt },
    stay: {
      maxGuests: row.max_guests,
      maxGuestsNote: row.max_guests_note ?? undefined,
      bedrooms: row.bedrooms,
      beds: row.beds,
      bathrooms: row.bathrooms,
      checkIn: row.check_in,
      checkOut: row.check_out,
    },
    pricing: {
      basePricePerNightUSD: row.base_price_per_night_usd,
      cleaningFeeUSD: row.cleaning_fee_usd,
      depositUSD: row.deposit_usd,
      longTermNights: row.long_term_nights,
      longTermDiscountPercent: row.long_term_discount_percent,
      minNights: row.min_nights,
      highSeasonNote: row.high_season_note ?? undefined,
    },
    highlights: [...row.property_highlights]
      .sort((a, b) => a.display_order - b.display_order)
      .map((h) => ({ title: h.title, description: h.description })),
    houseRules: [...row.property_house_rules]
      .sort((a, b) => a.display_order - b.display_order)
      .map((r) => r.rule),
    cancellationPolicy: row.cancellation_policy,
    rooms: [...row.property_rooms]
      .sort((a, b) => a.display_order - b.display_order)
      .map(mapRoom),
  };
}

export async function getProperties(): Promise<PropertyData[]> {
  const supabase = getPublicClient();
  const { data, error } = await supabase
    .from('properties')
    .select(SELECT_QUERY)
    .eq('is_published', true)
    .order('display_order');

  if (error) {
    console.error('getProperties failed:', error);
    return [];
  }
  return (data as unknown as DbProperty[]).map(mapDbToProperty);
}

export async function getPropertyBySlug(
  slug: string
): Promise<PropertyData | null> {
  const supabase = getPublicClient();
  const { data, error } = await supabase
    .from('properties')
    .select(SELECT_QUERY)
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error) {
    console.error('getPropertyBySlug failed:', error);
    return null;
  }
  return data ? mapDbToProperty(data as unknown as DbProperty) : null;
}

export async function getAllSlugs(): Promise<string[]> {
  const supabase = getPublicClient();
  const { data, error } = await supabase
    .from('properties')
    .select('slug')
    .eq('is_published', true);

  if (error) {
    console.error('getAllSlugs failed:', error);
    return [];
  }
  return data?.map((p) => p.slug) ?? [];
}
