'use client';

import { useTransition } from 'react';
import { updateInquiryStatus } from './actions';

const STATUS_LABELS: Record<string, string> = {
  new: 'Nieuw',
  in_progress: 'In behandeling',
  replied: 'Beantwoord',
  closed: 'Afgesloten',
};

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-sage-100 text-sage-800',
  in_progress: 'bg-cream-200 text-forest-dark',
  replied: 'bg-cream-100 text-forest-dark/70',
  closed: 'bg-cream-100 text-forest-dark/50',
};

export function InquiryStatusForm({
  id,
  currentStatus,
}: {
  id: string;
  currentStatus: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={currentStatus}
      disabled={pending}
      onChange={(e) => {
        const newStatus = e.target.value;
        startTransition(() => updateInquiryStatus(id, newStatus));
      }}
      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
        STATUS_COLORS[currentStatus] ?? STATUS_COLORS.new
      } focus:outline-none focus:ring-2 focus:ring-sage-600`}
    >
      {Object.entries(STATUS_LABELS).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
