import type { MetadataRoute } from 'next';
import { properties } from '@/lib/properties';

export default function sitemap(): MetadataRoute.Sitemap {
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

  const propertyRoutes: MetadataRoute.Sitemap = properties.map((property) => ({
    url: `${baseUrl}/${property.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...propertyRoutes];
}
