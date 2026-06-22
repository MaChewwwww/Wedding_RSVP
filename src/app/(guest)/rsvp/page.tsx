import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { loadCurrentParty } from "@/server/rsvp/loader";
import { isBackendConfigured } from "@/config/env";
import { isDeadlinePassed } from "@/server/rsvp/deadline";
import { RsvpForm } from "@/components/rsvp/rsvp-form";
import { BackendNotice } from "@/components/backend-notice";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "RSVP" };
export const dynamic = "force-dynamic";

/*
  Detailed RSVP step (docs/architecture.md route plan). Requires a valid guest
  session (set during lookup). After the deadline the form is read-only with the
  configured support contact (docs/user-flows.md "update RSVP").
*/
export default async function RsvpPage() {
  if (!isBackendConfigured()) {
    return (
      <main className="mx-auto w-full max-w-2xl px-5 py-12">
        <BackendNotice feature="The RSVP form" />
      </main>
    );
  }

  const party = await loadCurrentParty();
  if (!party) redirect("/");

  const closed = isDeadlinePassed();

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-12">
      {closed ? (
        <div className="space-y-4">
          <h1 className="font-display text-3xl font-semibold text-ink">
            {party.guest.fullName}
          </h1>
          <p className="text-muted-ink">
            RSVPs closed on {site.event.rsvpDeadlineDisplay}. Your response is now
            read-only. To make a change, please contact{" "}
            {site.event.supportContact.email}.
          </p>
          <a href="/celebration" className="text-focus underline">
            Continue to the celebration page
          </a>
        </div>
      ) : (
        <RsvpForm party={party} />
      )}
    </main>
  );
}
