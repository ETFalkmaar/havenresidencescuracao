import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./login/actions";
import { SetPasswordForm } from "./set-password/SetPasswordForm";
import { AdminModeToggle } from "./AdminModeToggle";
import { AdminSidebarNav } from "./AdminSidebarNav";
import { AdminMobileNav } from "./AdminMobileNav";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getTranslations } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

type AdminMode = "easy" | "advanced";

const Icon = {
  home: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-4h-4v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9z" />
    </svg>
  ),
  edit: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  build: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18" />
      <path d="M5 21V7l7-4 7 4v14" />
      <path d="M9 9h0M9 13h0M9 17h0M15 9h0M15 13h0M15 17h0" />
    </svg>
  ),
  bed: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 17v-5a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v5" />
      <path d="M2 17h20" />
      <path d="M6 9V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  inbox: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  ),
  calendar: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  team: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  settings: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  star: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <>{children}</>;
  }

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("user_id, role, email, password_set")
    .eq("user_id", user.id)
    .maybeSingle();

  let isAdmin = !!adminRow;
  let passwordSet = (adminRow as { password_set: boolean } | null)?.password_set ?? false;

  if (!isAdmin) {
    const { data, error } = await supabase.rpc("bootstrap_first_admin");
    const result = data as { ok: boolean; error?: string } | null;
    if (!error && result?.ok) {
      const { data: refetched } = await supabase
        .from("admin_users")
        .select("password_set")
        .eq("user_id", user.id)
        .maybeSingle();
      isAdmin = true;
      passwordSet = (refetched as { password_set: boolean } | null)?.password_set ?? false;
    }
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen grid place-items-center px-6 py-16 bg-paper-tint">
        <div className="max-w-md w-full text-center space-y-6">
          <h1 className="font-display font-bold text-3xl">Niet geautoriseerd</h1>
          <p className="text-sm text-ink-mute">
            Het account <strong>{user.email}</strong> is ingelogd maar is geen admin. Vraag de eigenaar om je uit te nodigen, of log uit en probeer een ander account.
          </p>
          <form action={signOut}>
            <button
              type="submit"
              className="px-5 py-3 rounded-full bg-ink text-white text-[13px] font-medium hover:bg-ink-soft transition shadow-pill"
            >
              Uitloggen
            </button>
          </form>
        </div>
      </main>
    );
  }

  if (!passwordSet) {
    return (
      <main className="min-h-screen grid place-items-center px-6 py-16 bg-paper-tint">
        <div className="w-full max-w-md space-y-8">
          <div>
            <p className="text-[12px] uppercase tracking-[0.3em] text-ink-mute mb-3">
              Eenmalige instelling
            </p>
            <h1 className="font-display font-bold text-3xl">Kies je wachtwoord</h1>
            <p className="text-sm text-ink-mute mt-3 leading-relaxed">
              Je bent ingelogd als <strong>{user.email}</strong> met een tijdelijk wachtwoord. Kies nu een sterk wachtwoord — vanaf dan kent alleen jij het.
            </p>
          </div>
          <SetPasswordForm />
          <form action={signOut}>
            <button
              type="submit"
              className="text-xs text-ink-mute hover:text-ink transition"
            >
              Annuleren en uitloggen
            </button>
          </form>
        </div>
      </main>
    );
  }

  const cookieStore = await cookies();
  const modeCookie = cookieStore.get("admin_mode")?.value;
  const mode: AdminMode = modeCookie === "advanced" ? "advanced" : "easy";
  const { lang } = await getTranslations();

  // Build the nav items per mode, with icons + descriptions for clarity.
  const easyItems = [
    {
      href: "/admin",
      label: lang === "nl" ? "Overzicht" : "Dashboard",
      description: lang === "nl" ? "Een snelle samenvatting" : "Quick snapshot",
      icon: Icon.home,
    },
    {
      href: "/admin/editor",
      label: lang === "nl" ? "Website bewerken" : "Edit website",
      description: lang === "nl" ? "Klik en wijzig" : "Click & change",
      icon: Icon.edit,
    },
    {
      href: "/admin/properties",
      label: lang === "nl" ? "Residenties" : "Residences",
      description: lang === "nl" ? "Foto's, prijzen, beschrijving" : "Photos, prices, copy",
      icon: Icon.bed,
    },
    {
      href: "/admin/inquiries",
      label: lang === "nl" ? "Aanvragen" : "Inquiries",
      description: lang === "nl" ? "Berichten van gasten" : "Guest messages",
      icon: Icon.inbox,
    },
  ];

  const advancedItems = [
    ...easyItems,
    {
      href: "/admin/bookings",
      label: lang === "nl" ? "Boekingen" : "Bookings",
      description: lang === "nl" ? "Reserveringen" : "Reservations",
      icon: Icon.calendar,
    },
    {
      href: "/admin/team",
      label: lang === "nl" ? "Team" : "Team",
      description: lang === "nl" ? "Adminaccounts" : "Admin accounts",
      icon: Icon.team,
    },
    {
      href: "/admin/settings",
      label: lang === "nl" ? "Instellingen" : "Settings",
      description: lang === "nl" ? "Merknaam, contact, links" : "Brand, contact, links",
      icon: Icon.settings,
    },
  ];

  const items = mode === "easy" ? easyItems : advancedItems;

  return (
    <div className="min-h-screen flex bg-paper-tint text-ink">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-black/5 bg-white">
        <div className="p-6 pb-4">
          <Link href="/admin" className="flex items-center gap-2 group">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white text-sm font-semibold">
              H
            </span>
            <div className="leading-tight">
              <p className="font-display font-bold text-ink text-[16px] tracking-tight">
                Haven · Admin
              </p>
              <p className="text-[11px] text-ink-mute">
                {mode === "easy"
                  ? lang === "nl"
                    ? "Eenvoudige modus"
                    : "Easy mode"
                  : lang === "nl"
                    ? "Geavanceerde modus"
                    : "Advanced mode"}
              </p>
            </div>
          </Link>
        </div>

        <div className="px-3 flex-1 overflow-y-auto">
          <AdminSidebarNav items={items} />
        </div>

        <div className="p-3 border-t border-black/5 space-y-2">
          <div className="px-3 py-2 flex items-center justify-between">
            <AdminModeToggle mode={mode} />
            <LanguageSwitcher current={lang} />
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-2xl text-[13px] text-ink-mute hover:text-ink hover:bg-paper-tint transition"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {lang === "nl" ? "Terug naar website" : "Back to site"}
          </Link>
          <div className="px-3 py-2 flex items-center justify-between gap-2">
            <span className="text-[12px] text-ink-mute truncate">{user.email}</span>
            <form action={signOut}>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-full bg-ink text-white text-[12px] font-medium hover:bg-ink-soft transition"
              >
                {lang === "nl" ? "Uitloggen" : "Sign out"}
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-black/5 flex items-center justify-between gap-3 px-4 py-3">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-ink text-white text-sm font-semibold">
              H
            </span>
            <span className="font-display font-bold text-ink text-[15px]">Admin</span>
          </Link>
          <div className="flex items-center gap-2">
            <AdminModeToggle mode={mode} />
            <AdminMobileNav items={items} />
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
