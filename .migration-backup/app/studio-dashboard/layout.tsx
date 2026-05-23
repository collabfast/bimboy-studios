import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { studioDashboardNavigation } from "@/lib/placeholders";

export default function StudioDashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="page-shell grid gap-6 pt-8 lg:grid-cols-[280px_minmax(0,1fr)]">
      <DashboardSidebar
        title="Studio Dashboard"
        items={studioDashboardNavigation}
      />
      <div>{children}</div>
    </div>
  );
}
