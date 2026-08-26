import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useLocation, useNavigate } from "react-router-dom"
import { z } from "zod"

import { getApiErrorMessage, resendOtp, verifyEmail } from "@/lib/auth"

const schema = z.object({ code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code.") })
type FormData = z.infer<typeof schema>

function VerifyEmail() {
	const navigate = useNavigate()
	const location = useLocation()
	const email = (location.state as { email?: string } | null)?.email ?? ""
	const [message, setMessage] = useState("")
	const [error, setError] = useState("")
	const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

	const onSubmit = async ({ code }: FormData) => {
		setError("")
		if (!email) return setError("Your email is missing. Please register again.")
		try {
			await verifyEmail({ email, code })
			setMessage("Email verified. Please log in to continue.")
			setTimeout(() => navigate("/login", { replace: true }), 800)
		} catch (submitError) {
			setError(getApiErrorMessage(submitError))
		}
	}

	const handleResend = async () => {
		setError("")
		try {
			const response = await resendOtp(email)
			setMessage(response.message ?? "A new code has been sent.")
		} catch (resendError) {
			setError(getApiErrorMessage(resendError))
		}
	}

	return (
		<section className="bg-white">
			<div className="mx-auto max-w-md px-5 py-20 sm:py-28">
				<div className="text-center"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand-pink)]">Verify your email</p><h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--brand-navy)]">Enter the code we emailed you</h1><p className="mt-4 text-sm leading-7 text-slate-600">{email ? `We sent a 6-digit code to ${email}.` : "Open this page from registration to verify your email."}</p></div>
				<form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-5" noValidate><input aria-label="Verification code" autoComplete="one-time-code" inputMode="numeric" maxLength={6} {...register("code")} className="w-full rounded-md border border-slate-300 px-4 py-4 text-center text-2xl tracking-[0.45em] outline-none focus:border-[var(--brand-pink)] focus:ring-2 focus:ring-[var(--brand-pink)]/20" placeholder="000000" />{errors.code && <p className="text-center text-sm text-red-600">{errors.code.message}</p>}{error && <p className="text-center text-sm text-red-600" role="alert">{error}</p>}{message && <p className="flex items-center justify-center gap-2 text-center text-sm font-medium text-emerald-700" role="status"><CheckCircle2 size={17} />{message}</p>}<button type="submit" disabled={isSubmitting} className="w-full rounded-md bg-[var(--brand-pink)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--brand-pink-dark)] disabled:opacity-60">{isSubmitting ? "Verifying..." : "Verify email"}</button></form>
				<button type="button" onClick={() => void handleResend()} disabled={!email} className="mx-auto mt-6 block text-sm font-semibold text-[var(--brand-pink)] hover:underline disabled:text-slate-400">Resend code</button>
			</div>
		</section>
	)
}

export default VerifyEmail