-- Site settings singleton
INSERT INTO public.site_settings (id, brand_name, brand_tagline, brand_description, contact_email, instagram_url, tiktok_url)
VALUES (
  1,
  'Haven Residence',
  'Premium stays on the island of Curaçao',
  'A curated collection of vacation and long-term residences across the most beautiful corners of Curaçao.',
  'info@havenresidencescuracao.com',
  'https://instagram.com/havenresidencescuracao',
  'https://tiktok.com/@havenresidencescuracao'
);

-- Master amenities
INSERT INTO public.amenities (slug, name, icon, category) VALUES
  ('wifi', 'High-speed Wi-Fi', 'wifi', 'comfort'),
  ('air_conditioning', 'Air Conditioning', 'wind', 'comfort'),
  ('kitchen', 'Fully equipped kitchen', 'utensils', 'kitchen'),
  ('washing_machine', 'Washing machine', 'washing-machine', 'comfort'),
  ('tv', 'Smart TV', 'tv', 'comfort'),
  ('parking_private', 'Private parking', 'car', 'outdoor'),
  ('parking_public', 'Street parking', 'car', 'outdoor'),
  ('pool', 'Pool access', 'waves', 'outdoor'),
  ('balcony', 'Balcony / terrace', 'tree-palm', 'outdoor'),
  ('beach_nearby', 'Beach nearby', 'umbrella', 'outdoor'),
  ('safe', 'Safe', 'lock', 'safety'),
  ('cleaning', 'Professional cleaning', 'sparkles', 'comfort'),
  ('linen', 'Bed linen included', 'bed', 'comfort'),
  ('gated', 'Gated community', 'shield', 'safety');

-- Blue Haven Residence
INSERT INTO public.properties (
  id, slug, name, color_name, color_hex, tagline,
  short_description, description,
  address, city, country, status,
  parking, is_gated, pets_allowed,
  utilities, utilities_notes,
  hero_image_url, position
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'blue-haven-residence',
  'Blue Haven Residence',
  'blue', '#1E5FBF',
  'Beachfront living on Blue Bay',
  'A serene retreat inside a gated resort on the soft white sands of Blue Bay — for short escapes and longer winter stays.',
  'Blue Haven Residence sits inside one of Curaçao''s most exclusive gated resorts on Blue Bay. Wake to ocean breezes, walk to the beach in minutes, and enjoy private parking inside the secured grounds. Designed for travelers who want the calm of a residential setting with the freedom of a five-star resort.',
  'BP-76, Blue Bay',
  'Willemstad', 'Curaçao', 'active',
  'private', true, false,
  'metered',
  'Electricity is metered and settled at the end of your stay based on actual usage.',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=2400&q=80&auto=format&fit=crop',
  1
);

-- Blue Haven Unit
INSERT INTO public.units (
  id, property_id, slug, name, description,
  bedrooms, bathrooms, max_guests, size_m2,
  base_price_eur, cleaning_fee_eur,
  min_short_stay_nights, min_long_stay_months, long_stay_monthly_price_eur, position
) VALUES (
  '11111111-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'main',
  'Blue Haven — Main Apartment',
  'Spacious apartment with sea-toned interiors, fully fitted kitchen, and a private terrace overlooking the resort gardens.',
  2, 2.0, 4, 95,
  175.00, 75.00,
  3, 4, 2200.00, 1
);

-- Blue Haven photos
INSERT INTO public.photos (property_id, url, alt_text, position, is_hero) VALUES
  ('11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=2400&q=80&auto=format&fit=crop', 'Blue Haven Residence — exterior view', 0, true),
  ('11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1559599189-fe84dea4eb79?w=2000&q=80&auto=format&fit=crop', 'Living area', 1, false),
  ('11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=2000&q=80&auto=format&fit=crop', 'Bedroom', 2, false),
  ('11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=2000&q=80&auto=format&fit=crop', 'Pool view', 3, false);

-- Amenities for Blue Haven unit
INSERT INTO public.unit_amenities (unit_id, amenity_id)
SELECT '11111111-2222-2222-2222-222222222222'::uuid, id
FROM public.amenities
WHERE slug IN ('wifi','air_conditioning','kitchen','washing_machine','tv','parking_private','pool','balcony','beach_nearby','safe','cleaning','linen','gated');

-- Pricing seasons for Blue Haven
INSERT INTO public.pricing_seasons (unit_id, name, start_date, end_date, price_multiplier, position) VALUES
  ('11111111-2222-2222-2222-222222222222', 'High Season — Christmas & New Year', '2026-12-15', '2027-01-08', 1.50, 1),
  ('11111111-2222-2222-2222-222222222222', 'High Season — Carnival', '2027-02-13', '2027-02-23', 1.40, 2),
  ('11111111-2222-2222-2222-222222222222', 'High Season — Summer', '2027-07-01', '2027-08-31', 1.30, 3);

-- Green Haven Residence (coming soon)
INSERT INTO public.properties (
  id, slug, name, color_name, color_hex, tagline,
  short_description, description,
  address, city, country, status,
  parking, is_gated, pets_allowed,
  utilities, utilities_notes,
  hero_image_url, available_from, position
) VALUES (
  '22222222-1111-1111-1111-111111111111',
  'green-haven-residence',
  'Green Haven Residence',
  'green', '#2F7D55',
  'Authentic island living in Emmastad',
  'A residential hideaway in tree-lined Emmastad — coming soon for short stays and extended residencies.',
  'Set in the leafy heart of Emmastad, Green Haven Residence will offer a more local, residential feel — close to everyday amenities yet only a short drive from Willemstad and the beaches.',
  'Irenestraat 29',
  'Emmastad', 'Curaçao', 'coming_soon',
  'public', false, false,
  'prepaid_card',
  'Utilities (electricity, water, gas) are paid via prepaid top-up cards — top up as you go.',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=2400&q=80&auto=format&fit=crop',
  '2026-09-01', 2
);
