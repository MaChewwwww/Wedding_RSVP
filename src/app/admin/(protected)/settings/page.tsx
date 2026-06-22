import { env, serverEnv } from "@/config/env";
import { site } from "@/config/site";

export default function SettingsPage() {
  const server = serverEnv();
  const integrations = [
    ["Supabase URL", Boolean(env.NEXT_PUBLIC_SUPABASE_URL)],
    ["Supabase anonymous key", Boolean(env.NEXT_PUBLIC_SUPABASE_ANON_KEY)],
    ["Supabase service role", Boolean(server.SUPABASE_SERVICE_ROLE_KEY)],
    ["Guest session secret", Boolean(server.GUEST_SESSION_SECRET)],
    ["QR token pepper", Boolean(server.QR_TOKEN_PEPPER)],
    ["QR encryption key", Boolean(server.QR_TOKEN_ENCRYPTION_KEY)],
    ["Resend API", Boolean(server.RESEND_API_KEY && server.RESEND_FROM_EMAIL)],
    ["Resend webhook", Boolean(server.RESEND_WEBHOOK_SECRET)],
  ] as const;

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-8">
      <h1 className="text-3xl font-semibold">Settings</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Wedding content is currently deployment-managed typed configuration.
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Public wedding configuration</h2>
        <dl className="mt-4 divide-y divide-zinc-200 border-y border-zinc-200">
          <Setting label="Couple" value={site.couple.displayName} />
          <Setting label="Wedding date" value={site.event.weddingDate} />
          <Setting label="Timezone" value={site.event.timezone} />
          <Setting label="RSVP deadline" value={server.RSVP_DEADLINE} />
          <Setting label="Support email" value={site.event.supportContact.email} />
          <Setting label="Check-in mode" value={server.CHECK_IN_MODE} />
        </dl>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Integration readiness</h2>
        <ul className="mt-4 divide-y divide-zinc-200 border-y border-zinc-200">
          {integrations.map(([label, configured]) => (
            <li key={label} className="flex justify-between gap-4 py-3 text-sm">
              <span>{label}</span>
              <span className={configured ? "text-emerald-700" : "text-amber-700"}>
                {configured ? "Configured" : "Missing"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-8 text-sm text-zinc-600">
        Edit content under <code>src/config</code> and redeploy. A database-backed
        content editor remains optional post-launch work.
      </p>
    </main>
  );
}

function Setting({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[12rem_1fr]">
      <dt className="text-sm text-zinc-600">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}
