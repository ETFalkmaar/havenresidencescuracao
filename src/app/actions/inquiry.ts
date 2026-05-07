"use server";

import { createClient } from "@/lib/supabase/server";

export type InquiryResult = { ok: true } | { ok: false; error: string };

export async function submitInquiry(formData: FormData): Promise<InquiryResult> {
  const name = (formData.get("name") as string | null)?.trim();
  const email = (formData.get("email") as string | null)?.trim();
  const phone = (formData.get("phone") as string | null)?.trim() || null;
  const message = (formData.get("message") as string | null)?.trim();
  const preferred_dates =
    (formData.get("preferred_dates") as string | null)?.trim() || null;
  const property_id = (formData.get("property_id") as string | null) || null;

  if (!name || !email || !message) {
    return { ok: false, error: "Name, email and message are required." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (message.length > 5000) {
    return { ok: false, error: "Message is too long (max 5000 characters)." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("inquiries").insert({
      name,
      email,
      phone,
      message,
      preferred_dates,
      property_id,
    });
    if (error) {
      console.error("inquiry insert error", error);
      return { ok: false, error: "Could not submit. Please try again later." };
    }
    return { ok: true };
  } catch (err) {
    console.error("submitInquiry exception", err);
    return { ok: false, error: "Unexpected error. Please try again." };
  }
}
