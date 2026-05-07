export type Lang = "en" | "nl";

export type Translations = {
  nav: { residences: string; about: string; contact: string };
  hero: { since: string; explore: string; getInTouch: string; scroll: string };
  home: {
    collection: string;
    collectionTitle: string;
    ourStory: string;
    ourStoryTitle: string;
    ourStoryFallback: string;
    ourStoryParagraph2: string;
    inquire: string;
    planYourStay: string;
    planSubtext: string;
  };
  card: {
    from: string;
    perNight: string;
    pricingSoon: string;
    discover: string;
    comingSoon: string;
  };
  detail: {
    allResidences: string;
    comingSoon: string;
    aboutResidence: string;
    from: string;
    perNight: string;
    perMonth: string;
    forLongStays: string;
    bedrooms: string;
    bathrooms: string;
    upToGuests: string;
    cleaningFee: string;
    requestToBook: string;
    features: string;
    whatThisOffers: string;
    details: string;
    practicalInfo: string;
    parking: string;
    gatedProperty: string;
    pets: string;
    utilities: string;
    yes: string;
    no: string;
    allowed: string;
    notAllowed: string;
    minStay: string;
    nightsShort: string;
    monthsLong: string;
    seasonalRates: string;
    highSeasonPeriods: string;
    otherDates: string;
    reserveEarlyAccess: string;
    stayAt: string;
    reserveSubtext: string;
    staySubtext: string;
    parkingPrivate: string;
    parkingPublic: string;
    parkingStreet: string;
    parkingNone: string;
    utilitiesIncluded: string;
    utilitiesMetered: string;
    utilitiesPrepaid: string;
  };
  inquiry: {
    yourName: string;
    email: string;
    phoneOptional: string;
    preferredDates: string;
    tellUs: string;
    send: string;
    sending: string;
    success: string;
    error: string;
    validationRequired: string;
    validationEmail: string;
    validationLong: string;
  };
  footer: {
    explore: string;
    residences: string;
    about: string;
    contact: string;
    getInTouch: string;
    whatsapp: string;
    allRights: string;
  };
  notFound: { eyebrow: string; title: string; message: string; cta: string };
};

