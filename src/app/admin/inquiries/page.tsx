import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n/server";
import { StatusBadge } from "./StatusBadge";

export const dynamic = "force-dynamic";

type InquiryRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  preferred_dates: string | null;
  property_id: string | null;
  status: "new" | "replied" | "closed";
  created_at: string;
};

type PropertyMini = { id: string; name: string };

export default async function InquiriesListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: statusFilter = "all" } = await searchParams;
  const supabase = await createClient();
  const { lang } = await getTranslations();
  const tr = lang === "nl"
    ? {
        title: "Aanvragen",
        subtitle: "Berichten ingediend via het contactformulier op de site.",
        all: "Alle",
        new: "Nieuw",
        replied: "Beantwoord",
        closed: "Gesloten",
        empty: "Nog geen aanvragen.",
        emptyFiltered: (s: string) => `Geen aanvragen met status "${s}".`,
      }
    : {
        title: "Inquiries",
        subtitle: "Messages submitted via the website's contact form.",
        all: "All",
        new: "New",
        replied: "Replied",
        closed: "Closed",
        empty: "No inquiries yet.",
        emptyFiltered: (s: string) => `No inquiries with status "${s}".`,
      };

  let query = supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (statusFilter === "new" || statusFilter === "replied" || statusFilter === "closed") {
    query = query.eq("status", statusFilter);
  }

  const [inquiriesRes, propertiesRes] = await Promise.all([
    query,
    supabase.from("properties").select("id, name"),
  ]);

  const inquiries = (inquiriesRes.data ?? []) as InquiryRow[];
  const propertiesList = (propertiesRes.data ?? []) as PropertyMini[];
  const propertyById = new Map(propertiesList.map((p) => [p.id, p]));

  const filters: { key: string; label: string }[] = [
    { key: "all", label: tr.all },
    { key: "new", label: tr.new },
    { key: "replied", label: tr.replied },
    { key: "closed", label: tr.closed },
  ];

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extralight">{tr.title}</h1>
          <p className="text-sm text-neutral-500 mt-1">{tr.subtitle}</p>
        </div>
        <nav className="flex gap-1 text-xs">
          {filters.map((f) => {
            const active = (statusFilter || "all") === f.key;
            return (
              <Link
                key={f.key}
                href={f.key === "all" ? "/admin/inquiries" : `/admin/inquiries?status=${f.key}`}
                className={`px-3 py-1.5 rounded-full border transition ${
                  active
                    ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-neutral-900 dark:border-neutral-100"
                    : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                }`}
              >
                {f.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {inquiries.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center">
          <p className="text-neutral-500">
            {statusFilter === "all"
              ? tr.empty
              : tr.emptyFiltered(statusFilter)}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-neutral-200 dark:divide-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-950">
          {inquiries.map((q) => {
            const property = q.property_id ? propertyById.get(q.property_id) : null;
            return (
              <li key={q.id}>
                <Link
                  href={`/admin/inquiries/${q.id}`}
                  className="block px-5 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <span className="font-medium">{q.name}</span>
                        <span className="text-xs text-neutral-500">
                          &lt;{q.email}&gt;
                        </span>
                        <StatusBadge status={q.status} />
                        {property && (
                          <span className="text-xs text-neutral-500">
                            · {property.name}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-1">
                        {q.message}
                      </p>
                    </div>
                    <span className="text-xs text-neutral-500 whitespace-nowrap">
                      {new Date(q.created_at).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
