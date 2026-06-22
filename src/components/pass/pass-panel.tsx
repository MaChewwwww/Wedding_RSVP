"use client";

import * as React from "react";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";

/*
  Wedding pass panel (docs/features.md, docs/design.md "Wedding pass"). The QR
  sits on a solid white plate with its quiet zone — never directly on the
  patterned background. Provides a high-resolution PNG download and human-
  readable label, with a text action for accessibility.
*/

export type PassPanelProps = {
  label: string;
  qrDataUrl: string | null;
};

export function PassPanel({ label, qrDataUrl }: PassPanelProps) {
  const downloadName = `wedding-pass-${label.replace(/\s+/g, "-").toLowerCase()}.png`;

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center rounded-lg bg-paper p-6 shadow-sm">
      <p className="font-display text-xl font-semibold text-ink">{label}</p>
      <div className="mt-4 rounded-md bg-white p-4">
        {qrDataUrl ? (
          <Image
            src={qrDataUrl}
            alt={`QR wedding pass for ${label}`}
            width={256}
            height={256}
            unoptimized
            className="h-56 w-56"
          />
        ) : (
          <div className="flex h-56 w-56 items-center justify-center text-center text-xs text-muted-ink">
            QR pass will appear here once the backend is connected.
          </div>
        )}
      </div>
      <p className="mt-3 text-center text-sm text-muted-ink">
        Present this pass at check-in.
      </p>
      {qrDataUrl && (
        <a
          href={qrDataUrl}
          download={downloadName}
          className={buttonVariants({ className: "mt-4 w-full" })}
        >
          Download PNG
        </a>
      )}
    </div>
  );
}
