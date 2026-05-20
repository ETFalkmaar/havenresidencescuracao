export type RoomPhoto = {
  src: string;
  alt: string;
};

export type Room = {
  slug: string;
  label: string;
  amenities: string[];
  photos: RoomPhoto[];
};

export type PropertyHighlight = {
  title: string;
  description: string;
};

export type PropertyPricing = {
  basePricePerNightUSD: number;
  cleaningFeeUSD: number;
  depositUSD: number;
  longTermNights: number;
  longTermDiscountPercent: number;
  minNights: number;
  highSeasonNote?: string;
};

export type PropertyStay = {
  maxGuests: number;
  maxGuestsNote?: string;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  checkIn: string;
  checkOut: string;
};

export type PropertyData = {
  slug: string;
  name: string;
  location: string;
  shortDescription: string;
  description: string;
  highlights: PropertyHighlight[];
  heroPhoto: RoomPhoto;
  stay: PropertyStay;
  pricing: PropertyPricing;
  houseRules: string[];
  cancellationPolicy: string;
  rooms: Room[];
};
