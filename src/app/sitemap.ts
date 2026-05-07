import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://havenresidencescuracao.com";

  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select("slug, status, updated_at");

  type Row = { slug: string; status: string; updated_at: string };
  const properties = ((data ?? []) as Row[]).filter(
    (p) => p.status === "active" || p.status === "coming_soon",
  );

  const propertyEntries: MetadataRoute.Sitemap = properties.map((p) => ({
    url: `${base}/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...propertyEntries,
  ];
}
