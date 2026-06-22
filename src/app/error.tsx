"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled route error", error.digest ?? error.message);
  }, [error]);

  return (
    <main className="flex min-h-[70svh] items-center justify-center px-5 py-12">
      <div className="max-w-md text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-clay">
          Something went wrong
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-ink">
          We could not open this page.
        </h1>
        <p className="mt-3 text-muted-ink">
          Try loading it again. If the problem continues, return to the
          invitation.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button type="button" onClick={() => unstable_retry()}>
            Try again
          </Button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-md px-4 text-sm font-medium text-focus underline underline-offset-4"
          >
            Return to invitation
          </Link>
        </div>
      </div>
    </main>
  );
}
