/* Flowstate batch audio compressor.
 * - Encodes lossless (wav/flac/aiff) -> MP3 V2 (~190kbps, high quality + small).
 * - Stream-copies already-lossy mp3 (no quality loss). m4a is re-encoded.
 * - Resumable: skips outputs that already exist, so it survives interruption.
 * - Emits public/tracks/catalog.json incrementally.
 * Run: node scripts/compress-audio.cjs   (from the flowstate dir)
 */
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("ffmpeg-static");

const ROOT = path.resolve(__dirname, "..");
const OUT_ROOT = path.join(ROOT, "public", "tracks");
const LOG = path.join(__dirname, "compress.log");
const CATALOG = path.join(OUT_ROOT, "catalog.json");

const SOURCES = [
  { dir: "F:/SYNTHWAVE CITY POP/WAV MASTERED CITY POP", category: "city-pop", genre: "City Pop" },
  { dir: "F:/Cyberpunk Synthwave JAZZ/WAV MASTERED JAZZ", category: "cyberpunk-jazz", genre: "Cyberpunk Jazz" },
  { dir: "F:/chill synthwave new/WAV", category: "chill-synthwave", genre: "Chill Synthwave" },
  { dir: "F:/lofi and jazz/jazz", category: "lofi-jazz", genre: "Lofi Jazz" },
  { dir: "F:/lofi and jazz/lofi", category: "lofi-chill", genre: "Lofi Chill" },
];

const LOSSLESS = new Set([".wav", ".flac", ".aiff", ".aif"]);
const LOSSY = new Set([".mp3", ".m4a"]);

const POOLS = {
  "city-pop": ["Midnight Drive", "Neon Avenue", "Harbor Lights", "After Hours", "Tokyo Rain", "Velvet Skyline", "Sunset Cassette", "City Lights", "Highway Mirage", "Moonlit Boulevard", "Crystal Nights", "Downtown Glow", "Coastline", "Telephone Line", "Pearl District", "Last Train Home"],
  "cyberpunk-jazz": ["Neon Noir", "Chrome Lounge", "Back Alley Sax", "Synthetic Soul", "Rainfall Protocol", "Midnight Circuit", "Electric Speakeasy", "Static Bloom", "Nightport", "Hologram Blues", "Cyber Cafe", "Smoke & Neon", "Datastream Jazz", "Velvet Android", "Downtown 2099", "Rust & Rain"],
  "chill-synthwave": ["Dreamwave", "Pastel Horizon", "Retro Sunset", "Soft Circuit", "Vapor Drift", "Cloud Arcade", "Slow Signal", "Aurora Drive", "Glass Skyline", "Neon Tide", "Drift Mode", "Afterglow"],
  "lofi-jazz": ["Velvet Hours", "Late Study", "Coffee & Rain", "Paper Moon", "Slow Pages", "Dusty Vinyl", "Quiet Corner", "Amber Afternoon", "Mellow Tape", "Soft Focus", "Rainy Desk", "Warm Static", "Night Owl", "Gentle Hours", "Bookshelf", "Lo Hours"],
  "lofi-chill": ["Focus Haze", "Still Mind", "Soft Rain Study", "Quiet Hours", "Deep Calm", "Lo Static", "Slow Breath", "Window Seat", "Paper & Tea", "Dim Lights", "Night Desk", "Drift Focus", "Hushed", "Tape Warmth", "Low Tide Mind", "Study Loop"],
};

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(LOG, line);
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "track";
}

function isGenericName(name) {
  return /^\d+$/.test(name) || /\(\d+\)\s*$/.test(name) || /^track[\s_-]*\d+$/i.test(name) ||
    /^(lofi\s*jazz|untitled|export|master|final|mixdown)/i.test(name);
}

function niceTitle(name) {
  return name.replace(/[_]+/g, " ").replace(/\s+/g, " ").trim();
}

function parseDuration(stderr) {
  const m = /Duration:\s*(\d+):(\d+):(\d+)\.(\d+)/.exec(stderr || "");
  if (!m) return 0;
  return Math.round(+m[1] * 3600 + +m[2] * 60 + +m[3] + +m[4] / 100);
}

