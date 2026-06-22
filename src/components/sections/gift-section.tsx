"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Copy, Gift } from "lucide-react";
import { Section } from "./section";
import { site } from "@/config/site";

/*
  Love gift section — glassmorphism gift cards with gradient shimmer,
  elegant copy-to-clipboard, butter/gold pastel background.
*/

type GiftAccount = { provider: string; accountName: string; identifier: string };

const ACCOUNTS: GiftAccount[] = [
  { provider: "Bank Transfer", accountName: "To be confirmed", identifier: "—" },
  { provider: "E-Wallet", accountName: "To be confirmed", identifier: "—" },
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
];

export function GiftSection() {
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
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-butter-deep/80">
          With love
        </p>
        <h2 className="mt-1 font-cursive text-5xl leading-tight text-gold sm:text-6xl">
          Love Gift
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

      <div className="mx-auto mt-10 grid max-w-2xl gap-5 sm:grid-cols-2">
        {ACCOUNTS.map((a, i) => (
          <GiftCard key={a.provider} account={a} style={CARD_STYLES[i % CARD_STYLES.length]} />
        ))}
      </div>
    </Section>
  );
}

function GiftCard({
  account,
  style,
}: {
  account: GiftAccount;
  style: (typeof CARD_STYLES)[0];
}) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(account.identifier);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* Clipboard may be unavailable; non-fatal. */ }
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6"
      style={{
        background: `linear-gradient(145deg, ${style.from}, ${style.to})`,
        border: `1px solid ${style.accent}25`,
        boxShadow: `0 12px 40px ${style.accent}18, 0 1px 0 rgba(255,255,255,0.8) inset`,
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

      {/* Icon */}
      <div
        className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl"
        style={{ background: style.iconBg, boxShadow: `0 4px 14px ${style.accent}40` }}
      >
        <Gift className="h-5 w-5 text-white" aria-hidden />
      </div>

      <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: style.accent }}>
        {account.provider}
      </p>
      <p className="mt-1.5 font-display text-xl font-semibold text-ink">{account.accountName}</p>

      <div className="mt-3 flex items-center justify-between gap-2 rounded-xl px-3 py-2"
        style={{ background: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.7)" }}>
        <code className="truncate text-sm text-muted-ink flex-1">{account.identifier}</code>
        <button
          type="button"
          onClick={copy}
          aria-label={`Copy ${account.provider} details`}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-all hover:scale-105"
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
    </div>
  );
}
