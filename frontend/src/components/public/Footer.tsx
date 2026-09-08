import { Globe, Play, Share2 } from "lucide-react"
import { Link } from "react-router-dom"

const quickLinks = [
	{ label: "Home", href: "/" },
	{ label: "About", href: "/about" },
	{ label: "Pricing", href: "/pricing" },
	{ label: "Gallery", href: "/gallery" },
	{ label: "FAQ", href: "/faq" },
	{ label: "Contact", href: "/contact" },
]

function Footer() {
	return (
		<footer className="border-t border-slate-200/80 bg-[var(--brand-navy)] text-white">
			<div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
				<div>
					<Link
						to="/"
						className="text-lg font-bold tracking-[0.16em] text-white"
					>
						LAVERNA <span className="text-[var(--brand-pink)]">EVENTS</span>
					</Link>
					<p className="mt-3 max-w-xs text-xs leading-6 text-white/70">
						Celebrate. Connect. Cherish. Intelligent event coordination, WhatsApp passes, and AI memory galleries.
					</p>
				</div>

				<div>
					<h2 className="text-xs font-bold uppercase tracking-[0.16em] text-orange-200">
						Quick Links
					</h2>
					<nav
						aria-label="Footer navigation"
						className="mt-3 grid grid-cols-2 gap-2"
					>
						{quickLinks.map((link) => (
							<Link
								key={link.label}
								to={link.href}
								className="text-xs text-white/75 transition-colors hover:text-[var(--brand-pink)]"
							>
								{link.label}
							</Link>
						))}
					</nav>
				</div>

				<div>
					<h2 className="text-xs font-bold uppercase tracking-[0.16em] text-orange-200">
						Follow & Connect
					</h2>
					<div className="mt-3 flex items-center gap-2.5">
						<a
							href="#instagram"
							aria-label="Instagram"
							className="flex size-9 items-center justify-center rounded-full border border-white/20 text-white/75 transition-colors hover:border-[var(--brand-pink)] hover:bg-[var(--brand-pink)] hover:text-white"
						>
							<Globe aria-hidden="true" size={16} />
						</a>
						<a
							href="#linkedin"
							aria-label="LinkedIn"
							className="flex size-9 items-center justify-center rounded-full border border-white/20 text-white/75 transition-colors hover:border-[var(--brand-pink)] hover:bg-[var(--brand-pink)] hover:text-white"
						>
							<Share2 aria-hidden="true" size={16} />
						</a>
						<a
							href="#youtube"
							aria-label="YouTube"
							className="flex size-9 items-center justify-center rounded-full border border-white/20 text-white/75 transition-colors hover:border-[var(--brand-pink)] hover:bg-[var(--brand-pink)] hover:text-white"
						>
							<Play aria-hidden="true" size={16} />
						</a>
					</div>
				</div>
			</div>

			<div className="border-t border-white/10">
				<p className="mx-auto max-w-7xl px-5 py-4 text-center text-[11px] text-white/50 sm:px-6 lg:px-8">
					© {new Date().getFullYear()} Laverna Events. All rights reserved.
				</p>
			</div>
		</footer>
	)
}

export default Footer
