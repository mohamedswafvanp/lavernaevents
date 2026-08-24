
import { BrowserRouter, Route, Routes } from "react-router-dom"
import PublicLayout from "./layouts/PublicLayout"
import About from "./pages/public/About"
import Contact from "./pages/public/Contact"
import FAQ from "./pages/public/FAQ"
import Gallery from "./pages/public/Gallery"
import Home from "./pages/public/Home"
import Pricing from "./pages/public/Pricing"

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
				</Route>
			</Routes>
		</BrowserRouter>
	)
}

export default App
