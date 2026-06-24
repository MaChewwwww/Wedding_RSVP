import { loadAuditLog, type AuditRow } from "@/server/admin/operations";
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
import {
  UserPlus,
  Trash2,
  CalendarCheck,
  Ticket,
  Grid2x2,
  Armchair,
  ScanLine,
  Activity,
} from "lucide-react";

const KIND_ICON: Record<AuditRow["actionKind"], typeof Activity> = {
  create: UserPlus,
  delete: Trash2,
  rsvp: CalendarCheck,
  pass: Ticket,
  table: Grid2x2,
  seating: Armchair,
  checkin: ScanLine,
  other: Activity,
};

const KIND_VARIANT: Record<
  AuditRow["actionKind"],
  React.ComponentProps<typeof Badge>["variant"]
> = {
  create: "success",
  delete: "danger",
  rsvp: "lavender",
  pass: "sky",
  table: "muted",
  seating: "default",
  checkin: "success",
  other: "muted",
};

function formatTimestamp(ts: string) {
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
  const rows = await loadAuditLog(200);

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-8">
      <PageHeader
        title="Activity History"
        subtitle={`The last ${rows.length} actions — most recent first.`}
      />

      <AdminTable>
        <Table>
          <TableHead>
            <tr>
              <Th>When</Th>
              <Th>Who</Th>
              <Th>What</Th>
              <Th>Guest / Table</Th>
              <Th>Details</Th>
            </tr>
          </TableHead>
          <TableBody>
            {rows.length === 0 && (
              <TableEmpty message="No activity recorded yet." />
            )}
            {rows.map((entry) => {
              const Icon = KIND_ICON[entry.actionKind];
              return (
                <Tr key={entry.id}>
                  <Td className="whitespace-nowrap text-xs text-muted-ink">
                    {formatTimestamp(entry.createdAt)}
                  </Td>
                  <Td className="text-sm text-ink">{entry.actorName}</Td>
                  <Td>
                    <Badge variant={KIND_VARIANT[entry.actionKind]}>
                      <Icon className="h-3 w-3" />
                      {entry.actionLabel}
                    </Badge>
                  </Td>
                  <Td className="text-sm font-medium text-ink">
                    {entry.subject}
                  </Td>
                  <Td className="text-xs text-muted-ink">
                    {entry.detail ?? "—"}
                  </Td>
                </Tr>
              );
            })}
          </TableBody>
        </Table>
      </AdminTable>
    </div>
  );
}
