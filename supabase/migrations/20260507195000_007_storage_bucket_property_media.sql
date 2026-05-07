-- Bucket for property/unit photos. Public read so URLs work in <img src> on
-- the public site; writes are gated to admins via RLS on storage.objects.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-media',
  'property-media',
  true,
  10485760, -- 10 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public can SELECT (read) any object in property-media
DROP POLICY IF EXISTS "property_media public read" ON storage.objects;
CREATE POLICY "property_media public read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'property-media');

-- Only admins can INSERT into property-media
DROP POLICY IF EXISTS "property_media admin insert" ON storage.objects;
CREATE POLICY "property_media admin insert" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'property-media' AND public.is_admin());

-- Only admins can UPDATE
DROP POLICY IF EXISTS "property_media admin update" ON storage.objects;
CREATE POLICY "property_media admin update" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'property-media' AND public.is_admin())
  WITH CHECK (bucket_id = 'property-media' AND public.is_admin());

-- Only admins can DELETE
DROP POLICY IF EXISTS "property_media admin delete" ON storage.objects;
CREATE POLICY "property_media admin delete" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'property-media' AND public.is_admin());
