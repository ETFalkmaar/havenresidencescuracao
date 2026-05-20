import { formatDistanceToNow } from '@/lib/date-format';
import { Card } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/server';
import { InquiryStatusForm } from './InquiryStatusForm';

export const metadata = { title: 'Berichten' };

export default async function AdminInquiriesPage() {
  const supabase = await createClient();
  const { data: inquiries } = await supabase
    .from('inquiries')
    .select('id, guest_name, guest_email, guest_phone, message, status, created_at')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h1 className="font-serif text-4xl font-light text-forest-dark">
          Berichten
        </h1>
        <p className="text-sm text-forest-dark/60">
          {inquiries?.length ?? 0} bericht{inquiries?.length === 1 ? '' : 'en'}
        </p>
      </div>

      <div className="mt-8 space-y-4">
        {inquiries?.length ? (
          inquiries.map((inquiry) => (
            <Card key={inquiry.id} className="p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <h3 className="font-medium text-forest-dark">
                    {inquiry.guest_name}
                  </h3>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-forest-dark/70">
                    <a
                      href={`mailto:${inquiry.guest_email}`}
                      className="hover:text-sage-700"
                    >
                      {inquiry.guest_email}
                    </a>
                    {inquiry.guest_phone ? (
                      <a
                        href={`tel:${inquiry.guest_phone}`}
                        className="hover:text-sage-700"
                      >
                        {inquiry.guest_phone}
                      </a>
                    ) : null}
                    <span>{formatDistanceToNow(inquiry.created_at)}</span>
                  </div>
                </div>
                <InquiryStatusForm
                  id={inquiry.id}
                  currentStatus={inquiry.status}
                />
              </div>
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-forest-dark/80">
                {inquiry.message}
              </p>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center text-forest-dark/60">
            Nog geen berichten ontvangen. Berichten via het contactformulier op
            de site verschijnen hier.
          </Card>
        )}
      </div>
    </div>
  );
}
