export type DemoPlan = {
	name: string
	slug: string
	price: number
	guestLimit: number
	eventLimit: number
	storageLimit: number
	features: string[]
}

export type DemoEvent = {
	id: number
	name: string
	type: string
	date: string
	guests: number
}

export type DemoSession = {
	name: string
	email: string
	mobile: string
	plan: DemoPlan
	verified: boolean
	paid: boolean
	events: DemoEvent[]
}

export const demoPlans: DemoPlan[] = [
	{
		name: "Basic",
		slug: "basic",
		price: 0,
		guestLimit: 50,
		eventLimit: 1,
		storageLimit: 500,
		features: ["50 guests", "Essential templates", "500 MB storage", "QR check-in"],
	},
	{
		name: "Premium",
		slug: "premium",
		price: 49,
		guestLimit: 250,
		eventLimit: 10,
		storageLimit: 10000,
		features: ["250 guests", "All templates", "10 GB storage", "Photographer access"],
	},
	{
		name: "Enterprise",
		slug: "enterprise",
		price: 149,
		guestLimit: 1000,
		eventLimit: 50,
		storageLimit: 50000,
		features: ["1,000 guests", "Branded templates", "50 GB storage", "Advanced access"],
	},
]

const SESSION_KEY = "laverna_demo_session"

export function saveDemoSession(session: DemoSession) {
	localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function getDemoSession() {
	const value = localStorage.getItem(SESSION_KEY)
	return value ? (JSON.parse(value) as DemoSession) : null
}

export function clearDemoSession() {
	localStorage.removeItem(SESSION_KEY)
}