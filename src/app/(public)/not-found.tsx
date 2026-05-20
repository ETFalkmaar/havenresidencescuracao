import Link from 'next/link';
import { Container } from '@/components/ui/Container';

export default function PublicNotFound() {
  return (
    <main className="py-24">
      <Container>
        <div className="mx-auto max-w-md text-center">
          <p className="text-xs uppercase tracking-widest text-sage-600">404</p>
          <h1 className="mt-3 font-serif text-5xl font-light text-forest-dark sm:text-6xl">
            Niet gevonden
          </h1>
          <p className="mt-5 leading-relaxed text-forest-dark/70">
            Deze pagina bestaat niet (meer). Misschien is de accommodatie
            verplaatst, of klopte de link niet helemaal.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-sage-600 px-7 py-3 text-sm font-medium tracking-wide text-white transition-colors hover:bg-sage-700"
          >
            Terug naar de homepage
          </Link>
        </div>
      </Container>
    </main>
  );
}
