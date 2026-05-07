import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await createClient();

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
    { label: "Properties", value: propertiesRes.count ?? 0, href: "/admin/properties" },
    { label: "Units", value: unitsRes.count ?? 0, href: "/admin/properties" },
    { label: "New inquiries", value: inquiriesRes.count ?? 0, href: "/admin/inquiries" },
    { label: "Bookings", value: bookingsRes.count ?? 0, href: "/admin/bookings" },
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
    <main className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-extralight mb-2">Dashboard</h1>
      <p className="text-sm text-neutral-500 mb-10">
        Welcome back. Here&apos;s a snapshot of Haven Residence.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="block rounded-xl border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950 p-5 hover:border-neutral-400 dark:hover:border-neutral-700 transition"
          >
            <p className="text-xs uppercase tracking-widest text-neutral-500 mb-2">
              {s.label}
            </p>
            <p className="text-3xl font-light">{s.value}</p>
          </Link>
        ))}
      </div>

      <section className="rounded-xl border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Recent inquiries</h2>
          <Link
            href="/admin/inquiries"
            className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            View all →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-neutral-500 py-8 text-center">
            No inquiries yet. They&apos;ll appear here as guests submit the form.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-200 dark:divide-neutral-900">
            {recent.map((inq) => (
              <li key={inq.id} className="py-4 flex justify-between gap-6">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">
                    {inq.name}{" "}
                    <span className="text-neutral-500 font-normal">· {inq.email}</span>
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate mt-0.5">
                    {inq.message}
                  </p>
                </div>
                <div className="text-xs text-neutral-500 shrink-0 text-right">
                  <p>{new Date(inq.created_at).toLocaleDateString("en-GB")}</p>
                  <p className="mt-1">
                    <span
                      className={`inline-block px-2 py-0.5 rounded ${
                        inq.status === "new"
                          ? "bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200"
                          : "bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300"
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
    </main>
  );
}
