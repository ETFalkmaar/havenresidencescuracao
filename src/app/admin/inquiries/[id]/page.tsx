import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "../StatusBadge";
import { StatusActions } from "./StatusActions";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

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

export default async function InquiryDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("inquiries")
    .select("*")
    .eq("id", id)
    .single();

  const inquiry = data as InquiryRow | null;
  if (!inquiry) notFound();

  let property: { name: string; slug: string } | null = null;
  if (inquiry.property_id) {
    const { data: p } = await supabase
      .from("properties")
      .select("name, slug")
      .eq("id", inquiry.property_id)
      .single();
    property = p as { name: string; slug: string } | null;
  }

  const subject = encodeURIComponent(
    property
      ? `Re: your inquiry about ${property.name}`
      : "Re: your inquiry — Haven Residence",
  );
  const body = encodeURIComponent(
    `Hello ${inquiry.name},\n\nThank you for your message — \n\n— Haven Residence`,
  );
  const mailto = `mailto:${inquiry.email}?subject=${subject}&body=${body}`;

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <Link
        href="/admin/inquiries"
        className="text-xs uppercase tracking-[0.3em] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition"
      >
        ← All inquiries
      </Link>

      <div className="mt-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extralight">{inquiry.name}</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {new Date(inquiry.created_at).toLocaleString("en-GB", {
              dateStyle: "long",
              timeStyle: "short",
            })}
          </p>
        </div>
        <StatusBadge status={inquiry.status} />
      </div>

      <div className="mt-8 grid lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-950">
            <p className="text-xs uppercase tracking-widest text-neutral-500 mb-3">
              Message
            </p>
            <p className="whitespace-pre-line text-neutral-800 dark:text-neutral-200 leading-relaxed">
              {inquiry.message}
            </p>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-4 bg-white dark:bg-neutral-950">
            <div>
              <p className="text-xs uppercase tracking-widest text-neutral-500 mb-1">
                Email
              </p>
              <a
                href={mailto}
                className="text-sm break-all hover:underline"
              >
                {inquiry.email}
              </a>
            </div>
            {inquiry.phone && (
              <div>
                <p className="text-xs uppercase tracking-widest text-neutral-500 mb-1">
                  Phone
                </p>
                <a
                  href={`tel:${inquiry.phone}`}
                  className="text-sm hover:underline"
                >
                  {inquiry.phone}
                </a>
              </div>
            )}
            {inquiry.preferred_dates && (
              <div>
                <p className="text-xs uppercase tracking-widest text-neutral-500 mb-1">
                  Preferred dates
                </p>
                <p className="text-sm">{inquiry.preferred_dates}</p>
              </div>
            )}
            {property && (
              <div>
                <p className="text-xs uppercase tracking-widest text-neutral-500 mb-1">
                  Property
                </p>
                <Link
                  href={`/${property.slug}`}
                  target="_blank"
                  className="text-sm hover:underline"
                >
                  {property.name} ↗
                </Link>
              </div>
            )}
            <a
              href={mailto}
              className="block text-center mt-2 px-4 py-2.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium hover:opacity-90 transition"
            >
              Reply by email
            </a>
          </div>

          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-950">
            <StatusActions id={inquiry.id} current={inquiry.status} />
          </div>
        </aside>
      </div>
    </main>
  );
}
