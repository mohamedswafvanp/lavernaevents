import { CalendarPlus, LayoutDashboard, LogOut, Search, Settings, Users, X } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { Card, CardContent } from "@/components/ui/card"
import { clearDemoSession, getDemoSession, saveDemoSession, type DemoEvent } from "@/lib/demo"

function DemoPortal() {
	const navigate = useNavigate()
	const session = getDemoSession()
	const [events, setEvents] = useState<DemoEvent[]>(session?.events ?? [])
	const [isCreateOpen, setIsCreateOpen] = useState(false)
	const [search, setSearch] = useState("")
	const [eventForm, setEventForm] = useState({ name: "", type: "Wedding", date: "", guests: "" })
	const visibleEvents = events.filter((event) => event.name.toLowerCase().includes(search.toLowerCase()))

	if (!session) {
		return (
			<section className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-slate-50 px-5">
				<div className="text-center"><h1 className="text-3xl font-bold text-[var(--brand-navy)]">Your demo portal is waiting</h1><p className="mt-3 text-slate-600">Complete the demo onboarding flow to enter the portal.</p><button type="button" onClick={() => navigate("/demo-onboarding")} className="mt-6 rounded-md bg-[var(--brand-pink)] px-5 py-3 text-sm font-semibold text-white">Start demo</button></div>
			</section>
		)
	}

	const createEvent = () => {
		if (!eventForm.name || !eventForm.date || !eventForm.guests) return
		if (events.length >= session.plan.eventLimit) return
		const nextEvent: DemoEvent = { id: Date.now(), name: eventForm.name, type: eventForm.type, date: eventForm.date, guests: Number(eventForm.guests) }
		const nextEvents = [...events, nextEvent]
		setEvents(nextEvents)
		saveDemoSession({ ...session, events: nextEvents })
		setEventForm({ name: "", type: "Wedding", date: "", guests: "" })
		setIsCreateOpen(false)
	}

	return (
		<section className="min-h-[calc(100vh-5rem)] bg-slate-50/70">
			<div className="mx-auto flex max-w-[1440px]">
				<aside className="hidden min-h-[calc(100vh-5rem)] w-64 shrink-0 border-r border-slate-200 bg-white p-6 lg:block">
					<div className="text-lg font-bold tracking-[0.16em] text-[var(--brand-navy)]">LAVERNA <span className="text-[var(--brand-pink)]">EVENTS</span></div>
					<nav className="mt-12 space-y-2"><button type="button" className="flex w-full items-center gap-3 rounded-md bg-pink-50 px-4 py-3 text-left text-sm font-semibold text-[var(--brand-pink)]"><LayoutDashboard size={18} /> Overview</button><button type="button" className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-left text-sm text-slate-600 hover:bg-slate-50"><Users size={18} /> Guests</button><button type="button" className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-left text-sm text-slate-600 hover:bg-slate-50"><Settings size={18} /> Settings</button></nav>
					<button type="button" onClick={() => { clearDemoSession(); navigate("/demo-onboarding") }} className="mt-[calc(100vh-22rem)] flex items-center gap-3 px-4 py-3 text-sm text-slate-500 hover:text-red-600"><LogOut size={18} /> Exit demo</button>
				</aside>
				<main className="w-full p-5 sm:p-8 lg:p-12">
					<div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand-pink)]">Organizer portal</p><h1 className="mt-3 text-3xl font-bold text-[var(--brand-navy)] sm:text-4xl">Good morning, {session.name.split(" ")[0]}</h1><p className="mt-2 text-slate-600">Your events, guests, and memories in one place.</p></div><button type="button" onClick={() => setIsCreateOpen(true)} disabled={events.length >= session.plan.eventLimit} className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--brand-pink)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--brand-pink-dark)] disabled:cursor-not-allowed disabled:opacity-50"><CalendarPlus size={18} /> Create event</button></div>
					<div className="mt-10 grid gap-5 sm:grid-cols-3"><Card><CardContent className="p-6"><p className="text-sm text-slate-500">Current plan</p><p className="mt-2 text-2xl font-bold text-[var(--brand-navy)]">{session.plan.name}</p><p className="mt-1 text-xs text-emerald-700">Active and paid</p></CardContent></Card><Card><CardContent className="p-6"><p className="text-sm text-slate-500">Events</p><p className="mt-2 text-2xl font-bold text-[var(--brand-navy)]">{events.length} <span className="text-base font-normal text-slate-500">/ {session.plan.eventLimit}</span></p><div className="mt-3 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-[var(--brand-pink)]" style={{ width: `${Math.min((events.length / session.plan.eventLimit) * 100, 100)}%` }} /></div></CardContent></Card><Card><CardContent className="p-6"><p className="text-sm text-slate-500">Guest capacity</p><p className="mt-2 text-2xl font-bold text-[var(--brand-navy)]">{session.plan.guestLimit}</p><p className="mt-1 text-xs text-slate-500">per event</p></CardContent></Card></div>
					<div className="mt-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><h2 className="text-xl font-bold text-[var(--brand-navy)]">Your events</h2><label className="relative"><Search size={17} className="absolute left-3 top-3 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="rounded-md border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[var(--brand-pink)]" placeholder="Search events" /></label></div>
					{visibleEvents.length === 0 ? <Card className="mt-5"><CardContent className="p-10 text-center"><CalendarPlus className="mx-auto text-slate-300" size={32} /><h3 className="mt-4 font-semibold text-[var(--brand-navy)]">No events yet</h3><p className="mt-2 text-sm text-slate-600">Create your first event to start managing your celebration.</p></CardContent></Card> : <div className="mt-5 grid gap-5 md:grid-cols-2">{visibleEvents.map((event) => <Card key={event.id}><CardContent className="p-6"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-pink)]">{event.type}</p><h3 className="mt-2 text-lg font-semibold text-[var(--brand-navy)]">{event.name}</h3></div><button type="button" aria-label={`Manage ${event.name}`} className="rounded-md p-2 text-slate-400 hover:bg-slate-50 hover:text-[var(--brand-navy)]"><Settings size={18} /></button></div><div className="mt-6 flex justify-between text-sm text-slate-500"><span>{new Date(event.date).toLocaleDateString()}</span><span>{event.guests} / {session.plan.guestLimit} guests</span></div></CardContent></Card>)}</div>}
				</main>
			</div>

			{isCreateOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--brand-navy)]/40 p-5"><Card className="w-full max-w-lg"><CardContent className="p-7"><div className="flex items-center justify-between"><h2 className="text-2xl font-bold text-[var(--brand-navy)]">Create an event</h2><button type="button" aria-label="Close dialog" onClick={() => setIsCreateOpen(false)} className="rounded-md p-2 text-slate-400 hover:bg-slate-50"><X size={20} /></button></div><div className="mt-7 space-y-5"><label className="block text-sm font-semibold text-[var(--brand-navy)]">Event name<input value={eventForm.name} onChange={(event) => setEventForm({ ...eventForm, name: event.target.value })} className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[var(--brand-pink)]" placeholder="Maya & Jordan's wedding" /></label><div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold text-[var(--brand-navy)]">Event type<select value={eventForm.type} onChange={(event) => setEventForm({ ...eventForm, type: event.target.value })} className="mt-2 w-full rounded-md border border-slate-300 bg-white px-4 py-3 font-normal"><option>Wedding</option><option>Birthday</option><option>Corporate</option><option>Community</option></select></label><label className="text-sm font-semibold text-[var(--brand-navy)]">Date<input type="date" value={eventForm.date} onChange={(event) => setEventForm({ ...eventForm, date: event.target.value })} className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 font-normal" /></label></div><label className="block text-sm font-semibold text-[var(--brand-navy)]">Guest count<input type="number" min="1" max={session.plan.guestLimit} value={eventForm.guests} onChange={(event) => setEventForm({ ...eventForm, guests: event.target.value })} className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 font-normal" placeholder={`Up to ${session.plan.guestLimit}`} /></label><button type="button" onClick={createEvent} className="w-full rounded-md bg-[var(--brand-pink)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--brand-pink-dark)]">Save event</button></div></CardContent></Card></div>}
		</section>
	)
}

export default DemoPortal