import { Outlet } from "react-router-dom"
import Footer from "../components/public/Footer"
import Navbar from "../components/public/Navbar"

function PublicLayout() {
	return (
		<>
			<Navbar />
			<main>
				<Outlet />
			</main>
			<Footer />
		</>
	)
}

export default PublicLayout
