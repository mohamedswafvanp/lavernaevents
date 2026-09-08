import {
	CalendarDays,
	CalendarPlus,
	CheckCircle2,
	ChevronRight,
	Clock,
	LoaderCircle,
	Plus,
	TrendingUp,
	Users,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { getCurrentUser, getMyUsage, type UsageSummary } from "@/lib/auth"
import { getOrganizerOverview, type OrganizerOverviewStats } from "@/lib/dashboard"
import { getEvents, type EventItem } from "@/lib/events"
import { parseApiError } from "@/lib/api"

export default function PortalDashboard() {
	const user = getCurrentUser()
	const [stats, setStats] = useState<OrganizerOverviewStats | null>(null)
	const [usage, setUsage] = useState<UsageSummary | null>(null)
	const [recentEvents, setRecentEvents] = useState<EventItem[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState("")

	useEffect(() => {
		async function loadData() {
			try {
				const [overviewRes, usageRes, eventsRes] = await Promise.all([
					getOrganizerOverview().catch(() => ({
						data: {
							total_events: 0,
							total_guests: 0,
							total_accepted: 0,
							total_expected_attendance: 0,
						},
					})),
					getMyUsage().catch(() => ({ data: null })),
					getEvents({ page_size: 4 }).catch(() => ({ data: [] })),
				])
				setStats(overviewRes.data)
				setUsage(usageRes.data)
				setRecentEvents(eventsRes.data || [])
			} catch (err) {
				setError(parseApiError(err))
			} finally {
				setLoading(false)
			}
		}
		void loadData()
	}, [])

	if (loading) {
		return (
			<div className="flex min-h-[50vh] items-center justify-center">
				<LoaderCircle className="animate-spin text-[var(--brand-pink)]" size={36} />
			</div>
		)
	}

	return (
		<div className="space-y-6">
			{/* Top Warm Welcome Card */}
			<div className="gradient-hero-warm relative overflow-hidden rounded-[2rem] p-6 text-white soft-shadow-lg sm:rounded-[2.5rem] sm:p-8">
				<div className="pointer-events-none absolute -right-12 -top-12 size-60 rounded-full bg-white/15 blur-2xl" />

				<div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
					<div>
						<span className="rounded-full bg-white/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs">
							{usage?.plan_name || "Active"} Tier
						</span>
						<h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
							Welcome, {user?.full_name || "Organizer"}
						</h1>
						<p className="mt-1 text-xs text-orange-100/90 sm:text-sm">
							Here is a summary of your celebrations, guests, and attendance metrics.
						</p>
					</div>

					<Link
						to="/portal/events"
						className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-slate-900 shadow-md transition-all hover:bg-slate-100 active:scale-95 sm:px-6 sm:py-3 sm:text-sm"
					>
						<CalendarPlus size={16} />
						<span>Manage Events</span>
					</Link>
				</div>
			</div>

			{error && (
				<p className="rounded-2xl bg-red-50 p-3 text-center text-xs font-semibold text-red-600">
					{error}
				</p>
			)}

			{/* 4 Summary Stat Cards */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-3xl border border-slate-200/80 bg-white p-5 soft-shadow">
					<div className="flex items-center justify-between">
						<span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
							Total Events
						</span>
						<div className="flex size-9 items-center justify-center rounded-2xl bg-pink-50 text-[var(--brand-pink)] shadow-2xs">
							<CalendarDays size={18} />
						</div>
					</div>
					<p className="mt-3 text-3xl font-bold text-[var(--brand-navy)]">
						{stats?.total_events ?? 0}
					</p>
					<p className="mt-1 text-[11px] text-slate-500">
						Limit: {usage?.event_limit ?? "Unlimited"}
					</p>
				</div>

				<div className="rounded-3xl border border-slate-200/80 bg-white p-5 soft-shadow">
					<div className="flex items-center justify-between">
						<span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
							Total Guests
						</span>
						<div className="flex size-9 items-center justify-center rounded-2xl bg-violet-50 text-[var(--brand-navy)] shadow-2xs">
							<Users size={18} />
						</div>
					</div>
					<p className="mt-3 text-3xl font-bold text-[var(--brand-navy)]">
						{stats?.total_guests ?? 0}
					</p>
					<p className="mt-1 text-[11px] text-slate-500">
						Max {usage?.guest_limit ?? "Unlimited"} per event
					</p>
				</div>

				<div className="rounded-3xl border border-slate-200/80 bg-white p-5 soft-shadow">
					<div className="flex items-center justify-between">
						<span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
							Accepted RSVPs
						</span>
						<div className="flex size-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-2xs">
							<CheckCircle2 size={18} />
						</div>
					</div>
					<p className="mt-3 text-3xl font-bold text-emerald-700">
						{stats?.total_accepted ?? 0}
					</p>
					<p className="mt-1 text-[11px] text-slate-500">
						Confirmed attendance
					</p>
				</div>

				<div className="rounded-3xl border border-slate-200/80 bg-white p-5 soft-shadow">
					<div className="flex items-center justify-between">
						<span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
							Expected Attendance
						</span>
						<div className="flex size-9 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-2xs">
							<TrendingUp size={18} />
						</div>
					</div>
					<p className="mt-3 text-3xl font-bold text-[var(--brand-navy)]">
						{stats?.total_expected_attendance ?? 0}
					</p>
					<p className="mt-1 text-[11px] text-slate-500">
						Includes confirmed family
					</p>
				</div>
			</div>

			{/* Recent Celebrations Section */}
			<div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 soft-shadow-lg sm:p-8">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-lg font-bold text-[var(--brand-navy)] sm:text-xl">
							Recent Celebrations
						</h2>
						<p className="text-xs text-slate-500 mt-0.5">
							Click on an event to manage guests, invitations, and analytics.
						</p>
					</div>

					<Link
						to="/portal/events"
						className="text-xs font-bold text-[var(--brand-pink)] hover:underline"
					>
						View All Events
					</Link>
				</div>

				{recentEvents.length === 0 ? (
					<div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
						<CalendarPlus className="mx-auto text-slate-300" size={36} />
						<h3 className="mt-3 text-sm font-bold text-[var(--brand-navy)]">
							No events created yet
						</h3>
						<p className="mt-1 text-xs text-slate-500">
							Create your first event to start organizing guest lists and sending WhatsApp invitations.
						</p>
						<Link
							to="/portal/events"
							className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-pink)] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[var(--brand-pink-dark)]"
						>
							<Plus size={14} />
							<span>Create First Event</span>
						</Link>
					</div>
				) : (
					<div className="mt-6 grid gap-4 sm:grid-cols-2">
						{recentEvents.map((event) => (
							<Link
								key={event.id}
								to={`/portal/events/${event.id}`}
								className="group flex flex-col justify-between rounded-3xl border border-slate-100 bg-slate-50/60 p-5 transition-all hover:border-pink-200 hover:bg-white hover:shadow-md"
							>
								<div>
									<div className="flex items-center justify-between">
										<span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-bold text-orange-800 uppercase">
											{event.event_type}
										</span>
										<span className="rounded-full bg-slate-200/80 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
											{event.status}
										</span>
									</div>
									<h3 className="mt-3 text-base font-bold text-[var(--brand-navy)] group-hover:text-[var(--brand-pink)] transition-colors">
										{event.name}
									</h3>
									<p className="mt-1 text-xs text-slate-500 line-clamp-1">
										{event.venue_name}
									</p>
								</div>

								<div className="mt-4 flex items-center justify-between border-t border-slate-200/60 pt-3 text-xs text-slate-600">
									<span className="flex items-center gap-1">
										<Clock size={13} className="text-orange-500" />
										{new Date(event.event_date).toLocaleDateString()}
									</span>
									<span className="flex items-center gap-1 font-bold text-[var(--brand-pink)]">
										<span>Manage</span>
										<ChevronRight size={14} />
									</span>
								</div>
							</Link>
						))}
					</div>
				)}
			</div>
		</div>
	)
}
