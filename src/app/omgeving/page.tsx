import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/site/PageHeader';
import { omgevingContent } from '@/lib/page-content';

export const metadata: Metadata = {
  title: 'Omgeving',
  description: omgevingContent.hero.description,
};

export default function OmgevingPage() {
  const { hero, sections } = omgevingContent;
  return (
    <>
      <PageHeader {...hero} />
      <section className="py-20">
        <Container>
          <div className="mx-auto max-w-3xl space-y-12">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="font-serif text-3xl font-light text-forest-dark">
                  {section.title}
                </h2>
                <p className="mt-4 leading-relaxed text-forest-dark/80">
                  {section.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
