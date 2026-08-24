const galleryImages = [
	{ id: 1015, alt: "Couple celebrating outdoors", aspect: "aspect-[4/5]" },
	{ id: 1011, alt: "Warmly lit celebration table", aspect: "aspect-[5/4]" },
	{ id: 1025, alt: "Guests gathering at an event", aspect: "aspect-[4/5]" },
	{ id: 1035, alt: "Elegant event detail", aspect: "aspect-[5/4]" },
	{ id: 1043, alt: "Celebration venue with flowers", aspect: "aspect-[4/5]" },
	{ id: 1060, alt: "Friends sharing a joyful moment", aspect: "aspect-[5/4]" },
	{ id: 1067, alt: "Festive event decorations", aspect: "aspect-[4/5]" },
	{ id: 1080, alt: "Outdoor gathering at sunset", aspect: "aspect-[5/4]" },
	{ id: 1084, alt: "Colorful celebration details", aspect: "aspect-[4/5]" },
]

function Gallery() {
	return (
		<section id="gallery" className="bg-slate-50/70">
			<div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
				<div className="mx-auto max-w-3xl text-center">
					<p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand-pink)]">
						Gallery
					</p>
					<h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--brand-navy)] sm:text-5xl">
						Moments We&apos;ve Helped Create
					</h1>
					<p className="mt-6 text-base leading-8 text-slate-600 sm:text-lg">
						A glimpse at the celebrations, connections, and memories made possible with LavernaEvents.
					</p>
				</div>

				<div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{galleryImages.map(({ id, alt, aspect }) => (
						<div key={id} className={`overflow-hidden rounded-xl bg-slate-200 ${aspect}`}>
							<img
								src={`https://picsum.photos/id/${id}/900/1100`}
								alt={alt}
								loading="lazy"
								className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
							/>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}

export default Gallery