function runFfmpeg(args) {
  try {
    execFileSync(ffmpeg, args, { stdio: ["ignore", "ignore", "pipe"] });
    return "";
  } catch (e) {
    // ffmpeg writes progress/info to stderr; non-zero exit on probe-only is expected.
    return (e.stderr && e.stderr.toString()) || "";
  }
}

function probeDuration(file) {
  return parseDuration(runFfmpeg(["-hide_banner", "-i", file]));
}

function main() {
  fs.mkdirSync(OUT_ROOT, { recursive: true });
  log("=== run start ===");

  const old = fs.existsSync(CATALOG) ? JSON.parse(fs.readFileSync(CATALOG, "utf8")) : [];
  const oldById = new Map(old.map((e) => [e.id, e]));
  const catalog = [];
  let done = 0, skipped = 0, failed = 0, total = 0;

  for (const src of SOURCES) {
    if (!fs.existsSync(src.dir)) { log(`MISS source ${src.dir}`); continue; }
    const outDir = path.join(OUT_ROOT, src.category);
    fs.mkdirSync(outDir, { recursive: true });

    const files = walk(src.dir)
      .filter((f) => LOSSLESS.has(path.extname(f).toLowerCase()) || LOSSY.has(path.extname(f).toLowerCase()))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    const usedSlugs = new Set();
    let seq = 0;
    for (const file of files) {
      total++;
      seq++;
      const ext = path.extname(file).toLowerCase();
      const base = path.basename(file, path.extname(file));

      // Title
      let title;
      if (isGenericName(base)) {
        const pool = POOLS[src.category];
        const cyc = Math.floor((seq - 1) / pool.length);
        title = pool[(seq - 1) % pool.length] + (cyc > 0 ? ` ${cyc + 1}` : "");
      } else {
        title = niceTitle(base);
      }

      // Output filename
      let slug = isGenericName(base)
        ? `${src.category}-${String(seq).padStart(3, "0")}`
        : slugify(base);
      while (usedSlugs.has(slug)) slug = `${slug}-${seq}`;
      usedSlugs.add(slug);

      const outPath = path.join(outDir, `${slug}.mp3`);
      const webPath = `/tracks/${src.category}/${slug}.mp3`;
      const id = `${src.category}/${slug}`;

      let durationS = 0;
      if (fs.existsSync(outPath) && fs.statSync(outPath).size > 0) {
        durationS = oldById.get(id)?.durationS || probeDuration(outPath);
        skipped++;
      } else {
        const tmp = outPath + ".tmp.mp3";
        let args;
        if (ext === ".mp3") {
          args = ["-y", "-hide_banner", "-i", file, "-vn", "-c:a", "copy", tmp];
        } else {
          args = ["-y", "-hide_banner", "-i", file, "-vn", "-codec:a", "libmp3lame", "-q:a", "2", "-ar", "44100", tmp];
        }
        const stderr = runFfmpeg(args);
        if (fs.existsSync(tmp) && fs.statSync(tmp).size > 0) {
          fs.renameSync(tmp, outPath);
          durationS = parseDuration(stderr) || probeDuration(outPath);
          done++;
          log(`OK ${webPath} (${durationS}s)`);
        } else {
          failed++;
          log(`FAIL ${file}`);
          try { if (fs.existsSync(tmp)) fs.unlinkSync(tmp); } catch {}
          continue;
        }
      }

      catalog.push({
        id,
        title,
        artist: "Virzy Guns",
        genre: src.genre,
        category: src.category,
        durationS,
        hlsUrl: webPath,
        isPremium: false,
        source: "original",
      });
      fs.writeFileSync(CATALOG, JSON.stringify(catalog, null, 2));
    }
  }

  log(`=== done: ${done} encoded/copied, ${skipped} skipped, ${failed} failed, ${total} total ===`);
  fs.writeFileSync(path.join(__dirname, "compress.DONE"), `done=${done} skipped=${skipped} failed=${failed} total=${total}\n`);
}

main();
