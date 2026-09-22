import { Navigate, Outlet } from "react-router-dom";
import { usePortalAccess } from "@/queries/useMembershipQueries";
import { useAuthStore } from "@/stores/auth.store";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import PortalSidebar from "@/components/portal/desktop/PortalSidebar";
import PortalTopBar from "@/components/portal/mobile/PortalTopBar";
import BottomNav from "@/components/portal/BottomNav";
import { Toaster } from "@/components/ui/toaster";

function PortalLayoutSkeleton() {
  return (
    <div className="gradient-mesh-subtle flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <Card className="p-8 sm:p-10">
          <Skeleton className="mx-auto h-4 w-32" />
          <Skeleton className="mx-auto mt-4 h-7 w-56" />
          <Skeleton className="mx-auto mt-3 h-4 w-72" />
          <div className="mt-8 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </Card>
      </div>
    </div>
  );
}

// The authenticated app shell - a completely different navigation paradigm
// (sidebar on desktop, bottom tab bar on mobile) from PublicLayout's
// marketing Navbar/Footer, and the two must never render together. This
// component is only ever reached via App.tsx's /portal route, which is a
// sibling of PublicLayout's route group, not nested inside it.
//
// Also owns the portal-access gate (formerly a separate PortalGate page):
// nothing under here - including every future Events/Guests/Dashboard page -
// renders until GET /portal-access/ confirms the user is both verified and
// subscribed. That check happens once here, at the layout level, so no
// individual portal page ever has to repeat it.
export default function PortalLayout() {
  const { user } = useAuthStore();
  const isDesktop = useIsDesktop();
  const { data: access, isLoading, isError } = usePortalAccess();

  if (isLoading) {
    return <PortalLayoutSkeleton />;
  }

  if (isError || !access) {
    return (
      <div className="gradient-mesh-subtle flex min-h-screen items-center justify-center px-4 py-16">
        <Card className="max-w-md p-8 text-center">
          <p className="text-sm text-slate-500">
            We couldn't check your portal access right now. Please refresh the page.
          </p>
        </Card>
      </div>
    );
  }

  if (access.next_step === "verify_mobile") {
    const mobileParam = user?.mobile_number ? `?mobile=${user.mobile_number}` : "";
    return <Navigate to={`/verify-mobile${mobileParam}`} replace />;
  }

  if (access.next_step === "select_plan") {
    return <Navigate to="/pricing" replace />;
  }

  if (isDesktop) {
    return (
      <div className="flex min-h-screen bg-slate-50/70">
        <PortalSidebar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/70">
      <PortalTopBar />
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <BottomNav />
      <Toaster />
    </div>
  );
}
