import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Manually parse .env file
try {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const parts = line.split("=");
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join("=").trim().replace(/^['"]|['"]$/g, "");
        if (key && !key.startsWith("#")) {
          process.env[key] = val;
        }
      }
    });
  }
} catch (e) {
  console.error("Failed to load .env:", e);
}

async function run() {
  const requiredConfirmation = "RESET WEDDING RSVP OPERATIONAL DATA";
  if (process.env.RESET_DATABASE_CONFIRM !== requiredConfirmation) {
    throw new Error(
      `Reset refused. Set RESET_DATABASE_CONFIRM="${requiredConfirmation}".`,
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.",
    );
  }

  const parsedUrl = new URL(url);
  if (
    /prod|production/i.test(parsedUrl.hostname) &&
    process.env.ALLOW_PRODUCTION_RESET !== "true"
  ) {
    throw new Error(
      "Production-like target refused. Set ALLOW_PRODUCTION_RESET=true only after taking a backup.",
    );
  }

  const db = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const tables = [
    ["attendance_events", "id"],
    ["email_deliveries", "id"],
    ["audit_logs", "id"],
    ["qr_passes", "id"],
    ["guest_sessions", "id"],
    ["invitee_aliases", "id"],
    ["invitees", "id"],
    ["tables", "id"],
    ["invitation_parties", "id"],
  ] as const;

  for (const [table, key] of tables) {
    const { error } = await db.from(table).delete().not(key, "is", null);
    if (error) throw new Error(`Failed clearing ${table}: ${error.message}`);
    console.log(`[reset] cleared ${table}`);
  }

  if (process.env.RESET_INCLUDE_ADMIN_PROFILES === "true") {
    const { error } = await db
      .from("admin_profiles")
      .delete()
      .not("user_id", "is", null);
    if (error) throw new Error(`Failed clearing admin_profiles: ${error.message}`);
    console.log("[reset] cleared admin_profiles");
  }

  console.log(
    "[reset] Operational data cleared. Supabase Auth users were preserved. Run 'pnpm seed' to add synthetic data.",
  );
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
