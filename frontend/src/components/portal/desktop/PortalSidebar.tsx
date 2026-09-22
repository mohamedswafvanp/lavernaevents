import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  Settings,
  Users,
} from "lucide-react";
import logo from "@/assets/laverna-logo.png";
import { useAuthStore } from "@/stores/auth.store";
import { useLogoutMutation } from "@/queries/useAuthQueries";
import { cn } from "@/lib/utils";

// "Guests" (-> /portal/guests) is a launcher page, not a duplicate guest
// list: guests are always scoped to a specific event on the backend (no
// cross-event endpoint exists), so this link goes to GuestsHub, which asks
// "which event?" and hands off to that event's real guest page. The
// primary flow - drilling into an event first (EventDetail -> "Manage
// guests") - still works exactly as before; this is a shortcut alongside it.
//
// "Invitations" became "Templates" (-> /portal/templates): the template
// gallery is the one invitations-related view that ISN'T event-scoped.
// Event-specific invitation history lives at /portal/events/:id/invitations,
// reached the same way Guests is - from that event's own page.
const NAV_ITEMS = [
  { to: "/portal", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/portal/events", label: "Events", icon: CalendarDays, end: false },
  { to: "/portal/guests", label: "Guests", icon: Users, end: false },
  { to: "/portal/templates", label: "Templates", icon: Mail, end: false },
  { to: "/portal/gallery", label: "Gallery", icon: ImageIcon, end: false },
];

// Active state gets its own look (soft pink pill + a left accent bar via
// the ::before pseudo-element), not just a darker version of hover - so
// "currently here" and "hovering" never look the same.
const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
    isActive
      ? "bg-[var(--brand-pink)]/8 text-[var(--brand-pink)] before:absolute before:left-0 before:top-1/2 before:h-5 before:w-1 before:-translate-y-1/2 before:rounded-full before:bg-[var(--brand-pink)]"
      : "text-slate-600 hover:bg-slate-100 hover:text-[var(--brand-navy)]"
  );

export default function PortalSidebar() {
  const { user } = useAuthStore();
  const logoutMutation = useLogoutMutation();
  const navigate = useNavigate();

  const initial = user?.full_name?.trim()?.[0]?.toUpperCase() ?? "?";

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate("/", { replace: true });
  };

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-slate-100 bg-white">
      <div className="flex h-16 items-center border-b border-slate-100 px-6">
        <Link to="/portal">
          <img src={logo} alt="LavernaEvents" className="h-8 w-auto object-contain" />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={navLinkClass}>
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <NavLink to="/portal/settings" className={navLinkClass}>
          <Settings className="h-4 w-4" />
          Settings
        </NavLink>

        <div className="mt-3 flex items-center gap-3 rounded-xl px-3 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand-navy)] text-sm font-semibold text-white">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--brand-navy)]">
              {user?.full_name ?? "Account"}
            </p>
            <p className="truncate text-xs text-slate-400">{user?.mobile_number}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition-all duration-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          {logoutMutation.isPending ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </aside>
  );
}
