import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <div className={cn("relative flex w-full items-center", className)}>
    <select
      ref={ref}
      className={cn(
        "flex min-h-11 w-full appearance-none rounded-xl border border-blush/30 bg-white/70 px-4 py-2.5 pr-10 text-sm text-ink shadow-sm backdrop-blur-sm transition-all duration-200 focus:border-rose/50 focus:bg-white/90 focus:shadow-md focus-visible:outline-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-50",
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown
      className="pointer-events-none absolute right-3 h-4 w-4 text-ink/50"
      aria-hidden
    />
  </div>
));
Select.displayName = "Select";
