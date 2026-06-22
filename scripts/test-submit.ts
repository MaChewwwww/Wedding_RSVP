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
  const partyId = "22222222-2222-4222-8222-222222222222";
  const inviteeId = "22222222-2222-4222-8222-222222222222";
  const responses = [{ inviteeId, attendance: "attending" }];
  const email = "maria@example.com";
  
  console.log("Submitting test RSVP for Maria Santos...");
  const { data, error } = await db.rpc("submit_rsvp", {
    p_party_id: partyId,
    p_responses: responses,
    p_email: email,
    p_passes: [],
    p_request_id: "test-request-id",
  });
  
  if (error) {
    console.error("RPC Error:", error);
  } else {
    console.log("RPC Succeeded! Result:", data);
  }
}

run();
