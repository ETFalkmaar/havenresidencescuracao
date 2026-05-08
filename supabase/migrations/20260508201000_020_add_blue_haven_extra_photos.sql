-- Add 4 new owner-uploaded photos to Blue Haven Residence:
--   bedroom (high-quality), beach daytime, beach sunset, wine + view.
-- Stored under public/properties/blue-haven-residence/ in the repo,
-- served from the same origin so no Next.js remotePatterns change needed.

INSERT INTO public.photos (property_id, url, alt_text, position, is_hero) VALUES
  ('11111111-1111-1111-1111-111111111111',
   '/properties/blue-haven-residence/blue-bedroom.jpeg',
   'Blue Haven Residence — bedroom', 100, false),
  ('11111111-1111-1111-1111-111111111111',
   '/properties/blue-haven-residence/blue-beach-day.jpeg',
   'Blue Haven Residence — beach by day', 101, false),
  ('11111111-1111-1111-1111-111111111111',
   '/properties/blue-haven-residence/blue-beach-sunset.jpeg',
   'Blue Haven Residence — beach at sunset', 102, false),
  ('11111111-1111-1111-1111-111111111111',
   '/properties/blue-haven-residence/blue-wine-view.jpeg',
   'Blue Haven Residence — wine on the terrace', 103, false);

WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY position, created_at) - 1 AS new_pos
  FROM public.photos
  WHERE property_id = '11111111-1111-1111-1111-111111111111'
)
UPDATE public.photos p
SET position = ordered.new_pos
FROM ordered
WHERE p.id = ordered.id;
