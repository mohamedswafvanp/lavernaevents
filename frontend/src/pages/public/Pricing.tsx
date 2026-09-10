import { Check, LoaderCircle, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import {
	changePlan,
	createPaymentOrder,
	getAccessToken,
	getApiErrorMessage,
	getMembershipPlans,
	getMySubscription,
	getPortalAccess,
	subscribeToPlan,
	verifyPayment,
	type MembershipPlan,
} from "@/lib/auth"

declare global {
	interface Window {
		Razorpay?: new (options: {
			key: string
			amount: number
			currency: string
			name: string
			description: string
			order_id: string
			handler: (response: {
				razorpay_order_id: string
				razorpay_payment_id: string
				razorpay_signature: string
			}) => void
			modal: { ondismiss: () => void }
		}) => { open: () => void }
	}
}

async function loadRazorpay() {
	if (window.Razorpay) return
	await new Promise<void>((resolve, reject) => {
		const script = document.createElement("script")
		script.src = "https://checkout.razorpay.com/v1/checkout.js"
		script.onload = () => resolve()
		script.onerror = () =>
			reject(new Error("Unable to load secure payment checkout."))
		document.body.appendChild(script)
	})
}

function planFeatures(plan: MembershipPlan) {
	return [
		`${plan.guest_limit ?? "Unlimited"} guest capacity`,
		plan.template_names.length > 0
			? `${plan.template_names.length} invitation template${plan.template_names.length === 1 ? "" : "s"}: ${plan.template_names.join(", ")}`
			: "No invitation templates included",
		`${plan.storage_limit_mb} MB cloud storage`,
		plan.gallery_enabled
			? "AI Photo gallery & face tagging"
			: "Photo gallery unavailable",
		plan.qr_code_enabled
			? "Instant QR check-in passes"
			: "QR features unavailable",
		plan.photographer_access_enabled
			? "Photographer portal access"
			: "No photographer access",
	]
}

function Pricing() {
	const navigate = useNavigate()
	const [plans, setPlans] = useState<MembershipPlan[]>([])
	const [activeSlug, setActiveSlug] = useState<string | null>(null)
	const [loading, setLoading] = useState(true)
	const [selectedSlug, setSelectedSlug] = useState("")
	const [error, setError] = useState("")
	const [notice, setNotice] = useState("")

	useEffect(() => {
		async function loadPlans() {
			try {
				const plansResponse = await getMembershipPlans()
				setPlans(plansResponse.data)
				if (getAccessToken()) {
					const subscriptionResponse = await getMySubscription()
					setActiveSlug(subscriptionResponse.data?.plan.slug ?? null)
				}
			} catch (loadError) {
				setError(getApiErrorMessage(loadError))
			} finally {
				setLoading(false)
			}
		}
		void loadPlans()
	}, [])

	const handlePlanAction = async (plan: MembershipPlan) => {
		if (!getAccessToken()) {
			navigate("/login", { state: { from: "/pricing" } })
			return
		}
		setSelectedSlug(plan.slug)
		setError("")
		setNotice("")
		try {
			if (activeSlug) {
				const response = await changePlan(plan.slug)
				setActiveSlug(response.data.subscription.plan.slug)
				setNotice(`Plan ${response.data.change_type} completed successfully.`)
				navigate("/portal/account")
			} else if (Number(plan.price) === 0) {
				const response = await subscribeToPlan(plan.slug)
				setActiveSlug(response.data.plan.slug)
				setNotice(response.message ?? "Subscribed successfully.")
				const access = await getPortalAccess()
				if (access.data.next_step === null) navigate("/portal")
				else navigate("/portal/account")
			} else {
				const order = await createPaymentOrder(plan.slug)
				await loadRazorpay()
				if (!window.Razorpay)
					throw new Error("Secure payment checkout is unavailable.")
				const checkout = new window.Razorpay({
					key: order.data.razorpay_key_id,
					amount: Math.round(Number(order.data.amount) * 100),
					currency: order.data.currency,
					name: "LavernaEvents",
					description: `${plan.name} membership`,
					order_id: order.data.razorpay_order_id,
					handler: (payment) => {
						void verifyPayment(payment)
							.then(async () => {
								const access = await getPortalAccess()
								if (access.data.next_step === null) navigate("/portal")
										else navigate("/portal/account")
							})
							.catch((paymentError) =>
								setError(getApiErrorMessage(paymentError))
							)
					},
					modal: { ondismiss: () => setSelectedSlug("") },
				})
				checkout.open()
				return
			}
		} catch (actionError) {
			setError(getApiErrorMessage(actionError))
		} finally {
			setSelectedSlug("")
		}
	}

	return (
		<section id="pricing" className="min-h-screen bg-slate-50/70 pb-16">
			<div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-10 lg:px-8">
				
				{/* Top Hero Banner */}
				<div className="gradient-hero-warm relative overflow-hidden rounded-[2.5rem] p-8 text-center text-white soft-shadow-lg sm:p-12">
					<div className="pointer-events-none absolute -right-10 -top-10 size-60 rounded-full bg-white/15 blur-2xl" />
					<div className="relative z-10 mx-auto max-w-2xl">
						<span className="rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
							Membership & Pricing
						</span>
						<h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
							A Plan for Every Celebration
						</h1>
						<p className="mt-4 text-sm leading-6 text-orange-100 sm:text-base sm:leading-7">
							Choose the tools, storage, and guest flexibility your next event requires.
						</p>
					</div>
				</div>

				{loading && (
					<div className="mt-16 flex justify-center text-[var(--brand-pink)]">
						<LoaderCircle className="animate-spin" size={32} aria-label="Loading plans" />
					</div>
				)}

				{error && (
					<p className="mx-auto mt-8 max-w-xl rounded-2xl bg-red-50 p-4 text-center text-xs font-medium text-red-600" role="alert">
						{error}
					</p>
				)}

				{notice && (
					<p className="mx-auto mt-8 max-w-xl rounded-2xl bg-emerald-50 p-4 text-center text-xs font-medium text-emerald-700" role="status">
						{notice}
					</p>
				)}

				{/* Plans Grid */}
				<div className="mt-10 grid items-stretch gap-6 lg:grid-cols-3">
					{plans.map((plan) => {
						const popular = plan.slug === "premium"
						const isActive = activeSlug === plan.slug
						return (
							<article
								key={plan.slug}
								className={`relative flex h-full flex-col rounded-[2.5rem] bg-white p-7 soft-shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl ${
									popular
										? "border-2 border-[var(--brand-pink)] ring-4 ring-pink-100"
										: "border border-slate-200/80"
								}`}
							>
								{popular && (
									<span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[var(--brand-pink)] px-4 py-1 text-[11px] font-bold text-white shadow-sm">
										Most Popular
									</span>
								)}

								<div className="flex items-center justify-between">
									<h2 className="text-xl font-bold text-[var(--brand-navy)]">
										{plan.name}
									</h2>
									{popular && (
										<div className="rounded-xl bg-pink-50 p-1.5 text-[var(--brand-pink)]">
											<Sparkles size={18} />
										</div>
									)}
								</div>

								<p className="mt-2 min-h-12 text-xs leading-5 text-slate-600">
									{plan.description}
								</p>

								<div className="mt-5 flex items-baseline gap-1.5">
									<span className="text-4xl font-bold tracking-tight text-[var(--brand-navy)]">
										{Number(plan.price) === 0 ? "Free" : `$${plan.price}`}
									</span>
									<span className="text-xs text-slate-500 font-medium">
										/ {plan.duration_days} days
									</span>
								</div>

								<ul className="mt-6 flex-1 space-y-3 border-t border-slate-100 pt-6">
									{planFeatures(plan).map((feature) => (
										<li
											key={feature}
											className="flex items-start gap-2.5 text-xs text-slate-600 sm:text-sm"
										>
											<div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-pink-50 text-[var(--brand-pink)]">
												<Check size={13} strokeWidth={3} />
											</div>
											<span>{feature}</span>
										</li>
									))}
								</ul>

								<button
									type="button"
									disabled={isActive || selectedSlug === plan.slug}
									onClick={() => void handlePlanAction(plan)}
									className={`mt-8 inline-flex min-h-11 items-center justify-center rounded-full px-6 py-3 text-xs font-bold transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${
										popular
											? "bg-[var(--brand-pink)] text-white shadow-md hover:bg-[var(--brand-pink-dark)]"
											: "bg-slate-900 text-white shadow-sm hover:bg-slate-800"
									}`}
								>
									{selectedSlug === plan.slug ? (
										<LoaderCircle className="animate-spin" size={18} aria-label="Updating plan" />
									) : isActive ? (
										"Current Plan"
									) : getAccessToken() ? (
										"Choose Plan"
									) : (
										"Log In to Subscribe"
									)}
								</button>
							</article>
						)
					})}
				</div>

				{getAccessToken() && (
					<p className="mt-10 text-center text-xs text-slate-600">
						View your current subscription and limits in{" "}
						<Link
							to="/portal/account"
							className="font-bold text-[var(--brand-pink)] hover:underline"
						>
							Account
						</Link>
						.
					</p>
				)}

			</div>
		</section>
	)
}

export default Pricing
