import { ChevronLeft, ChevronRight } from "lucide-react"
import type { ApiPagination } from "@/lib/api"

interface PaginationProps {
	pagination?: ApiPagination | null
	currentPage: number
	onPageChange: (page: number) => void
}

export default function Pagination({
	pagination,
	currentPage,
	onPageChange,
}: PaginationProps) {
	if (!pagination || pagination.total_pages <= 1) return null

	const totalPages = pagination.total_pages

	return (
		<div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 sm:px-6">
			<p className="text-xs text-slate-500">
				Showing page <span className="font-bold text-slate-900">{currentPage}</span> of{" "}
				<span className="font-bold text-slate-900">{totalPages}</span> ({pagination.count} total items)
			</p>

			<div className="flex items-center gap-1.5">
				<button
					type="button"
					onClick={() => onPageChange(currentPage - 1)}
					disabled={!pagination.previous || currentPage <= 1}
					className="flex size-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
					aria-label="Previous page"
				>
					<ChevronLeft size={16} />
				</button>

				{Array.from({ length: totalPages }, (_, i) => i + 1)
					.filter((page) => {
						return (
							page === 1 ||
							page === totalPages ||
							Math.abs(page - currentPage) <= 1
						)
					})
					.map((page, idx, arr) => {
						const prev = arr[idx - 1]
						return (
							<div key={page} className="flex items-center gap-1">
								{prev && page - prev > 1 && (
									<span className="px-1 text-xs text-slate-400">...</span>
								)}
								<button
									type="button"
									onClick={() => onPageChange(page)}
									className={`size-8 rounded-full text-xs font-bold transition-colors ${
										currentPage === page
											? "bg-[var(--brand-pink)] text-white shadow-xs"
											: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
									}`}
								>
									{page}
								</button>
							</div>
						)
					})}

				<button
					type="button"
					onClick={() => onPageChange(currentPage + 1)}
					disabled={!pagination.next || currentPage >= totalPages}
					className="flex size-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
					aria-label="Next page"
				>
					<ChevronRight size={16} />
				</button>
			</div>
		</div>
	)
}
