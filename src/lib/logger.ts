/*
  Structured logger with redaction (docs/security-and-privacy.md "Logging").
  Never log raw session/QR tokens, passwords, full RSVP notes, complete account
  numbers, or full guest lists. Use correlation IDs and entity IDs instead.

  This logger redacts known-sensitive keys and masks emails/names when a value
  is unavoidably human-readable.
*/

const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "tokenhash",
  "token_hash",
  "rawtoken",
  "qr",
  "qrtoken",
  "session",
  "sessiontoken",
  "secret",
  "servicekey",
  "service_role_key",
  "authorization",
  "cookie",
  "notes",
  "dietary_notes",
  "accountnumber",
  "account_number",
  "apikey",
  "api_key",
]);

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const head = local.slice(0, 1);
  return `${head}***@${domain}`;
}

export function maskName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "***";
  return `${trimmed.slice(0, 1)}***`;
}

function redact(value: unknown, depth = 0): unknown {
  if (depth > 6) return "[depth-limit]";
  if (value === null || value === undefined) return value;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const key = k.toLowerCase();
      if (SENSITIVE_KEYS.has(key)) {
        out[k] = "[redacted]";
      } else if (key === "email" && typeof v === "string") {
        out[k] = maskEmail(v);
      } else if (
        (key === "name" || key === "full_name" || key === "fullname") &&
        typeof v === "string"
      ) {
        out[k] = maskName(v);
      } else {
        out[k] = redact(v, depth + 1);
      }
    }
    return out;
  }
  return "[unserializable]";
}

type Level = "debug" | "info" | "warn" | "error";

type LogContext = Record<string, unknown> & { requestId?: string };

function emit(level: Level, message: string, context?: LogContext) {
  const payload = {
    level,
    message,
    ...(context ? (redact(context) as Record<string, unknown>) : {}),
  };
  const line = JSON.stringify(payload);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  debug: (message: string, context?: LogContext) =>
    emit("debug", message, context),
  info: (message: string, context?: LogContext) =>
    emit("info", message, context),
  warn: (message: string, context?: LogContext) =>
    emit("warn", message, context),
  error: (message: string, context?: LogContext) =>
    emit("error", message, context),
  // Exposed for unit testing the redaction logic.
  _redact: redact,
};
