import { Resend } from "resend";
import { z } from "zod";
import { serverEnv } from "@/config/env";
import { createAdminClient } from "@/lib/supabase/admin";

const eventSchema = z.object({
  type: z.string(),
  data: z.object({
    email_id: z.string().optional(),
  }).passthrough(),
});

const statusByEvent: Record<string, string> = {
  "email.sent": "sent",
  "email.delivered": "delivered",
  "email.bounced": "bounced",
  "email.complained": "complained",
  "email.failed": "failed",
};

export async function POST(request: Request) {
  const config = serverEnv();
  if (!config.RESEND_API_KEY || !config.RESEND_WEBHOOK_SECRET) {
    return new Response("Webhook is not configured.", { status: 503 });
  }

  const payload = await request.text();
  let event: unknown;
  try {
    const resend = new Resend(config.RESEND_API_KEY);
    event = resend.webhooks.verify({
      payload,
      headers: {
        id: request.headers.get("svix-id") ?? "",
        timestamp: request.headers.get("svix-timestamp") ?? "",
        signature: request.headers.get("svix-signature") ?? "",
      },
      webhookSecret: config.RESEND_WEBHOOK_SECRET,
    });
  } catch {
    return new Response("Invalid signature.", { status: 400 });
  }

  const parsed = eventSchema.safeParse(event);
  if (!parsed.success) return new Response("Invalid event.", { status: 400 });
  const status = statusByEvent[parsed.data.type];
  const providerMessageId = parsed.data.data.email_id;
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
