import { Heart } from "lucide-react"
import { useState } from "react"


const galleryImages = [
	{ id: 1015, alt: "Couple celebrating outdoors", tag: "Wedding", aspect: "aspect-[4/5]" },
	{ id: 1011, alt: "Warmly lit celebration table", tag: "Banquet", aspect: "aspect-[5/4]" },
	{ id: 1025, alt: "Guests gathering at an event", tag: "Reception", aspect: "aspect-[4/5]" },
	{ id: 1035, alt: "Elegant event detail", tag: "Decoration", aspect: "aspect-[5/4]" },
	{ id: 1043, alt: "Celebration venue with flowers", tag: "Venue", aspect: "aspect-[4/5]" },
	{ id: 1060, alt: "Friends sharing a joyful moment", tag: "Milestone", aspect: "aspect-[5/4]" },
	{ id: 1067, alt: "Festive event decorations", tag: "Birthday", aspect: "aspect-[4/5]" },
	{ id: 1080, alt: "Outdoor gathering at sunset", tag: "Sunset Gala", aspect: "aspect-[5/4]" },
	{ id: 1084, alt: "Colorful celebration details", tag: "Floral", aspect: "aspect-[4/5]" },
]

const filters = ["All", "Wedding", "Banquet", "Reception", "Venue", "Milestone"]

function Gallery() {
	const [activeFilter, setActiveFilter] = useState("All")

	const filteredImages =
		activeFilter === "All"
			? galleryImages
			: galleryImages.filter((img) => img.tag === activeFilter)

	return (
		<section id="gallery" className="min-h-screen bg-slate-50/70 pb-16">
			<div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-10 lg:px-8">
				
				{/* Top Hero Banner */}
				<div className="gradient-hero-warm relative overflow-hidden rounded-[2.5rem] p-8 text-center text-white soft-shadow-lg sm:p-12">
					<div className="pointer-events-none absolute -right-10 -top-10 size-60 rounded-full bg-white/15 blur-2xl" />
					<div className="relative z-10 mx-auto max-w-2xl">
						<span className="rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
							AI Memory Gallery
						</span>
						<h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
							Moments We&apos;ve Helped Create
						</h1>
						<p className="mt-4 text-sm leading-6 text-orange-100 sm:text-base sm:leading-7">
							A look into the celebrations, guests, and memories powered by Laverna Events.
						</p>
					</div>
				</div>

				{/* Filter Pills */}
				<div className="mt-8 flex justify-center">
					<div className="no-scrollbar flex gap-2 overflow-x-auto rounded-full border border-slate-200/80 bg-white p-1.5 soft-shadow">
						{filters.map((filter) => (
							<button
								key={filter}
								type="button"
								onClick={() => setActiveFilter(filter)}
								className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
									activeFilter === filter
										? "bg-[var(--brand-pink)] text-white shadow-xs"
										: "text-slate-600 hover:bg-slate-100"
								}`}
							>
								{filter}
							</button>
						))}
					</div>
				</div>

				{/* Image Grid */}
				<div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{filteredImages.map(({ id, alt, aspect, tag }) => (
						<div
							key={id}
							className={`group relative overflow-hidden rounded-3xl bg-slate-200 soft-shadow transition-all hover:-translate-y-1 hover:shadow-xl ${aspect}`}
						>
							<img
								src={`https://picsum.photos/id/${id}/900/1100`}
								alt={alt}
								loading="lazy"
								className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 p-6 flex flex-col justify-between">
								<span className="self-start rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-slate-900 shadow-sm backdrop-blur-xs">
									{tag}
								</span>
								<div className="flex items-end justify-between">
									<p className="text-xs font-semibold text-white">{alt}</p>
									<div className="flex size-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-xs">
										<Heart size={16} />
									</div>
								</div>
							</div>
						</div>
					))}
				</div>

			</div>
		</section>
	)
}

export default Gallery
