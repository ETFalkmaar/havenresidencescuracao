import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  title: 'Beheer-login',
  robots: { index: false, follow: false },
};

const ERROR_MESSAGES: Record<string, string> = {
  'not-admin':
    'Je bent ingelogd maar hebt geen beheerrechten. Vraag een bestaande beheerder om je toegang te geven.',
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const initialError = error ? ERROR_MESSAGES[error] ?? error : undefined;

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream-100 px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-3"
            aria-label="Naar de publieke site"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-600 font-serif text-sm font-medium tracking-wider text-white">
              HR
            </span>
            <span className="font-serif text-xl font-medium tracking-wide text-forest-dark">
              Haven Residences
            </span>
          </Link>
          <p className="mt-4 text-xs uppercase tracking-widest text-sage-600">
            Beheer
          </p>
          <h1 className="mt-2 font-serif text-3xl font-light text-forest-dark">
            Welkom terug
          </h1>
        </div>

        <div className="mt-10">
          <LoginForm initialError={initialError} />
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm text-forest-dark/60 transition-colors hover:text-forest-dark"
          >
            ← Terug naar de site
          </Link>
        </div>
      </div>
    </main>
  );
}
