import type { CSSProperties } from "react";

/*
  CSS paper/watercolor placeholder backgrounds (docs/design.md "Generated
  background rules", docs/background-art-plan.md). The generated art set is NOT
  yet produced, so sections without supplied artwork use these soft pastel
  gradients as clearly-labeled placeholders rather than abrupt plain blocks.
  Replace with the approved generated assets during the visual asset phase.
*/

type Tone = "blush" | "sage" | "sky" | "butter" | "dusk";

const TONES: Record<Tone, string> = {
  blush:
    "radial-gradient(120% 80% at 0% 0%, rgba(239,182,195,0.35), transparent 60%), radial-gradient(120% 80% at 100% 100%, rgba(239,182,195,0.25), transparent 60%)",
  sage:
    "radial-gradient(120% 80% at 100% 0%, rgba(175,201,157,0.35), transparent 60%), radial-gradient(120% 80% at 0% 100%, rgba(175,201,157,0.22), transparent 60%)",
  sky: "radial-gradient(120% 80% at 0% 0%, rgba(185,216,232,0.35), transparent 60%), radial-gradient(120% 80% at 100% 100%, rgba(185,216,232,0.25), transparent 60%)",
  butter:
    "radial-gradient(120% 80% at 50% 0%, rgba(245,217,139,0.30), transparent 60%)",
  dusk: "linear-gradient(180deg, rgba(185,216,232,0.30), rgba(239,182,195,0.30) 60%, rgba(201,157,120,0.25))",
};

export function paperBg(tone: Tone): CSSProperties {
  return {
    backgroundColor: "var(--color-paper)",
    backgroundImage: TONES[tone],
  };
}
