import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen grid place-items-center px-6 py-16 bg-neutral-950 text-white">
      <div className="max-w-lg w-full text-center space-y-6">
        <p className="text-xs uppercase tracking-[0.4em] text-white/40">
          404
        </p>
        <h1 className="text-5xl md:text-6xl font-extralight tracking-tight">
          Lost on the island.
        </h1>
        <p className="text-white/60 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist anymore — maybe
          it never did. Let&apos;s get you back to the residences.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="px-6 py-3 rounded-full bg-white text-neutral-900 text-sm font-medium hover:bg-white/90 transition"
          >
            Back to Haven Residence
          </Link>
        </div>
      </div>
    </main>
  );
}
