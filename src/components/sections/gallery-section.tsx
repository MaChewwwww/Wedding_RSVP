"use client";

import * as React from "react";
import { Section } from "./section";
import { LightboxImage } from "@/components/ui/lightbox";

/*
  Prenup photos — Masonry/Grid layout with year labels and Lightbox.
*/

const PHOTOS = Array.from({ length: 12 }, (_, i) => ({
  year: 2015 + i,
  src: `/assets/History/${2015 + i}-JOBERT-APRIL.jpg.jpg`
}));

export function GallerySection() {
  return (
    <Section
      id="gallery"
      ariaLabel="Pre-wedding gallery"
      style={{
        backgroundImage: "url(/assets/gallery_bg_new.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#e8f5e8",
      }}
    >
      {/* Title */}
      <div className="flex flex-col items-center justify-center text-center">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-sage-deep/70">
          Gallery
        </p>
        <h2 className="mt-1 font-cursive text-5xl leading-tight text-sage-deep sm:text-6xl text-balance">
          Our Journey
        </h2>
      </div>

      {/* Grid Section */}
      <div className="mx-auto mt-12 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PHOTOS.map((photo) => (
            <div
              key={photo.year}
              className="group relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              style={{
                background: "#fffdf9",
                padding: "12px",
                border: "1px solid rgba(143,188,139,0.2)",
              }}
            >
              <LightboxImage
                src={photo.src}
                alt={`Prenup photo from ${photo.year}`}
                wrapperClassName="relative aspect-[4/3] w-full overflow-hidden rounded-xl"
                imageClassName="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              
              <div 
                className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full px-6 py-2 backdrop-blur-md"
                style={{ 
                  background: "rgba(255, 255, 255, 0.75)", 
                  border: "1px solid rgba(255, 255, 255, 0.6)",
                  boxShadow: "0 4px 16px rgba(90,156,86,0.15)"
                }}
              >
                <span className="font-display text-lg font-bold tracking-widest text-sage-deep">
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
