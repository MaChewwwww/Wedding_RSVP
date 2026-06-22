"use client";

import Image from "next/image";
import * as React from "react";

/*
  Featured pre-wedding — couple hero illustration as full-bleed background,
  polaroid-style photo placeholders with hover tilt.
*/

const PHOTO_COUNT = 3;

const PHOTO_COLORS = [
  { from: "#fde8f0", to: "#f9c2d0", label: "blush" },
  { from: "#d4edcf", to: "#b8d9b3", label: "sage" },
  { from: "#e8e0f5", to: "#c8b8e8", label: "lavender" },
];

export function FeaturedSection() {
  return (
    <section
      id="featured"
      aria-label="Featured pre-wedding photographs"
      className="relative w-full overflow-hidden"
      style={{ minHeight: "80vh" }}
    >
      {/* Full-bleed couple illustration background */}
      <div className="absolute inset-0">
        <Image
          src="/assets/bg4.png"
          alt="Jobert and April in a romantic watercolor garden"
          fill
          priority
          className="object-cover object-left sm:scale-[1.25] sm:origin-left"
          sizes="100vw"
        />
        {/* Gradient overlay for text legibility and pastel mood */}
        <div className="absolute inset-0"
          style={{
            background: "linear-gradient(to right, rgba(253,244,232,0.60) 0%, rgba(253,232,240,0.40) 35%, rgba(253,244,232,0.15) 65%, transparent 100%)",
          }} />

        {/* Top paper-fade overlay */}
        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-[#fdfbf7] to-transparent pointer-events-none" />
        {/* Bottom paper-fade overlay */}
        <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#fdfbf7] to-transparent pointer-events-none" />
      </div>

      {/* Content */}
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-8 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-2">
        {/* Left — copy */}
        <div className="flex flex-col gap-5">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-blush-deep/80">
            Pre-Wedding
          </p>
          <h2 className="font-cursive text-6xl leading-tight text-rose sm:text-7xl"
            style={{ textShadow: "0 2px 16px rgba(212,81,110,0.12)" }}>
            Jobert &amp; April
          </h2>
          <div className="flex items-center gap-3">
            <div className="h-px w-16"
              style={{ background: "linear-gradient(to right, rgba(212,81,110,0.5), transparent)" }} />
            <span className="text-rose/60">✦</span>
          </div>
          <p className="max-w-sm text-base leading-relaxed text-ink/75">
            A few of our favorite moments leading up to the big day — a glimpse into our love story.
          </p>

          {/* Polaroid photo grid */}
          <div className="relative mt-12 flex flex-col items-start sm:mt-12 sm:grid sm:grid-cols-3 sm:gap-4 sm:scale-[1.30] sm:origin-left">
            {Array.from({ length: PHOTO_COUNT }).map((_, i) => (
              <div
                key={i}
                className={`group relative w-[180px] cursor-pointer sm:w-auto ${i === 0 ? "z-10 ml-4 sm:ml-0" : i === 1 ? "z-20 -mt-12 ml-12 sm:mt-0 sm:ml-0" : "z-30 -mt-10 ml-6 sm:mt-0 sm:ml-0"
                  }`}
                style={{
                  transform: `rotate(${i === 0 ? "-4" : i === 1 ? "6" : "-2"}deg)`,
                  transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "rotate(0deg) scale(1.05)";
                  (e.currentTarget as HTMLDivElement).style.zIndex = "40";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = `rotate(${i === 0 ? "-4" : i === 1 ? "6" : "-2"}deg)`;
                  (e.currentTarget as HTMLDivElement).style.zIndex = i === 0 ? "10" : i === 1 ? "20" : "30";
                }}
              >
                {/* Polaroid frame */}
                <div
                  className="rounded-sm shadow-lg"
                  style={{
                    background: "#fffdf9",
                    padding: "8px 8px 24px",
                    boxShadow: "0 12px 30px -5px rgba(0,0,0,0.25), 0 8px 15px -5px rgba(0,0,0,0.15)",
                  }}
                >
                  <div
                    className="flex aspect-square items-center justify-center rounded-sm text-xs font-medium"
                    style={{
                      background: `linear-gradient(135deg, ${PHOTO_COLORS[i].from}, ${PHOTO_COLORS[i].to})`,
                      color: "rgba(80,50,50,0.6)",
                    }}
                  >
                    Photo {i + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — spacer on large screens so background shows */}
        <div className="hidden lg:block" />
      </div>
    </section>
  );
}
