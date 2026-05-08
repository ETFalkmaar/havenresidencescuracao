-- Owner correction: Blue Haven main unit has 1 bathroom, not 2.
UPDATE public.units
SET bathrooms = 1
WHERE id = '11111111-2222-2222-2222-222222222222';

-- Update site contact info to the brand-correct values:
--   email     → info@havenresidences.com
--   instagram → blue_haven_residences
UPDATE public.site_settings
SET
  contact_email = 'info@havenresidences.com',
  instagram_url = 'https://instagram.com/blue_haven_residences'
WHERE id = 1;
