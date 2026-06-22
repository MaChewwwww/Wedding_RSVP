import * as React from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode; // right-side slot (e.g. action buttons)
}

/**
 * Reusable admin page header.
 * Renders the display-font title, optional subtitle, and an optional right slot.
 */
export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-4xl font-semibold tracking-wide text-ink">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-ink">{subtitle}</p>
        )}
        {/* Gradient underline accent */}
        <div
          className="mt-2 h-px w-12"
          style={{
            background: "linear-gradient(90deg, #e07898, transparent)",
          }}
        />
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-3">{children}</div>
      )}
    </div>
  );
}
