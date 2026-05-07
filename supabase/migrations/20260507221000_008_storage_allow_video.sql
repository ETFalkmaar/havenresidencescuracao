-- Allow MP4 videos on the property-media bucket so we can host hero videos.
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'image/jpeg', 'image/png', 'image/webp', 'image/avif',
  'video/mp4', 'video/webm'
],
file_size_limit = 104857600 -- 100 MB (videos)
WHERE id = 'property-media';
