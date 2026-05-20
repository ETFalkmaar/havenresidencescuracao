'use client';

import { useState, useTransition } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { submitInquiry } from '@/app/(public)/contact/actions';

const inputClass =
  'mt-1 block w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:border-sage-600 focus:outline-none focus:ring-1 focus:ring-sage-600';

export function InquiryForm() {
  const [status, setStatus] = useState<
    { kind: 'idle' } | { kind: 'sent' } | { kind: 'error'; message: string }
  >({ kind: 'idle' });
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setStatus({ kind: 'idle' });
    startTransition(async () => {
      const result = await submitInquiry(formData);
      if ('error' in result) {
        setStatus({ kind: 'error', message: result.error });
      } else {
        setStatus({ kind: 'sent' });
      }
    });
  }

  if (status.kind === 'sent') {
    return (
      <Card className="p-8 text-center">
        <h3 className="font-serif text-2xl text-forest-dark">Bericht verstuurd</h3>
        <p className="mt-3 text-sm leading-relaxed text-forest-dark/70">
          Bedankt voor je bericht. We nemen zo snel mogelijk contact met je op.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-8">
      <h3 className="font-serif text-2xl text-forest-dark">Stuur ons een bericht</h3>
      <p className="mt-2 text-sm text-forest-dark/70">
        Liever direct contact? Bel of WhatsApp ons via{' '}
        <span className="text-sage-700">+31 6 22752835</span>.
      </p>

      <form action={onSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-forest-dark">Naam</span>
            <input
              name="name"
              autoComplete="name"
              required
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-forest-dark">Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              className={inputClass}
            />
          </label>
        </div>
        <label className="block">
          <span className="text-sm font-medium text-forest-dark">
            Telefoon <span className="text-forest-dark/50">(optioneel)</span>
          </span>
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-forest-dark">Bericht</span>
          <textarea
            name="message"
            required
            rows={6}
            maxLength={5000}
            className={inputClass}
            placeholder="Vertel ons over je verblijfsplannen, vraag of opmerking…"
          />
        </label>

        {status.kind === 'error' ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {status.message}
          </p>
        ) : null}

        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          <Send className="mr-2 h-4 w-4" strokeWidth={1.5} />
          {pending ? 'Versturen…' : 'Verstuur bericht'}
        </Button>
      </form>
    </Card>
  );
}
