-- 028 — Sync Blue Haven Residence with the live Airbnb listing.
--
-- Source: https://www.airbnb.nl/rooms/1594762654955577924
-- Scraped on 2026-05-11. Pulls in:
--   * the full Dutch + English description and tagline
--   * 23 listing photos (hosted on Airbnb's muscache CDN)
--   * the full amenity catalogue from the listing
--   * the one published review (LaChana, March 2026)

BEGIN;

-- ---------- 1) Property: description / tagline / short_description ----------
UPDATE properties
SET
  tagline = 'Private pool · 100m from the beach · Blue Bay Resort',
  tagline_nl = 'Privézwembad · 100m van zee · Blue Bay Resort',
  short_description = 'Stylish two-bedroom apartment inside the exclusive Blue Bay Resort, with a private pool and the beach a 100-metre walk away.',
  short_description_nl = 'Stijlvol appartement met twee slaapkamers in het exclusieve Blue Bay Resort, met privézwembad en op slechts 100 meter van het strand.',
  description = E'Experience luxury and comfort in our stylish apartment on the exclusive Blue Bay Resort Curaçao. The apartment has two spacious bedrooms and sleeps up to 5 guests. Enjoy your private pool and walk just 100 metres to the beautiful beach. As a guest you have access to all resort facilities including restaurants, beach clubs, an 18-hole golf course and 24/7 security. Centrally located near Willemstad and ideal for exploring both Westpunt and the east side of the island.\n\nAbout the area — Blue Bay Resort Curaçao is an exclusive, secured resort on one of the island''s most beautiful beaches. The grounds are spacious, green and perfectly maintained, with luxury villas and apartments in a quiet, tropical setting. Guests enjoy a private beach with crystal-clear water, excellent restaurants and beach clubs, an 18-hole golf course, tennis courts and walking paths. Thanks to its central location near Willemstad and excellent accessibility, Blue Bay is the ideal combination of calm, comfort and luxury resort facilities.',
  description_nl = E'Ervaar luxe en comfort in ons stijlvolle appartement op het exclusieve Blue Bay Resort Curaçao. Het appartement beschikt over twee ruime slaapkamers en biedt plaats aan maximaal 5 gasten. Geniet van uw privézwembad en loop in slechts 100 meter naar het prachtige strand. Als gast heeft u toegang tot alle resortfaciliteiten zoals restaurants, beachclubs, golfbaan en 24/7 beveiliging. Centraal gelegen nabij Willemstad en ideaal om zowel Westpunt als de oostkant van het eiland te ontdekken.\n\nOver de omgeving — Blue Bay Resort Curaçao is een exclusief en beveiligd resort aan één van de mooiste stranden van het eiland. Het terrein is ruim opgezet, groen en perfect onderhouden, met luxe villa''s en appartementen in een rustige, tropische omgeving. Gasten genieten hier van een privéstrand met helderblauw water, uitstekende restaurants en beachclubs, een 18-holes golfbaan, tennisbanen en wandelpaden. Dankzij de centrale ligging nabij Willemstad en de uitstekende bereikbaarheid is Blue Bay de ideale combinatie van rust, comfort en luxe resortfaciliteiten.'
WHERE slug = 'blue-haven-residence';

-- ---------- 2) Unit: capacity 5, refreshed description ----------
UPDATE units
SET
  max_guests = 5,
  description = 'Two spacious bedrooms, each with a queen-size bed. Private pool, outdoor dining and sun loungers. Living room with a Smart TV, full kitchen with dishwasher and barbecue, and one complete bathroom. Sleeps up to five guests.'
WHERE property_id = '11111111-1111-1111-1111-111111111111';

-- ---------- 3) Photos — replace with the 23 from the Airbnb listing ----------
DELETE FROM photos WHERE property_id = '11111111-1111-1111-1111-111111111111';

