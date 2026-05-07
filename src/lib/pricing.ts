export type StayType = "short" | "long";

export type Season = {
  start_date: string;
  end_date: string;
  price_multiplier: number | null;
  fixed_price_eur: number | null;
};

export type UnitForPricing = {
  base_price_eur: number;
  cleaning_fee_eur: number;
  long_stay_monthly_price_eur: number | null;
  min_long_stay_months: number;
};

export type PriceBreakdown = {
  stay_type: StayType;
  nights: number;
  months: number;
  per_night: number; // average per night for short stay; informational for long
  per_month: number | null;
  subtotal: number;
  cleaning_fee: number;
  total: number;
  long_stay_eligible: boolean;
};

function dayDiff(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / 86400000);
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function calculatePrice(
  unit: UnitForPricing,
  seasons: Season[],
  checkIn: Date,
  checkOut: Date,
  preferredStayType?: StayType,
): PriceBreakdown {
  const nights = Math.max(1, dayDiff(checkIn, checkOut));
  const months = nights / 30; // simple month equivalence
  const longStayEligible =
    unit.long_stay_monthly_price_eur !== null &&
    months >= unit.min_long_stay_months;

  const useLong =
    preferredStayType === "long" ||
    (preferredStayType !== "short" && longStayEligible);

  if (useLong && unit.long_stay_monthly_price_eur !== null) {
    const subtotal = unit.long_stay_monthly_price_eur * months;
    const cleaning = unit.cleaning_fee_eur;
    return {
      stay_type: "long",
      nights,
      months: Math.round(months * 10) / 10,
      per_night: subtotal / nights,
      per_month: unit.long_stay_monthly_price_eur,
      subtotal: Math.round(subtotal * 100) / 100,
      cleaning_fee: cleaning,
      total: Math.round((subtotal + cleaning) * 100) / 100,
      long_stay_eligible: longStayEligible,
    };
  }

  // Short-stay: per night with optional seasonal multiplier or fixed price
  let subtotal = 0;
  for (let i = 0; i < nights; i++) {
    const d = new Date(checkIn);
    d.setUTCDate(d.getUTCDate() + i);
    const dStr = isoDate(d);
    let nightPrice = unit.base_price_eur;
    for (const s of seasons) {
      if (dStr >= s.start_date && dStr <= s.end_date) {
        if (s.fixed_price_eur !== null) {
          nightPrice = s.fixed_price_eur;
        } else if (s.price_multiplier !== null) {
          nightPrice = unit.base_price_eur * Number(s.price_multiplier);
        }
        break;
      }
    }
    subtotal += nightPrice;
  }
  const cleaning = unit.cleaning_fee_eur;
  return {
    stay_type: "short",
    nights,
    months: Math.round(months * 10) / 10,
    per_night: Math.round((subtotal / nights) * 100) / 100,
    per_month: null,
    subtotal: Math.round(subtotal * 100) / 100,
    cleaning_fee: cleaning,
    total: Math.round((subtotal + cleaning) * 100) / 100,
    long_stay_eligible: longStayEligible,
  };
}

export function rangesOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  return aStart < bEnd && aEnd > bStart;
}
