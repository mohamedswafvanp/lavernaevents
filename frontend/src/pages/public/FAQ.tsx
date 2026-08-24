import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion"

const questions = [
	{
		question: "What types of events does LavernaEvents support?",
		answer: "LavernaEvents supports weddings, birthdays, corporate events, community gatherings, and more. You can customize each event to fit its own style and needs.",
	},
	{
		question: "How many guests can I invite?",
		answer: "Guest limits depend on your plan, from 50 guests on Basic to unlimited guests on Enterprise. You can upgrade when your event grows.",
	},
	{
		question: "Can I send invitations through WhatsApp?",
		answer: "Yes, you can share personalized event invitations and updates with guests through WhatsApp in just a few taps.",
	},
	{
		question: "How does photo sharing work?",
		answer: "Guests and photographers can upload event photos into a shared gallery. Premium and Enterprise plans also support larger collections and photographer access.",
	},
	{
		question: "Which membership plan is right for me?",
		answer: "Basic is ideal for smaller gatherings, Premium adds expanded guest and photo limits, and Enterprise is built for larger organizations and complex events.",
	},
	{
		question: "How is my event data protected?",
		answer: "Your event information is kept private and access is limited to the people you authorize. We use secure platform practices to help protect your guest and event data.",
	},
]

function FAQ() {
	return (
		<section id="faq" className="bg-white">
			<div className="mx-auto max-w-4xl px-5 py-20 sm:px-8 lg:py-28">
				<div className="text-center">
					<p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand-pink)]">
						FAQ
					</p>
					<h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--brand-navy)] sm:text-5xl">
						Frequently asked questions
					</h1>
					<p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
						Quick answers about planning, inviting, and sharing moments with LavernaEvents.
					</p>
				</div>

				<Accordion className="mt-12 rounded-lg border border-slate-200 px-6 sm:px-8">
					{questions.map(({ question, answer }, index) => (
						<AccordionItem key={question} value={`question-${index}`}>
							<AccordionTrigger>{question}</AccordionTrigger>
							<AccordionContent>{answer}</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</div>
		</section>
	)
}

export default FAQ
