import { CircleUserRound, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"

import logo from "@/assets/laverna logo transparent.png"
import { getAccessToken, getCurrentUser, logoutUser } from "@/lib/auth"

const links = [
	{ label: "Home", href: "/" },
	{ label: "About", href: "/about" },
	{ label: "Pricing", href: "/pricing" },
	{ label: "Gallery", href: "/gallery" },
	{ label: "FAQ", href: "/faq" },
	{ label: "Contact", href: "/contact" },
]

function Navbar() {
	const navigate = useNavigate()
	const location = useLocation()
	const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getAccessToken()))
	const [userName, setUserName] = useState(getCurrentUser()?.full_name ?? "")

	useEffect(() => {
		const updateAuthState = () => {
			setIsAuthenticated(Boolean(getAccessToken()))
			setUserName(getCurrentUser()?.full_name ?? "")
		}
		updateAuthState()
		window.addEventListener("laverna-auth-change", updateAuthState)
		window.addEventListener("storage", updateAuthState)
		window.addEventListener("pageshow", updateAuthState)
		return () => {
			window.removeEventListener("laverna-auth-change", updateAuthState)
			window.removeEventListener("storage", updateAuthState)
			window.removeEventListener("pageshow", updateAuthState)
		}
	}, [location.pathname])

	const handleLogout = async () => {
		await logoutUser().catch(() => undefined)
		navigate("/", { replace: true })
	}

	return (
		<header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-md">
			<nav
				aria-label="Main navigation"
				className="mx-auto flex h-16 min-w-0 w-full max-w-7xl items-center justify-between gap-3 px-3 sm:px-6 lg:px-8"
			>
				{/* Brand Logo */}
				<Link
					to="/"
					className="flex shrink-0 items-center"
				>
					<img
						src={logo}
						alt="Laverna Events"
						className="h-auto w-[9rem] max-w-[42vw] shrink-0 object-contain sm:w-[11rem]"
					/>
				</Link>

				{/* Desktop Navigation Links */}
				<div className="hidden shrink-0 items-center gap-1 lg:flex">
					{links.map((link) => {
						const isActive = location.pathname === link.href
						return (
							<Link
								key={link.label}
								to={link.href}
								className={`rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all ${
									isActive
										? "bg-pink-50 text-[var(--brand-pink)]"
										: "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
								}`}
							>
								{link.label}
							</Link>
						)
					})}
				</div>

				{/* Desktop CTA / Auth */}
				<div className="hidden shrink-0 items-center gap-3 lg:flex">
					{isAuthenticated ? (
						<>
							<Link
								to="/portal"
								className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-[var(--brand-navy)] transition-colors hover:bg-slate-200"
							>
								<CircleUserRound size={17} className="text-[var(--brand-pink)]" />
								<span>{userName || "Portal"}</span>
							</Link>
							<button
								type="button"
								onClick={() => void handleLogout()}
								className="rounded-full bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-100"
							>
								Logout
							</button>
						</>
					) : (
						<>
							<Link
								to="/login"
								className="rounded-full px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:text-[var(--brand-pink)]"
							>
								Log In
							</Link>
							<Link
								to="/register"
								className="flex items-center gap-1.5 rounded-full bg-[var(--brand-pink)] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[var(--brand-pink-dark)] hover:shadow"
							>
								<Sparkles size={14} />
								<span>Get Started</span>
							</Link>
						</>
					)}
				</div>

				{/* Mobile Right: Direct CTA without 3-lines menu */}
				<div className="flex shrink-0 items-center gap-2 lg:hidden">
					{isAuthenticated ? (
						<Link
							to="/portal"
							className="flex items-center gap-1.5 rounded-full bg-pink-50 px-3.5 py-1.5 text-xs font-bold text-[var(--brand-pink)]"
						>
							<CircleUserRound size={15} />
							<span>Portal</span>
						</Link>
					) : (
						<Link
							to="/register"
							className="shrink-0 rounded-full bg-[var(--brand-pink)] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs"
						>
							Register
						</Link>
					)}
				</div>
			</nav>
		</header>
	)
}

export default Navbar
