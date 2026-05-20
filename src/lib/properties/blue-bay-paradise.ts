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
  ],
};
