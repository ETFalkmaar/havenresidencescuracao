import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n/server";
import type { Property } from "@/lib/types";

export const dynamic = "force-dynamic";

const statusLabelsByLang: Record<"en" | "nl", Record<Property["status"], string>> = {
  en: {
    active: "Active",
    coming_soon: "Coming soon",
    draft: "Draft",
    archived: "Archived",
  },
  nl: {
    active: "Actief",
    coming_soon: "Binnenkort",
    draft: "Concept",
    archived: "Gearchiveerd",
  },
};

const statusStyles: Record<Property["status"], string> = {
  active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  coming_soon: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  draft: "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  archived: "bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500",
};

export default async function PropertiesListPage() {
  const supabase = await createClient();
  const { lang } = await getTranslations();
  const tr = lang === "nl"
    ? {
        title: "Residenties",
        subtitle:
          "Beheer je Haven Residenties — foto's, prijzen, beschrijvingen en beschikbaarheid.",
        addResidence: "+ Residentie toevoegen",
        empty: "Nog geen residenties.",
      }
    : {
        title: "Residences",
        subtitle:
          "Manage your Haven Residences — photos, prices, descriptions, and availability.",
        addResidence: "+ Add residence",
        empty: "No residences yet.",
      };
  const statusLabels = statusLabelsByLang[lang];

  const { data } = await supabase
    .from("properties")
    .select("*")
    .order("position", { ascending: true });

  const properties = (data ?? []) as Property[];

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extralight">{tr.title}</h1>
          <p className="text-sm text-neutral-500 mt-1">{tr.subtitle}</p>
        </div>
        <Link
          href="/admin/properties/new"
          className="px-5 py-2.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium hover:opacity-90 transition"
        >
          {tr.addResidence}
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center">
          <p className="text-neutral-500">{tr.empty}</p>
        </div>
      ) : (
        <ul className="grid sm:grid-cols-2 gap-6">
          {properties.map((p) => (
            <li key={p.id}>
              <Link
                href={`/admin/properties/${p.id}`}
                className="group block rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-950 hover:border-neutral-400 dark:hover:border-neutral-600 transition"
              >
                <div className="relative aspect-[16/9] bg-neutral-100 dark:bg-neutral-900">
                  {p.hero_image_url && (
                    <Image
                      src={p.hero_image_url}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  )}
                </div>
                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <h2 className="text-lg font-medium">{p.name}</h2>
                    <span
                      className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded ${
                        statusStyles[p.status]
                      }`}
                    >
                      {statusLabels[p.status]}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500">
                    {p.city}, {p.country} · /{p.slug}
                  </p>
                  {p.tagline && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-1">
                      {p.tagline}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
