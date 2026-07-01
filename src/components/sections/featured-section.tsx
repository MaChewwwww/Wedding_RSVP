"use client";

import Image from "next/image";

/*
  Featured pre-wedding — couple hero illustration as full-bleed background
  with a copy card. Responsive on mobile.
*/

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
          className="object-cover object-center lg:object-right lg:scale-[1.28] lg:origin-left transition-transform duration-500 ease-out"
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
        <div className="flex flex-col gap-6">
          <div
            className="rounded-2xl p-6 sm:p-8 w-full max-w-md flex flex-col gap-3"
            style={{
              background: "rgba(255, 250, 246, 0.78)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.65)",
              boxShadow: "0 12px 32px rgba(160, 80, 100, 0.04), 0 1px 0 rgba(255,255,255,0.9) inset",
            }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blush-deep/80">
              Pre-Wedding
            </p>
            <h2 className="font-cursive text-5xl leading-none text-rose sm:text-7xl"
              style={{ textShadow: "0 2px 16px rgba(212,81,110,0.12)" }}>
              Jobert &amp; April
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-ink/75">
              A few of our favorite moments leading up to the big day — a glimpse into our love story.
            </p>
          </div>
        </div>

        {/* Right — spacer on large screens so background shows */}
        <div className="hidden lg:block" />
      </div>
    </section>
  );
}
