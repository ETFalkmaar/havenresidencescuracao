import Link from 'next/link';
import type { ComponentProps } from 'react';

type Variant = 'primary' | 'ghost';

const baseClasses =
  'inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-medium tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

const variantClasses: Record<Variant, string> = {
  primary: 'bg-sage-600 text-white hover:bg-sage-700',
  ghost: 'border border-sage-600 text-sage-700 hover:bg-sage-50',
};

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ComponentProps<'button'> & { variant?: Variant }) {
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = 'primary',
  className = '',
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return (
    <Link
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
