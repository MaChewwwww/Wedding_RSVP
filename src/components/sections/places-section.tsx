import Image from "next/image";
import { MapPin } from "lucide-react";
import { Section } from "./section";
import { venues, type Venue } from "@/config/venues";
import { site } from "@/config/site";

/*
  Places and venues — glassmorphism venue cards with colored accent borders,
  ornate announcement frame, mobile-responsive stack.
*/

export function PlacesSection() {
  return (
    <Section
      id="places"
      ariaLabel="Places and venues"
      style={{
        backgroundImage: "url(/assets/bg5.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay for readability */}
      <div className="pointer-events-none absolute inset-0"
        style={{ background: "rgba(253,244,232,0.45)", backdropFilter: "blur(2px)" }} />

      <div className="relative">
        {/* Section heading */}
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-butter-deep/80">
            Mark Your Calendar
          </p>
          <h2 className="mt-1 font-cursive text-5xl leading-tight text-gold sm:text-6xl">
            Places &amp; Venues
          </h2>
        </div>

        {/* Announcement frame */}
        <div
          className="relative mx-auto mb-10 max-w-2xl overflow-hidden rounded-3xl"
          style={{
            background: "rgba(255, 252, 245, 0.82)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(240,200,74,0.35)",
            boxShadow: "0 12px 40px rgba(200,150,60,0.12), 0 1px 0 rgba(255,255,255,0.8) inset",
          }}
        >
          {/* Lace overlay */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
            <Image
              src="/assets/announcement.png"
              alt=""
              fill
              className="object-contain opacity-20"
              sizes="(max-width: 768px) 100vw, 672px"
            />
          </div>

          {/* Corner ornaments */}
          <div aria-hidden className="absolute left-4 top-4 h-8 w-8 rounded-tl-xl border-l-2 border-t-2 border-butter/60" />
          <div aria-hidden className="absolute right-4 top-4 h-8 w-8 rounded-tr-xl border-r-2 border-t-2 border-butter/60" />
          <div aria-hidden className="absolute bottom-4 left-4 h-8 w-8 rounded-bl-xl border-b-2 border-l-2 border-butter/60" />
          <div aria-hidden className="absolute bottom-4 right-4 h-8 w-8 rounded-br-xl border-b-2 border-r-2 border-butter/60" />

          <div className="relative px-8 py-10 sm:px-16 sm:py-12 text-center">
            <div className="font-cursive text-3xl text-gold mb-3">♡</div>
            <p className="text-base leading-relaxed text-ink/80 text-balance">
              {site.copy.announcement}
            </p>
          </div>
        </div>

        {/* Venue cards */}
        <div className="space-y-5">
          {venues.map((v, i) => (
            <VenueCard key={v.type} venue={v} index={i} />
          ))}
        </div>
      </div>
    </Section>
  );
}

const VENUE_ACCENT_COLORS = [
  { border: "#f0a8bc", bg: "rgba(253,232,240,0.70)", pill: "#d4516e" },
  { border: "#8fbc8b", bg: "rgba(212,237,207,0.70)", pill: "#5a9c56" },
];

function VenueCard({ venue, index }: { venue: Venue; index: number }) {
  const accent = VENUE_ACCENT_COLORS[index % VENUE_ACCENT_COLORS.length];
  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: accent.bg,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: `1px solid ${accent.border}50`,
        boxShadow: "0 8px 32px rgba(80,60,60,0.08), 0 1px 0 rgba(255,255,255,0.7) inset",
      }}
    >
      {/* Colored left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ background: accent.pill }}
      />

      <div className="flex flex-col gap-4 p-5 pl-7 sm:flex-row sm:items-center">
        <div className="flex-1 min-w-0">
          <span
            className="inline-block rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white mb-2"
            style={{ background: accent.pill }}
          >
            {venue.type}
          </span>
          <h3 className="font-display text-2xl font-semibold text-ink">{venue.name}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-ink">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {venue.address}
          </p>
          <p className="mt-1 text-sm font-medium text-ink/70">
            {venue.date} · {venue.startTime}–{venue.endTime}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-ink">{venue.description}</p>
          {venue.isPlaceholder && (
            <p className="mt-1.5 text-xs italic text-muted-ink/60">Details to be confirmed.</p>
          )}
        </div>

        <a
          href={venue.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 hover:shadow-md"
          style={{
            background: `linear-gradient(135deg, ${accent.pill}, ${accent.pill}cc)`,
            boxShadow: `0 4px 14px ${accent.pill}40`,
          }}
        >
          <MapPin className="h-4 w-4" aria-hidden />
          Open in Maps
        </a>
      </div>
    </div>
  );
}
