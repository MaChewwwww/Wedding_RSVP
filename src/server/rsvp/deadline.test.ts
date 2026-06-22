import { describe, expect, it } from "vitest";
import {
  assertDeadlineOpen,
  DeadlinePassedError,
  isDeadlinePassed,
} from "./deadline";

describe("RSVP deadline", () => {
  it("is open immediately before the configured instant", () => {
    expect(isDeadlinePassed(new Date("2026-07-10T15:59:58.999Z"))).toBe(false);
  });

  it("closes at the exact configured instant", () => {
    expect(isDeadlinePassed(new Date("2026-07-10T15:59:59.000Z"))).toBe(true);
    expect(() =>
      assertDeadlineOpen(new Date("2026-07-10T15:59:59.000Z")),
    ).toThrow(DeadlinePassedError);
  });
});
