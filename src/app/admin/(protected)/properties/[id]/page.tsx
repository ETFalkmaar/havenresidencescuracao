import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PropertyEditor } from './PropertyEditor';

export const metadata = { title: 'Accommodatie bewerken' };

export default async function AdminPropertyEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!property) notFound();

  return (
    <div>
      <Link
        href="/admin/properties"
        className="inline-flex items-center gap-1.5 text-sm text-forest-dark/60 hover:text-sage-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        Terug naar accommodaties
      </Link>
      <h1 className="mt-3 font-serif text-4xl font-light text-forest-dark">
        {property.name}
      </h1>
      <p className="mt-1 text-sm text-forest-dark/60">{property.location}</p>

      <div className="mt-8">
        <PropertyEditor property={property} />
      </div>
    </div>
  );
}
