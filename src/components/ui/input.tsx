import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    ref={ref}
    type={type ?? "text"}
    className={cn(
      "flex min-h-11 w-full rounded-xl border border-blush/30 bg-white/70 px-4 py-2.5 text-base text-ink shadow-sm backdrop-blur-sm placeholder:text-muted-ink/50 transition-all duration-200 focus:border-rose/50 focus:bg-white/90 focus:shadow-md focus-visible:outline-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
