"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { Section } from "./section";

/*
  Our Story timeline — featuring responsive dual-column desktop layout (images on
  opposite side of timeline) and vertically-centered mobile row cards, powered by
  an auto-advancing slide carousel. Scroll-revealed piece-by-piece.
*/

type TimelineEntry = {
  year: string;
  title: string;
  description: string;
  color: string;
  bg: string;
  images: string[];
};

const ENTRIES: TimelineEntry[] = [
  {
    year: "2019",
    title: "How We Met",
    description: "Our story began with a chance encounter. (Placeholder — final timeline copy to be provided.)",
    color: "#d4516e",
    bg: "linear-gradient(135deg, rgba(253,232,240,0.85), rgba(249,194,208,0.60))",
    images: [
      "/assets/story_how_we_met.png",
      "/assets/story_how_we_met_2.png",
      "/assets/story_how_we_met_3.png",
    ],
  },
  {
    year: "2022",
    title: "The Adventure",
    description: "We grew together through every season. (Placeholder — final timeline copy to be provided.)",
    color: "#5a9c56",
    bg: "linear-gradient(135deg, rgba(212,237,207,0.85), rgba(184,217,179,0.60))",
    images: [
      "/assets/story_the_adventure.png",
      "/assets/story_the_adventure_2.png",
      "/assets/story_the_adventure_3.png",
    ],
  },
  {
    year: "2026",
    title: "The Proposal",
    description: "And then, the question that changed everything. (Placeholder — final timeline copy to be provided.)",
    color: "#8b70c0",
    bg: "linear-gradient(135deg, rgba(232,224,245,0.85), rgba(200,184,232,0.60))",
    images: [
      "/assets/story_the_proposal.png",
      "/assets/story_the_proposal_2.png",
      "/assets/story_the_proposal_3.png",
    ],
  },
];

