import Link from "next/link";
import { getTranslations } from "@/lib/i18n/server";

export default async function NotFound() {
  const { t } = await getTranslations();
  return (
    <main className="min-h-screen grid place-items-center px-6 py-16 bg-neutral-950 text-white">
      <div className="max-w-lg w-full text-center space-y-6">
        <p className="text-xs uppercase tracking-[0.4em] text-white/40">
          {t.notFound.eyebrow}
        </p>
        <h1 className="text-5xl md:text-6xl font-extralight tracking-tight">
          {t.notFound.title}
        </h1>
        <p className="text-white/60 leading-relaxed">{t.notFound.message}</p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="px-6 py-3 rounded-full bg-white text-neutral-900 text-sm font-medium hover:bg-white/90 transition"
          >
            {t.notFound.cta}
          </Link>
        </div>
      </div>
    </main>
  );
}
