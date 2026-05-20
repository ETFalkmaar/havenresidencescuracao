import type { Metadata } from 'next';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/site/PageHeader';
import { beheerContent } from '@/lib/page-content';

export const metadata: Metadata = {
  title: 'Beheer',
  description: beheerContent.hero.description,
};

export default function BeheerPage() {
  const { hero, services, forWho } = beheerContent;
  return (
    <>
      <PageHeader {...hero} />

      <section className="py-20">
        <Container>
          <h2 className="text-center font-serif text-3xl font-light text-forest-dark">
            Wat wij doen
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {services.map((service) => (
              <div key={service.title} className="flex gap-4">
                <Sparkles
                  className="mt-1 h-5 w-5 shrink-0 text-sage-600"
                  strokeWidth={1.5}
                />
                <div>
                  <h3 className="font-serif text-xl text-forest-dark">
                    {service.title}
                  </h3>
                  <p className="mt-2 leading-relaxed text-forest-dark/70">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section
        id="eigenaren"
        className="border-t border-black/[0.06] bg-cream-50 py-20"
      >
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-light text-forest-dark">
              {forWho.title}
            </h2>
            <div className="mt-6 space-y-5 leading-relaxed text-forest-dark/80">
              {forWho.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <ButtonLink href="/contact" className="mt-8">
              Neem contact op
              <ArrowRight className="ml-2 h-4 w-4" strokeWidth={1.5} />
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
