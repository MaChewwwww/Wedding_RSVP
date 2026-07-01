"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { Section } from "./section";
import { faq } from "@/config/faq";

/*
  FAQ — animated accordion with motion/react, chevron icon,
  glassmorphism cards on a blush gradient background.
*/
export function FaqSection() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  return (
    <Section
      id="faq"
      ariaLabel="Questions and answers"
      style={{
        backgroundImage: "url(/assets/faq_bg.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#fdf8f5",
      }}
    >
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-blush-deep/70">
          Need to know
        </p>
        <h2 className="mt-1 font-cursive text-5xl leading-tight text-rose sm:text-6xl">
          Questions &amp; Answers
        </h2>
        <div className="mx-auto mt-3 flex items-center justify-center gap-3">
          <div className="h-px w-16" style={{ background: "linear-gradient(to right, rgba(212,81,110,0.5), transparent)" }} />
          <span className="text-rose/60">✦</span>
          <div className="h-px w-16" style={{ background: "linear-gradient(to left, rgba(212,81,110,0.5), transparent)" }} />
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-2xl space-y-3">
        {faq.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={item.question}
              className="overflow-hidden rounded-2xl transition-all duration-200"
              style={{
                background: isOpen
                  ? "rgba(253,232,240,0.80)"
                  : "rgba(255,252,248,0.72)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                border: isOpen
                  ? "1px solid rgba(212,81,110,0.3)"
                  : "1px solid rgba(255,255,255,0.7)",
                boxShadow: isOpen
                  ? "0 8px 28px rgba(212,81,110,0.10)"
                  : "0 4px 16px rgba(80,60,60,0.05)",
              }}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex min-h-14 w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="font-medium text-ink leading-snug">{item.question}</span>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="shrink-0"
                >
                  <ChevronDown
                    className="h-5 w-5"
                    style={{ color: isOpen ? "#d4516e" : "rgba(107,100,96,0.6)" }}
                    aria-hidden
                  />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5">
                      <p className="text-sm leading-relaxed text-muted-ink">
                        {item.answer}
                      </p>
                      {item.swatches && item.swatches.length > 0 && (
                        <div className="mt-3 flex flex-wrap items-center gap-2.5">
                          {item.swatches.map((color) => (
                            <span
                              key={color}
                              title={color}
                              className="h-8 w-8 rounded-full shadow-sm"
                              style={{
                                background: color,
                                border: "2px solid rgba(255,255,255,0.85)",
                                boxShadow: "0 2px 6px rgba(80,60,60,0.15)",
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
