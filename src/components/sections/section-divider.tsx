export type DividerVariant = "wave" | "cloud" | "tilt" | "petal" | "torn";

interface Props {
  /** Unused topColor for backwards compatibility */
  topColor?: string;
  /** Unused bottomColor for backwards compatibility */
  bottomColor?: string;
  /** Unused glowColor for backwards compatibility */
  glowColor?: string;
  /** Unused shape variant for backwards compatibility */
  variant?: DividerVariant;
  /** Unused flip for backwards compatibility */
  flip?: boolean;
  /** Unused height for backwards compatibility */
  height?: number;
  /** Unused align for backwards compatibility */
  align?: "top" | "bottom";
}

/*
  SectionDivider — triple-rule hairline: a thin ivory line above, a thin dark
  line in the middle, and a thin ivory line below, centered on a small rotated
  diamond. Gives a refined "sandwich" look without visual weight.
*/
export function SectionDivider(_props: Props) {
  return (
    <div
      aria-hidden
      className="relative flex w-full items-center justify-center px-6 py-6 pointer-events-none select-none"
    >
      <div className="flex w-full max-w-sm items-center gap-3">
        {/* Left triple-rule */}
        <div className="flex flex-1 flex-col gap-[3px]">
          <div style={{ height: 1, background: "linear-gradient(to right, transparent, rgba(255,252,245,0.65))" }} />
          <div style={{ height: 1, background: "linear-gradient(to right, transparent, rgba(30,20,10,0.55))" }} />
          <div style={{ height: 1, background: "linear-gradient(to right, transparent, rgba(255,252,245,0.65))" }} />
        </div>

        {/* Center diamond ornament */}
        <span
          aria-hidden
          style={{
            display: "block",
            width: 6,
            height: 6,
            background: "rgba(30,20,10,0.5)",
            transform: "rotate(45deg)",
            flexShrink: 0,
          }}
        />

        {/* Right triple-rule */}
        <div className="flex flex-1 flex-col gap-[3px]">
          <div style={{ height: 1, background: "linear-gradient(to left, transparent, rgba(255,252,245,0.65))" }} />
          <div style={{ height: 1, background: "linear-gradient(to left, transparent, rgba(30,20,10,0.55))" }} />
          <div style={{ height: 1, background: "linear-gradient(to left, transparent, rgba(255,252,245,0.65))" }} />
        </div>
      </div>
    </div>
  );
}
