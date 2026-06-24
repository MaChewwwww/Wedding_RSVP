import { loadTableAdminData } from "@/server/admin/operations";
import { PageHeader } from "@/components/admin/page-header";
import { TablesClient } from "./tables-client";

export default async function TablesPage() {
  const data = await loadTableAdminData();

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-8">
      <PageHeader
        title="Tables &amp; Seating"
        subtitle="Seat any guest — capacity is enforced by the database."
      />
      <TablesClient tables={data.tables} guests={data.guests} />
    </div>
  );
}
