'use server';

import { createClient } from '@/lib/supabase/server';

export type InquiryResult = { ok: true } | { error: string };

export async function submitInquiry(
  formData: FormData
): Promise<InquiryResult> {
  const guest_name = String(formData.get('name') ?? '').trim();
  const guest_email = String(formData.get('email') ?? '').trim();
  const guest_phone = String(formData.get('phone') ?? '').trim() || null;
  const message = String(formData.get('message') ?? '').trim();

  if (!guest_name) return { error: 'Vul je naam in.' };
  if (!guest_email || !guest_email.includes('@')) {
    return { error: 'Vul een geldig email-adres in.' };
  }
  if (!message) return { error: 'Schrijf een bericht.' };
  if (message.length > 5000) {
    return { error: 'Bericht mag maximaal 5000 tekens zijn.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('inquiries').insert({
    guest_name,
    guest_email,
    guest_phone,
    message,
  });

  if (error) {
    console.error('submitInquiry failed:', error);
    return { error: 'Kon je bericht niet versturen. Probeer het later opnieuw.' };
  }

  return { ok: true };
}
