import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { HighlightsEditor } from './HighlightsEditor';

export const metadata = { title: 'Highlights' };

export default async function HighlightsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: property } = await supabase
    .from('properties')
    .select('id, name')
    .eq('id', id)
    .maybeSingle();
  if (!property) notFound();

  const { data: highlights } = await supabase
    .from('property_highlights')
    .select('id, title, description, display_order')
    .eq('property_id', id)
    .order('display_order');

  return (
    <div>
      <Link
        href={`/admin/properties/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-forest-dark/60 hover:text-sage-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        Terug naar {property.name}
      </Link>
      <h1 className="mt-3 font-serif text-4xl font-light text-forest-dark">
        Highlights
      </h1>
      <p className="mt-1 text-sm text-forest-dark/60">
        Vier hoogtepunten die op de detail-pagina als &quot;In de kijker&quot;
        verschijnen.
      </p>

      <div className="mt-8 max-w-2xl">
        <HighlightsEditor
          initial={(highlights ?? []).map((h) => ({
            id: h.id,
            title: h.title,
            description: h.description,
          }))}
          propertyId={id}
        />
      </div>
    </div>
  );
}
