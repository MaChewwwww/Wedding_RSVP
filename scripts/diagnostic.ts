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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing SUPABASE credentials in .env");
  process.exit(1);
}

const db = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function run() {
  console.log("Checking database invitation_parties...");
  const { data: parties } = await db.from("invitation_parties").select("*");
  console.log(JSON.stringify(parties, null, 2));

  console.log("Checking database invitees...");
  const { data: invitees } = await db.from("invitees").select("*");
  console.log(JSON.stringify(invitees, null, 2));

  console.log("Checking database guest_sessions...");
  const { data: sessions } = await db.from("guest_sessions").select("*");
  console.log(JSON.stringify(sessions, null, 2));
}

run();
