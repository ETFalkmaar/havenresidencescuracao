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

export type PropertyData = {
  slug: string;
  name: string;
  location: string;
  rooms: Room[];
};

export const blueBayParadise: PropertyData = {
  slug: 'blue-bay-paradise',
  name: 'Blue Bay Paradise',
  location: 'Blue Bay Resort, Willemstad, Curaçao',
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
