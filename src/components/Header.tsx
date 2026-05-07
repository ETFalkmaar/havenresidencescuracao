import Link from "next/link";

export function Header({ brandName }: { brandName: string }) {
  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6 flex items-center justify-between">
        <Link
          href="/"
          className="text-white font-light text-lg tracking-wide hover:opacity-80 transition"
        >
          {brandName}
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-white/90">
          <Link href="/#residences" className="hover:text-white transition">
            Residences
          </Link>
          <Link href="/#about" className="hover:text-white transition">
            About
          </Link>
          <Link href="/#contact" className="hover:text-white transition">
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