INSERT INTO photos (property_id, url, alt_text, position, is_hero) VALUES
  ('11111111-1111-1111-1111-111111111111', 'https://a0.muscache.com/im/pictures/hosting/Hosting-1594762654955577924/original/65f10db0-76c4-4468-8561-7eba114ea7b9.jpeg?im_w=1920', 'Blue Haven Residence — private pool with sun deck',                       0, true),
  ('11111111-1111-1111-1111-111111111111', 'https://a0.muscache.com/im/pictures/hosting/Hosting-1594762654955577924/original/61471d74-c3ce-49db-8cdf-f59aad5b52cc.jpeg?im_w=1920', 'Blue Haven Residence — tropical entrance and terrace',                    1, false),
  ('11111111-1111-1111-1111-111111111111', 'https://a0.muscache.com/im/pictures/hosting/Hosting-1594762654955577924/original/f58a8210-18ce-4417-b5e3-d0fe3a0f5d21.jpeg?im_w=1920', 'Blue Haven Residence — open-plan living room',                            2, false),
  ('11111111-1111-1111-1111-111111111111', 'https://a0.muscache.com/im/pictures/hosting/Hosting-1594762654955577924/original/c97285c0-0679-4a1e-acdb-9c9cedd02059.jpeg?im_w=1920', 'Blue Haven Residence — lounge area by the pool',                          3, false),
  ('11111111-1111-1111-1111-111111111111', 'https://a0.muscache.com/im/pictures/hosting/Hosting-1594762654955577924/original/0556abc7-89aa-40a3-a3d5-5d02d8e4f312.jpeg?im_w=1920', 'Blue Haven Residence — main bedroom',                                     4, false),
  ('11111111-1111-1111-1111-111111111111', 'https://a0.muscache.com/im/pictures/hosting/Hosting-1594762654955577924/original/55ff32fc-fe48-4f5a-8dde-8e466c737d6d.jpeg?im_w=1920', 'Blue Haven Residence — second bedroom',                                   5, false),
  ('11111111-1111-1111-1111-111111111111', 'https://a0.muscache.com/im/pictures/hosting/Hosting-1594762654955577924/original/e2cbb50a-d133-4a59-865f-b36998079bcf.jpeg?im_w=1920', 'Blue Haven Residence — kitchen and dining',                               6, false),
  ('11111111-1111-1111-1111-111111111111', 'https://a0.muscache.com/im/pictures/hosting/Hosting-1594762654955577924/original/fa412db9-6065-4307-95e5-09793e46968e.jpeg?im_w=1920', 'Blue Haven Residence — bathroom',                                         7, false),
  ('11111111-1111-1111-1111-111111111111', 'https://a0.muscache.com/im/pictures/hosting/Hosting-1594762654955577924/original/f6498900-1b40-4e4c-8851-1339fe66e58f.jpeg?im_w=1920', 'Blue Haven Residence — pool by daylight',                                 8, false),
  ('11111111-1111-1111-1111-111111111111', 'https://a0.muscache.com/im/pictures/hosting/Hosting-1594762654955577924/original/d4f1b187-0bdd-4ede-ab07-5a2ef8022d27.jpeg?im_w=1920', 'Blue Haven Residence — palm garden',                                      9, false),
  ('11111111-1111-1111-1111-111111111111', 'https://a0.muscache.com/im/pictures/hosting/Hosting-1594762654955577924/original/e8c4b901-93f1-46b2-95a7-647303a42933.jpeg?im_w=1920', 'Blue Haven Residence — interior view',                                    10, false),
  ('11111111-1111-1111-1111-111111111111', 'https://a0.muscache.com/im/pictures/hosting/Hosting-1594762654955577924/original/cca5b2b7-57e6-48cd-a409-2ab80a8f34b3.jpeg?im_w=1920', 'Blue Haven Residence — interior detail',                                  11, false),
  ('11111111-1111-1111-1111-111111111111', 'https://a0.muscache.com/im/pictures/hosting/Hosting-1594762654955577924/original/0e891cad-6cc0-47d2-ad40-5812aabf02ec.jpeg?im_w=1920', 'Blue Haven Residence — interior detail',                                  12, false),
  ('11111111-1111-1111-1111-111111111111', 'https://a0.muscache.com/im/pictures/hosting/Hosting-1594762654955577924/original/6aa03ca6-74dd-4f48-827b-2620d556c6d2.jpeg?im_w=1920', 'Blue Haven Residence — interior detail',                                  13, false),
  ('11111111-1111-1111-1111-111111111111', 'https://a0.muscache.com/im/pictures/hosting/Hosting-1594762654955577924/original/bfc68771-6678-40b2-bfdd-23391c99560c.jpeg?im_w=1920', 'Blue Haven Residence — interior detail',                                  14, false),
  ('11111111-1111-1111-1111-111111111111', 'https://a0.muscache.com/im/pictures/hosting/Hosting-1594762654955577924/original/8a2ff804-13b1-413a-be27-dfb6ad098ae9.jpeg?im_w=1920', 'Blue Haven Residence — interior detail',                                  15, false),
  ('11111111-1111-1111-1111-111111111111', 'https://a0.muscache.com/im/pictures/hosting/Hosting-1594762654955577924/original/8a00af4f-2beb-401e-a77f-fef097df6081.jpeg?im_w=1920', 'Blue Haven Residence — interior detail',                                  16, false),
  ('11111111-1111-1111-1111-111111111111', 'https://a0.muscache.com/im/pictures/hosting/Hosting-1594762654955577924/original/d8666f88-c356-4a67-a868-c4f7edbf8885.jpeg?im_w=1920', 'Blue Haven Residence — outdoor area',                                     17, false),
  ('11111111-1111-1111-1111-111111111111', 'https://a0.muscache.com/im/pictures/hosting/Hosting-1594762654955577924/original/53ec38b8-da34-4184-87e9-04051c0d3f21.jpeg?im_w=1920', 'Blue Haven Residence — outdoor area',                                     18, false),
  ('11111111-1111-1111-1111-111111111111', 'https://a0.muscache.com/im/pictures/hosting/Hosting-1594762654955577924/original/523b6289-b707-4700-82a1-64a9ce51624a.jpeg?im_w=1920', 'Blue Haven Residence — Blue Bay resort path',                             19, false),
  ('11111111-1111-1111-1111-111111111111', 'https://a0.muscache.com/im/pictures/hosting/Hosting-1594762654955577924/original/d7a17b85-7b45-4aa4-9911-e757d4abc7e0.jpeg?im_w=1920', 'Blue Haven Residence — Blue Bay beach',                                   20, false),
  ('11111111-1111-1111-1111-111111111111', 'https://a0.muscache.com/im/pictures/hosting/Hosting-1594762654955577924/original/a8f6a311-0da5-4f16-a31d-da8934a33f67.jpeg?im_w=1920', 'Blue Haven Residence — Blue Bay beach',                                   21, false),
  ('11111111-1111-1111-1111-111111111111', 'https://a0.muscache.com/im/pictures/hosting/Hosting-1594762654955577924/original/e52bf004-0068-4676-a5bc-2475b257959f.jpeg?im_w=1920', 'Blue Haven Residence — sunset view',                                      22, false);

