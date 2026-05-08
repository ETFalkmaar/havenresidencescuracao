-- Add NL translation columns and seed Dutch values for Blue/Green Haven and the
-- site-wide brand text. Existing English columns stay; the public site picks
-- the right column based on the cookie-driven language preference.

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS brand_tagline_nl text,
  ADD COLUMN IF NOT EXISTS brand_description_nl text;

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS tagline_nl text,
  ADD COLUMN IF NOT EXISTS short_description_nl text,
  ADD COLUMN IF NOT EXISTS description_nl text;

UPDATE public.site_settings
SET
  brand_tagline_nl = 'Premium verblijven op het eiland Curaçao',
  brand_description_nl = 'Een zorgvuldig samengestelde collectie vakantie- en langetermijnwoningen verspreid over de mooiste plekken van Curaçao.'
WHERE id = 1;

UPDATE public.properties
SET
  tagline_nl = 'Strandverblijf aan de Blue Bay',
  short_description_nl = 'Een sereen verblijf in een beveiligd resort aan de zachte witte stranden van Blue Bay — voor korte escapes en langere winterverblijven.',
  description_nl = 'Blue Haven Residence ligt in een van Curaçao''s meest exclusieve beveiligde resorts aan de Blue Bay. Word wakker met oceaanbriesjes, loop binnen enkele minuten naar het strand, en geniet van privéparkeren binnen het beveiligde terrein. Ontworpen voor reizigers die de rust van een residentiële setting willen met de vrijheid van een vijfsterrenresort.'
WHERE slug = 'blue-haven-residence';

UPDATE public.properties
SET
  tagline_nl = 'Authentiek eilandleven in Emmastad',
  short_description_nl = 'Een residentieel rustpunt in het groene Emmastad — binnenkort beschikbaar voor korte verblijven en langere residenties.',
  description_nl = 'Gelegen in het groene hart van Emmastad biedt Green Haven Residence een authentieker, residentieel gevoel — dichtbij dagelijkse voorzieningen, en op een korte rit van Willemstad en de stranden.'
WHERE slug = 'green-haven-residence';
