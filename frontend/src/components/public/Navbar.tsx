import { Menu, X } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { getAccessToken, logoutUser } from "@/lib/auth"

const links = [
	{ label: "Home", href: "/" },
	{ label: "About", href: "/about" },
	{ label: "Features", href: "#features" },
	{ label: "Pricing", href: "/pricing" },
	{ label: "Gallery", href: "/gallery" },
	{ label: "FAQ", href: "/faq" },
	{ label: "Contact", href: "/contact" },
]

function Navbar() {
	const navigate = useNavigate()
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getAccessToken()))

	useEffect(() => {
		const updateAuthState = () => setIsAuthenticated(Boolean(getAccessToken()))
		window.addEventListener("laverna-auth-change", updateAuthState)
		window.addEventListener("storage", updateAuthState)
		return () => {
			window.removeEventListener("laverna-auth-change", updateAuthState)
			window.removeEventListener("storage", updateAuthState)
		}
	}, [])

	const handleLogout = async () => {
		await logoutUser().catch(() => undefined)
		navigate("/login")
	}

	return (
		<header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
			<nav
				aria-label="Main navigation"
				className="mx-auto flex min-h-20 max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10"
			>
				<a
					href="/"
					className="text-lg font-bold tracking-[0.16em] text-[var(--brand-navy)] sm:text-xl"
				>
					LAVERNA <span className="text-[var(--brand-pink)]">EVENTS</span>
				</a>

				<div className="hidden items-center gap-6 lg:flex">
					{links.map((link) => (
						<a
							key={link.label}
							href={link.href}
							className="text-sm font-medium text-slate-600 transition-colors hover:text-[var(--brand-pink)]"
						>
							{link.label}
						</a>
					))}
					{isAuthenticated ? <><button type="button" onClick={() => void handleLogout()} className="text-sm font-semibold text-[var(--brand-navy)] transition-colors hover:text-[var(--brand-pink)]">Logout</button><a href="/demo-onboarding" className="rounded-md bg-[var(--brand-pink)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--brand-pink-dark)]">Register</a></> : <><a href="/login" className="text-sm font-semibold text-[var(--brand-navy)] transition-colors hover:text-[var(--brand-pink)]">Login</a><a href="/demo-onboarding" className="rounded-md bg-[var(--brand-pink)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--brand-pink-dark)]">Register</a></>}
				</div>

				<button
					type="button"
					aria-expanded={isMenuOpen}
					aria-controls="mobile-navigation"
					aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
					onClick={() => setIsMenuOpen((open) => !open)}
					className="rounded-md p-2 text-[var(--brand-navy)] transition-colors hover:bg-slate-100 lg:hidden"
				>
					{isMenuOpen ? <X aria-hidden="true" size={24} /> : <Menu aria-hidden="true" size={24} />}
				</button>
			</nav>

			{isMenuOpen && (
				<div id="mobile-navigation" className="border-t border-slate-100 bg-white px-5 pb-5 lg:hidden">
					<div className="mx-auto flex max-w-7xl flex-col gap-1 pt-3">
						{[...links, ...(isAuthenticated ? [] : [{ label: "Login", href: "/login" }])].map((link) => (
							<a
								key={link.label}
								href={link.href}
								onClick={() => setIsMenuOpen(false)}
								className="rounded-md px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[var(--brand-pink)]"
							>
								{link.label}
							</a>
						))}
						{isAuthenticated ? <><button type="button" onClick={() => { setIsMenuOpen(false); void handleLogout() }} className="mt-2 rounded-md px-3 py-3 text-left text-sm font-semibold text-[var(--brand-navy)] hover:bg-slate-50">Logout</button><a href="/demo-onboarding" onClick={() => setIsMenuOpen(false)} className="mt-2 rounded-md bg-[var(--brand-pink)] px-3 py-3 text-center text-sm font-semibold text-white hover:bg-[var(--brand-pink-dark)]">Register</a></> : <a href="/demo-onboarding" onClick={() => setIsMenuOpen(false)} className="mt-2 rounded-md bg-[var(--brand-pink)] px-3 py-3 text-center text-sm font-semibold text-white hover:bg-[var(--brand-pink-dark)]">Register</a>}
					</div>
				</div>
			)}
		</header>
	)
}

export default Navbar
