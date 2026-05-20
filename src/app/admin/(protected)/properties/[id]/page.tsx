import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Image as ImageIcon, ListChecks, Sparkles } from 'lucide-react';
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
      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-light text-forest-dark">
            {property.name}
          </h1>
          <p className="mt-1 text-sm text-forest-dark/60">{property.location}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/properties/${id}/photos`}
            className="inline-flex items-center gap-2 rounded-full border border-sage-600 px-4 py-2 text-sm font-medium text-sage-700 transition-colors hover:bg-sage-50"
          >
            <ImageIcon className="h-4 w-4" strokeWidth={1.5} />
            Foto&apos;s
          </Link>
          <Link
            href={`/admin/properties/${id}/highlights`}
            className="inline-flex items-center gap-2 rounded-full border border-sage-600 px-4 py-2 text-sm font-medium text-sage-700 transition-colors hover:bg-sage-50"
          >
            <Sparkles className="h-4 w-4" strokeWidth={1.5} />
            Highlights
          </Link>
          <Link
            href={`/admin/properties/${id}/rules`}
            className="inline-flex items-center gap-2 rounded-full border border-sage-600 px-4 py-2 text-sm font-medium text-sage-700 transition-colors hover:bg-sage-50"
          >
            <ListChecks className="h-4 w-4" strokeWidth={1.5} />
            Huisregels
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <PropertyEditor property={property} />
      </div>
    </div>
  );
}
