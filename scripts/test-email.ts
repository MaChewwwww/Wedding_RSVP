import { queuePassEmail } from "../src/server/email/send";
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
  console.log("Testing queuePassEmail...");
  const partyId = "22222222-2222-4222-8222-222222222222";
  const email = "test@example.com";
  
  const res = await queuePassEmail({
    partyId,
    email,
    purpose: "initial_pass",
    requestId: "test-email-request",
  });
  
  console.log("Result:", res);
}

run();
