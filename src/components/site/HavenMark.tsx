/**
 * Haven Residences beeldmerk — een olijfboom in een open ring.
 * Gebruikt `currentColor`, dus de kleur volgt de tekstkleur van de
 * ouder (groen op cream in de header, cream op groen in de footer).
 */
export function HavenMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="50 40 400 400"
      className={className}
      fill="none"
      aria-hidden="true"
      role="presentation"
    >
      {/* Open ring */}
      <circle
        cx="250"
        cy="240"
        r="190"
        stroke="currentColor"
        strokeWidth="6"
        fill="none"
        strokeDasharray="0 60 1080"
        strokeDashoffset="540"
        strokeLinecap="round"
      />

      {/* Trunk */}
      <path
        d="M250 410 C 246 350, 250 300, 252 230"
        stroke="currentColor"
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M250 410 C 260 370, 252 320, 248 280"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />

      {/* Branches */}
      <path d="M252 250 Q 220 200 170 170" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M252 230 Q 290 180 350 160" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M252 270 Q 200 240 150 220" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M252 270 Q 310 240 370 230" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M252 290 Q 220 290 180 290" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M252 290 Q 290 290 320 290" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />

      {/* Olive leaves */}
      <g fill="currentColor">
        <ellipse cx="160" cy="170" rx="14" ry="6" transform="rotate(-30 160 170)" />
        <ellipse cx="180" cy="155" rx="14" ry="6" transform="rotate(-20 180 155)" />
        <ellipse cx="140" cy="195" rx="14" ry="6" transform="rotate(-45 140 195)" />
        <ellipse cx="195" cy="190" rx="14" ry="6" transform="rotate(-10 195 190)" />
        <ellipse cx="360" cy="155" rx="14" ry="6" transform="rotate(30 360 155)" />
        <ellipse cx="340" cy="180" rx="14" ry="6" transform="rotate(20 340 180)" />
        <ellipse cx="380" cy="195" rx="14" ry="6" transform="rotate(40 380 195)" />
        <ellipse cx="320" cy="170" rx="14" ry="6" transform="rotate(10 320 170)" />
        <ellipse cx="140" cy="220" rx="14" ry="6" transform="rotate(-15 140 220)" />
        <ellipse cx="170" cy="245" rx="14" ry="6" transform="rotate(-15 170 245)" />
        <ellipse cx="200" cy="220" rx="14" ry="6" transform="rotate(-15 200 220)" />
        <ellipse cx="125" cy="245" rx="14" ry="6" transform="rotate(-40 125 245)" />
        <ellipse cx="360" cy="220" rx="14" ry="6" transform="rotate(15 360 220)" />
        <ellipse cx="335" cy="245" rx="14" ry="6" transform="rotate(15 335 245)" />
        <ellipse cx="305" cy="220" rx="14" ry="6" transform="rotate(15 305 220)" />
        <ellipse cx="385" cy="240" rx="14" ry="6" transform="rotate(40 385 240)" />
        <ellipse cx="200" cy="285" rx="14" ry="6" transform="rotate(-10 200 285)" />
        <ellipse cx="170" cy="295" rx="14" ry="6" transform="rotate(-15 170 295)" />
        <ellipse cx="305" cy="285" rx="14" ry="6" transform="rotate(10 305 285)" />
        <ellipse cx="335" cy="295" rx="14" ry="6" transform="rotate(15 335 295)" />
        <ellipse cx="230" cy="310" rx="14" ry="6" transform="rotate(-10 230 310)" />
        <ellipse cx="280" cy="310" rx="14" ry="6" transform="rotate(10 280 310)" />
      </g>

      {/* Olives */}
      <g fill="currentColor">
        <ellipse cx="200" cy="245" rx="9" ry="14" />
        <ellipse cx="305" cy="245" rx="9" ry="14" />
        <ellipse cx="252" cy="335" rx="9" ry="14" />
      </g>
    </svg>
  );
}
