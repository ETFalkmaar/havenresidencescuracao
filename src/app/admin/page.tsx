import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { lang } = await getTranslations();
  const tr =
    lang === "nl"
      ? {
          eyebrow: "Overzicht",
          title: "Welkom terug, Edith.",
          welcome: "Hier is je website in één oogopslag. Klik op een kaart om iets te wijzigen.",
          edit: "Website bewerken",
          editBody: "Open de visuele editor en klik gewoon op tekst, foto's of secties om ze direct aan te passen. Wijzigingen blijven concept tot je publiceert.",
          editCta: "Open editor",
          residences: "Residenties",
          units: "Units",
          newInquiries: "Nieuwe aanvragen",
          bookings: "Boekingen",
          recentInquiries: "Recente aanvragen",
          viewAll: "Bekijk alle",
          noInquiries: "Nog geen aanvragen — ze verschijnen hier zodra gasten het formulier invullen.",
          quickActionTitle: "Snelle acties",
          quickEdit: "Wijzig de homepage",
          quickEditDesc: "Verander tekst, foto's of pas de hero aan",
          quickProperty: "Voeg een residentie toe",
          quickPropertyDesc: "Nieuwe woning publiceren",
          quickInquiry: "Beantwoord aanvragen",
          quickInquiryDesc: "Reageer op gasten",
        }
      : {
          eyebrow: "Dashboard",
          title: "Welcome back, Edith.",
          welcome: "Here's your website at a glance. Click a card to change something.",
          edit: "Edit your website",
          editBody: "Open the visual editor and just click on text, photos or sections to change them inline. Changes stay as drafts until you publish.",
          editCta: "Open editor",
          residences: "Residences",
          units: "Units",
          newInquiries: "New inquiries",
          bookings: "Bookings",
          recentInquiries: "Recent inquiries",
          viewAll: "View all",
          noInquiries: "No inquiries yet — they'll appear here as guests submit the form.",
          quickActionTitle: "Quick actions",
          quickEdit: "Edit the homepage",
          quickEditDesc: "Change text, photos or hero",
          quickProperty: "Add a residence",
          quickPropertyDesc: "Publish a new property",
          quickInquiry: "Reply to inquiries",
          quickInquiryDesc: "Get back to guests",
        };

  const [propertiesRes, unitsRes, inquiriesRes, bookingsRes, recentInquiriesRes] =
    await Promise.all([
      supabase.from("properties").select("*", { count: "exact", head: true }),
      supabase.from("units").select("*", { count: "exact", head: true }),
      supabase
        .from("inquiries")
        .select("*", { count: "exact", head: true })
        .eq("status", "new"),
      supabase.from("bookings").select("*", { count: "exact", head: true }),
      supabase
        .from("inquiries")
        .select("id, name, email, message, created_at, status")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const stats = [
    { label: tr.residences, value: propertiesRes.count ?? 0, href: "/admin/properties" },
    { label: tr.units, value: unitsRes.count ?? 0, href: "/admin/units" },
    { label: tr.newInquiries, value: inquiriesRes.count ?? 0, href: "/admin/inquiries", accent: (inquiriesRes.count ?? 0) > 0 },
    { label: tr.bookings, value: bookingsRes.count ?? 0, href: "/admin/bookings" },
  ];

  type InquiryRow = {
    id: string;
    name: string;
    email: string;
    message: string;
    created_at: string;
    status: string;
  };
  const recent = (recentInquiriesRes.data ?? []) as InquiryRow[];

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10 lg:py-12 space-y-10">
      <header>
        <p className="text-[12px] uppercase tracking-[0.3em] text-ink-mute mb-3">
          {tr.eyebrow}
        </p>
        <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight">
          {tr.title}
        </h1>
        <p className="mt-3 text-ink-mute leading-relaxed max-w-2xl">{tr.welcome}</p>
      </header>

      {/* Big edit-website CTA — the primary owner action */}
      <Link
        href="/admin/editor"
        className="group block rounded-3xl bg-ink text-white p-8 lg:p-10 hover:bg-ink-soft transition shadow-soft relative overflow-hidden"
      >
        <div
          aria-hidden
          className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-brand-500/30 blur-3xl"
        />
        <div className="relative flex items-center justify-between gap-6 flex-wrap">
          <div className="max-w-xl">
            <p className="text-[12px] uppercase tracking-[0.3em] text-white/60 mb-3">
              {lang === "nl" ? "Belangrijkste actie" : "Primary action"}
            </p>
            <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight">
              {tr.edit}
            </h2>
            <p className="mt-3 text-white/75 text-[15px] leading-relaxed">
              {tr.editBody}
            </p>
          </div>
          <span className="group inline-flex items-center gap-2.5 pl-2 pr-6 py-2 rounded-full bg-white text-ink text-[14px] font-medium transition shadow-pill">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-paper-warm">
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 12h12M13 6l6 6-6 6" />
              </svg>
            </span>
            {tr.editCta}
          </span>
        </div>
      </Link>

      {/* Stats row */}
      <section>
        <h2 className="text-[12px] uppercase tracking-[0.3em] text-ink-mute mb-4">
          {lang === "nl" ? "In één oogopslag" : "At a glance"}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className={`block rounded-3xl p-6 transition shadow-pill border ${
                s.accent
                  ? "bg-brand-500 text-white border-brand-500 hover:bg-brand-600"
                  : "bg-white border-black/5 hover:shadow-soft"
              }`}
            >
              <p className={`text-[12px] uppercase tracking-widest mb-3 ${s.accent ? "text-white/80" : "text-ink-mute"}`}>
                {s.label}
              </p>
              <p className={`font-display font-bold text-4xl ${s.accent ? "text-white" : "text-ink"}`}>
                {s.value}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick action cards */}
      <section>
        <h2 className="text-[12px] uppercase tracking-[0.3em] text-ink-mute mb-4">
          {tr.quickActionTitle}
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              href: "/admin/editor",
              title: tr.quickEdit,
              desc: tr.quickEditDesc,
              icon: (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              ),
            },
            {
              href: "/admin/properties/new",
              title: tr.quickProperty,
              desc: tr.quickPropertyDesc,
              icon: (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              ),
            },
            {
              href: "/admin/inquiries",
              title: tr.quickInquiry,
              desc: tr.quickInquiryDesc,
              icon: (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-6l-2 3h-4l-2-3H2" />
                  <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                </svg>
              ),
            },
          ].map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="group rounded-3xl bg-white border border-black/5 p-6 hover:shadow-soft transition"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-paper-warm text-ink mb-4 group-hover:bg-ink group-hover:text-white transition">
                {q.icon}
              </span>
              <p className="font-display font-semibold text-ink text-[16px]">
                {q.title}
              </p>
              <p className="text-[13px] text-ink-mute mt-1 leading-snug">{q.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent inquiries */}
      <section className="rounded-3xl bg-white border border-black/5 p-6 md:p-8 shadow-pill">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-semibold text-xl text-ink">
            {tr.recentInquiries}
          </h2>
          <Link
            href="/admin/inquiries"
            className="text-[13px] text-ink-mute hover:text-ink transition"
          >
            {tr.viewAll} →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-ink-mute py-8 text-center">{tr.noInquiries}</p>
        ) : (
          <ul className="divide-y divide-black/5">
            {recent.map((inq) => (
              <li key={inq.id} className="py-4 flex justify-between gap-6">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-ink">
                    {inq.name}{" "}
                    <span className="text-ink-mute font-normal">· {inq.email}</span>
                  </p>
                  <p className="text-sm text-ink-mute truncate mt-0.5">
                    {inq.message}
                  </p>
                </div>
                <div className="text-xs text-ink-mute shrink-0 text-right">
                  <p>
                    {new Date(inq.created_at).toLocaleDateString(
                      lang === "nl" ? "nl-NL" : "en-GB",
                    )}
                  </p>
                  <p className="mt-1">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full ${
                        inq.status === "new"
                          ? "bg-amber-100 text-amber-900"
                          : "bg-paper-warm text-ink"
                      }`}
                    >
                      {inq.status}
                    </span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