-- Sync the hero_image_url on the property so the OG image and any place that
-- falls back to it stay in lock-step with the new gallery.
UPDATE properties
SET hero_image_url = 'https://a0.muscache.com/im/pictures/hosting/Hosting-1594762654955577924/original/65f10db0-76c4-4468-8561-7eba114ea7b9.jpeg?im_w=1920'
WHERE slug = 'blue-haven-residence';

-- ---------- 4) Amenities: extend the catalogue to cover the listing ----------
INSERT INTO amenities (slug, name, icon, category) VALUES
  ('dishwasher',         'Dishwasher',                'utensils',    'kitchen'),
  ('freezer',            'Freezer',                   'utensils',    'kitchen'),
  ('oven',               'Oven',                      'utensils',    'kitchen'),
  ('stove',              'Stove',                     'utensils',    'kitchen'),
  ('microwave',          'Microwave',                 'utensils',    'kitchen'),
  ('coffee_maker',       'Coffee maker',              'utensils',    'kitchen'),
  ('kettle',             'Kettle',                    'utensils',    'kitchen'),
  ('toaster',            'Toaster',                   'utensils',    'kitchen'),
  ('blender',            'Blender',                   'utensils',    'kitchen'),
  ('wine_glasses',       'Wine glasses',              'utensils',    'kitchen'),
  ('cookware',           'Pots, pans, oil & spices',  'utensils',    'kitchen'),
  ('dishes',             'Dishes & cutlery',          'utensils',    'kitchen'),
  ('refrigerator',       'Refrigerator',              'utensils',    'kitchen'),
  ('bbq',                'BBQ grill',                 'flame',       'outdoor'),
  ('outdoor_dining',     'Outdoor dining area',       'tree-palm',   'outdoor'),
  ('lounge_chairs',      'Sun loungers',              'sun',         'outdoor'),
  ('beach_access',       'Beach access',              'umbrella',    'outdoor'),
  ('resort_access',      'Resort access',             'palmtree',    'outdoor'),
  ('blackout',           'Blackout curtains',         'moon',        'comfort'),
  ('iron',               'Iron',                      'shirt',       'comfort'),
  ('hangers',            'Hangers',                   'shirt',       'comfort'),
  ('extra_bedding',      'Extra pillows & blankets',  'bed',         'comfort'),
  ('closet_storage',     'Closet storage',            'archive',     'comfort'),
  ('books',              'Books & reading material',  'book',        'comfort'),
  ('fire_extinguisher',  'Fire extinguisher',         'flame',       'safety'),
  ('first_aid',          'First aid kit',             'plus-circle', 'safety')
