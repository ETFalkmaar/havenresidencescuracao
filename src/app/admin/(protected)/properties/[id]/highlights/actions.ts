'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export type Result = { ok: true } | { error: string };

async function getPropertySlug(propertyId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('properties')
    .select('slug')
    .eq('id', propertyId)
    .maybeSingle();
  return data?.slug ?? null;
}

function flush(slug: string | null, propertyId: string) {
  revalidatePath(`/admin/properties/${propertyId}/highlights`);
  if (slug) revalidatePath(`/${slug}`);
}

export async function addHighlight(
  propertyId: string,
  formData: FormData
): Promise<Result> {
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  if (!title || !description) return { error: 'Titel en beschrijving zijn verplicht.' };

  const supabase = await createClient();
  const { data: maxOrder } = await supabase
    .from('property_highlights')
    .select('display_order')
    .eq('property_id', propertyId)
    .order('display_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from('property_highlights').insert({
    property_id: propertyId,
    title,
    description,
    display_order: (maxOrder?.display_order ?? -1) + 1,
  });
  if (error) return { error: error.message };

  flush(await getPropertySlug(propertyId), propertyId);
  return { ok: true };
}

export async function updateHighlight(
  propertyId: string,
  highlightId: string,
  formData: FormData
): Promise<Result> {
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  if (!title || !description) return { error: 'Titel en beschrijving zijn verplicht.' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('property_highlights')
    .update({ title, description })
    .eq('id', highlightId);
  if (error) return { error: error.message };

  flush(await getPropertySlug(propertyId), propertyId);
  return { ok: true };
}

export async function deleteHighlight(
  propertyId: string,
  highlightId: string
): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('property_highlights')
    .delete()
    .eq('id', highlightId);
  if (error) return { error: error.message };

  flush(await getPropertySlug(propertyId), propertyId);
  return { ok: true };
}
