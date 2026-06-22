import { createAdminClient } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import {
  AdminTable,
  Table,
  TableHead,
  Th,
  TableBody,
  Tr,
  Td,
  TableEmpty,
} from "@/components/admin/admin-table";

function actionBadge(action: string) {
  if (action.startsWith("rsvp."))    return <Badge variant="lavender">{action}</Badge>;
  if (action.startsWith("party."))   return <Badge variant="default">{action}</Badge>;
  if (action.startsWith("qr."))      return <Badge variant="sky">{action}</Badge>;
  if (action.startsWith("table."))   return <Badge variant="muted">{action}</Badge>;
  if (action.startsWith("invitee.")) return <Badge variant="success">{action}</Badge>;
  return <Badge variant="muted">{action}</Badge>;
}

function formatTimestamp(ts: string | null | undefined) {
  if (!ts) return "—";
  try {
    return new Intl.DateTimeFormat("en-PH", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(ts));
  } catch {
    return ts;
  }
}

export default async function AuditPage() {
  const db = createAdminClient();
  const { data } = db
    ? await db
        .from("audit_logs")
        .select("id, action, entity_type, entity_id, created_at")
        .order("created_at", { ascending: false })
        .limit(200)
    : { data: [] };

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-8">
      <PageHeader
        title="Audit History"
        subtitle={`Showing the last ${(data ?? []).length} events — most recent first.`}
      />

      <AdminTable>
        <Table>
          <TableHead>
            <tr>
              <Th>Timestamp</Th>
              <Th>Action</Th>
              <Th>Entity type</Th>
              <Th>Identifier</Th>
            </tr>
          </TableHead>
          <TableBody>
            {(data ?? []).length === 0 && (
              <TableEmpty message="No audit events recorded yet." />
            )}
            {(data ?? []).map((entry) => (
              <Tr key={entry.id}>
                <Td className="whitespace-nowrap text-xs text-muted-ink">
                  {formatTimestamp(entry.created_at)}
                </Td>
                <Td>{actionBadge(entry.action)}</Td>
                <Td className="text-sm text-muted-ink capitalize">
                  {entry.entity_type?.replace(/_/g, " ")}
                </Td>
                <Td>
                  <code className="rounded bg-blush-light px-1.5 py-0.5 font-mono text-xs text-rose">
                    {entry.entity_id ? entry.entity_id.slice(0, 12) + "…" : "—"}
                  </code>
                </Td>
              </Tr>
            ))}
          </TableBody>
        </Table>
      </AdminTable>
    </div>
  );
}
