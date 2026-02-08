"use client"

import * as React from "react"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

export interface SeparatorProps
    extends React.ComponentPropsWithoutRef<"div"> {
    orientation?: "horizontal" | "vertical"
    decorative?: boolean
}

const Separator = React.forwardRef<
    React.ElementRef<"div">,
    SeparatorProps
>(
    (
        { className, orientation = "horizontal", decorative = true, ...props },
        ref
    ) => (
        <div
            ref={ref}
            role={decorative ? "none" : "separator"}
            aria-orientation={orientation}
            className={cn(
                "shrink-0 bg-border",
                orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
                className
            )}
            {...props}
        />
    )
)
Separator.displayName = "Separator"

export { Separator }
