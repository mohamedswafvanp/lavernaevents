import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "react-router-dom"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { getApiErrorMessage, registerUser } from "@/lib/auth"

const registerSchema = z
	.object({
		full_name: z.string().trim().min(2, "Enter your full name."),
		email: z.string().email("Enter a valid email address."),
		mobile_number: z.string().regex(/^\d{10,15}$/, "Enter a valid 10-15 digit mobile number."),
		password: z.string().min(8, "Password must be at least 8 characters."),
		password_confirm: z.string().min(1, "Please confirm your password."),
	})
	.refine((data) => data.password === data.password_confirm, {
		path: ["password_confirm"],
		message: "Passwords do not match.",
	})

type RegisterFormData = z.infer<typeof registerSchema>

function Register() {
	const [serverError, setServerError] = useState("")
	const [isRegistered, setIsRegistered] = useState(false)
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) })

	const onSubmit = async (data: RegisterFormData) => {
		setServerError("")
		try {
			await registerUser(data)
			setIsRegistered(true)
		} catch (error) {
			setServerError(getApiErrorMessage(error))
		}
	}

	return (
		<section className="bg-white">
			<div className="mx-auto max-w-lg px-5 py-20 sm:py-28">
				<div className="text-center">
					<p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand-pink)]">Get started</p>
					<h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--brand-navy)]">Create your account</h1>
					<p className="mt-4 text-sm leading-7 text-slate-600">Start planning celebrations with LavernaEvents.</p>
				</div>

				<form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-5" noValidate>
					<div>
						<label htmlFor="register-name" className="text-sm font-semibold text-[var(--brand-navy)]">Full name</label>
						<input id="register-name" {...register("full_name")} className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[var(--brand-pink)] focus:ring-2 focus:ring-[var(--brand-pink)]/20" aria-invalid={Boolean(errors.full_name)} />
						{errors.full_name && <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>}
					</div>
					<div>
						<label htmlFor="register-email" className="text-sm font-semibold text-[var(--brand-navy)]">Email</label>
						<input id="register-email" type="email" {...register("email")} className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[var(--brand-pink)] focus:ring-2 focus:ring-[var(--brand-pink)]/20" aria-invalid={Boolean(errors.email)} />
						{errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
					</div>
					<div>
						<label htmlFor="register-mobile" className="text-sm font-semibold text-[var(--brand-navy)]">Mobile number</label>
						<input id="register-mobile" type="tel" inputMode="numeric" {...register("mobile_number")} className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[var(--brand-pink)] focus:ring-2 focus:ring-[var(--brand-pink)]/20" aria-invalid={Boolean(errors.mobile_number)} />
						{errors.mobile_number && <p className="mt-1 text-sm text-red-600">{errors.mobile_number.message}</p>}
					</div>
					<div className="grid gap-5 sm:grid-cols-2">
						<div>
							<label htmlFor="register-password" className="text-sm font-semibold text-[var(--brand-navy)]">Password</label>
							<input id="register-password" type="password" {...register("password")} className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[var(--brand-pink)] focus:ring-2 focus:ring-[var(--brand-pink)]/20" aria-invalid={Boolean(errors.password)} />
							{errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
						</div>
						<div>
							<label htmlFor="register-password-confirm" className="text-sm font-semibold text-[var(--brand-navy)]">Confirm password</label>
							<input id="register-password-confirm" type="password" {...register("password_confirm")} className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[var(--brand-pink)] focus:ring-2 focus:ring-[var(--brand-pink)]/20" aria-invalid={Boolean(errors.password_confirm)} />
							{errors.password_confirm && <p className="mt-1 text-sm text-red-600">{errors.password_confirm.message}</p>}
						</div>
					</div>
					{serverError && <p className="text-sm text-red-600" role="alert">{serverError}</p>}
					{isRegistered && <p className="text-sm font-medium text-emerald-700" role="status">Account created successfully. You can now log in.</p>}
					<button type="submit" disabled={isSubmitting} className="w-full rounded-md bg-[var(--brand-pink)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--brand-pink-dark)] disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? "Creating account..." : "Create Account"}</button>
				</form>

				<p className="mt-7 text-center text-sm text-slate-600">Already have an account? <Link to="/login" className="font-semibold text-[var(--brand-pink)] hover:underline">Log in</Link></p>
			</div>
		</section>
	)
}

export default Register