"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
};

export function AdminSidebarNav({
  items,
  onNavigate,
}: {
  items: NavItem[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname() ?? "";
  return (
    <nav className="space-y-1">
      {items.map((it) => {
        const isActive =
          it.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            onClick={onNavigate}
            className={`group flex items-start gap-3 rounded-2xl px-3 py-2.5 transition ${
              isActive
                ? "bg-paper-warm text-ink"
                : "text-ink-mute hover:text-ink hover:bg-paper-tint"
            }`}
          >
            <span
              className={`shrink-0 mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl border transition ${
                isActive
                  ? "bg-ink text-white border-ink"
                  : "bg-white text-ink-mute border-black/5 group-hover:text-ink"
              }`}
            >
              {it.icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-medium leading-tight">{it.label}</div>
              {it.description && (
                <div className="text-[12px] text-ink-mute mt-0.5 leading-tight">
                  {it.description}
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
