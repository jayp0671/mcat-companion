import { execFileSync } from "node:child_process";
import { mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const databaseUrl = process.env.SUPABASE_DATABASE_URL;
const outDir = process.env.BACKUP_OUTPUT_DIR ?? "backups";

if (!databaseUrl) {
  console.log("SUPABASE_DATABASE_URL is not configured. Skipping backup. Add it as a GitHub secret before relying on nightly backups.");
  process.exit(0);
}

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const output = join(outDir, `mcat-companion-${stamp}.sql`);

execFileSync("pg_dump", [databaseUrl, "--clean", "--if-exists", "--no-owner", "--file", output], { stdio: "inherit" });
console.log(`Backup written to ${output}`);
console.log("Optional next step: encrypt and upload this artifact to Google Drive from the workflow.");
