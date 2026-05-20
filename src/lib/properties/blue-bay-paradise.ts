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

export const blueBayParadise: PropertyData = {
  slug: 'blue-bay-paradise',
  name: 'Blue Bay Paradise',
  location: 'Blue Bay Resort, Willemstad, Curaçao',
  shortDescription:
    'Stijlvol appartement op het exclusieve Blue Bay Resort met privézwembad en op 100 meter van het strand.',
  description:
    'Ervaar luxe en comfort in ons stijlvolle appartement op het exclusieve Blue Bay Resort op Curaçao. Het appartement beschikt over twee ruime slaapkamers en biedt plaats aan maximaal 5 gasten. Geniet van je privézwembad en loop in slechts 100 meter naar het prachtige strand. Als gast heb je toegang tot alle resortfaciliteiten zoals restaurants, beachclubs, golfbaan en 24/7 beveiliging. Centraal gelegen nabij Willemstad en ideaal om zowel Westpunt als de oostkant van het eiland te ontdekken.',
  highlights: [
    {
      title: 'Privézwembad',
      description: 'Eigen zwembad direct bij de woning — duik er meteen in.',
    },
    {
      title: '100 m van het strand',
      description: 'Wandel binnen enkele minuten naar het prachtige Blue Bay strand.',
    },
    {
      title: 'Resort-faciliteiten',
      description: 'Restaurants, beachclubs, golfbaan en 24/7 beveiliging binnen het resort.',
    },
    {
      title: 'Centrale locatie',
      description: 'Nabij Willemstad — ontdek zowel Westpunt als de oostkant van het eiland.',
    },
  ],
  heroPhoto: {
    src: '/properties/blue-bay-paradise/zwembad/07.jpeg',
    alt: 'Blue Bay Paradise — zwembad met uitzicht op zee',
  },
  stay: {
    maxGuests: 5,
    maxGuestsNote: 'maximaal 5 personen waarvan 1 kind',
    bedrooms: 2,
    beds: 2,
    bathrooms: 1,
    checkIn: '15:00',
    checkOut: '11:00',
  },
  pricing: {
    basePricePerNightUSD: 350,
    cleaningFeeUSD: 100,
    depositUSD: 300,
    longTermNights: 28,
    longTermDiscountPercent: 10,
    minNights: 1,
    highSeasonNote:
      'Op Curaçao valt het hoogseizoen in december (kerst en oud-en-nieuw) en februari (carnaval) — onze prijs blijft het hele jaar gelijk.',
  },
  houseRules: [
    'Roken alleen buiten toegestaan, niet binnen.',
    'Feesten zijn niet toegestaan.',
    'Extra gasten dienen altijd vooraf gemeld te worden.',
  ],
  cancellationPolicy:
    'Gratis annuleren tot één maand voor aankomst. Bij annulering binnen één maand vóór aankomst is restitutie niet meer mogelijk.',
  rooms: [
    {
      slug: 'woonkamer',
      label: 'Woonkamer',
      amenities: ['Airconditioning', 'Boeken en leesmateriaal', 'TV'],
      photos: [
        {
          src: '/properties/blue-bay-paradise/woonkamer/01.jpeg',
          alt: 'Blue Bay Paradise — woonkamer',
        },
        {
          src: '/properties/blue-bay-paradise/woonkamer/02.jpeg',
          alt: 'Blue Bay Paradise — woonkamer',
        },
        {
          src: '/properties/blue-bay-paradise/woonkamer/03.jpeg',
          alt: 'Blue Bay Paradise — woonkamer',
        },
        {
          src: '/properties/blue-bay-paradise/woonkamer/04.jpeg',
          alt: 'Blue Bay Paradise — woonkamer',
        },
      ],
    },
    {
      slug: 'keuken',
      label: 'Keuken',
      amenities: [
        'Barbecuespullen',
        'Blender',
        'Borden en bestek',
        'Broodrooster',
        'Fornuis',
        'Koelkast',
        'Koffiezetapparaat',
        'Kookbenodigdheden',
        'Magnetron',
        'Oven',
        'Vaatwasser',
        'Vriezer',
        'Waterkoker',
        'Wijnglazen',
      ],
      photos: [
        {
          src: '/properties/blue-bay-paradise/keuken/01.jpeg',
          alt: 'Blue Bay Paradise — keuken',
        },
        {
          src: '/properties/blue-bay-paradise/keuken/02.jpeg',
          alt: 'Blue Bay Paradise — keuken',
        },
      ],
    },
    {
      slug: 'slaapkamer-1',
      label: 'Slaapkamer 1',
      amenities: [
        'Tweepersoonsbed',
        'Airconditioning',
        'Beddengoed',
        'Extra kussens en dekens',
        'Kledinghangers',
        'Opbergruimte voor kleding',
        'Verduisterende gordijnen',
        'Strijkijzer',
      ],
      photos: [
        {
          src: '/properties/blue-bay-paradise/slaapkamer-1/01.jpeg',
          alt: 'Blue Bay Paradise — slaapkamer 1',
        },
        {
          src: '/properties/blue-bay-paradise/slaapkamer-1/02.jpeg',
          alt: 'Blue Bay Paradise — slaapkamer 1',
        },
        {
          src: '/properties/blue-bay-paradise/slaapkamer-1/03.jpeg',
          alt: 'Blue Bay Paradise — slaapkamer 1',
        },
      ],
    },
    {
      slug: 'slaapkamer-2',
      label: 'Slaapkamer 2',
      amenities: ['Tweepersoonsbed', 'Airconditioning'],
      photos: [
        {
          src: '/properties/blue-bay-paradise/slaapkamer-2/01.jpeg',
          alt: 'Blue Bay Paradise — slaapkamer 2',
        },
      ],
    },
    {
      slug: 'badkamer',
      label: 'Badkamer',
      amenities: [],
      photos: [
        {
          src: '/properties/blue-bay-paradise/badkamer/01.jpeg',
          alt: 'Blue Bay Paradise — badkamer',
        },
      ],
    },
    {
      slug: 'zwembad',
      label: 'Zwembad',
      amenities: ['Ligstoelen'],
      photos: [
        {
          src: '/properties/blue-bay-paradise/zwembad/01.jpeg',
          alt: 'Blue Bay Paradise — zwembad',
        },
        {
          src: '/properties/blue-bay-paradise/zwembad/02.jpeg',
          alt: 'Blue Bay Paradise — zwembad',
        },
        {
          src: '/properties/blue-bay-paradise/zwembad/03.jpeg',
          alt: 'Blue Bay Paradise — zwembad',
        },
        {
          src: '/properties/blue-bay-paradise/zwembad/04.jpeg',
          alt: 'Blue Bay Paradise — zwembad',
        },
        {
          src: '/properties/blue-bay-paradise/zwembad/05.jpeg',
          alt: 'Blue Bay Paradise — zwembad',
        },
        {
          src: '/properties/blue-bay-paradise/zwembad/06.jpeg',
          alt: 'Blue Bay Paradise — zwembad',
        },
        {
          src: '/properties/blue-bay-paradise/zwembad/07.jpeg',
          alt: 'Blue Bay Paradise — zwembad',
        },
      ],
    },
    {
      slug: 'overig',
      label: 'Overig',
      amenities: [],
      photos: [
        {
          src: '/properties/blue-bay-paradise/overig/01.jpeg',
          alt: 'Blue Bay Paradise — extra foto',
        },
        {
          src: '/properties/blue-bay-paradise/overig/02.jpeg',
          alt: 'Blue Bay Paradise — extra foto',
        },
        {
          src: '/properties/blue-bay-paradise/overig/03.jpeg',
          alt: 'Blue Bay Paradise — extra foto',
        },
        {
          src: '/properties/blue-bay-paradise/overig/04.jpeg',
          alt: 'Blue Bay Paradise — extra foto',
        },
        {
          src: '/properties/blue-bay-paradise/overig/05.jpeg',
          alt: 'Blue Bay Paradise — extra foto',
        },
      ],
    },
  ],
};
