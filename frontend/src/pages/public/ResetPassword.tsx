import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2, LockKeyhole } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { z } from "zod"

import { confirmPasswordReset, getApiErrorMessage } from "@/lib/auth"

const schema = z
	.object({
		new_password: z.string().min(8, "Password must be at least 8 characters."),
		new_password_confirm: z.string().min(1, "Please confirm your new password."),
	})
	.refine((data) => data.new_password === data.new_password_confirm, {
		path: ["new_password_confirm"],
		message: "Passwords do not match.",
	})

type FormData = z.infer<typeof schema>

function ResetPassword() {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const uid = searchParams.get("uid") || searchParams.get("uidb64") || ""
	const token = searchParams.get("token") || ""

	const [message, setMessage] = useState("")
	const [error, setError] = useState("")
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<FormData>({ resolver: zodResolver(schema) })

	const onSubmit = async ({ new_password, new_password_confirm }: FormData) => {
		setError("")
		setMessage("")
		if (!uid || !token) {
			setError("Invalid or expired password reset link. Please request a new one.")
			return
		}
		try {
			const res = await confirmPasswordReset({
				uid,
				token,
				new_password,
				new_password_confirm,
			})
			setMessage(res.message || "Password reset successfully. You can now log in.")
			setTimeout(() => {
				navigate("/login", {
					replace: true,
					state: { message: "Password updated successfully. Please log in." },
				})
			}, 1200)
		} catch (submitError) {
			setError(getApiErrorMessage(submitError))
		}
	}

	return (
		<section className="flex min-h-[calc(100vh-9rem)] items-center justify-center bg-slate-50/70 px-4 py-6 sm:px-6 md:min-h-[calc(100vh-8rem)]">
			<div className="w-full max-w-md">
				<div className="rounded-[2.5rem] border border-slate-200/80 bg-white p-7 soft-shadow-lg sm:p-9 text-center">
					<span className="rounded-full bg-pink-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[var(--brand-pink)]">
						Reset Password
					</span>
					<h1 className="mt-4 text-2xl font-bold tracking-tight text-[var(--brand-navy)] sm:text-3xl">
						Set New Password
					</h1>
					<p className="mt-2 text-xs leading-5 text-slate-600">
						Enter your new secure password below.
					</p>

					{!uid || !token ? (
						<div className="mt-6 rounded-2xl bg-amber-50 p-4 text-xs font-medium text-amber-800 border border-amber-200">
							<p>This password reset link is invalid or incomplete.</p>
							<Link
								to="/forgot-password"
								className="mt-3 inline-block font-bold text-[var(--brand-pink)] underline"
							>
								Request a new reset link
							</Link>
						</div>
					) : (
						<form
							onSubmit={handleSubmit(onSubmit)}
							className="mt-6 space-y-4 text-left"
							noValidate
						>
							<div>
								<label
									htmlFor="new-password"
									className="block text-xs font-bold text-[var(--brand-navy)]"
								>
									New Password (min 8 chars)
								</label>
								<div className="relative mt-1">
									<LockKeyhole
										size={16}
										className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
									/>
									<input
										id="new-password"
										type="password"
										{...register("new_password")}
										className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
										placeholder="Enter new password"
									/>
								</div>
								{errors.new_password && (
									<p className="mt-1 text-xs text-red-600">
										{errors.new_password.message}
									</p>
								)}
							</div>

							<div>
								<label
									htmlFor="new-password-confirm"
									className="block text-xs font-bold text-[var(--brand-navy)]"
								>
									Confirm New Password
								</label>
								<div className="relative mt-1">
									<LockKeyhole
										size={16}
										className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
									/>
									<input
										id="new-password-confirm"
										type="password"
										{...register("new_password_confirm")}
										className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
										placeholder="Confirm new password"
									/>
								</div>
								{errors.new_password_confirm && (
									<p className="mt-1 text-xs text-red-600">
										{errors.new_password_confirm.message}
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
								{isSubmitting ? "Resetting Password..." : "Update Password"}
							</button>
						</form>
					)}

					<p className="mt-6 text-center text-xs text-slate-600">
						Remember your credentials?{" "}
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

export default ResetPassword
