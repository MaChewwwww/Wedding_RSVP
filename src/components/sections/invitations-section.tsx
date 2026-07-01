"use client";

import * as React from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Section } from "./section";

/*
  Invitations carousel — real invitation images, dot indicators, frosted-glass
  arrows. Images live in public/assets/invitations (see scripts/optimize-gallery.ts).
*/

const ACCENT = "#c8963c";
const IMAGES = Array.from({ length: 8 }, (_, i) => `/assets/invitations/${i + 1}.jpg`);

export function InvitationsSection() {
  const [emblaRef, embla] = useEmblaCarousel({ loop: true, align: "center" });
  const [selected, setSelected] = React.useState(0);

  React.useEffect(() => {
    if (!embla) return;
    const onSelect = () => setSelected(embla.selectedScrollSnap());
    embla.on("select", onSelect);
    onSelect();
    return () => { embla.off("select", onSelect); };
  }, [embla]);

  return (
    <Section
      id="invitations"
      ariaLabel="Invitations"
      style={{
        backgroundImage: "url(/assets/faq_bg.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#fdf8f5",
      }}
    >
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-butter-deep/70">
          Wedding Invitation
        </p>
        <h2 className="mt-1 font-cursive text-5xl leading-tight text-gold sm:text-6xl">
          Invitations
        </h2>
      </div>

      <div className="relative mx-auto mt-10 max-w-xs sm:max-w-sm">
        <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
          <div className="flex">
            {IMAGES.map((src, i) => (
              <div key={src} className="min-w-0 flex-[0_0_100%] px-2">
                <div
                  className="relative aspect-[2/3] overflow-hidden rounded-2xl shadow-xl"
                  style={{
                    boxShadow: `0 16px 48px ${ACCENT}25, 0 2px 8px ${ACCENT}15`,
                    border: "1px solid rgba(255,255,255,0.6)",
                  }}
                >
                  <Image
                    src={src}
                    alt={`Wedding invitation ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 90vw, 384px"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation arrows */}
        <button
          type="button"
          aria-label="Previous invitation"
          onClick={() => embla?.scrollPrev()}
          className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full shadow-md transition-all hover:scale-105"
          style={{
            background: "rgba(255,252,245,0.85)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(200,150,60,0.25)",
          }}
        >
          <ChevronLeft className="h-5 w-5 text-gold" aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Next invitation"
          onClick={() => embla?.scrollNext()}
          className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full shadow-md transition-all hover:scale-105"
          style={{
            background: "rgba(255,252,245,0.85)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(200,150,60,0.25)",
          }}
        >
          <ChevronRight className="h-5 w-5 text-gold" aria-hidden />
        </button>
      </div>

      {/* Dots */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {IMAGES.map((src, i) => (
          <button
            key={src}
            type="button"
            aria-label={`Go to invitation ${i + 1}`}
            onClick={() => embla?.scrollTo(i)}
            className="transition-all duration-300"
            style={{
              width: selected === i ? 24 : 8,
              height: 8,
              borderRadius: 99,
              background: selected === i
                ? `linear-gradient(to right, ${ACCENT}, ${ACCENT}99)`
                : `${ACCENT}35`,
              border: "none",
            }}
          />
        ))}
      </div>
    </Section>
  );
}
