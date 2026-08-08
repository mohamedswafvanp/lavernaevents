
import PublicLayout from "./layouts/PublicLayout"
import Footer from "./components/public/Footer"
import Navbar from "./components/public/Navbar"
import Home from "./pages/public/Home"

function App() {
	return (
		<PublicLayout>
			<Navbar />
			<main>
				<Home />
			</main>
			<Footer />
		</PublicLayout>
	)
}

export default App
