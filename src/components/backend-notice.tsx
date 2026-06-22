import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/*
  Explicit "backend not configured" state for scaffold-only mode. Anything that
  needs a live Supabase backend renders this instead of failing opaquely
  (per the plan's verification note).
*/
export function BackendNotice({ feature }: { feature: string }) {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Backend not configured</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-ink">
        <p>
          {feature} needs a live Supabase backend, which isn&apos;t connected in
          this environment yet.
        </p>
        <p>
          Set <code>NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, and{" "}
          <code>SUPABASE_SERVICE_ROLE_KEY</code>, apply the migrations in{" "}
          <code>supabase/migrations</code>, then seed to enable this flow.
        </p>
      </CardContent>
    </Card>
  );
}
