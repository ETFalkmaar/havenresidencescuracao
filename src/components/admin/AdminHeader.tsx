import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { signOut } from '@/app/admin/login/actions';

export function AdminHeader({ email }: { email: string }) {
  return (
    <header className="border-b border-black/[0.06] bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/admin" className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-600 font-serif text-xs font-medium tracking-wider text-white">
            HR
          </span>
          <span className="font-serif text-lg font-medium tracking-wide text-forest-dark">
            Haven Residences · Beheer
          </span>
        </Link>

        <nav>
          <ul className="hidden gap-6 text-sm text-forest-dark/80 lg:flex">
            <li>
              <Link href="/admin" className="hover:text-sage-700">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/admin/properties" className="hover:text-sage-700">
                Accommodaties
              </Link>
            </li>
            <li>
              <Link href="/admin/bookings" className="hover:text-sage-700">
                Boekingen
              </Link>
            </li>
            <li>
              <Link href="/admin/inquiries" className="hover:text-sage-700">
                Berichten
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-4">
          <span className="hidden text-xs text-forest-dark/60 sm:inline">
            {email}
          </span>
          <form action={signOut}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs text-forest-dark/80 transition-colors hover:bg-cream-50 hover:text-forest-dark"
            >
              <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
              Uitloggen
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
