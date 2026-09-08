import {
	Calendar,
	CalendarPlus,
	LoaderCircle,
	MapPin,
	Plus,
	Search,
	Trash2,
	X,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import Pagination from "@/components/common/Pagination"
import type { ApiPagination } from "@/lib/api"
import {
	createEvent,
	deleteEvent,
	getEvents,
	type EventItem,
	type EventType,
} from "@/lib/events"
import { parseApiError } from "@/lib/api"

const eventTypeOptions: Array<{ value: EventType; label: string }> = [
	{ value: "WEDDING", label: "Wedding & Reception" },
	{ value: "BIRTHDAY", label: "Birthday Party" },
	{ value: "CORPORATE", label: "Corporate Gala / Summit" },
	{ value: "ANNIVERSARY", label: "Anniversary" },
	{ value: "COMMUNITY", label: "Community Gathering" },
	{ value: "CUSTOM", label: "Custom Occasion" },
]

export default function PortalEvents() {
	const [events, setEvents] = useState<EventItem[]>([])
	const [pagination, setPagination] = useState<ApiPagination | null>(null)
	const [currentPage, setCurrentPage] = useState(1)
	const [search, setSearch] = useState("")
	const [loading, setLoading] = useState(true)
	const [isCreateOpen, setIsCreateOpen] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [deleteTarget, setDeleteTarget] = useState<EventItem | null>(null)
	const [error, setError] = useState("")
	const [modalError, setModalError] = useState("")

	// Form State
	const [form, setForm] = useState<{
		name: string
		event_type: EventType
		custom_event_type_label: string
		event_date: string
		event_time: string
		venue_name: string
		address: string
		google_maps_link: string
		status: "DRAFT" | "PUBLISHED"
	}>({
		name: "",
		event_type: "WEDDING",
		custom_event_type_label: "",
		event_date: "",
		event_time: "18:00",
		venue_name: "",
		address: "",
		google_maps_link: "",
		status: "DRAFT",
	})
	const [coverFile, setCoverFile] = useState<File | null>(null)

	const loadEvents = async (page = 1, searchQuery = "") => {
		setLoading(true)
		setError("")
		try {
			const res = await getEvents({
				page,
				search: searchQuery,
			})
			setEvents(res.data || [])
			setPagination(res.pagination || null)
			setCurrentPage(page)
		} catch (err) {
			setError(parseApiError(err))
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		void loadEvents(1, search)
	}, [])

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault()
		void loadEvents(1, search)
	}

	const handleCreateEvent = async (e: React.FormEvent) => {
		e.preventDefault()
		setModalError("")
		if (!form.name.trim() || !form.event_date || !form.venue_name.trim() || !form.address.trim()) {
			setModalError("Please complete all required fields (Name, Date, Venue, Address).")
			return
		}
		if (form.event_type === "CUSTOM" && !form.custom_event_type_label.trim()) {
			setModalError("Please provide a custom event type label.")
			return
		}

		setIsSubmitting(true)
		try {
			const formData = new FormData()
			formData.append("name", form.name.trim())
			formData.append("event_type", form.event_type)
			if (form.event_type === "CUSTOM") {
				formData.append("custom_event_type_label", form.custom_event_type_label.trim())
			}
			formData.append("event_date", form.event_date)
			formData.append("event_time", form.event_time)
			formData.append("venue_name", form.venue_name.trim())
			formData.append("address", form.address.trim())
			if (form.google_maps_link.trim()) {
				formData.append("google_maps_link", form.google_maps_link.trim())
			}
			formData.append("status", form.status)
			if (coverFile) {
				formData.append("cover_image", coverFile)
			}

			await createEvent(formData)
			setIsCreateOpen(false)
			setForm({
				name: "",
				event_type: "WEDDING",
				custom_event_type_label: "",
				event_date: "",
				event_time: "18:00",
				venue_name: "",
				address: "",
				google_maps_link: "",
				status: "DRAFT",
			})
			setCoverFile(null)
			void loadEvents(1, search)
		} catch (err) {
			const msg = parseApiError(err)
			if (msg.includes("limit") || msg.includes("plan")) {
				setModalError(msg)
			} else {
				setModalError(msg)
			}
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleDeleteEvent = async () => {
		if (!deleteTarget) return
		try {
			await deleteEvent(deleteTarget.id)
			setDeleteTarget(null)
			void loadEvents(currentPage, search)
		} catch (err) {
			setError(parseApiError(err))
		}
	}

	return (
		<div className="space-y-6">
			{/* Top Actions Header */}
			<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-[var(--brand-navy)] sm:text-3xl">
						My Celebrations
					</h1>
					<p className="text-xs text-slate-500 mt-0.5">
						Create and manage events, invitations, and guest lists.
					</p>
				</div>

				<button
					type="button"
					onClick={() => setIsCreateOpen(true)}
					className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--brand-pink)] px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-[var(--brand-pink-dark)] active:scale-95 sm:px-6 sm:py-3 sm:text-sm"
				>
					<Plus size={16} />
					<span>Create Event</span>
				</button>
			</div>

			{/* Search Filter Bar */}
			<div className="rounded-2xl border border-slate-200/80 bg-white p-3 soft-shadow sm:p-4">
				<form onSubmit={handleSearch} className="flex gap-2">
					<div className="relative flex-1">
						<Search
							size={16}
							className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
						/>
						<input
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
							placeholder="Search by event title..."
						/>
					</div>
					<button
						type="submit"
						className="rounded-full bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800"
					>
						Search
					</button>
				</form>
			</div>

			{error && (
				<p className="rounded-2xl bg-red-50 p-3 text-center text-xs font-semibold text-red-600">
					{error}
				</p>
			)}

			{/* Events Cards Grid */}
			{loading ? (
				<div className="flex min-h-[40vh] items-center justify-center">
					<LoaderCircle className="animate-spin text-[var(--brand-pink)]" size={36} />
				</div>
			) : events.length === 0 ? (
				<div className="rounded-[2.5rem] border border-dashed border-slate-200 bg-white p-12 text-center soft-shadow">
					<CalendarPlus className="mx-auto text-slate-300" size={44} />
					<h2 className="mt-4 text-lg font-bold text-[var(--brand-navy)]">
						No events found
					</h2>
					<p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
						Start by creating your first celebration or clear your search term.
					</p>
					<button
						type="button"
						onClick={() => setIsCreateOpen(true)}
						className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-pink)] px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[var(--brand-pink-dark)]"
					>
						<Plus size={15} />
						<span>Create Event</span>
					</button>
				</div>
			) : (
				<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{events.map((event) => (
						<div
							key={event.id}
							className="group relative flex flex-col justify-between rounded-[2rem] border border-slate-200/80 bg-white soft-shadow transition-all hover:-translate-y-1 hover:shadow-lg overflow-hidden"
						>
							{event.cover_image && (
								<div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
									<img
										src={event.cover_image}
										alt={event.name}
										className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
									/>
								</div>
							)}

							<div className="p-5 flex-1 flex flex-col justify-between">
								<div>
									<div className="flex items-center justify-between gap-2">
										<span className="rounded-full bg-orange-100 px-3 py-0.5 text-[10px] font-bold text-orange-800 uppercase">
											{event.event_type}
										</span>
										<span
											className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
												event.status === "PUBLISHED"
													? "bg-emerald-100 text-emerald-800"
													: "bg-slate-100 text-slate-700"
											}`}
										>
											{event.status}
										</span>
									</div>

									<h3 className="mt-3 text-base font-bold text-[var(--brand-navy)] group-hover:text-[var(--brand-pink)] transition-colors">
										{event.name}
									</h3>

									<div className="mt-3 space-y-1.5 text-xs text-slate-600">
										<div className="flex items-center gap-1.5">
											<Calendar size={13} className="text-orange-500 shrink-0" />
											<span>
												{new Date(event.event_date).toLocaleDateString(undefined, {
													month: "short",
													day: "numeric",
													year: "numeric",
												})}{" "}
												{event.event_time && `at ${event.event_time}`}
											</span>
										</div>

										<div className="flex items-center gap-1.5">
											<MapPin size={13} className="text-violet-500 shrink-0" />
											<span className="truncate">{event.venue_name}</span>
										</div>
									</div>
								</div>

								<div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3.5">
									<Link
										to={`/portal/events/${event.id}`}
										className="rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-slate-800 active:scale-95"
									>
										Manage Event
									</Link>

									<button
										type="button"
										onClick={() => setDeleteTarget(event)}
										className="rounded-full p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
										aria-label={`Delete ${event.name}`}
									>
										<Trash2 size={16} />
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			<Pagination
				pagination={pagination}
				currentPage={currentPage}
				onPageChange={(page) => void loadEvents(page, search)}
			/>

			{/* Create Event Modal */}
			{isCreateOpen && (
				<div className="fixed inset-0 z-50 flex items-start justify-center bg-[var(--brand-navy)]/50 p-4 backdrop-blur-xs overflow-y-auto sm:items-center">
					<div className="my-8 w-full max-w-lg rounded-[2.5rem] bg-white p-6 soft-shadow-lg sm:p-8">
						<div className="flex items-center justify-between border-b border-slate-100 pb-3">
							<div>
								<span className="text-[10px] font-bold text-[var(--brand-pink)] uppercase tracking-wider">
									Event Builder
								</span>
								<h2 className="text-xl font-bold text-[var(--brand-navy)] sm:text-2xl">
									Create New Event
								</h2>
							</div>
							<button
								type="button"
								onClick={() => setIsCreateOpen(false)}
								className="rounded-full p-2 text-slate-400 hover:bg-slate-100"
							>
								<X size={20} />
							</button>
						</div>

						{modalError && (
							<div className="mt-4 rounded-2xl bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-200">
								{modalError}
								{modalError.includes("limit") && (
									<Link
										to="/pricing"
										className="block mt-1.5 font-bold text-[var(--brand-pink)] underline"
									>
										Upgrade your membership plan
									</Link>
								)}
							</div>
						)}

						<form onSubmit={handleCreateEvent} className="mt-5 space-y-3.5">
							<div>
								<label className="block text-xs font-bold text-[var(--brand-navy)]">
									Event Name *
								</label>
								<input
									value={form.name}
									onChange={(e) => setForm({ ...form, name: e.target.value })}
									className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
									placeholder="e.g. Maya & Jordan's Sunset Wedding"
									required
								/>
							</div>

							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
								<div>
									<label className="block text-xs font-bold text-[var(--brand-navy)]">
										Event Type *
									</label>
									<select
										value={form.event_type}
										onChange={(e) =>
											setForm({ ...form, event_type: e.target.value as EventType })
										}
										className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
									>
										{eventTypeOptions.map((opt) => (
											<option key={opt.value} value={opt.value}>
												{opt.label}
											</option>
										))}
									</select>
								</div>

								{form.event_type === "CUSTOM" ? (
									<div>
										<label className="block text-xs font-bold text-[var(--brand-navy)]">
											Custom Label *
										</label>
										<input
											value={form.custom_event_type_label}
											onChange={(e) =>
												setForm({ ...form, custom_event_type_label: e.target.value })
											}
											className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
											placeholder="e.g. Gala & Awards"
											required
										/>
									</div>
								) : (
									<div>
										<label className="block text-xs font-bold text-[var(--brand-navy)]">
											Status
										</label>
										<select
											value={form.status}
											onChange={(e) =>
												setForm({ ...form, status: e.target.value as "DRAFT" | "PUBLISHED" })
											}
											className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
										>
											<option value="DRAFT">Draft</option>
											<option value="PUBLISHED">Published</option>
										</select>
									</div>
								)}
							</div>

							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
								<div>
									<label className="block text-xs font-bold text-[var(--brand-navy)]">
										Date *
									</label>
									<input
										type="date"
										value={form.event_date}
										onChange={(e) => setForm({ ...form, event_date: e.target.value })}
										className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
										required
									/>
								</div>

								<div>
									<label className="block text-xs font-bold text-[var(--brand-navy)]">
										Time
									</label>
									<input
										type="time"
										value={form.event_time}
										onChange={(e) => setForm({ ...form, event_time: e.target.value })}
										className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
									/>
								</div>
							</div>

							<div>
								<label className="block text-xs font-bold text-[var(--brand-navy)]">
									Venue Name *
								</label>
								<input
									value={form.venue_name}
									onChange={(e) => setForm({ ...form, venue_name: e.target.value })}
									className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
									placeholder="e.g. Grand Plaza Pavilion"
									required
								/>
							</div>

							<div>
								<label className="block text-xs font-bold text-[var(--brand-navy)]">
									Full Address *
								</label>
								<input
									value={form.address}
									onChange={(e) => setForm({ ...form, address: e.target.value })}
									className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
									placeholder="e.g. 123 Celebration Ave, New York, NY"
									required
								/>
							</div>

							<div>
								<label className="block text-xs font-bold text-[var(--brand-navy)]">
									Google Maps Link
								</label>
								<input
									type="url"
									value={form.google_maps_link}
									onChange={(e) =>
										setForm({ ...form, google_maps_link: e.target.value })
									}
									className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
									placeholder="https://maps.google.com/..."
								/>
							</div>

							<div>
								<label className="block text-xs font-bold text-[var(--brand-navy)]">
									Cover Image
								</label>
								<input
									type="file"
									accept="image/*"
									onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
									className="mt-1 w-full text-xs text-slate-500 file:mr-3 file:rounded-full file:border-0 file:bg-pink-50 file:px-4 file:py-2 file:text-xs file:font-bold file:text-[var(--brand-pink)] hover:file:bg-pink-100"
								/>
							</div>

							<div className="mt-5 flex justify-end gap-2 pt-2 border-t border-slate-100">
								<button
									type="button"
									onClick={() => setIsCreateOpen(false)}
									className="rounded-full px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
								>
									Cancel
								</button>

								<button
									type="submit"
									disabled={isSubmitting}
									className="rounded-full bg-[var(--brand-pink)] px-6 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-[var(--brand-pink-dark)] active:scale-95 disabled:opacity-60"
								>
									{isSubmitting ? "Creating..." : "Create Event"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Delete Confirmation Modal */}
			{deleteTarget && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--brand-navy)]/50 p-4 backdrop-blur-xs">
					<div className="w-full max-w-sm rounded-[2rem] bg-white p-6 soft-shadow-lg text-center">
						<div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
							<Trash2 size={24} />
						</div>
						<h3 className="mt-3 text-base font-bold text-[var(--brand-navy)]">
							Delete Celebration?
						</h3>
						<p className="mt-1 text-xs text-slate-600 leading-5">
							Are you sure you want to delete <span className="font-bold">{deleteTarget.name}</span>? This will remove all associated guests and invitation logs permanently.
						</p>

						<div className="mt-6 flex justify-center gap-2">
							<button
								type="button"
								onClick={() => setDeleteTarget(null)}
								className="rounded-full px-5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
							>
								Cancel
							</button>

							<button
								type="button"
								onClick={() => void handleDeleteEvent()}
								className="rounded-full bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700"
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
