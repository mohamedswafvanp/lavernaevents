import { NavLink } from "react-router-dom";
import { Bell, CalendarDays, Home, User } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

// "Account" points at /portal/settings, NOT a separate /portal/account -
// the desktop sidebar's "Settings" link and PortalTopBar's account-menu
// "Settings" link both point at the same route. Same feature, one route,
// three entry points with labels suited to each surface.
const TABS = [
  { to: "/portal", label: "Home", icon: Home, end: true },
  { to: "/portal/events", label: "Events", icon: CalendarDays, end: false },
  { to: "/portal/notifications", label: "Notifications", icon: Bell, end: false },
  { to: "/portal/settings", label: "Account", icon: User, end: false },
];

export default function BottomNav() {
  const isMobile = useMediaQuery("(max-width: 767px)");

  if (!isMobile) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-slate-100 bg-white/95 px-2 pt-2 backdrop-blur-md"
      style={{ paddingBottom: "calc(0.5rem + var(--safe-area-inset-bottom))" }}
    >
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            cn(
              "flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-1.5 text-xs font-medium transition-all duration-200",
              isActive
                ? "bg-[var(--brand-pink)]/10 text-[var(--brand-pink)]"
                : "text-slate-400 hover:text-slate-600"
            )
          }
        >
          <tab.icon className="h-5 w-5" />
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
