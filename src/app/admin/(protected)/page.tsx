import Link from 'next/link';
import { ArrowRight, Building2, Calendar, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/server';

async function getCounts() {
  const supabase = await createClient();
  const [{ count: propertyCount }, { count: bookingCount }, { count: inquiryCount }] =
    await Promise.all([
      supabase.from('properties').select('id', { count: 'exact', head: true }),
      supabase.from('bookings').select('id', { count: 'exact', head: true }),
      supabase
        .from('inquiries')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'new'),
    ]);
  return {
    properties: propertyCount ?? 0,
    bookings: bookingCount ?? 0,
    newInquiries: inquiryCount ?? 0,
  };
}

export default async function AdminDashboardPage() {
  const counts = await getCounts();

  const cards = [
    {
      title: 'Accommodaties',
      count: counts.properties,
      href: '/admin/properties',
      icon: Building2,
      cta: 'Beheer accommodaties',
    },
    {
      title: 'Boekingen',
      count: counts.bookings,
      href: '/admin/bookings',
      icon: Calendar,
      cta: 'Bekijk boekingen',
    },
    {
      title: 'Nieuwe berichten',
      count: counts.newInquiries,
      href: '/admin/inquiries',
      icon: MessageSquare,
      cta: 'Bekijk berichten',
    },
  ];

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h1 className="font-serif text-4xl font-light text-forest-dark">
          Dashboard
        </h1>
        <p className="text-sm text-forest-dark/60">
          Overzicht van je accommodaties en aanvragen
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ title, count, href, icon: Icon, cta }) => (
          <Card key={title} className="p-6">
            <div className="flex items-center justify-between">
              <Icon className="h-6 w-6 text-sage-600" strokeWidth={1.5} />
              <span className="font-serif text-3xl text-forest-dark">{count}</span>
            </div>
            <h2 className="mt-4 font-medium text-forest-dark">{title}</h2>
            <Link
              href={href}
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-sage-700 transition-colors hover:text-sage-800"
            >
              {cta}
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
          </Card>
        ))}
      </div>

      <Card className="mt-10 p-6">
        <h2 className="font-serif text-2xl font-light text-forest-dark">
          Aan de slag
        </h2>
        <ul className="mt-4 space-y-2 text-sm leading-relaxed text-forest-dark/80">
          <li>
            <strong>Accommodaties</strong> &mdash; beheer de tekst, foto&apos;s en
            prijzen van je woningen (functionaliteit volgt in volgende stap).
          </li>
          <li>
            <strong>Boekingen</strong> &mdash; overzicht van alle reserveringen
            (actief zodra Stripe-betaling live staat).
          </li>
          <li>
            <strong>Berichten</strong> &mdash; inkomende vragen van bezoekers via
            het contactformulier.
          </li>
        </ul>
      </Card>
    </div>
  );
}
