import { Check, LockKeyhole, UserRound } from "lucide-react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"

import {
	createPaymentOrder,
	getApiErrorMessage,
	getMembershipPlans,
	loginUser,
	registerUser,
	resendOtp,
	subscribeToPlan,
	verifyEmail,
	verifyPayment,
} from "@/lib/auth"
import { demoPlans, type DemoPlan } from "@/lib/demo"

const steps = ["Register", "Verify", "Choose Plan", "Secure Checkout", "Activated"]

declare global {
	interface Window {
		Razorpay?: new (options: {
			key: string
			amount: number
			currency: string
			name: string
			description: string
			order_id: string
			handler: (response: {
				razorpay_order_id: string
				razorpay_payment_id: string
				razorpay_signature: string
			}) => void
			modal: { ondismiss: () => void }
		}) => { open: () => void }
	}
}

async function loadRazorpay() {
	if (window.Razorpay) return
	await new Promise<void>((resolve, reject) => {
		const script = document.createElement("script")
		script.src = "https://checkout.razorpay.com/v1/checkout.js"
		script.onload = () => resolve()
		script.onerror = () =>
			reject(new Error("Unable to load secure payment checkout."))
		document.body.appendChild(script)
	})
}

function DemoOnboarding() {
	const navigate = useNavigate()
	const [step, setStep] = useState(0)
	const [profile, setProfile] = useState({
		name: "",
		email: "",
		mobile: "",
		password: "",
		passwordConfirm: "",
	})
	const [code, setCode] = useState("")
	const [selectedPlan, setSelectedPlan] = useState<DemoPlan>(demoPlans[1])
	const [plans, setPlans] = useState<DemoPlan[]>([])
	const [payment, setPayment] = useState({ number: "", expiry: "", cvc: "" })
	const [error, setError] = useState("")
	const [isRegistering, setIsRegistering] = useState(false)

	const advance = async () => {
		setError("")
		if (
			step === 0 &&
			(!profile.name ||
				!profile.email ||
				!profile.mobile ||
				!profile.password ||
				!profile.passwordConfirm)
		)
			return setError("Complete all registration fields.")
		if (step === 0 && profile.password.length < 8)
			return setError("Password must be at least 8 characters.")
		if (step === 0 && profile.password !== profile.passwordConfirm)
			return setError("Passwords do not match.")
		if (step === 1 && !code)
			return setError("Enter the verification code from your email.")
		if (
			step === 3 &&
			selectedPlan.price > 0 &&
			(!payment.number || !payment.expiry || !payment.cvc)
		)
			return setError("Enter the demo payment details to continue.")
		if (step === 0) {
			setIsRegistering(true)
			try {
				await registerUser({
					full_name: profile.name,
					email: profile.email,
					mobile_number: profile.mobile,
					password: profile.password,
					password_confirm: profile.passwordConfirm,
				})
			} catch (registrationError) {
				setError(getApiErrorMessage(registrationError))
				setIsRegistering(false)
				return
			}
			setIsRegistering(false)
		}
		if (step === 1) {
			setIsRegistering(true)
			try {
				await verifyEmail({ mobile_number: profile.mobile, code })
				await loginUser({
					mobile_number: profile.mobile,
					password: profile.password,
				})
				const response = await getMembershipPlans()
				const livePlans = response.data.map((plan) => ({
					name: plan.name,
					slug: plan.slug,
					price: Number(plan.price),
					guestLimit: plan.guest_limit,
					eventLimit: plan.event_limit,
					storageLimit: plan.storage_limit_mb,
					features: [
						`${plan.guest_limit} guests`,
						`${plan.template_names.length} templates`,
						`${plan.storage_limit_mb} MB storage`,
						plan.gallery_enabled ? "Photo gallery" : "No photo gallery",
						plan.qr_code_enabled ? "QR features" : "No QR features",
						plan.photographer_access_enabled
							? "Photographer access"
							: "No photographer access",
					],
				}))
				if (!livePlans.length)
					throw new Error("No active membership plans are available.")
				setPlans(livePlans)
				setSelectedPlan(livePlans[0])
			} catch (flowError) {
				setError(getApiErrorMessage(flowError))
				setIsRegistering(false)
				return
			}
			setIsRegistering(false)
		}
		if (step === 2) {
			if (selectedPlan.price === 0) {
				setIsRegistering(true)
				try {
					await subscribeToPlan(selectedPlan.slug)
					setStep(4)
				} catch (subscriptionError) {
					setError(getApiErrorMessage(subscriptionError))
				} finally {
					setIsRegistering(false)
				}
				return
			}
		}
		if (step === 3) {
			setIsRegistering(true)
			try {
				const order = await createPaymentOrder(selectedPlan.slug)
				await loadRazorpay()
				if (!window.Razorpay)
					throw new Error("Secure payment checkout is unavailable.")
				new window.Razorpay({
					key: order.data.razorpay_key_id,
					amount: Math.round(Number(order.data.amount) * 100),
					currency: order.data.currency,
					name: "LavernaEvents",
					description: `${selectedPlan.name} membership`,
					order_id: order.data.razorpay_order_id,
					handler: (paymentResponse) => {
						void verifyPayment(paymentResponse)
							.then(() => setStep(4))
							.catch((paymentError) =>
								setError(getApiErrorMessage(paymentError))
							)
							.finally(() => setIsRegistering(false))
					},
					modal: { ondismiss: () => setIsRegistering(false) },
				}).open()
			} catch (paymentError) {
				setError(getApiErrorMessage(paymentError))
				setIsRegistering(false)
			}
			return
		}
		setStep((current) => current + 1)
	}

	const handleResend = async () => {
		setError("")
		try {
			const response = await resendOtp(profile.mobile)
			setError(response.message ?? "A new verification code was sent.")
		} catch (resendError) {
			setError(getApiErrorMessage(resendError))
		}
	}

	const activate = () => {
		localStorage.removeItem("laverna_demo_session")
		navigate("/login", {
			replace: true,
			state: {
				from: "/portal",
				message: `Payment confirmed for ${selectedPlan.name}. Log in with your registered phone number and password to enter the portal.`,
			},
		})
	}

	return (
		<section className="min-h-screen bg-slate-50/70 pb-16">
			<div className="mx-auto max-w-4xl px-4 pt-6 sm:px-6 sm:pt-10 lg:px-8">
				
				{/* Top Hero Banner */}
				<div className="gradient-hero-warm relative overflow-hidden rounded-[2.5rem] p-8 text-center text-white soft-shadow-lg sm:p-12">
					<div className="pointer-events-none absolute -right-10 -top-10 size-60 rounded-full bg-white/15 blur-2xl" />
					<div className="relative z-10 mx-auto max-w-2xl">
						<span className="rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
							Product Tour
						</span>
						<h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
							From Idea to Celebration
						</h1>
						<p className="mt-4 text-sm leading-6 text-orange-100 sm:text-base sm:leading-7">
							Explore the organizer onboarding workflow in an interactive simulator.
						</p>
					</div>
				</div>

				{/* Stepper Indicator */}
				<div className="mt-8 grid grid-cols-5 gap-2 rounded-3xl border border-slate-200/80 bg-white p-4 soft-shadow sm:p-5">
					{steps.map((label, index) => (
						<div key={label} className="text-center">
							<div
								className={`mx-auto flex size-8 items-center justify-center rounded-full text-xs font-bold transition-all sm:size-10 sm:text-sm ${
									index <= step
										? "bg-[var(--brand-pink)] text-white shadow-xs"
										: "bg-slate-100 text-slate-400"
								}`}
							>
								{index < step ? <Check size={16} strokeWidth={3} /> : index + 1}
							</div>
							<p className="mt-2 hidden text-[11px] font-semibold text-slate-600 sm:block">
								{label}
							</p>
						</div>
					))}
				</div>

				{/* Step Content Container */}
				<div className="mt-6 rounded-[2.5rem] border border-slate-200/80 bg-white p-6 soft-shadow-lg sm:p-10">
					<div className="mb-6 border-b border-slate-100 pb-4">
						<span className="text-[11px] font-bold text-[var(--brand-pink)] uppercase">
							Step {step + 1} of {steps.length}
						</span>
						<h2 className="text-2xl font-bold text-[var(--brand-navy)]">
							{steps[step]}
						</h2>
					</div>

					{step === 0 && (
						<div className="grid gap-4 sm:grid-cols-2">
							<div>
								<label className="block text-xs font-bold text-[var(--brand-navy)]">
									Full Name
								</label>
								<input
									value={profile.name}
									onChange={(e) =>
										setProfile({ ...profile, name: e.target.value })
									}
									className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
									placeholder="Alex Morgan"
								/>
							</div>
							<div>
								<label className="block text-xs font-bold text-[var(--brand-navy)]">
									Email Address
								</label>
								<input
									type="email"
									value={profile.email}
									onChange={(e) =>
										setProfile({ ...profile, email: e.target.value })
									}
									className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
									placeholder="alex@example.com"
								/>
							</div>
							<div className="sm:col-span-2">
								<label className="block text-xs font-bold text-[var(--brand-navy)]">
									Mobile Number (10-15 digits)
								</label>
								<input
									value={profile.mobile}
									onChange={(e) =>
										setProfile({ ...profile, mobile: e.target.value })
									}
									className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
									placeholder="9876543210"
								/>
							</div>
							<div>
								<label className="block text-xs font-bold text-[var(--brand-navy)]">
									Create Password
								</label>
								<input
									type="password"
									value={profile.password}
									onChange={(e) =>
										setProfile({ ...profile, password: e.target.value })
									}
									className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
									placeholder="At least 8 characters"
								/>
							</div>
							<div>
								<label className="block text-xs font-bold text-[var(--brand-navy)]">
									Confirm Password
								</label>
								<input
									type="password"
									value={profile.passwordConfirm}
									onChange={(e) =>
										setProfile({ ...profile, passwordConfirm: e.target.value })
									}
									className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
									placeholder="Repeat password"
								/>
							</div>
						</div>
					)}

					{step === 1 && (
						<div className="mx-auto max-w-sm text-center">
							<div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-pink-50 text-[var(--brand-pink)] shadow-2xs">
								<UserRound size={26} />
							</div>
							<p className="mt-4 text-xs leading-6 text-slate-600">
								We sent a 6-digit OTP verification code to{" "}
								<span className="font-semibold text-slate-900">{profile.email}</span>.
							</p>
							<input
								value={code}
								onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
								inputMode="numeric"
								maxLength={6}
								className="mt-5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-center text-xl font-bold tracking-[0.4em] outline-none focus:border-[var(--brand-pink)] focus:bg-white"
								placeholder="000000"
							/>
							<button
								type="button"
								onClick={() => void handleResend()}
								className="mt-4 text-xs font-bold text-[var(--brand-pink)] hover:underline"
							>
								Resend Verification Code
							</button>
						</div>
					)}

					{step === 2 && (
						<div className="grid gap-4 sm:grid-cols-3">
							{plans.map((plan) => (
								<button
									type="button"
									key={plan.slug}
									onClick={() => setSelectedPlan(plan)}
									className={`rounded-3xl border p-5 text-left transition-all ${
										selectedPlan.slug === plan.slug
											? "border-2 border-[var(--brand-pink)] bg-pink-50/50 shadow-md ring-2 ring-pink-100"
											: "border-slate-200 bg-white hover:bg-slate-50"
									}`}
								>
									<div className="flex items-center justify-between">
										<h3 className="font-bold text-[var(--brand-navy)]">
											{plan.name}
										</h3>
										{selectedPlan.slug === plan.slug && (
											<Check size={18} className="text-[var(--brand-pink)]" />
										)}
									</div>
									<p className="mt-3 text-3xl font-bold text-[var(--brand-navy)]">
										${plan.price}
										<span className="text-xs font-normal text-slate-500">
											{" "}
											/ mo
										</span>
									</p>
									<ul className="mt-4 space-y-2 text-xs text-slate-600">
										{plan.features.map((feature) => (
											<li key={feature} className="flex gap-2 items-center">
												<Check
													size={13}
													className="shrink-0 text-[var(--brand-pink)]"
												/>
												<span>{feature}</span>
											</li>
										))}
									</ul>
								</button>
							))}
						</div>
					)}

					{step === 3 && (
						<div className="mx-auto max-w-md">
							<div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-xs text-emerald-800 border border-emerald-100">
								<LockKeyhole size={18} className="shrink-0" />
								<span>Secure demo payment gateway. No live credit card charge.</span>
							</div>

							<div className="mt-5 space-y-3">
								<div>
									<label className="block text-xs font-bold text-[var(--brand-navy)]">
										Card Number
									</label>
									<input
										value={payment.number}
										onChange={(e) =>
											setPayment({ ...payment, number: e.target.value })
										}
										className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
										placeholder="4242 4242 4242 4242"
									/>
								</div>
								<div className="grid grid-cols-2 gap-3">
									<div>
										<label className="block text-xs font-bold text-[var(--brand-navy)]">
											Expiry
										</label>
										<input
											value={payment.expiry}
											onChange={(e) =>
												setPayment({ ...payment, expiry: e.target.value })
											}
											className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
											placeholder="12/28"
										/>
									</div>
									<div>
										<label className="block text-xs font-bold text-[var(--brand-navy)]">
											CVC
										</label>
										<input
											value={payment.cvc}
											onChange={(e) =>
												setPayment({ ...payment, cvc: e.target.value })
											}
											className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs outline-none focus:border-[var(--brand-pink)] focus:bg-white"
											placeholder="123"
										/>
									</div>
								</div>
							</div>
						</div>
					)}

					{step === 4 && (
						<div className="mx-auto max-w-md text-center">
							<div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
								<Check size={32} strokeWidth={3} />
							</div>
							<h3 className="mt-5 text-2xl font-bold text-[var(--brand-navy)]">
								Celebration Membership Ready
							</h3>
							<p className="mt-2 text-xs leading-6 text-slate-600 sm:text-sm">
								Your {selectedPlan.name} membership has been activated. Proceed to login to start managing your first celebration.
							</p>
						</div>
					)}

					{error && (
						<p
							className="mt-6 rounded-2xl bg-red-50 p-3 text-center text-xs font-semibold text-red-600"
							role="alert"
						>
							{error}
						</p>
					)}

					<div className="mt-8 flex justify-end">
						{step < 4 ? (
							<button
								type="button"
								onClick={() => void advance()}
								disabled={isRegistering}
								className="rounded-full bg-[var(--brand-pink)] px-7 py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-[var(--brand-pink-dark)] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed sm:text-sm"
							>
								{isRegistering
									? step === 0
										? "Creating Account..."
										: step === 1
										? "Verifying..."
										: step === 3
										? "Opening Checkout..."
										: "Activating..."
									: step === 3
									? "Pay Securely"
									: "Continue"}
							</button>
						) : (
							<button
								type="button"
								onClick={activate}
								className="rounded-full bg-[var(--brand-pink)] px-8 py-3.5 text-xs font-bold text-white shadow-md hover:bg-[var(--brand-pink-dark)] active:scale-95 sm:text-sm"
							>
								Continue to Organizer Login
							</button>
						)}
					</div>
				</div>

			</div>
		</section>
	)
}

export default DemoOnboarding