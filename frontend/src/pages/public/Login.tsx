import { zodResolver } from "@hookform/resolvers/zod"
import { LockKeyhole, Phone } from "lucide-react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { z } from "zod"

import { getApiErrorMessage, getPortalAccess, loginUser } from "@/lib/auth"

const loginSchema = z.object({
	mobile_number: z
		.string()
		.regex(/^\d{10,15}$/, "Enter a valid 10-15 digit mobile number."),
	password: z.string().min(1, "Please enter your password."),
})

type LoginFormData = z.infer<typeof loginSchema>

function Login() {
	const navigate = useNavigate()
	const location = useLocation()
	const entryMessage = (location.state as { message?: string } | null)?.message
	const [serverError, setServerError] = useState("")
	const [successMessage, setSuccessMessage] = useState("")
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

	const onSubmit = async (data: LoginFormData) => {
		setServerError("")
		try {
			await loginUser(data)
			setSuccessMessage("Login successful! Directing to your workspace...")
			setTimeout(async () => {
				try {
					const accessRes = await getPortalAccess()
					if (accessRes.data.next_step === "verify_mobile" || accessRes.data.next_step === "verify_email") {
						navigate("/verify-mobile", { replace: true, state: { mobile_number: data.mobile_number } })
						return
					}
					if (accessRes.data.next_step === "select_plan") {
						navigate("/pricing", { replace: true })
						return
					}
					navigate("/portal", { replace: true })
				} catch {
					navigate("/portal", { replace: true })
				}
			}, 600)
		} catch (error) {
			setServerError(getApiErrorMessage(error))
		}
	}

	return (
		<section className="min-h-screen bg-slate-50/70 pb-16">
			<div className="mx-auto max-w-md px-4 pt-8 sm:px-6 sm:pt-14">
				
				{/* Card Container */}
				<div className="rounded-[2.5rem] border border-slate-200/80 bg-white p-7 soft-shadow-lg sm:p-9">
					<div className="text-center">
						<span className="rounded-full bg-pink-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[var(--brand-pink)]">
							Welcome Back to Laverna Events
						</span>
						<h1 className="mt-4 text-2xl font-bold tracking-tight text-[var(--brand-navy)] sm:text-3xl">
							Organizer Sign In
						</h1>
						<p className="mt-2 text-xs leading-5 text-slate-600">
							Manage your celebrations, invitations, and guests.
						</p>

						{entryMessage && (
							<p
								className="mt-4 rounded-2xl bg-pink-50 p-3 text-left text-xs font-medium leading-5 text-[var(--brand-navy)] border border-pink-100"
								role="status"
							>
								{entryMessage}
							</p>
						)}
					</div>

					<form
						onSubmit={handleSubmit(onSubmit)}
						className="mt-8 space-y-4"
						noValidate
					>
						<div>
							<label
								htmlFor="login-mobile"
								className="block text-xs font-bold text-[var(--brand-navy)]"
							>
								Mobile Number
							</label>
							<div className="relative mt-1.5">
								<Phone
									size={16}
									className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
								/>
								<input
									id="login-mobile"
									type="tel"
									inputMode="numeric"
									{...register("mobile_number")}
									className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
									placeholder="10-15 digit mobile number"
									aria-invalid={Boolean(errors.mobile_number)}
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
								htmlFor="login-password"
								className="block text-xs font-bold text-[var(--brand-navy)]"
							>
								Password
							</label>
							<div className="relative mt-1.5">
								<LockKeyhole
									size={16}
									className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
								/>
								<input
									id="login-password"
									type="password"
									{...register("password")}
									className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
									placeholder="Enter password"
									aria-invalid={Boolean(errors.password)}
								/>
							</div>
							{errors.password && (
								<p className="mt-1 text-xs text-red-600">
									{errors.password.message}
								</p>
							)}
						</div>

						<div className="text-right">
							<Link
								to="/forgot-password"
								className="text-xs font-semibold text-[var(--brand-pink)] hover:underline"
							>
								Forgot password?
							</Link>
						</div>

						{serverError && (
							<p
								className="rounded-2xl bg-red-50 p-3 text-center text-xs font-semibold text-red-600"
								role="alert"
							>
								{serverError}
							</p>
						)}

						{successMessage && (
							<div
								className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--brand-navy)]/40 p-4 backdrop-blur-xs"
								role="status"
							>
								<div className="rounded-[2rem] bg-white p-7 text-center shadow-2xl">
									<p className="text-base font-bold text-emerald-700">
										{successMessage}
									</p>
									<p className="mt-1 text-xs text-slate-600">
										Entering your organizer portal...
									</p>
								</div>
							</div>
						)}

						<button
							type="submit"
							disabled={isSubmitting}
							className="mt-2 w-full rounded-full bg-[var(--brand-pink)] py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-[var(--brand-pink-dark)] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
						>
							{isSubmitting ? "Signing in..." : "Sign In"}
						</button>
					</form>

					<p className="mt-6 text-center text-xs text-slate-600">
						Don&apos;t have an account?{" "}
						<Link
							to="/demo-onboarding"
							className="font-bold text-[var(--brand-pink)] hover:underline"
						>
							Try Demo Tour
						</Link>
					</p>
				</div>

			</div>
		</section>
	)
}

export default Login