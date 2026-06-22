"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";

export type DividerVariant = "wave" | "cloud" | "tilt" | "petal" | "torn";

interface Props {
  /** Unused topColor for backwards compatibility */
  topColor?: string;
  /** Unused bottomColor for backwards compatibility */
  bottomColor?: string;
  /** Unused glowColor for backwards compatibility */
  glowColor?: string;
  /** Unused shape variant for backwards compatibility */
  variant?: DividerVariant;
  /** Unused flip for backwards compatibility */
  flip?: boolean;
  /** Unused height for backwards compatibility */
  height?: number;
  /** Unused align for backwards compatibility */
  align?: "top" | "bottom";
}

/*
  SectionDivider — a delicate hand-drawn floral sprig that draws itself in as it
  scrolls into view. Two tapering gradient hairlines reach out from a central
  gold blossom and dissolve into the paper, giving each section a soft, breathing
  pause rather than a hard cut. Respects prefers-reduced-motion.
*/
export function SectionDivider(_props: Props) {
  const reduce = useReducedMotion();

  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    show: (i: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: reduce ? 0 : 1.1, ease: "easeInOut" as const, delay: reduce ? 0 : 0.15 + i * 0.08 },
        opacity: { duration: reduce ? 0 : 0.3, delay: reduce ? 0 : 0.15 + i * 0.08 },
      },
    }),
  } as const;

  const bloom = {
    hidden: { scale: 0, opacity: 0, rotate: -40 },
    show: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: { type: "spring", stiffness: 180, damping: 14, delay: reduce ? 0 : 0.55 },
    },
  } as const;

  const fade = {
    hidden: { opacity: 0 },
    show: (i: number) => ({
      opacity: 1,
      transition: { duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.7 + i * 0.06 },
    }),
  } as const;

  return (
    <div
      aria-hidden
      className="relative flex items-center justify-center gap-4 w-full px-6 py-10 md:gap-6 md:py-12 pointer-events-none select-none overflow-hidden my-[-40px] md:my-[-48px] z-30"
    >
      {/* Reusable SVG filters for watercolor deckle/bleed effect */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="watercolor-bleed" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.04"
              numOctaves="3"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="22"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Gradient pastel band — rose → lavender → mint with organic watercolor blend */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,182,208,0.85) 0%, rgba(255,209,220,0.88) 20%, rgba(216,196,255,0.9) 50%, rgba(178,240,214,0.88) 80%, rgba(160,232,204,0.85) 100%)",
          filter: "url(#watercolor-bleed)",
          WebkitFilter: "url(#watercolor-bleed)",
          maskImage: "radial-gradient(ellipse 85% 90% at center, black 0%, rgba(0,0,0,0.8) 40%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 85% 90% at center, black 0%, rgba(0,0,0,0.8) 40%, transparent 80%)",
        }}
      />

      {/* Left tapering line — gold */}
      <motion.div
        className="relative flex-1 max-w-[34vw] origin-right"
        style={{
          height: "3px",
          borderRadius: "2px",
          background:
            "linear-gradient(to right, transparent, rgba(212,175,55,0.55) 30%, rgba(212,175,55,0.9) 70%, rgba(200,150,60,0.95))",
        }}
        initial={reduce ? false : { scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: reduce ? 0 : 0.9, ease: "easeOut" }}
      />

      <motion.svg
        width="260"
        height="44"
        viewBox="0 0 260 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative shrink-0"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.8 }}
      >
        <defs>
          {/* Metallic gold sweep for all strokes */}
          <linearGradient id="div-gold" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#c8963c" stopOpacity="0" />
            <stop offset="18%" stopColor="#d4af37" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#f3e5ab" />
            <stop offset="82%" stopColor="#d4af37" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#c8963c" stopOpacity="0" />
          </linearGradient>
          {/* Gold petal fill — warm cream to gold */}
          <radialGradient id="div-petal" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#fffdf0" />
            <stop offset="50%" stopColor="#f3e5ab" />
            <stop offset="100%" stopColor="#c8963c" />
          </radialGradient>
          {/* Animated shimmer */}
          <linearGradient id="div-shimmer" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fffdf5" stopOpacity="0" />
            <stop offset="50%" stopColor="#fffdf5" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#fffdf5" stopOpacity="0" />
            {!reduce && (
              <animate
                attributeName="x1"
                values="-1;1"
                dur="3.5s"
                repeatCount="indefinite"
              />
            )}
            {!reduce && (
              <animate
                attributeName="x2"
                values="0;2"
                dur="3.5s"
                repeatCount="indefinite"
              />
            )}
          </linearGradient>
        </defs>

        {/* ── Lines reaching outward — gold ── */}
        <motion.path
          custom={0}
          variants={draw}
          d="M122,22 H8"
          stroke="url(#div-gold)"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <motion.path
          custom={0}
          variants={draw}
          d="M138,22 H252"
          stroke="url(#div-gold)"
          strokeWidth="2.8"
          strokeLinecap="round"
        />

        {/* ── Vine sprigs with leaves, left — gold ── */}
        <motion.path
          custom={1}
          variants={draw}
          d="M112,22 C100,22 96,12 86,12 M112,22 C100,22 96,32 86,32"
          stroke="url(#div-gold)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <motion.path
          custom={2}
          variants={draw}
          d="M86,12 C80,9 78,5 80,2 C84,4 86,8 86,12 Z"
          stroke="#d4af37"
          strokeWidth="1.5"
          fill="#f3e5ab"
          fillOpacity="0.55"
          strokeLinejoin="round"
        />
        <motion.path
          custom={2}
          variants={draw}
          d="M86,32 C80,35 78,39 80,42 C84,40 86,36 86,32 Z"
          stroke="#d4af37"
          strokeWidth="1.5"
          fill="#f3e5ab"
          fillOpacity="0.55"
          strokeLinejoin="round"
        />

        {/* ── Vine sprigs with leaves, right — gold ── */}
        <motion.path
          custom={1}
          variants={draw}
          d="M148,22 C160,22 164,12 174,12 M148,22 C160,22 164,32 174,32"
          stroke="url(#div-gold)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <motion.path
          custom={2}
          variants={draw}
          d="M174,12 C180,9 182,5 180,2 C176,4 174,8 174,12 Z"
          stroke="#d4af37"
          strokeWidth="1.5"
          fill="#f3e5ab"
          fillOpacity="0.55"
          strokeLinejoin="round"
        />
        <motion.path
          custom={2}
          variants={draw}
          d="M174,32 C180,35 182,39 180,42 C176,40 174,36 174,32 Z"
          stroke="#d4af37"
          strokeWidth="1.5"
          fill="#f3e5ab"
          fillOpacity="0.55"
          strokeLinejoin="round"
        />

        {/* ── Outer accent dots — gold ── */}
        <motion.circle custom={0} variants={fade} cx="4" cy="22" r="2.5" fill="#d4af37" />
        <motion.circle custom={1} variants={fade} cx="256" cy="22" r="2.5" fill="#d4af37" />

        {/* ── Central blossom — gold ── */}
        <motion.g variants={bloom} style={{ transformOrigin: "130px 22px" }}>
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <ellipse
              key={angle}
              cx="130"
              cy="12"
              rx="4.5"
              ry="9"
              fill="url(#div-petal)"
              fillOpacity="0.95"
              transform={`rotate(${angle} 130 22)`}
            />
          ))}
          {/* Outer ring */}
          <circle cx="130" cy="22" r="8" stroke="#d4af37" strokeWidth="1.2" fill="none" opacity="0.6" />
          {/* Inner centre */}
          <circle cx="130" cy="22" r="4.5" fill="#f0c84a" />
          <circle cx="130" cy="22" r="3" fill="#d4af37" />
          <circle cx="130" cy="22" r="7.5" stroke="url(#div-gold)" strokeWidth="0.8" fill="none" opacity="0.5" />
        </motion.g>

        {/* ── Traveling shimmer overlay on the hairlines ── */}
        {!reduce && (
          <rect
            x="0"
            y="20"
            width="260"
            height="4"
            fill="url(#div-shimmer)"
            opacity="0.6"
          />
        )}
      </motion.svg>

      {/* Right tapering line — gold */}
      <motion.div
        className="relative flex-1 max-w-[34vw] origin-left"
        style={{
          height: "3px",
          borderRadius: "2px",
          background:
            "linear-gradient(to left, transparent, rgba(212,175,55,0.55) 30%, rgba(212,175,55,0.9) 70%, rgba(200,150,60,0.95))",
        }}
        initial={reduce ? false : { scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: reduce ? 0 : 0.9, ease: "easeOut" }}
      />
    </div>
  );
}
