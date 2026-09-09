import { ShieldCheck } from "lucide-react"

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
		<section className="min-h-screen bg-slate-50/70 pb-16">
			<div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6 sm:pt-10 lg:px-8">
				
				{/* Top Hero Banner */}
				<div className="gradient-hero-warm relative overflow-hidden rounded-[2.5rem] p-8 text-white soft-shadow-lg sm:p-12">
					<div className="pointer-events-none absolute -right-10 -top-10 size-60 rounded-full bg-white/15 blur-2xl" />
					<div className="relative z-10">
						<span className="rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
							Account Dashboard
						</span>
						<h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
							Your Membership & Limits
						</h1>
						<p className="mt-2 text-sm leading-6 text-orange-100">
							Review active subscription limits, cloud storage, and attendee capacity.
						</p>
					</div>
				</div>

				{loading && (
					<div className="mt-12 text-center text-sm font-semibold text-slate-500">
						Loading account profile...
					</div>
				)}

				{error && (
					<p
						className="mx-auto mt-8 max-w-xl rounded-2xl bg-red-50 p-4 text-center text-xs font-medium text-red-600"
						role="alert"
					>
						{error}
					</p>
				)}

				{!loading && !error && (
					<div className="mt-8 grid gap-6 lg:grid-cols-2">
						{/* Current Plan Card */}
						<div className="rounded-[2.5rem] border border-slate-200/80 bg-white p-7 soft-shadow-lg sm:p-8">
							<div className="flex items-center justify-between">
								<span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-bold text-[var(--brand-pink)]">
									Active Subscription
								</span>
								<ShieldCheck size={20} className="text-emerald-600" />
							</div>

							{subscription ? (
								<div className="mt-6">
									<h2 className="text-3xl font-bold text-[var(--brand-navy)]">
										{subscription.plan.name}
									</h2>
									<div className="mt-4 space-y-2 text-xs text-slate-600 sm:text-sm">
										<p className="flex items-center gap-2">
											<span className="font-semibold text-slate-900">Status:</span>
											<span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
												{subscription.status}
											</span>
										</p>
										<p className="flex items-center gap-2">
											<span className="font-semibold text-slate-900">Expires:</span>
											<span>
												{new Date(subscription.expires_at).toLocaleDateString(undefined, {
													month: "long",
													day: "numeric",
													year: "numeric",
												})}
											</span>
										</p>
									</div>

									<div className="mt-8 flex gap-3">
										<Link
											to="/pricing"
											className="rounded-full bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 active:scale-95"
										>
											Upgrade Plan
										</Link>
										<Link
											to="/portal"
											className="rounded-full bg-[var(--brand-pink)] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[var(--brand-pink-dark)] active:scale-95"
										>
											Enter Portal
										</Link>
									</div>
								</div>
							) : (
								<div className="mt-6">
									<p className="text-sm text-slate-600">
										You do not have an active membership plan yet.
									</p>
									<Link
										to="/pricing"
										className="mt-6 inline-flex rounded-full bg-[var(--brand-pink)] px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-[var(--brand-pink-dark)] active:scale-95"
									>
										Choose a Plan
									</Link>
								</div>
							)}
						</div>

						{/* Plan Access & Quotas */}
						<div className="rounded-[2.5rem] border border-slate-200/80 bg-white p-7 soft-shadow-lg sm:p-8">
							<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
								Features & Allocations
							</span>

							{usage?.has_active_plan ? (
								<ul className="mt-6 space-y-3 text-xs text-slate-600 sm:text-sm">
									<li className="flex items-center justify-between border-b border-slate-100 pb-2">
										<span className="font-medium text-slate-900">Guest Capacity</span>
										<span className="font-bold text-[var(--brand-pink)]">
											{usage.guest_limit ?? "Unlimited"}
										</span>
									</li>
									<li className="flex items-center justify-between border-b border-slate-100 pb-2">
										<span className="font-medium text-slate-900">Total Celebrations</span>
										<span className="font-bold text-[var(--brand-pink)]">
											{usage.event_limit ?? "Unlimited"}
										</span>
									</li>
									<li className="flex items-center justify-between border-b border-slate-100 pb-2">
										<span className="font-medium text-slate-900">Invitation Templates</span>
										<span className="font-bold text-[var(--brand-pink)]">
											{usage.template_count ?? "Unlimited"}
										</span>
									</li>
									<li className="flex items-center justify-between border-b border-slate-100 pb-2">
										<span className="font-medium text-slate-900">Cloud Storage</span>
										<span className="font-bold text-[var(--brand-pink)]">
											{usage.storage_limit_mb ?? "Unlimited"} MB
										</span>
									</li>
									<li className="flex items-center justify-between border-b border-slate-100 pb-2">
										<span className="font-medium text-slate-900">AI Face Recognition Gallery</span>
										<span className="font-bold text-emerald-700">
											{usage.gallery_enabled ? "Included" : "Not included"}
										</span>
									</li>
									<li className="flex items-center justify-between border-b border-slate-100 pb-2">
										<span className="font-medium text-slate-900">QR Check-in Passes</span>
										<span className="font-bold text-emerald-700">
											{usage.qr_code_enabled ? "Included" : "Not included"}
										</span>
									</li>
									<li className="flex items-center justify-between">
										<span className="font-medium text-slate-900">Photographer Access</span>
										<span className="font-bold text-emerald-700">
											{usage.photographer_access_enabled ? "Included" : "Not included"}
										</span>
									</li>
								</ul>
							) : (
								<p className="mt-6 text-sm text-slate-600">
									Choose a plan to unlock full celebration tools and features.
								</p>
							)}
						</div>
					</div>
				)}

			</div>
		</section>
	)
}

export default Account