import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2 } from "lucide-react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useLocation, useNavigate } from "react-router-dom"
import { z } from "zod"

import { getApiErrorMessage, resendOtp, verifyEmail } from "@/lib/auth"

const schema = z
	.object({ code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code.") })
type FormData = z.infer<typeof schema>

function VerifyEmail() {
	const navigate = useNavigate()
	const location = useLocation()
	const email = (location.state as { email?: string } | null)?.email ?? ""
	const [message, setMessage] = useState("")
	const [error, setError] = useState("")
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<FormData>({ resolver: zodResolver(schema) })

	const onSubmit = async ({ code }: FormData) => {
		setError("")
		if (!email)
			return setError("Your email is missing. Please register again.")
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
		<section className="flex min-h-[calc(100vh-9rem)] items-center justify-center bg-slate-50/70 px-4 py-6 sm:px-6 md:min-h-[calc(100vh-8rem)]">
			<div className="w-full max-w-md">
				<div className="rounded-[2.5rem] border border-slate-200/80 bg-white p-7 soft-shadow-lg sm:p-9 text-center">
					<span className="rounded-full bg-pink-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[var(--brand-pink)]">
						Email Verification
					</span>
					<h1 className="mt-4 text-2xl font-bold tracking-tight text-[var(--brand-navy)] sm:text-3xl">
						Enter 6-Digit Code
					</h1>
					<p className="mt-2 text-xs leading-5 text-slate-600">
						{email
							? `We sent a 6-digit code to ${email}.`
							: "Open this page from registration to verify your email."}
					</p>

					<form
						onSubmit={handleSubmit(onSubmit)}
						className="mt-8 space-y-4"
						noValidate
					>
						<input
							aria-label="Verification code"
							autoComplete="one-time-code"
							inputMode="numeric"
							maxLength={6}
							{...register("code")}
							className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 text-center text-2xl font-bold tracking-[0.45em] outline-none focus:border-[var(--brand-pink)] focus:bg-white"
							placeholder="000000"
						/>
						{errors.code && (
							<p className="text-center text-xs text-red-600">
								{errors.code.message}
							</p>
						)}
						{error && (
							<p
								className="rounded-2xl bg-red-50 p-3 text-center text-xs font-semibold text-red-600"
								role="alert"
							>
								{error}
							</p>
						)}
						{message && (
							<p
								className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 p-3 text-center text-xs font-semibold text-emerald-700"
								role="status"
							>
								<CheckCircle2 size={16} />
								<span>{message}</span>
							</p>
						)}
						<button
							type="submit"
							disabled={isSubmitting}
							className="w-full rounded-full bg-[var(--brand-pink)] py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-[var(--brand-pink-dark)] active:scale-95 disabled:opacity-60"
						>
							{isSubmitting ? "Verifying..." : "Verify & Continue"}
						</button>
					</form>

					<button
						type="button"
						onClick={() => void handleResend()}
						disabled={!email}
						className="mt-6 text-xs font-bold text-[var(--brand-pink)] hover:underline disabled:text-slate-400"
					>
						Resend Verification Code
					</button>
				</div>
			</div>
		</section>
	)
}

export default VerifyEmail