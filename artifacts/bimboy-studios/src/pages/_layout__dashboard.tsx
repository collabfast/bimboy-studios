import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { VerificationBanner } from "@/components/verification-banner";
import { useDashboardCreators } from "@/hooks/use-dashboard-creators";
import { dashboardNavigation } from "@/lib/placeholders";

export default function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const { creators, isClaimMode } = useDashboardCreators();
  // Only show the verification banner for a creator the user actually owns —
  // never for someone else's profile shown in claim mode.
  const ownedCreator = !isClaimMode ? creators[0] : undefined;

  return (
    <div className="page-shell grid gap-6 pt-8 lg:grid-cols-[280px_minmax(0,1fr)]">
      <DashboardSidebar title="Creator Dashboard" items={dashboardNavigation} />
      <div className="grid gap-6">
        {ownedCreator ? (
          <VerificationBanner
            handle={ownedCreator.handle}
            initialStatus={ownedCreator.idVerificationStatus}
          />
        ) : null}
        {children}
      </div>
    </div>
  );
}
