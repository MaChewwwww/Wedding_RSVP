import { describe, expect, it } from "vitest";
import { logger, maskEmail, maskName } from "./logger";

describe("logger redaction", () => {
  it("masks names and emails", () => {
    expect(maskEmail("guest@example.com")).toBe("g***@example.com");
    expect(maskName("Maria Santos")).toBe("M***");
  });

  it("redacts nested secrets and notes", () => {
    expect(
      logger._redact({
        email: "guest@example.com",
        fullName: "Maria Santos",
        nested: { token: "raw-token", notes: "private" },
      }),
    ).toEqual({
      email: "g***@example.com",
      fullName: "M***",
      nested: { token: "[redacted]", notes: "[redacted]" },
    });
  });
});
