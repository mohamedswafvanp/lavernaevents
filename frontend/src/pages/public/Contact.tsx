import { zodResolver } from "@hookform/resolvers/zod"
import { Mail, MapPin, Phone, Send } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"


const contactSchema = z.object({
	name: z.string().min(2, "Please enter your name."),
	email: z.string().email("Please enter a valid email address."),
	message: z.string().min(10, "Message must be at least 10 characters."),
})

type ContactFormData = z.infer<typeof contactSchema>

const contactDetails = [
	{ label: "Email", value: "hello@lavernaevents.com", icon: Mail },
	{ label: "Phone", value: "+1 (555) 123-4567", icon: Phone },
	{
		label: "Office Address",
		value: "Fenimore St 22A, New York, NY",
		icon: MapPin,
	},
]

function Contact() {
	const [isSubmitted, setIsSubmitted] = useState(false)
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ContactFormData>({ resolver: zodResolver(contactSchema) })

	const onSubmit = (_data: ContactFormData) => {
		setIsSubmitted(true)
	}

	return (
		<section id="contact" className="min-h-screen bg-slate-50/70 pb-16">
			<div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-10 lg:px-8">
				
				{/* Top Hero Banner */}
				<div className="gradient-hero-warm relative overflow-hidden rounded-[2.5rem] p-8 text-center text-white soft-shadow-lg sm:p-12">
					<div className="pointer-events-none absolute -right-10 -top-10 size-60 rounded-full bg-white/15 blur-2xl" />
					<div className="relative z-10 mx-auto max-w-2xl">
						<span className="rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
							Get In Touch
						</span>
						<h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
							Let&apos;s Plan Something Memorable
						</h1>
						<p className="mt-4 text-sm leading-6 text-orange-100 sm:text-base sm:leading-7">
							Have questions or need dedicated event support? Our team is here for you.
						</p>
					</div>
				</div>

				{/* Form & Details Layout */}
				<div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
					{/* Message Form */}
					<div className="rounded-[2.5rem] border border-slate-200/80 bg-white p-6 soft-shadow-lg sm:p-10">
						<h2 className="text-xl font-bold text-[var(--brand-navy)] sm:text-2xl">
							Send Us a Message
						</h2>
						<p className="mt-1 text-xs text-slate-500">
							We typically respond within a few hours.
						</p>

						<form
							onSubmit={handleSubmit(onSubmit)}
							className="mt-6 space-y-4"
							noValidate
						>
							<div>
								<label
									htmlFor="name"
									className="block text-xs font-bold text-[var(--brand-navy)]"
								>
									Your Name
								</label>
								<input
									id="name"
									{...register("name")}
									className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
									placeholder="Alex Morgan"
									aria-invalid={Boolean(errors.name)}
								/>
								{errors.name && (
									<p className="mt-1 text-xs text-red-600">
										{errors.name.message}
									</p>
								)}
							</div>

							<div>
								<label
									htmlFor="email"
									className="block text-xs font-bold text-[var(--brand-navy)]"
								>
									Email Address
								</label>
								<input
									id="email"
									type="email"
									{...register("email")}
									className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
									placeholder="alex@example.com"
									aria-invalid={Boolean(errors.email)}
								/>
								{errors.email && (
									<p className="mt-1 text-xs text-red-600">
										{errors.email.message}
									</p>
								)}
							</div>

							<div>
								<label
									htmlFor="message"
									className="block text-xs font-bold text-[var(--brand-navy)]"
								>
									Event Details or Question
								</label>
								<textarea
									id="message"
									{...register("message")}
									rows={5}
									className="mt-1.5 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
									placeholder="Tell us about your upcoming event, dates, guest count..."
									aria-invalid={Boolean(errors.message)}
								/>
								{errors.message && (
									<p className="mt-1 text-xs text-red-600">
										{errors.message.message}
									</p>
								)}
							</div>

							<button
								type="submit"
								className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--brand-pink)] px-7 py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-[var(--brand-pink-dark)] active:scale-95 sm:text-sm"
							>
								<Send size={15} />
								<span>Send Message</span>
							</button>

							{isSubmitted && (
								<p
									className="mt-4 rounded-2xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700"
									role="status"
								>
									Thanks for reaching out! A coordinator will contact you shortly.
								</p>
							)}
						</form>
					</div>

					{/* Contact Details Card */}
					<div className="rounded-[2.5rem] border border-slate-200/80 bg-white p-6 soft-shadow-lg sm:p-10 flex flex-col justify-between">
						<div>
							<span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-bold text-[var(--brand-pink)]">
								Direct Channels
							</span>
							<h2 className="mt-3 text-xl font-bold text-[var(--brand-navy)] sm:text-2xl">
								Reach Our Team
							</h2>
							<p className="mt-2 text-xs leading-6 text-slate-600 sm:text-sm">
								From custom venue setups to WhatsApp invitation broadcasts, our specialists are standing by.
							</p>

							<div className="mt-8 space-y-4">
								{contactDetails.map(({ label, value, icon: Icon }) => (
									<div
										key={label}
										className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
									>
										<div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[var(--brand-pink)] shadow-2xs">
											<Icon aria-hidden="true" size={20} />
										</div>
										<div>
											<p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
												{label}
											</p>
											<p className="mt-0.5 text-xs font-bold text-slate-800 sm:text-sm">
												{value}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>

						<div className="mt-8 rounded-2xl bg-pink-50/60 p-4 border border-pink-100/60 text-xs text-slate-700">
							<p className="font-bold text-[var(--brand-navy)]">
								Planning a high-capacity event?
							</p>
							<p className="mt-1 text-[11px] text-slate-600">
								Ask about our Enterprise VIP package with on-site coordinator staff and photographer portal support.
							</p>
						</div>
					</div>
				</div>

			</div>
		</section>
	)
}

export default Contact
