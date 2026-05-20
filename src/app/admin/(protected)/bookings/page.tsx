import { formatDistanceToNow } from '@/lib/date-format';
import { Card } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Boekingen' };

const STATUS_LABELS: Record<string, string> = {
  pending: 'In afwachting',
  confirmed: 'Bevestigd',
  cancelled: 'Geannuleerd',
  expired: 'Verlopen',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-cream-200 text-forest-dark',
  confirmed: 'bg-sage-100 text-sage-800',
  cancelled: 'bg-cream-100 text-forest-dark/50',
  expired: 'bg-cream-100 text-forest-dark/40',
};

function formatUSD(amount: number) {
  return `$${amount.toLocaleString('nl-NL')}`;
}

export default async function AdminBookingsPage() {
  const supabase = await createClient();
  const { data: bookings } = await supabase
    .from('bookings')
    .select(
      `id, guest_name, guest_email, guest_phone, arrival, departure, guests,
       total_price_usd, status, created_at,
       properties ( name, slug )`
    )
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h1 className="font-serif text-4xl font-light text-forest-dark">
          Boekingen
        </h1>
        <p className="text-sm text-forest-dark/60">
          {bookings?.length ?? 0} boeking{bookings?.length === 1 ? '' : 'en'}
        </p>
      </div>

      {!bookings?.length ? (
        <Card className="mt-8 p-12 text-center">
          <h2 className="font-serif text-2xl font-light text-forest-dark">
            Nog geen boekingen
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-forest-dark/70">
            Boekingen verschijnen hier zodra de online betaling via Stripe live
            staat. Tot dan kunnen gasten reserveren via WhatsApp en houd je dat
            handmatig bij.
          </p>
        </Card>
      ) : (
        <Card className="mt-8 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-black/[0.06] bg-cream-50 text-left text-xs uppercase tracking-widest text-forest-dark/60">
              <tr>
                <th className="px-6 py-4">Gast</th>
                <th className="px-6 py-4">Accommodatie</th>
                <th className="px-6 py-4">Aankomst</th>
                <th className="px-6 py-4">Vertrek</th>
                <th className="px-6 py-4">Bedrag</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Datum</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-black/[0.04] last:border-b-0"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-forest-dark">
                      {b.guest_name}
                    </div>
                    <div className="text-xs text-forest-dark/60">
                      {b.guest_email}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-forest-dark/80">
                    {b.properties?.name ?? '—'}
                  </td>
                  <td className="px-6 py-4 text-forest-dark/70">{b.arrival}</td>
                  <td className="px-6 py-4 text-forest-dark/70">{b.departure}</td>
                  <td className="px-6 py-4 text-forest-dark/70">
                    {formatUSD(b.total_price_usd)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_COLORS[b.status] ?? STATUS_COLORS.pending
                      }`}
                    >
                      {STATUS_LABELS[b.status] ?? b.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-forest-dark/60">
                    {formatDistanceToNow(b.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
