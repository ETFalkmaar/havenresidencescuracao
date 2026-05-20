import { blueBayParadise, type PropertyData } from './blue-bay-paradise';

export const properties: PropertyData[] = [blueBayParadise];

export function getPropertyBySlug(slug: string): PropertyData | undefined {
  return properties.find((p) => p.slug === slug);
}

export type { PropertyData } from './blue-bay-paradise';
