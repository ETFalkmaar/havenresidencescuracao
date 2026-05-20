import { Container } from '@/components/ui/Container';

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="border-b border-black/[0.06] bg-cream-50 py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          {eyebrow ? (
            <p className="text-xs uppercase tracking-widest text-sage-600">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-3 font-serif text-5xl font-light text-forest-dark sm:text-6xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-5 text-base leading-relaxed text-forest-dark/75 sm:text-lg">
              {description}
            </p>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
