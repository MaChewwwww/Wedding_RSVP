"use client";

import * as React from "react";
import { LightboxImage } from "@/components/ui/lightbox";
import { Section } from "./section";

/*
  Our Story photos — Vertical Alternating Timeline
  Images live in public/assets/History
*/

const PHOTOS = Array.from({ length: 12 }, (_, i) => ({
  year: 2015 + i,
  src: `/assets/History/${2015 + i}-JOBERT-APRIL.jpg.jpg`
}));

export function StorySection() {
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
      {/* Title */}
      <div className="flex flex-col items-center justify-center text-center">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-lavender-deep/70">
          How it began
        </p>
        <h2 className="mt-2 font-cursive text-5xl leading-tight text-rose sm:text-6xl text-balance">
          Our Story
        </h2>
        <div className="mx-auto mt-3 flex items-center justify-center gap-3">
          <div className="h-px w-16" style={{ background: "linear-gradient(to right, rgba(181,160,213,0.6), transparent)" }} />
          <span className="text-lavender/70">✦</span>
          <div className="h-px w-16" style={{ background: "linear-gradient(to left, rgba(181,160,213,0.6), transparent)" }} />
        </div>
      </div>

      {/* Timeline Section */}
      <div className="relative mt-16 max-w-5xl mx-auto px-4 sm:px-6">
        {/* Central Vertical Axis */}
        <div 
          className="absolute left-[39px] md:left-1/2 top-4 bottom-4 w-px md:-translate-x-1/2"
          style={{ 
            background: "linear-gradient(to bottom, transparent, rgba(181,160,213,0.6) 5%, rgba(212,81,110,0.6) 95%, transparent)"
          }} 
        />

        <div className="relative flex flex-col gap-16 md:gap-24">
          {PHOTOS.map((photo, i) => {
            const isRightSide = i % 2 === 0; // 0, 2, 4 -> Right side on desktop
            return (
              <div 
                key={photo.year} 
                className={`relative flex flex-col md:flex-row md:items-center md:justify-between ${
                  !isRightSide ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Desktop: Empty space to force the card to one side */}
                <div className="hidden md:block md:w-[45%]" />

                {/* The Timeline Node */}
                <div className="absolute left-[39px] md:left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-[#fdf8f5] shadow-[0_0_0_6px_#fdf8f5] z-10 top-2 md:top-1/2 md:-translate-y-1/2">
                  <div 
                    className="h-3 w-3 rounded-full"
                    style={{ background: "linear-gradient(135deg, #b5a0d5, #d4516e)" }}
                  />
                </div>

                {/* The Card */}
                <div className={`relative w-full pl-[80px] md:pl-0 md:w-[45%] transition-all duration-500 hover:-translate-y-2 group`}>
                  
                  {/* Connecting Line (Desktop Only) */}
                  <div 
                    className={`hidden md:block absolute top-1/2 h-px w-[calc(11.111vw-3rem)] max-w-[4rem] bg-lavender-deep/30 -translate-y-1/2 ${
                      isRightSide ? "right-full" : "left-full"
                    }`}
                  />

                  {/* Year Label */}
                  <div className={`mb-4 flex items-center gap-4 ${isRightSide ? "md:justify-start" : "md:justify-end"}`}>
                    <span className="font-display text-4xl font-black tracking-widest text-lavender-deep drop-shadow-sm transition-colors group-hover:text-rose">
                      {photo.year}
                    </span>
                    <div className="h-px flex-1 bg-lavender-deep/10 md:hidden" />
                  </div>

                  {/* Image Frame */}
                  <div
                    className="relative overflow-hidden rounded-2xl shadow-xl transition-all duration-300 group-hover:shadow-2xl"
                    style={{
                      background: "#fffdf9",
                      padding: "14px",
                      border: "1px solid rgba(181,160,213,0.3)",
                    }}
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
                      <LightboxImage
                        src={photo.src}
                        alt={`Story photo from ${photo.year}`}
                        wrapperClassName="absolute inset-0"
                        imageClassName="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        fill
                        sizes="(max-width: 768px) 90vw, 45vw"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
