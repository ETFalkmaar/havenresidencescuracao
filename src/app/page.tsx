import { Container } from '@/components/ui/Container';

export default function HomePage() {
  return (
    <main className="py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-widest text-sage-600">
            Welkom bij
          </p>
          <h1 className="mt-3 font-serif text-6xl font-light text-forest-dark">
            Haven Residences
          </h1>
        </div>
      </Container>
    </main>
  );
}
