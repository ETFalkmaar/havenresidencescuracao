import type { PropsWithChildren } from 'react';

export function Pill({
  children,
  className = '',
}: PropsWithChildren<{ className?: string }>) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-sage-600 px-3 py-1 text-xs font-medium tracking-wide text-white ${className}`}
    >
      {children}
    </span>
  );
}
