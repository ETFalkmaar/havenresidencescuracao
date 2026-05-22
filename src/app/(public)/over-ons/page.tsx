import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/site/PageHeader';
import { overOnsContent } from '@/lib/page-content';

export const metadata: Metadata = {
  title: 'Over ons',
  description: overOnsContent.hero.description,
};

export default function OverOnsPage() {
  const { hero, intro, values } = overOnsContent;
  return (
    <>
      <PageHeader {...hero} />
      <section className="py-14 sm:py-20">
        <Container>
          <div className="mx-auto max-w-2xl">
            <h2 className="font-serif text-3xl font-light text-forest-dark">
              {intro.title}
            </h2>
            <div className="mt-6 space-y-5 leading-relaxed text-forest-dark/80">
              {intro.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-black/[0.06] bg-cream-50 py-14 sm:py-20">
        <Container>
          <h2 className="text-center font-serif text-3xl font-light text-forest-dark">
            Waar wij voor staan
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {values.map((value) => (
              <div key={value.title}>
                <h3 className="font-serif text-xl text-forest-dark">{value.title}</h3>
                <p className="mt-2 leading-relaxed text-forest-dark/70">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
