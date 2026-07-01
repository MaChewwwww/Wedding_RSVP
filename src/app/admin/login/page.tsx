import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";
import { site } from "@/config/site";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: `Admin · ${site.couple.displayName}`,
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-12">
      {/* ── Background ── */}
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/assets/bg2.png')" }}
      />
      {/* Warm tinted overlay */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(253,244,232,0.82) 0%, rgba(253,232,240,0.78) 50%, rgba(253,244,232,0.85) 100%)",
        }}
      />

      {/* ── Floating petal accents ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {[
          { top: "8%", left: "6%", size: 28, delay: "0s", dir: "left" },
          { top: "15%", left: "88%", size: 22, delay: "1.4s", dir: "right" },
          { top: "72%", left: "4%", size: 18, delay: "2.1s", dir: "left" },
          { top: "80%", left: "92%", size: 24, delay: "0.7s", dir: "right" },
          { top: "45%", left: "2%", size: 16, delay: "3.2s", dir: "left" },
          { top: "35%", left: "95%", size: 20, delay: "1.8s", dir: "right" },
        ].map((p, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              top: p.top,
              left: p.left,
              width: p.size,
              height: p.size,
              animation: `${p.dir === "left" ? "petal-drift-left" : "petal-drift-right"} ${8 + i}s ${p.delay} infinite`,
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2C8 2 4 6 4 10c0 5 8 12 8 12s8-7 8-12c0-4-4-8-8-8z"
                fill={i % 2 === 0 ? "#f0a8bc" : "#b5a0d5"}
                opacity="0.7"
              />
            </svg>
          </div>
        ))}
      </div>

      {/* ── Back to celebration link ── */}
      <Link
        href="/celebration"
        className="absolute left-5 top-5 z-20 flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-ink/70 transition-all hover:text-ink hover:bg-white/40 backdrop-blur-sm"
        style={{ border: "1px solid rgba(255,255,255,0.5)" }}
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Back to Wedding Details
      </Link>

      {/* ── Glass card ── */}
      <div
        className="glass-card relative z-10 w-full max-w-md rounded-3xl px-8 py-10"
        style={{
          animation: "fade-in-up 0.6s ease both",
        }}
      >
        {/* Monogram crest */}
        <div className="mb-6 flex flex-col items-center gap-3">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full shadow-lg"
            style={{
              background: "linear-gradient(135deg, #e07898, #d4516e)",
              boxShadow: "0 4px 20px rgba(212, 81, 110, 0.35)",
            }}
          >
            <span className="font-cursive text-2xl text-white">{site.couple.monogram}</span>
          </div>

          <div className="text-center">
            <h1 className="font-display text-3xl font-semibold tracking-wide text-ink">
              Admin Portal
            </h1>
            <p className="mt-0.5 font-display text-base text-muted-ink">
              {site.couple.displayName}
            </p>
          </div>
        </div>

        {/* Admin-only notice */}
        <div
          className="mb-7 flex items-center gap-2.5 rounded-xl px-4 py-3"
          style={{
            background: "rgba(181,160,213,0.18)",
            border: "1px solid rgba(181,160,213,0.4)",
          }}
        >
          <ShieldCheck className="h-4 w-4 shrink-0 text-lavender-deep" aria-hidden />
          <p className="text-xs font-medium text-lavender-deep">
            This portal is for <strong>Admins &amp; Organizers only.</strong> Guests may access the main site instead.
          </p>
        </div>

        <LoginForm />

        {/* Footer note */}
        <p className="mt-8 text-center text-xs text-muted-ink/70">
          Jobert &amp; April · Wedding Management
        </p>
      </div>
    </main>
  );
}
