-- Owner correction: the photos previously seeded under Blue Haven were
-- actually shots of Green Haven. Move them to Green Haven, then load the
-- real Blue Haven shots (uploaded separately to property-media bucket).

-- Step 1: move all current Blue Haven photos to Green Haven
UPDATE public.photos
SET property_id = '22222222-1111-1111-1111-111111111111'
WHERE property_id = '11111111-1111-1111-1111-111111111111';

-- Step 2: move Blue Haven's current hero_image_url + hero_video_url to Green Haven
UPDATE public.properties green
SET
  hero_image_url = blue.hero_image_url,
  hero_video_url = blue.hero_video_url
FROM public.properties blue
WHERE green.id = '22222222-1111-1111-1111-111111111111'
  AND blue.id  = '11111111-1111-1111-1111-111111111111';

-- Step 3: clear Blue Haven hero so we can re-set it
UPDATE public.properties
SET hero_image_url = NULL, hero_video_url = NULL
WHERE id = '11111111-1111-1111-1111-111111111111';

-- Step 4: insert the 11 real Blue Haven photos in order
INSERT INTO public.photos (property_id, url, alt_text, position, is_hero) VALUES
  ('11111111-1111-1111-1111-111111111111',
   'https://pcdojiarpptcgeoddfeg.supabase.co/storage/v1/object/public/property-media/properties/blue-haven-residence/blue-01.jpeg',
   'Blue Haven Residence — exterior', 0, true),
  ('11111111-1111-1111-1111-111111111111',
   'https://pcdojiarpptcgeoddfeg.supabase.co/storage/v1/object/public/property-media/properties/blue-haven-residence/blue-02.jpeg',
   'Blue Haven Residence', 1, false),
  ('11111111-1111-1111-1111-111111111111',
   'https://pcdojiarpptcgeoddfeg.supabase.co/storage/v1/object/public/property-media/properties/blue-haven-residence/blue-03.jpeg',
   'Blue Haven Residence', 2, false),
  ('11111111-1111-1111-1111-111111111111',
   'https://pcdojiarpptcgeoddfeg.supabase.co/storage/v1/object/public/property-media/properties/blue-haven-residence/blue-04.jpeg',
   'Blue Haven Residence', 3, false),
  ('11111111-1111-1111-1111-111111111111',
   'https://pcdojiarpptcgeoddfeg.supabase.co/storage/v1/object/public/property-media/properties/blue-haven-residence/blue-05.jpeg',
   'Blue Haven Residence', 4, false),
  ('11111111-1111-1111-1111-111111111111',
   'https://pcdojiarpptcgeoddfeg.supabase.co/storage/v1/object/public/property-media/properties/blue-haven-residence/blue-06.jpeg',
   'Blue Haven Residence', 5, false),
  ('11111111-1111-1111-1111-111111111111',
   'https://pcdojiarpptcgeoddfeg.supabase.co/storage/v1/object/public/property-media/properties/blue-haven-residence/blue-07.jpeg',
   'Blue Haven Residence', 6, false),
  ('11111111-1111-1111-1111-111111111111',
   'https://pcdojiarpptcgeoddfeg.supabase.co/storage/v1/object/public/property-media/properties/blue-haven-residence/blue-08.jpeg',
   'Blue Haven Residence', 7, false),
  ('11111111-1111-1111-1111-111111111111',
   'https://pcdojiarpptcgeoddfeg.supabase.co/storage/v1/object/public/property-media/properties/blue-haven-residence/blue-09.jpeg',
   'Blue Haven Residence', 8, false),
  ('11111111-1111-1111-1111-111111111111',
   'https://pcdojiarpptcgeoddfeg.supabase.co/storage/v1/object/public/property-media/properties/blue-haven-residence/blue-10.jpeg',
   'Blue Haven Residence', 9, false),
  ('11111111-1111-1111-1111-111111111111',
   'https://pcdojiarpptcgeoddfeg.supabase.co/storage/v1/object/public/property-media/properties/blue-haven-residence/blue-11.jpeg',
   'Blue Haven Residence', 10, false);

-- Step 5: set Blue Haven's new hero photo + hero video
UPDATE public.properties
SET
  hero_image_url = 'https://pcdojiarpptcgeoddfeg.supabase.co/storage/v1/object/public/property-media/properties/blue-haven-residence/blue-01.jpeg',
  hero_video_url = 'https://pcdojiarpptcgeoddfeg.supabase.co/storage/v1/object/public/property-media/properties/blue-haven-residence/blue-hero.mp4'
WHERE id = '11111111-1111-1111-1111-111111111111';

-- Step 6: re-number Green Haven's incoming photos so positions don't collide
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY position, created_at) - 1 AS new_pos
  FROM public.photos
  WHERE property_id = '22222222-1111-1111-1111-111111111111'
)
UPDATE public.photos p
SET position = ordered.new_pos
FROM ordered
WHERE p.id = ordered.id;
