import "server-only";
import { serverEnv } from "@/config/env";

/*
  RSVP deadline authorization (docs/security-and-privacy.md "RSVP deadline
  enforcement"). The deadline is a server rule: guest RSVP creation/updates are
  allowed only while now < RSVP_DEADLINE. Comparisons use the absolute instant;
  the display timezone is presentation only.

  isDeadlinePassed/assertDeadlineOpen take an injectable `now` for testing.
*/

export function getDeadline(): Date {
  return new Date(serverEnv().RSVP_DEADLINE);
}

export function isDeadlinePassed(now: Date = new Date()): boolean {
  return now.getTime() >= getDeadline().getTime();
}

export class DeadlinePassedError extends Error {
  constructor() {
    super("The RSVP deadline has passed.");
    this.name = "DeadlinePassedError";
  }
}

/** Throws DeadlinePassedError if RSVPs are closed. Call inside every mutation. */
export function assertDeadlineOpen(now: Date = new Date()): void {
  if (isDeadlinePassed(now)) throw new DeadlinePassedError();
}
