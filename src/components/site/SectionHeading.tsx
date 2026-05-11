import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
  children?: ReactNode;
}) {
  const alignment = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <div className={`max-w-3xl ${alignment}`}>
      {eyebrow && (
        <p className="text-[12px] tracking-[0.3em] uppercase text-ink-mute mb-4">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-ink leading-[1.05]">
        {title}
      </h2>
      {description && (
        <p className="mt-5 text-ink-mute text-[15px] md:text-[17px] leading-relaxed max-w-2xl mx-auto">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
