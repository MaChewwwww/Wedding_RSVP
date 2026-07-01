"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Copy, Gift, ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { Section } from "./section";
import { site } from "@/config/site";
import { LightboxImage } from "@/components/ui/lightbox";

/*
  Love gift section — glassmorphism gift cards with gradient shimmer,
  elegant copy-to-clipboard, butter/gold pastel background.
*/

type GiftAccount = { provider: string; accountName: string; identifier?: string; image: string };

const ACCOUNTS: GiftAccount[] = [
  { provider: "Bank of the Philippine Islands", accountName: "Jobert", image: "/assets/JOBERT-BPI.jpg" },
  { provider: "GCash / E-Wallet", accountName: "Jobert", identifier: "09058830808", image: "/assets/JOBERT-GCASH.jpg" },
  { provider: "SeaBank", accountName: "Jobert", image: "/assets/JOBERT-SEABANK.jpg" },
  { provider: "SeaBank", accountName: "April", image: "/assets/APRIL-SEABANK.jpg" },
  { provider: "Vybe", accountName: "April", image: "/assets/APRIL-VYBE.jpg" },
];

const CARD_STYLES = [
  {
    from: "#fdf3c0",
    to: "#f5e4a0",
    accent: "#c8963c",
    iconBg: "linear-gradient(135deg, #f5e080, #c8963c)",
  },
  {
    from: "#fde8f0",
    to: "#f5c8d8",
    accent: "#d4516e",
    iconBg: "linear-gradient(135deg, #f9c2d0, #d4516e)",
  },
  {
    from: "#e8f5e8",
    to: "#d0e8d0",
    accent: "#5a9c56",
    iconBg: "linear-gradient(135deg, #a0d8a0, #5a9c56)",
  }
];

export function GiftSection() {
  const [emblaRef, embla] = useEmblaCarousel({ loop: true, align: "center", skipSnaps: false });
  const [selected, setSelected] = React.useState(0);

  const scrollPrev = React.useCallback(() => embla?.scrollPrev(), [embla]);
  const scrollNext = React.useCallback(() => embla?.scrollNext(), [embla]);

  React.useEffect(() => {
    if (!embla) return;
    const onSelect = () => setSelected(embla.selectedScrollSnap());
    embla.on("select", onSelect);
    onSelect();
    return () => { embla.off("select", onSelect); };
  }, [embla]);

  return (
    <Section
      id="gift"
      ariaLabel="Love gift"
      style={{
        backgroundImage: "url(/assets/gift_bg.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#fdf8d8",
      }}
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="mt-1 font-cursive text-4xl leading-tight text-gold sm:text-5xl text-balance">
          A Token of Love for the Couple
        </h2>
        <div className="mx-auto mt-3 mb-5 flex items-center justify-center gap-3">
          <div className="h-px w-16" style={{ background: "linear-gradient(to right, rgba(200,150,60,0.5), transparent)" }} />
          <span className="text-gold/70">✦</span>
          <div className="h-px w-16" style={{ background: "linear-gradient(to left, rgba(200,150,60,0.5), transparent)" }} />
        </div>
        <p className="mx-auto max-w-md text-base leading-relaxed text-muted-ink">
          {site.copy.giftMessage}
        </p>
      </div>

      <div className="relative mt-12 max-w-6xl mx-auto">
        <div className="overflow-hidden relative" ref={emblaRef}>
          <div className="flex px-4" style={{ alignItems: "stretch" }}>
            {ACCOUNTS.map((a, i) => (
              <div
                key={`${a.provider}-${a.accountName}`}
                className="min-w-0 flex-[0_0_85%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] py-4 px-2 sm:px-3"
              >
                <div
                  className="transition-all duration-500 ease-out h-full"
                  style={{
                    opacity: selected === i ? 1 : 0.6,
                    transform: selected === i ? "scale(1)" : "scale(0.95)",
                    willChange: "transform, opacity"
                  }}
                >
                  <GiftCard account={a} style={CARD_STYLES[i % CARD_STYLES.length]} isActive={selected === i} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Arrow buttons */}
        <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none px-1 sm:px-2">
          <button
            type="button"
            aria-label="Previous gift"
            onClick={scrollPrev}
            className="pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full transition-all hover:scale-105"
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(200,150,60,0.4)",
              boxShadow: "0 4px 16px rgba(200,150,60,0.2)",
            }}
          >
            <ChevronLeft className="h-6 w-6 text-gold ml-[-2px]" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next gift"
            onClick={scrollNext}
            className="pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full transition-all hover:scale-105"
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(200,150,60,0.4)",
              boxShadow: "0 4px 16px rgba(200,150,60,0.2)",
            }}
          >
            <ChevronRight className="h-6 w-6 text-gold mr-[-2px]" aria-hidden />
          </button>
        </div>
      </div>

      {/* Dot indicators */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2" aria-live="polite" aria-label={`Gift ${selected + 1} of ${ACCOUNTS.length}`}>
        {ACCOUNTS.map((a, i) => (
          <button
            key={`${a.provider}-${a.accountName}`}
            type="button"
            aria-label={`Go to gift ${i + 1}`}
            onClick={() => embla?.scrollTo(i)}
            className="transition-all duration-300"
            style={{
              width: selected === i ? 24 : 8,
              height: 8,
              borderRadius: 99,
              background: selected === i
                ? "linear-gradient(to right, #c8963c, #f5e4a0)"
                : "rgba(200,150,60,0.4)",
              border: "none",
            }}
          />
        ))}
      </div>
    </Section>
  );
}

