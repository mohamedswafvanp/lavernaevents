import { zodResolver } from "@hookform/resolvers/zod"
import { LockKeyhole, Mail, Phone, User } from "lucide-react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { z } from "zod"

import { getApiErrorMessage, registerUser } from "@/lib/auth"

const registerSchema = z
	.object({
		full_name: z.string().trim().min(2, "Enter your full name."),
		email: z.string().email("Enter a valid email address."),
		mobile_number: z
			.string()
			.regex(/^\d{10,15}$/, "Enter a valid 10-15 digit mobile number."),
		password: z.string().min(8, "Password must be at least 8 characters."),
		password_confirm: z.string().min(1, "Please confirm your password."),
	})
	.refine((data) => data.password === data.password_confirm, {
		path: ["password_confirm"],
		message: "Passwords do not match.",
	})

type RegisterFormData = z.infer<typeof registerSchema>

function Register() {
	const navigate = useNavigate()
	const [serverError, setServerError] = useState("")
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) })

	const onSubmit = async (data: RegisterFormData) => {
		setServerError("")
		try {
			await registerUser(data)
			navigate("/verify-mobile", {
				state: { mobile_number: data.mobile_number, email: data.email },
			})
		} catch (error) {
			setServerError(getApiErrorMessage(error))
		}
	}

	return (
		<section className="flex min-h-[calc(100vh-9rem)] items-center justify-center bg-slate-50/70 px-4 py-6 sm:px-6 md:min-h-[calc(100vh-8rem)]">
			<div className="w-full max-w-lg">
				<div className="rounded-[2.5rem] border border-slate-200/80 bg-white p-7 soft-shadow-lg sm:p-9">
					<div className="text-center">
						<span className="rounded-full bg-pink-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[var(--brand-pink)]">
							Organizer Registration
						</span>
						<h1 className="mt-4 text-2xl font-bold tracking-tight text-[var(--brand-navy)] sm:text-3xl">
							Create Your Account
						</h1>
						<p className="mt-2 text-xs leading-5 text-slate-600">
							Start planning and coordinating celebrations with Laverna Events.
						</p>
					</div>

					<form
						onSubmit={handleSubmit(onSubmit)}
						className="mt-8 space-y-4"
						noValidate
					>
						<div>
							<label
								htmlFor="register-name"
								className="block text-xs font-bold text-[var(--brand-navy)]"
							>
								Full Name
							</label>
							<div className="relative mt-1.5">
								<User
									size={16}
									className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
								/>
								<input
									id="register-name"
									{...register("full_name")}
									className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
									placeholder="Alex Morgan"
									aria-invalid={Boolean(errors.full_name)}
								/>
							</div>
							{errors.full_name && (
								<p className="mt-1 text-xs text-red-600">
									{errors.full_name.message}
								</p>
							)}
						</div>

						<div>
							<label
								htmlFor="register-email"
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
									id="register-email"
									type="email"
									{...register("email")}
									className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
									placeholder="alex@example.com"
									aria-invalid={Boolean(errors.email)}
								/>
							</div>
							{errors.email && (
								<p className="mt-1 text-xs text-red-600">
									{errors.email.message}
								</p>
							)}
						</div>

						<div>
							<label
								htmlFor="register-mobile"
								className="block text-xs font-bold text-[var(--brand-navy)]"
							>
								Mobile Number (10-15 digits)
							</label>
							<div className="relative mt-1.5">
								<Phone
									size={16}
									className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
								/>
								<input
									id="register-mobile"
									type="tel"
									inputMode="numeric"
									{...register("mobile_number")}
									className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
									placeholder="9876543210"
									aria-invalid={Boolean(errors.mobile_number)}
								/>
							</div>
							{errors.mobile_number && (
								<p className="mt-1 text-xs text-red-600">
									{errors.mobile_number.message}
								</p>
							)}
						</div>

						<div className="grid gap-3 sm:grid-cols-2">
							<div>
								<label
									htmlFor="register-password"
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
										id="register-password"
										type="password"
										{...register("password")}
										className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
										placeholder="Min 8 chars"
										aria-invalid={Boolean(errors.password)}
									/>
								</div>
								{errors.password && (
									<p className="mt-1 text-xs text-red-600">
										{errors.password.message}
									</p>
								)}
							</div>

							<div>
								<label
									htmlFor="register-password-confirm"
									className="block text-xs font-bold text-[var(--brand-navy)]"
								>
									Confirm Password
								</label>
								<div className="relative mt-1.5">
									<LockKeyhole
										size={16}
										className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
									/>
									<input
										id="register-password-confirm"
										type="password"
										{...register("password_confirm")}
										className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
										placeholder="Repeat password"
										aria-invalid={Boolean(errors.password_confirm)}
									/>
								</div>
								{errors.password_confirm && (
									<p className="mt-1 text-xs text-red-600">
										{errors.password_confirm.message}
									</p>
								)}
							</div>
						</div>

						{serverError && (
							<p
								className="rounded-2xl bg-red-50 p-3 text-center text-xs font-semibold text-red-600"
								role="alert"
							>
								{serverError}
							</p>
						)}

						<button
							type="submit"
							disabled={isSubmitting}
							className="mt-2 w-full rounded-full bg-[var(--brand-pink)] py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-[var(--brand-pink-dark)] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
						>
							{isSubmitting ? "Creating Account..." : "Create Account"}
						</button>
					</form>

					<p className="mt-6 text-center text-xs text-slate-600">
						Already have an account?{" "}
						<Link
							to="/login"
							className="font-bold text-[var(--brand-pink)] hover:underline"
						>
							Sign In
						</Link>
					</p>
				</div>

			</div>
		</section>
	)
}

export default Register