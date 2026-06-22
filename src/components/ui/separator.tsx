import * as React from "react";
import { cn } from "@/lib/utils";

export function Separator({ className, ...props }: React.HTMLAttributes<HTMLHRElement>) {
  return (
    <hr
      className={cn("border-0 h-px", className)}
      style={{ background: "rgba(240,168,188,0.25)" }}
      {...props}
    />
  );
}
