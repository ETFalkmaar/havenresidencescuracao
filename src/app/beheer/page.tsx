import { createClient } from "@/lib/supabase/server";
import { SiteShell } from "@/components/site/SiteShell";
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
  const { t } = await getTranslations();
  const tm = t.management;

  const { data: settingsRow } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .single();
  const settings = (settingsRow ?? null) as SiteSettings | null;

  return (
    <SiteShell>
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-12 md:pt-20 pb-16">
        <Reveal>
          <p className="text-[12px] tracking-[0.3em] uppercase text-brand-500 mb-5">
            {tm.eyebrow}
          </p>
          <h1 className="font-display font-bold text-4xl md:text-6xl lg:text-7xl text-ink leading-[1.05] tracking-tight">
            {tm.title}
          </h1>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="mt-8 max-w-3xl space-y-5 text-ink-mute leading-relaxed text-[17px]">
            <p>{tm.intro1}</p>
            <p>{tm.intro2}</p>
          </div>
        </Reveal>
      </section>

      {/* Services */}
      <section className="bg-paper-tint border-y border-black/5">
        <div className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 lg:gap-20">
          <Reveal>
            <p className="text-[12px] tracking-[0.3em] uppercase text-ink-mute mb-4">
              {tm.eyebrow}
            </p>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-ink leading-tight">
              {tm.servicesTitle}
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <ul className="space-y-3 text-ink leading-relaxed">
              {tm.services.map((s) => (
                <li key={s} className="flex items-start gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Personal + returns */}
      <section className="max-w-5xl mx-auto px-6 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          <Reveal>
            <h3 className="font-display font-semibold text-2xl md:text-3xl text-ink mb-4">
              {tm.personalTitle}
            </h3>
            <p className="text-ink-mute leading-relaxed">{tm.personalBody}</p>
          </Reveal>
          <Reveal delay={0.15}>
            <h3 className="font-display font-semibold text-2xl md:text-3xl text-ink mb-4">
              {tm.returnsTitle}
            </h3>
            <p className="text-ink-mute leading-relaxed">{tm.returnsBody}</p>
          </Reveal>
        </div>
      </section>

      {/* Contact form */}
      <section className="bg-paper-tint border-t border-black/5">
        <div className="max-w-3xl mx-auto px-6 py-20 md:py-28">
          <Reveal className="mb-10 text-center">
            <p className="text-[12px] tracking-[0.3em] uppercase text-brand-500 mb-4">
              {tm.interestedTitle}
            </p>
            <h2 className="font-display font-bold text-3xl md:text-5xl text-ink leading-tight">
              {tm.formTitle}
            </h2>
            <p className="mt-4 text-ink-mute leading-relaxed max-w-xl mx-auto">
              {tm.interestedBody}
            </p>
            {settings?.contact_email && (
              <p className="mt-6 text-sm text-ink-mute">
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="underline underline-offset-4 hover:text-ink transition"
                >
                  {settings.contact_email}
                </a>
              </p>
            )}
          </Reveal>
          <Reveal delay={0.15}>
            <div className="rounded-3xl bg-white border border-black/5 shadow-pill p-6 md:p-8">
              <ManagementInquiryForm accent="#1F6BF0" t={tm} />
            </div>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
