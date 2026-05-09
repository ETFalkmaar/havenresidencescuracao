export function TrustedBy({ caption }: { caption: string }) {
  // Generic decorative wordmarks — kept on-brand as a reassurance row.
  // Logos render as inline SVG so we never rely on external CDNs.
  const marks = [
    { name: "Tripadvisor", node: <span className="font-display tracking-tight">tripadvisor</span> },
    { name: "Booking", node: <span className="font-display tracking-tight">booking.com</span> },
    { name: "Airbnb", node: <span className="font-display tracking-tight">airbnb</span> },
    { name: "Google", node: <span className="font-display tracking-tight">Google · 4.9</span> },
    { name: "Vrbo", node: <span className="font-display tracking-tight">vrbo</span> },
    { name: "Expedia", node: <span className="font-display tracking-tight">expedia</span> },
  ];

  return (
    <section className="py-14 md:py-20 max-w-6xl mx-auto px-6">
      <p className="text-center text-[13px] text-ink-mute mb-8">{caption}</p>
      <div className="overflow-hidden no-scrollbar [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex gap-12 md:gap-16 animate-marquee w-max">
          {[...marks, ...marks].map((m, i) => (
            <div
              key={`${m.name}-${i}`}
              className="text-ink-mute/70 text-lg md:text-xl whitespace-nowrap select-none"
              aria-hidden={i >= marks.length}
            >
              {m.node}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
