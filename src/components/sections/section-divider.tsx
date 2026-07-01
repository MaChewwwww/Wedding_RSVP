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
  SectionDivider — a very simple, understated separator: a thin hairline with a
  small centered dot. Replaces the previous ornate floral divider per client
  feedback ("too elegant / fairytale").
*/
export function SectionDivider(_props: Props) {
  return (
    <div
      aria-hidden
      className="relative flex items-center justify-center gap-3 w-full px-6 py-8 pointer-events-none select-none"
    >
      <div
        className="h-px flex-1 max-w-[120px]"
        style={{ background: "linear-gradient(to right, transparent, rgba(58,51,48,0.18))" }}
      />
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: "rgba(58,51,48,0.28)" }} />
      <div
        className="h-px flex-1 max-w-[120px]"
        style={{ background: "linear-gradient(to left, transparent, rgba(58,51,48,0.18))" }}
      />
    </div>
  );
}
