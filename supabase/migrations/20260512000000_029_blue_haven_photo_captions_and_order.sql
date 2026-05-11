-- 029 — Re-caption and re-order the Blue Haven photos by category.
-- Group order: pool → living → kitchen → bedroom → bathroom → terrace → beach.
--
-- The PhotoGallery on /blue-haven-residence renders alt_text below each
-- thumbnail; the homepage hero slideshow uses the same ordering so the
-- pool shot stays the marquee photo.

BEGIN;

-- ----- Pool (the headline amenity) -----
UPDATE photos SET position =  0, is_hero = true,  alt_text = 'Private pool'
  WHERE url LIKE '%65f10db0%';
UPDATE photos SET position =  1, is_hero = false, alt_text = 'Pool with tropical entrance'
  WHERE url LIKE '%61471d74%';
UPDATE photos SET position =  2, is_hero = false, alt_text = 'Pool deck with outdoor dining'
  WHERE url LIKE '%8a2ff804%';
UPDATE photos SET position =  3, is_hero = false, alt_text = 'Pool with view and loungers'
  WHERE url LIKE '%8a00af4f%';
UPDATE photos SET position =  4, is_hero = false, alt_text = 'Pool and wood terrace'
  WHERE url LIKE '%d8666f88%';
UPDATE photos SET position =  5, is_hero = false, alt_text = 'Pool — exterior view'
  WHERE url LIKE '%53ec38b8%';

-- ----- Living room -----
UPDATE photos SET position =  6, is_hero = false, alt_text = 'Lounge by the pool'
  WHERE url LIKE '%f58a8210%';
UPDATE photos SET position =  7, is_hero = false, alt_text = 'Living & dining room'
  WHERE url LIKE '%c97285c0%';
UPDATE photos SET position =  8, is_hero = false, alt_text = 'Living & dining — wide angle'
  WHERE url LIKE '%0e891cad%';
UPDATE photos SET position =  9, is_hero = false, alt_text = 'Living room with Smart TV'
  WHERE url LIKE '%e2cbb50a%';
UPDATE photos SET position = 10, is_hero = false, alt_text = 'Living room — terrace view'
  WHERE url LIKE '%e8c4b901%';
UPDATE photos SET position = 11, is_hero = false, alt_text = 'Living room — pool view'
  WHERE url LIKE '%cca5b2b7%';

-- ----- Kitchen -----
UPDATE photos SET position = 12, is_hero = false, alt_text = 'Kitchen with breakfast bar'
  WHERE url LIKE '%fa412db9%';

-- ----- Bedroom -----
UPDATE photos SET position = 13, is_hero = false, alt_text = 'Bedroom'
  WHERE url LIKE '%0556abc7%';
UPDATE photos SET position = 14, is_hero = false, alt_text = 'Bedroom — close view'
  WHERE url LIKE '%55ff32fc%';
UPDATE photos SET position = 15, is_hero = false, alt_text = 'Bedroom — wide angle'
  WHERE url LIKE '%bfc68771%';
UPDATE photos SET position = 16, is_hero = false, alt_text = 'Bedroom — art shelf'
  WHERE url LIKE '%6aa03ca6%';

-- ----- Bathroom -----
UPDATE photos SET position = 17, is_hero = false, alt_text = 'Bathroom with double sink'
  WHERE url LIKE '%f6498900%';

-- ----- Terrace & resort -----
UPDATE photos SET position = 18, is_hero = false, alt_text = 'Terrace with palm and view'
  WHERE url LIKE '%d4f1b187%';
UPDATE photos SET position = 19, is_hero = false, alt_text = 'Sunset terrace with wine'
  WHERE url LIKE '%d7a17b85%';
UPDATE photos SET position = 20, is_hero = false, alt_text = 'Blue Bay Resort — view'
  WHERE url LIKE '%e52bf004%';

-- ----- Blue Bay beach -----
UPDATE photos SET position = 21, is_hero = false, alt_text = 'Blue Bay beach at sunset'
  WHERE url LIKE '%523b6289%';
UPDATE photos SET position = 22, is_hero = false, alt_text = 'Blue Bay beach club'
  WHERE url LIKE '%a8f6a311%';

COMMIT;
