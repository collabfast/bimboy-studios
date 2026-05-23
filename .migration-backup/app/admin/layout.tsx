import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { adminNavigation } from "@/lib/placeholders";

export default function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="page-shell grid gap-6 pt-8 lg:grid-cols-[280px_minmax(0,1fr)]">
      <DashboardSidebar title="Admin Panel" items={adminNavigation} />
      <div>{children}</div>
    </div>
  );
}
