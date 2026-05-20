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
  revalidatePath(`/admin/properties/${propertyId}/rules`);
  if (slug) revalidatePath(`/${slug}`);
}

export async function addRule(
  propertyId: string,
  formData: FormData
): Promise<Result> {
  const rule = String(formData.get('rule') ?? '').trim();
  if (!rule) return { error: 'Regel mag niet leeg zijn.' };

  const supabase = await createClient();
  const { data: maxOrder } = await supabase
    .from('property_house_rules')
    .select('display_order')
    .eq('property_id', propertyId)
    .order('display_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from('property_house_rules').insert({
    property_id: propertyId,
    rule,
    display_order: (maxOrder?.display_order ?? -1) + 1,
  });
  if (error) return { error: error.message };

  flush(await getPropertySlug(propertyId), propertyId);
  return { ok: true };
}

export async function updateRule(
  propertyId: string,
  ruleId: string,
  formData: FormData
): Promise<Result> {
  const rule = String(formData.get('rule') ?? '').trim();
  if (!rule) return { error: 'Regel mag niet leeg zijn.' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('property_house_rules')
    .update({ rule })
    .eq('id', ruleId);
  if (error) return { error: error.message };

  flush(await getPropertySlug(propertyId), propertyId);
  return { ok: true };
}

export async function deleteRule(
  propertyId: string,
  ruleId: string
): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('property_house_rules')
    .delete()
    .eq('id', ruleId);
  if (error) return { error: error.message };

  flush(await getPropertySlug(propertyId), propertyId);
  return { ok: true };
}
