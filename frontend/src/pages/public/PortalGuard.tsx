import { LoaderCircle } from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"
import { useNavigate } from "react-router-dom"

import { getAccessToken, getApiErrorMessage, getPortalAccess } from "@/lib/auth"

function PortalGuard({ children }: { children: ReactNode }) {
	const navigate = useNavigate()
	const [allowed, setAllowed] = useState(false)
	const [error, setError] = useState("")

	useEffect(() => {
		if (!getAccessToken()) {
			navigate("/login", { replace: true, state: { from: "/portal" } })
			return
		}

		async function checkAccess() {
			try {
				const response = await getPortalAccess()
				if (response.data.next_step === "verify_email") navigate("/verify-email", { replace: true })
				else if (response.data.next_step === "select_plan") navigate("/pricing", { replace: true })
				else setAllowed(true)
			} catch (guardError) {
				setError(getApiErrorMessage(guardError))
			}
		}
		void checkAccess()
	}, [navigate])

	if (error) return <section className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-5"><p className="text-sm text-red-600" role="alert">{error}</p></section>
	if (!allowed) return <section className="flex min-h-[calc(100vh-5rem)] items-center justify-center"><LoaderCircle className="animate-spin text-[var(--brand-pink)]" aria-label="Checking portal access" /></section>
	return children
}

export default PortalGuard