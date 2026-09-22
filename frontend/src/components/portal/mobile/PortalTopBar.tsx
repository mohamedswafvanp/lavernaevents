import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Mail, Settings, Users } from "lucide-react";
import logo from "@/assets/laverna-logo.png";
import { useAuthStore } from "@/stores/auth.store";
import { useLogoutMutation } from "@/queries/useAuthQueries";

export default function PortalTopBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuthStore();
  const logoutMutation = useLogoutMutation();
  const navigate = useNavigate();

  const initial = user?.full_name?.trim()?.[0]?.toUpperCase() ?? "?";

  const handleLogout = async () => {
    setMenuOpen(false);
    await logoutMutation.mutateAsync();
    navigate("/", { replace: true });
  };

  return (
    <header
      className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-100 bg-white/90 px-4 backdrop-blur-md"
      style={{ paddingTop: "var(--safe-area-inset-top)" }}
    >
      <Link to="/portal" onClick={() => setMenuOpen(false)}>
        <img src={logo} alt="LavernaEvents" className="h-7 w-auto object-contain" />
      </Link>

      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-navy)] text-sm font-semibold text-white"
          aria-label="Account menu"
        >
          {initial}
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-11 w-44 overflow-hidden rounded-2xl border border-slate-100 bg-white soft-shadow-lg"
            >
              {/*
                Guests and Templates have no room in the 4-tab bottom bar
                (Home, Events, Notifications, Account already fill it), so
                this dropdown - already the mobile home for secondary/
                account-adjacent destinations - is where they're reachable
                on mobile instead. The primary Guests flow (drilling into
                an event first) still works identically on mobile either way.
              */}
              <Link
                to="/portal/guests"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <Users className="h-4 w-4" />
                Guests
              </Link>
              <Link
                to="/portal/templates"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <Mail className="h-4 w-4" />
                Templates
              </Link>
              <Link
                to="/portal/settings"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="flex w-full items-center gap-2.5 px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                {logoutMutation.isPending ? "Signing out..." : "Sign out"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
