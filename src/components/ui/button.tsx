import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/*
  Button primitive — pastel wedding theme.
  Primary: gradient blush-to-rose with hover lift.
  Minimum 44px touch targets for default/lg sizes.
*/
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-focus disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-blush-deep to-rose text-white shadow-md hover:scale-[1.03] hover:shadow-lg active:scale-[0.97]",
        secondary:
          "bg-gradient-to-r from-sage to-sage-deep text-white shadow-md hover:scale-[1.03] hover:shadow-lg active:scale-[0.97]",
        outline:
          "border border-blush/50 bg-white/60 text-rose backdrop-blur-sm hover:bg-blush-light hover:border-blush",
        ghost:
          "text-ink hover:bg-blush-light/60",
        danger:
          "bg-gradient-to-r from-rose to-danger text-white shadow-md hover:scale-[1.03]",
        link:
          "text-rose underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        default: "min-h-11 px-6 py-2.5",
        lg: "min-h-12 px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type, ...props }, ref) => (
    <button
      ref={ref}
      type={type ?? "button"}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { buttonVariants };
