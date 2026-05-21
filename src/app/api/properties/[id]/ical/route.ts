import { NextRequest } from 'next/server';
import { buildICal, type OccupiedRange } from '@/lib/ical';
import { createClient } from '@/lib/supabase/server';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://havenresidencescuracao.com';
const PROD_ID = '-//Haven Residences//EN';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: property } = await supabase
    .from('properties')
    .select('id, name, slug')
    .eq('id', id)
    .eq('is_published', true)
    .maybeSingle();

  if (!property) {
    return new Response('Property not found', { status: 404 });
  }

  // Gebruik de public view zodat we geen personalia teruggeven.
  const { data: occupied, error } = await supabase
    .from('property_occupied_dates')
    .select('start_date, end_date, source')
    .eq('property_id', id);

  if (error) {
    return new Response(`Sync failed: ${error.message}`, { status: 500 });
  }

  const events: OccupiedRange[] = (occupied ?? [])
    .filter((row) => row.start_date && row.end_date)
    .map((row, index) => ({
      uid: `${row.source ?? 'occupied'}-${property.id}-${index}@${new URL(SITE_URL).host}`,
      startDate: row.start_date as string,
      endDate: row.end_date as string,
      summary: `${property.name}: geboekt`,
    }));

  const body = buildICal({
    prodId: PROD_ID,
    calendarName: `${property.name} · Haven Residences`,
    events,
  });

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=300',
      'Content-Disposition': `inline; filename="${property.slug}.ics"`,
    },
  });
}
