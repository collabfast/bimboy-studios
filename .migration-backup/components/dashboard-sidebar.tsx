"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { DashboardNavItem } from "@/lib/types";

type DashboardSidebarProps = {
  title: string;
  items: DashboardNavItem[];
};

export function DashboardSidebar({ title, items }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="surface-card rounded-[28px] p-5 lg:sticky lg:top-24 lg:h-fit">
      <p className="text-xs uppercase tracking-[0.26em] text-pink-300">{title}</p>
      <nav className="mt-5 grid gap-2">
        {items.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-2xl border px-4 py-3 transition ${
                isActive
                  ? "border-white/14 bg-white/10 text-white"
                  : "border-transparent bg-white/[0.03] text-white/65 hover:border-white/8 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <p className="font-semibold">{item.label}</p>
              <p className="mt-1 text-xs leading-5 text-current/75">
                {item.description}
              </p>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
