'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';

type PropertyUpdate = Database['public']['Tables']['properties']['Update'];

function toInt(value: FormDataEntryValue | null): number | null {
  if (value === null) return null;
  const n = parseInt(String(value), 10);
  return Number.isFinite(n) ? n : null;
}

function toText(value: FormDataEntryValue | null): string {
  return String(value ?? '').trim();
}

function toTextOrNull(value: FormDataEntryValue | null): string | null {
  const v = toText(value);
  return v.length > 0 ? v : null;
}

export type UpdateResult = { ok: true } | { error: string };

export async function updateProperty(
  id: string,
  formData: FormData
): Promise<UpdateResult> {
  const supabase = await createClient();

  const update: PropertyUpdate = {
    name: toText(formData.get('name')),
    location: toText(formData.get('location')),
    short_description: toText(formData.get('short_description')),
    description: toText(formData.get('description')),
    hero_photo_src: toText(formData.get('hero_photo_src')),
    hero_photo_alt: toText(formData.get('hero_photo_alt')),
    max_guests: toInt(formData.get('max_guests')) ?? 0,
    max_guests_note: toTextOrNull(formData.get('max_guests_note')),
    bedrooms: toInt(formData.get('bedrooms')) ?? 0,
    beds: toInt(formData.get('beds')) ?? 0,
    bathrooms: toInt(formData.get('bathrooms')) ?? 0,
    check_in: toText(formData.get('check_in')),
    check_out: toText(formData.get('check_out')),
    base_price_per_night_usd: toInt(formData.get('base_price_per_night_usd')) ?? 0,
    cleaning_fee_usd: toInt(formData.get('cleaning_fee_usd')) ?? 0,
    deposit_usd: toInt(formData.get('deposit_usd')) ?? 0,
    long_term_nights: toInt(formData.get('long_term_nights')) ?? 28,
    long_term_discount_percent:
      toInt(formData.get('long_term_discount_percent')) ?? 10,
    min_nights: toInt(formData.get('min_nights')) ?? 1,
    high_season_note: toTextOrNull(formData.get('high_season_note')),
    cancellation_policy: toText(formData.get('cancellation_policy')),
    airbnb_ical_url: toTextOrNull(formData.get('airbnb_ical_url')),
    is_published: formData.get('is_published') === 'on',
  };

  const { error, data: updated } = await supabase
    .from('properties')
    .update(update)
    .eq('id', id)
    .select('slug')
    .single();

  if (error) {
    console.error('updateProperty failed:', error);
    return { error: error.message };
  }

  revalidatePath('/admin/properties');
  revalidatePath('/admin/properties/[id]', 'page');
  revalidatePath('/');
  revalidatePath('/accommodaties');
  if (updated?.slug) revalidatePath(`/${updated.slug}`);

  return { ok: true };
}
