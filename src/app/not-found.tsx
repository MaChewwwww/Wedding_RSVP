import Link from "next/link";
import { site } from "@/config/site";

export default function NotFound() {
  return (
    <main className="flex min-h-[70svh] items-center justify-center px-5 py-12">
      <div className="max-w-md text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-clay">
          404
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-ink">
          This page is not on the invitation.
        </h1>
        <p className="mt-3 text-muted-ink">
          Return to {site.couple.displayName}&apos;s invitation to continue.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-ink px-5 text-sm font-medium text-paper"
        >
          Return to invitation
        </Link>
      </div>
    </main>
  );
}
