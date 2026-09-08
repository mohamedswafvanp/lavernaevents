import {
	CalendarDays,
	CircleUserRound,
	LayoutDashboard,
	LogOut,
	Tag,
	User,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"

import { getCurrentUser, logoutUser } from "@/lib/auth"

export default function PortalLayout() {
	const navigate = useNavigate()
	const location = useLocation()
	const [user, setUser] = useState(getCurrentUser())

	useEffect(() => {
		setUser(getCurrentUser())
	}, [])

	const handleLogout = async () => {
		await logoutUser()
		navigate("/login")
	}

	const navLinks = [
		{ to: "/portal", label: "Dashboard", icon: LayoutDashboard, end: true },
		{ to: "/portal/events", label: "My Events", icon: CalendarDays, end: false },
		{ to: "/pricing", label: "Membership", icon: Tag, end: false },
		{ to: "/account", label: "Account", icon: User, end: false },
	]

	return (
		<div className="flex min-h-screen flex-col bg-slate-50">
			{/* Dedicated Portal Top Header */}
			<header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur-md sm:px-6">
				<div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
					<div className="flex min-w-0 items-center gap-3">
						<Link
							to="/"
							className="text-sm font-bold tracking-[0.14em] text-[var(--brand-navy)] whitespace-nowrap sm:text-base sm:tracking-[0.16em]"
						>
							LAVERNA <span className="text-[var(--brand-pink)]">EVENTS</span>
						</Link>
						<span className="hidden rounded-full bg-pink-50 px-3 py-0.5 text-[10px] font-bold text-[var(--brand-pink)] uppercase tracking-wider sm:inline-block">
							Organizer Portal
						</span>
					</div>

					<div className="flex shrink-0 items-center gap-2 sm:gap-3">
						<div className="flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-800 sm:px-3">
							<CircleUserRound size={16} className="shrink-0 text-[var(--brand-pink)]" />
							<span className="max-w-[80px] truncate sm:max-w-[140px]">
								{user?.full_name || "Organizer"}
							</span>
						</div>

						<button
							type="button"
							onClick={() => void handleLogout()}
							className="flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-100 sm:px-3"
						>
							<LogOut size={14} />
							<span className="hidden sm:inline">Logout</span>
						</button>
					</div>
				</div>
			</header>

			{/* Portal Body with Sub-navigation */}
			<div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-3 py-4 sm:px-6 sm:py-6">
				{/* Navigation Tabs Bar */}
				<div className="no-scrollbar mb-6 flex gap-1.5 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white p-1.5 soft-shadow">
					{navLinks.map((item) => {
						const Icon = item.icon
						return (
							<NavLink
								key={item.to}
								to={item.to}
								end={item.end}
								className={({ isActive }) =>
									`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all shrink-0 ${
										isActive
											? "bg-[var(--brand-pink)] text-white shadow-xs"
											: "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
									}`
								}
							>
								<Icon size={16} />
								<span>{item.label}</span>
							</NavLink>
						)
					})}
				</div>

				{/* Portal View Content */}
				<main className="flex-1 pb-24 md:pb-0">
					<Outlet />
				</main>
			</div>

			{/* Mobile Bottom Navigation for Portal */}
			<nav
				aria-label="Portal mobile navigation"
				className="fixed bottom-0 left-0 right-0 z-50 block border-t border-slate-200/90 bg-white/95 px-2 py-2 backdrop-blur-lg shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:hidden"
			>
				<div className="mx-auto flex max-w-md items-center justify-around">
					{navLinks.map((item) => {
						const Icon = item.icon
						const isActive =
							item.end
								? location.pathname === item.to
								: location.pathname.startsWith(item.to)
						return (
							<Link
								key={item.to}
								to={item.to}
								className={`relative flex flex-col items-center justify-center px-3 py-1 transition-all duration-200 ${
									isActive
										? "text-[var(--brand-pink)] font-bold"
										: "text-slate-500 hover:text-slate-800"
								}`}
							>
								<div className="relative">
									<Icon
										size={21}
										strokeWidth={isActive ? 2.4 : 1.8}
										className={isActive ? "scale-110 transition-transform" : ""}
									/>
									{isActive && (
										<span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[var(--brand-pink)]" />
									)}
								</div>
								<span className="mt-1 text-[10px] leading-none tracking-tight">
									{item.label}
								</span>
							</Link>
						)
					})}
				</div>
			</nav>
		</div>
	)
}
