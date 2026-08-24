import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import {
	getApiErrorMessage,
	getMySubscription,
	getMyUsage,
	type Subscription,
	type UsageSummary,
} from "@/lib/auth"

function Account() {
	const navigate = useNavigate()
	const [subscription, setSubscription] = useState<Subscription | null>(null)
	const [usage, setUsage] = useState<UsageSummary | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState("")

	useEffect(() => {
		async function loadAccount() {
			try {
				const [subscriptionResponse, usageResponse] = await Promise.all([
					getMySubscription(),
					getMyUsage(),
				])
				setSubscription(subscriptionResponse.data)
				setUsage(usageResponse.data)
			} catch (loadError) {
				const message = getApiErrorMessage(loadError)
				if (message.includes("session has expired")) navigate("/login")
				else setError(message)
			} finally {
				setLoading(false)
			}
		}
		void loadAccount()
	}, [navigate])

	return (
		<section className="bg-white">
			<div className="mx-auto max-w-5xl px-5 py-20 sm:px-8 lg:py-28">
				<div>
					<p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand-pink)]">Account</p>
					<h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--brand-navy)] sm:text-5xl">Your membership</h1>
					<p className="mt-5 text-base leading-8 text-slate-600">Review your current plan and the limits available to your events.</p>
				</div>

				{loading && <p className="mt-12 text-sm text-slate-600">Loading account details...</p>}
				{error && <p className="mt-12 text-sm text-red-600" role="alert">{error}</p>}
				{!loading && !error && (
					<div className="mt-12 grid gap-8 lg:grid-cols-2">
						<div className="rounded-lg border border-slate-200 p-7 shadow-sm">
							<h2 className="text-2xl font-bold text-[var(--brand-navy)]">Current plan</h2>
							{subscription ? (
								<>
									<p className="mt-6 text-3xl font-bold text-[var(--brand-navy)]">{subscription.plan.name}</p>
									<p className="mt-2 text-sm text-slate-600">Status: {subscription.status}</p>
									<p className="mt-1 text-sm text-slate-600">Expires: {new Date(subscription.expires_at).toLocaleDateString()}</p>
								</>
							) : (
								<>
									<p className="mt-6 text-slate-600">You do not have an active plan yet.</p>
									<Link to="/pricing" className="mt-6 inline-flex rounded-md bg-[var(--brand-pink)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-pink-dark)]">Choose a plan</Link>
								</>
							)}
						</div>

						<div className="rounded-lg border border-slate-200 p-7 shadow-sm">
							<h2 className="text-2xl font-bold text-[var(--brand-navy)]">Plan access</h2>
							{usage?.has_active_plan ? (
								<ul className="mt-6 space-y-4 text-sm text-slate-600">
									<li>Guests: {usage.guest_limit ?? "Unlimited"}</li>
									<li>Events: {usage.event_limit ?? "Unlimited"}</li>
									<li>Templates: {usage.template_limit ?? "Unlimited"}</li>
									<li>Storage: {usage.storage_limit_mb ?? "Unlimited"} MB</li>
									<li>Gallery: {usage.gallery_enabled ? "Included" : "Not included"}</li>
									<li>QR features: {usage.qr_code_enabled ? "Included" : "Not included"}</li>
									<li>Photographer access: {usage.photographer_access_enabled ? "Included" : "Not included"}</li>
								</ul>
							) : <p className="mt-6 text-slate-600">Choose a plan to unlock membership features.</p>}
						</div>
					</div>
				)}
			</div>
		</section>
	)
}

export default Account