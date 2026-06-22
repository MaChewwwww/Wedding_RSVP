"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Section } from "./section";

/*
  Pre-wedding gallery — Embla carousel with dot navigation,
  gradient slide placeholders, frosted-glass arrows.
*/

const SLIDES = [
  { n: 1, from: "#fde8f0", to: "#f9c2d0" },
  { n: 2, from: "#d4edcf", to: "#b8d9b3" },
  { n: 3, from: "#e8e0f5", to: "#c8b8e8" },
  { n: 4, from: "#fdf3c0", to: "#f5e080" },
  { n: 5, from: "#d6eef8", to: "#a8d4ee" },
  { n: 6, from: "#fde8f0", to: "#e8c0d0" },
];

export function GallerySection() {
  const [emblaRef, embla] = useEmblaCarousel({ loop: false, align: "center" });
  const [selected, setSelected] = React.useState(0);

  const scrollPrev = React.useCallback(() => embla?.scrollPrev(), [embla]);
  const scrollNext = React.useCallback(() => embla?.scrollNext(), [embla]);

  React.useEffect(() => {
    if (!embla) return;
    const onSelect = () => setSelected(embla.selectedScrollSnap());
    embla.on("select", onSelect);
    onSelect();
    return () => { embla.off("select", onSelect); };
  }, [embla]);

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
          Memories
        </p>
        <h2 className="mt-1 font-cursive text-5xl leading-tight text-sage-deep sm:text-6xl">
          Gallery
        </h2>
      </div>

      {/* Carousel Section */}
      <div className="relative mt-10">
        {/* Carousel */}
        <div 
          className="overflow-hidden border-x-2 border-white/50 relative" 
          ref={emblaRef}
        >
          <div className="flex gap-4 sm:gap-6 px-4">
            {SLIDES.map((s) => (
              <div
                key={s.n}
                className="min-w-0 flex-[0_0_85%] sm:flex-[0_0_60%] lg:flex-[0_0_45%] transition-all duration-500 ease-out py-4"
                style={{ 
                  opacity: selected === s.n - 1 ? 1 : 0.5, 
                  transform: selected === s.n - 1 ? "scale(1)" : "scale(0.92)" 
                }}
              >
                {/* Frame wrapper */}
                <div
                  className="rounded-xl shadow-xl mx-auto transition-all duration-500"
                  style={{
                    background: "#fffdf9",
                    padding: "14px",
                    boxShadow: selected === s.n - 1 
                      ? "0 20px 40px -8px rgba(0,0,0,0.2), 0 8px 16px -4px rgba(0,0,0,0.1)" 
                      : "0 10px 20px -5px rgba(0,0,0,0.1)",
                    border: "1px solid rgba(0,0,0,0.04)"
                  }}
                >
                  <div
                    className="flex aspect-[4/3] items-center justify-center rounded-lg overflow-hidden relative"
                    style={{
                      background: `linear-gradient(135deg, ${s.from}, ${s.to})`,
                      boxShadow: "inset 0 2px 10px rgba(0,0,0,0.05)"
                    }}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2 opacity-40">🌸</div>
                      <p className="text-sm font-medium text-ink/50">Gallery Photo {s.n}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Arrow buttons - absolutely positioned alongside the cards */}
        <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none px-1 sm:px-4">
          <button
            type="button"
            aria-label="Previous image"
            onClick={scrollPrev}
            className="pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full transition-all hover:scale-105"
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(143,188,139,0.35)",
              boxShadow: "0 4px 16px rgba(90,156,86,0.2)",
            }}
          >
            <ChevronLeft className="h-6 w-6 text-sage-deep ml-[-2px]" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={scrollNext}
            className="pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full transition-all hover:scale-105"
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(143,188,139,0.35)",
              boxShadow: "0 4px 16px rgba(90,156,86,0.2)",
            }}
          >
            <ChevronRight className="h-6 w-6 text-sage-deep mr-[-2px]" aria-hidden />
          </button>
        </div>
      </div>

      {/* Dot indicators */}
      <div className="mt-5 flex items-center justify-center gap-2" aria-live="polite" aria-label={`Photo ${selected + 1} of ${SLIDES.length}`}>
        {SLIDES.map((s) => (
          <button
            key={s.n}
            type="button"
            aria-label={`Go to photo ${s.n}`}
            onClick={() => embla?.scrollTo(s.n - 1)}
            className="transition-all duration-300"
            style={{
              width: selected === s.n - 1 ? 24 : 8,
              height: 8,
              borderRadius: 99,
              background: selected === s.n - 1
                ? "linear-gradient(to right, #5a9c56, #8fbc8b)"
                : "rgba(90,156,86,0.3)",
              border: "none",
            }}
          />
        ))}
      </div>
    </Section>
  );
}
