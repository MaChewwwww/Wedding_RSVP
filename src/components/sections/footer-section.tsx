import { site } from "@/config/site";

/*
  Footer — romantic dusk gradient, large cursive couple names,
  decorative SVG floral divider, hashtag pill badge.
*/
export function FooterSection() {
  return (
    <footer
      id="footer"
      className="relative w-full overflow-hidden"
      aria-label="Footer"
      style={{
        background: "linear-gradient(160deg, #fde8f0 0%, #f0e8fc 40%, #e8f0fd 70%, #fde8f0 100%)",
      }}
    >
      {/* Top paper-fade overlay */}
      <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-[#fdfbf7] to-transparent pointer-events-none z-10" />
      {/* Blurred blobs */}
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(240,168,188,0.35) 0%, transparent 70%)", filter: "blur(50px)" }} />
      <div aria-hidden className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(181,160,213,0.30) 0%, transparent 70%)", filter: "blur(50px)" }} />

      <div className="relative mx-auto max-w-3xl px-5 py-20 text-center">
        {/* SVG floral divider */}
        <div className="mx-auto mb-8 flex items-center justify-center gap-4" aria-hidden>
          <div className="h-px flex-1" style={{ background: "linear-gradient(to right, transparent, rgba(212,81,110,0.4))" }} />
          <svg width="48" height="24" viewBox="0 0 48 24" fill="none">
            <path d="M24 12 C20 4 12 2 8 8 C4 14 8 22 24 22 C40 22 44 14 40 8 C36 2 28 4 24 12Z"
              fill="rgba(240,168,188,0.45)" />
            <path d="M24 12 C22 6 16 4 12 8 C8 12 10 18 24 18 C38 18 40 12 36 8 C32 4 26 6 24 12Z"
              fill="rgba(240,168,188,0.25)" />
            <circle cx="24" cy="12" r="3" fill="rgba(212,81,110,0.5)" />
          </svg>
          <div className="h-px flex-1" style={{ background: "linear-gradient(to left, transparent, rgba(212,81,110,0.4))" }} />
        </div>

        {/* With love */}
        <p className="font-display text-lg font-light italic text-muted-ink">{site.copy.footer}</p>

        {/* Couple name — big cursive */}
        <h2
          className="mt-2 font-cursive leading-none text-rose"
          style={{ fontSize: "clamp(3rem, 10vw, 5rem)", textShadow: "0 2px 20px rgba(212,81,110,0.18)" }}
        >
          {site.couple.displayName}
        </h2>

        {/* Wedding date */}
        <div
          className="mx-auto mt-5 inline-block rounded-full px-6 py-2.5"
          style={{
            background: "rgba(253,232,240,0.70)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(240,168,188,0.4)",
            boxShadow: "0 4px 14px rgba(212,81,110,0.10)",
          }}
        >
          <span className="font-display text-lg font-medium text-ink">{site.event.weddingDate}</span>
        </div>

        {/* Support contact */}
        {site.event.supportContact.email && (
          <p className="mt-6 text-xs text-muted-ink/60">
            Questions? Contact{" "}
            <a
              href={`mailto:${site.event.supportContact.email}`}
              className="underline underline-offset-2 hover:text-rose transition-colors"
            >
              {site.event.supportContact.email}
            </a>
          </p>
        )}

        {/* Hashtag pill */}
        <div className="mt-5">
          <span
            className="inline-block rounded-full px-4 py-1.5 text-sm font-semibold"
            style={{
              background: "linear-gradient(135deg, rgba(240,168,188,0.3), rgba(181,160,213,0.25))",
              border: "1px solid rgba(240,168,188,0.35)",
              color: "#d4516e",
            }}
          >
            {site.social.hashtag}
          </span>
        </div>

        {/* Back to top */}
        <div className="mt-8">
          <a
            href="#welcome"
            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full px-5 py-2 text-sm font-medium transition-all hover:scale-105"
            style={{
              background: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(240,168,188,0.4)",
              color: "#d4516e",
              backdropFilter: "blur(8px)",
            }}
          >
            ↑ Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
