import { Heart, Leaf, UsersRound } from "lucide-react"

const values = [
	{
		title: "Celebrate",
		copy: "Make space for the joy, milestones, and memories that matter most.",
		icon: Heart,
		iconClassName: "text-[var(--brand-pink)] bg-pink-50",
	},
	{
		title: "Connect",
		copy: "Bring people closer with thoughtful planning and effortless coordination.",
		icon: UsersRound,
		iconClassName: "text-[var(--brand-navy)] bg-violet-50",
	},
	{
		title: "Cherish",
		copy: "Keep every meaningful detail close, from the first invite to the final photo.",
		icon: Leaf,
		iconClassName: "text-emerald-600 bg-emerald-50",
	},
]

function About() {
	return (
		<section id="about" className="bg-white">
			<div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
				<div className="mx-auto max-w-3xl text-center">
					<p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand-pink)]">
						Our story
					</p>
					<h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--brand-navy)] sm:text-5xl">
						About LavernaEvents
					</h1>
					<p className="mt-6 text-base leading-8 text-slate-600 sm:text-lg">
						LavernaEvents is an all-in-one event management platform designed to make
						planning feel simpler and more joyful. From weddings and birthdays to
						corporate events, community gatherings, and everything in between, we bring
						your event details, guests, invitations, and memories together in one place.
					</p>
				</div>

				<div className="mt-20">
					<div className="text-center">
						<h2 className="text-3xl font-bold text-[var(--brand-navy)] sm:text-4xl">Our Values</h2>
						<p className="mt-3 text-slate-600">The principles behind every celebration we help create.</p>
					</div>
					<div className="mt-10 grid gap-5 md:grid-cols-3">
						{values.map(({ title, copy, icon: Icon, iconClassName }) => (
							<article key={title} className="rounded-lg border border-slate-200 bg-slate-50/60 p-7 text-center">
								<div className={`mx-auto flex size-14 items-center justify-center rounded-full ${iconClassName}`}>
									<Icon aria-hidden="true" size={25} />
								</div>
								<h3 className="mt-5 text-xl font-semibold text-[var(--brand-navy)]">{title}</h3>
								<p className="mt-3 text-sm leading-6 text-slate-600">{copy}</p>
							</article>
						))}
					</div>
				</div>
			</div>
		</section>
	)
}

export default About
