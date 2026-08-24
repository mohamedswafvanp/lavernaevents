
import { BrowserRouter, Route, Routes } from "react-router-dom"
import PublicLayout from "./layouts/PublicLayout"
import About from "./pages/public/About"
import Contact from "./pages/public/Contact"
import FAQ from "./pages/public/FAQ"
import Gallery from "./pages/public/Gallery"
import Home from "./pages/public/Home"
import Login from "./pages/public/Login"
import Pricing from "./pages/public/Pricing"
import Register from "./pages/public/Register"

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
				</Route>
			</Routes>
		</BrowserRouter>
	)
}

export default App
