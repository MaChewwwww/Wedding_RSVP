import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-20 w-full rounded-xl border border-blush/30 bg-white/70 px-4 py-3 text-sm text-ink shadow-sm backdrop-blur-sm placeholder:text-muted-ink/50 transition-all duration-200 focus:border-rose/50 focus:bg-white/90 focus:shadow-md focus-visible:outline-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
