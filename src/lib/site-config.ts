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

export type SiteConfig = {
  name: string;
  monogram: string;
  tagline: string;
  nav: NavItem[];
  reserveCta: NavItem;
  contact: SiteContact;
  social: SiteSocial;
  legal: SiteLegal;
};

export const siteConfig: SiteConfig = {
  name: 'Haven Residences',
  monogram: 'HR',
  tagline: 'Jouw thuis. Ver weg, maar precies goed.',
  nav: [
    { href: '/', label: 'Home' },
    { href: '/accommodaties', label: 'Accommodaties' },
    { href: '/beheer', label: 'Beheer' },
    { href: '/over-ons', label: 'Over ons' },
    { href: '/omgeving', label: 'Omgeving' },
    { href: '/contact', label: 'Contact' },
  ],
  reserveCta: { href: '/accommodaties', label: 'Reserveren' },
  contact: {
    phone: '+31 6 22752835',
    email: null,
    address: null,
  },
  social: {
    instagram: null,
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
