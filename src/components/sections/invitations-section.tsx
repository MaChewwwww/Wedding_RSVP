"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Section } from "./section";

/*
  Invitations carousel — beautiful CSS-generated stationery placeholders,
  dot indicators, frosted-glass arrows.
*/

const CARDS = [
  {
    label: "Front",
    bg: "linear-gradient(155deg, #fde8f0 0%, #f9c2d0 40%, #edd5e5 100%)",
    accent: "#d4516e",
    icon: "💌",
  },
  {
    label: "Back",
    bg: "linear-gradient(155deg, #e8e0f5 0%, #c8b8e8 40%, #d8c8f0 100%)",
    accent: "#8b70c0",
    icon: "✦",
  },
  {
    label: "Details",
    bg: "linear-gradient(155deg, #fdf3c0 0%, #f5e080 40%, #edd5b0 100%)",
    accent: "#c8963c",
    icon: "📜",
  },
];

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
          Save the date
        </p>
        <h2 className="mt-1 font-cursive text-5xl leading-tight text-gold sm:text-6xl">
          Invitations
        </h2>
      </div>

      <div className="relative mx-auto mt-10 max-w-xs sm:max-w-sm">
        <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
          <div className="flex">
            {CARDS.map((c) => (
              <div key={c.label} className="min-w-0 flex-[0_0_100%] px-2">
                {/* Stationery card */}
                <div
                  className="flex aspect-[2/3] flex-col items-center justify-center rounded-2xl shadow-xl"
                  style={{
                    background: c.bg,
                    boxShadow: `0 16px 48px ${c.accent}25, 0 2px 8px ${c.accent}15`,
                    border: "1px solid rgba(255,255,255,0.6)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Corner ornaments */}
                  <div aria-hidden className="absolute left-5 top-5 h-10 w-10 rounded-tl-xl border-l-2 border-t-2" style={{ borderColor: `${c.accent}50` }} />
                  <div aria-hidden className="absolute right-5 top-5 h-10 w-10 rounded-tr-xl border-r-2 border-t-2" style={{ borderColor: `${c.accent}50` }} />
                  <div aria-hidden className="absolute bottom-5 left-5 h-10 w-10 rounded-bl-xl border-b-2 border-l-2" style={{ borderColor: `${c.accent}50` }} />
                  <div aria-hidden className="absolute bottom-5 right-5 h-10 w-10 rounded-br-xl border-b-2 border-r-2" style={{ borderColor: `${c.accent}50` }} />

                  <div className="text-center px-8">
                    <div className="text-4xl mb-4">{c.icon}</div>
                    <div className="font-cursive text-4xl leading-tight mb-2" style={{ color: c.accent }}>
                      Jobert &amp; April
                    </div>
                    <div className="h-px w-16 mx-auto my-3" style={{ background: `linear-gradient(to right, transparent, ${c.accent}60, transparent)` }} />
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-ink/60">
                      {c.label}
                    </div>
                  </div>
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
      <div className="mt-6 flex items-center justify-center gap-2">
        {CARDS.map((c, i) => (
          <button
            key={c.label}
            type="button"
            aria-label={`Go to ${c.label}`}
            onClick={() => embla?.scrollTo(i)}
            className="transition-all duration-300"
            style={{
              width: selected === i ? 24 : 8,
              height: 8,
              borderRadius: 99,
              background: selected === i
                ? `linear-gradient(to right, ${CARDS[selected].accent}, ${CARDS[selected].accent}99)`
                : `${CARDS[selected].accent}35`,
              border: "none",
            }}
          />
        ))}
      </div>
    </Section>
  );
}
