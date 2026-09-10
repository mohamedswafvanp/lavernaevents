import {
	Calendar,
	Check,
	Clock,
	ExternalLink,
	HelpCircle,
	LoaderCircle,
	MapPin,
	Sparkles,
	X,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import {
	getInvitationResponseDetails,
	submitInvitationResponse,
	type InvitationResponseDetails,
} from "@/lib/responses"
import { parseApiError } from "@/lib/api"

function Respond() {
	const { token } = useParams<{ token: string }>()
	const [details, setDetails] = useState<InvitationResponseDetails | null>(null)
	const [loading, setLoading] = useState(true)
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState("")
	const [userResponse, setUserResponse] = useState<string | null>(null)

	useEffect(() => {
		async function loadInvitation() {
			if (!token) {
				setError("Invitation link is missing token.")
				setLoading(false)
				return
			}
			try {
				const res = await getInvitationResponseDetails(token)
				setDetails(res.data)
				if (res.data.already_responded) {
					setUserResponse(res.data.response_status)
				}
			} catch (err) {
				setError(parseApiError(err))
			} finally {
				setLoading(false)
			}
		}
		void loadInvitation()
	}, [token])

	const handleResponse = async (responseValue: "ACCEPTED" | "REJECTED" | "MAYBE") => {
		if (!token) return
		setSubmitting(true)
		setError("")
		try {
			const res = await submitInvitationResponse(token, responseValue)
			setUserResponse(res.data.response_status || responseValue)
			if (details) {
				setDetails({
					...details,
					already_responded: true,
					response_status: responseValue,
				})
			}
		} catch (err) {
			setError(parseApiError(err))
		} finally {
			setSubmitting(false)
		}
	}

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
				<div className="text-center">
					<LoaderCircle className="mx-auto animate-spin text-[var(--brand-pink)]" size={36} />
					<p className="mt-3 text-xs font-semibold text-slate-500">
						Opening your personal invitation...
					</p>
				</div>
			</div>
		)
	}

	if (error && !details) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
				<div className="w-full max-w-md rounded-[2.5rem] border border-slate-200/80 bg-white p-8 text-center soft-shadow-lg">
					<div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
						<X size={28} />
					</div>
					<h1 className="mt-4 text-xl font-bold text-[var(--brand-navy)] sm:text-2xl">
						This invitation link isn&apos;t valid
					</h1>
					<p className="mt-2 text-xs leading-5 text-slate-600">
						This invitation link is not valid or has been deactivated by the host. Please reach out to your event organizer for a fresh link.
					</p>
				</div>
			</div>
		)
	}

	if (!details) return null

	return (
		<div className="min-h-screen bg-slate-50/80 px-3 py-6 sm:px-6 sm:py-10">
			<div className="mx-auto max-w-xl">
				{/* Top Branding Header */}
				<div className="text-center mb-6">
					<span className="text-xs font-bold tracking-[0.2em] text-[var(--brand-navy)]">
						LAVERNA <span className="text-[var(--brand-pink)]">EVENTS</span>
					</span>
				</div>

				{/* Main Card */}
				<div className="overflow-hidden rounded-[2.5rem] border border-slate-200/80 bg-white soft-shadow-lg">
					
					{/* Personalized Invitation Image / Banner */}
					{details.invitation_image ? (
						<div className="relative aspect-[4/3] w-full bg-slate-900 overflow-hidden sm:aspect-[16/10]">
							<img
								src={details.invitation_image}
								alt={`Invitation for ${details.event_name}`}
								className="h-full w-full object-cover"
							/>
						</div>
					) : (
						<div className="gradient-hero-warm p-8 text-center text-white">
							<span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur-xs">
								{details.event_type}
							</span>
							<h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
								{details.event_name}
							</h1>
							<p className="mt-1 text-xs text-orange-100">
								Personal invitation for <span className="font-bold text-white">{details.guest_name}</span>
							</p>
						</div>
					)}

					<div className="p-6 sm:p-8">
						<div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-4">
							<div>
								<span className="text-[10px] font-bold text-[var(--brand-pink)] uppercase tracking-wider">
									Guest Pass
								</span>
								<h2 className="text-lg font-bold text-[var(--brand-navy)] sm:text-xl">
									Hello, {details.guest_name}
								</h2>
							</div>
							<div className="rounded-2xl bg-pink-50 p-2 text-[var(--brand-pink)]">
								<Sparkles size={20} />
							</div>
						</div>

						{/* Event Details List */}
						<div className="mt-5 space-y-3 text-xs text-slate-700 sm:text-sm">
							<div className="flex items-center gap-3">
								<div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
									<Calendar size={16} />
								</div>
								<div>
									<p className="font-semibold text-slate-900">
										{new Date(details.event_date).toLocaleDateString(undefined, {
											weekday: "long",
											month: "long",
											day: "numeric",
											year: "numeric",
										})}
									</p>
								</div>
							</div>

							{details.event_time && (
								<div className="flex items-center gap-3">
									<div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-[var(--brand-pink)]">
										<Clock size={16} />
									</div>
									<div>
										<p className="font-semibold text-slate-900">{details.event_time}</p>
									</div>
								</div>
							)}

							<div className="flex items-start gap-3">
								<div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-[var(--brand-navy)]">
									<MapPin size={16} />
								</div>
								<div>
									<p className="font-semibold text-slate-900">{details.venue_name}</p>
									<p className="text-slate-500 text-xs">{details.address}</p>
									{details.google_maps_link && (
										<a
											href={details.google_maps_link}
											target="_blank"
											rel="noopener noreferrer"
											className="mt-1 inline-flex items-center gap-1 font-bold text-[var(--brand-pink)] hover:underline text-xs"
										>
											<span>Open Google Maps</span>
											<ExternalLink size={12} />
										</a>
									)}
								</div>
							</div>
						</div>

						{/* RSVP Action Buttons / Post-Response State */}
						<div className="mt-8 border-t border-slate-100 pt-6">
							{details.already_responded || userResponse ? (
								<div className="rounded-3xl bg-emerald-50 p-6 text-center border border-emerald-100">
									<div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
										<Check size={24} strokeWidth={3} />
									</div>
									<h3 className="mt-3 text-base font-bold text-emerald-900">
										Response Recorded
									</h3>
									<p className="mt-1 text-xs text-emerald-700 font-medium">
										You responded:{" "}
										<span className="font-bold uppercase tracking-wider">
											{userResponse || details.response_status}
										</span>
									</p>
									<p className="mt-2 text-[11px] text-slate-500">
										Thank you for letting the host know. Your RSVP status has been updated in real-time.
									</p>
								</div>
							) : (
								<div>
									<h3 className="text-center text-sm font-bold text-[var(--brand-navy)]">
										Will you be joining us?
									</h3>
									<p className="text-center text-xs text-slate-500 mt-0.5">
										Please let the host know your attendance status.
									</p>

									{error && (
										<p className="mt-3 rounded-2xl bg-red-50 p-2.5 text-center text-xs font-semibold text-red-600">
											{error}
										</p>
									)}

									<div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
										<button
											type="button"
											disabled={submitting}
											onClick={() => void handleResponse("ACCEPTED")}
											className="flex flex-col items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3 text-emerald-800 transition-all hover:bg-emerald-100 hover:shadow-xs active:scale-95 disabled:opacity-60"
										>
											<div className="flex size-9 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xs">
												<Check size={18} strokeWidth={3} />
											</div>
											<span className="mt-2 text-xs font-bold">Accept</span>
										</button>

										<button
											type="button"
											disabled={submitting}
											onClick={() => void handleResponse("MAYBE")}
											className="flex flex-col items-center justify-center rounded-2xl border border-amber-200 bg-amber-50/80 p-3 text-amber-800 transition-all hover:bg-amber-100 hover:shadow-xs active:scale-95 disabled:opacity-60"
										>
											<div className="flex size-9 items-center justify-center rounded-full bg-amber-500 text-white shadow-2xs">
												<HelpCircle size={18} />
											</div>
											<span className="mt-2 text-xs font-bold">Maybe</span>
										</button>

										<button
											type="button"
											disabled={submitting}
											onClick={() => void handleResponse("REJECTED")}
											className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/80 p-3 text-rose-800 transition-all hover:bg-rose-100 hover:shadow-xs active:scale-95 disabled:opacity-60"
										>
											<div className="flex size-9 items-center justify-center rounded-full bg-rose-500 text-white shadow-2xs">
												<X size={18} strokeWidth={3} />
											</div>
											<span className="mt-2 text-xs font-bold">Decline</span>
										</button>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>

				<p className="mt-6 text-center text-[11px] text-slate-400">
					Powered by Laverna Events Platform
				</p>
			</div>
		</div>
	)
}

export default Respond
