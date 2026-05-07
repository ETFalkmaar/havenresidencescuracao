"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: true } | { ok: false; error: string };

const ALLOWED_STATUSES = ["new", "replied", "closed"] as const;
type Status = (typeof ALLOWED_STATUSES)[number];

export async function updateInquiryStatus(
  id: string,
  status: Status,
): Promise<ActionResult> {
  if (!ALLOWED_STATUSES.includes(status)) {
    return { ok: false, error: "Invalid status." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("inquiries")
    .update({ status })
    .eq("id", id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${id}`);
  revalidatePath("/admin");
  return { ok: true };
}
