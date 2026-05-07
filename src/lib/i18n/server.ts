import { cookies } from "next/headers";
import { translations, type Lang, type Translations } from "./translations";

export async function getLang(): Promise<Lang> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get("lang")?.value;
  if (fromCookie === "nl" || fromCookie === "en") return fromCookie;
  return "en";
}

export async function getTranslations(): Promise<{
  lang: Lang;
  t: Translations;
}> {
  const lang = await getLang();
  return { lang, t: translations[lang] };
}

export function getLocale(lang: Lang): string {
  return lang === "nl" ? "nl-NL" : "en-GB";
}
