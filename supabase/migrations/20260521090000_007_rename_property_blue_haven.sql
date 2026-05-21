-- 007 — Hernoem de accommodatie van "Blue Bay Paradise" naar "Blue Haven".
-- De slug (blue-bay-paradise) en locatie (Blue Bay Resort) blijven ongewijzigd:
-- de slug is de URL en "Blue Bay Resort" is het echte resort waar de woning ligt.
UPDATE public.properties
SET name = 'Blue Haven'
WHERE slug = 'blue-bay-paradise';
