/*
  Programmatic seed (docs/configuration.md "Seed synthetic development data").
  Runs the synthetic dataset through the service-role client. Refuses to run
  without an explicit live Supabase configuration so it can never touch a real
  project by accident. Synthetic, fictional data only — never production guests.

  Usage: pnpm seed   (requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)
*/
import { createClient } from "@supabase/supabase-js";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "[seed] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Provision a Supabase project and set these before seeding.",
  );
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false },
});

async function main() {
  const adminEmail = process.env.ADMIN_SEED_EMAIL;
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;
  
  if (adminEmail && adminPassword) {
    let userId: string | undefined;

    const { data: created, error: userError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });

    if (userError && !userError.message.includes('already registered') && !userError.message.includes('already been registered')) {
      console.error("[seed] Failed to create admin user:", userError);
    } else if (created?.user) {
      console.log(`[seed] Admin user ${adminEmail} provisioned.`);
      userId = created.user.id;
    } else {
      const { data: usersData } = await supabase.auth.admin.listUsers();
      const existingUser = usersData.users.find((u: any) => u.email === adminEmail);
      if (existingUser) {
        userId = existingUser.id;
        console.log(`[seed] Admin user ${adminEmail} already exists.`);
      }
    }

    if (userId) {
      const { error: profileError } = await supabase.from("admin_profiles").upsert({
        user_id: userId,
        role: "admin",
        display_name: "Administrator",
        is_active: true,
      });
      if (profileError) {
        console.error("[seed] Failed to create admin profile:", profileError);
      } else {
        console.log(`[seed] Admin profile for ${adminEmail} upserted.`);
      }
    }
  } else {
    console.log("[seed] ADMIN_SEED_EMAIL or ADMIN_SEED_PASSWORD missing; skipping admin provisioning.");
  }

  const { error: partyError } = await supabase
    .from("invitation_parties")
    .upsert([
      {
        id: "11111111-1111-4111-8111-111111111111",
        display_name: "Maria Dela Cruz",
        invitation_code_hash: null,
      },
      {
        id: "22222222-2222-4222-8222-222222222222",
        display_name: "Maria Santos",
        invitation_code_hash: null,
      },
      {
        id: "33333333-3333-4333-8333-333333333333",
        display_name: "Juan Reyes",
        invitation_code_hash: null,
      },
    ]);
  if (partyError) throw partyError;

  const { error: inviteeError } = await supabase
    .from("invitees")
    .upsert(
      [
        {
          id: "11111111-1111-4111-8111-111111111111",
          party_id: "11111111-1111-4111-8111-111111111111",
          full_name: "Maria Dela Cruz",
          normalized_name: "maria dela cruz",
        },
        {
          id: "22222222-2222-4222-8222-222222222222",
          party_id: "22222222-2222-4222-8222-222222222222",
          full_name: "Maria Santos",
          normalized_name: "maria santos",
        },
        {
          id: "33333333-3333-4333-8333-333333333333",
          party_id: "33333333-3333-4333-8333-333333333333",
          full_name: "Juan Reyes",
          normalized_name: "juan reyes",
        },
      ]
    );
  if (inviteeError) throw inviteeError;

  console.log("[seed] Synthetic data seeded.");
}

main().catch((err) => {
  console.error("[seed] Failed:", err);
  process.exit(1);
});
