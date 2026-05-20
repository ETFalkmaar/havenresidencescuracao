'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { Database } from '@/lib/supabase/database.types';
import { updateProperty } from './actions';

type Property = Database['public']['Tables']['properties']['Row'];

const inputClass =
  'mt-1 block w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:border-sage-600 focus:outline-none focus:ring-1 focus:ring-sage-600';
const labelClass = 'block';
const labelText = 'text-sm font-medium text-forest-dark';

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={labelClass}>
      <span className={labelText}>{label}</span>
      {children}
      {hint ? (
        <span className="mt-1 block text-xs text-forest-dark/60">{hint}</span>
      ) : null}
    </label>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-6">
      <h2 className="font-serif text-xl text-forest-dark">{title}</h2>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">{children}</div>
    </Card>
  );
}

export function PropertyEditor({ property }: { property: Property }) {
  const [status, setStatus] = useState<
    { kind: 'idle' } | { kind: 'saved' } | { kind: 'error'; message: string }
  >({ kind: 'idle' });
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setStatus({ kind: 'idle' });
    startTransition(async () => {
      const result = await updateProperty(property.id, formData);
      if ('error' in result) {
        setStatus({ kind: 'error', message: result.error });
      } else {
        setStatus({ kind: 'saved' });
      }
    });
  }

  return (
    <form action={onSubmit} className="space-y-6">
      <Section title="Algemeen">
        <Field label="Naam">
          <input
            name="name"
            defaultValue={property.name}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Locatie">
          <input
            name="location"
            defaultValue={property.location}
            required
            className={inputClass}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Korte beschrijving" hint="1 zin — verschijnt onder de hero op de detail-pagina.">
            <textarea
              name="short_description"
              defaultValue={property.short_description}
              required
              rows={2}
              className={inputClass}
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field
            label="Volledige beschrijving"
            hint="Verschijnt als hoofd-tekstblok op de detail-pagina."
          >
            <textarea
              name="description"
              defaultValue={property.description}
              required
              rows={8}
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      <Section title="Hero-foto">
        <Field label="Pad naar foto" hint="Bv. /properties/blue-bay-paradise/zwembad/07.jpeg">
          <input
            name="hero_photo_src"
            defaultValue={property.hero_photo_src}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Alt-tekst" hint="Voor SEO en screenreaders">
          <input
            name="hero_photo_alt"
            defaultValue={property.hero_photo_alt}
            required
            className={inputClass}
          />
        </Field>
      </Section>

      <Section title="Capaciteit & verblijf">
        <Field label="Max gasten">
          <input
            type="number"
            name="max_guests"
            min={1}
            defaultValue={property.max_guests}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Toelichting gasten" hint="Bv. 'maximaal 5 personen waarvan 1 kind'">
          <input
            name="max_guests_note"
            defaultValue={property.max_guests_note ?? ''}
            className={inputClass}
          />
        </Field>
        <Field label="Slaapkamers">
          <input
            type="number"
            name="bedrooms"
            min={0}
            defaultValue={property.bedrooms}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Bedden">
          <input
            type="number"
            name="beds"
            min={0}
            defaultValue={property.beds}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Badkamers">
          <input
            type="number"
            name="bathrooms"
            min={0}
            defaultValue={property.bathrooms}
            required
            className={inputClass}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Check-in">
            <input
              name="check_in"
              defaultValue={property.check_in}
              required
              className={inputClass}
            />
          </Field>
          <Field label="Check-out">
            <input
              name="check_out"
              defaultValue={property.check_out}
              required
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      <Section title="Prijzen (USD)">
        <Field label="Prijs per nacht ($)">
          <input
            type="number"
            name="base_price_per_night_usd"
            min={0}
            defaultValue={property.base_price_per_night_usd}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Schoonmaakkosten ($)">
          <input
            type="number"
            name="cleaning_fee_usd"
            min={0}
            defaultValue={property.cleaning_fee_usd}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Borg ($)">
          <input
            type="number"
            name="deposit_usd"
            min={0}
            defaultValue={property.deposit_usd}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Minimum nachten">
          <input
            type="number"
            name="min_nights"
            min={1}
            defaultValue={property.min_nights}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Long-term vanaf (nachten)">
          <input
            type="number"
            name="long_term_nights"
            min={0}
            defaultValue={property.long_term_nights}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Long-term korting (%)">
          <input
            type="number"
            name="long_term_discount_percent"
            min={0}
            max={100}
            defaultValue={property.long_term_discount_percent}
            required
            className={inputClass}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field
            label="Hoogseizoen-notitie"
            hint="Verschijnt onderaan de booking-card. Laat leeg om te verbergen."
          >
            <textarea
              name="high_season_note"
              defaultValue={property.high_season_note ?? ''}
              rows={2}
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      <Section title="Annulering & integraties">
        <div className="sm:col-span-2">
          <Field label="Annuleringsbeleid">
            <textarea
              name="cancellation_policy"
              defaultValue={property.cancellation_policy}
              required
              rows={3}
              className={inputClass}
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field
            label="Airbnb iCal-URL"
            hint="Plak hier de exporteer-URL van je Airbnb-listing. Wordt elk uur ingelezen om Airbnb-boekingen te blokkeren."
          >
            <input
              name="airbnb_ical_url"
              defaultValue={property.airbnb_ical_url ?? ''}
              placeholder="https://www.airbnb.com/calendar/ical/..."
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      <Section title="Publicatie">
        <div className="sm:col-span-2">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="is_published"
              defaultChecked={property.is_published}
              className="mt-1 h-4 w-4 rounded border-black/20 text-sage-600 focus:ring-sage-600"
            />
            <span className="text-sm text-forest-dark">
              Gepubliceerd op de website
              <span className="mt-1 block text-xs text-forest-dark/60">
                Uitvinken om de accommodatie tijdelijk te verbergen.
              </span>
            </span>
          </label>
        </div>
      </Section>

      <div className="sticky bottom-0 -mx-6 flex items-center justify-between gap-4 border-t border-black/[0.08] bg-cream-100/95 px-6 py-4 backdrop-blur">
        <div className="text-sm">
          {status.kind === 'saved' ? (
            <span className="text-sage-700">Opgeslagen ✓</span>
          ) : status.kind === 'error' ? (
            <span className="text-red-700">Fout: {status.message}</span>
          ) : (
            <span className="text-forest-dark/60">
              Wijzigingen verschijnen direct op de live site.
            </span>
          )}
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? 'Opslaan…' : 'Wijzigingen opslaan'}
        </Button>
      </div>
    </form>
  );
}
