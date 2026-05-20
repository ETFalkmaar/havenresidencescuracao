import { NextRequest } from 'next/server';
import { parseICal } from '@/lib/ical';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type SyncResult = {
  property_id: string;
  slug: string;
  status: 'ok' | 'fetch-failed' | 'parse-empty' | 'error';
  events?: number;
  http_code?: number;
  message?: string;
};

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get('authorization');
  return header === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: properties, error: fetchError } = await supabase
    .from('properties')
    .select('id, slug, airbnb_ical_url')
    .not('airbnb_ical_url', 'is', null);

  if (fetchError) {
    return Response.json(
      { ok: false, error: fetchError.message },
      { status: 500 }
    );
  }

  const results: SyncResult[] = [];

  for (const property of properties ?? []) {
    const url = property.airbnb_ical_url;
    if (!url) continue;

    try {
      const res = await fetch(url, {
        cache: 'no-store',
        headers: { 'User-Agent': 'HavenResidences-iCal-Sync/1.0' },
      });

      if (!res.ok) {
        results.push({
          property_id: property.id,
          slug: property.slug,
          status: 'fetch-failed',
          http_code: res.status,
        });
        continue;
      }

      const raw = await res.text();
      const events = parseICal(raw);

      await supabase
        .from('external_blocked_dates')
        .delete()
        .eq('property_id', property.id)
        .eq('source', 'airbnb');

      if (events.length > 0) {
        const rows = events.map((e) => ({
          property_id: property.id,
          start_date: e.startDate,
          end_date: e.endDate,
          source: 'airbnb',
          external_uid: e.uid,
        }));
        const { error: insertError } = await supabase
          .from('external_blocked_dates')
          .insert(rows);
        if (insertError) {
          results.push({
            property_id: property.id,
            slug: property.slug,
            status: 'error',
            message: insertError.message,
          });
          continue;
        }
      }

      results.push({
        property_id: property.id,
        slug: property.slug,
        status: events.length === 0 ? 'parse-empty' : 'ok',
        events: events.length,
      });
    } catch (err) {
      results.push({
        property_id: property.id,
        slug: property.slug,
        status: 'error',
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return Response.json({
    ok: true,
    synced_at: new Date().toISOString(),
    properties: results.length,
    results,
  });
}
