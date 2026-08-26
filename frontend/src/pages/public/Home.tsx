import { motion } from "framer-motion"
import { CalendarDays, Camera, MessageCircle, Users } from "lucide-react"
import lavernaLogo from "../../assets/laverna-logo.png"

const features = [
	{
		title: "Create Events",
		copy: "Bring every detail of your celebration together in one place.",
		icon: CalendarDays,
	},
	{
		title: "Manage Guests",
		copy: "Keep your guest list, RSVPs, and event updates beautifully organized.",
		icon: Users,
	},
	{
		title: "WhatsApp Invitations",
		copy: "Share thoughtful invitations and updates with guests in seconds.",
		icon: MessageCircle,
	},
	{
		title: "AI Photo Sharing",
		copy: "Collect and share the moments your guests never want to forget.",
		icon: Camera,
	},
]

function Home() {
	return (
		<section id="home" className="overflow-hidden bg-white">
			<motion.div
				initial={{ opacity: 0, y: 28 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.7, ease: "easeOut" }}
				className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-16 sm:px-8 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:pb-24 lg:pt-24"
			>
				<div className="max-w-2xl">
					<p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand-pink)]">
						Laverna Events
					</p>
					<h1 className="max-w-xl text-5xl font-bold leading-[1.05] tracking-tight text-[var(--brand-navy)] sm:text-6xl lg:text-7xl">
						Celebrate Every Moment
					</h1>
					<p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
						Make every occasion memorable with simple event management for weddings,
						birthdays, corporate events, and all the moments in between.
					</p>
					<div className="mt-8 flex flex-wrap items-center gap-4">
						<a
							href="/demo-onboarding"
							className="rounded-md bg-[var(--brand-pink)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--brand-pink-dark)]"
						>
							Get Started
						</a>
						<a
							href="#features"
							className="rounded-md border border-[var(--brand-navy)] px-6 py-3 text-sm font-semibold text-[var(--brand-navy)] transition-colors hover:bg-[var(--brand-navy)] hover:text-white"
						>
							See Features
						</a>
					</div>
				</div>

				<div className="relative flex min-h-72 items-center justify-center rounded-3xl bg-white px-10 py-12 sm:min-h-96 lg:min-h-[30rem]">
					<div className="absolute inset-5 rounded-2xl border border-slate-100" />
					<img
						src={lavernaLogo}
						alt="Laverna Events"
						className="relative w-80 max-w-full sm:w-96 lg:w-[28rem] object-contain"
					/>
				</div>
			</motion.div>

			<div id="features" className="border-t border-slate-100 bg-slate-50/70">
				<div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
					<div className="mb-10 max-w-xl">
						<p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-pink)]">
							Everything in one place
						</p>
						<h2 className="mt-3 text-3xl font-bold text-[var(--brand-navy)] sm:text-4xl">
							A calmer way to plan together
						</h2>
					</div>
					<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
						{features.map(({ title, copy, icon: Icon }) => (
							<article key={title} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
								<div className="flex size-11 items-center justify-center rounded-md bg-pink-50 text-[var(--brand-pink)]">
									<Icon aria-hidden="true" size={22} />
								</div>
								<h3 className="mt-5 text-base font-semibold text-[var(--brand-navy)]">{title}</h3>
								<p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
							</article>
						))}
					</div>
				</div>
			</div>
		</section>
	)
}

export default Home
