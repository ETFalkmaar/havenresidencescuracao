"use server";

import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n/server";

export type ManagementInquiryResult =
  | { ok: true }
  | { ok: false; error: string };

export async function submitManagementInquiry(
  formData: FormData,
): Promise<ManagementInquiryResult> {
  const { t } = await getTranslations();
  const tr = t.management;

  const name = (formData.get("name") as string | null)?.trim();
  const email = (formData.get("email") as string | null)?.trim();
  const phone = (formData.get("phone") as string | null)?.trim() || null;
  const address = (formData.get("address") as string | null)?.trim() || null;
  const message = (formData.get("message") as string | null)?.trim();

  if (!name || !email || !message) {
    return { ok: false, error: tr.formError };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: tr.formError };
  }
  if (message.length > 5000) {
    return { ok: false, error: tr.formError };
  }

  // Store the address inside preferred_dates so we don't need a schema change;
  // admins see it labelled "Property location" in the inquiries dashboard.
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("inquiries").insert({
      name,
      email,
      phone,
      message,
      preferred_dates: address,
      property_id: null,
      kind: "management",
    });
    if (error) {
      console.error("management inquiry insert error", error);
      return { ok: false, error: tr.formError };
    }
    return { ok: true };
  } catch (err) {
    console.error("submitManagementInquiry exception", err);
    return { ok: false, error: tr.formError };
  }
}
