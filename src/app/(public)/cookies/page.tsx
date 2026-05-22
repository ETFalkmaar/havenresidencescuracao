import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/site/PageHeader';

export const metadata: Metadata = {
  title: 'Cookies',
  description: 'Cookie-beleid van Haven Residences.',
};

export default function CookiesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Juridisch"
        title="Cookies"
        description="Welke cookies gebruiken wij en waarom."
      />
      <section className="py-14 sm:py-20">
        <Container>
          <div className="mx-auto max-w-2xl leading-relaxed text-forest-dark/80">
            <p>
              Deze site gebruikt momenteel alleen technisch noodzakelijke cookies
              voor het correct functioneren. Een uitgebreide cookieverklaring volgt
              zodra we analytics of andere derde-partij-diensten activeren.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
