"use client";

import * as React from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Section } from "./section";

/*
  Invitations carousel — real invitation images, dot indicators, frosted-glass
  arrows. Shows ~3 cards at once (centre active, sides peeking) mirroring the
  prenup gallery layout. Images live in public/assets/invitations.
*/

const ACCENT = "#c8963c";
const IMAGES = Array.from({ length: 8 }, (_, i) => `/assets/invitations/${i + 1}.jpg`);

type CornerPos = "top-left" | "top-right" | "bottom-left" | "bottom-right";

/** Small L-shaped bracket at each corner of the invitation card. */
function CornerAccent({ position, accent }: { position: CornerPos; accent: string }) {
  const SIZE = 16;
  const THICK = 2;
  const OFFSET = 10;

  const isTop = position.startsWith("top");
  const isLeft = position.endsWith("left");

  return (
    <div
      className="pointer-events-none absolute"
      style={{
        top: isTop ? OFFSET : undefined,
        bottom: isTop ? undefined : OFFSET,
        left: isLeft ? OFFSET : undefined,
        right: isLeft ? undefined : OFFSET,
        width: SIZE,
        height: SIZE,
      }}
    >
      {/* horizontal arm */}
      <div
        style={{
          position: "absolute",
          top: isTop ? 0 : undefined,
          bottom: isTop ? undefined : 0,
          left: isLeft ? 0 : undefined,
          right: isLeft ? undefined : 0,
          width: SIZE,
          height: THICK,
          background: accent,
          opacity: 0.85,
        }}
      />
      {/* vertical arm */}
      <div
        style={{
          position: "absolute",
          top: isTop ? 0 : undefined,
          bottom: isTop ? undefined : 0,
          left: isLeft ? 0 : undefined,
          right: isLeft ? undefined : 0,
          width: THICK,
          height: SIZE,
          background: accent,
          opacity: 0.85,
        }}
      />
    </div>
  );
}

export function InvitationsSection() {
  const [emblaRef, embla] = useEmblaCarousel({ loop: true, align: "center" });
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
      id="invitations"
      ariaLabel="Invitations"
      style={{
        backgroundImage: "url(/assets/faq_bg.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#fdf8f5",
      }}
    >
      {/* Title */}
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-butter-deep/70">
          Wedding Invitation
        </p>
        <h2 className="mt-1 font-cursive text-5xl leading-tight text-gold sm:text-6xl">
          Invitations
        </h2>
      </div>

      {/* Carousel */}
      <div className="relative mt-10">
        <div
          className="overflow-hidden border-x-2 border-white/50 relative"
          ref={emblaRef}
        >
          <div className="flex gap-3 sm:gap-5 px-4">
            {IMAGES.map((src, i) => (
              <div
                key={src}
                /* ~75% on mobile → 1 card + two peeking; ~50% on sm → 3 visible */
                className="min-w-0 flex-[0_0_75%] sm:flex-[0_0_50%] lg:flex-[0_0_38%] transition-all duration-500 ease-out py-4"
                style={{
                  opacity: selected === i ? 1 : 0.45,
                  transform: selected === i ? "scale(1)" : "scale(0.93)",
                }}
              >
                {/* Photo-frame wrapper (matches prenup style, gold tint) */}
                <div
                  className="rounded-2xl mx-auto transition-all duration-500"
                  style={{
                    background: "#fffdf5",
                    padding: "12px",
                    boxShadow: selected === i
                      ? `0 20px 48px -8px ${ACCENT}40, 0 8px 16px -4px ${ACCENT}20`
                      : `0 8px 20px -5px ${ACCENT}18`,
                    border: `1px solid ${ACCENT}22`,
                  }}
                >
                  {/* Image + decorative frame overlays */}
                  <div
                    className="relative aspect-[2/3] overflow-hidden rounded-xl"
                    style={{ boxShadow: "inset 0 2px 10px rgba(0,0,0,0.05)" }}
                  >
                    <Image
                      src={src}
                      alt={`Wedding invitation ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 75vw, (max-width: 1024px) 50vw, 38vw"
                    />

                    {/* Inset glow border */}
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{
                        boxShadow: `inset 0 0 0 1px ${ACCENT}70, inset 0 0 0 5px ${ACCENT}15, inset 0 0 20px ${ACCENT}08`,
                        borderRadius: "inherit",
                      }}
                    />
                    {/* Inset frame line */}
                    <div
                      className="pointer-events-none absolute"
                      style={{
                        inset: 9,
                        border: `1px solid ${ACCENT}50`,
                        borderRadius: 8,
                      }}
                    />
                    {/* Corner accents */}
                    <CornerAccent position="top-left" accent={ACCENT} />
                    <CornerAccent position="top-right" accent={ACCENT} />
                    <CornerAccent position="bottom-left" accent={ACCENT} />
                    <CornerAccent position="bottom-right" accent={ACCENT} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Arrows — span the full carousel track */}
        <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none px-1 sm:px-3">
          <button
            type="button"
            aria-label="Previous invitation"
            onClick={scrollPrev}
            className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full transition-all hover:scale-105"
            style={{
              background: "rgba(255,252,245,0.92)",
              backdropFilter: "blur(12px)",
              border: `1px solid ${ACCENT}35`,
              boxShadow: `0 4px 16px ${ACCENT}25`,
            }}
          >
            <ChevronLeft className="h-5 w-5 text-gold ml-[-1px]" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next invitation"
            onClick={scrollNext}
            className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full transition-all hover:scale-105"
            style={{
              background: "rgba(255,252,245,0.92)",
              backdropFilter: "blur(12px)",
              border: `1px solid ${ACCENT}35`,
              boxShadow: `0 4px 16px ${ACCENT}25`,
            }}
          >
            <ChevronRight className="h-5 w-5 text-gold mr-[-1px]" aria-hidden />
          </button>
        </div>
      </div>

      {/* Dot indicators */}
      <div
        className="mt-5 flex flex-wrap items-center justify-center gap-2"
        aria-live="polite"
        aria-label={`Invitation ${selected + 1} of ${IMAGES.length}`}
      >
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
