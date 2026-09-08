import { LoaderCircle } from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"
import { Navigate, useNavigate } from "react-router-dom"

import { getAccessToken, getPortalAccess } from "@/lib/auth"

interface PortalGuardProps {
	children: ReactNode
}

export default function PortalGuard({ children }: PortalGuardProps) {
	const navigate = useNavigate()
	const token = getAccessToken()
	const [loading, setLoading] = useState(true)
	const [canAccess, setCanAccess] = useState(false)

	useEffect(() => {
		async function verifyAccess() {
			if (!token) {
				setLoading(false)
				return
			}
			try {
				const res = await getPortalAccess()
				if (res.data.next_step === "verify_mobile" || res.data.next_step === "verify_email") {
					navigate("/verify-mobile", { replace: true })
					return
				}
				if (res.data.next_step === "select_plan") {
					navigate("/pricing", { replace: true })
					return
				}
				setCanAccess(true)
			} catch {
				// If server connection or auth fails, fallback to portal view or account
				setCanAccess(true)
			} finally {
				setLoading(false)
			}
		}
		void verifyAccess()
	}, [navigate, token])

	if (!token) {
		return <Navigate to="/login" replace />
	}

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-slate-50">
				<div className="text-center">
					<LoaderCircle className="mx-auto animate-spin text-[var(--brand-pink)]" size={36} />
					<p className="mt-3 text-xs font-semibold text-slate-500">
						Verifying organizer credentials...
					</p>
				</div>
			</div>
		)
	}

	if (!canAccess) {
		return null
	}

	return <>{children}</>
}