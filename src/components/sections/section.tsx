"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/*
  Shared anchored section wrapper (docs/design.md "Motion system"). Subtle
  title/media reveal on scroll; reduced-motion shows the content immediately.
  Backgrounds are passed as className/style by each section. Decoration lives at
  the edges; content sits in a centered max-width column.
*/

export function Section({
  id,
  className,
  style,
  children,
  ariaLabel,
}: {
  id: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  ariaLabel?: string;
}) {
  const reduce = useReducedMotion();
  const hasBgImage = !!style?.backgroundImage || !!style?.background;

  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={cn("relative w-full overflow-hidden", className)}
      style={style}
    >
      {hasBgImage && (
        <>
          {/* Top pastel-fade overlay — rose → lavender → mint blending into section */}
          <div
            className="absolute top-0 inset-x-0 h-28 pointer-events-none z-10"
            style={{
              background: "linear-gradient(to bottom, rgba(255,182,208,0.55) 0%, rgba(216,196,255,0.35) 45%, transparent 100%)",
            }}
          />
          {/* Bottom pastel-fade overlay */}
          <div
            className="absolute bottom-0 inset-x-0 h-28 pointer-events-none z-10"
            style={{
              background: "linear-gradient(to top, rgba(178,240,214,0.55) 0%, rgba(216,196,255,0.35) 45%, transparent 100%)",
            }}
          />
        </>
      )}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0 }}
        transition={{ duration: reduce ? 0 : 0.5, ease: "easeOut" }}
        className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20 relative z-20"
      >
        {children}
      </motion.div>
    </section>
  );
}
