import { loadGuestAdminData } from "@/server/admin/operations";
import { PageHeader } from "@/components/admin/page-header";
import { GuestsClient } from "./guests-client";

export default async function GuestsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q : "";
  const parties = await loadGuestAdminData(search);

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-8">
      <PageHeader
        title="Guests"
        subtitle="Add guests, set RSVP status, and manage digital passes."
      />
      <GuestsClient parties={parties} search={search} />
    </div>
  );
}