export function TimelineCarousel({
  images,
  title,
  color,
  className,
}: {
  images: string[];
  title: string;
  color: string;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (images.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images, isHovered]);

  return (
    <div
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {images.map((img, i) => (
        <div
          key={img}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: i === index ? 1 : 0, pointerEvents: i === index ? "auto" : "none" }}
        >
          <Image
            src={img}
            alt={`${title} image ${i + 1}`}
            fill
            sizes="(max-width: 640px) 160px, 320px"
            className="object-cover"
            priority={i === 0}
          />
        </div>
      ))}

      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10 bg-black/20 backdrop-blur-[2px] px-2 py-1 rounded-full scale-75 origin-bottom">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setIndex(i);
              }}
              className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                i === index ? "bg-white scale-125" : "bg-white/50"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function StorySection() {
  const reduce = useReducedMotion();

  return (
    <Section
      id="story"
      ariaLabel="Our story"
      style={{
        backgroundImage: "url(/assets/story_bg.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#fdf8f5",
      }}
    >
      {/* Section heading */}
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-lavender-deep/70">
          How it began
        </p>
        <h2 className="mt-2 font-cursive text-5xl leading-tight text-rose sm:text-6xl">
          Our Story
        </h2>
        <div className="mx-auto mt-3 flex items-center justify-center gap-3">
          <div className="h-px w-16" style={{ background: "linear-gradient(to right, rgba(181,160,213,0.6), transparent)" }} />
          <span className="text-lavender/70">✦</span>
          <div className="h-px w-16" style={{ background: "linear-gradient(to left, rgba(181,160,213,0.6), transparent)" }} />
        </div>
      </div>

      <ol className="relative mx-auto mt-16 max-w-4xl">
        {/* Timeline rail */}
        <span
          aria-hidden
          className="absolute left-4 top-0 h-full w-0.5 sm:left-1/2 sm:-ml-[1px]"
          style={{
            background: "linear-gradient(to bottom, rgba(212,81,110,0.4), rgba(139,112,192,0.4), rgba(90,156,86,0.4))",
          }}
        />

        {ENTRIES.map((e, i) => (
          <li
            key={e.year}
            className="relative mb-16 last:mb-0 w-full"
          >
            {/* Timeline dot — scales in on scroll */}
            <motion.span
              aria-hidden
              className="absolute left-1.5 top-8 sm:left-1/2 sm:-ml-2 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white shadow-md z-10"
              style={{ background: e.color }}
              initial={reduce ? false : { scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.5, ease: "backOut", delay: 0.15 }}
            />

            {/* Desktop layout: two columns */}
            <div className="hidden sm:grid sm:grid-cols-2 sm:gap-12 sm:items-center sm:w-full">
              {/* Left Side — slides in from the left */}
              <motion.div
                className={i % 2 === 0 ? "text-right flex justify-end" : "flex justify-end"}
                initial={reduce ? false : { x: -35, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                {i % 2 === 0 ? (
                  /* Text Card (left side for even) */
                  <div
                    className="rounded-2xl px-6 py-6 shadow-md max-w-sm text-right"
                    style={{
                      background: e.bg,
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      border: `1px solid ${e.color}30`,
                      boxShadow: `0 8px 28px ${e.color}18, 0 1px 0 rgba(255,255,255,0.7) inset`,
                    }}
                  >
                    <span
                      className="inline-block rounded-full px-3 py-0.5 text-xs font-bold tracking-widest text-white mb-2"
                      style={{ background: e.color }}
                    >
                      {e.year}
                    </span>
                    <h3 className="font-display text-xl font-semibold text-ink">{e.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-ink">{e.description}</p>
                  </div>
                ) : (
                  /* Carousel (left side for odd) */
                  <div className="flex justify-end w-full pr-4">
                    <TimelineCarousel
                      images={e.images}
                      title={e.title}
                      color={e.color}
                      className="relative h-56 w-56 sm:h-64 sm:w-64 overflow-hidden rounded-2xl border-4 border-white shadow-lg bg-white/20 shrink-0"
                    />
                  </div>
                )}
              </motion.div>

              {/* Right Side — slides in from the right */}
              <motion.div
                className={i % 2 === 0 ? "flex justify-start" : "text-left flex justify-start"}
                initial={reduce ? false : { x: 35, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                {i % 2 === 0 ? (
                  /* Carousel (right side for even) */
                  <div className="flex justify-start w-full pl-4">
                    <TimelineCarousel
                      images={e.images}
                      title={e.title}
                      color={e.color}
                      className="relative h-56 w-56 sm:h-64 sm:w-64 overflow-hidden rounded-2xl border-4 border-white shadow-lg bg-white/20 shrink-0"
                    />
                  </div>
                ) : (
                  /* Text Card (right side for odd) */
                  <div
                    className="rounded-2xl px-6 py-6 shadow-md max-w-sm text-left"
                    style={{
                      background: e.bg,
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      border: `1px solid ${e.color}30`,
                      boxShadow: `0 8px 28px ${e.color}18, 0 1px 0 rgba(255,255,255,0.7) inset`,
                    }}
                  >
                    <span
                      className="inline-block rounded-full px-3 py-0.5 text-xs font-bold tracking-widest text-white mb-2"
                      style={{ background: e.color }}
                    >
                      {e.year}
                    </span>
                    <h3 className="font-display text-xl font-semibold text-ink">{e.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-ink">{e.description}</p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Mobile layout — fades and rises slightly */}
            <motion.div
              className="sm:hidden pl-10 pr-2"
              initial={reduce ? false : { y: 25, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div
                className="rounded-2xl px-4 py-4 shadow-md flex flex-row gap-4 items-center"
                style={{
                  background: e.bg,
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: `1px solid ${e.color}30`,
                  boxShadow: `0 8px 28px ${e.color}18, 0 1px 0 rgba(255,255,255,0.7) inset`,
                }}
              >
                {/* Image carousel container (vertically centered via flex items-center) */}
                <TimelineCarousel
                  images={e.images}
                  title={e.title}
                  color={e.color}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/50 bg-white/20"
                />

                {/* Text content */}
                <div className="flex-1 min-w-0">
                  <span
                    className="inline-block rounded-full px-3 py-0.5 text-xs font-bold tracking-widest text-white mb-1.5"
                    style={{ background: e.color }}
                  >
                    {e.year}
                  </span>
                  <h3 className="font-display text-lg font-semibold text-ink leading-snug">{e.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-ink">{e.description}</p>
                </div>
              </div>
            </motion.div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
