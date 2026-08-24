import {
	CalendarPlus,
	Users,
	MessageCircle,
	CheckSquare,
	QrCode,
	Image,
	Camera,
	BarChart2,
} from "lucide-react"

const features = [
	{
		title: "Event Creation",
		copy: "Fast event setup with customizable templates.",
		icon: CalendarPlus,
	},
	{
		title: "Guest Management",
		copy: "Organize guest lists, groups, and RSVPs.",
		icon: Users,
	},
	{
		title: "WhatsApp Invitations",
		copy: "Send polished invites via WhatsApp with one tap.",
		icon: MessageCircle,
	},
	{
		title: "Guest Response Tracking",
		copy: "Track RSVPs and attendance in real time.",
		icon: CheckSquare,
	},
	{
		title: "QR Code Generation",
		copy: "Create secure QR passes for quick check-in.",
		icon: QrCode,
	},
	{
		title: "AI Face Recognition Gallery",
		copy: "Auto-organize photos by detected faces.",
		icon: Image,
	},
	{
		title: "Photographer Portal",
		copy: "Share, manage, and deliver photo collections.",
		icon: Camera,
	},
	{
		title: "Analytics Dashboard",
		copy: "Insights on attendance, engagement, and more.",
		icon: BarChart2,
	},
]

function Features() {
	return (
		<section id="features" className="bg-white">
			<div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
				<div className="mx-auto max-w-3xl text-center">
					<p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand-pink)]">
						Features
					</p>
					<h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--brand-navy)] sm:text-5xl">
						Powerful tools for every event
					</h1>
					<p className="mt-6 text-base leading-8 text-slate-600 sm:text-lg">
						Everything you need to plan, invite, manage and remember your events.
					</p>
				</div>

				<div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
					{features.map(({ title, copy, icon: Icon }) => (
						<article
							key={title}
							className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
						>
							<div className="flex items-center gap-4">
								<div className="flex h-12 w-12 items-center justify-center rounded-md bg-slate-50 text-[var(--brand-navy)]">
									<Icon size={20} aria-hidden="true" />
								</div>
								<div>
									<h3 className="text-lg font-semibold text-[var(--brand-navy)]">{title}</h3>
									<p className="mt-1 text-sm text-slate-600">{copy}</p>
								</div>
							</div>
						</article>
					))}
				</div>
			</div>
		</section>
	)
}

export default Features
