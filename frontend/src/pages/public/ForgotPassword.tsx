import { zodResolver } from "@hookform/resolvers/zod"
import { Mail } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import { z } from "zod"

import { getApiErrorMessage, requestPasswordReset } from "@/lib/auth"

const schema = z.object({
	email: z.string().email("Enter a valid email address."),
})
type FormData = z.infer<typeof schema>

function ForgotPassword() {
	const [message, setMessage] = useState("")
	const [serverError, setServerError] = useState("")
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<FormData>({ resolver: zodResolver(schema) })

	const onSubmit = async ({ email }: FormData) => {
		setServerError("")
		try {
			const response = await requestPasswordReset(email)
			setMessage(response.message ?? "Check your email for a reset link.")
		} catch (error) {
			setServerError(getApiErrorMessage(error))
		}
	}

	return (
		<section className="flex min-h-[calc(100vh-9rem)] items-center justify-center bg-slate-50/70 px-4 py-6 sm:px-6 md:min-h-[calc(100vh-8rem)]">
			<div className="w-full max-w-md">
				<div className="rounded-[2.5rem] border border-slate-200/80 bg-white p-7 soft-shadow-lg sm:p-9 text-center">
					<span className="rounded-full bg-pink-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[var(--brand-pink)]">
						Account Recovery
					</span>
					<h1 className="mt-4 text-2xl font-bold tracking-tight text-[var(--brand-navy)] sm:text-3xl">
						Forgot Password?
					</h1>
					<p className="mt-2 text-xs leading-5 text-slate-600">
						Enter your email address and we&apos;ll send recovery instructions.
					</p>

					<form
						onSubmit={handleSubmit(onSubmit)}
						className="mt-8 space-y-4 text-left"
						noValidate
					>
						<div>
							<label
								htmlFor="forgot-email"
								className="block text-xs font-bold text-[var(--brand-navy)]"
							>
								Email Address
							</label>
							<div className="relative mt-1.5">
								<Mail
									size={16}
									className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
								/>
								<input
									id="forgot-email"
									type="email"
									{...register("email")}
									className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
									placeholder="alex@example.com"
								/>
							</div>
							{errors.email && (
								<p className="mt-1 text-xs text-red-600">
									{errors.email.message}
								</p>
							)}
						</div>

						{serverError && (
							<p
								className="rounded-2xl bg-red-50 p-3 text-center text-xs font-semibold text-red-600"
								role="alert"
							>
								{serverError}
							</p>
						)}
						{message && (
							<p
								className="rounded-2xl bg-emerald-50 p-3 text-center text-xs font-semibold text-emerald-700"
								role="status"
							>
								{message}
							</p>
						)}

						<button
							type="submit"
							disabled={isSubmitting}
							className="mt-2 w-full rounded-full bg-[var(--brand-pink)] py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-[var(--brand-pink-dark)] active:scale-95 disabled:opacity-60"
						>
							{isSubmitting ? "Sending..." : "Send Reset Link"}
						</button>
					</form>

					<p className="mt-6 text-center text-xs text-slate-600">
						Remembered your password?{" "}
						<Link
							to="/login"
							className="font-bold text-[var(--brand-pink)] hover:underline"
						>
							Back to Sign In
						</Link>
					</p>
				</div>
			</div>
		</section>
	)
}

export default ForgotPassword