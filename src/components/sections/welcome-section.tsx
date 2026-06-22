"use client";

import * as React from "react";
import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { site } from "@/config/site";

/*
  Welcome section — full-bleed bg2 artwork with improved scrim, animated
  heading, personalized guest name badge, and scroll-down cue.
*/
export function WelcomeSection({ displayName, weddingDate }: { displayName?: string, weddingDate?: string }) {
  return (
    <section
      id="welcome"
      aria-label="Welcome"
      className="relative flex min-h-[78svh] w-full items-start justify-center overflow-hidden"
      style={{
        backgroundImage: "url(/assets/generated_bg3.png)",
        backgroundSize: "cover",
        backgroundPosition: "center 30%",
      }}
    >
      {/* Soft elegant overlay to help text readability without muddiness */}
      <div className="absolute inset-0 bg-white/5 pointer-events-none" />

      {/* Top dark gradient overlay for navbar contrast and depth */}
      <div className="absolute inset-x-0 top-0 h-[25svh] bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative mx-auto mt-[12svh] max-w-2xl px-6 text-center">
        {/* Guest name badge */}
        {displayName && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full px-5 py-2"
            style={{
              background: "rgba(253,232,240,0.75)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(240,168,188,0.4)",
              boxShadow: "0 4px 16px rgba(160,80,100,0.08)",
            }}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-blush-deep/80">
              Welcome,
            </span>
            <span className="font-display text-sm font-medium text-ink">
              {displayName}
            </span>
          </motion.div>
        )}

        {/* Couple name — cursive */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="font-cursive text-7xl leading-none text-rose sm:text-8xl"
          style={{ textShadow: "0 2px 24px rgba(212,81,110,0.15)" }}
        >
          {site.couple.displayName}
        </motion.h1>

        {/* Divider ornament */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mx-auto my-4 flex items-center justify-center gap-3"
        >
          <div className="h-px flex-1 max-w-[80px]"
            style={{ background: "linear-gradient(to left, rgba(212,81,110,0.5), transparent)" }} />
          <span className="text-rose/70 text-lg">✦</span>
          <div className="h-px flex-1 max-w-[80px]"
            style={{ background: "linear-gradient(to right, rgba(212,81,110,0.5), transparent)" }} />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="font-display text-2xl font-light tracking-wide text-muted-ink sm:text-3xl"
        >
          Wedding Celebration
        </motion.p>

        {/* Date badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.75 }}
          className="mt-5 inline-block rounded-full px-6 py-2.5"
          style={{
            background: "linear-gradient(135deg, rgba(240,168,188,0.3), rgba(181,160,213,0.25))",
            border: "1px solid rgba(240,168,188,0.35)",
            backdropFilter: "blur(8px)",
          }}
        >
          <span className="font-display text-lg font-medium text-ink">
            {weddingDate || site.event.weddingDate}
          </span>
        </motion.div>

        {/* Thank-you message */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="mx-auto mt-6 max-w-md text-balance text-base text-ink/75 leading-relaxed"
        >
          {site.copy.welcome.thankYou}
        </motion.p>
      </div>

      {/* Scroll-down arrow */}
      <motion.a
        href="#pass"
        aria-label="Scroll to next section"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex h-10 w-10 items-center justify-center rounded-full z-20 pointer-events-auto"
        style={{
          background: "rgba(253,232,240,0.7)",
          border: "1px solid rgba(240,168,188,0.4)",
          backdropFilter: "blur(8px)",
          animation: "bounce-y 2s ease-in-out infinite",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.4 }}
      >
        <ChevronDown className="h-5 w-5 text-rose/80" aria-hidden />
      </motion.a>

      {/* Bottom fade to warm ivory paper background */}
      <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#fdfbf7] to-transparent pointer-events-none" />
    </section>
  );
}
