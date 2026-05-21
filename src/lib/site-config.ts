export type NavItem = {
  href: string;
  label: string;
};

export type SiteSocial = {
  instagram?: string | null;
  facebook?: string | null;
  pinterest?: string | null;
  tiktok?: string | null;
};

export type SiteContact = {
  phone?: string | null;
  email?: string | null;
  address?: string | null;
};

export type SiteLegal = {
  companyName?: string | null;
  kvk?: string | null;
  vatOrCrib?: string | null;
};

export type HeroImage = {
  src: string;
  alt: string;
};

export type SiteHero = {
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  cta: NavItem;
  images: HeroImage[];
  intervalMs: number;
};

export type UspIcon = 'house' | 'handHeart' | 'calendarCheck' | 'sun';

export type SiteUSP = {
  icon: UspIcon;
  title: string;
  description: string;
};

export type SiteOwnerBand = {
  eyebrow: string;
  title: string;
  description: string;
  cta: NavItem;
  image: { src: string; alt: string };
};

export type SiteConfig = {
  name: string;
  monogram: string;
  tagline: string;
  nav: NavItem[];
  reserveCta: NavItem;
  hero: SiteHero;
  usps: SiteUSP[];
  ownerBand: SiteOwnerBand;
  contact: SiteContact;
  social: SiteSocial;
  legal: SiteLegal;
};

export const siteConfig: SiteConfig = {
  name: 'Haven Residences',
  monogram: 'HR',
  tagline: 'Jouw thuis, onder de Caribische zon.',
  nav: [
    { href: '/', label: 'Home' },
    { href: '/accommodaties', label: 'Accommodaties' },
    { href: '/beheer', label: 'Beheer' },
    { href: '/over-ons', label: 'Over ons' },
    { href: '/omgeving', label: 'Omgeving' },
    { href: '/contact', label: 'Contact' },
  ],
  reserveCta: { href: '/accommodaties', label: 'Reserveren' },
  hero: {
    eyebrow: 'Welkom bij',
    title: 'Haven Residences',
    subtitle: 'Jouw thuis, onder de Caribische zon.',
    description:
      'Boutique vakantieverhuur op Curaçao: luxe en comfort met de rust van het eiland.',
    cta: { href: '/accommodaties', label: 'Ontdek onze accommodaties' },
    images: [
      {
        src: '/properties/blue-bay-paradise/01-hero.jpeg',
        alt: 'Blue Bay Paradise — zwembad met uitzicht op zee',
      },
      {
        src: '/properties/blue-bay-paradise/02.jpeg',
        alt: 'Blue Bay Paradise — interieur',
      },
      {
        src: '/properties/blue-bay-paradise/03.jpeg',
        alt: 'Blue Bay Paradise — woonkamer',
      },
      {
        src: '/properties/blue-bay-paradise/04.jpeg',
        alt: 'Blue Bay Paradise — buitenruimte',
      },
      {
        src: '/properties/blue-bay-paradise/05.jpeg',
        alt: 'Blue Bay Paradise — slaapkamer',
      },
      {
        src: '/properties/blue-bay-paradise/06.jpeg',
        alt: 'Blue Bay Paradise — detail',
      },
    ],
    intervalMs: 5000,
  },
  usps: [
    {
      icon: 'house',
      title: 'Bijzondere locaties',
      description:
        'Zorgvuldig geselecteerde woningen op de mooiste plekken van Curaçao.',
    },
    {
      icon: 'handHeart',
      title: 'Persoonlijke service',
      description:
        'Persoonlijke aandacht en directe ondersteuning tijdens jouw verblijf.',
    },
    {
      icon: 'calendarCheck',
      title: 'Direct online boeken',
      description:
        'Reserveer in een paar klikken, met directe bevestiging en veilige betaling.',
    },
    {
      icon: 'sun',
      title: 'Ontspanning gegarandeerd',
      description:
        'Van zee en natuur tot cultuur en gastronomie — alles binnen handbereik.',
    },
  ],
  ownerBand: {
    eyebrow: 'Verhuur met vertrouwen',
    title: 'Beheer van jouw woning',
    description:
      'Wij nemen de zorgen uit handen. Van gastcommunicatie en schoonmaak tot onderhoud en optimalisatie — professioneel, transparant en met oog voor jouw woning.',
    cta: { href: '/beheer', label: 'Ontdek onze beheerdiensten' },
    image: {
      src: '/properties/blue-bay-paradise/woonkamer/03.jpeg',
      alt: 'Stijlvolle interieursfeer — beheer met aandacht voor detail',
    },
  },
  contact: {
    phone: '+31 6 22752835',
    email: null,
    address: null,
  },
  social: {
    instagram: 'https://www.instagram.com/haven_residences/',
    facebook: null,
    pinterest: null,
    tiktok: null,
  },
  legal: {
    companyName: null,
    kvk: null,
    vatOrCrib: null,
  },
};
