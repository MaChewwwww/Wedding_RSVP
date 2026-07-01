"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

/*
  Sticky anchored navbar — pastel glassmorphism redesign.
  Desktop: monogram left, anchor links center, Admin right.
  Mobile: full-height slide drawer with gradient backdrop.
  Active-section indicator via IntersectionObserver.
*/

export function SiteNavbar() {
  const sections = site.navigation.sections;
  const [active, setActive] = React.useState(sections[0]?.id ?? "");
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const menuButtonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          height: "var(--nav-height)",
          background: scrolled
            ? "linear-gradient(to right, rgba(249, 180, 200, 0.95), rgba(253, 215, 160, 0.95), rgba(180, 235, 200, 0.95))"
            : "linear-gradient(to right, rgba(249, 180, 200, 0.85), rgba(253, 215, 160, 0.85), rgba(180, 235, 200, 0.85))",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255, 255, 255, 0.8)",
          borderBottom: scrolled
            ? "1px solid rgba(240, 168, 188, 0.6)"
            : "1px solid rgba(240, 168, 188, 0.1)",
          boxShadow: scrolled
            ? "0 8px 16px -4px rgba(0, 0, 0, 0.4), 0 4px 8px -4px rgba(0, 0, 0, 0.3), inset 0 -2px 10px rgba(255, 255, 255, 0.4)"
            : "none",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <nav className="mx-auto flex h-full w-full max-w-[1400px] items-center justify-between px-6 lg:px-10">
          {/* Monogram */}
          <Link
            href="#welcome"
            className="font-cursive text-3xl leading-none text-rose transition-opacity hover:opacity-80"
            style={{ textShadow: "0 1px 4px rgba(212,81,110,0.15)" }}
          >
            {site.couple.monogram}
          </Link>

          {/* Desktop nav links */}
          <ul className="hidden items-center gap-0.5 lg:flex">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  aria-current={active === s.id ? "true" : undefined}
                  className={cn(
                    "relative rounded-full px-4 py-1.5 text-[13px] uppercase tracking-[0.1em] font-medium transition-all duration-300",
                    active === s.id
                      ? "text-rose-deep"
                      : "hover:text-rose-deep",
                  )}
                  style={{
                    color: active === s.id ? "#d4516e" : "#5a4f4c",
                    textShadow: "0 1px 3px rgba(255, 255, 255, 0.7)",
                  }}
                >
                  {active === s.id && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: "linear-gradient(135deg, rgba(240,168,188,0.2), rgba(181,160,213,0.15))",
                        border: "1px solid rgba(240,168,188,0.3)",
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative">{s.label}</span>
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
          <div className="hidden lg:flex lg:items-center lg:gap-2">
              <Link
                href="/rsvp"
                className="rounded-full px-5 py-2 text-xs font-bold uppercase tracking-widest transition-all hover:-translate-y-0.5 hover:shadow-sm"
                style={{
                  color: "#d4516e",
                  background: "rgba(255,255,255,0.5)",
                  border: "1px solid rgba(212,81,110,0.3)",
                  backdropFilter: "blur(8px)"
                }}
              >
                RSVP
              </Link>
              <Link
                href="/admin/login"
                className="rounded-full px-5 py-2 text-xs font-bold uppercase tracking-widest transition-all hover:-translate-y-0.5 hover:shadow-sm"
                style={{
                  color: "#8b70c0",
                  background: "rgba(255,255,255,0.5)",
                  border: "1px solid rgba(139,112,192,0.3)",
                  backdropFilter: "blur(8px)"
                }}
              >
                Login
              </Link>
            </div>
            <button
              ref={menuButtonRef}
              type="button"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-blush/20 lg:hidden"
            >
              <Menu className="h-5 w-5 text-ink" aria-hidden />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <MobileMenu
            active={active}
            onClose={() => {
              setMenuOpen(false);
              window.requestAnimationFrame(() => menuButtonRef.current?.focus());
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function MobileMenu({
  active,
  onClose,
}: {
  active: string;
  onClose: () => void;
}) {
  const sections = site.navigation.sections;
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
      className="fixed inset-0 z-[200] lg:hidden"
    >
      {/* Full-screen backdrop */}
      <motion.div
        className="fixed inset-0"
        style={{ background: "rgba(40, 30, 35, 0.55)" }}
        onClick={onClose}
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      />

      {/* Drawer panel — fixed, full-height, slides from right */}
      <motion.div
        ref={panelRef}
        className="fixed right-0 top-0 flex h-full w-[86vw] max-w-sm flex-col shadow-2xl"
        style={{
          background: "#fdf0f6",
          backgroundImage: "linear-gradient(165deg, #fde8f0 0%, #fdf4f8 40%, #ede8fd 100%)",
          borderLeft: "1px solid rgba(240,168,188,0.4)",
          boxShadow: "-8px 0 40px rgba(80,40,60,0.18)",
        }}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 38 }}
      >
        {/* Decorative header */}
        <div
          className="relative overflow-hidden px-6 pb-6 pt-5"
          style={{ borderBottom: "1px solid rgba(240,168,188,0.3)" }}
        >
          {/* soft glow blob */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(181,160,213,0.35) 0%, transparent 70%)", filter: "blur(24px)" }}
          />
          <div className="relative flex items-start justify-between">
            <div>
              <motion.p
                className="font-cursive text-4xl leading-none"
                style={{ color: "#d4516e" }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
              >
                {site.couple.displayName}
              </motion.p>
              <motion.p
                className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-ink/70"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.12 }}
              >
                {site.event.weddingDate}
              </motion.p>
            </div>
            <button
              ref={closeRef}
              type="button"
              aria-label="Close menu"
              onClick={onClose}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-rose-200/60"
              style={{ background: "rgba(212,81,110,0.08)" }}
            >
              <X className="h-5 w-5" style={{ color: "#d4516e" }} aria-hidden />
            </button>
          </div>
        </div>

        {/* Nav links — scrollable if many */}
        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <ul className="flex flex-col gap-1.5">
            {sections.map((s, i) => {
              const isActive = active === s.id;
              return (
                <motion.li
                  key={s.id}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.1 + i * 0.05, ease: "easeOut" }}
                >
                  <a
                    href={`#${s.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" });
                      onClose();
                    }}
                    aria-current={isActive ? "true" : undefined}
                    className="group relative flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all"
                    style={{
                      background: isActive ? "rgba(255,255,255,0.75)" : "transparent",
                      boxShadow: isActive ? "0 4px 16px rgba(212,81,110,0.12)" : "none",
                    }}
                  >
                    {/* active accent bar */}
                    <span
                      aria-hidden
                      className="h-6 w-1 rounded-full transition-all"
                      style={{
                        background: isActive
                          ? "linear-gradient(to bottom, #f0a8bc, #b5a0d5)"
                          : "rgba(212,81,110,0.15)",
                        transform: isActive ? "scaleY(1)" : "scaleY(0.5)",
                      }}
                    />
                    <span
                      className="text-base transition-colors"
                      style={{
                        color: isActive ? "#d4516e" : "#382e2a",
                        fontWeight: isActive ? 700 : 500,
                      }}
                    >
                      {s.label}
                    </span>
                  </a>
                </motion.li>
              );
            })}
          </ul>
        </nav>

        {/* Footer — RSVP + admin link */}
        <div className="px-4 pb-6 pt-3 flex flex-col gap-2" style={{ borderTop: "1px solid rgba(240,168,188,0.25)" }}>
          <Link
            href="/rsvp"
            onClick={onClose}
            className="block w-full text-center rounded-2xl px-4 py-3.5 text-sm font-bold uppercase tracking-widest transition-all hover:-translate-y-0.5 hover:shadow-sm"
            style={{
              color: "#d4516e",
              background: "rgba(255,255,255,0.5)",
              border: "1px solid rgba(212,81,110,0.3)",
            }}
          >
            RSVP
          </Link>
          <Link
            href="/admin/login"
            onClick={onClose}
            className="block w-full text-center rounded-2xl px-4 py-3.5 text-sm font-bold uppercase tracking-widest transition-all hover:-translate-y-0.5 hover:shadow-sm"
            style={{
              color: "#8b70c0",
              background: "rgba(255,255,255,0.5)",
              border: "1px solid rgba(139,112,192,0.3)",
            }}
          >
            Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
