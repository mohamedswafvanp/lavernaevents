import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion"
import { Link } from "react-router-dom"


const questions = [
	{
		question: "What types of events does Laverna Events support?",
		answer:
			"Laverna Events supports weddings, birthdays, corporate summits, galas, community gatherings, and milestone celebrations. You can customize guest limits, themes, and agendas for each event.",
	},
	{
		question: "How many guests can I invite?",
		answer:
			"Guest capacities depend on your membership tier: 50 guests on Basic, 250 guests on Premium, and up to 1,000+ guests on Enterprise. You can upgrade any time as your headcount expands.",
	},
	{
		question: "Can I send digital invitations through WhatsApp?",
		answer:
			"Yes! Laverna enables one-tap personalized WhatsApp invitation broadcasts, RSVP status tracking, and event countdown updates for your guest list.",
	},
	{
		question: "How does AI facial recognition photo sharing work?",
		answer:
			"Guests and event photographers can upload pictures to your secure event album. Our AI automatically scans faces so guests can find every photo they appeared in instantly.",
	},
	{
		question: "How do QR check-in passes work?",
		answer:
			"Each registered guest receives an individual digital pass with a unique QR code. On event day, door staff can scan passes to verify attendance in milliseconds.",
	},
	{
		question: "How is our event and guest data protected?",
		answer:
			"We prioritize privacy. All event records, photos, and guest contact numbers are encrypted in transit and at rest, accessible only by verified organizers.",
	},
]

function FAQ() {
	return (
		<section id="faq" className="min-h-screen bg-slate-50/70 pb-16">
			<div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6 sm:pt-10 lg:px-8">
				
				{/* Top Hero Banner */}
				<div className="gradient-hero-warm relative overflow-hidden rounded-[2.5rem] p-8 text-center text-white soft-shadow-lg sm:p-12">
					<div className="pointer-events-none absolute -right-10 -top-10 size-60 rounded-full bg-white/15 blur-2xl" />
					<div className="relative z-10 mx-auto max-w-2xl">
						<span className="rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
							Frequently Asked
						</span>
						<h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
							Common Questions
						</h1>
						<p className="mt-4 text-sm leading-6 text-orange-100 sm:text-base sm:leading-7">
							Quick answers regarding planning, WhatsApp invites, QR passes, and AI memory galleries.
						</p>
					</div>
				</div>

				{/* Accordion Container */}
				<div className="mt-8 rounded-[2.5rem] border border-slate-200/80 bg-white p-6 soft-shadow-lg sm:p-10">
					<Accordion className="space-y-3">
						{questions.map(({ question, answer }, index) => (
							<AccordionItem
								key={question}
								value={`question-${index}`}
								className="rounded-2xl border border-slate-100 bg-slate-50/50 px-5 py-2 transition-all hover:bg-slate-50"
							>
								<AccordionTrigger className="text-sm font-bold text-[var(--brand-navy)] hover:no-underline">
									{question}
								</AccordionTrigger>
								<AccordionContent className="text-xs leading-6 text-slate-600 sm:text-sm">
									{answer}
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>

					<div className="mt-10 rounded-2xl bg-pink-50/70 p-6 text-center border border-pink-100">
						<h3 className="font-bold text-[var(--brand-navy)]">
							Have another question?
						</h3>
						<p className="mt-1 text-xs text-slate-600">
							Our event specialists are available to answer any questions about your upcoming occasion.
						</p>
						<Link
							to="/contact"
							className="mt-4 inline-block rounded-full bg-[var(--brand-pink)] px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[var(--brand-pink-dark)] active:scale-95"
						>
							Contact Our Support
						</Link>
					</div>
				</div>

			</div>
		</section>
	)
}

export default FAQ
