-- 030 — Split Blue Haven bedroom photos between Slaapkamer 1 (warm, pendant
-- lamps, art shelf) and Slaapkamer 2 (white walls, AC, picture window), to
-- match how the listing groups them on Airbnb.

BEGIN;

-- Slaapkamer 1 — the warm-toned bedroom with the wooden ladder rack and
-- the pink art shelf.
UPDATE photos SET position = 13, alt_text = 'Bedroom 1'
  WHERE url LIKE '%0556abc7%';
UPDATE photos SET position = 14, alt_text = 'Bedroom 1 — wide angle'
  WHERE url LIKE '%bfc68771%';
UPDATE photos SET position = 15, alt_text = 'Bedroom 1 — art shelf'
  WHERE url LIKE '%6aa03ca6%';

-- Slaapkamer 2 — the white-walled bedroom with the picture window.
UPDATE photos SET position = 16, alt_text = 'Bedroom 2'
  WHERE url LIKE '%55ff32fc%';

COMMIT;