ON CONFLICT (slug) DO NOTHING;

-- ---------- 5) Link the right amenities to the Blue Haven unit ----------
INSERT INTO unit_amenities (unit_id, amenity_id)
SELECT '11111111-2222-2222-2222-222222222222'::uuid, id
FROM amenities
WHERE slug IN (
  -- Comfort & bedroom
  'air_conditioning','linen','wifi','tv','washing_machine','cleaning',
  'extra_bedding','blackout','iron','hangers','closet_storage','books',
  -- Kitchen
  'kitchen','refrigerator','freezer','dishwasher','oven','stove',
  'microwave','coffee_maker','kettle','toaster','blender','wine_glasses',
  'cookware','dishes',
  -- Outdoor & resort
  'pool','balcony','outdoor_dining','bbq','lounge_chairs',
  'beach_access','beach_nearby','resort_access',
  -- Safety & parking
  'parking_private','gated','fire_extinguisher','first_aid','safe'
)
ON CONFLICT (unit_id, amenity_id) DO NOTHING;

-- ---------- 6) Review from the listing (LaChana, March 2026) ----------
DELETE FROM reviews
WHERE unit_id = '11111111-2222-2222-2222-222222222222'
  AND guest_name = 'LaChana';

INSERT INTO reviews (unit_id, guest_name, rating, title, body, language, is_published)
VALUES (
  '11111111-2222-2222-2222-222222222222',
  'LaChana',
  5,
  'Niets minder dan geweldig',
  E'Ons verblijf was niets minder dan geweldig. De accommodatie is gelegen in een omheinde buurt in de buurt van een plaatselijk strand. Vanaf het moment dat we aankwamen waren onze verhuurders, Romy en Irvin, allebei behulpzaam. We kregen een uitgebreide rondleiding door het huis, waardoor we ons op ons gemak voelden. Irvin was warm en gastvrij en hielp ons bij elke stap. Hij liet ons niet alleen leuke dingen zien om te doen, maar hij boekte ook gratis een fotoshoot. We hebben echt genoten van ons verblijf en kunnen niet wachten om terug te komen!',
  'nl',
  true
);

COMMIT;
