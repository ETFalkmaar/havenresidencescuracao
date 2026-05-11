import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { publicSignOut } from "@/app/(auth)/actions";
import { SiteShell } from "@/components/site/SiteShell";
import { getTranslations } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  const { lang } = await getTranslations();
  const tabs = [
    { href: "/account", label: lang === "nl" ? "Mijn verblijven" : "My stays" },
    { href: "/account/profile", label: lang === "nl" ? "Profiel" : "Profile" },
    {
      href: "/account/security",
      label: lang === "nl" ? "Beveiliging" : "Security",
    },
  ];

  return (
    <SiteShell>
      <div className="max-w-5xl mx-auto px-6 pt-8 pb-4 flex flex-wrap items-center justify-between gap-4">
        <nav className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="px-4 py-2 rounded-full text-[13px] font-medium text-ink-mute bg-paper-warm hover:text-ink hover:bg-paper-tint border border-black/5 transition"
            >
              {t.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden sm:inline text-ink-mute text-xs">{user.email}</span>
          <form action={publicSignOut}>
            <button
              type="submit"
              className="px-4 py-2 rounded-full bg-ink text-white text-[13px] font-medium hover:bg-ink-soft transition"
            >
              {lang === "nl" ? "Uitloggen" : "Sign out"}
            </button>
          </form>
        </div>
      </div>
      {children}
    </SiteShell>
  );
}
