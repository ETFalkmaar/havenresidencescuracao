import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/site/PageHeader';

export const metadata: Metadata = {
  title: 'Algemene voorwaarden',
  description: 'De voorwaarden voor verblijven bij Haven Residences.',
};

export default function VoorwaardenPage() {
  return (
    <>
      <PageHeader
        eyebrow="Juridisch"
        title="Algemene voorwaarden"
        description="De afspraken tussen jou en Haven Residences."
      />
      <section className="py-20">
        <Container>
          <div className="mx-auto max-w-2xl leading-relaxed text-forest-dark/80">
            <p>
              Onze algemene voorwaarden worden binnenkort toegevoegd. Specifieke
              huisregels en annuleringsvoorwaarden staan vermeld op de pagina van
              elke accommodatie.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
