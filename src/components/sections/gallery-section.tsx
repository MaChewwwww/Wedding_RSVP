"use client";

import * as React from "react";
import { LightboxImage } from "@/components/ui/lightbox";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Section } from "./section";

/*
  Prenup photos — Embla carousel with dot navigation and frosted-glass arrows.
  Images live in public/assets/prenup (see scripts/optimize-gallery.ts).
*/

const SLIDES = Array.from({ length: 15 }, (_, i) => {
  const n = 15 - i;
  return { n, src: `/assets/prenup/${n}.jpg` };
});

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
          Gallery
        </p>
        <h2 className="mt-1 font-cursive text-5xl leading-tight text-sage-deep sm:text-6xl">
          Prenup Photos
        </h2>
      </div>

      {/* Carousel Section */}
      <div className="relative mt-10">
        {/* Carousel */}
        <div
          className="overflow-hidden border-x-2 border-white/50 relative"
          ref={emblaRef}
        >
          <div className="flex items-center" style={{ touchAction: "pan-y" }}>
            {SLIDES.map((s, i) => (
              <div
                key={s.n}
                className="relative min-w-0 shrink-0 basis-[85%] sm:basis-[60%] lg:basis-[45%] pl-4 sm:pl-6 transition-all duration-300"
                style={{
                  opacity: selected === i ? 1 : 0.45,
                  transform: selected === i ? "scale(1)" : "scale(0.92)",
                  filter: selected === i ? "none" : "blur(2px)",
                  zIndex: selected === i ? 10 : 0
                }}
              >
                {/* Frame wrapper */}
                <div
                  className="rounded-xl shadow-xl mx-auto transition-all duration-500"
                  style={{
                    background: "#fffdf9",
                    padding: "14px",
                    boxShadow: selected === i
                      ? "0 20px 40px -8px rgba(0,0,0,0.2), 0 8px 16px -4px rgba(0,0,0,0.1)"
                      : "0 10px 20px -5px rgba(0,0,0,0.1)",
                    border: "1px solid rgba(0,0,0,0.04)"
                  }}
                >
                  <div
                    className="relative aspect-[4/3] overflow-hidden rounded-lg"
                    style={{ boxShadow: "inset 0 2px 10px rgba(0,0,0,0.05)" }}
                  >
                    <LightboxImage
                      src={s.src}
                      alt={`Prenup photo ${s.n}`}
                      fill
                      wrapperClassName="absolute inset-0"
                      imageClassName="object-cover"
                      sizes="(max-width: 640px) 85vw, (max-width: 1024px) 60vw, 45vw"
                    />
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
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2" aria-live="polite" aria-label={`Photo ${selected + 1} of ${SLIDES.length}`}>
        {SLIDES.map((s, i) => (
          <button
            key={s.n}
            type="button"
            aria-label={`Go to photo ${s.n}`}
            onClick={() => embla?.scrollTo(i)}
            className="transition-all duration-300"
            style={{
              width: selected === i ? 24 : 8,
              height: 8,
              borderRadius: 99,
              background: selected === i
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
