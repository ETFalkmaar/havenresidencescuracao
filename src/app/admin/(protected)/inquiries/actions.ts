'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

const ALLOWED_STATUSES = ['new', 'in_progress', 'replied', 'closed'] as const;
type InquiryStatus = (typeof ALLOWED_STATUSES)[number];

function isInquiryStatus(value: string): value is InquiryStatus {
  return (ALLOWED_STATUSES as readonly string[]).includes(value);
}

export async function updateInquiryStatus(id: string, status: string) {
  if (!isInquiryStatus(status)) return;
  const supabase = await createClient();
  await supabase.from('inquiries').update({ status }).eq('id', id);
  revalidatePath('/admin/inquiries');
  revalidatePath('/admin');
}
