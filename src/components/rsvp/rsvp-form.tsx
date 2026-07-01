"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import {
  submitRsvpAction,
  type RsvpActionState,
} from "@/app/(guest)/rsvp-actions";
import type { PartyView } from "@/server/rsvp/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/*
  Detailed RSVP form (docs/features.md "Invitation lookup and RSVP"). One guest
  attendance response, optional consented email, and optional notes. The server
  remains authoritative; this provides immediate feedback only.
*/

const initial: RsvpActionState = { status: "idle" };
const CHOICES = [
  { value: "attending", label: "Attending" },
  { value: "declined", label: "Not attending" },
  { value: "undecided", label: "Undecided" },
] as const;

export function RsvpForm({ party }: { party: PartyView }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    submitRsvpAction,
    initial,
  );
  const [attendanceState, setAttendanceState] = React.useState<string>("");

  React.useEffect(() => {
    if (state.status === "success") router.push("/pass");
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">
          RSVP for {party.guest.fullName}
        </h1>
        <p className="mt-1 text-sm text-muted-ink">
          Please let us know whether you can join us.
        </p>
      </div>

      <fieldset className="rounded-md border border-clay/20 bg-paper/70 p-4">
        <legend className="font-medium text-ink">Will you attend?</legend>
        <div
          role="radiogroup"
          aria-label={`Attendance for ${party.guest.fullName}`}
          className="mt-2 flex flex-wrap gap-2"
        >
          {CHOICES.map((choice) => (
            <label
              key={choice.value}
              className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-clay/30 px-3 py-2 text-sm has-[:checked]:border-focus has-[:checked]:bg-sage/20"
            >
              <input
                type="radio"
                name={`attendance:${party.guest.id}`}
                value={choice.value}
                checked={attendanceState === choice.value}
                onChange={(e) => setAttendanceState(e.target.value)}
                className="accent-focus"
              />
              {choice.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email (optional)</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue=""
          placeholder="you@example.com"
          disabled={pending}
        />
        <p className="mt-1 text-xs text-rose-600 font-semibold">
          The QR code invitation will be sent here.
        </p>
      </div>

      {state.status === "error" && (
        <p role="alert" className="text-sm text-danger">
          {state.message}
        </p>
      )}
      {state.status === "closed" && (
        <p role="alert" className="text-sm text-danger">
          RSVPs are now closed. Please contact us for assistance.
        </p>
      )}
      {state.status === "unconfigured" && (
        <p role="alert" className="text-sm text-danger">
          The RSVP service isn&apos;t available yet. Please check back soon.
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending || attendanceState === ""} className="w-full">
        {pending ? "Saving…" : "Submit RSVP"}
      </Button>
    </form>
  );
}
