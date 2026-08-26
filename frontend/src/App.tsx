
import { BrowserRouter, Route, Routes } from "react-router-dom"
import PublicLayout from "./layouts/PublicLayout"
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
import VerifyEmail from "./pages/public/VerifyEmail"

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route element={<PublicLayout />}>
					<Route index element={<Home />} />
					<Route path="about" element={<About />} />
					<Route path="pricing" element={<Pricing />} />
					<Route path="gallery" element={<Gallery />} />
					<Route path="faq" element={<FAQ />} />
					<Route path="contact" element={<Contact />} />
					<Route path="login" element={<Login />} />
					<Route path="register" element={<Register />} />
					<Route path="verify-email" element={<VerifyEmail />} />
					<Route path="forgot-password" element={<ForgotPassword />} />
					<Route path="account" element={<Account />} />
					<Route path="demo-onboarding" element={<DemoOnboarding />} />
					<Route path="portal" element={<PortalGuard><DemoPortal /></PortalGuard>} />
					<Route path="demo-portal" element={<DemoPortal />} />
				</Route>
			</Routes>
		</BrowserRouter>
	)
}

export default App
