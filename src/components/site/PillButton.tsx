import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

const variants: Record<Variant, string> = {
  primary:
    "bg-ink text-white hover:bg-ink-soft shadow-pill",
  secondary:
    "bg-paper-warm text-ink hover:bg-paper-tint border border-black/5",
  ghost:
    "bg-transparent text-ink hover:bg-paper-warm",
};

export function PillButton({
  href,
  variant = "primary",
  children,
  className = "",
  prefix,
}: {
  href: string;
  variant?: Variant;
  children: ReactNode;
  className?: string;
  prefix?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2.5 pl-2 pr-5 py-2 rounded-full text-[14px] font-medium transition ${variants[variant]} ${className}`}
    >
      {prefix !== null && (
        <span
          className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${
            variant === "primary"
              ? "bg-white/10 text-white"
              : "bg-white text-ink shadow-sm"
          }`}
        >
          {prefix ?? (
            <svg
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 12h12M13 6l6 6-6 6" />
            </svg>
          )}
        </span>
      )}
      <span className="pr-1">{children}</span>
    </Link>
  );
}
