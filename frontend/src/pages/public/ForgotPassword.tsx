import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "react-router-dom"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { getApiErrorMessage, requestPasswordReset } from "@/lib/auth"

const schema = z.object({ email: z.string().email("Enter a valid email address.") })
type FormData = z.infer<typeof schema>

function ForgotPassword() {
	const [message, setMessage] = useState("")
	const [serverError, setServerError] = useState("")
	const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })
	const onSubmit = async ({ email }: FormData) => {
		setServerError("")
		try { const response = await requestPasswordReset(email); setMessage(response.message ?? "Check your email for a reset link.") } catch (error) { setServerError(getApiErrorMessage(error)) }
	}

	return <section className="bg-white"><div className="mx-auto max-w-md px-5 py-20 sm:py-28"><div className="text-center"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand-pink)]">Account recovery</p><h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--brand-navy)]">Forgot your password?</h1><p className="mt-4 text-sm leading-7 text-slate-600">Enter your account email and we&apos;ll send reset instructions.</p></div><form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-5" noValidate><label htmlFor="forgot-email" className="text-sm font-semibold text-[var(--brand-navy)]">Email<input id="forgot-email" type="email" {...register("email")} className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[var(--brand-pink)] focus:ring-2 focus:ring-[var(--brand-pink)]/20" />{errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}</label>{serverError && <p className="text-sm text-red-600" role="alert">{serverError}</p>}{message && <p className="text-sm font-medium text-emerald-700" role="status">{message}</p>}<button type="submit" disabled={isSubmitting} className="w-full rounded-md bg-[var(--brand-pink)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--brand-pink-dark)] disabled:opacity-60">{isSubmitting ? "Sending..." : "Send reset link"}</button></form><p className="mt-7 text-center text-sm text-slate-600"><Link to="/login" className="font-semibold text-[var(--brand-pink)] hover:underline">Back to login</Link></p></div></section>
}

export default ForgotPassword