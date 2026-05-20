import type { MetadataRoute } from 'next';
import { getAllSlugs } from '@/lib/properties';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://havenresidencescuracao.com';
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    '/',
    '/accommodaties',
    '/beheer',
    '/over-ons',
    '/omgeving',
    '/contact',
    '/privacy',
    '/voorwaarden',
    '/cookies',
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: path === '/' ? 1.0 : 0.7,
  }));

  const slugs = await getAllSlugs();
  const propertyRoutes: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${baseUrl}/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...propertyRoutes];
}
