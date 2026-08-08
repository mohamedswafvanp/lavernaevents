import { Globe, Play, Share2 } from "lucide-react"

const quickLinks = [
	{ label: "About", href: "#about" },
	{ label: "Features", href: "#features" },
	{ label: "Pricing", href: "#pricing" },
	{ label: "Contact", href: "#contact" },
]

function Footer() {
	return (
		<footer className="bg-[var(--brand-navy)] text-white">
			<div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-3 lg:px-10">
				<div>
					<a
						href="#home"
						className="text-xl font-bold tracking-[0.16em] text-white"
					>
						LAVERNA <span className="text-[var(--brand-pink)]">EVENTS</span>
					</a>
					<p className="mt-4 max-w-xs text-sm leading-6 text-white/70">
						Celebrate. Connect. Cherish.
					</p>
				</div>

				<div>
					<h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-white">
						Quick Links
					</h2>
					<nav aria-label="Footer navigation" className="mt-4 flex flex-col items-start gap-3">
						{quickLinks.map((link) => (
							<a
								key={link.label}
								href={link.href}
								className="text-sm text-white/70 transition-colors hover:text-white"
							>
								{link.label}
							</a>
						))}
					</nav>
				</div>

				<div>
					<h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-white">
						Follow Us
					</h2>
					<div className="mt-4 flex items-center gap-3">
						<a
							href="#instagram"
							aria-label="Instagram"
							title="Instagram"
							className="rounded-md border border-white/20 p-2.5 text-white/75 transition-colors hover:border-[var(--brand-pink)] hover:text-[var(--brand-pink)]"
						>
							<Globe aria-hidden="true" size={19} />
						</a>
						<a
							href="#linkedin"
							aria-label="LinkedIn"
							title="LinkedIn"
							className="rounded-md border border-white/20 p-2.5 text-white/75 transition-colors hover:border-[var(--brand-pink)] hover:text-[var(--brand-pink)]"
						>
							<Share2 aria-hidden="true" size={19} />
						</a>
						<a
							href="#youtube"
							aria-label="YouTube"
							title="YouTube"
							className="rounded-md border border-white/20 p-2.5 text-white/75 transition-colors hover:border-[var(--brand-pink)] hover:text-[var(--brand-pink)]"
						>
							<Play aria-hidden="true" size={19} />
						</a>
					</div>
				</div>
			</div>

			<div className="border-t border-white/10">
				<p className="mx-auto max-w-7xl px-5 py-5 text-center text-xs text-white/55 sm:px-8 lg:px-10">
					© {new Date().getFullYear()} LavernaEvents. All rights reserved.
				</p>
			</div>
		</footer>
	)
}

export default Footer
