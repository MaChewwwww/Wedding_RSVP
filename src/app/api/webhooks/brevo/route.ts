import { z } from "zod";
import { serverEnv } from "@/config/env";
import { createAdminClient } from "@/lib/supabase/admin";

// Brevo webhook payload example:
// { "event": "delivered", "email": "example@domain.com", "message-id": "<xyz@brevo.com>" }
const eventSchema = z.object({
  event: z.string(),
  "message-id": z.string().optional(),
}).passthrough();

const statusByEvent: Record<string, string> = {
  "sent": "sent",
  "delivered": "delivered",
  "hard_bounce": "bounced",
  "soft_bounce": "bounced",
  "spam": "complained",
  "invalid_email": "failed",
  "error": "failed",
  "deferred": "failed",
};

export async function POST(request: Request) {
  const config = serverEnv();
  // We still check for API key to ensure backend is considered configured for email
  if (!config.BREVO_API_KEY) {
    return new Response("Webhook is not configured.", { status: 503 });
  }

  // The user requested to not use webhook signatures to keep it simple on Vercel.
  // In production, consider checking a custom query parameter or header for security.

  let event: unknown;
  try {
    event = await request.json();
  } catch {
    return new Response("Invalid JSON payload.", { status: 400 });
  }

  const parsed = eventSchema.safeParse(event);
  if (!parsed.success) return new Response("Invalid event format.", { status: 400 });

  const brevoEvent = parsed.data.event;
  const status = statusByEvent[brevoEvent];
  const providerMessageId = parsed.data["message-id"];
  
  // Ignore events that don't map to our statuses or missing message ID
  if (!status || !providerMessageId) return new Response(null, { status: 204 });

  const db = createAdminClient();
  if (!db) return new Response("Backend not configured.", { status: 503 });

  await db
    .from("email_deliveries")
    .update({
      status,
      delivered_at:
        status === "delivered" ? new Date().toISOString() : undefined,
    })
    .eq("provider_message_id", providerMessageId);

  return Response.json({ received: true });
}
