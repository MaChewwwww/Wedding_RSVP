import { Section } from "./section";

/*
  Our Story timeline — alternating color-coded glassmorphism cards,
  gradient timeline connector, pill year badges. Mobile: left-rail layout.
*/

type TimelineEntry = { year: string; title: string; description: string; color: string; bg: string };

const ENTRIES: TimelineEntry[] = [
  {
    year: "2019",
    title: "How We Met",
    description: "Our story began with a chance encounter. (Placeholder — final timeline copy to be provided.)",
    color: "#d4516e",
    bg: "linear-gradient(135deg, rgba(253,232,240,0.85), rgba(249,194,208,0.60))",
  },
  {
    year: "2022",
    title: "The Adventure",
    description: "We grew together through every season. (Placeholder — final timeline copy to be provided.)",
    color: "#5a9c56",
    bg: "linear-gradient(135deg, rgba(212,237,207,0.85), rgba(184,217,179,0.60))",
  },
  {
    year: "2026",
    title: "The Proposal",
    description: "And then, the question that changed everything. (Placeholder — final timeline copy to be provided.)",
    color: "#8b70c0",
    bg: "linear-gradient(135deg, rgba(232,224,245,0.85), rgba(200,184,232,0.60))",
  },
];

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
      {/* Section heading */}
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-lavender-deep/70">
          How it began
        </p>
        <h2 className="mt-2 font-cursive text-5xl leading-tight text-rose sm:text-6xl">
          Our Story
        </h2>
        <div className="mx-auto mt-3 flex items-center justify-center gap-3">
          <div className="h-px w-16" style={{ background: "linear-gradient(to right, rgba(181,160,213,0.6), transparent)" }} />
          <span className="text-lavender/70">✦</span>
          <div className="h-px w-16" style={{ background: "linear-gradient(to left, rgba(181,160,213,0.6), transparent)" }} />
        </div>
      </div>

      <ol className="relative mx-auto mt-12 max-w-3xl">
        {/* Timeline rail */}
        <span
          aria-hidden
          className="absolute left-4 top-0 h-full w-0.5 sm:left-1/2 sm:-ml-px"
          style={{
            background: "linear-gradient(to bottom, rgba(212,81,110,0.4), rgba(139,112,192,0.4), rgba(90,156,86,0.4))",
          }}
        />

        {ENTRIES.map((e, i) => (
          <li
            key={e.year}
            className={`relative mb-10 pl-12 sm:w-[calc(50%-1.5rem)] sm:pl-0 ${
              i % 2 === 0
                ? "sm:pr-10 sm:text-right sm:ml-0"
                : "sm:ml-auto sm:pl-10 sm:text-left"
            }`}
          >
            {/* Timeline dot */}
            <span
              aria-hidden
              className="absolute left-1.5 top-4 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white shadow-md sm:left-auto sm:top-4"
              style={{
                background: e.color,
                ...(i % 2 === 0
                  ? { right: "-0.625rem", left: "auto", transform: "translateX(50%)" }
                  : { left: "-0.625rem", transform: "translateX(-50%)" }),
              }}
            />

            {/* Card */}
            <div
              className="rounded-2xl px-5 py-5 shadow-md"
              style={{
                background: e.bg,
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: `1px solid ${e.color}30`,
                boxShadow: `0 8px 28px ${e.color}18, 0 1px 0 rgba(255,255,255,0.7) inset`,
              }}
            >
              {/* Year pill */}
              <span
                className="inline-block rounded-full px-3 py-0.5 text-xs font-bold tracking-widest text-white mb-2"
                style={{ background: e.color }}
              >
                {e.year}
              </span>
              <h3 className="font-display text-xl font-semibold text-ink">{e.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-ink">{e.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
