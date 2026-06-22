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
        backgroundImage: "url(/assets/bg1.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#e8f5e8",
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-sage-deep/70">
            Memories
          </p>
          <h2 className="mt-1 font-cursive text-5xl leading-tight text-sage-deep sm:text-6xl">
            Gallery
          </h2>
        </div>

        {/* Arrow buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Previous image"
            onClick={scrollPrev}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full transition-all hover:scale-105"
            style={{
              background: "rgba(255,255,255,0.65)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(143,188,139,0.35)",
              boxShadow: "0 4px 12px rgba(90,156,86,0.12)",
            }}
          >
            <ChevronLeft className="h-5 w-5 text-sage-deep" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={scrollNext}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full transition-all hover:scale-105"
            style={{
              background: "rgba(255,255,255,0.65)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(143,188,139,0.35)",
              boxShadow: "0 4px 12px rgba(90,156,86,0.12)",
            }}
          >
            <ChevronRight className="h-5 w-5 text-sage-deep" aria-hidden />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div className="mt-8 overflow-hidden" ref={emblaRef}>
        <div className="flex gap-5">
          {SLIDES.map((s) => (
            <div
              key={s.n}
              className="min-w-0 flex-[0_0_82%] sm:flex-[0_0_58%] lg:flex-[0_0_42%] transition-all duration-300"
              style={{ opacity: selected === s.n - 1 ? 1 : 0.65, transform: selected === s.n - 1 ? "scale(1)" : "scale(0.97)" }}
            >
              <div
                className="flex aspect-[4/3] items-center justify-center rounded-2xl shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${s.from}, ${s.to})`,
                  boxShadow: "0 12px 40px rgba(80,60,60,0.12), 0 2px 8px rgba(80,60,60,0.08)",
                  border: "1px solid rgba(255,255,255,0.6)",
                }}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2 opacity-40">🌸</div>
                  <p className="text-sm font-medium text-ink/50">Gallery Photo {s.n}</p>
                </div>
              </div>
            </div>
          ))}
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
