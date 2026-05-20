import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/site/PageHeader';

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'Privacybeleid van Haven Residences.',
};

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Juridisch"
        title="Privacybeleid"
        description="Hoe wij met jouw gegevens omgaan."
      />
      <section className="py-20">
        <Container>
          <div className="mx-auto max-w-2xl leading-relaxed text-forest-dark/80">
            <p>
              Onze volledige privacyverklaring wordt binnenkort toegevoegd. Heb je in
              de tussentijd een vraag over hoe wij omgaan met je gegevens? Neem
              gerust contact met ons op.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
