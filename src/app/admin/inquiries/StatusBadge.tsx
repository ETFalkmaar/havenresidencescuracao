type Status = "new" | "replied" | "closed";

const styles: Record<Status, string> = {
  new: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  replied:
    "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  closed:
    "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
};

const labels: Record<Status, string> = {
  new: "New",
  replied: "Replied",
  closed: "Closed",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-block text-[10px] uppercase tracking-widest px-2 py-1 rounded ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
