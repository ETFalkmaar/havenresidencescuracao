import { createClient } from "@/lib/supabase/server";
import { AnimatedHeader } from "@/components/AnimatedHeader";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { ManagementInquiryForm } from "@/components/ManagementInquiryForm";
import { getTranslations } from "@/lib/i18n/server";
import type { SiteSettings } from "@/lib/types";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Beheer · Haven Residence",
  description:
    "Laat jouw vakantiewoning op Curaçao professioneel én persoonlijk beheren. Boekingen, gasten, schoonmaak en onderhoud — wij regelen alles.",
};

export default async function BeheerPage() {
  const supabase = await createClient();
  const { lang, t } = await getTranslations();
  const tm = t.management;

  const {
    data: { user: signedInUser },
  } = await supabase.auth.getUser();

  const { data: settingsRow } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .single();
  const settings = (settingsRow ?? null) as SiteSettings | null;
  const brandName = settings?.brand_name ?? "Haven Residence";

  const accent = "#1e5fbf";

  return (
    <>
      <AnimatedHeader
        brandName={brandName}
        lang={lang}
        t={t.nav}
        signedIn={Boolean(signedInUser)}
      />

      {/* Hero */}
      <section className="relative pt-44 pb-24 lg:pt-56 lg:pb-32 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(circle at 70% 20%, rgba(30, 95, 191, 0.16) 0%, transparent 60%)," +
              "radial-gradient(circle at 10% 80%, rgba(30, 95, 191, 0.12) 0%, transparent 55%)",
          }}
        />
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <Reveal>
            <p
              className="text-xs uppercase tracking-[0.4em] mb-5"
              style={{ color: accent }}
            >
              {tm.eyebrow}
            </p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extralight leading-[1.05] tracking-tight">
              {tm.title}
            </h1>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-10 max-w-3xl space-y-5 text-neutral-700 dark:text-neutral-300 leading-relaxed text-[17px]">
              <p>{tm.intro1}</p>
              <p>{tm.intro2}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 lg:py-28 bg-neutral-50 dark:bg-neutral-950 border-y border-neutral-200 dark:border-neutral-900">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 grid md:grid-cols-2 gap-12 lg:gap-20">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.4em] text-neutral-500 mb-4">
              {tm.eyebrow}
            </p>
            <h2 className="text-3xl md:text-4xl font-extralight leading-tight tracking-tight">
              {tm.servicesTitle}
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <ul className="space-y-3 text-neutral-700 dark:text-neutral-300">
              {tm.services.map((s) => (
                <li key={s} className="flex items-start gap-3">
                  <span
                    className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: accent }}
                  />
                  <span className="leading-relaxed">{s}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Personal approach + return */}
      <section className="py-24 lg:py-32 max-w-5xl mx-auto px-6 lg:px-10">
        <div className="grid md:grid-cols-2 gap-14 lg:gap-20">
          <Reveal>
            <h3 className="text-2xl md:text-3xl font-light tracking-tight mb-4">
              {tm.personalTitle}
            </h3>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {tm.personalBody}
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <h3 className="text-2xl md:text-3xl font-light tracking-tight mb-4">
              {tm.returnsTitle}
            </h3>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {tm.returnsBody}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Contact form */}
      <section
        id="contact"
        className="py-24 lg:py-32 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-900"
      >
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <Reveal className="mb-10 text-center">
            <p
              className="text-xs uppercase tracking-[0.4em] mb-4"
              style={{ color: accent }}
            >
              {tm.interestedTitle}
            </p>
            <h2 className="text-3xl md:text-4xl font-extralight leading-tight tracking-tight">
              {tm.formTitle}
            </h2>
            <p className="mt-4 text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xl mx-auto">
              {tm.interestedBody}
            </p>
            {settings?.contact_email && (
              <p className="mt-6 text-sm text-neutral-500">
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="underline underline-offset-4 hover:text-neutral-900 dark:hover:text-white transition"
                >
                  {settings.contact_email}
                </a>
              </p>
            )}
          </Reveal>
          <Reveal delay={0.15}>
            <ManagementInquiryForm accent={accent} t={tm} />
          </Reveal>
        </div>
      </section>

      <Footer settings={settings ?? null} t={t.footer} />
    </>
  );
}
