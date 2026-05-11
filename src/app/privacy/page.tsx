import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SiteShell } from "@/components/site/SiteShell";
import { getTranslations } from "@/lib/i18n/server";
import type { SiteSettings } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Privacybeleid",
  description:
    "Hoe Haven Residence persoonsgegevens verwerkt onder de Algemene Verordening Gegevensbescherming (AVG/GDPR).",
};

export default async function PrivacyPage() {
  const supabase = await createClient();
  const { lang } = await getTranslations();

  const { data: settingsRow } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .single();
  const settings = (settingsRow ?? null) as SiteSettings | null;
  const contactEmail = settings?.contact_email ?? "info@havenresidences.com";
  const brand = settings?.brand_name ?? "Haven Residence";

  const isNL = lang === "nl";

  return (
    <SiteShell>
      <article className="max-w-3xl mx-auto px-6 pt-12 md:pt-20 pb-24 prose prose-neutral prose-sm md:prose-base">
        <p className="text-[12px] tracking-[0.3em] uppercase text-ink-mute mb-4">
          {isNL ? "Juridisch" : "Legal"}
        </p>
        <h1 className="font-display font-bold text-4xl md:text-5xl text-ink leading-tight tracking-tight mb-2">
          {isNL ? "Privacybeleid" : "Privacy policy"}
        </h1>
        <p className="text-ink-mute text-sm">
          {isNL ? "Laatst bijgewerkt: " : "Last updated: "}2026-05-09
        </p>

        <div className="mt-10 space-y-8 text-[15px] text-ink leading-relaxed">
          <section>
            <h2 className="font-display font-semibold text-xl mb-3">
              {isNL ? "1. Wie zijn wij" : "1. Who we are"}
            </h2>
            <p className="text-ink-mute">
              {isNL
                ? `${brand} is een particulier verhuurbedrijf gevestigd op Curaçao. We verwerken persoonsgegevens onder de Algemene Verordening Gegevensbescherming (AVG / GDPR).`
                : `${brand} is a privately operated rental business located in Curaçao. We process personal data under the EU General Data Protection Regulation (GDPR).`}
            </p>
            <p className="text-ink-mute mt-2">
              {isNL ? "Contact: " : "Contact: "}
              <a
                href={`mailto:${contactEmail}`}
                className="text-brand-500 hover:underline"
              >
                {contactEmail}
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-xl mb-3">
              {isNL ? "2. Welke gegevens" : "2. What data we collect"}
            </h2>
            <p className="text-ink-mute mb-3">
              {isNL
                ? "Wij verwerken alleen de gegevens die nodig zijn om een aanvraag te beantwoorden of een verblijf te regelen:"
                : "We only process data needed to reply to your inquiry or arrange your stay:"}
            </p>
            <ul className="space-y-1 text-ink-mute list-disc pl-5">
              <li>
                {isNL
                  ? "Naam, e-mailadres en (optioneel) telefoonnummer dat je in het contactformulier invult."
                  : "Name, email and (optional) phone number you enter in the contact form."}
              </li>
              <li>
                {isNL
                  ? "Bericht / aanvraag inhoud, gewenste data en aantal gasten."
                  : "Message / inquiry content, preferred dates and number of guests."}
              </li>
              <li>
                {isNL
                  ? "Account-e-mailadres als je een account aanmaakt om een boeking te volgen."
                  : "Account email if you create an account to track a booking."}
              </li>
              <li>
                {isNL
                  ? "Technische logs van Vercel (IP-adres, useragent) voor beveiliging en foutopsporing, anoniem na 30 dagen."
                  : "Vercel technical logs (IP, user-agent) for security and debugging, anonymised after 30 days."}
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-semibold text-xl mb-3">
              {isNL ? "3. Rechtsgrond en doel" : "3. Legal basis and purpose"}
            </h2>
            <ul className="space-y-2 text-ink-mute list-disc pl-5">
              <li>
                <strong className="text-ink">
                  {isNL ? "Uitvoering overeenkomst" : "Contract performance"}
                </strong>{" "}
                — {isNL
                  ? "om je aanvraag/boeking te kunnen behandelen."
                  : "to process your inquiry / booking."}
              </li>
              <li>
                <strong className="text-ink">
                  {isNL ? "Gerechtvaardigd belang" : "Legitimate interest"}
                </strong>{" "}
                — {isNL
                  ? "voor beveiliging en het verbeteren van de website."
                  : "for security and improving the website."}
              </li>
              <li>
                <strong className="text-ink">
                  {isNL ? "Toestemming" : "Consent"}
                </strong>{" "}
                — {isNL
                  ? "voor optionele cookies (analytics). Je kunt toestemming op elk moment intrekken via de cookiebanner."
                  : "for optional cookies (analytics). You can withdraw consent at any time via the cookie banner."}
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-semibold text-xl mb-3">
              {isNL ? "4. Met wie we gegevens delen" : "4. Who we share data with"}
            </h2>
            <p className="text-ink-mute">
              {isNL
                ? "Wij verkopen je gegevens niet. We gebruiken een beperkte set verwerkers die nodig zijn om de site te draaien:"
                : "We do not sell your data. We use a limited set of processors needed to run the site:"}
            </p>
            <ul className="space-y-1 text-ink-mute list-disc pl-5 mt-3">
              <li>
                <strong className="text-ink">Vercel</strong> —{" "}
                {isNL ? "hosting van de website (EU)." : "website hosting (EU)."}
              </li>
              <li>
                <strong className="text-ink">Supabase</strong> —{" "}
                {isNL
                  ? "database, authenticatie en bestandsopslag (EU)."
                  : "database, authentication and file storage (EU)."}
              </li>
              <li>
                <strong className="text-ink">WhatsApp / Instagram / TikTok</strong> —{" "}
                {isNL
                  ? "alleen als je vrijwillig op een van die links klikt."
                  : "only when you voluntarily click one of those links."}
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-semibold text-xl mb-3">
              {isNL ? "5. Bewaartermijn" : "5. Retention"}
            </h2>
            <p className="text-ink-mute">
              {isNL
                ? "Aanvragen worden 24 maanden bewaard zodat we eventuele vervolgvragen kunnen beantwoorden. Boekingsgegevens worden 7 jaar bewaard volgens Nederlandse/EU-belastingwetgeving. Je kunt eerder verwijderen aanvragen."
                : "Inquiries are retained for 24 months so we can answer follow-up questions. Booking data is retained for 7 years per EU tax law. You can request earlier deletion."}
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-xl mb-3">
              {isNL ? "6. Jouw rechten" : "6. Your rights"}
            </h2>
            <p className="text-ink-mute mb-3">
              {isNL
                ? "Onder de AVG heb je het recht om:"
                : "Under GDPR you have the right to:"}
            </p>
            <ul className="space-y-1 text-ink-mute list-disc pl-5">
              <li>
                {isNL
                  ? "Je gegevens in te zien (recht op inzage)"
                  : "Access your data"}
              </li>
              <li>
                {isNL ? "Je gegevens te corrigeren" : "Correct your data"}
              </li>
              <li>
                {isNL ? "Je gegevens te laten verwijderen" : "Delete your data"}
              </li>
              <li>
                {isNL
                  ? "De verwerking te beperken of bezwaar te maken"
                  : "Restrict or object to processing"}
              </li>
              <li>
                {isNL
                  ? "Een dataportabiliteitsverzoek te doen"
                  : "Request data portability"}
              </li>
              <li>
                {isNL
                  ? "Een klacht in te dienen bij de Autoriteit Persoonsgegevens"
                  : "Lodge a complaint with the Dutch Data Protection Authority (Autoriteit Persoonsgegevens)"}
              </li>
            </ul>
            <p className="text-ink-mute mt-3">
              {isNL ? "Mail ons op " : "Email us at "}
              <a
                href={`mailto:${contactEmail}`}
                className="text-brand-500 hover:underline"
              >
                {contactEmail}
              </a>{" "}
              {isNL ? "om een verzoek in te dienen." : "to file a request."}
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-xl mb-3">
              {isNL ? "7. Cookies" : "7. Cookies"}
            </h2>
            <p className="text-ink-mute">
              {isNL ? "Zie ons " : "See our "}
              <Link href="/cookies" className="text-brand-500 hover:underline">
                {isNL ? "Cookiebeleid" : "Cookie policy"}
              </Link>{" "}
              {isNL
                ? "voor details over welke cookies we plaatsen en hoe je ze beheert."
                : "for details about which cookies we set and how to manage them."}
            </p>
          </section>
        </div>
      </article>
    </SiteShell>
  );
}
