import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
	return <AccordionPrimitive.Root className={cn("w-full", className)} {...props} />
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
	return (
		<AccordionPrimitive.Item
			className={cn("border-b border-slate-200 last:border-b-0", className)}
			{...props}
		/>
	)
}

function AccordionTrigger({ className, children, ...props }: AccordionPrimitive.Trigger.Props) {
	return (
		<AccordionPrimitive.Header>
			<AccordionPrimitive.Trigger
				className={cn(
					"flex w-full items-center justify-between gap-6 py-5 text-left text-base font-semibold text-[var(--brand-navy)] transition-colors hover:text-[var(--brand-pink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brand-pink)]",
					className,
				)}
				{...props}
			>
				{children}
				<ChevronDown aria-hidden="true" className="shrink-0 transition-transform duration-200 data-panel-open:rotate-180" size={20} />
			</AccordionPrimitive.Trigger>
		</AccordionPrimitive.Header>
	)
}

function AccordionContent({ className, children, ...props }: AccordionPrimitive.Panel.Props) {
	return (
		<AccordionPrimitive.Panel
			className={cn("pb-5 pr-10 text-sm leading-7 text-slate-600", className)}
			{...props}
		>
			{children}
		</AccordionPrimitive.Panel>
	)
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }