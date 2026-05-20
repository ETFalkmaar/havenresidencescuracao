'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { signIn, signUp, type AuthResult } from './actions';

type Mode = 'signin' | 'signup';

export function LoginForm({ initialError }: { initialError?: string }) {
  const [mode, setMode] = useState<Mode>('signin');
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const action = mode === 'signin' ? signIn : signUp;
      const result: AuthResult = await action(formData);
      if ('error' in result) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="flex gap-1 rounded-full bg-cream-200/60 p-1">
        <button
          type="button"
          onClick={() => setMode('signin')}
          className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
            mode === 'signin'
              ? 'bg-white text-forest-dark shadow-sm'
              : 'text-forest-dark/60 hover:text-forest-dark'
          }`}
        >
          Inloggen
        </button>
        <button
          type="button"
          onClick={() => setMode('signup')}
          className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
            mode === 'signup'
              ? 'bg-white text-forest-dark shadow-sm'
              : 'text-forest-dark/60 hover:text-forest-dark'
          }`}
        >
          Account aanmaken
        </button>
      </div>

      <form action={onSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-forest-dark">Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            className="mt-1 block w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:border-sage-600 focus:outline-none focus:ring-1 focus:ring-sage-600"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-forest-dark">Wachtwoord</span>
          <input
            type="password"
            name="password"
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            required
            minLength={mode === 'signup' ? 8 : undefined}
            className="mt-1 block w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:border-sage-600 focus:outline-none focus:ring-1 focus:ring-sage-600"
          />
          {mode === 'signup' ? (
            <span className="mt-1 block text-xs text-forest-dark/60">
              Minstens 8 tekens.
            </span>
          ) : null}
        </label>

        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <Button type="submit" disabled={pending} className="w-full">
          {pending
            ? 'Bezig…'
            : mode === 'signin'
              ? 'Inloggen'
              : 'Account aanmaken'}
        </Button>

        {mode === 'signup' ? (
          <p className="text-center text-xs leading-relaxed text-forest-dark/60">
            De eerste persoon die een account aanmaakt wordt automatisch beheerder.
            Verdere accounts hebben geen toegang tot het beheerdashboard tenzij de
            beheerder ze toevoegt.
          </p>
        ) : null}
      </form>
    </div>
  );
}
