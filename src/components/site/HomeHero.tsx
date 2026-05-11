import Link from "next/link";

/**
 * Clean text-only hero: big display heading, supporting copy, two pill CTAs.
 * The visual "wow" lives in the slideshow underneath (`PropertyShowcase`).
 */
export function HomeHero({
  eyebrow,
  title,
  subtitle,
  primaryCta,
  primaryHref,
  secondaryCta,
  secondaryHref,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryCta: string;
  primaryHref: string;
  secondaryCta: string;
  secondaryHref: string;
}) {
  return (
    <section className="relative max-w-6xl mx-auto px-6 pt-12 md:pt-20 lg:pt-28 pb-8 md:pb-12">
      <p className="text-[12px] tracking-[0.3em] uppercase text-ink-mute mb-6">
        {eyebrow}
      </p>

      <h1
        className="font-display font-bold text-ink text-5xl md:text-7xl lg:text-[7rem] leading-[0.95] tracking-tight max-w-4xl"
        data-edit-id="home.hero.title"
        data-edit-prop="text"
      >
        {title}
      </h1>

      <p
        className="mt-8 text-ink-mute text-[16px] md:text-[18px] max-w-md leading-relaxed"
        data-edit-id="home.hero.subtitle"
        data-edit-prop="text"
      >
        {subtitle}
      </p>

      <div className="mt-9 flex flex-wrap gap-3">
        <Link
          href={primaryHref}
          className="group inline-flex items-center gap-2.5 pl-2 pr-6 py-2 rounded-full bg-ink text-white text-[15px] font-medium hover:bg-ink-soft transition shadow-pill"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 12h12M13 6l6 6-6 6" />
            </svg>
          </span>
          {primaryCta}
        </Link>

        <Link
          href={secondaryHref}
          className="inline-flex items-center px-6 py-3 rounded-full bg-paper-warm hover:bg-paper-tint text-ink text-[15px] font-medium transition border border-black/5"
        >
          {secondaryCta}
        </Link>
      </div>
    </section>
  );
}
