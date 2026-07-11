/* Flowstate -> Cloudflare R2 uploader (S3-compatible API).
 * Mirrors public/tracks + public/sounds into the bucket (keys keep the same paths,
 * e.g. tracks/city-pop/midnight-drive.mp3), so NEXT_PUBLIC_AUDIO_CDN_BASE_URL just works.
 *
 * Resumable: skips objects already present with matching size — safe to re-run / survives interruption.
 *
 * Set creds in your shell (NEVER commit these):
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET (default flowstate-audio)
 * Run:  node scripts/upload-to-r2.cjs
 */
const { S3Client, HeadObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");

// Load creds from gitignored scripts/.r2.env so secrets never live on the command line.
(() => {
  const envFile = path.join(__dirname, ".r2.env");
  if (!fs.existsSync(envFile)) return;
  for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
})();

const ACCOUNT = process.env.R2_ACCOUNT_ID;
const KEYID = process.env.R2_ACCESS_KEY_ID;
const SECRET = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET = process.env.R2_BUCKET || "flowstate-audio";
const CONCURRENCY = Number(process.env.R2_CONCURRENCY || 6);

if (!ACCOUNT || !KEYID || !SECRET) {
  console.error("Missing R2 creds. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY.");
  process.exit(1);
}

const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const SOURCES = ["tracks", "sounds"];
const LOG = path.join(__dirname, "upload-r2.log");

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: KEYID, secretAccessKey: SECRET },
});

const CT = {
  ".mp3": "audio/mpeg", ".wav": "audio/wav", ".m4a": "audio/mp4",
  ".json": "application/json", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg",
};

function log(m) { fs.appendFileSync(LOG, `[${new Date().toISOString()}] ${m}\n`); console.log(m); }
function walk(d) {
  const o = [];
  if (!fs.existsSync(d)) return o;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) o.push(...walk(f)); else o.push(f);
  }
  return o;
}

async function existsSameSize(key, size) {
  try {
    const h = await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return Number(h.ContentLength) === size;
  } catch { return false; }
}

async function uploadOne(file) {
  const key = path.relative(PUBLIC, file).split(path.sep).join("/");
  const size = fs.statSync(file).size;
  if (await existsSameSize(key, size)) return "skip";
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: fs.readFileSync(file),
    ContentType: CT[path.extname(file).toLowerCase()] || "application/octet-stream",
    CacheControl: "public, max-age=31536000, immutable",
  }));
  return "up";
}

async function main() {
  log(`=== upload start -> bucket ${BUCKET} ===`);
  let files = [];
  for (const s of SOURCES) files.push(...walk(path.join(PUBLIC, s)));
  files = files.filter((f) => !f.endsWith(".gitkeep"));
  log(`${files.length} files to process`);

  let up = 0, skip = 0, fail = 0, done = 0, i = 0;
  async function worker() {
    while (i < files.length) {
      const f = files[i++];
      try {
        const r = await uploadOne(f);
        if (r === "up") { up++; } else { skip++; }
      } catch (e) { fail++; log(`FAIL ${path.relative(PUBLIC, f)} ${e.message}`); }
      if (++done % 25 === 0) log(`progress ${done}/${files.length} (up=${up} skip=${skip} fail=${fail})`);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  log(`=== done: up=${up} skip=${skip} fail=${fail} total=${files.length} ===`);
  fs.writeFileSync(path.join(__dirname, "upload-r2.DONE"), `up=${up} skip=${skip} fail=${fail} total=${files.length}\n`);
}
main().catch((e) => { log("FATAL " + e.message); process.exit(1); });
