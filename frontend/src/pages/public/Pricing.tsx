import { Check, LoaderCircle } from "lucide-react"
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
			handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void
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
		script.onerror = () => reject(new Error("Unable to load secure payment checkout."))
		document.body.appendChild(script)
	})
}

function planFeatures(plan: MembershipPlan) {
	return [
		`${plan.guest_limit} guest${plan.guest_limit === 1 ? "" : "s"}`,
		`${plan.template_limit} invitation template${plan.template_limit === 1 ? "" : "s"}`,
		`${plan.storage_limit_mb} MB storage`,
		plan.gallery_enabled ? "Photo gallery included" : "Photo gallery unavailable",
		plan.qr_code_enabled ? "QR features included" : "QR features unavailable",
		plan.photographer_access_enabled ? "Photographer access included" : "No photographer access",
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
				navigate("/account")
			} else if (Number(plan.price) === 0) {
				const response = await subscribeToPlan(plan.slug)
				setActiveSlug(response.data.plan.slug)
				setNotice(response.message ?? "Subscribed successfully.")
				const access = await getPortalAccess()
				if (access.data.next_step === null) navigate("/portal")
				else navigate("/account")
			} else {
				const order = await createPaymentOrder(plan.slug)
				await loadRazorpay()
				if (!window.Razorpay) throw new Error("Secure payment checkout is unavailable.")
				const checkout = new window.Razorpay({
					key: order.data.razorpay_key_id,
					amount: Math.round(Number(order.data.amount) * 100),
					currency: order.data.currency,
					name: "LavernaEvents",
					description: `${plan.name} membership`,
					order_id: order.data.razorpay_order_id,
					handler: (payment) => {
						void verifyPayment(payment).then(async () => {
							const access = await getPortalAccess()
							if (access.data.next_step === null) navigate("/portal")
							else navigate("/account")
						}).catch((paymentError) => setError(getApiErrorMessage(paymentError)))
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

				{loading && <div className="mt-16 flex justify-center text-[var(--brand-pink)]"><LoaderCircle className="animate-spin" aria-label="Loading plans" /></div>}
				{error && <p className="mx-auto mt-10 max-w-xl text-center text-sm text-red-600" role="alert">{error}</p>}
				{notice && <p className="mx-auto mt-10 max-w-xl text-center text-sm font-medium text-emerald-700" role="status">{notice}</p>}

				<div className="mt-12 grid items-stretch gap-6 lg:grid-cols-3">
					{plans.map((plan) => {
						const popular = plan.slug === "premium"
						const isActive = activeSlug === plan.slug
						return (
						<article
							key={plan.slug}
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
							<h2 className="text-xl font-semibold text-[var(--brand-navy)]">{plan.name}</h2>
							<p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">{plan.description}</p>
							<div className="mt-5 flex items-baseline gap-2">
								<span className="text-4xl font-bold tracking-tight text-[var(--brand-navy)]">${plan.price}</span>
								<span className="text-sm text-slate-500">/{plan.duration_days} days</span>
							</div>
							<ul className="mt-8 flex-1 space-y-4">
								{planFeatures(plan).map((feature) => (
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
							<button type="button" disabled={isActive || selectedSlug === plan.slug} onClick={() => void handlePlanAction(plan)} className="mt-8 inline-flex min-h-10 items-center justify-center rounded-md bg-[var(--brand-pink)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-pink-dark)] disabled:cursor-not-allowed disabled:opacity-60">
								{selectedSlug === plan.slug ? <LoaderCircle className="animate-spin" size={18} aria-label="Updating plan" /> : isActive ? "Current Plan" : getAccessToken() ? "Choose Plan" : "Log in to Subscribe"}
							</button>
						</article>
						)
					})}
				</div>
				{getAccessToken() && <p className="mt-10 text-center text-sm text-slate-600">View your current subscription and usage in <Link to="/account" className="font-semibold text-[var(--brand-pink)] hover:underline">Account</Link>.</p>}
			</div>
		</section>
	)
}

export default Pricing
