import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { queryClient } from "./api/queryClient";
import { setSessionExpiredHandler } from "./api/client";
import { useCurrentUser, authKeys } from "./queries/useAuthQueries";
import { authStore, useAuthStore } from "./stores/auth.store";
import { isNativeApp } from "./lib/platform";
import { Skeleton } from "./components/ui/skeleton";

import PublicLayout from "./layouts/PublicLayout";
import PortalLayout from "./layouts/PortalLayout";
import ProtectedRoute from "./router/ProtectedRoute";
import PublicOnlyRoute from "./router/PublicOnlyRoute";

import Home from "./pages/public/Home";
import About from "./pages/public/About";
import Features from "./pages/public/Features";
import Pricing from "./pages/public/Pricing";
import Gallery from "./pages/public/Gallery";
import FAQ from "./pages/public/FAQ";
import Contact from "./pages/public/Contact";

import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import VerifyMobile from "./pages/auth/VerifyMobile";

import Portal from "./pages/portal/Portal";
import GuestsHub from "./pages/portal/GuestsHub";
import EventsList from "./pages/portal/events/EventsList";
import EventCreate from "./pages/portal/events/EventCreate";
import EventDetail from "./pages/portal/events/EventDetail";
import EventEdit from "./pages/portal/events/EventEdit";
import EventGuests from "./pages/portal/events/EventGuests";
import EventInvitations from "./pages/portal/events/EventInvitations";
import InvitationTemplates from "./pages/portal/InvitationTemplates";
import ComingSoon from "./pages/portal/ComingSoon";
import PaymentSuccess from "./pages/payment/PaymentSuccess";
import PaymentCancelled from "./pages/payment/PaymentCancelled";

function SessionBootstrap() {
  useCurrentUser();

  const rqClient = useQueryClient();

  useEffect(() => {
    setSessionExpiredHandler(() => {
      // setQueryData(), not removeQueries(): removeQueries() deletes the
      // cache entry, and since this component's useCurrentUser() call stays
      // mounted for the app's whole lifetime, an active observer losing its
      // cache entry triggers an immediate refetch - which 401s again on a
      // logged-out session and re-enters this same handler, looping forever.
      // Overwriting the value in place updates the cache without starting a
      // new request.
      rqClient.setQueryData(authKeys.currentUser, null);
      authStore.setUser(null);
      authStore.setChecking(false);

      // No imperative navigate() here on purpose. ProtectedRoute already
      // reads this same auth store and declaratively redirects to /login
      // once `user` goes null, so anyone on a protected page gets bounced
      // automatically. A forced navigate() here would also incorrectly yank
      // anonymous visitors on public pages (e.g. a first-time visit to "/")
      // over to /login the moment the initial /me/ check fails, which is
      // exactly the behavior public pages must never have.
    });
  }, [rqClient]);

  return null;
}

function AppSkeleton() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-9 w-32" />
        <div className="hidden items-center gap-2 md:flex">
          <Skeleton className="h-9 w-20 rounded-full" />
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-3">
          <Skeleton className="mx-auto h-10 w-10 rounded-full" />
          <Skeleton className="mx-auto h-4 w-40" />
          <Skeleton className="mx-auto h-4 w-28" />
        </div>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { isChecking, user } = useAuthStore();

  if (isChecking) {
    return <AppSkeleton />;
  }

  // Capacitor.isNativePlatform() never changes for the life of a running
  // app (the same bundle never flips between running in a browser and
  // running inside the native shell), so this is safe to read once per
  // render rather than needing to live in state.
  const nativeApp = isNativeApp();
  const fallbackPath = user ? "/portal" : "/login";

  return (
    <Routes>
      {/*
        Public marketing site - WEB ONLY. The native app is portal-only and
        these routes simply don't exist inside it (not hidden, not gated -
        genuinely absent from the route tree), per the product decision that
        there is no in-app marketing site, just Login/Register -> Portal.
      */}
      {!nativeApp && (
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="features" element={<Features />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="contact" element={<Contact />} />
        </Route>
      )}

      {/*
        Inside the native app there is no public home page - "/" itself
        goes straight into the portal funnel (PortalLayout's own gate then
        decides between /login, /verify-mobile, /pricing, or the portal).
      */}
      {nativeApp && <Route index element={<Navigate to={fallbackPath} replace />} />}

      {/*
        Auth + payment routes are SHARED between web and native, and are
        deliberately NOT nested under PublicLayout (they used to be, before
        this change - that meant the marketing Navbar/Footer were
        technically wrapping the login/register screens on web too, which
        was never the intent given each auth page is already a
        self-contained full-screen design with its own logo/background).
        On native there is no PublicLayout to nest them under at all, so
        this also happens to be the only structure that actually works on
        both surfaces.
      */}
      <Route
        path="register"
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route path="verify-mobile" element={<VerifyMobile />} />

      {/*
        Reachable post-checkout redirects from Stripe, shared between web
        and native (a user might subscribe from either surface). Not
        wrapped in PublicOnlyRoute (a logged-in user must be able to land
        here) and not gated behind ProtectedRoute either - both endpoints
        they call already require auth on the backend, so there's nothing
        extra to enforce client-side.
      */}
      <Route path="payment/success" element={<PaymentSuccess />} />
      <Route path="payment/cancelled" element={<PaymentCancelled />} />

      {/*
        The authenticated portal - shared between web and native, and
        unconditionally a sibling of the public route group above (never
        nested inside PublicLayout), which is what actually keeps the
        marketing Navbar/Footer out of the portal on web. PortalLayout is
        its own shell (sidebar on desktop, bottom tab bar on mobile) and
        also owns the portal-access gate, so every page nested here is
        already guaranteed verified + subscribed before it ever mounts.
      */}
      <Route
        path="portal"
        element={
          <ProtectedRoute>
            <PortalLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Portal />} />
        <Route path="guests" element={<GuestsHub />} />
        <Route path="events" element={<EventsList />} />
        <Route path="events/new" element={<EventCreate />} />
        <Route path="events/:id" element={<EventDetail />} />
        <Route path="events/:id/edit" element={<EventEdit />} />
        <Route path="events/:id/guests" element={<EventGuests />} />
        <Route path="events/:id/invitations" element={<EventInvitations />} />
        <Route path="templates" element={<InvitationTemplates />} />

        {/*
          Placeholders for nav links (sidebar + bottom nav + account menu)
          whose real feature isn't built yet - every linked path must
          resolve to something, never 404 or a blank screen, even before
          its actual phase lands.
        */}
        <Route
          path="gallery"
          element={
            <ComingSoon
              title="Gallery"
              description="Photo galleries for your events are coming in an upcoming update."
            />
          }
        />
        <Route
          path="settings"
          element={
            <ComingSoon
              title="Settings"
              description="Account and event settings are coming in an upcoming update."
            />
          }
        />
        <Route
          path="notifications"
          element={
            <ComingSoon
              title="Notifications"
              description="Your notifications will show up here once the notifications system is live."
            />
          }
        />
      </Route>

      {/*
        Native-app-only catch-all: any URL that isn't one of the shared
        routes above (most notably, an attempt to reach a public-marketing
        path that simply doesn't exist in-app) redirects into the portal
        funnel instead of rendering a blank screen. Web has no catch-all,
        matching its existing behavior.
      */}
      {nativeApp && <Route path="*" element={<Navigate to={fallbackPath} replace />} />}
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SessionBootstrap />
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
