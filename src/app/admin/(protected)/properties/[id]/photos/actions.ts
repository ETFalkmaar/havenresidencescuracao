'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export type PhotoActionResult = { ok: true } | { error: string };

/**
 * Add a photo row to property_photos after the file has been uploaded
 * to Supabase Storage (client-side). The src should be the storage path
 * we can later resolve via getPublicUrl, OR a full public URL.
 */
export async function addPhotoRow(
  roomId: string,
  src: string,
  alt: string,
  propertySlug: string
): Promise<PhotoActionResult> {
  if (!roomId || !src) return { error: 'roomId en src zijn verplicht.' };

  const supabase = await createClient();

  const { data: maxOrder } = await supabase
    .from('property_photos')
    .select('display_order')
    .eq('room_id', roomId)
    .order('display_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = (maxOrder?.display_order ?? -1) + 1;

  const { error } = await supabase.from('property_photos').insert({
    room_id: roomId,
    src,
    alt: alt || 'Foto',
    display_order: nextOrder,
  });

  if (error) {
    console.error('addPhotoRow failed:', error);
    return { error: error.message };
  }

  revalidatePath(`/admin/properties/[id]/photos`, 'page');
  revalidatePath(`/${propertySlug}`);
  return { ok: true };
}

export async function deletePhoto(
  photoId: string,
  storagePath: string | null,
  propertySlug: string
): Promise<PhotoActionResult> {
  const supabase = await createClient();

  // Verwijder eerst de DB-row, dan de storage-file (als die er is).
  const { error: rowError } = await supabase
    .from('property_photos')
    .delete()
    .eq('id', photoId);

  if (rowError) {
    console.error('deletePhoto row failed:', rowError);
    return { error: rowError.message };
  }

  if (storagePath) {
    const { error: fileError } = await supabase.storage
      .from('property-media')
      .remove([storagePath]);
    if (fileError) {
      // Niet kritisch — row is al weg. Log en ga door.
      console.warn('deletePhoto storage cleanup failed:', fileError);
    }
  }

  revalidatePath(`/admin/properties/[id]/photos`, 'page');
  revalidatePath(`/${propertySlug}`);
  return { ok: true };
}

export async function updatePhotoAlt(
  photoId: string,
  alt: string,
  propertySlug: string
): Promise<PhotoActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('property_photos')
    .update({ alt })
    .eq('id', photoId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/properties/[id]/photos`, 'page');
  revalidatePath(`/${propertySlug}`);
  return { ok: true };
}
