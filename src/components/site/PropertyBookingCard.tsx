import { Calendar, Clock, MessageCircle, ShieldCheck, Users } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { PropertyData } from '@/lib/properties';
import { siteConfig } from '@/lib/site-config';

function formatUSD(amount: number): string {
  return `$${amount.toLocaleString('nl-NL')}`;
}

function buildWhatsAppUrl(property: PropertyData): string | null {
  const phone = siteConfig.contact.phone;
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  const message = `Hallo, ik wil graag meer info over ${property.name}.

Aankomst:
Vertrek:
Aantal gasten:

Alvast bedankt!`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function PropertyBookingCard({ property }: { property: PropertyData }) {
  const { pricing, stay } = property;
  const whatsappUrl = buildWhatsAppUrl(property);

  return (
    <Card className="p-6 lg:sticky lg:top-24">
      <div className="flex items-baseline gap-2">
        <span className="font-serif text-3xl text-forest-dark">
          {formatUSD(pricing.basePricePerNightUSD)}
        </span>
        <span className="text-sm text-forest-dark/60">per nacht</span>
      </div>
      <p className="mt-1 text-xs text-forest-dark/60">
        {pricing.longTermDiscountPercent}% korting vanaf {pricing.longTermNights} nachten
      </p>

      <div className="mt-6 space-y-3 text-sm text-forest-dark/80">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-sage-600" strokeWidth={1.5} />
          <span>
            Tot {stay.maxGuests} gasten
            {stay.maxGuestsNote ? ` · ${stay.maxGuestsNote}` : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-sage-600" strokeWidth={1.5} />
          <span>
            Check-in {stay.checkIn} · check-out {stay.checkOut}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-sage-600" strokeWidth={1.5} />
          <span>
            Vanaf {pricing.minNights} {pricing.minNights === 1 ? 'nacht' : 'nachten'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-sage-600" strokeWidth={1.5} />
          <span>
            Borg {formatUSD(pricing.depositUSD)} · schoonmaak {formatUSD(pricing.cleaningFeeUSD)}
          </span>
        </div>
      </div>

      {whatsappUrl ? (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-sage-600 px-7 py-3 text-sm font-medium tracking-wide text-white transition-colors hover:bg-sage-700"
        >
          <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
          Reserveer via WhatsApp
        </a>
      ) : null}
      <p className="mt-3 text-center text-xs text-forest-dark/60">
        Online reserveren met directe betaling volgt binnenkort.
      </p>

      {pricing.highSeasonNote ? (
        <p className="mt-6 border-t border-black/[0.06] pt-4 text-xs leading-relaxed text-forest-dark/60">
          {pricing.highSeasonNote}
        </p>
      ) : null}
    </Card>
  );
}
