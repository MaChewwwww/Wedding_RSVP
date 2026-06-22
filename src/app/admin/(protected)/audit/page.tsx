import { createAdminClient } from "@/lib/supabase/admin";

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
    <main className="mx-auto w-full max-w-7xl px-5 py-8">
      <h1 className="text-3xl font-semibold">Audit history</h1>
      <div className="mt-8 overflow-x-auto border-y border-zinc-200">
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              <th className="py-3 pr-4">Time</th>
              <th className="py-3 pr-4">Action</th>
              <th className="py-3 pr-4">Entity</th>
              <th className="py-3">Identifier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {(data ?? []).map((entry) => (
              <tr key={entry.id}>
                <td className="py-3 pr-4">{entry.created_at}</td>
                <td className="py-3 pr-4 font-medium">{entry.action}</td>
                <td className="py-3 pr-4">{entry.entity_type}</td>
                <td className="py-3 font-mono text-xs">{entry.entity_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
