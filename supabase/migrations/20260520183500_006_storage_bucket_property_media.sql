-- Create storage bucket for property media (photos & later video)
insert into storage.buckets (id, name, public)
values ('property-media', 'property-media', true)
on conflict (id) do nothing;

-- Public read on bucket contents
create policy "property_media public read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'property-media');

-- Admin insert
create policy "property_media admin insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'property-media' and public.is_admin());

-- Admin update
create policy "property_media admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'property-media' and public.is_admin())
  with check (bucket_id = 'property-media' and public.is_admin());

-- Admin delete
create policy "property_media admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'property-media' and public.is_admin());
