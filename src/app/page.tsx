import { EnvelopeGate } from "@/components/envelope/envelope-gate";
import { LookupForm } from "@/components/envelope/lookup-form";
import { isDeadlinePassed } from "@/server/rsvp/deadline";

/*
  Invitation gate (docs/features.md). Full-viewport, navbar-free. The envelope
  opens to reveal the name-lookup form in the card's safe area. RSVP open/closed
  state is computed on the server from RSVP_DEADLINE.
*/
export default function HomePage() {
  const rsvpOpen = !isDeadlinePassed();
  return (
    <main className="full-svh overflow-hidden">
      <EnvelopeGate>
        <LookupForm rsvpOpen={rsvpOpen} />
      </EnvelopeGate>
    </main>
  );
}
