import { Section } from "./section";
import { entourage } from "@/config/entourage";

/*
  Entourage section — gradient avatar initials, card hover lift,
  responsive grid with elegant group headings.
*/

const GROUP_COLORS = [
  { text: "#d4516e", bg: "linear-gradient(135deg, rgba(253,232,240,0.8), rgba(249,194,208,0.6))", border: "rgba(212,81,110,0.2)" },
  { text: "#5a9c56", bg: "linear-gradient(135deg, rgba(212,237,207,0.8), rgba(184,217,179,0.6))", border: "rgba(90,156,86,0.2)" },
  { text: "#8b70c0", bg: "linear-gradient(135deg, rgba(232,224,245,0.8), rgba(200,184,232,0.6))", border: "rgba(139,112,192,0.2)" },
  { text: "#c8963c", bg: "linear-gradient(135deg, rgba(253,243,192,0.8), rgba(245,224,128,0.6))", border: "rgba(200,150,60,0.2)" },
];

const AVATAR_GRADIENTS = [
  ["#f9c2d0", "#e07898"],
  ["#b8d9b3", "#5a9c56"],
  ["#c8b8e8", "#8b70c0"],
  ["#f5e080", "#c8963c"],
  ["#a8d4ee", "#4090b8"],
  ["#e8c0d0", "#c07090"],
];

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

export function EntourageSection() {
  return (
    <Section
      id="entourage"
      ariaLabel="The entourage"
      style={{
        backgroundImage: "url(/assets/entourage_bg.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#d6eef8",
      }}
    >
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky/80">
          Our Beloved
        </p>
        <h2 className="mt-1 font-cursive text-5xl leading-tight text-sky-deep sm:text-6xl"
          style={{ color: "#2a7090" }}>
          The Entourage
        </h2>
        <div className="mx-auto mt-3 flex items-center justify-center gap-3">
          <div className="h-px w-16" style={{ background: "linear-gradient(to right, rgba(144,191,216,0.6), transparent)" }} />
          <span style={{ color: "rgba(144,191,216,0.8)" }}>✦</span>
          <div className="h-px w-16" style={{ background: "linear-gradient(to left, rgba(144,191,216,0.6), transparent)" }} />
        </div>
      </div>

      <div className="mt-12">
        {/* Principal Sponsors */}
        {entourage.length > 0 && (
          <div className="mb-16">
            <div className="mb-6 text-center">
              <span
                className="inline-block rounded-full px-6 py-2 font-display text-xl font-semibold shadow-sm"
                style={{
                  background: GROUP_COLORS[0].bg,
                  color: GROUP_COLORS[0].text,
                  border: `1px solid ${GROUP_COLORS[0].border}`,
                  backdropFilter: "blur(8px)",
                }}
              >
                {entourage[0].title}
              </span>
            </div>
            <ul className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6">
              {entourage[0].members.map((m, i) => {
                const grad = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length];
                return (
                  <li
                    key={`${entourage[0].title}-${i}`}
                    className="flex items-center gap-4 rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                    style={{
                      background: "rgba(255,252,248,0.72)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      border: "1px solid rgba(255,255,255,0.7)",
                      boxShadow: "0 4px 16px rgba(80,60,80,0.06)",
                    }}
                  >
                    <span
                      aria-hidden
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-md"
                      style={{
                        background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})`,
                        boxShadow: `0 4px 12px ${grad[1]}50`,
                      }}
                    >
                      {getInitials(m.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">{m.name}</p>
                      <p className="truncate text-sm text-muted-ink">{m.role}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Bridesmaids & Groomsmen Side-by-Side */}
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 md:grid-cols-2 md:gap-8 lg:gap-16">
          {/* Bridesmaids */}
          {entourage.length > 1 && (
            <div>
              <div className="mb-6 text-center">
                <span
                  className="inline-block rounded-full px-5 py-1.5 font-display text-lg font-semibold shadow-sm"
                  style={{
                    background: GROUP_COLORS[1].bg,
                    color: GROUP_COLORS[1].text,
                    border: `1px solid ${GROUP_COLORS[1].border}`,
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {entourage[1].title}
                </span>
              </div>
              <ul className="grid grid-cols-1 gap-4">
                {entourage[1].members.map((m, i) => {
                  const grad = AVATAR_GRADIENTS[(i + 3) % AVATAR_GRADIENTS.length];
                  return (
                    <li
                      key={`${entourage[1].title}-${i}`}
                      className="flex items-center gap-4 rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                      style={{
                        background: "rgba(255,252,248,0.72)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(255,255,255,0.7)",
                        boxShadow: "0 4px 16px rgba(80,60,80,0.06)",
                      }}
                    >
                      <span
                        aria-hidden
                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-md"
                        style={{
                          background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})`,
                          boxShadow: `0 4px 12px ${grad[1]}50`,
                        }}
                      >
                        {getInitials(m.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink">{m.name}</p>
                        <p className="truncate text-sm text-muted-ink">{m.role}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Groomsmen */}
          {entourage.length > 2 && (
            <div>
              <div className="mb-6 text-center">
                <span
                  className="inline-block rounded-full px-5 py-1.5 font-display text-lg font-semibold shadow-sm"
                  style={{
                    background: GROUP_COLORS[2].bg,
                    color: GROUP_COLORS[2].text,
                    border: `1px solid ${GROUP_COLORS[2].border}`,
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {entourage[2].title}
                </span>
              </div>
              <ul className="grid grid-cols-1 gap-4">
                {entourage[2].members.map((m, i) => {
                  const grad = AVATAR_GRADIENTS[(i + 6) % AVATAR_GRADIENTS.length];
                  return (
                    <li
                      key={`${entourage[2].title}-${i}`}
                      className="flex flex-row-reverse items-center gap-4 rounded-2xl p-4 text-right transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                      style={{
                        background: "rgba(255,252,248,0.72)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(255,255,255,0.7)",
                        boxShadow: "0 4px 16px rgba(80,60,80,0.06)",
                      }}
                    >
                      <span
                        aria-hidden
                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-md"
                        style={{
                          background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})`,
                          boxShadow: `0 4px 12px ${grad[1]}50`,
                        }}
                      >
                        {getInitials(m.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink">{m.name}</p>
                        <p className="truncate text-sm text-muted-ink">{m.role}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
