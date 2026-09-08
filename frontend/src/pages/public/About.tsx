import { Heart, Leaf, UsersRound } from "lucide-react"
import { Link } from "react-router-dom"


const values = [
	{
		title: "Celebrate",
		copy: "Make space for the joy, milestones, and memories that matter most with thoughtful coordination.",
		icon: Heart,
		iconClassName: "text-[var(--brand-pink)] bg-pink-50",
	},
	{
		title: "Connect",
		copy: "Bring people closer through seamless WhatsApp invitations, live updates, and effortless RSVP tracking.",
		icon: UsersRound,
		iconClassName: "text-[var(--brand-navy)] bg-violet-50",
	},
	{
		title: "Cherish",
		copy: "Keep every meaningful detail close, with instant AI facial recognition photo sharing and memory galleries.",
		icon: Leaf,
		iconClassName: "text-emerald-600 bg-emerald-50",
	},
]

function About() {
	return (
		<section id="about" className="min-h-screen bg-slate-50/70 pb-16">
			<div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-10 lg:px-8">
				
				{/* Top Hero Banner */}
				<div className="gradient-hero-warm relative overflow-hidden rounded-[2.5rem] p-8 text-center text-white soft-shadow-lg sm:p-12">
					<div className="pointer-events-none absolute -right-12 -top-12 size-64 rounded-full bg-white/15 blur-2xl" />
					<div className="relative z-10 mx-auto max-w-2xl">
						<span className="rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
							Our Story
						</span>
						<h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
							About Laverna Events
						</h1>
						<p className="mt-4 text-sm leading-6 text-orange-100 sm:text-base sm:leading-7">
							Laverna Events is an all-in-one celebration platform crafted to make
							event management feel intuitive, calm, and joyful.
						</p>
					</div>
				</div>

				{/* Mission Card */}
				<div className="mt-8 rounded-[2.5rem] border border-slate-200/80 bg-white p-6 soft-shadow-lg sm:p-10">
					<div className="mx-auto max-w-3xl text-center">
						<span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-bold text-[var(--brand-pink)]">
							Our Purpose
						</span>
						<h2 className="mt-3 text-2xl font-bold tracking-tight text-[var(--brand-navy)] sm:text-3xl">
							Connecting People Through Memorable Occasions
						</h2>
						<p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
							From weddings and milestone birthdays to corporate banquets, summits, and
							community festivals, we bring your invitations, guest lists, QR check-in
							passes, and photo collections into one harmonious experience.
						</p>
					</div>

					{/* Values Grid */}
					<div className="mt-10 grid gap-5 sm:grid-cols-3">
						{values.map(({ title, copy, icon: Icon, iconClassName }) => (
							<div
								key={title}
								className="rounded-3xl border border-slate-100 bg-slate-50/60 p-6 text-center soft-shadow transition-all hover:bg-white hover:shadow-md"
							>
								<div
									className={`mx-auto flex size-14 items-center justify-center rounded-2xl ${iconClassName} shadow-2xs`}
								>
									<Icon aria-hidden="true" size={26} />
								</div>
								<h3 className="mt-5 text-lg font-bold text-[var(--brand-navy)]">
									{title}
								</h3>
								<p className="mt-2 text-xs leading-6 text-slate-600 sm:text-sm">
									{copy}
								</p>
							</div>
						))}
					</div>
				</div>

				{/* Bottom CTA */}
				<div className="mt-8 rounded-[2.5rem] border border-slate-200/80 bg-white p-8 text-center soft-shadow-lg sm:p-10">
					<h3 className="text-2xl font-bold text-[var(--brand-navy)]">
						Ready to plan your next event?
					</h3>
					<p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
						Explore our membership packages or test our interactive demo portal.
					</p>
					<div className="mt-6 flex flex-wrap justify-center gap-3">
						<Link
							to="/demo-onboarding"
							className="rounded-full bg-[var(--brand-pink)] px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-[var(--brand-pink-dark)] active:scale-95 sm:text-sm"
						>
							Start Interactive Demo
						</Link>
						<Link
							to="/pricing"
							className="rounded-full border border-slate-200 bg-slate-50 px-6 py-3 text-xs font-bold text-slate-700 hover:bg-slate-100 active:scale-95 sm:text-sm"
						>
							Explore Plans
						</Link>
					</div>
				</div>

			</div>
		</section>
	)
}

export default About
