"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { calculatePrice, type StayType } from "@/lib/pricing";

export type CreateBookingInput = {
  unitId: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  numGuests: number;
  stayType: StayType;
  guestName: string;
  guestPhone: string | null;
  notes: string | null;
};

export type CreateBookingResult =
  | { ok: true; reference: string; bookingId: string }
  | { ok: false; error: string };

const ERRORS: Record<string, string> = {
  login_required: "Please sign in before booking.",
  invalid_dates: "Check-out must be after check-in.",
  invalid_guests: "Add at least one guest.",
  invalid_stay_type: "Invalid stay type.",
  user_email_missing: "Your account is missing an email — try signing out and back in.",
  unit_not_bookable: "This residence isn't taking bookings right now.",
  dates_unavailable:
    "Those dates are already booked. Please pick another range.",
};

export async function createBooking(
  input: CreateBookingInput,
): Promise<CreateBookingResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: ERRORS.login_required };

  // Re-fetch unit + seasons server-side to compute the canonical price
  // (don't trust whatever the client showed).
  const [{ data: unitRow }, { data: seasonsRows }] = await Promise.all([
    supabase
      .from("units")
      .select(
        "id, base_price_eur, cleaning_fee_eur, long_stay_monthly_price_eur, min_long_stay_months, status, property_id",
      )
      .eq("id", input.unitId)
      .maybeSingle(),
    supabase
      .from("pricing_seasons")
      .select("start_date, end_date, price_multiplier, fixed_price_eur")
      .eq("unit_id", input.unitId),
  ]);
  if (!unitRow) return { ok: false, error: ERRORS.unit_not_bookable };
  const unit = unitRow as {
    id: string;
    base_price_eur: number;
    cleaning_fee_eur: number;
    long_stay_monthly_price_eur: number | null;
    min_long_stay_months: number;
    status: string;
  };
  if (unit.status !== "active") {
    return { ok: false, error: ERRORS.unit_not_bookable };
  }

  const checkIn = new Date(input.checkIn + "T00:00:00Z");
  const checkOut = new Date(input.checkOut + "T00:00:00Z");
  if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
    return { ok: false, error: ERRORS.invalid_dates };
  }

  const breakdown = calculatePrice(
    {
      base_price_eur: Number(unit.base_price_eur),
      cleaning_fee_eur: Number(unit.cleaning_fee_eur),
      long_stay_monthly_price_eur:
        unit.long_stay_monthly_price_eur === null
          ? null
          : Number(unit.long_stay_monthly_price_eur),
      min_long_stay_months: unit.min_long_stay_months,
    },
    (seasonsRows ?? []) as {
      start_date: string;
      end_date: string;
      price_multiplier: number | null;
      fixed_price_eur: number | null;
    }[],
    checkIn,
    checkOut,
    input.stayType,
  );

  const { data: rpcData, error: rpcErr } = await supabase.rpc("create_booking", {
    p_unit_id: input.unitId,
    p_check_in: input.checkIn,
    p_check_out: input.checkOut,
    p_num_guests: input.numGuests,
    p_stay_type: input.stayType,
    p_guest_name: input.guestName,
    p_guest_phone: input.guestPhone,
    p_notes: input.notes,
    p_subtotal_eur: breakdown.subtotal,
    p_cleaning_fee_eur: breakdown.cleaning_fee,
    p_total_eur: breakdown.total,
  });
  if (rpcErr) return { ok: false, error: rpcErr.message };

  const result = rpcData as
    | { ok: true; reference: string; booking_id: string }
    | { ok: false; error: string };
  if (!result.ok) {
    return { ok: false, error: ERRORS[result.error] ?? result.error };
  }

  revalidatePath("/account");
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  return { ok: true, reference: result.reference, bookingId: result.booking_id };
}
