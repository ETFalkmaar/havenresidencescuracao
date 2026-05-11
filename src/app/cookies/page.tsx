import { SiteShell } from "@/components/site/SiteShell";
import { getTranslations } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cookiebeleid",
  description:
    "Welke cookies Haven Residence plaatst en hoe je je voorkeuren beheert onder de EU ePrivacy-richtlijn en AVG.",
};

export default async function CookiesPage() {
  const { lang } = await getTranslations();
  const isNL = lang === "nl";

  return (
    <SiteShell>
      <article className="max-w-3xl mx-auto px-6 pt-12 md:pt-20 pb-24">
        <p className="text-[12px] tracking-[0.3em] uppercase text-ink-mute mb-4">
          {isNL ? "Juridisch" : "Legal"}
        </p>
        <h1 className="font-display font-bold text-4xl md:text-5xl text-ink leading-tight tracking-tight mb-2">
          {isNL ? "Cookiebeleid" : "Cookie policy"}
        </h1>
        <p className="text-ink-mute text-sm">
          {isNL ? "Laatst bijgewerkt: " : "Last updated: "}2026-05-09
        </p>

        <div className="mt-10 space-y-8 text-[15px] text-ink leading-relaxed">
          <section>
            <h2 className="font-display font-semibold text-xl mb-3">
              {isNL ? "Wat zijn cookies" : "What are cookies"}
            </h2>
            <p className="text-ink-mute">
              {isNL
                ? "Cookies zijn kleine tekstbestanden die websites op je apparaat opslaan om de site te laten functioneren of om gedrag te meten. We gebruiken zo min mogelijk cookies en plaatsen niet-essentiële cookies alleen met jouw expliciete toestemming."
                : "Cookies are small text files that websites store on your device to make the site work or to measure behaviour. We use as few cookies as possible and only set non-essential cookies after your explicit consent."}
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-xl mb-3">
              {isNL ? "Cookies die we plaatsen" : "Cookies we set"}
            </h2>

            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left text-ink-mute border-b border-black/10">
                    <th className="py-3 pr-4 font-medium">
                      {isNL ? "Naam" : "Name"}
                    </th>
                    <th className="py-3 pr-4 font-medium">
                      {isNL ? "Type" : "Type"}
                    </th>
                    <th className="py-3 pr-4 font-medium">
                      {isNL ? "Doel" : "Purpose"}
                    </th>
                    <th className="py-3 font-medium">
                      {isNL ? "Bewaartermijn" : "Retention"}
                    </th>
                  </tr>
                </thead>
                <tbody className="text-ink">
                  <tr className="border-b border-black/5">
                    <td className="py-3 pr-4 font-mono text-[12px]">
                      sb-*-auth-token
                    </td>
                    <td className="py-3 pr-4">
                      {isNL ? "Essentieel" : "Essential"}
                    </td>
                    <td className="py-3 pr-4 text-ink-mute">
                      {isNL
                        ? "Houdt je ingelogd na het aanmelden."
                        : "Keeps you logged in after sign-in."}
                    </td>
                    <td className="py-3 text-ink-mute">
                      {isNL ? "Tot uitloggen" : "Until logout"}
                    </td>
                  </tr>
                  <tr className="border-b border-black/5">
                    <td className="py-3 pr-4 font-mono text-[12px]">
                      lang
                    </td>
                    <td className="py-3 pr-4">
                      {isNL ? "Essentieel" : "Essential"}
                    </td>
                    <td className="py-3 pr-4 text-ink-mute">
                      {isNL
                        ? "Onthoudt je taalkeuze (Nederlands / Engels)."
                        : "Remembers your language choice (Dutch / English)."}
                    </td>
                    <td className="py-3 text-ink-mute">12 {isNL ? "maanden" : "months"}</td>
                  </tr>
                  <tr className="border-b border-black/5">
                    <td className="py-3 pr-4 font-mono text-[12px]">
                      cookie_consent
                    </td>
                    <td className="py-3 pr-4">
                      {isNL ? "Essentieel" : "Essential"}
                    </td>
                    <td className="py-3 pr-4 text-ink-mute">
                      {isNL
                        ? "Onthoudt jouw cookie-keuze zodat we de banner niet steeds opnieuw tonen."
                        : "Remembers your cookie choice so we don't show the banner repeatedly."}
                    </td>
                    <td className="py-3 text-ink-mute">12 {isNL ? "maanden" : "months"}</td>
                  </tr>
                  <tr className="border-b border-black/5">
                    <td className="py-3 pr-4 font-mono text-[12px]">
                      editor_preview, editor_overlay
                    </td>
                    <td className="py-3 pr-4">
                      {isNL ? "Essentieel" : "Essential"}
                    </td>
                    <td className="py-3 pr-4 text-ink-mute">
                      {isNL
                        ? "Alleen voor beheerders. Schakelt de live-bewerkingsmodus van de website in."
                        : "Admin-only. Toggles the website's live edit mode."}
                    </td>
                    <td className="py-3 text-ink-mute">
                      {isNL ? "Sessie" : "Session"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-ink-mute mt-6">
              {isNL
                ? "We gebruiken op dit moment geen analytische of marketingcookies. Mochten we die in de toekomst toevoegen, dan vragen we eerst jouw toestemming via de cookiebanner."
                : "We currently use no analytics or marketing cookies. Should we add them in the future, we'll ask for your consent through the cookie banner first."}
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-xl mb-3">
              {isNL ? "Je voorkeuren beheren" : "Manage your preferences"}
            </h2>
            <p className="text-ink-mute">
              {isNL
                ? "Je kunt cookies altijd verwijderen via je browserinstellingen. Bij je volgende bezoek aan de site vragen we opnieuw om eventuele toestemming."
                : "You can delete cookies at any time via your browser settings. On your next visit we'll re-ask for any consent."}
            </p>
          </section>
        </div>
      </article>
    </SiteShell>
  );
}
