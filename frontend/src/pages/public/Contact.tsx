import { zodResolver } from "@hookform/resolvers/zod"
import { Mail, MapPin, Phone } from "lucide-react"
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
	{ label: "Address", value: "123 Celebration Avenue, New York, NY", icon: MapPin },
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
		<section id="contact" className="bg-white">
			<div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
				<div className="mx-auto max-w-3xl text-center">
					<p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand-pink)]">
						Contact
					</p>
					<h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--brand-navy)] sm:text-5xl">
						Let&apos;s plan something memorable
					</h1>
					<p className="mt-6 text-base leading-8 text-slate-600 sm:text-lg">
						Have a question or need help with your next event? Our team would love to hear from you.
					</p>
				</div>

				<div className="mt-12 grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
					<div>
						<h2 className="text-2xl font-bold text-[var(--brand-navy)]">Send us a message</h2>
						<form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5" noValidate>
							<div>
								<label htmlFor="name" className="text-sm font-semibold text-[var(--brand-navy)]">
									Name
								</label>
								<input
									id="name"
									{...register("name")}
									className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[var(--brand-pink)] focus:ring-2 focus:ring-[var(--brand-pink)]/20"
									aria-invalid={Boolean(errors.name)}
								/>
								{errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
							</div>

							<div>
								<label htmlFor="email" className="text-sm font-semibold text-[var(--brand-navy)]">
									Email
								</label>
								<input
									id="email"
									type="email"
									{...register("email")}
									className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[var(--brand-pink)] focus:ring-2 focus:ring-[var(--brand-pink)]/20"
									aria-invalid={Boolean(errors.email)}
								/>
								{errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
							</div>

							<div>
								<label htmlFor="message" className="text-sm font-semibold text-[var(--brand-navy)]">
									Message
								</label>
								<textarea
									id="message"
									{...register("message")}
									rows={6}
									className="mt-2 w-full resize-y rounded-md border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[var(--brand-pink)] focus:ring-2 focus:ring-[var(--brand-pink)]/20"
									aria-invalid={Boolean(errors.message)}
								/>
								{errors.message && <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>}
							</div>

							<button
								type="submit"
								className="rounded-md bg-[var(--brand-pink)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--brand-pink-dark)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-pink)]"
							>
								Send Message
							</button>
							{isSubmitted && (
								<p className="text-sm font-medium text-emerald-700" role="status">
									Thanks for reaching out. We&apos;ll be in touch soon.
								</p>
							)}
						</form>
					</div>

					<aside className="rounded-lg bg-slate-50 p-7 sm:p-9">
						<h2 className="text-2xl font-bold text-[var(--brand-navy)]">Get in touch</h2>
						<p className="mt-3 leading-7 text-slate-600">
							From first ideas to final details, we&apos;re here to help make your event feel effortless.
						</p>
						<div className="mt-8 space-y-6">
							{contactDetails.map(({ label, value, icon: Icon }) => (
								<div key={label} className="flex items-start gap-4">
									<div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-white text-[var(--brand-pink)] shadow-sm">
										<Icon aria-hidden="true" size={20} />
									</div>
									<div>
										<p className="text-sm font-semibold text-[var(--brand-navy)]">{label}</p>
										<p className="mt-1 text-sm leading-6 text-slate-600">{value}</p>
									</div>
								</div>
							))}
						</div>
					</aside>
				</div>
			</div>
		</section>
	)
}

export default Contact
