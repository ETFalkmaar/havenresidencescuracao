/**
 * Instagram-beeldmerk met de officiële merkkleuren: een afgeronde tegel
 * met de Instagram-gradient en het witte camera-glyph. Maakt direct
 * herkenbaar dat de link naar Instagram leidt.
 */
export function InstagramLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="ig-gradient" cx="0.3" cy="1.07" r="1.1">
          <stop offset="0" stopColor="#fdf497" />
          <stop offset="0.05" stopColor="#fdf497" />
          <stop offset="0.45" stopColor="#fd5949" />
          <stop offset="0.6" stopColor="#d6249f" />
          <stop offset="0.9" stopColor="#285aeb" />
        </radialGradient>
      </defs>
      {/* Gradient tile */}
      <rect width="24" height="24" rx="6.5" fill="url(#ig-gradient)" />
      {/* Camera body */}
      <rect
        x="5"
        y="5"
        width="14"
        height="14"
        rx="4.5"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
      />
      {/* Lens */}
      <circle cx="12" cy="12" r="3.6" fill="none" stroke="#fff" strokeWidth="2" />
      {/* Flash dot */}
      <circle cx="16.8" cy="7.2" r="1.3" fill="#fff" />
    </svg>
  );
}
