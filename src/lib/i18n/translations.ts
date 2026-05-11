export type Lang = "en" | "nl";

export type Translations = {
  nav: { residences: string; about: string; contact: string; management: string };
  management: {
    eyebrow: string;
    title: string;
    intro1: string;
    intro2: string;
    servicesTitle: string;
    services: string[];
    personalTitle: string;
    personalBody: string;
    returnsTitle: string;
    returnsBody: string;
    interestedTitle: string;
    interestedBody: string;
    formTitle: string;
    formNamePlaceholder: string;
    formEmailPlaceholder: string;
    formPhonePlaceholder: string;
    formAddressPlaceholder: string;
    formMessagePlaceholder: string;
    formSubmit: string;
    formSubmitting: string;
    formSuccess: string;
    formError: string;
  };
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
  booking: {
    bookOnline: string;
    bookSubtext: string;
    pickDates: string;
    guests: string;
    max: string;
    stayType: string;
    stayAuto: string;
    stayShort: string;
    stayLong: string;
    priceBreakdown: string;
    nightAvg: string;
    months: string;
    cleaningFee: string;
    total: string;
    bookingDetails: string;
    yourName: string;
    phoneOptional: string;
    notesPlaceholder: string;
    confirmBooking: string;
    booking: string;
    signInToBook: string;
    signInHint: string;
    pickDatesError: string;
    nameRequired: string;
    guestsRange: string;
    bookingReceived: string;
    thankYou: string;
    referenceLine1: string;
    referenceLine2: string;
    myStays: string;
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
      management: "Management",
    },
    management: {
      eyebrow: "Property management",
      title: "Have your home on Curaçao managed without a worry.",
      intro1:
        "Do you own a vacation home, apartment or villa on Curaçao and are you looking for someone to handle the management — professionally and personally? You're in the right place.",
      intro2:
        "We take the full management of your home off your hands so you have nothing to worry about — bookings, guests, cleaning or maintenance. Whether you live on Curaçao or in the Netherlands, we keep your home cared for, profitable and welcoming.",
      servicesTitle: "What we take care of",
      services: [
        "Booking management and guest contact",
        "Check-ins and check-outs",
        "Professional cleaning",
        "Inspection and maintenance of the property",
        "Quick communication for any questions or issues",
        "Optimal presentation of your home for rental",
      ],
      personalTitle: "A personal approach",
      personalBody:
        "Not a one-size-fits-all service, but real attention to your home as if it were our own place. We believe in clear communication, reliability and a pleasant experience for both owner and guest.",
      returnsTitle: "More peace and more return",
      returnsBody:
        "Professional management means more than peace of mind — you'll often see better reviews and a higher return on your home as well.",
      interestedTitle: "Interested?",
      interestedBody:
        "Curious what we could mean for your home on Curaçao? Get in touch for an obligation-free conversation.",
      formTitle: "Tell us about your home",
      formNamePlaceholder: "Your name",
      formEmailPlaceholder: "Email",
      formPhonePlaceholder: "Phone (optional)",
      formAddressPlaceholder: "Property address or area on Curaçao",
      formMessagePlaceholder: "Tell us about your home and what you're looking for…",
      formSubmit: "Send inquiry",
      formSubmitting: "Sending…",
      formSuccess: "Thank you — we'll be in touch within 24 hours.",
      formError: "Could not send. Please try again.",
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
      requestToBook: "Book now",
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
    booking: {
      bookOnline: "Book online",
      bookSubtext:
        "Pick your dates and confirm — your booking is reserved instantly and you'll receive a confirmation email with all the arrival details.",
      pickDates: "Pick your dates",
      guests: "Guests",
      max: "Max",
      stayType: "Stay type",
      stayAuto: "Auto (best fit)",
      stayShort: "Short stay (per night)",
      stayLong: "Long stay ({n}+ months)",
      priceBreakdown: "Price breakdown",
      nightAvg: "{n} night{plural} (avg {price})",
      months: "{n} months × {price}",
      cleaningFee: "Cleaning fee",
      total: "Total",
      bookingDetails: "Booking details",
      yourName: "Your name",
      phoneOptional: "Phone (optional)",
      notesPlaceholder: "Anything we should know? (optional)",
      confirmBooking: "Confirm booking",
      booking: "Booking…",
      signInToBook: "Sign in to book",
      signInHint: "You'll be sent to sign in, then back here to confirm.",
      pickDatesError: "Pick check-in and check-out dates.",
      nameRequired: "Please enter the name for the booking.",
      guestsRange: "Guests must be between 1 and {n}.",
      bookingReceived: "Booking confirmed",
      thankYou: "Thank you",
      referenceLine1: "Your booking reference is",
      referenceLine2:
        "We've sent a confirmation email with all the details. You can review and manage your booking under",
      myStays: "My stays",
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
      management: "Beheer",
    },
    management: {
      eyebrow: "Beheer",
      title: "Laat jouw woning op Curaçao zorgeloos beheren.",
      intro1:
        "Heb jij een vakantiewoning, appartement of villa op Curaçao en zoek je iemand die het beheer professioneel én persoonlijk oppakt? Dan ben je bij ons aan het juiste adres.",
      intro2:
        "Wij nemen het volledige beheer van jouw woning uit handen, zodat jij geen omkijken hebt naar boekingen, gasten, schoonmaak of onderhoud. Of je nu op Curaçao woont of in Nederland — wij zorgen dat jouw woning verzorgd, winstgevend en gastvrij blijft.",
      servicesTitle: "Wat wij voor je regelen",
      services: [
        "Beheer van boekingen en gastencontact",
        "Check-ins en check-outs",
        "Professionele schoonmaak",
        "Controle en onderhoud van de woning",
        "Snelle communicatie bij vragen of problemen",
        "Optimale presentatie van jouw woning voor verhuur",
      ],
      personalTitle: "Persoonlijke aanpak",
      personalBody:
        "Geen standaard service, maar aandacht voor jouw woning alsof het onze eigen plek is. We geloven in duidelijke communicatie, betrouwbaarheid en een prettige ervaring voor zowel eigenaar als gast.",
      returnsTitle: "Meer rust én rendement",
      returnsBody:
        "Met professioneel beheer haal je niet alleen meer rust uit het verhuren van jouw woning, maar vaak ook betere beoordelingen en een hoger rendement.",
      interestedTitle: "Interesse?",
      interestedBody:
        "Benieuwd wat wij voor jouw woning op Curaçao kunnen betekenen? Neem vrijblijvend contact met ons op voor een kennismaking.",
      formTitle: "Vertel ons over je woning",
      formNamePlaceholder: "Je naam",
      formEmailPlaceholder: "E-mail",
      formPhonePlaceholder: "Telefoon (optioneel)",
      formAddressPlaceholder: "Adres of wijk van de woning op Curaçao",
      formMessagePlaceholder: "Vertel ons over je woning en wat je zoekt…",
      formSubmit: "Verstuur aanvraag",
      formSubmitting: "Versturen…",
      formSuccess: "Bedankt — we nemen binnen 24 uur contact op.",
      formError: "Versturen mislukt. Probeer het opnieuw.",
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
      requestToBook: "Boek nu",
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
    booking: {
      bookOnline: "Direct boeken",
      bookSubtext:
        "Kies je data en bevestig — je boeking is direct gereserveerd en je ontvangt een bevestigingsmail met alle aankomstdetails.",
      pickDates: "Kies je data",
      guests: "Gasten",
      max: "Max",
      stayType: "Verblijfstype",
      stayAuto: "Automatisch (best passend)",
      stayShort: "Korte verblijf (per nacht)",
      stayLong: "Lang verblijf ({n}+ maanden)",
      priceBreakdown: "Prijsoverzicht",
      nightAvg: "{n} nacht{plural} (gemiddeld {price})",
      months: "{n} maanden × {price}",
      cleaningFee: "Schoonmaakkosten",
      total: "Totaal",
      bookingDetails: "Boekingsgegevens",
      yourName: "Je naam",
      phoneOptional: "Telefoon (optioneel)",
      notesPlaceholder: "Iets dat we moeten weten? (optioneel)",
      confirmBooking: "Bevestig boeking",
      booking: "Bezig met boeken…",
      signInToBook: "Log in om te boeken",
      signInHint: "Je gaat eerst naar inloggen, dan terug hierheen om te bevestigen.",
      pickDatesError: "Kies een aankomst- en vertrekdatum.",
      nameRequired: "Vul de naam voor de boeking in.",
      guestsRange: "Gasten moet tussen 1 en {n} liggen.",
      bookingReceived: "Boeking bevestigd",
      thankYou: "Bedankt",
      referenceLine1: "Je boekingsreferentie is",
      referenceLine2:
        "We hebben een bevestigingsmail gestuurd met alle details. Je kunt je boeking bekijken en beheren onder",
      myStays: "Mijn verblijven",
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
