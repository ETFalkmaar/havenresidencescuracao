import type { LucideIcon } from 'lucide-react';

export function IconStat({
  icon: Icon,
  label,
  className = '',
}: {
  icon: LucideIcon;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-sm text-forest-dark/70 ${className}`}
    >
      <Icon className="h-4 w-4" strokeWidth={1.5} />
      {label}
    </span>
  );
}
