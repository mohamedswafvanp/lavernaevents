import { Check } from "lucide-react"

const plans = [
	{
		name: "Basic",
		price: "$0",
		period: "forever",
		features: [
			"Up to 50 guests",
			"Essential event templates",
			"500 MB photo storage",
			"Standard QR check-in",
			"No photographer access",
		],
	},
	{
		name: "Premium",
		price: "$49",
		period: "per event",
		popular: true,
		features: [
			"Up to 250 guests",
			"All event templates",
			"10 GB photo storage",
			"Custom QR passes and check-in",
			"Photographer access included",
		],
	},
	{
		name: "Enterprise",
		price: "Custom",
		period: "for your organization",
		features: [
			"Unlimited guests",
			"Branded templates",
			"Flexible storage options",
			"Advanced QR features",
			"Multi-photographer access",
		],
	},
]

function Pricing() {
	return (
		<section id="pricing" className="bg-white">
			<div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
				<div className="mx-auto max-w-3xl text-center">
					<p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand-pink)]">
						Pricing
					</p>
					<h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--brand-navy)] sm:text-5xl">
						A plan for every celebration
					</h1>
					<p className="mt-6 text-base leading-8 text-slate-600 sm:text-lg">
						Choose the tools and flexibility your next event needs.
					</p>
				</div>

				<div className="mt-12 grid items-stretch gap-6 lg:grid-cols-3">
					{plans.map(({ name, price, period, features, popular }) => (
						<article
							key={name}
							className={`relative flex h-full flex-col rounded-lg border bg-white p-7 shadow-sm transition-shadow hover:shadow-md ${
								popular
									? "border-2 border-[var(--brand-pink)]"
									: "border-slate-200"
							}`}
						>
							{popular && (
								<span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--brand-pink)] px-4 py-1 text-xs font-semibold text-white">
									Most Popular
								</span>
							)}
							<h2 className="text-xl font-semibold text-[var(--brand-navy)]">{name}</h2>
							<div className="mt-5 flex items-baseline gap-2">
								<span className="text-4xl font-bold tracking-tight text-[var(--brand-navy)]">{price}</span>
								<span className="text-sm text-slate-500">{period}</span>
							</div>
							<ul className="mt-8 space-y-4">
								{features.map((feature) => (
									<li key={feature} className="flex items-start gap-3 text-sm text-slate-600">
										<Check
											aria-hidden="true"
											size={18}
											className="mt-0.5 shrink-0 text-[var(--brand-pink)]"
										/>
										<span>{feature}</span>
									</li>
								))}
							</ul>
						</article>
					))}
				</div>
			</div>
		</section>
	)
}

export default Pricing
