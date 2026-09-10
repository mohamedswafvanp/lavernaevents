import { BrowserRouter, Route, Routes } from "react-router-dom"
import PublicLayout from "./layouts/PublicLayout"

// Public Pages
import About from "./pages/public/About"
import Account from "./pages/public/Account"
import Contact from "./pages/public/Contact"
import DemoOnboarding from "./pages/public/DemoOnboarding"
import DemoPortal from "./pages/public/DemoPortal"
import FAQ from "./pages/public/FAQ"
import ForgotPassword from "./pages/public/ForgotPassword"
import Gallery from "./pages/public/Gallery"
import Home from "./pages/public/Home"
import Login from "./pages/public/Login"
import Pricing from "./pages/public/Pricing"
import PortalGuard from "./pages/public/PortalGuard"
import Register from "./pages/public/Register"
import ResetPassword from "./pages/public/ResetPassword"
import Respond from "./pages/public/Respond"
import VerifyMobile from "./pages/public/VerifyMobile"

// Organizer Portal Pages
import PortalLayout from "./pages/portal/PortalLayout"
import PortalDashboard from "./pages/portal/PortalDashboard"
import PortalEvents from "./pages/portal/PortalEvents"
import EventDetailView from "./pages/portal/EventDetailView"

function App() {
	return (
		<BrowserRouter>
			<Routes>
				{/* Standalone Guest Response Route (Phase 9) */}
				<Route path="respond/:token" element={<Respond />} />

				{/* Protected Organizer Portal Routes (Phase 5, 6, 7, 8, 10) */}
				<Route
					path="portal"
					element={
						<PortalGuard>
							<PortalLayout />
						</PortalGuard>
					}
				>
					<Route index element={<PortalDashboard />} />
					<Route path="events" element={<PortalEvents />} />
					<Route path="events/:id" element={<EventDetailView />} />
					<Route path="membership" element={<Pricing />} />
					<Route path="account" element={<Account />} />
				</Route>

				{/* Public Website Layout & Pages */}
				<Route element={<PublicLayout />}>
					<Route index element={<Home />} />
					<Route path="about" element={<About />} />
					<Route path="pricing" element={<Pricing />} />
					<Route path="gallery" element={<Gallery />} />
					<Route path="faq" element={<FAQ />} />
					<Route path="contact" element={<Contact />} />
					<Route path="login" element={<Login />} />
					<Route path="register" element={<Register />} />
					<Route path="verify-mobile" element={<VerifyMobile />} />
					<Route path="verify-email" element={<VerifyMobile />} />
					<Route path="forgot-password" element={<ForgotPassword />} />
					<Route path="reset-password" element={<ResetPassword />} />
					<Route path="account" element={<Account />} />
					<Route path="demo-onboarding" element={<DemoOnboarding />} />
					<Route path="demo-portal" element={<DemoPortal />} />
				</Route>
			</Routes>
		</BrowserRouter>
	)
}

export default App
