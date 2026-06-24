"use client";

import * as React from "react";
import Link from "next/link";
import { Section } from "./section";
import { PassPanel } from "@/components/pass/pass-panel";
import { site } from "@/config/site";

/*
  Wedding pass section — glassmorphism card on bg3,
  with gradient heading and elegant description.
*/
export function PassSection({
  passes,
  weddingDate,
}: {
  passes: { label: string; qrDataUrl: string | null }[];
  weddingDate?: string;
}) {
  return (
    <Section
      id="pass"
      ariaLabel="Your wedding pass"
      style={{
        backgroundImage: "url(/assets/bg3.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="rounded-3xl p-6 sm:p-10"
        style={{
          background: "rgba(255, 250, 246, 0.82)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.7)",
          boxShadow: "0 20px 60px rgba(160, 80, 100, 0.12), 0 2px 0 rgba(255,255,255,0.9) inset",
        }}
      >
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-blush-deep/70">
            Your Entry
          </p>
          <h2 className="mt-1 font-cursive text-5xl leading-tight text-rose sm:text-6xl">
            Wedding Pass
          </h2>
          <div className="mx-auto mt-3 flex items-center justify-center gap-3">
            <div className="h-px w-16" style={{ background: "linear-gradient(to right, rgba(212,81,110,0.4), transparent)" }} />
            <span className="text-rose/50">✦</span>
            <div className="h-px w-16" style={{ background: "linear-gradient(to left, rgba(212,81,110,0.4), transparent)" }} />
          </div>
          <p className="mx-auto mt-3 max-w-md text-muted-ink">
            Save your pass and present the QR code at check-in.
          </p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {passes.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center rounded-2xl bg-white/40 p-10 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md" style={{ border: "1px solid rgba(255,255,255,0.7)" }}>
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-rose/10 text-rose-deep">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
              </div>
              <h3 className="mb-2 font-cursive text-3xl text-rose">RSVP Required</h3>
              <p className="mb-8 max-w-sm text-sm text-muted-ink">
                Please complete your RSVP to generate your official wedding pass and QR code for entry.
              </p>
              <Link
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  window.dispatchEvent(
                    new CustomEvent("page-exit-rsvp", {
                      detail: { x: e.clientX, y: e.clientY },
                    })
                  );
                }}
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-[#d4516e] to-[#e87a90] px-8 py-3.5 text-[13px] font-bold uppercase tracking-[0.15em] text-white shadow-lg transition-all hover:scale-105 hover:shadow-[0_10px_20px_rgba(212,81,110,0.3)] focus:outline-none"
              >
                <span className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="relative z-10 flex items-center gap-2">
                  RSVP Now <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </Link>
            </div>
          ) : (
            <>
              {passes.map((p) => (
                <PassPanel key={p.label} label={p.label} qrDataUrl={p.qrDataUrl} />
              ))}
              {passes.length % 2 !== 0 && (
                <div
                  className="mx-auto flex w-full max-w-sm flex-col items-center justify-center rounded-lg bg-paper p-8 shadow-sm text-center border border-blush/20"
                >
                  <div className="mb-4 text-3xl animate-pulse">🌸</div>
                  <h3 className="font-display text-2xl font-semibold text-ink mb-3">
                    We Are Excited to See You!
                  </h3>
                  <p className="text-sm text-muted-ink leading-relaxed max-w-[280px]">
                    Your presence is our greatest gift. We can&apos;t wait to share this beautiful day, laugh, and celebrate together!
                  </p>
                  <div className="mt-6 text-rose/80 text-sm tracking-[0.1em] font-medium">
                    {weddingDate || site.event.weddingDate}
                  </div>
                  <div className="mt-1 text-muted-ink/60 text-[10px] tracking-[0.15em] uppercase font-semibold">
                    ✦ {site.couple.displayName} ✦
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Section>
  );
}
