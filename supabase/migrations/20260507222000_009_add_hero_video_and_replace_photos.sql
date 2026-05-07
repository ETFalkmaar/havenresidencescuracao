-- Add hero_video_url column to properties (optional MP4 background for hero)
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS hero_video_url text;

-- Replace Blue Haven photos with the freshly uploaded ones, in proper order.
-- Delete old Unsplash placeholders first.
DELETE FROM public.photos
WHERE property_id = '11111111-1111-1111-1111-111111111111';

INSERT INTO public.photos (property_id, url, alt_text, position, is_hero) VALUES
  ('11111111-1111-1111-1111-111111111111',
   'https://pcdojiarpptcgeoddfeg.supabase.co/storage/v1/object/public/property-media/properties/blue-haven-residence/01-pool-evening.jpeg',
   'Private pool deck at sunset with string lights', 0, true),
  ('11111111-1111-1111-1111-111111111111',
   'https://pcdojiarpptcgeoddfeg.supabase.co/storage/v1/object/public/property-media/properties/blue-haven-residence/02-outdoor-dining.jpeg',
   'Covered outdoor dining area', 1, false),
  ('11111111-1111-1111-1111-111111111111',
   'https://pcdojiarpptcgeoddfeg.supabase.co/storage/v1/object/public/property-media/properties/blue-haven-residence/03-lounge-bar.jpeg',
   'Indoor lounge with bar seating and dining table', 2, false),
  ('11111111-1111-1111-1111-111111111111',
   'https://pcdojiarpptcgeoddfeg.supabase.co/storage/v1/object/public/property-media/properties/blue-haven-residence/04-bedroom-master.jpeg',
   'Master bedroom with king bed and slatted accent wall', 3, false),
  ('11111111-1111-1111-1111-111111111111',
   'https://pcdojiarpptcgeoddfeg.supabase.co/storage/v1/object/public/property-media/properties/blue-haven-residence/05-bedroom-second.jpeg',
   'Second bedroom with reading nook and shelves', 4, false),
  ('11111111-1111-1111-1111-111111111111',
   'https://pcdojiarpptcgeoddfeg.supabase.co/storage/v1/object/public/property-media/properties/blue-haven-residence/06-extra.jpeg',
   'Additional view', 5, false);

UPDATE public.properties
SET
  hero_image_url = 'https://pcdojiarpptcgeoddfeg.supabase.co/storage/v1/object/public/property-media/properties/blue-haven-residence/01-pool-evening.jpeg',
  hero_video_url = 'https://pcdojiarpptcgeoddfeg.supabase.co/storage/v1/object/public/property-media/properties/blue-haven-residence/hero.mp4'
WHERE id = '11111111-1111-1111-1111-111111111111';
