import Link from 'next/link';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Accommodaties beheren' };

export default async function AdminPropertiesPage() {
  const supabase = await createClient();
  const { data: properties } = await supabase
    .from('properties')
    .select(
      'id, slug, name, location, base_price_per_night_usd, max_guests, is_published, updated_at'
    )
    .order('display_order');

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h1 className="font-serif text-4xl font-light text-forest-dark">
          Accommodaties
        </h1>
        <p className="text-sm text-forest-dark/60">
          {properties?.length ?? 0} accommodatie{properties?.length === 1 ? '' : 's'}
        </p>
      </div>

      <Card className="mt-8 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-black/[0.06] bg-cream-50 text-left text-xs uppercase tracking-widest text-forest-dark/60">
            <tr>
              <th className="px-6 py-4">Naam</th>
              <th className="px-6 py-4">Locatie</th>
              <th className="px-6 py-4">Prijs/nacht</th>
              <th className="px-6 py-4">Gasten</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Acties</th>
            </tr>
          </thead>
          <tbody>
            {properties?.map((p) => (
              <tr
                key={p.id}
                className="border-b border-black/[0.04] last:border-b-0"
              >
                <td className="px-6 py-4 font-medium text-forest-dark">{p.name}</td>
                <td className="px-6 py-4 text-forest-dark/70">{p.location}</td>
                <td className="px-6 py-4 text-forest-dark/70">
                  ${p.base_price_per_night_usd}
                </td>
                <td className="px-6 py-4 text-forest-dark/70">{p.max_guests}</td>
                <td className="px-6 py-4">
                  {p.is_published ? (
                    <span className="inline-flex items-center rounded-full bg-sage-100 px-2.5 py-0.5 text-xs font-medium text-sage-800">
                      Gepubliceerd
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-cream-200 px-2.5 py-0.5 text-xs font-medium text-forest-dark/70">
                      Concept
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="inline-flex items-center gap-3">
                    {p.is_published ? (
                      <Link
                        href={`/${p.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-xs text-forest-dark/60 hover:text-sage-700"
                      >
                        Bekijk
                        <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                      </Link>
                    ) : null}
                    <Link
                      href={`/admin/properties/${p.id}`}
                      className="inline-flex items-center gap-1 text-sm text-sage-700 hover:text-sage-800"
                    >
                      Bewerken
                      <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {!properties?.length ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-forest-dark/60">
                  Nog geen accommodaties.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>

      <p className="mt-6 text-xs text-forest-dark/60">
        Foto&apos;s, voorzieningen, hoogtepunten en kamers worden in een volgende
        fase via de editor beheerbaar.
      </p>
    </div>
  );
}
