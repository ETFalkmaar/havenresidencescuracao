"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const ADMIN_MODE_COOKIE = "admin_mode";

export type AdminMode = "easy" | "advanced";

export async function setAdminMode(mode: AdminMode) {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_MODE_COOKIE, mode, {
    path: "/admin",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/admin", "layout");
}