function GiftCard({
  account,
  style,
  isActive
}: {
  account: GiftAccount;
  style: (typeof CARD_STYLES)[0];
  isActive: boolean;
}) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    if (!account.identifier) return;
    try {
      await navigator.clipboard.writeText(account.identifier);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* Clipboard may be unavailable; non-fatal. */ }
  };

  return (
    <div
      className="relative flex h-full flex-col items-center overflow-hidden rounded-3xl p-8 text-center transition-shadow duration-500"
      style={{
        background: `linear-gradient(145deg, ${style.from}, ${style.to})`,
        border: `1px solid ${style.accent}25`,
        boxShadow: isActive
          ? `0 12px 40px ${style.accent}30, 0 1px 0 rgba(255,255,255,0.8) inset`
          : `0 8px 20px ${style.accent}15, 0 1px 0 rgba(255,255,255,0.6) inset`,
      }}
    >
      {/* Shimmer overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 3s ease-in-out infinite",
        }}
      />

      {/* Header */}
      <div
        className="mb-3 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
        style={{ background: style.iconBg, boxShadow: `0 4px 14px ${style.accent}40` }}
      >
        <Gift className="h-5 w-5 text-white" aria-hidden />
      </div>
      <p className="mb-6 text-xs font-bold uppercase tracking-[0.1em]" style={{ color: style.accent }}>
        {account.provider}
      </p>

      {/* QR Code / Account Image */}
      <div
        className="mb-6 relative flex h-48 w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/50 shadow-inner p-2"
        style={{ border: `2px dashed ${style.accent}40` }}
      >
        <LightboxImage
          src={account.image}
          alt={`${account.provider} QR Code`}
          wrapperClassName="relative w-full h-full"
          imageClassName="object-contain"
          fill
        />
      </div>

      {/* Account Info */}
      <div className="mt-auto flex w-full flex-col items-center">
        <p className="font-display text-2xl font-semibold text-ink">{account.accountName}</p>

        {account.identifier ? (
          <div className="mt-4 flex w-full items-center justify-between gap-2 rounded-xl px-4 py-2.5"
            style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.8)" }}>
            <code className="truncate text-base font-medium tracking-wide text-muted-ink flex-1 text-left">{account.identifier}</code>
            <button
              type="button"
              onClick={copy}
              aria-label={`Copy ${account.provider} details`}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-all hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${style.accent}, ${style.accent}bb)`,
                boxShadow: `0 2px 8px ${style.accent}40`,
              }}
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.span key="check" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                    className="flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" aria-hidden /> Copied
                  </motion.span>
                ) : (
                  <motion.span key="copy" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                    className="flex items-center gap-1">
                    <Copy className="h-3.5 w-3.5" aria-hidden /> Copy
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        ) : (
          <div className="mt-4 h-[46px] w-full" aria-hidden />
        )}
      </div>
    </div>
  );
}
