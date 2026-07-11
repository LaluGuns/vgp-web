/**
 * Deletes QC-removed track objects from the R2 bucket.
 * Reads keys from scripts/r2-removed-objects.txt (written by the QC prune).
 *
 * USER-RUN (permanent remote delete):
 *   node scripts/cleanup-r2-removed.cjs          → dry run (lists what would be deleted)
 *   node scripts/cleanup-r2-removed.cjs --delete → actually delete
 *
 * Needs scripts/.r2.env with R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET.
 * Objects are regenerable from the masters via scripts/compress-audio.cjs + upload-to-r2.cjs.
 */
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, ".r2.env");
if (!fs.existsSync(envPath)) {
  console.error("scripts/.r2.env not found — recreate it with the R2 credentials first.");
  process.exit(1);
}
for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].trim();
}

const { S3Client, DeleteObjectsCommand } = require("@aws-sdk/client-s3");

const keys = fs
  .readFileSync(path.join(__dirname, "r2-removed-objects.txt"), "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter(Boolean);

const doDelete = process.argv.includes("--delete");
console.log(`${keys.length} objects in the removal manifest.`);

if (!doDelete) {
  console.log(keys.slice(0, 10).join("\n") + (keys.length > 10 ? `\n… +${keys.length - 10} more` : ""));
  console.log("\nDRY RUN — re-run with --delete to remove them from R2.");
  process.exit(0);
}

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

(async () => {
  for (let i = 0; i < keys.length; i += 1000) {
    const batch = keys.slice(i, i + 1000);
    const res = await s3.send(
      new DeleteObjectsCommand({
        Bucket: process.env.R2_BUCKET || "flowstate-audio",
        Delete: { Objects: batch.map((Key) => ({ Key })) },
      })
    );
    console.log(`deleted ${res.Deleted?.length ?? 0}/${batch.length} (errors: ${res.Errors?.length ?? 0})`);
  }
  console.log("done.");
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
