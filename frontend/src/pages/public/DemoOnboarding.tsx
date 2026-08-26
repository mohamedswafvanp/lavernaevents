import { Check, CreditCard, LockKeyhole, ShieldCheck, UserRound } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { getApiErrorMessage, registerUser } from "@/lib/auth"
import { demoPlans, saveDemoSession, type DemoPlan } from "@/lib/demo"

const steps = ["Register", "Verify", "Choose plan", "Secure payment", "Activated"]

function DemoOnboarding() {
	const navigate = useNavigate()
	const [step, setStep] = useState(0)
	const [profile, setProfile] = useState({ name: "", email: "", mobile: "", password: "", passwordConfirm: "" })
	const [code, setCode] = useState("")
	const [selectedPlan, setSelectedPlan] = useState<DemoPlan>(demoPlans[1])
	const [payment, setPayment] = useState({ number: "", expiry: "", cvc: "" })
	const [error, setError] = useState("")
	const [isRegistering, setIsRegistering] = useState(false)

	const advance = async () => {
		setError("")
		if (step === 0 && (!profile.name || !profile.email || !profile.mobile || !profile.password || !profile.passwordConfirm)) return setError("Complete all registration fields.")
		if (step === 0 && profile.password.length < 8) return setError("Password must be at least 8 characters.")
		if (step === 0 && profile.password !== profile.passwordConfirm) return setError("Passwords do not match.")
		if (step === 1 && code !== "123456") return setError("Use the demo verification code 123456.")
		if (step === 3 && selectedPlan.price > 0 && (!payment.number || !payment.expiry || !payment.cvc)) return setError("Enter the demo payment details to continue.")
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
		setStep((current) => current + 1)
	}

	const activate = () => {
		saveDemoSession({ ...profile, plan: selectedPlan, verified: true, paid: true, events: [] })
		navigate("/demo-portal")
	}

	return (
		<section className="min-h-[calc(100vh-5rem)] bg-slate-50/70 px-5 py-12 sm:px-8 lg:px-10 lg:py-20">
			<div className="mx-auto max-w-5xl">
				<div className="text-center">
					<p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand-pink)]">Product tour</p>
					<h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--brand-navy)] sm:text-5xl">From idea to celebration</h1>
					<p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-600">A complete frontend demo of the organizer journey. No real payment is processed.</p>
				</div>

				<div className="mt-10 grid grid-cols-5 gap-2 sm:gap-4">
					{steps.map((label, index) => <div key={label} className="text-center"><div className={`mx-auto flex size-9 items-center justify-center rounded-full text-sm font-bold ${index <= step ? "bg-[var(--brand-pink)] text-white" : "bg-slate-200 text-slate-500"}`}>{index < step ? <Check size={17} /> : index + 1}</div><p className="mt-2 hidden text-xs font-medium text-slate-600 sm:block">{label}</p></div>)}
				</div>

				<Card className="mx-auto mt-10 max-w-3xl">
					<CardHeader>
						<h2 className="text-2xl font-bold text-[var(--brand-navy)]">{steps[step]}</h2>
						<p className="mt-2 text-sm text-slate-600">Step {step + 1} of {steps.length}</p>
					</CardHeader>
					<CardContent>
						{step === 0 && <div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold text-[var(--brand-navy)]">Full name<input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[var(--brand-pink)]" placeholder="Alex Morgan" /></label><label className="text-sm font-semibold text-[var(--brand-navy)]">Email<input type="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[var(--brand-pink)]" placeholder="alex@example.com" /></label><label className="text-sm font-semibold text-[var(--brand-navy)] sm:col-span-2">Mobile number<input value={profile.mobile} onChange={(event) => setProfile({ ...profile, mobile: event.target.value })} className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[var(--brand-pink)]" placeholder="9876543210" /></label><label className="text-sm font-semibold text-[var(--brand-navy)]">Create password<input type="password" value={profile.password} onChange={(event) => setProfile({ ...profile, password: event.target.value })} className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[var(--brand-pink)]" placeholder="At least 8 characters" /></label><label className="text-sm font-semibold text-[var(--brand-navy)]">Confirm password<input type="password" value={profile.passwordConfirm} onChange={(event) => setProfile({ ...profile, passwordConfirm: event.target.value })} className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[var(--brand-pink)]" placeholder="Repeat your password" /></label></div>}
						{step === 1 && <div className="mx-auto max-w-sm text-center"><div className="mx-auto flex size-14 items-center justify-center rounded-full bg-pink-50 text-[var(--brand-pink)]"><UserRound /></div><p className="mt-5 text-sm leading-7 text-slate-600">We sent a six-digit verification code to {profile.email}. This demo uses <strong>123456</strong>.</p><input value={code} onChange={(event) => setCode(event.target.value)} inputMode="numeric" maxLength={6} className="mt-6 w-full rounded-md border border-slate-300 px-4 py-3 text-center text-xl tracking-[0.4em] outline-none focus:border-[var(--brand-pink)]" placeholder="123456" /></div>}
						{step === 2 && <div className="grid gap-5 md:grid-cols-3">{demoPlans.map((plan) => <button type="button" key={plan.slug} onClick={() => setSelectedPlan(plan)} className={`rounded-lg border p-5 text-left transition-shadow hover:shadow-md ${selectedPlan.slug === plan.slug ? "border-2 border-[var(--brand-pink)]" : "border-slate-200"}`}><div className="flex items-center justify-between"><h3 className="font-semibold text-[var(--brand-navy)]">{plan.name}</h3>{selectedPlan.slug === plan.slug && <Check size={18} className="text-[var(--brand-pink)]" />}</div><p className="mt-4 text-3xl font-bold text-[var(--brand-navy)]">${plan.price}<span className="text-sm font-normal text-slate-500"> / month</span></p><ul className="mt-5 space-y-2 text-sm text-slate-600">{plan.features.map((feature) => <li key={feature} className="flex gap-2"><Check size={16} className="shrink-0 text-[var(--brand-pink)]" />{feature}</li>)}</ul></button>)}</div>}
						{step === 3 && <div className="mx-auto max-w-md"><div className="flex items-center gap-3 rounded-md bg-emerald-50 p-4 text-sm text-emerald-800"><LockKeyhole size={18} /> Secure demo checkout. No real charge will be made.</div><label className="mt-6 block text-sm font-semibold text-[var(--brand-navy)]">Card number<input value={payment.number} onChange={(event) => setPayment({ ...payment, number: event.target.value })} className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 font-normal" placeholder="4242 4242 4242 4242" /></label><div className="mt-5 grid grid-cols-2 gap-5"><label className="text-sm font-semibold text-[var(--brand-navy)]">Expiry<input value={payment.expiry} onChange={(event) => setPayment({ ...payment, expiry: event.target.value })} className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 font-normal" placeholder="12/28" /></label><label className="text-sm font-semibold text-[var(--brand-navy)]">CVC<input value={payment.cvc} onChange={(event) => setPayment({ ...payment, cvc: event.target.value })} className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 font-normal" placeholder="123" /></label></div><p className="mt-5 flex items-center gap-2 text-xs text-slate-500"><ShieldCheck size={16} /> Payment confirmation is simulated for this demo.</p></div>}
						{step === 4 && <div className="mx-auto max-w-md text-center"><div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><Check size={30} /></div><h3 className="mt-6 text-2xl font-bold text-[var(--brand-navy)]">Payment confirmed</h3><p className="mt-3 leading-7 text-slate-600">Your {selectedPlan.name} membership is ready to activate. Enter the portal to create and manage your first event.</p><div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500"><CreditCard size={17} /> Demo transaction confirmed</div></div>}
						{error && <p className="mt-6 text-sm text-red-600" role="alert">{error}</p>}
						<div className="mt-8 flex justify-end">{step < 4 ? <button type="button" onClick={() => void advance()} disabled={isRegistering} className="rounded-md bg-[var(--brand-pink)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--brand-pink-dark)] disabled:cursor-not-allowed disabled:opacity-60">{isRegistering ? "Creating account..." : step === 3 && selectedPlan.price === 0 ? "Confirm payment" : "Continue"}</button> : <button type="button" onClick={activate} className="rounded-md bg-[var(--brand-pink)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--brand-pink-dark)]">Activate & enter portal</button>}</div>
					</CardContent>
				</Card>
			</div>
		</section>
	)
}

export default DemoOnboarding