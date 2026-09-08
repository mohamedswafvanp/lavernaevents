import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2, Phone, ShieldCheck } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useLocation, useNavigate } from "react-router-dom"
import { z } from "zod"

import { getApiErrorMessage, resendOtp, verifyMobile } from "@/lib/auth"

const schema = z.object({
	mobile_number: z
		.string()
		.regex(/^\d{10,15}$/, "Enter a valid 10-15 digit mobile number."),
	code: z.string().regex(/^\d{6}$/, "Enter the 6-digit verification code."),
})

type FormData = z.infer<typeof schema>

function VerifyMobile() {
	const navigate = useNavigate()
	const location = useLocation()
	const initialMobile =
		(location.state as { mobile_number?: string; mobile?: string; email?: string } | null)?.mobile_number ||
		(location.state as { mobile_number?: string; mobile?: string; email?: string } | null)?.mobile ||
		""

	const [message, setMessage] = useState("")
	const [error, setError] = useState("")
	const {
		register,
		handleSubmit,
		getValues,
		formState: { errors, isSubmitting },
	} = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			mobile_number: initialMobile,
			code: "",
		},
	})

	const onSubmit = async ({ mobile_number, code }: FormData) => {
		setError("")
		setMessage("")
		try {
			const res = await verifyMobile({ mobile_number, code })
			setMessage(res.message || "Mobile number verified successfully! You can now log in.")
			setTimeout(() => {
				navigate("/login", {
					replace: true,
					state: { message: "Account verified. Please sign in to continue." },
				})
			}, 900)
		} catch (submitError) {
			setError(getApiErrorMessage(submitError))
		}
	}

	const handleResend = async () => {
		const mobile = getValues("mobile_number")
		if (!mobile) {
			setError("Please enter your registered mobile number first.")
			return
		}
		setError("")
		setMessage("")
		try {
			const res = await resendOtp(mobile)
			setMessage(res.message || "A new 6-digit verification code was sent.")
		} catch (resendError) {
			setError(getApiErrorMessage(resendError))
		}
	}

	return (
		<section className="min-h-screen bg-slate-50/70 pb-20">
			<div className="mx-auto max-w-md px-4 pt-8 sm:px-6 sm:pt-14">
				<div className="rounded-[2.5rem] border border-slate-200/80 bg-white p-6 soft-shadow-lg sm:p-9 text-center">
					<div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-pink-50 text-[var(--brand-pink)] shadow-2xs">
						<ShieldCheck size={26} />
					</div>
					<span className="mt-4 inline-block rounded-full bg-pink-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[var(--brand-pink)]">
						Step 2: Verification
					</span>
					<h1 className="mt-3 text-2xl font-bold tracking-tight text-[var(--brand-navy)] sm:text-3xl">
						Enter 6-Digit OTP
					</h1>
					<p className="mt-2 text-xs leading-5 text-slate-600">
						We sent a verification code to your registered mobile number.
					</p>

					<form
						onSubmit={handleSubmit(onSubmit)}
						className="mt-6 space-y-4 text-left"
						noValidate
					>
						<div>
							<label
								htmlFor="verify-mobile"
								className="block text-xs font-bold text-[var(--brand-navy)]"
							>
								Mobile Number
							</label>
							<div className="relative mt-1">
								<Phone
									size={15}
									className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
								/>
								<input
									id="verify-mobile"
									type="tel"
									inputMode="numeric"
									{...register("mobile_number")}
									className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
									placeholder="10-15 digit mobile number"
								/>
							</div>
							{errors.mobile_number && (
								<p className="mt-1 text-xs text-red-600">
									{errors.mobile_number.message}
								</p>
							)}
						</div>

						<div>
							<label
								htmlFor="verify-code"
								className="block text-xs font-bold text-[var(--brand-navy)]"
							>
								6-Digit OTP Code
							</label>
							<input
								id="verify-code"
								aria-label="Verification code"
								autoComplete="one-time-code"
								inputMode="numeric"
								maxLength={6}
								{...register("code")}
								className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 text-center text-xl font-bold tracking-[0.4em] outline-none focus:border-[var(--brand-pink)] focus:bg-white"
								placeholder="000000"
							/>
							{errors.code && (
								<p className="mt-1 text-center text-xs text-red-600">
									{errors.code.message}
								</p>
							)}
						</div>

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
							className="mt-2 w-full rounded-full bg-[var(--brand-pink)] py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-[var(--brand-pink-dark)] active:scale-95 disabled:opacity-60"
						>
							{isSubmitting ? "Verifying OTP..." : "Confirm & Activate"}
						</button>
					</form>

					<div className="mt-5 border-t border-slate-100 pt-4">
						<button
							type="button"
							onClick={() => void handleResend()}
							className="text-xs font-bold text-[var(--brand-pink)] hover:underline"
						>
							Didn&apos;t receive code? Resend OTP
						</button>
					</div>
				</div>
			</div>
		</section>
	)
}

export default VerifyMobile
