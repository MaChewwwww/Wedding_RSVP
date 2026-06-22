import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { loadPasses } from "@/server/qr/pass-loader";
import { isBackendConfigured } from "@/config/env";
import { PassPanel } from "@/components/pass/pass-panel";
import { BackendNotice } from "@/components/backend-notice";
import { ResendPassForm } from "@/components/pass/resend-pass-form";


export const dynamic = "force-dynamic";

/*
  Focused pass view (docs/architecture.md route plan). Existing respondents may
  view their pass even after the deadline. QR images are rendered server-side
  from the issuance flow; live rendering requires the backend.
*/
export default async function PassPage() {
  if (!isBackendConfigured()) {
    return (
      <main className="mx-auto w-full max-w-2xl px-5 py-12">
        <BackendNotice feature="Your wedding pass" />
      </main>
    );
  }

  const data = await loadPasses();
  if (!data) redirect("/");

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-12">
      <h1 className="mb-6 text-center font-display text-3xl font-semibold text-ink">
        Your Wedding Pass
      </h1>
      <div className="space-y-6">
        {data.passes.length === 0 ? (
          <p className="text-center text-muted-ink">
            No active pass yet. Complete your RSVP to receive one.
          </p>
        ) : (
          data.passes.map((p) => (
            <PassPanel
              key={p.inviteeId}
              label={p.label}
              qrDataUrl={p.qrDataUrl}
            />
          ))
        )}
      </div>
      <ResendPassForm />
    </main>
  );
}
