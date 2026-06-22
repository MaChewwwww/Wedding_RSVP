import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-blush-light text-rose border border-blush/30",
        success:
          "bg-sage-light text-sage-deep border border-sage/30",
        warning:
          "bg-butter-light text-butter-deep border border-butter/30",
        danger:
          "bg-[rgba(176,48,80,0.1)] text-danger border border-[rgba(176,48,80,0.2)]",
        muted:
          "bg-paper-2 text-muted-ink border border-clay/20",
        lavender:
          "bg-lavender-light text-lavender-deep border border-lavender/30",
        sky:
          "bg-sky-light text-sky border border-sky/30",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
