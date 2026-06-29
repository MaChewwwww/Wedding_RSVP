import { loadAuditLog } from "@/server/admin/operations";
import { PageHeader } from "@/components/admin/page-header";
import { AuditClient } from "./audit-client";

export default async function AuditPage() {
  const rows = await loadAuditLog(200);

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-8">
      <PageHeader
        title="Activity History"
        subtitle={`The last ${rows.length} actions — most recent first.`}
      />
      <AuditClient rows={rows} />
    </div>
  );
}
