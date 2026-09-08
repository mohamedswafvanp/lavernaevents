import {
	BarChart2,
	CalendarPlus,
	Camera,
	CheckSquare,
	Image as ImageIcon,
	MessageCircle,
	QrCode,
	Users,
} from "lucide-react"
import { Link } from "react-router-dom"


const features = [
	{
		title: "Event Creation",
		copy: "Rapid event configuration with intelligent themes, timers, and schedules.",
		icon: CalendarPlus,
		tag: "Setup",
	},
	{
		title: "Guest Management",
		copy: "Organize guest lists, dietary needs, tables, and RSVPs in real time.",
		icon: Users,
		tag: "Guests",
	},
	{
		title: "WhatsApp Invitations",
		copy: "Distribute polished invites and reminder broadcasts via WhatsApp in one tap.",
		icon: MessageCircle,
		tag: "Invites",
	},
	{
		title: "Guest Response Tracking",
		copy: "Monitor RSVP confirmations, declines, and headcounts with live stats.",
		icon: CheckSquare,
		tag: "RSVP",
	},
	{
		title: "QR Code Passes",
		copy: "Generate secure digital QR tickets for fast check-in at the entrance.",
		icon: QrCode,
		tag: "Check-in",
	},
	{
		title: "AI Face-Tagging Gallery",
		copy: "Automatically sort and deliver event photos to guests using facial recognition.",
		icon: ImageIcon,
		tag: "AI Gallery",
	},
	{
		title: "Photographer Portal",
		copy: "Empower photographers to upload high-res albums directly to your private cloud.",
		icon: Camera,
		tag: "Media",
	},
	{
		title: "Analytics Dashboard",
		copy: "Actionable metrics on invitation engagement, arrival times, and guest stats.",
		icon: BarChart2,
		tag: "Insights",
	},
]

function Features() {
	return (
		<section id="features" className="min-h-screen bg-slate-50/70 pb-16">
			<div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-10 lg:px-8">
				
				{/* Top Hero Banner */}
				<div className="gradient-hero-warm relative overflow-hidden rounded-[2.5rem] p-8 text-center text-white soft-shadow-lg sm:p-12">
					<div className="pointer-events-none absolute -right-10 -top-10 size-60 rounded-full bg-white/15 blur-2xl" />
					<div className="relative z-10 mx-auto max-w-2xl">
						<span className="rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
							Platform Features
						</span>
						<h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
							Powerful Tools for Every Occasion
						</h1>
						<p className="mt-4 text-sm leading-6 text-orange-100 sm:text-base sm:leading-7">
							Everything you need to plan, invite, manage, and cherish your events.
						</p>
					</div>
				</div>

				{/* Features Grid */}
				<div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
					{features.map(({ title, copy, icon: Icon, tag }) => (
						<article
							key={title}
							className="group rounded-3xl border border-slate-200/80 bg-white p-6 soft-shadow transition-all hover:-translate-y-1 hover:shadow-lg"
						>
							<div className="flex items-center justify-between">
								<div className="flex size-12 items-center justify-center rounded-2xl bg-pink-50 text-[var(--brand-pink)] shadow-2xs group-hover:bg-[var(--brand-pink)] group-hover:text-white transition-colors">
									<Icon size={22} />
								</div>
								<span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
									{tag}
								</span>
							</div>
							<h3 className="mt-5 text-base font-bold text-[var(--brand-navy)]">
								{title}
							</h3>
							<p className="mt-2 text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">
								{copy}
							</p>
						</article>
					))}
				</div>

				{/* Bottom CTA */}
				<div className="mt-12 rounded-[2.5rem] border border-slate-200/80 bg-white p-8 text-center soft-shadow-lg sm:p-10">
					<h3 className="text-2xl font-bold text-[var(--brand-navy)]">
						Experience the Features in Action
					</h3>
					<p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
						Launch the demo onboarding workflow and test every feature with zero setup required.
					</p>
					<div className="mt-6 flex justify-center gap-3">
						<Link
							to="/demo-onboarding"
							className="rounded-full bg-[var(--brand-pink)] px-7 py-3 text-xs font-bold text-white shadow-md hover:bg-[var(--brand-pink-dark)] active:scale-95 sm:text-sm"
						>
							Start Interactive Demo
						</Link>
					</div>
				</div>

			</div>
		</section>
	)
}

export default Features
