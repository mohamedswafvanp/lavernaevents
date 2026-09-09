import {
	Calendar,
	CheckCircle2,
	ChevronLeft,
	Clock,
	Download,
	Edit,
	Image as ImageIcon,
	LoaderCircle,
	MapPin,
	MessageCircle,
	PieChart as PieChartIcon,
	Plus,
	RefreshCw,
	Search,
	Settings,
	Sparkles,
	Trash2,
	Upload,
	Users,
	X,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
	Bar,
	BarChart,
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts"

import Pagination from "@/components/common/Pagination"
import type { ApiPagination } from "@/lib/api"
import { parseApiError } from "@/lib/api"
import {
	getEventDashboardCharts,
	getEventDashboardStats,
	type EventChartsData,
	type EventDashboardStats,
} from "@/lib/dashboard"
import {
	getEventDetails,
	updateEvent,
	type EventItem,
} from "@/lib/events"
import {
	addGuest,
	deleteGuest,
	exportGuestsCSV,
	getEventGuests,
	importGuestsCSV,
	updateGuest,
	type CSVImportResult,
	type GuestItem,
	type InvitationStatus,
	type ResponseStatus,
} from "@/lib/guests"
import {
	generateInvitation,
	getEventInvitations,
	getPlanTemplates,
	type EventInvitationItem,
	type InvitationTemplateItem,
} from "@/lib/invitations"
import {
	markWhatsAppSent,
	retryWhatsAppSend,
	sendWhatsAppInvitation,
	getEventWhatsAppLogs,
	type WhatsAppLogItem,
} from "@/lib/whatsapp"

const RESPONSE_COLORS = {
	Accepted: "#10b981",
	Rejected: "#f43f5e",
	Maybe: "#f59e0b",
	Pending: "#94a3b8",
}

const INVITATION_COLORS = {
	Sent: "#0ea5e9",
	"Not Sent": "#94a3b8",
	Failed: "#ef4444",
}

export default function EventDetailView() {
	const { id } = useParams<{ id: string }>()
	const eventId = id || ""

	const [event, setEvent] = useState<EventItem | null>(null)
	const [activeTab, setActiveTab] = useState<"dashboard" | "guests" | "invitations" | "settings">("dashboard")
	const [loading, setLoading] = useState(true)

	// Dashboard State
	const [dashboardStats, setDashboardStats] = useState<EventDashboardStats | null>(null)
	const [dashboardCharts, setDashboardCharts] = useState<EventChartsData | null>(null)

	// Guests State
	const [guests, setGuests] = useState<GuestItem[]>([])
	const [guestPagination, setGuestPagination] = useState<ApiPagination | null>(null)
	const [guestPage, setGuestPage] = useState(1)
	const [guestSearch, setGuestSearch] = useState("")
	const [responseFilter, setResponseFilter] = useState<ResponseStatus | "">("")
	const [invitationFilter, setInvitationFilter] = useState<InvitationStatus | "">("")
	const [isAddGuestOpen, setIsAddGuestOpen] = useState(false)
	const [isCSVImportOpen, setIsCSVImportOpen] = useState(false)
	const [csvResult, setCsvResult] = useState<CSVImportResult | null>(null)
	const [guestForm, setGuestForm] = useState({
		name: "",
		mobile_number: "",
		email: "",
		family_member_count: 0,
		notes: "",
	})
	const [editingGuest, setEditingGuest] = useState<GuestItem | null>(null)

	// Invitations State
	const [templates, setTemplates] = useState<InvitationTemplateItem[]>([])
	const [invitations, setInvitations] = useState<EventInvitationItem[]>([])
	const [isGenerateOpen, setIsGenerateOpen] = useState(false)
	const [selectedGuestId, setSelectedGuestId] = useState<number | "">("")
	const [selectedTemplateId, setSelectedTemplateId] = useState<number | "">("")
	const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)
	const [whatsAppSentLogId, setWhatsAppSentLogId] = useState<number | null>(null)
	const [whatsappLogs, setWhatsappLogs] = useState<WhatsAppLogItem[]>([])

	// Edit Event State
	const [editForm, setEditForm] = useState<Partial<EventItem>>({})
	const [isEditSubmitting, setIsEditSubmitting] = useState(false)

	const loadEventData = async () => {
		if (!eventId) return
		try {
			const res = await getEventDetails(eventId)
			setEvent(res.data)
			setEditForm(res.data)
		} catch (err) {
			console.error(err)
		}
	}

	const loadDashboard = async () => {
		if (!eventId) return
		try {
			const [statsRes, chartsRes] = await Promise.all([
				getEventDashboardStats(eventId).catch(() => ({ data: null })),
				getEventDashboardCharts(eventId).catch(() => ({ data: null })),
			])
			setDashboardStats(statsRes.data)
			setDashboardCharts(chartsRes.data)
		} catch (err) {
			console.error(err)
		}
	}

	const loadGuests = async (page = 1) => {
		if (!eventId) return
		try {
			const res = await getEventGuests(eventId, {
				page,
				search: guestSearch,
				response_status: responseFilter,
				invitation_status: invitationFilter,
			})
			setGuests(res.data || [])
			setGuestPagination(res.pagination || null)
			setGuestPage(page)
		} catch (err) {
			console.error(err)
		}
	}

	const loadInvitationsAndTemplates = async () => {
		if (!eventId) return
		try {
			const [tempRes, invRes] = await Promise.all([
				getPlanTemplates().catch(() => ({ data: [] })),
				getEventInvitations(eventId).catch(() => ({ data: [] })),
			])
			setTemplates(tempRes.data || [])
			setInvitations(invRes.data || [])
			const logsRes = await getEventWhatsAppLogs(eventId).catch(() => ({ data: [] as WhatsAppLogItem[] }))
			setWhatsappLogs(logsRes.data || [])
		} catch (err) {
			console.error(err)
		}
	}

	const handleRetryWhatsApp = async (logId: number) => {
		try {
			const res = await retryWhatsAppSend(logId)
			if (res.data.wa_link) window.open(res.data.wa_link, "_blank")
			setWhatsAppSentLogId(res.data.log_id)
			void loadInvitationsAndTemplates()
		} catch (err) {
			alert(parseApiError(err))
		}
	}

	useEffect(() => {
		async function init() {
			setLoading(true)
			await loadEventData()
			await Promise.all([loadDashboard(), loadGuests(1), loadInvitationsAndTemplates()])
			setLoading(false)
		}
		void init()
	}, [eventId])

	useEffect(() => {
		if (activeTab === "dashboard") void loadDashboard()
		if (activeTab === "guests") void loadGuests(guestPage)
		if (activeTab === "invitations") void loadInvitationsAndTemplates()
	}, [activeTab, guestPage, responseFilter, invitationFilter])

	// Handlers for Guest Management
	const handleAddGuest = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!guestForm.name || !guestForm.mobile_number) return
		try {
			await addGuest(eventId, guestForm)
			setIsAddGuestOpen(false)
			setGuestForm({
				name: "",
				mobile_number: "",
				email: "",
				family_member_count: 0,
				notes: "",
			})
			void loadGuests(1)
			void loadDashboard()
		} catch (err) {
			alert(parseApiError(err))
		}
	}

	const handleUpdateGuest = async (guest: GuestItem) => {
		try {
			await updateGuest(eventId, guest.id, guest)
			setEditingGuest(null)
			void loadGuests(guestPage)
			void loadDashboard()
		} catch (err) {
			alert(parseApiError(err))
		}
	}

	const handleDeleteGuest = async (guestId: number) => {
		if (!confirm("Are you sure you want to delete this guest?")) return
		try {
			await deleteGuest(eventId, guestId)
			void loadGuests(guestPage)
			void loadDashboard()
		} catch (err) {
			alert(parseApiError(err))
		}
	}

	const handleCSVUpload = async (file: File) => {
		try {
			const res = await importGuestsCSV(eventId, file)
			setCsvResult(res.data)
			void loadGuests(1)
			void loadDashboard()
		} catch (err) {
			alert(parseApiError(err))
		}
	}

	// Handlers for Invitations & WhatsApp
	const handleGenerateInvitation = async () => {
		if (!selectedGuestId || !selectedTemplateId) return
		try {
			const res = await generateInvitation(eventId, {
				guest_id: Number(selectedGuestId),
				template_id: Number(selectedTemplateId),
			})
			setIsGenerateOpen(false)
			setPreviewImageUrl(res.data.image_file)
			void loadInvitationsAndTemplates()
			void loadGuests(guestPage)
			void loadDashboard()
		} catch (err) {
			alert(parseApiError(err))
		}
	}

	const handleSendWhatsApp = async (invitationId: number) => {
		try {
			const res = await sendWhatsAppInvitation(invitationId)
			if (res.data.wa_link) {
				window.open(res.data.wa_link, "_blank")
				setWhatsAppSentLogId(res.data.log_id)
			}
			void loadInvitationsAndTemplates()
			void loadGuests(guestPage)
		} catch (err) {
			alert(parseApiError(err))
		}
	}

	const handleMarkSent = async (logId: number) => {
		try {
			await markWhatsAppSent(logId)
			setWhatsAppSentLogId(null)
			void loadInvitationsAndTemplates()
			void loadGuests(guestPage)
			void loadDashboard()
		} catch (err) {
			alert(parseApiError(err))
		}
	}

	// Handlers for Event Settings
	const handleSaveEventSettings = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsEditSubmitting(true)
		try {
			await updateEvent(eventId, editForm)
			await loadEventData()
			alert("Event details updated successfully.")
		} catch (err) {
			alert(parseApiError(err))
		} finally {
			setIsEditSubmitting(false)
		}
	}

	if (loading) {
		return (
			<div className="flex min-h-[50vh] items-center justify-center">
				<LoaderCircle className="animate-spin text-[var(--brand-pink)]" size={36} />
			</div>
		)
	}

	if (!event) {
		return (
			<div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center">
				<p className="text-sm text-slate-600">Event not found.</p>
				<Link to="/portal/events" className="mt-3 inline-block font-bold text-[var(--brand-pink)] underline">
					Back to Events
				</Link>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			{/* Top Header Card */}
			<div className="rounded-[2.5rem] border border-slate-200/80 bg-white p-5 soft-shadow-lg sm:p-7">
				<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
					<div className="flex items-center gap-3">
						<Link
							to="/portal/events"
							className="flex size-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
							aria-label="Back to events list"
						>
							<ChevronLeft size={20} />
						</Link>

						<div>
							<div className="flex items-center gap-2">
								<span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-bold text-orange-800 uppercase">
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
							<h1 className="mt-1 text-xl font-bold tracking-tight text-[var(--brand-navy)] sm:text-2xl">
								{event.name}
							</h1>
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<button
							type="button"
							onClick={() => {
								void loadDashboard()
								void loadGuests(guestPage)
								void loadInvitationsAndTemplates()
							}}
							className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
						>
							<RefreshCw size={14} />
							<span>Refresh</span>
						</button>
					</div>
				</div>

				{/* Meta details bar */}
				<div className="mt-4 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-3.5 text-xs text-slate-600">
					<div className="flex items-center gap-1.5">
						<Calendar size={14} className="text-orange-500" />
						<span>
							{new Date(event.event_date).toLocaleDateString(undefined, {
								weekday: "short",
								month: "short",
								day: "numeric",
								year: "numeric",
							})}
						</span>
					</div>

					{event.event_time && (
						<div className="flex items-center gap-1.5">
							<Clock size={14} className="text-pink-500" />
							<span>{event.event_time}</span>
						</div>
					)}

					<div className="flex items-center gap-1.5">
						<MapPin size={14} className="text-violet-500" />
						<span>{event.venue_name}</span>
					</div>
				</div>
			</div>

			{/* Event Tabs */}
			<div className="no-scrollbar flex gap-2 overflow-x-auto border-b border-slate-200 pb-1">
				{[
					{ id: "dashboard", label: "Dashboard & Charts", icon: PieChartIcon },
					{ id: "guests", label: `Guest List (${guests.length})`, icon: Users },
					{ id: "invitations", label: `Invitations & WhatsApp (${invitations.length})`, icon: MessageCircle },
					{ id: "settings", label: "Event Settings", icon: Settings },
				].map((tab) => {
					const Icon = tab.icon
					return (
						<button
							key={tab.id}
							type="button"
							onClick={() => setActiveTab(tab.id as any)}
							className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition-all shrink-0 ${
								activeTab === tab.id
									? "bg-[var(--brand-navy)] text-white shadow-xs"
									: "bg-white text-slate-600 hover:bg-slate-100"
							}`}
						>
							<Icon size={16} />
							<span>{tab.label}</span>
						</button>
					)
				})}
			</div>

			{/* TAB 1: DASHBOARD & CHARTS (Phase 10) */}
			{activeTab === "dashboard" && (
				<div className="space-y-6">
					{/* Stat Cards */}
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						<div className="rounded-3xl border border-slate-200/80 bg-white p-5 soft-shadow">
							<p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
								Total Guests
							</p>
							<p className="mt-2 text-3xl font-bold text-[var(--brand-navy)]">
								{dashboardStats?.total_guests ?? 0}
							</p>
							<p className="mt-1 text-[11px] text-slate-500">
								Expected Attendance: <span className="font-bold text-slate-900">{dashboardStats?.expected_attendance ?? 0}</span>
							</p>
						</div>

						<div className="rounded-3xl border border-slate-200/80 bg-white p-5 soft-shadow">
							<p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
								Accepted RSVPs
							</p>
							<p className="mt-2 text-3xl font-bold text-emerald-600">
								{dashboardStats?.accepted_count ?? 0}
							</p>
							<p className="mt-1 text-[11px] text-slate-500">
								Declined: {dashboardStats?.rejected_count ?? 0} · Maybe: {dashboardStats?.maybe_count ?? 0}
							</p>
						</div>

						<div className="rounded-3xl border border-slate-200/80 bg-white p-5 soft-shadow">
							<p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
								Pending Responses
							</p>
							<p className="mt-2 text-3xl font-bold text-amber-600">
								{dashboardStats?.pending_count ?? 0}
							</p>
							<p className="mt-1 text-[11px] text-slate-500">
								Awaiting guest RSVP confirmation
							</p>
						</div>

						<div className="rounded-3xl border border-slate-200/80 bg-white p-5 soft-shadow">
							<p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
								Invitations Sent
							</p>
							<p className="mt-2 text-3xl font-bold text-[var(--brand-pink)]">
											{dashboardStats?.invitations_sent ?? 0}
							</p>
							<p className="mt-1 text-[11px] text-slate-500">
											Not Sent: {dashboardStats?.invitations_not_sent ?? 0} · Failed: {dashboardStats?.invitations_failed ?? 0}
							</p>
						</div>
					</div>

					{/* Charts Section */}
					<div className="grid gap-6 lg:grid-cols-2">
						{/* Response Breakdown Pie Chart */}
						<div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 soft-shadow-lg">
							<h3 className="text-base font-bold text-[var(--brand-navy)]">
								Guest Response Breakdown
							</h3>
							<p className="text-xs text-slate-500 mt-0.5">
								Live distribution of guest replies
							</p>

							{dashboardCharts?.response_breakdown && dashboardCharts.response_breakdown.length > 0 && dashboardStats?.total_guests ? (
								<div className="mt-4 h-64 w-full">
									<ResponsiveContainer width="100%" height="100%">
										<PieChart>
											<Pie
												data={dashboardCharts.response_breakdown}
												dataKey="value"
												nameKey="name"
												cx="50%"
												cy="50%"
												outerRadius={80}
label={({ name, percent }) =>
												`${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
											}
											>
												{dashboardCharts.response_breakdown.map((entry) => (
													<Cell
														key={entry.name}
														fill={RESPONSE_COLORS[entry.name as keyof typeof RESPONSE_COLORS] || "#94a3b8"}
													/>
												))}
											</Pie>
											<Tooltip />
											<Legend verticalAlign="bottom" />
										</PieChart>
									</ResponsiveContainer>
								</div>
							) : (
								<div className="flex h-56 items-center justify-center text-xs text-slate-400">
									No responses recorded yet.
								</div>
							)}
						</div>

						{/* Invitation Status Bar Chart */}
						<div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 soft-shadow-lg">
							<h3 className="text-base font-bold text-[var(--brand-navy)]">
								Invitation Dispatch Status
							</h3>
							<p className="text-xs text-slate-500 mt-0.5">
								WhatsApp passes delivered vs pending
							</p>

							{dashboardCharts?.invitation_breakdown && dashboardCharts.invitation_breakdown.length > 0 && dashboardStats?.total_guests ? (
								<div className="mt-4 h-64 w-full">
									<ResponsiveContainer width="100%" height="100%">
										<BarChart data={dashboardCharts.invitation_breakdown}>
											<XAxis dataKey="name" stroke="#64748b" fontSize={11} />
											<YAxis allowDecimals={false} stroke="#64748b" fontSize={11} />
											<Tooltip />
											<Bar dataKey="value" name="Invitations">
												{dashboardCharts.invitation_breakdown.map((entry) => (
													<Cell
														key={entry.name}
														fill={INVITATION_COLORS[entry.name as keyof typeof INVITATION_COLORS] || "#94a3b8"}
													/>
												))}
											</Bar>
										</BarChart>
									</ResponsiveContainer>
								</div>
							) : (
								<div className="flex h-56 items-center justify-center text-xs text-slate-400">
									No invitation activity recorded yet.
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			{/* TAB 2: GUEST MANAGEMENT (Phase 6) */}
			{activeTab === "guests" && (
				<div className="space-y-4">
					{/* Action Bar */}
					<div className="flex flex-col justify-between gap-3 rounded-[2rem] border border-slate-200/80 bg-white p-4 soft-shadow sm:flex-row sm:items-center">
						<div className="flex flex-wrap items-center gap-2">
							<div className="relative w-full sm:w-56">
								<Search
									size={15}
									className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
								/>
								<input
									value={guestSearch}
									onChange={(e) => setGuestSearch(e.target.value)}
									onKeyDown={(e) => e.key === "Enter" && void loadGuests(1)}
									className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
									placeholder="Search guest name or mobile..."
								/>
							</div>

							<select
								value={responseFilter}
								onChange={(e) => setResponseFilter(e.target.value as any)}
								className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
							>
								<option value="">All Responses</option>
								<option value="ACCEPTED">Accepted</option>
								<option value="PENDING">Pending</option>
								<option value="MAYBE">Maybe</option>
								<option value="REJECTED">Declined</option>
							</select>

							<select
								value={invitationFilter}
								onChange={(e) => setInvitationFilter(e.target.value as any)}
								className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
							>
								<option value="">All Send Statuses</option>
								<option value="SENT">Sent</option>
								<option value="NOT_SENT">Not Sent</option>
								<option value="FAILED">Failed</option>
							</select>
						</div>

						<div className="flex flex-wrap items-center gap-2">
							<button
								type="button"
								onClick={() => setIsAddGuestOpen(true)}
								className="inline-flex items-center gap-1 rounded-full bg-[var(--brand-pink)] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[var(--brand-pink-dark)]"
							>
								<Plus size={14} />
								<span>Add Guest</span>
							</button>

							<button
								type="button"
								onClick={() => setIsCSVImportOpen(true)}
								className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
							>
								<Upload size={14} />
								<span>Import CSV</span>
							</button>

							<button
								type="button"
								onClick={() => void exportGuestsCSV(eventId)}
								className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
							>
								<Download size={14} />
								<span>Export CSV</span>
							</button>
						</div>
					</div>

					{/* Guests List (responsive: cards on mobile, table on md+) */}
					<div className="space-y-3">
						{guests.length === 0 ? (
							<div className="rounded-[2rem] border border-slate-200/80 bg-white py-10 text-center soft-shadow">
								<p className="text-xs text-slate-400">
									No guests added yet. Use "Add Guest" or "Import CSV" to populate your list.
								</p>
							</div>
						) : (
							<>
								{/* Mobile Card List */}
								<div className="space-y-3 md:hidden">
									{guests.map((g) => (
										<div
											key={g.id}
											className="rounded-[1.75rem] border border-slate-200/80 bg-white p-4 soft-shadow"
										>
											<div className="flex items-start justify-between gap-2">
												<div className="min-w-0">
													<p className="text-sm font-bold text-slate-900">{g.name}</p>
													<p className="mt-0.5 text-xs text-slate-500">{g.mobile_number}</p>
												</div>

												<div className="flex shrink-0 items-center gap-1">
															{invitations.find((inv) => inv.guest === g.id) && (
																<button
																	type="button"
																	onClick={() => {
																	const invitation = invitations.find((inv) => inv.guest === g.id)
																	if (invitation) void handleSendWhatsApp(invitation.id)
																}}
																	className="rounded-full p-1.5 text-emerald-600 hover:bg-emerald-50"
																	title="Send invitation via WhatsApp"
																>
																	<MessageCircle size={15} />
																</button>
															)}
													{editingGuest?.id === g.id ? (
														<button
															type="button"
															onClick={() => void handleUpdateGuest(editingGuest)}
															className="rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-bold text-white hover:bg-emerald-700"
														>
															Save
														</button>
													) : (
														<button
															type="button"
															onClick={() => setEditingGuest(g)}
															className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
															title="Edit"
														>
															<Edit size={15} />
														</button>
													)}

													<button
														type="button"
														onClick={() => void handleDeleteGuest(g.id)}
														className="rounded-full p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
														title="Delete"
													>
														<Trash2 size={15} />
													</button>
												</div>
											</div>

											{editingGuest?.id === g.id && (
												<div className="mt-3 flex items-center gap-2">
													<label className="block text-[11px] font-bold text-slate-600">
														Family Count
													</label>
													<input
														type="number"
														min={0}
															value={editingGuest.family_member_count}
														onChange={(e) =>
															setEditingGuest({
																...editingGuest,
																family_member_count: Number(e.target.value),
															})
														}
														className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-xs"
													/>
												</div>
											)}

											<div className="mt-3 flex flex-wrap items-center gap-1.5">
												<span
													className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
														g.invitation_status === "SENT"
															? "bg-sky-100 text-sky-800"
															: g.invitation_status === "FAILED"
															? "bg-rose-100 text-rose-800"
															: "bg-slate-100 text-slate-600"
													}`}
												>
													{g.invitation_status === "SENT" ? "Marked as Sent" : g.invitation_status}
												</span>

												<span
													className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
														g.response_status === "ACCEPTED"
															? "bg-emerald-100 text-emerald-800"
															: g.response_status === "REJECTED"
															? "bg-rose-100 text-rose-800"
															: g.response_status === "MAYBE"
															? "bg-amber-100 text-amber-800"
															: "bg-slate-100 text-slate-600"
													}`}
												>
													RSVP: {g.response_status}
												</span>

												<span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
															Family: {g.family_member_count}
												</span>
											</div>
										</div>
									))}
								</div>

								{/* Desktop Table */}
								<div className="hidden overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white soft-shadow md:block">
									<div className="overflow-x-auto">
										<table className="w-full text-left text-xs">
											<thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
												<tr>
													<th className="px-5 py-3.5">Guest Name</th>
													<th className="px-5 py-3.5">Mobile</th>
													<th className="px-5 py-3.5">Family Count</th>
													<th className="px-5 py-3.5">Invite Status</th>
													<th className="px-5 py-3.5">RSVP Status</th>
													<th className="px-5 py-3.5 text-right">Actions</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-slate-100 text-slate-700">
												{guests.map((g) => (
													<tr key={g.id} className="hover:bg-slate-50/50">
														<td className="px-5 py-3 font-bold text-slate-900">
															{g.name}
														</td>
														<td className="px-5 py-3 text-slate-600">
															{g.mobile_number}
														</td>
														<td className="px-5 py-3">
															{editingGuest?.id === g.id ? (
																<input
																	type="number"
																	min={0}
																	value={editingGuest.family_member_count}
																	onChange={(e) =>
																		setEditingGuest({
																			...editingGuest,
																			family_member_count: Number(e.target.value),
																		})
																	}
																	className="w-16 rounded-lg border border-slate-300 px-2 py-1 text-xs"
																/>
															) : (
																<span>{g.family_member_count}</span>
															)}
														</td>
														<td className="px-5 py-3">
															<span
																className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
																	g.invitation_status === "SENT"
																		? "bg-sky-100 text-sky-800"
																		: g.invitation_status === "FAILED"
																		? "bg-rose-100 text-rose-800"
																		: "bg-slate-100 text-slate-600"
																}`}
															>
																{g.invitation_status === "SENT" ? "Marked as Sent" : g.invitation_status}
															</span>
														</td>
														<td className="px-5 py-3">
															<span
																className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
																	g.response_status === "ACCEPTED"
																		? "bg-emerald-100 text-emerald-800"
																		: g.response_status === "REJECTED"
																		? "bg-rose-100 text-rose-800"
																		: g.response_status === "MAYBE"
																		? "bg-amber-100 text-amber-800"
																		: "bg-slate-100 text-slate-600"
																}`}
															>
																{g.response_status}
															</span>
														</td>
														<td className="px-5 py-3 text-right">
																	{invitations.find((inv) => inv.guest === g.id) && (
																		<button
																			type="button"
																			onClick={() => {
																			const invitation = invitations.find((inv) => inv.guest === g.id)
																			if (invitation) void handleSendWhatsApp(invitation.id)
																		}}
																		className="rounded-full p-1.5 text-emerald-600 hover:bg-emerald-50 mr-1"
																			title="Send invitation via WhatsApp"
																		>
																			<MessageCircle size={14} />
																		</button>
																	)}
															{editingGuest?.id === g.id ? (
																<button
																	type="button"
																	onClick={() => void handleUpdateGuest(editingGuest)}
																	className="rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-bold text-white hover:bg-emerald-700 mr-1"
																>
																	Save
																</button>
															) : (
																<button
																	type="button"
																	onClick={() => setEditingGuest(g)}
																	className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 mr-1"
																	title="Edit"
																>
																	<Edit size={14} />
																</button>
															)}

															<button
																type="button"
																onClick={() => void handleDeleteGuest(g.id)}
																className="rounded-full p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
																title="Delete"
															>
																<Trash2 size={14} />
															</button>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</div>
							</>
						)}
					</div>

					<Pagination
						pagination={guestPagination}
						currentPage={guestPage}
						onPageChange={(p) => setGuestPage(p)}
					/>
				</div>
			)}

			{/* TAB 3: INVITATIONS & WHATSAPP (Phase 7 & 8) */}
			{activeTab === "invitations" && (
				<div className="space-y-6">
					{/* Top Actions */}
					<div className="flex flex-col justify-between gap-4 rounded-[2rem] border border-slate-200/80 bg-white p-6 soft-shadow sm:flex-row sm:items-center">
						<div>
							<h3 className="text-base font-bold text-[var(--brand-navy)]">
								Personalized Invitations
							</h3>
							<p className="text-xs text-slate-500 mt-0.5">
								Generate customized design passes and broadcast directly via WhatsApp.
							</p>
						</div>

						<button
							type="button"
							onClick={() => setIsGenerateOpen(true)}
							className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-pink)] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[var(--brand-pink-dark)]"
						>
							<Sparkles size={15} />
							<span>Generate Personalized Invite</span>
						</button>
					</div>

					{/* WhatsApp Sent Confirm Banner */}
					{whatsAppSentLogId && (
						<div className="flex items-center justify-between rounded-2xl bg-emerald-50 p-4 border border-emerald-200 text-xs text-emerald-900">
							<div className="flex items-center gap-2">
								<CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
								<span>
									WhatsApp tab opened. Did you finish sending the message to the guest?
								</span>
							</div>
							<button
								type="button"
								onClick={() => void handleMarkSent(whatsAppSentLogId)}
								className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700"
							>
								Confirm Marked as Sent
							</button>
						</div>
					)}

					{/* Generated Invitations History List */}
					<div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 soft-shadow">
						<h4 className="text-sm font-bold text-[var(--brand-navy)] mb-4">
							Invitation History ({invitations.length})
						</h4>

						{invitations.length === 0 ? (
							<p className="text-xs text-slate-400 py-6 text-center">
								No invitations generated yet. Pick a guest and template above to generate one.
							</p>
						) : (
							<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
								{invitations.map((inv) => (
									<div
										key={inv.id}
										className="flex flex-col justify-between rounded-3xl border border-slate-100 bg-slate-50 p-4"
									>
										<div>
											<div className="flex items-center justify-between">
												<span className="text-[10px] font-bold text-slate-500 uppercase">
															{inv.template_name || "Template"}
												</span>
												<span
													className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
															inv.status === "SUCCESS"
															? "bg-emerald-100 text-emerald-800"
															: "bg-amber-100 text-amber-800"
													}`}
												>
															{inv.status}
												</span>
											</div>

											<h5 className="mt-2 text-sm font-bold text-slate-900">
														{inv.guest_name}
											</h5>
											<p className="text-xs text-slate-500">Invitation history</p>

											{inv.image_file && (
												<button
													type="button"
													onClick={() => setPreviewImageUrl(inv.image_file)}
													className="mt-3 flex items-center gap-1 text-xs font-bold text-[var(--brand-pink)] hover:underline"
												>
													<ImageIcon size={14} />
													<span>Preview Invitation Pass</span>
												</button>
											)}
										</div>

										<div className="mt-4 border-t border-slate-200/60 pt-3 flex items-center justify-between gap-2">
											<button
												type="button"
												onClick={() => void handleSendWhatsApp(inv.id)}
												className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700 active:scale-95"
											>
												<MessageCircle size={14} />
												<span>Send WhatsApp</span>
											</button>

											{inv.image_file && (
												<a
													href={inv.image_file}
															download={`invitation_${inv.guest_name}.png`}
													target="_blank"
													rel="noopener noreferrer"
													className="flex size-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
													title="Download Image to attach in WhatsApp"
												>
													<Download size={14} />
												</a>
											)}
											{whatsappLogs.find((log) => log.guest === inv.guest && log.status !== "SENT") && (
												<button
													type="button"
													onClick={() => {
													const log = whatsappLogs.find((item) => item.guest === inv.guest && item.status !== "SENT")
													if (log) void handleRetryWhatsApp(log.id)
												}}
												className="flex size-8 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
												title="Retry WhatsApp send"
											>
												<RefreshCw size={14} />
											</button>
											)}
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			)}

			{/* TAB 4: EVENT SETTINGS (Phase 5) */}
			{activeTab === "settings" && (
				<div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 soft-shadow-lg sm:p-8 max-w-2xl">
					<h3 className="text-lg font-bold text-[var(--brand-navy)]">
						Edit Celebration Details
					</h3>
					<p className="text-xs text-slate-500 mt-0.5">
						Update venue, date, schedule, or publication status.
					</p>

					<form onSubmit={handleSaveEventSettings} className="mt-6 space-y-4">
						<div>
							<label className="block text-xs font-bold text-[var(--brand-navy)]">
								Event Name
							</label>
							<input
								value={editForm.name || ""}
								onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
								className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
								required
							/>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div>
								<label className="block text-xs font-bold text-[var(--brand-navy)]">
									Date
								</label>
								<input
									type="date"
									value={editForm.event_date || ""}
									onChange={(e) => setEditForm({ ...editForm, event_date: e.target.value })}
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
									value={editForm.event_time || ""}
									onChange={(e) => setEditForm({ ...editForm, event_time: e.target.value })}
									className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
								/>
							</div>
						</div>

						<div>
							<label className="block text-xs font-bold text-[var(--brand-navy)]">
								Venue Name
							</label>
							<input
								value={editForm.venue_name || ""}
								onChange={(e) => setEditForm({ ...editForm, venue_name: e.target.value })}
								className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
								required
							/>
						</div>

						<div>
							<label className="block text-xs font-bold text-[var(--brand-navy)]">
								Full Address
							</label>
							<input
								value={editForm.address || ""}
								onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
								className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
								required
							/>
						</div>

						<div>
							<label className="block text-xs font-bold text-[var(--brand-navy)]">
								Google Maps Link
							</label>
							<input
								type="url"
								value={editForm.google_maps_link || ""}
								onChange={(e) => setEditForm({ ...editForm, google_maps_link: e.target.value })}
								className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
							/>
						</div>

						<div>
							<label className="block text-xs font-bold text-[var(--brand-navy)]">
								Status
							</label>
							<select
								value={editForm.status || "DRAFT"}
								onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
								className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
							>
								<option value="DRAFT">Draft</option>
								<option value="PUBLISHED">Published</option>
								<option value="COMPLETED">Completed</option>
								<option value="CANCELLED">Cancelled</option>
							</select>
						</div>

						<button
							type="submit"
							disabled={isEditSubmitting}
							className="rounded-full bg-[var(--brand-pink)] px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[var(--brand-pink-dark)] active:scale-95 disabled:opacity-60"
						>
							{isEditSubmitting ? "Saving..." : "Save Changes"}
						</button>
					</form>
				</div>
			)}

			{/* Add Guest Modal */}
			{isAddGuestOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--brand-navy)]/50 p-4 backdrop-blur-xs">
					<div className="w-full max-w-md rounded-[2.5rem] bg-white p-6 soft-shadow-lg sm:p-8">
						<div className="flex items-center justify-between border-b border-slate-100 pb-3">
							<h3 className="text-base font-bold text-[var(--brand-navy)]">
								Add Guest
							</h3>
							<button
								type="button"
								onClick={() => setIsAddGuestOpen(false)}
								className="rounded-full p-2 text-slate-400 hover:bg-slate-100"
							>
								<X size={18} />
							</button>
						</div>

						<form onSubmit={handleAddGuest} className="mt-4 space-y-3">
							<div>
								<label className="block text-xs font-bold text-[var(--brand-navy)]">
									Full Name *
								</label>
								<input
									value={guestForm.name}
									onChange={(e) => setGuestForm({ ...guestForm, name: e.target.value })}
									className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
									placeholder="e.g. Maya Lin"
									required
								/>
							</div>

							<div>
								<label className="block text-xs font-bold text-[var(--brand-navy)]">
									Mobile Number *
								</label>
								<input
									value={guestForm.mobile_number}
									onChange={(e) =>
										setGuestForm({ ...guestForm, mobile_number: e.target.value })
									}
									className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
									placeholder="e.g. +15551234567"
									required
								/>
							</div>

							<div>
								<label className="block text-xs font-bold text-[var(--brand-navy)]">
									Email
								</label>
								<input
									type="email"
									value={guestForm.email}
									onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
									className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
									placeholder="maya@example.com"
								/>
							</div>

							<div>
								<label className="block text-xs font-bold text-[var(--brand-navy)]">
									Family Members Count
								</label>
								<input
									type="number"
									min={0}
															value={guestForm.family_member_count}
									onChange={(e) =>
										setGuestForm({
											...guestForm,
																family_member_count: Number(e.target.value),
										})
									}
									className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
								/>
							</div>

							<div className="mt-5 flex justify-end gap-2 pt-2 border-t border-slate-100">
								<button
									type="button"
									onClick={() => setIsAddGuestOpen(false)}
									className="rounded-full px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="rounded-full bg-[var(--brand-pink)] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[var(--brand-pink-dark)]"
								>
									Save Guest
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* CSV Import Modal */}
			{isCSVImportOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--brand-navy)]/50 p-4 backdrop-blur-xs">
					<div className="w-full max-w-md rounded-[2.5rem] bg-white p-6 soft-shadow-lg sm:p-8">
						<div className="flex items-center justify-between border-b border-slate-100 pb-3">
							<h3 className="text-base font-bold text-[var(--brand-navy)]">
								Bulk Import Guests via CSV
							</h3>
							<button
								type="button"
								onClick={() => {
									setIsCSVImportOpen(false)
									setCsvResult(null)
								}}
								className="rounded-full p-2 text-slate-400 hover:bg-slate-100"
							>
								<X size={18} />
							</button>
						</div>

						{csvResult ? (
							<div className="mt-4 space-y-3">
								<div className="rounded-2xl bg-emerald-50 p-4 text-xs text-emerald-900 border border-emerald-200">
									<p className="font-bold">Import Completed!</p>
									<p className="mt-1">
										Created: <span className="font-bold">{csvResult.created_count}</span> guests.
									</p>
									<p>
										Skipped: <span className="font-bold">{csvResult.skipped_count}</span> rows.
									</p>
								</div>

								{csvResult.skipped_rows?.length > 0 && (
									<div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 p-2 text-[11px] text-slate-600">
										<p className="font-bold text-slate-800 mb-1">Skipped Reasons:</p>
										{csvResult.skipped_rows.map((r, i) => (
											<p key={i}>
												Row {r.row_number} ({r.name}): {r.reason}
											</p>
										))}
									</div>
								)}

								<button
									type="button"
									onClick={() => {
										setIsCSVImportOpen(false)
										setCsvResult(null)
									}}
									className="w-full rounded-full bg-[var(--brand-pink)] py-2.5 text-xs font-bold text-white"
								>
									Done
								</button>
							</div>
						) : (
							<div className="mt-4 space-y-4">
								<p className="text-xs text-slate-600 leading-5">
											Upload a CSV file containing columns: <span className="font-mono font-bold">name, mobile_number, email, family_member_count, notes</span>.
								</p>

								<input
									type="file"
									accept=".csv"
									onChange={(e) => {
										const file = e.target.files?.[0]
										if (file) void handleCSVUpload(file)
									}}
									className="w-full text-xs text-slate-500 file:mr-3 file:rounded-full file:border-0 file:bg-pink-50 file:px-4 file:py-2.5 file:text-xs file:font-bold file:text-[var(--brand-pink)] hover:file:bg-pink-100"
								/>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Generate Invitation Modal */}
			{isGenerateOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--brand-navy)]/50 p-4 backdrop-blur-xs">
					<div className="w-full max-w-lg rounded-[2.5rem] bg-white p-6 soft-shadow-lg sm:p-8">
						<div className="flex items-center justify-between border-b border-slate-100 pb-3">
							<h3 className="text-base font-bold text-[var(--brand-navy)]">
								Generate Personalized Invitation
							</h3>
							<button
								type="button"
								onClick={() => setIsGenerateOpen(false)}
								className="rounded-full p-2 text-slate-400 hover:bg-slate-100"
							>
								<X size={18} />
							</button>
						</div>

						<div className="mt-4 space-y-4">
							<div>
								<label className="block text-xs font-bold text-[var(--brand-navy)]">
									Select Guest
								</label>
								<select
									value={selectedGuestId}
									onChange={(e) => setSelectedGuestId(Number(e.target.value))}
									className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
								>
									<option value="">-- Choose guest --</option>
									{guests.map((g) => (
										<option key={g.id} value={g.id}>
											{g.name} ({g.mobile_number})
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="block text-xs font-bold text-[var(--brand-navy)]">
									Select Invitation Design Template
								</label>
								<div className="mt-2 grid grid-cols-2 gap-3 max-h-52 overflow-y-auto">
									{templates.map((tpl) => (
										<button
											key={tpl.id}
											type="button"
											onClick={() => setSelectedTemplateId(tpl.id)}
											className={`rounded-2xl border p-3 text-left transition-all ${
												selectedTemplateId === tpl.id
													? "border-2 border-[var(--brand-pink)] bg-pink-50/50 shadow-2xs"
													: "border-slate-200 hover:bg-slate-50"
											}`}
										>
											{tpl.preview_image && (
												<img
													src={tpl.preview_image}
													alt={tpl.name}
													className="aspect-[4/3] w-full rounded-lg object-cover mb-2"
												/>
											)}
											<p className="text-xs font-bold text-slate-900">{tpl.name}</p>
											<p className="text-[10px] text-slate-500 line-clamp-1">{tpl.description}</p>
										</button>
									))}
								</div>
							</div>

							<div className="mt-5 flex justify-end gap-2 pt-2 border-t border-slate-100">
								<button
									type="button"
									onClick={() => setIsGenerateOpen(false)}
									className="rounded-full px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
								>
									Cancel
								</button>
								<button
									type="button"
									disabled={!selectedGuestId || !selectedTemplateId}
									onClick={() => void handleGenerateInvitation()}
									className="rounded-full bg-[var(--brand-pink)] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[var(--brand-pink-dark)] disabled:opacity-50"
								>
									Generate Pass
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Preview Modal */}
			{previewImageUrl && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--brand-navy)]/60 p-4 backdrop-blur-xs">
					<div className="relative max-w-md w-full rounded-[2.5rem] bg-white p-4 soft-shadow-lg text-center overflow-hidden">
						<button
							type="button"
							onClick={() => setPreviewImageUrl(null)}
							className="absolute right-4 top-4 rounded-full bg-slate-900/60 p-2 text-white hover:bg-slate-900"
						>
							<X size={18} />
						</button>
						<img
							src={previewImageUrl}
							alt="Invitation Preview"
							className="w-full rounded-2xl object-contain max-h-[75vh]"
						/>
						<a
							href={previewImageUrl}
							download="invitation_card.png"
							target="_blank"
							rel="noopener noreferrer"
							className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-pink)] px-5 py-2 text-xs font-bold text-white shadow-xs"
						>
							<Download size={14} />
							<span>Download Pass Image</span>
						</a>
					</div>
				</div>
			)}
		</div>
	)
}
