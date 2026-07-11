/* Build Flowstate ambient sounds from the Cymatics "LIFE" pack.
 * Picks ONE best-matching recording per category, converts to a small looping MP3
 * in public/sounds/<slug>.mp3 (capped to 120s, 128k stereo). Resumable.
 * Run: node scripts/build-ambient.cjs
 */
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("ffmpeg-static");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "public", "sounds");
const LOG = path.join(__dirname, "ambient.log");
const CY = "F:/Local Disk/SAMPLE/Cymatics - Life - Ambient Recordings";

// slug, display name, icon (mixer ICON_MAP), source subfolder, filename match, premium
const CATEGORIES = [
  { slug: "rain", name: "Rain", icon: "cloud-rain", dir: "Rain", match: /rain/i, premium: false },
  { slug: "fire", name: "Fireplace", icon: "flame", dir: "Fire", match: /Fire \d/i, premium: false },
  { slug: "ocean", name: "Ocean", icon: "waves", dir: "Ocean", match: /Waves - Light/i, premium: false },
  { slug: "forest", name: "Forest", icon: "tree-pine", dir: "Nature Various", match: /Forest/i, premium: false },
  { slug: "birds", name: "Birds", icon: "bird", dir: "Nature Various", match: /Bird/i, premium: false },
  { slug: "cafe", name: "Cafe", icon: "coffee", dir: "City", match: /Cafeteria/i, premium: false },
  { slug: "wind", name: "Windchimes", icon: "wind", dir: "Farm", match: /Windchime/i, premium: false },
  { slug: "fire-rain", name: "Fire & Rain", icon: "flame", dir: "Fire", match: /Fire and Rain/i, premium: true },
  { slug: "river", name: "River", icon: "droplets", dir: "Rivers and Streams", match: /.*/, premium: true },
  { slug: "waterfall", name: "Waterfall", icon: "droplets", dir: "Waterfall", match: /.*/, premium: true },
  { slug: "city", name: "City", icon: "building", dir: "City", match: /Light Traffic/i, premium: true },
  { slug: "vinyl", name: "Vinyl", icon: "disc", dir: "Vinyl Crackles", match: /.*/, premium: true },
];

function log(m) { fs.appendFileSync(LOG, `[${new Date().toISOString()}] ${m}\n`); console.log(m); }

function firstMatch(dir, match) {
  const full = path.join(CY, dir);
  if (!fs.existsSync(full)) return null;
  const files = fs.readdirSync(full)
    .filter((f) => /\.wav$/i.test(f) && match.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  return files.length ? path.join(full, files[0]) : null;
}

function main() {
  fs.mkdirSync(OUT, { recursive: true });
  log("=== ambient build start ===");
  const manifest = [];
  let done = 0, skip = 0, fail = 0;

  for (const c of CATEGORIES) {
    const outPath = path.join(OUT, `${c.slug}.mp3`);
    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 0) {
      skip++;
      manifest.push({ id: c.slug, name: c.name, icon: c.icon, fileUrl: `/sounds/${c.slug}.mp3`, isPremium: c.premium });
      continue;
    }
    const src = firstMatch(c.dir, c.match);
    if (!src) { fail++; log(`NO SOURCE for ${c.slug} (${c.dir})`); continue; }
    try {
      execFileSync(ffmpeg, [
        "-y", "-hide_banner", "-t", "120", "-i", src,
        "-vn", "-codec:a", "libmp3lame", "-b:a", "128k", "-ar", "44100",
        "-af", "afade=t=in:st=0:d=2,afade=t=out:st=118:d=2",
        outPath,
      ], { stdio: ["ignore", "ignore", "ignore"] });
      done++;
      log(`OK ${c.slug} <- ${path.basename(src)}`);
      manifest.push({ id: c.slug, name: c.name, icon: c.icon, fileUrl: `/sounds/${c.slug}.mp3`, isPremium: c.premium });
    } catch (e) {
      fail++;
      log(`FAIL ${c.slug}: ${e.message}`);
    }
  }

  fs.writeFileSync(path.join(OUT, "sounds.json"), JSON.stringify(manifest, null, 2));
  log(`=== done: ${done} built, ${skip} skipped, ${fail} failed ===`);
  fs.writeFileSync(path.join(__dirname, "ambient.DONE"), `done=${done} skip=${skip} fail=${fail}\n`);
}
main();
