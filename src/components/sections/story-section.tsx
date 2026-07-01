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

      {/* Grid Timeline Section */}
      <div className="mx-auto mt-12 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {PHOTOS.map((photo) => (
            <div
              key={photo.year}
              className="group relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              style={{
                background: "#fffdf9",
                padding: "12px",
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
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              
              {/* Floating Year Badge */}
              <div 
                className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full px-6 py-2 backdrop-blur-md transition-transform duration-500 group-hover:-translate-y-1"
                style={{ 
                  background: "rgba(255, 255, 255, 0.8)", 
                  border: "1px solid rgba(255, 255, 255, 0.6)",
                  boxShadow: "0 4px 16px rgba(181,160,213,0.2)"
                }}
              >
                <span className="font-display text-xl font-bold tracking-widest text-lavender-deep drop-shadow-sm">
                  {photo.year}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
