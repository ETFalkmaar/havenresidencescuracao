// Domain types — kept hand-rolled for stable build typing across Supabase client upgrades.

export type PropertyStatus = "active" | "coming_soon" | "draft" | "archived";
export type ParkingType = "private" | "public" | "street" | "none";
export type UtilitiesSystem = "included" | "metered" | "prepaid_card";

export type Property = {
  id: string;
  slug: string;
  name: string;
  color_name: string;
  color_hex: string | null;
  tagline: string | null;
  short_description: string | null;
  description: string | null;
  address: string;
  city: string;
  country: string;
  status: PropertyStatus;
  parking: ParkingType;
  is_gated: boolean;
  pets_allowed: boolean;
  utilities: UtilitiesSystem;
  utilities_notes: string | null;
  hero_image_url: string | null;
  hero_video_url: string | null;
  available_from: string | null;
  position: number;
  created_at: string;
  updated_at: string;
};

export type Unit = {
  id: string;
  property_id: string;
  slug: string;
  name: string;
  description: string | null;
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  size_m2: number | null;
  base_price_eur: number;
  cleaning_fee_eur: number;
  min_short_stay_nights: number;
  min_long_stay_months: number;
  long_stay_monthly_price_eur: number | null;
  status: string;
  position: number;
};

export type Photo = {
  id: string;
  property_id: string | null;
  unit_id: string | null;
  url: string;
  alt_text: string | null;
  position: number;
  is_hero: boolean;
};

export type Amenity = {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  category: string | null;
};

export type PricingSeason = {
  id: string;
  unit_id: string;
  name: string;
  start_date: string;
  end_date: string;
  price_multiplier: number | null;
  fixed_price_eur: number | null;
  position: number;
};

export type SiteSettings = {
  id: number;
  brand_name: string;
  brand_tagline: string | null;
  brand_description: string | null;
  whatsapp_number: string | null;
  emergency_phone: string | null;
  contact_email: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  google_review_url: string | null;
  trustpilot_url: string | null;
};
