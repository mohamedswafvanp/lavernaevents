import { Suspense, useEffect, useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import Footer from "../components/public/Footer"
import MobileBottomNav from "../components/public/MobileBottomNav"
import Navbar from "../components/public/Navbar"
import PageSkeleton from "../components/public/PageSkeleton"

function PublicLayout() {
	const location = useLocation()
	const [isNavigating, setIsNavigating] = useState(false)
	const isPortalOrRespond =
		location.pathname.startsWith("/portal") ||
		location.pathname.startsWith("/respond")

	useEffect(() => {
		setIsNavigating(true)
		const timer = window.setTimeout(() => setIsNavigating(false), 250)
		return () => window.clearTimeout(timer)
	}, [location.pathname])

	if (isPortalOrRespond) {
		return (
			<main className="min-h-screen bg-slate-50">
				{isNavigating ? (
					<PageSkeleton />
				) : (
					<Suspense fallback={<PageSkeleton />}>
						<Outlet />
					</Suspense>
				)}
			</main>
		)
	}

	return (
		<div className="flex min-h-screen flex-col bg-slate-50/50">
			<Navbar />
			<main className="flex-1 pb-20 md:pb-0">
				{isNavigating ? (
					<PageSkeleton />
				) : (
					<Suspense fallback={<PageSkeleton />}>
						<Outlet />
					</Suspense>
				)}
			</main>
			<Footer />
			<MobileBottomNav />
		</div>
	)
}

export default PublicLayout