export const translations: Record<Lang, Translations> = {
  en: {
    nav: {
      residences: "Residences",
      about: "About",
      contact: "Contact",
    },
    hero: {
      since: "Curaçao · since 2026",
      explore: "Explore residences",
      getInTouch: "Get in touch",
      scroll: "Scroll",
    },
    home: {
      collection: "The collection",
      collectionTitle: "Each Haven, a different shade of Curaçao.",
      ourStory: "Our story",
      ourStoryTitle: "Local hospitality, residential calm.",
      ourStoryFallback:
        "Haven Residence is a small, owner-run collection of stays across Curaçao. Each residence has its own character — from beachfront resort living to leafy island neighborhoods — but all share the same standard: thoughtful interiors, genuine local welcome, and the kind of details that turn a holiday into a return.",
      ourStoryParagraph2:
        "We host short escapes and longer winter residencies. Whatever the length, you're welcomed in person, given the keys to the island, and reachable around the clock if you need us.",
      inquire: "Inquire",
      planYourStay: "Plan your stay.",
      planSubtext:
        "Tell us when you'd like to come and which residence speaks to you. We typically reply within 24 hours.",
    },
    card: {
      from: "from",
      perNight: "/ night",
      pricingSoon: "Pricing announced soon",
      discover: "Discover",
      comingSoon: "Coming soon",
    },
    detail: {
      allResidences: "All residences",
      comingSoon: "Coming soon",
      aboutResidence: "About this residence",
      from: "From",
      perNight: "/ night",
      perMonth: "/ month",
      forLongStays: "for {n}+ month stays",
      bedrooms: "bedrooms",
      bathrooms: "baths",
      upToGuests: "Up to {n} guests",
      cleaningFee: "Cleaning fee:",
      requestToBook: "Request to book",
      features: "Features",
      whatThisOffers: "What this residence offers",
      details: "The details",
      practicalInfo: "Practical info",
      parking: "Parking",
      gatedProperty: "Gated property",
      pets: "Pets",
      utilities: "Utilities",
      yes: "Yes",
      no: "No",
      allowed: "Allowed",
      notAllowed: "Not allowed",
      minStay: "Minimum stay",
      nightsShort: "nights (short)",
      monthsLong: "months (long)",
      seasonalRates: "Seasonal rates",
      highSeasonPeriods: "High season periods",
      otherDates: "All other dates: {price} per night.",
      reserveEarlyAccess: "Reserve early access",
      stayAt: "Stay at {name}",
      reserveSubtext: "We'll notify you the moment bookings open.",
      staySubtext:
        "Tell us your dates and we'll come back with availability and a personal welcome.",
      parkingPrivate: "Private parking inside gated grounds",
      parkingPublic: "Public street parking",
      parkingStreet: "Street parking",
      parkingNone: "No parking",
      utilitiesIncluded: "Utilities included",
      utilitiesMetered: "Metered — settled at end of stay",
      utilitiesPrepaid: "Prepaid utility cards",
    },
    inquiry: {
      yourName: "Your name",
      email: "Email",
      phoneOptional: "Phone (optional)",
      preferredDates: "Preferred dates (optional)",
      tellUs: "Tell us about your stay…",
      send: "Send inquiry",
      sending: "Sending…",
      success: "Thank you — we'll be in touch within 24 hours.",
      error: "Could not send. Please try again.",
      validationRequired: "Name, email and message are required.",
      validationEmail: "Please enter a valid email address.",
      validationLong: "Message is too long (max 5000 characters).",
    },
    footer: {
      explore: "Explore",
      residences: "Residences",
      about: "About",
      contact: "Contact",
      getInTouch: "Get in touch",
      whatsapp: "WhatsApp",
      allRights: "All rights reserved.",
    },
    notFound: {
      eyebrow: "404",
      title: "Lost on the island.",
      message:
        "The page you're looking for doesn't exist anymore — maybe it never did. Let's get you back to the residences.",
      cta: "Back to Haven Residence",
    },
  },
  nl: {
    nav: {
      residences: "Residenties",
      about: "Over ons",
      contact: "Contact",
    },
    hero: {
      since: "Curaçao · sinds 2026",
      explore: "Bekijk residenties",
      getInTouch: "Neem contact op",
      scroll: "Scroll",
    },
    home: {
      collection: "De collectie",
      collectionTitle: "Elke Haven, een andere kant van Curaçao.",
      ourStory: "Ons verhaal",
      ourStoryTitle: "Lokale gastvrijheid, residentiële rust.",
      ourStoryFallback:
        "Haven Residence is een kleine, door de eigenaar geleide collectie verblijven op Curaçao. Elke residentie heeft een eigen karakter — van strandresort tot groene woonwijken — maar dezelfde standaard: doordachte interieurs, een echt lokaal welkom, en de details die van een vakantie een terugkomst maken.",
      ourStoryParagraph2:
        "We ontvangen gasten voor korte escapes en langere winterverblijven. Hoe lang je ook blijft, je wordt persoonlijk verwelkomd, krijgt de sleutel tot het eiland, en bent ons 24/7 kunnen bereiken als je ons nodig hebt.",
      inquire: "Aanvragen",
      planYourStay: "Plan je verblijf.",
      planSubtext:
        "Vertel ons wanneer je wilt komen en welke residentie je aanspreekt. We reageren meestal binnen 24 uur.",
    },
    card: {
      from: "vanaf",
      perNight: "/ nacht",
      pricingSoon: "Prijzen volgen binnenkort",
      discover: "Ontdek",
      comingSoon: "Binnenkort",
    },
    detail: {
      allResidences: "Alle residenties",
      comingSoon: "Binnenkort",
      aboutResidence: "Over deze residentie",
      from: "Vanaf",
      perNight: "/ nacht",
      perMonth: "/ maand",
      forLongStays: "voor verblijven vanaf {n} maanden",
      bedrooms: "slaapkamers",
      bathrooms: "badkamers",
      upToGuests: "Tot {n} gasten",
      cleaningFee: "Schoonmaakkosten:",
      requestToBook: "Aanvraag voor boeking",
      features: "Voorzieningen",
      whatThisOffers: "Wat deze residentie biedt",
      details: "De details",
      practicalInfo: "Praktische info",
      parking: "Parkeren",
      gatedProperty: "Beveiligd terrein",
      pets: "Huisdieren",
      utilities: "Nutsvoorzieningen",
      yes: "Ja",
      no: "Nee",
      allowed: "Toegestaan",
      notAllowed: "Niet toegestaan",
      minStay: "Minimale verblijfsduur",
      nightsShort: "nachten (kort)",
      monthsLong: "maanden (lang)",
      seasonalRates: "Seizoenstarieven",
      highSeasonPeriods: "Hoogseizoen periodes",
      otherDates: "Alle overige data: {price} per nacht.",
      reserveEarlyAccess: "Reserveer vroege toegang",
      stayAt: "Verblijf in {name}",
      reserveSubtext: "We laten het je weten zodra boekingen openen.",
      staySubtext:
        "Vertel ons je data en we komen terug met beschikbaarheid en een persoonlijk welkom.",
      parkingPrivate: "Privé-parkeren binnen het beveiligde terrein",
      parkingPublic: "Openbare straatparkeerplaats",
      parkingStreet: "Straatparkeren",
      parkingNone: "Geen parkeren",
      utilitiesIncluded: "Nutsvoorzieningen inbegrepen",
      utilitiesMetered: "Bemeten — afgerekend aan einde verblijf",
      utilitiesPrepaid: "Opwaardeerkaarten voor nutsvoorzieningen",
    },
    inquiry: {
      yourName: "Je naam",
      email: "E-mail",
      phoneOptional: "Telefoon (optioneel)",
      preferredDates: "Gewenste data (optioneel)",
      tellUs: "Vertel over je verblijf…",
      send: "Verstuur aanvraag",
      sending: "Versturen…",
      success: "Dank je wel — we nemen binnen 24 uur contact op.",
      error: "Versturen mislukt. Probeer het opnieuw.",
      validationRequired: "Naam, e-mail en bericht zijn verplicht.",
      validationEmail: "Voer een geldig e-mailadres in.",
      validationLong: "Bericht is te lang (max 5000 tekens).",
    },
    footer: {
      explore: "Verkennen",
      residences: "Residenties",
      about: "Over ons",
      contact: "Contact",
      getInTouch: "Contact",
      whatsapp: "WhatsApp",
      allRights: "Alle rechten voorbehouden.",
    },
    notFound: {
      eyebrow: "404",
      title: "Verdwaald op het eiland.",
      message:
        "De pagina die je zoekt bestaat niet meer — misschien heeft hij dat ook nooit gedaan. Laten we je terug brengen naar de residenties.",
      cta: "Terug naar Haven Residence",
    },
  },
};

// Replace {placeholders} with values
export function fmt(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    values[key] !== undefined ? String(values[key]) : `{${key}}`,
  );
}
