import { Skeleton } from "@/components/ui/skeleton"

function PageSkeleton() {
	return (
		<section aria-label="Loading page" className="bg-white">
			<div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
				<div className="mx-auto max-w-3xl text-center">
					<Skeleton className="mx-auto h-4 w-24" />
					<Skeleton className="mx-auto mt-5 h-12 w-3/4 max-w-xl" />
					<Skeleton className="mx-auto mt-6 h-5 w-full max-w-2xl" />
					<Skeleton className="mx-auto mt-2 h-5 w-2/3 max-w-xl" />
				</div>

				<div className="mx-auto mt-12 max-w-5xl space-y-5">
					<Skeleton className="h-24 w-full" />
					<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
						{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-40 w-full" />)}
					</div>
				</div>
			</div>
		</section>
	)
}

export default PageSkeleton