import {
	CalendarDays,
	CalendarPlus,
	CheckCircle2,
	LayoutDashboard,
	LogOut,
	Plus,
	Search,
	Settings,
	Sparkles,
	Users,
	X,
} from "lucide-react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { getCurrentUser } from "@/lib/auth"

import {
	clearDemoSession,
	demoPlans,
	getDemoSession,
	saveDemoSession,
	type DemoEvent,
	type DemoSession,
} from "@/lib/demo"

function DemoPortal() {
	const navigate = useNavigate()
	const storedSession = getDemoSession()
	const currentUser = getCurrentUser()
	const session: DemoSession | null =
		storedSession ??
		(currentUser
			? {
					name: currentUser.full_name,
					email: currentUser.email,
					mobile: currentUser.mobile_number,
					plan: demoPlans[0],
					verified: currentUser.is_verified,
					paid: true,
					events: [
						{
							id: 1,
							name: "Maya & Jordan's Sunset Wedding",
							type: "Wedding",
							date: "2026-11-15",
							guests: 150,
						},
						{
							id: 2,
							name: "Tech Innovators Gala 2026",
							type: "Corporate",
							date: "2026-12-05",
							guests: 200,
						},
					],
				}
			: null)

	const [events, setEvents] = useState<DemoEvent[]>(
		session?.events && session.events.length > 0
			? session.events
			: [
					{
						id: 1,
						name: "Maya & Jordan's Sunset Wedding",
						type: "Wedding",
						date: "2026-11-15",
						guests: 150,
					},
					{
						id: 2,
						name: "Tech Innovators Gala 2026",
						type: "Corporate",
						date: "2026-12-05",
						guests: 200,
					},
				]
	)
	const [isCreateOpen, setIsCreateOpen] = useState(false)
	const [search, setSearch] = useState("")
	const [selectedFilter, setSelectedFilter] = useState("All")
	const [eventForm, setEventForm] = useState({
		name: "",
		type: "Wedding",
		date: "",
		guests: "",
	})

	if (!session) {
		return (
			<section className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-slate-50/80 px-4">
				<div className="max-w-md rounded-[2.5rem] border border-slate-200/80 bg-white p-8 text-center soft-shadow-lg">
					<div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-pink-50 text-[var(--brand-pink)] shadow-2xs">
						<Sparkles size={28} />
					</div>
					<h1 className="mt-5 text-2xl font-bold text-[var(--brand-navy)]">
						Organizer Portal
					</h1>
					<p className="mt-3 text-sm text-slate-600">
						Start your interactive demo onboarding to access all portal features.
					</p>
					<button
						type="button"
						onClick={() => navigate("/demo-onboarding")}
						className="mt-6 w-full rounded-full bg-[var(--brand-pink)] px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[var(--brand-pink-dark)] active:scale-95"
					>
						Launch Demo Experience
					</button>
				</div>
			</section>
		)
	}

	const createEvent = () => {
		if (!eventForm.name || !eventForm.date || !eventForm.guests) return
		if (events.length >= session.plan.eventLimit) return
		const nextEvent: DemoEvent = {
			id: Date.now(),
			name: eventForm.name,
			type: eventForm.type,
			date: eventForm.date,
			guests: Number(eventForm.guests),
		}
		const nextEvents = [...events, nextEvent]
		setEvents(nextEvents)
		saveDemoSession({ ...session, events: nextEvents })
		setEventForm({ name: "", type: "Wedding", date: "", guests: "" })
		setIsCreateOpen(false)
	}

	const visibleEvents = events
		.filter((event) =>
			event.name.toLowerCase().includes(search.toLowerCase())
		)
		.filter((event) =>
			selectedFilter === "All" ? true : event.type === selectedFilter
		)

	return (
		<section className="min-h-[calc(100vh-5rem)] bg-slate-50/70 pb-16">
			<div className="mx-auto flex max-w-[1440px]">
				{/* Desktop Sidebar */}
				<aside className="hidden min-h-[calc(100vh-5rem)] w-64 shrink-0 border-r border-slate-200/80 bg-white p-6 lg:flex lg:flex-col lg:justify-between">
					<div>
						<Link
							to="/"
							className="text-base font-bold tracking-[0.16em] text-[var(--brand-navy)]"
						>
							LAVERNA <span className="text-[var(--brand-pink)]">EVENTS</span>
						</Link>
						<nav className="mt-8 space-y-1.5">
							<button
								type="button"
								className="flex w-full items-center gap-3 rounded-2xl bg-pink-50 px-4 py-3 text-left text-xs font-semibold text-[var(--brand-pink)]"
							>
								<LayoutDashboard size={18} />
								<span>Dashboard</span>
							</button>
							<Link
								to="/gallery"
								className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-xs font-medium text-slate-600 hover:bg-slate-50"
							>
								<CalendarDays size={18} />
								<span>e-Cards & Gallery</span>
							</Link>
							<Link
								to="/pricing"
								className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-xs font-medium text-slate-600 hover:bg-slate-50"
							>
								<Users size={18} />
								<span>Plans & Limits</span>
							</Link>
							<Link
								to="/contact"
								className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-xs font-medium text-slate-600 hover:bg-slate-50"
							>
								<Settings size={18} />
								<span>Support & Specialist</span>
							</Link>
						</nav>
					</div>

					<button
						type="button"
						onClick={() => {
							clearDemoSession()
							navigate("/demo-onboarding")
						}}
						className="flex items-center gap-2 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600"
					>
						<LogOut size={16} />
						<span>Exit Demo</span>
					</button>
				</aside>

				{/* Main Portal View */}
				<main className="w-full px-4 pt-4 sm:px-6 sm:pt-8 lg:px-10">
					{/* Top Warm Hero Banner matching reference mockup */}
					<div className="gradient-hero-warm relative overflow-hidden rounded-[2.5rem] p-6 text-white soft-shadow-lg sm:p-8">
						<div className="pointer-events-none absolute -right-10 -top-10 size-60 rounded-full bg-white/15 blur-2xl" />

						<div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
							<div>
								<div className="flex items-center gap-2">
									<span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur-xs">
										{session.plan.name} Plan
									</span>
									<span className="text-xs text-orange-200">
										Active & Verified
									</span>
								</div>
								<h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
									Hello, {session.name.split(" ")[0]}
								</h1>
								<p className="mt-1 text-xs text-orange-100/90 sm:text-sm">
									Your celebrations, guests, and digital passes in one place.
								</p>
							</div>

							<button
								type="button"
								onClick={() => setIsCreateOpen(true)}
								disabled={events.length >= session.plan.eventLimit}
								className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-slate-900 shadow-md transition-all hover:bg-slate-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed sm:px-6 sm:py-3 sm:text-sm"
							>
								<CalendarPlus size={16} />
								<span>Create New Event</span>
							</button>
						</div>
					</div>

					{/* 3 Stats Cards */}
					<div className="mt-6 grid gap-4 sm:grid-cols-3">
						<div className="rounded-3xl border border-slate-200/80 bg-white p-5 soft-shadow">
							<p className="text-xs font-medium uppercase tracking-wider text-slate-400">
								Current Plan
							</p>
							<p className="mt-2 text-2xl font-bold text-[var(--brand-navy)]">
								{session.plan.name}
							</p>
							<div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
								<CheckCircle2 size={14} />
								<span>All features unlocked</span>
							</div>
						</div>

						<div className="rounded-3xl border border-slate-200/80 bg-white p-5 soft-shadow">
							<div className="flex items-center justify-between">
								<p className="text-xs font-medium uppercase tracking-wider text-slate-400">
									Active Events
								</p>
								<span className="text-xs font-bold text-slate-500">
									{events.length} / {session.plan.eventLimit}
								</span>
							</div>
							<p className="mt-2 text-2xl font-bold text-[var(--brand-navy)]">
								{events.length}
							</p>
							<div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
								<div
									className="h-full rounded-full bg-[var(--brand-pink)] transition-all"
									style={{
										width: `${Math.min(
											(events.length / session.plan.eventLimit) * 100,
											100
										)}%`,
									}}
								/>
							</div>
						</div>

						<div className="rounded-3xl border border-slate-200/80 bg-white p-5 soft-shadow">
							<p className="text-xs font-medium uppercase tracking-wider text-slate-400">
								Guest Capacity
							</p>
							<p className="mt-2 text-2xl font-bold text-[var(--brand-navy)]">
								{session.plan.guestLimit}
							</p>
							<p className="mt-2 text-xs text-slate-500">
								Max guests per event invitation
							</p>
						</div>
					</div>

					{/* Events Management Section */}
					<div className="mt-8 rounded-[2.5rem] border border-slate-200/80 bg-white p-6 soft-shadow-lg sm:p-8">
						<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
							<div>
								<h2 className="text-xl font-bold text-[var(--brand-navy)] sm:text-2xl">
									Your Celebrations ({visibleEvents.length})
								</h2>
								<p className="text-xs text-slate-500 mt-1">
									Manage RSVPs, WhatsApp passes, and venue details
								</p>
							</div>

							{/* Search and Category Filters */}
							<div className="flex flex-wrap items-center gap-2">
								<div className="relative flex-1 sm:w-64 sm:flex-none">
									<Search
										size={15}
										className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
									/>
									<input
										value={search}
										onChange={(e) => setSearch(e.target.value)}
										className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
										placeholder="Search events..."
									/>
								</div>

								<div className="no-scrollbar flex gap-1.5 overflow-x-auto">
									{["All", "Wedding", "Corporate", "Birthday"].map((filter) => (
										<button
											key={filter}
											type="button"
											onClick={() => setSelectedFilter(filter)}
											className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
												selectedFilter === filter
													? "bg-[var(--brand-navy)] text-white"
													: "bg-slate-100 text-slate-600 hover:bg-slate-200"
											}`}
										>
											{filter}
										</button>
									))}
								</div>
							</div>
						</div>

						{/* Event Cards Grid */}
						{visibleEvents.length === 0 ? (
							<div className="mt-8 rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-10 text-center">
								<CalendarPlus className="mx-auto text-slate-300" size={40} />
								<h3 className="mt-4 font-bold text-[var(--brand-navy)]">
									No celebrations found
								</h3>
								<p className="mt-1 text-xs text-slate-500">
									Create your first event or adjust your search filter.
								</p>
								<button
									type="button"
									onClick={() => setIsCreateOpen(true)}
									className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-pink)] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[var(--brand-pink-dark)]"
								>
									<Plus size={15} />
									<span>Create Event</span>
								</button>
							</div>
						) : (
							<div className="mt-6 grid gap-4 sm:grid-cols-2">
								{visibleEvents.map((event) => (
									<div
										key={event.id}
										className="group rounded-3xl border border-slate-200/80 bg-slate-50/60 p-5 soft-shadow transition-all hover:bg-white hover:shadow-md"
									>
										<div className="flex items-start justify-between">
											<div>
												<span className="rounded-full bg-orange-100 px-3 py-0.5 text-[10px] font-bold text-orange-800 uppercase">
													{event.type}
												</span>
												<h3 className="mt-2 text-base font-bold text-[var(--brand-navy)]">
													{event.name}
												</h3>
											</div>
											<button
												type="button"
												aria-label={`Settings for ${event.name}`}
												className="rounded-full p-2 text-slate-400 hover:bg-white hover:text-slate-700 shadow-2xs"
											>
												<Settings size={16} />
											</button>
										</div>

										<div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/60 pt-3 text-xs text-slate-600">
											<span className="flex items-center gap-1">
												<CalendarDays size={14} className="text-orange-500" />
												{new Date(event.date).toLocaleDateString(undefined, {
													month: "short",
													day: "numeric",
													year: "numeric",
												})}
											</span>
											<span className="flex items-center gap-1 font-semibold text-slate-800">
												<Users size={14} className="text-[var(--brand-pink)]" />
												{event.guests} / {session.plan.guestLimit} guests
											</span>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</main>
			</div>

			{/* Create Event Dialog Modal */}
			{isCreateOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--brand-navy)]/50 p-4 backdrop-blur-xs">
					<div className="w-full max-w-lg rounded-[2.5rem] bg-white p-6 soft-shadow-lg sm:p-8">
						<div className="flex items-center justify-between">
							<div>
								<span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-bold text-[var(--brand-pink)]">
									New Celebration
								</span>
								<h2 className="mt-1 text-xl font-bold text-[var(--brand-navy)] sm:text-2xl">
									Create an Event
								</h2>
							</div>
							<button
								type="button"
								aria-label="Close dialog"
								onClick={() => setIsCreateOpen(false)}
								className="rounded-full p-2 text-slate-400 hover:bg-slate-100"
							>
								<X size={20} />
							</button>
						</div>

						<div className="mt-6 space-y-4">
							<div>
								<label className="block text-xs font-bold text-[var(--brand-navy)]">
									Event Title
								</label>
								<input
									value={eventForm.name}
									onChange={(e) =>
										setEventForm({ ...eventForm, name: e.target.value })
									}
									className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-normal outline-none focus:border-[var(--brand-pink)] focus:bg-white"
									placeholder="e.g. Maya & Jordan's Wedding"
								/>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="block text-xs font-bold text-[var(--brand-navy)]">
										Event Type
									</label>
									<select
										value={eventForm.type}
										onChange={(e) =>
											setEventForm({ ...eventForm, type: e.target.value })
										}
										className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-normal outline-none focus:border-[var(--brand-pink)] focus:bg-white"
									>
										<option>Wedding</option>
										<option>Birthday</option>
										<option>Corporate</option>
										<option>Community</option>
									</select>
								</div>
								<div>
									<label className="block text-xs font-bold text-[var(--brand-navy)]">
										Date
									</label>
									<input
										type="date"
										value={eventForm.date}
										onChange={(e) =>
											setEventForm({ ...eventForm, date: e.target.value })
										}
										className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-normal outline-none focus:border-[var(--brand-pink)] focus:bg-white"
									/>
								</div>
							</div>

							<div>
								<label className="block text-xs font-bold text-[var(--brand-navy)]">
									Expected Guests (Up to {session.plan.guestLimit})
								</label>
								<input
									type="number"
									min="1"
									max={session.plan.guestLimit}
									value={eventForm.guests}
									onChange={(e) =>
										setEventForm({ ...eventForm, guests: e.target.value })
									}
									className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-normal outline-none focus:border-[var(--brand-pink)] focus:bg-white"
									placeholder="150"
								/>
							</div>

							<button
								type="button"
								onClick={createEvent}
								className="mt-4 w-full rounded-full bg-[var(--brand-pink)] py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-[var(--brand-pink-dark)] active:scale-95"
							>
								Save & Launch Celebration
							</button>
						</div>
					</div>
				</div>
			)}
		</section>
	)
}

export default DemoPortal