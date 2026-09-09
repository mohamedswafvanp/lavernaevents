import { CalendarDays, CircleUserRound, Home, Image, Tag } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { getAccessToken } from "@/lib/auth"

export default function MobileBottomNav() {
	const location = useLocation()
	const navigate = useNavigate()
	const pathname = location.pathname
	const isAuthenticated = Boolean(getAccessToken())

	// Hide on portal and standalone respond routes
	if (pathname.startsWith("/portal") || pathname.startsWith("/respond")) {
		return null
	}

	const navItems = [
		{
			id: "home",
			label: "Home",
			icon: Home,
			path: "/",
			isActive: pathname === "/",
		},
		{
			id: "events",
			label: "Events",
			icon: CalendarDays,
			path: isAuthenticated ? "/portal" : "/demo-portal",
			isActive: pathname === "/portal" || pathname === "/demo-portal" || pathname === "/demo-onboarding",
		},
		{
			id: "gallery",
			label: "Gallery",
			icon: Image,
			path: "/gallery",
			isActive: pathname === "/gallery",
		},
		{
			id: "pricing",
			label: "Pricing",
			icon: Tag,
			path: "/pricing",
			isActive: pathname === "/pricing",
		},
		{
			id: "account",
			label: isAuthenticated ? "Account" : "Login",
			icon: CircleUserRound,
			path: isAuthenticated ? "/account" : "/login",
			isActive: pathname === "/account" || pathname === "/login" || pathname === "/register",
		},
	]

	return (
		<nav
			aria-label="Mobile Bottom Navigation"
			className="mobile-safe-bottom fixed bottom-0 left-0 right-0 z-50 block border-t border-slate-200/90 bg-white/95 px-2 py-2 backdrop-blur-lg shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:hidden"
		>
			<div className="mx-auto flex min-w-0 max-w-md items-center justify-around">
				{navItems.map((item) => {
					const Icon = item.icon
					return (
						<button
							key={item.id}
							type="button"
							onClick={() => navigate(item.path)}
							className={`relative min-w-0 flex-1 flex flex-col items-center justify-center py-1 px-1 transition-all duration-200 active:scale-95 ${
								item.isActive
									? "text-[var(--brand-pink)] font-bold"
									: "text-slate-500 hover:text-slate-800"
							}`}
						>
							<div className="relative">
								<Icon
									size={22}
									strokeWidth={item.isActive ? 2.4 : 1.8}
									className={item.isActive ? "scale-110 transition-transform" : ""}
								/>
								{item.isActive && (
									<span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[var(--brand-pink)]" />
								)}
							</div>
							<span className="mt-1 max-w-full truncate text-[10px] leading-none tracking-tight">
								{item.label}
							</span>
						</button>
					)
				})}
			</div>
		</nav>
	)
}
