import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { getApiErrorMessage, getPortalAccess, loginUser } from "@/lib/auth"

const loginSchema = z.object({
	mobile_number: z.string().regex(/^\d{10,15}$/, "Enter a valid 10-15 digit mobile number."),
	password: z.string().min(1, "Please enter your password."),
})

type LoginFormData = z.infer<typeof loginSchema>

function Login() {
	const navigate = useNavigate()
	const location = useLocation()
	const destination = (location.state as { from?: string } | null)?.from ?? "/pricing"
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
			const loginResponse = await loginUser(data)
			setSuccessMessage("Login successful")
			const access = await getPortalAccess()
			setTimeout(() => {
				if (access.data.next_step === "verify_email") navigate("/verify-email", { replace: true, state: { email: loginResponse.data.user?.email } })
				else if (access.data.next_step === "select_plan") navigate("/pricing", { replace: true })
				else navigate(destination === "/login" ? "/portal" : destination, { replace: true })
			}, 700)
		} catch (error) {
			setServerError(getApiErrorMessage(error))
		}
	}

	return (
		<section className="bg-white">
			<div className="mx-auto max-w-md px-5 py-20 sm:py-28">
				<div className="text-center">
					<p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand-pink)]">Welcome back</p>
					<h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--brand-navy)]">Log in to LavernaEvents</h1>
					<p className="mt-4 text-sm leading-7 text-slate-600">Manage your celebrations from one simple place.</p>
				</div>

				<form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-5" noValidate>
					<div>
						<label htmlFor="login-mobile" className="text-sm font-semibold text-[var(--brand-navy)]">Mobile number</label>
						<input id="login-mobile" type="tel" inputMode="numeric" {...register("mobile_number")} className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[var(--brand-pink)] focus:ring-2 focus:ring-[var(--brand-pink)]/20" aria-invalid={Boolean(errors.mobile_number)} />
						{errors.mobile_number && <p className="mt-1 text-sm text-red-600">{errors.mobile_number.message}</p>}
					</div>
					<div>
						<label htmlFor="login-password" className="text-sm font-semibold text-[var(--brand-navy)]">Password</label>
						<input id="login-password" type="password" {...register("password")} className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[var(--brand-pink)] focus:ring-2 focus:ring-[var(--brand-pink)]/20" aria-invalid={Boolean(errors.password)} />
						{errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
					</div>
					{serverError && <p className="text-sm text-red-600" role="alert">{serverError}</p>}
					{successMessage && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--brand-navy)]/30 p-5" role="status"><div className="rounded-lg bg-white p-7 text-center shadow-xl"><p className="text-lg font-semibold text-emerald-700">{successMessage}</p><p className="mt-2 text-sm text-slate-600">Taking you to the next step...</p></div></div>}
					<div className="text-right"><Link to="/forgot-password" className="text-sm font-semibold text-[var(--brand-pink)] hover:underline">Forgot password?</Link></div>
					<button type="submit" disabled={isSubmitting} className="w-full rounded-md bg-[var(--brand-pink)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--brand-pink-dark)] disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? "Logging in..." : "Log In"}</button>
				</form>

				<p className="mt-7 text-center text-sm text-slate-600">Don&apos;t have an account? <Link to="/demo-onboarding" className="font-semibold text-[var(--brand-pink)] hover:underline">Create one</Link></p>
			</div>
		</section>
	)
}

export default Login