import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { RulesEditor } from './RulesEditor';

export const metadata = { title: 'Huisregels' };

export default async function RulesPage({
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

  const { data: rules } = await supabase
    .from('property_house_rules')
    .select('id, rule, display_order')
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
        Huisregels
      </h1>
      <p className="mt-1 text-sm text-forest-dark/60">
        Regels die op de detail-pagina onder &quot;Huisregels&quot; verschijnen.
      </p>

      <div className="mt-8 max-w-2xl">
        <RulesEditor
          initial={(rules ?? []).map((r) => ({ id: r.id, rule: r.rule }))}
          propertyId={id}
        />
      </div>
    </div>
  );
}
