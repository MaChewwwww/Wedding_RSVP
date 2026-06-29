import { env, serverEnv } from "@/config/env";
import { site } from "@/config/site";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, XCircle } from "lucide-react";

export default function SettingsPage() {
  const server = serverEnv();
  const integrations = [
    ["Supabase URL",            Boolean(env.NEXT_PUBLIC_SUPABASE_URL)],
    ["Supabase anonymous key",  Boolean(env.NEXT_PUBLIC_SUPABASE_ANON_KEY)],
    ["Supabase service role",   Boolean(server.SUPABASE_SERVICE_ROLE_KEY)],
    ["Guest session secret",    Boolean(server.GUEST_SESSION_SECRET)],
    ["QR token pepper",         Boolean(server.QR_TOKEN_PEPPER)],
    ["QR encryption key",       Boolean(server.QR_TOKEN_ENCRYPTION_KEY)],
    ["Brevo API",              Boolean(server.BREVO_API_KEY && server.BREVO_FROM_EMAIL)],
    ["Brevo webhook",          Boolean(server.BREVO_WEBHOOK_SECRET)],
  ] as const;

  const weddingConfig = [
    ["Couple",         site.couple.displayName],
    ["Monogram",       site.couple.monogram],
    ["Wedding date",   site.event.weddingDate],
    ["Timezone",       site.event.timezone],
    ["RSVP deadline",  server.RSVP_DEADLINE],
    ["Support email",  site.event.supportContact.email],
    ["Check-in mode",  server.CHECK_IN_MODE],
    ["Social hashtag", site.social.hashtag],
  ] as const;

  const configuredCount = integrations.filter(([, ok]) => ok).length;

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-8">
      <PageHeader
        title="Settings"
        subtitle="Wedding content is managed via typed configuration and redeployment."
      />

      {/* ── Integration status summary ── */}
      <div
        className="mb-8 flex items-center gap-3 rounded-2xl px-5 py-4"
        style={{
          background: configuredCount === integrations.length
            ? "rgba(90,156,86,0.08)"
            : "rgba(200,150,60,0.08)",
          border: configuredCount === integrations.length
            ? "1px solid rgba(90,156,86,0.25)"
            : "1px solid rgba(200,150,60,0.25)",
        }}
      >
        {configuredCount === integrations.length ? (
          <CheckCircle2 className="h-5 w-5 shrink-0 text-sage-deep" aria-hidden />
        ) : (
          <XCircle className="h-5 w-5 shrink-0 text-butter-deep" aria-hidden />
        )}
        <p className="text-sm font-medium" style={{
          color: configuredCount === integrations.length ? "#4a8a46" : "#b48a17",
        }}>
          {configuredCount} of {integrations.length} integrations configured
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">

        {/* ── Wedding configuration ── */}
        <section>
          <h2 className="font-display text-2xl font-semibold text-ink mb-4">
            Wedding configuration
          </h2>
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              border: "1px solid rgba(240,168,188,0.2)",
              boxShadow: "0 2px 10px rgba(60,30,20,0.04)",
            }}
          >
            {weddingConfig.map(([label, value], i) => (
              <div
                key={label}
                className="flex items-start justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-blush-light/15"
                style={{
                  borderBottom: i < weddingConfig.length - 1
                    ? "1px solid rgba(240,168,188,0.15)"
                    : "none",
                }}
              >
                <dt className="text-sm text-muted-ink shrink-0">{label}</dt>
                <dd className="text-sm font-semibold text-ink text-right">{value}</dd>
              </div>
            ))}
          </div>
        </section>

        {/* ── Integration readiness ── */}
        <section>
          <h2 className="font-display text-2xl font-semibold text-ink mb-4">
            Integration readiness
          </h2>
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              border: "1px solid rgba(240,168,188,0.2)",
              boxShadow: "0 2px 10px rgba(60,30,20,0.04)",
            }}
          >
            {integrations.map(([label, configured], i) => (
              <div
                key={label}
                className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-blush-light/15"
                style={{
                  borderBottom: i < integrations.length - 1
                    ? "1px solid rgba(240,168,188,0.15)"
                    : "none",
                }}
              >
                <span className="text-sm text-ink">{label}</span>
                <Badge variant={configured ? "success" : "warning"}>
                  {configured ? "Configured" : "Missing"}
                </Badge>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Separator className="my-8" />

      <p className="text-sm text-muted-ink">
        Edit content under{" "}
        <code className="rounded bg-blush-light px-1.5 py-0.5 font-mono text-rose text-xs">
          src/config
        </code>{" "}
        and redeploy. A database-backed content editor remains optional post-launch work.
      </p>
    </div>
  );
}
