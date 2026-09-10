import { motion } from "framer-motion"
import {
	ArrowUpRight,
	CalendarDays,
	Camera,
	CheckCircle2,
	Download,
	MapPin,
	MessageCircle,
	MoreHorizontal,
	Phone,
	QrCode,
	Users,
	Video,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import logo from "@/assets/laverna-logo.png"
import { getAccessToken } from "@/lib/auth"

const venueCategories = [
	"All Venues",
	"Weddings",
	"Birthdays",
	"Corporate",
	"Community",
]

const venues = [
	{
		id: 1,
		title: "Harmony Grand Pavilion",
		category: "Wedding & Reception",
		categoryTag: "General & Primary Care",
		location: "Fenimore St 22A (2.3km)",
		status: "Open · Check-in active until 23:30",
		image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=900&q=80",
		capacity: "450 Guests",
		phone: "+1 (555) 234-8901",
	},
	{
		id: 2,
		title: "VitalSpring Celebration Hall",
		category: "Birthday & Anniversary",
		categoryTag: "Dental & Oral Health",
		location: "Fenimore St 22A (2.3km)",
		status: "Open · Next event tomorrow 10:00",
		image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=80",
		capacity: "200 Guests",
		phone: "+1 (555) 678-1234",
	},
	{
		id: 3,
		title: "Skyline Terrace & Lounge",
		category: "Corporate Gala",
		categoryTag: "Mental & Behavioral Health",
		location: "Grand Avenue 104 (4.1km)",
		status: "Open · Full AV & Stage setup",
		image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=900&q=80",
		capacity: "350 Guests",
		phone: "+1 (555) 890-4321",
	},
]

const eventStories = [
	{
		id: 1,
		tag: "News",
		title: "How Smart AI & WhatsApp Are Reshaping Event Invitations",
		image: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=600&q=80",
		time: "3 min read",
	},
	{
		id: 2,
		tag: "Event Recap",
		title: "A Glimpse Into Maya & Jordan's Sunset Celebration",
		image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
		time: "5 min read",
	},
	{
		id: 3,
		tag: "Gala Night",
		title: "Exclusive Annual Summit & VIP Banquet Highlights",
		image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&q=80",
		time: "4 min read",
	},
]

const quickServices = [
	{ label: "Payment", icon: Download, link: "/pricing" },
	{ label: "Invites / e-Cards", icon: Download, link: "/gallery" },
	{ label: "WhatsApp Invites", icon: MessageCircle, link: "/portal" },
	{ label: "Venues", icon: MapPin, link: "#venues" },
	{ label: "Teleconsult", icon: Video, link: "/contact" },
	{ label: "Guest RSVP", icon: Users, link: "/portal" },
]

const coreFeatures = [
	{
		title: "Create Events",
		copy: "Bring every detail of your celebration together in one seamless place.",
		icon: CalendarDays,
		tag: "Step 1",
	},
	{
		title: "Manage Guests",
		copy: "Keep your guest list, RSVPs, and real-time headcounts beautifully organized.",
		icon: Users,
		tag: "Step 2",
	},
	{
		title: "WhatsApp Invitations",
		copy: "Share personalized invitations and updates with guests in seconds.",
		icon: MessageCircle,
		tag: "Step 3",
	},
	{
		title: "AI Photo Sharing",
		copy: "Collect and auto-tag the candid moments your guests will never forget.",
		icon: Camera,
		tag: "Step 4",
	},
]

function Home() {
	const [activeCategory, setActiveCategory] = useState("All Venues")
	const [activeVenueIndex, setActiveVenueIndex] = useState(0)
	const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getAccessToken()))

	useEffect(() => {
		const updateAuthState = () => setIsAuthenticated(Boolean(getAccessToken()))
		updateAuthState()
		window.addEventListener("laverna-auth-change", updateAuthState)
		window.addEventListener("storage", updateAuthState)
		window.addEventListener("pageshow", updateAuthState)
		return () => {
			window.removeEventListener("laverna-auth-change", updateAuthState)
			window.removeEventListener("storage", updateAuthState)
			window.removeEventListener("pageshow", updateAuthState)
		}
	}, [])

	const filteredVenues =
		activeCategory === "All Venues"
			? venues
			: venues.filter((v) =>
					v.category.toLowerCase().includes(activeCategory.toLowerCase())
				)

	const currentVenue = filteredVenues[activeVenueIndex] || filteredVenues[0] || venues[0]

	return (
		<div className="min-h-screen min-w-0 bg-slate-50/70 pb-20 md:pb-12">
			{/* Main Container */}
			<div className="mx-auto w-full max-w-7xl px-3 pt-3 sm:px-6 sm:pt-8 lg:px-8">
				
				{/* Top Grid: Hero Card + Quick Services / Showcase */}
				<div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-8">
					
					{/* LEFT COLUMN: Public brand hero */}
					<motion.div
						initial={{ opacity: 0, y: 15 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4 }}
						className="flex min-w-0 flex-col gap-4"
					>
						{/* Brand-first public hero */}
						<div className="relative flex min-h-[23rem] min-w-0 w-full flex-col justify-between overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white p-4 soft-shadow-lg sm:min-h-[27rem] sm:rounded-[2.5rem] sm:p-8">
							<div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-pink-50 blur-3xl" />
							<div className="relative z-10">
								<img src={logo} alt="Laverna Events" className="h-auto w-[min(100%,22rem)] object-contain object-left" />
								<p className="mt-5 max-w-md break-words text-[clamp(1.15rem,5.5vw,1.5rem)] font-semibold leading-tight text-[var(--brand-navy)] sm:mt-6 sm:text-2xl">
									Celebrate beautifully. Connect meaningfully.
								</p>
								<p className="mt-3 max-w-md break-words text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">
									Plan events, bring guests together, and share every meaningful moment from one calm workspace.
								</p>
							</div>
								<div className="relative z-10 mt-6 flex flex-wrap gap-3">
								<Link to={isAuthenticated ? "/portal" : "/register"} className="inline-flex items-center justify-center rounded-full bg-[var(--brand-pink)] px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-[var(--brand-pink-dark)]">
									{isAuthenticated ? "Open portal" : "Start planning"}
								</Link>
								<Link to={isAuthenticated ? "/portal/account" : "/login"} className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-[var(--brand-navy)] hover:bg-slate-50">
									{isAuthenticated ? "Account" : "Sign in"}
								</Link>
							</div>
						</div>

						{/* Services / Quick Actions Grid */}
						<div className="min-w-0 rounded-[2rem] border border-slate-200/80 bg-white p-4 soft-shadow sm:rounded-3xl sm:p-6">
							<div className="flex items-center justify-between">
								<h2 className="text-sm font-bold text-[var(--brand-navy)] sm:text-base">
									Services & Quick Actions
								</h2>
								<span className="text-[11px] text-slate-400 font-medium">
									Tap to open
								</span>
							</div>

							<div className="mt-3 grid min-w-0 grid-cols-1 gap-2 min-[380px]:grid-cols-2 sm:grid-cols-3 sm:gap-2.5">
								{quickServices.map((service) => {
									const Icon = service.icon
									return (
										<Link
											key={service.label}
											to={service.link}
											className="flex min-w-0 items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-2.5 text-xs font-semibold text-slate-700 transition-all hover:border-pink-200 hover:bg-pink-50/50 hover:text-[var(--brand-pink)] active:scale-95"
										>
											<div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white text-[var(--brand-pink)] shadow-2xs">
												<Icon size={14} />
											</div>
											<span className="truncate text-[11px] sm:text-xs">{service.label}</span>
										</Link>
									)
								})}
							</div>
						</div>
					</motion.div>

					{/* RIGHT COLUMN: e-Cards, Events Feed, & Coordinator */}
					<motion.div
						initial={{ opacity: 0, y: 15 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4, delay: 0.08 }}
						className="flex min-w-0 flex-col gap-4"
					>
						{/* Section: Events & Stories Carousel */}
						<div className="rounded-[2rem] border border-slate-200/80 bg-white p-4 soft-shadow sm:rounded-3xl sm:p-6">
							<div className="flex items-center justify-between">
								<h2 className="text-sm font-bold text-[var(--brand-navy)] sm:text-base">
									Events & Recaps
								</h2>
								<Link
									to="/gallery"
									className="text-xs font-semibold text-[var(--brand-pink)] hover:underline"
								>
									View all
								</Link>
							</div>

							<div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto pb-1">
								{eventStories.map((story) => (
									<div
										key={story.id}
										className="group relative h-44 w-36 shrink-0 cursor-pointer overflow-hidden rounded-2xl shadow-xs sm:h-52 sm:w-44"
									>
										<img
											src={story.image}
											alt={story.title}
											className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
										/>
										<div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-3 flex flex-col justify-between">
											<span className="self-start rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-900 backdrop-blur-xs">
												{story.tag}
											</span>
											<div>
												<p className="text-[11px] font-semibold leading-snug text-white line-clamp-3 sm:text-xs">
													{story.title}
												</p>
												<span className="mt-1 block text-[9px] text-white/70">
													{story.time}
												</span>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Section: Digital e-Cards Showcase */}
						<div className="rounded-[2rem] border border-slate-200/80 bg-white p-4 soft-shadow sm:rounded-3xl sm:p-6">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<h2 className="text-sm font-bold text-[var(--brand-navy)] sm:text-base">
										e-Cards & Digital Passes
									</h2>
									<span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-700">
										Live
									</span>
								</div>
								<Link
									to="/portal"
									className="text-xs font-semibold text-[var(--brand-pink)] hover:underline"
								>
									Share Pass
								</Link>
							</div>

							<div className="mt-3">
								<div className="gradient-ecard-warm relative overflow-hidden rounded-2xl p-4 text-white shadow-xs sm:p-5">
									<div className="flex items-start justify-between">
										<div>
											<p className="text-[9px] font-bold tracking-widest text-orange-200 uppercase">
												Digital Invitation Pass
											</p>
											<p className="mt-0.5 text-xs font-mono font-bold tracking-wider text-white/90">
												HI1418872904-BB
											</p>
										</div>
										<QrCode size={22} className="text-white/80" />
									</div>

									<div className="mt-5 flex items-center justify-between gap-2">
										<div className="flex items-center gap-2.5 min-w-0">
											<div className="size-9 shrink-0 overflow-hidden rounded-full border-2 border-white/80 bg-white/20">
												<img
													src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
													alt="User Avatar"
													className="h-full w-full object-cover"
												/>
											</div>
											<div className="min-w-0">
												<p className="text-xs font-bold text-white leading-tight truncate sm:text-sm">
																	Your guest pass
												</p>
												<span className="text-[10px] text-orange-200 truncate block">
													Premium Member · VIP
												</span>
											</div>
										</div>
										<span className="shrink-0 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
											RSVP Confirmed
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* Section: Coordinator & Support Card */}
						<div className="rounded-[2rem] border border-slate-200/80 bg-white p-4 soft-shadow sm:rounded-3xl sm:p-6">
							<div className="flex items-center justify-between">
								<h2 className="text-sm font-bold text-[var(--brand-navy)] sm:text-base">
									Event Specialist Support
								</h2>
								<span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
									Active
								</span>
							</div>

							<div className="mt-3 rounded-2xl bg-slate-50 p-3.5 border border-slate-100 sm:p-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2.5">
										<img
											src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80"
											alt="Coordinator"
											className="size-10 rounded-full object-cover shadow-2xs"
										/>
										<div>
											<p className="text-xs font-bold text-slate-900 sm:text-sm">
												Dr. Emily Carter
											</p>
											<div className="mt-0.5 flex items-center gap-1.5">
												<span className="rounded bg-orange-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
													Video
												</span>
												<span className="text-[10px] text-slate-500">
													June 10, 2026 | 10:00 AM
												</span>
											</div>
										</div>
									</div>
									<Link
										to="/contact"
										className="rounded-full bg-slate-900 p-2 text-white shadow-2xs hover:bg-slate-800"
										aria-label="Contact specialist"
									>
										<Phone size={13} />
									</Link>
								</div>

								<div className="mt-3 space-y-1 border-t border-slate-200/70 pt-2.5 text-[11px] text-slate-600">
									<div className="flex items-center gap-2">
										<CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
										<span className="truncate">WhatsApp RSVP automation active</span>
									</div>
									<div className="flex items-center gap-2">
										<CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
										<span className="truncate">Digital pass booking option available</span>
									</div>
									<div className="flex items-center gap-2">
										<CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
										<span className="truncate">AI face-recognition gallery ready</span>
									</div>
								</div>
							</div>
						</div>
					</motion.div>
				</div>

				{/* CENTER SECTION: Venues & Celebration Spaces */}
				<section id="venues" className="mt-8">
					<div className="rounded-[2rem] border border-slate-200/80 bg-white p-4 soft-shadow-lg sm:rounded-[2.5rem] sm:p-8">
						<div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
							<div>
								<div className="flex items-center gap-2">
									<span className="rounded-full bg-pink-100 px-2.5 py-0.5 text-[10px] font-bold text-[var(--brand-pink)]">
										Venues & Partners
									</span>
									<span className="text-xs text-slate-400">Fenimore District</span>
								</div>
								<h2 className="mt-1.5 text-xl font-bold tracking-tight text-[var(--brand-navy)] sm:text-3xl">
									Featured Celebration Spaces
								</h2>
							</div>

							{/* Category Filters */}
							<div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
								{venueCategories.map((category) => (
									<button
										key={category}
										type="button"
										onClick={() => {
											setActiveCategory(category)
											setActiveVenueIndex(0)
										}}
										className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all shrink-0 ${
											activeCategory === category
												? "bg-[var(--brand-pink)] text-white shadow-xs"
												: "bg-slate-100 text-slate-600 hover:bg-slate-200"
										}`}
									>
										{category}
									</button>
								))}
							</div>
						</div>

						{/* Hero Venue Card */}
						<div className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
							<div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-3 sm:rounded-3xl sm:p-6">
								<div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl sm:rounded-2xl">
									<img
										src={currentVenue.image}
										alt={currentVenue.title}
										className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
									/>
									<span className="absolute left-3 top-3 rounded-full bg-orange-100/95 px-2.5 py-0.5 text-[10px] font-bold text-orange-800 shadow-2xs backdrop-blur-xs sm:px-3 sm:py-1 sm:text-xs">
										{currentVenue.categoryTag}
									</span>
								</div>

								<div className="mt-4">
									<div className="flex flex-wrap items-center justify-between gap-1.5">
										<h3 className="text-lg font-bold text-slate-900 sm:text-2xl">
											{currentVenue.title}
										</h3>
										<span className="text-xs font-semibold text-slate-500">
											Capacity: {currentVenue.capacity}
										</span>
									</div>

									<div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-600">
										<span className="flex items-center gap-1">
											<MapPin size={13} className="text-orange-500" />
											{currentVenue.location}
										</span>
										<span>•</span>
										<span className="flex items-center gap-1 text-emerald-600 font-medium">
											<span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
											{currentVenue.status}
										</span>
									</div>

									{/* Action Buttons */}
									<div className="mt-5 flex items-center gap-2.5">
										<Link
											to="/contact"
											className="flex items-center gap-1.5 rounded-full bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-slate-800 active:scale-95"
										>
											<ArrowUpRight size={15} />
											<span>Direction & Booking</span>
										</Link>

										<a
											href={`tel:${currentVenue.phone}`}
											className="flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-100 active:scale-95"
											aria-label="Call venue"
										>
											<Phone size={15} />
										</a>

										<button
											type="button"
											className="flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-100 active:scale-95"
											aria-label="More venue options"
										>
											<MoreHorizontal size={15} />
										</button>
									</div>
								</div>
							</div>

							{/* Venue List Selector */}
							<div className="flex flex-col gap-2.5">
								<p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
									Other Spaces ({filteredVenues.length})
								</p>
								{filteredVenues.map((venue, idx) => (
									<button
										key={venue.id}
										type="button"
										onClick={() => setActiveVenueIndex(idx)}
										className={`flex items-center gap-3 rounded-2xl border p-2.5 text-left transition-all ${
											activeVenueIndex === idx
												? "border-[var(--brand-pink)] bg-pink-50/50 shadow-2xs"
												: "border-slate-100 bg-white hover:bg-slate-50"
										}`}
									>
										<img
											src={venue.image}
											alt={venue.title}
											className="size-14 rounded-xl object-cover"
										/>
										<div className="min-w-0 flex-1">
											<span className="text-[9px] font-bold text-orange-600 uppercase">
												{venue.category}
											</span>
											<h4 className="truncate text-xs font-bold text-slate-900 sm:text-sm">
												{venue.title}
											</h4>
											<p className="truncate text-[11px] text-slate-500">
												{venue.location}
											</p>
										</div>
									</button>
								))}
							</div>
						</div>
					</div>
				</section>

				{/* SECTION: Core Features */}
				<section className="mt-8">
					<div className="text-center">
						<span className="rounded-full bg-pink-100 px-3 py-0.5 text-xs font-bold text-[var(--brand-pink)]">
							Everything In One Place
						</span>
						<h2 className="mt-2 text-2xl font-bold tracking-tight text-[var(--brand-navy)] sm:text-3xl">
							A Calmer Way to Plan Celebrations
						</h2>
						<p className="mx-auto mt-2 max-w-xl text-xs leading-5 text-slate-600 sm:text-sm">
							From initial invitations to lifelong photo memories, Laverna streamlines your entire event experience.
						</p>
					</div>

					<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{coreFeatures.map(({ title, copy, icon: Icon, tag }) => (
							<div
								key={title}
								className="group rounded-3xl border border-slate-200/80 bg-white p-5 soft-shadow transition-all hover:-translate-y-1 hover:shadow-md"
							>
								<div className="flex items-center justify-between">
									<div className="flex size-11 items-center justify-center rounded-2xl bg-pink-50 text-[var(--brand-pink)] shadow-2xs group-hover:bg-[var(--brand-pink)] group-hover:text-white transition-colors">
										<Icon size={22} />
									</div>
									<span className="text-[11px] font-bold text-slate-400">{tag}</span>
								</div>
								<h3 className="mt-4 text-base font-bold text-[var(--brand-navy)]">
									{title}
								</h3>
								<p className="mt-1.5 text-xs leading-5 text-slate-600 sm:text-sm">
									{copy}
								</p>
							</div>
						))}
					</div>
				</section>

				{/* CTA Banner */}
				<section className="mt-10 mb-4">
					<div className="gradient-hero-warm relative overflow-hidden rounded-[2rem] px-5 py-10 text-center text-white soft-shadow-lg sm:rounded-[2.5rem] sm:px-10 sm:py-14">
						<div className="relative z-10 mx-auto max-w-xl">
							<h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
								Let's Get Started
							</h2>
						</div>
					</div>
				</section>
			</div>
		</div>
	)
}

export default Home
