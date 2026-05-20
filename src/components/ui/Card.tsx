import type { PropsWithChildren } from 'react';

export function Card({
  children,
  className = '',
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={`rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04] ${className}`}
    >
      {children}
    </div>
  );
}
