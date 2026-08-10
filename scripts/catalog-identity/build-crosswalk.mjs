#!/usr/bin/env node

/**
 * Deterministic Flow <-> DistroKid identity pipeline.
 *
 * Private paths and fingerprints stay in the Google Drive run folder. A title
 * match alone is never promoted to a verified external identity.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DRIVE_PACK = process.env.CATALOG_DRIVE_PACK || "G:/My Drive/codex_traffic_pack";
const TRAFFIC_PACK = process.env.CATALOG_TRAFFIC_PACK || DRIVE_PACK;
const FLOW_CATALOG = path.join(ROOT, "flowstate/public/tracks/catalog.json");
const AUDIO_EXTENSIONS = new Set([".wav", ".mp3", ".flac", ".m4a", ".aiff", ".aif"]);
const CREATOR_GENRES = new Set(["City Pop", "Cyberpunk Jazz", "Neo Synthwave"]);
const SOURCE_GROUPS = [
  { category: "city-pop", genre: "City Pop", root: "F:/SYNTHWAVE CITY POP/WAV MASTERED CITY POP" },
  { category: "cyberpunk-jazz", genre: "Cyberpunk Jazz", root: "F:/Cyberpunk Synthwave JAZZ/WAV MASTERED JAZZ" },
  { category: "chill-synthwave", genre: "Neo Synthwave", root: "F:/chill synthwave new/WAV" },
];
const CMD_BACKUP_ROOT = process.env.CATALOG_EXTERNAL_ROOT ||
  "G:/My Drive/Distrokid Backup/GREEN/Chill Music Division";
const NEW_RELEASE_TITLES = {
  "cyberpunk-jazz-033": "Obsidian Mainframe",
  "cyberpunk-jazz-034": "Neon Circuit Dreamwalk",
  "cyberpunk-jazz-035": "Digital Serpent Protocol",
  "cyberpunk-jazz-036": "Rogue Terminal After Dark",
  "cyberpunk-jazz-037": "Voltage Requiem",
  "cyberpunk-jazz-038": "Wired Skyline at 3AM",
};

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const fullNegativeFingerprint = args.has("--full-negative-fingerprint");
const copyReleaseAssets = args.has("--copy-release-assets");
const skipHashes = args.has("--skip-hashes");
const catalogOnly = args.has("--catalog-only");
const requestedHashConcurrency = Number(process.env.CATALOG_HASH_CONCURRENCY || 4);
const hashConcurrency = Number.isFinite(requestedHashConcurrency)
  ? Math.max(1, Math.floor(requestedHashConcurrency))
  : 4;
const runStamp = process.env.CATALOG_RUN_STAMP ||
  new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
const runDir = path.join(DRIVE_PACK, "runs", runStamp);

function normalizeTitle(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\.(wav|mp3|flac|m4a|aiff?)$/i, "")
    .replace(/^\s*\d{1,3}\s*[-_.]\s*/, "")
    .replace(/\(.*?\)|\[.*?\]/g, " ")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function walkFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(absolute));
    else if (AUDIO_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) files.push(absolute);
  }
  return files.sort((a, b) => a.localeCompare(b, "en", { numeric: true, sensitivity: "base" }));
}

function walkExternalFiles(dir) {
  // Use the same Node-native walker as the official masters. The previous
  // PowerShell child-process fallback fails under the Codex sandbox with
  // spawnSync EPERM, even when the Drive-synced files are locally available.
  // walkFiles already filters supported audio extensions and sorts
  // deterministically, so matching semantics remain unchanged.
  try {
    return walkFiles(dir);
  } catch (error) {
    const reason = error?.message ?? String(error);
    throw new Error("blocked_external_data: " + dir + ": " + reason);
  }
}

function walkOutputFiles(dir, baseDir = dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkOutputFiles(absolute, baseDir));
    else files.push(path.relative(baseDir, absolute).replaceAll(path.sep, "/"));
  }
  return files.sort((a, b) => a.localeCompare(b, "en", { numeric: true, sensitivity: "base" }));
}
function csvEscape(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function writeCsv(filePath, rows) {
  const columns = rows.length ? [...new Set(rows.flatMap((row) => Object.keys(row)))] : [];
  const content = [
    columns.join(","),
    ...rows.map((row) => columns.map((key) => csvEscape(row[key])).join(",")),
  ].join("\n") + "\n";
  fs.writeFileSync(filePath, content, "utf8");
}

function sha256File(filePath) {
  const hash = crypto.createHash("sha256");
  const fd = fs.openSync(filePath, "r");
  const buffer = Buffer.allocUnsafe(8 * 1024 * 1024);
  try {
    let read = 0;
    do {
      read = fs.readSync(fd, buffer, 0, buffer.length, null);
      if (read) hash.update(buffer.subarray(0, read));
    } while (read);
  } finally {
    fs.closeSync(fd);
  }
  return hash.digest("hex");
}

function wavInfo(filePath) {
  const fd = fs.openSync(filePath, "r");
  try {
    const header = Buffer.alloc(12);
    if (fs.readSync(fd, header, 0, 12, 0) !== 12 ||
        header.toString("ascii", 0, 4) !== "RIFF" ||
        header.toString("ascii", 8, 12) !== "WAVE") return {};
    const stat = fs.statSync(filePath);
    let offset = 12;
    let sampleRate = null;
    let channels = null;
    let bits = null;
    let dataBytes = null;
    let dataOffset = null;
    while (offset + 8 <= stat.size) {
      const chunkHeader = Buffer.alloc(8);
      fs.readSync(fd, chunkHeader, 0, 8, offset);
      const chunk = chunkHeader.toString("ascii", 0, 4);
      const length = chunkHeader.readUInt32LE(4);
      offset += 8;
      if (chunk === "fmt " && length >= 16) {
        const fmt = Buffer.alloc(Math.min(length, 40));
        fs.readSync(fd, fmt, 0, fmt.length, offset);
        channels = fmt.readUInt16LE(2);
        sampleRate = fmt.readUInt32LE(4);
        bits = fmt.readUInt16LE(14);
      }
      if (chunk === "data") {
        dataBytes = length;
        dataOffset = offset;
        break;
      }
      offset += length + (length % 2);
    }
    const durationS = sampleRate && channels && bits && dataBytes
      ? dataBytes / (sampleRate * channels * (bits / 8))
      : null;
    return {
      sampleRate,
      channels,
      bits,
      dataBytes,
      dataOffset,
      durationS: durationS ? Number(durationS.toFixed(3)) : null,
    };
  } finally {
    fs.closeSync(fd);
  }
}

let hashedFileCount = 0;

async function fileHashesAsync(filePath, info = {}) {
  const fullHash = crypto.createHash("sha256");
  const pcmHash = info.dataOffset != null && info.dataBytes != null
    ? crypto.createHash("sha256")
    : null;
  const stream = fs.createReadStream(filePath, { highWaterMark: 8 * 1024 * 1024 });
  let position = 0;
  for await (const chunk of stream) {
    fullHash.update(chunk);
    if (pcmHash) {
      const dataStart = info.dataOffset;
      const dataEnd = dataStart + info.dataBytes;
      const overlapStart = Math.max(position, dataStart);
      const overlapEnd = Math.min(position + chunk.length, dataEnd);
      if (overlapEnd > overlapStart) {
        pcmHash.update(chunk.subarray(overlapStart - position, overlapEnd - position));
      }
    }
    position += chunk.length;
  }
  return {
    sha256: fullHash.digest("hex"),
    pcmSha256: pcmHash ? pcmHash.digest("hex") : null,
  };
}

async function fileIdentityAsync(filePath, includeHashes = true) {
  const stat = fs.statSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const info = ext === ".wav" ? wavInfo(filePath) : {};
  const hashes = includeHashes
    ? await fileHashesAsync(filePath, info)
    : { sha256: null, pcmSha256: null };
  if (includeHashes) {
    hashedFileCount += 1;
    if (hashedFileCount % 25 === 0) console.error(`catalog: hashed ${hashedFileCount} files`);
  }
  return {
    fileName: path.basename(filePath),
    absolutePath: filePath,
    bytes: stat.size,
    modifiedUtc: stat.mtime.toISOString(),
    durationS: info.durationS ?? null,
    sha256: hashes.sha256,
    pcmSha256: hashes.pcmSha256,
  };
}

async function mapWithConcurrency(items, limit, mapper) {
  const output = new Array(items.length);
  let nextIndex = 0;
  async function worker() {
    while (true) {
      const index = nextIndex++;
      if (index >= items.length) return;
      output[index] = await mapper(items[index], index);
    }
  }
  const workers = Math.min(Math.max(1, limit), items.length);
  await Promise.all(Array.from({ length: workers }, () => worker()));
  return output;
}

function parseFlowCatalog() {
  const raw = JSON.parse(fs.readFileSync(FLOW_CATALOG, "utf8"));
  return raw.map((entry) => ({ ...entry, normalizedTitle: normalizeTitle(entry.title) }));
}

async function sourceRecords() {
  const catalog = parseFlowCatalog();
  const records = [];
  for (const group of SOURCE_GROUPS) {
    console.error(`catalog: source group ${group.category} (${group.root})`);
    const files = walkFiles(group.root);
    const groupCatalog = catalog.filter((entry) => entry.category === group.category);
    const titleIndex = new Map(groupCatalog.map((entry) => [entry.normalizedTitle, entry]));
    let fallbackIndex = 0;
    const identities = await mapWithConcurrency(
      files,
      hashConcurrency,
      (file) => fileIdentityAsync(file, !skipHashes),
    );
    for (let fileIndex = 0; fileIndex < files.length; fileIndex += 1) {
      const file = files[fileIndex];
      const base = path.basename(file);
      const numbered = /^\s*(\d{1,3})\s*[-_.]?\s*(.*?)\.(?:wav|mp3|flac|m4a|aiff?)$/i.exec(base);
      let entry = titleIndex.get(normalizeTitle(base));
      if (!entry && numbered) {
        entry = groupCatalog.find((candidate) =>
          candidate.id.endsWith(`-${String(Number(numbered[1])).padStart(3, "0")}`));
      }
      if (!entry) entry = groupCatalog[fallbackIndex++] ?? null;
      records.push({
        category: group.category,
        genre: group.genre,
        flowTrackId: entry?.id ?? `${group.category}/unmapped-${String(records.length + 1).padStart(3, "0")}`,
        flowAliasTitle: entry?.title ?? path.basename(file, path.extname(file)),
        source: identities[fileIndex],
      });
    }
  }
  return records;
}

async function externalRecords() {
  console.error(`catalog: indexing backup ${CMD_BACKUP_ROOT}`);
  const files = walkExternalFiles(CMD_BACKUP_ROOT);
  const identities = await mapWithConcurrency(
    files,
    hashConcurrency,
    (file) => fileIdentityAsync(file, !skipHashes),
  );
  return files.map((file, index) => ({
    ...identities[index],
    normalizedTitle: normalizeTitle(path.basename(file, path.extname(file))),
    artist: "Chill Music Division",
  }));
}

function addIndex(map, key, value) {
  if (!key) return;
  map.set(key, [...(map.get(key) ?? []), value]);
}

function isPlannedTrack(flowTrackId) {
  const match = /cyberpunk-jazz-(\d+)$/.exec(flowTrackId);
  return Boolean(match && Number(match[1]) >= 33 && Number(match[1]) <= 38);
}

function matchRecords(sources, external, negativeScanComplete) {
  const bySha = new Map();
  const byPcm = new Map();
  const byTitleDuration = new Map();
  for (const item of external) {
    addIndex(bySha, item.sha256, item);
    addIndex(byPcm, item.pcmSha256, item);
    addIndex(byTitleDuration, `${item.normalizedTitle}|${item.durationS ?? ""}`, item);
  }

  const rows = [];
  for (const source of sources) {
    const planned = isPlannedTrack(source.flowTrackId);
    let candidates = source.source.sha256 ? bySha.get(source.source.sha256) ?? [] : [];
    let method = candidates.length === 1 ? "sha256_exact" : null;
    if (!method && source.source.pcmSha256) {
      candidates = byPcm.get(source.source.pcmSha256) ?? [];
      method = candidates.length === 1 ? "pcm_fingerprint_exact" : null;
    }
    if (!method) {
      const key = `${normalizeTitle(source.flowAliasTitle)}|${source.source.durationS ?? ""}`;
      candidates = byTitleDuration.get(key) ?? [];
      method = candidates.length === 1 ? "normalized_title_and_duration" : null;
    }
    const collision = candidates.length > 1;
    const external = candidates.length === 1 ? candidates[0] : null;
    const verified = external && (method === "sha256_exact" || method === "pcm_fingerprint_exact");
    const status = verified
      ? "verified"
      : external
        ? "candidate"
        : planned && negativeScanComplete
          ? "planned_release"
          : planned
            ? "candidate"
            : "manual_review";
    rows.push({
      flowTrackId: source.flowTrackId,
      flowAliasTitle: source.flowAliasTitle,
      displayCredit: "Virzy Guns Production",
      recordingArtist: "Chill Music Division",
      labelLicensor: "Virzy Guns Production",
      dspTitle: external
        ? external.fileName
          .replace(/^\s*\d{1,3}\s*[-_.]?\s*/, "")
          .replace(/\.[^.]+$/, "")
        : NEW_RELEASE_TITLES[source.flowTrackId.split("/").at(-1)] ?? null,
      isrc: null,
      spotifyUrl: null,
      youtubeVideoId: null,
      matchMethod: method ?? (planned ? "planned_new_release" : "manual_review"),
      verificationStatus: status,
      sourceSha256: source.source.sha256,
      sourcePcmSha256: source.source.pcmSha256,
      externalSha256: external?.sha256 ?? null,
      externalPcmSha256: external?.pcmSha256 ?? null,
      externalPath: external?.absolutePath ?? null,
      collision: collision ? "true" : "false",
      reviewReason: collision
        ? "multiple external files matched"
        : !external && !planned
          ? "no verified external identity"
          : !negativeScanComplete && planned
            ? "negative fingerprint scan not run"
            : null,
    });
  }
  return rows;
}

function validateTrafficPack() {
  const manifestPath = path.join(TRAFFIC_PACK, "SHA256SUMS.txt");
  if (!fs.existsSync(manifestPath)) throw new Error(`missing checksum manifest: ${manifestPath}`);
  const rows = [];
  for (const line of fs.readFileSync(manifestPath, "utf8").split(/\r?\n/).filter(Boolean)) {
    const match = /^(\S+)\s+[* ](.+)$/.exec(line.trim());
    if (!match) continue;
    const relative = match[2].replaceAll("/", path.sep);
    const filePath = path.join(TRAFFIC_PACK, relative);
    const exists = fs.existsSync(filePath);
    const actual = exists ? sha256File(filePath) : null;
    rows.push({ file: match[2], expected: match[1], actual, status: exists && actual === match[1] ? "ok" : "mismatch_or_missing" });
  }
  const failed = rows.filter((row) => row.status !== "ok");
  if (failed.length) throw new Error(`traffic pack checksum validation failed: ${failed.length}/${rows.length}`);
  return { files: rows.length, rows };
}

function writeCsvIfLive(fileName, rows) {
  if (!dryRun) writeCsv(path.join(runDir, fileName), rows);
}

function writeRun(source, external, rows, traffic) {
  if (!dryRun) fs.mkdirSync(runDir, { recursive: true });
  if (!dryRun) {
    fs.writeFileSync(path.join(runDir, "input_manifest.json"), JSON.stringify({
      generatedUtc: runStamp,
      runStamp,
      trafficFiles: traffic.files,
      trafficPack: TRAFFIC_PACK,
      sourceGroups: SOURCE_GROUPS,
      sourceCount: source.length,
      externalCount: external.length,
      fullNegativeFingerprint,
      catalogOnly,
      copyReleaseAssets,
    }, null, 2) + "\n", "utf8");
    fs.writeFileSync(path.join(runDir, "source_master_manifest.json"), JSON.stringify({
      generatedUtc: runStamp,
      groups: SOURCE_GROUPS,
      records: source,
    }, null, 2) + "\n", "utf8");
  }
  const sanitized = rows.map(({ sourceSha256, sourcePcmSha256, externalSha256, externalPcmSha256, externalPath, ...row }) => row);
  writeCsvIfLive("catalog_identity_crosswalk_v2.csv", sanitized);
  writeCsvIfLive("external_track_registry.csv", sanitized.filter((row) => row.verificationStatus === "verified"));
  writeCsvIfLive("catalog_match_evidence.csv", rows.map((row) => ({
    flowTrackId: row.flowTrackId,
    matchMethod: row.matchMethod,
    verificationStatus: row.verificationStatus,
    sourceSha256: row.sourceSha256,
    sourcePcmSha256: row.sourcePcmSha256,
    externalSha256: row.externalSha256,
    externalPcmSha256: row.externalPcmSha256,
    externalPath: row.externalPath,
  })));

  writeCsvIfLive("catalog_identity_conflicts.csv", rows
    .filter((row) => row.collision === "true" || row.reviewReason)
    .map((row) => ({
      flowTrackId: row.flowTrackId,
      flowAliasTitle: row.flowAliasTitle,
      collision: row.collision,
      reviewReason: row.reviewReason ?? "manual review",
    })));
  writeCsvIfLive("manual_review_required.csv", rows
    .filter((row) => row.verificationStatus === "manual_review" || row.collision === "true" || row.reviewReason)
    .map((row) => ({
      flowTrackId: row.flowTrackId,
      flowAliasTitle: row.flowAliasTitle,
      reviewReason: row.reviewReason ?? "manual review",
      matchMethod: row.matchMethod,
    })));
  writeCsvIfLive("creator_catalog_v2_preview.csv", rows.map((row) => ({
    flowTrackId: row.flowTrackId,
    flowAliasTitle: row.flowAliasTitle,
    recordingArtist: row.recordingArtist,
    displayCredit: row.displayCredit,
    labelLicensor: row.labelLicensor,
    dspTitle: row.dspTitle,
    isrc: row.isrc,
    spotifyUrl: row.spotifyUrl,
    creatorLicenseEligible: CREATOR_GENRES.has(
      row.flowTrackId.startsWith("city-pop") ? "City Pop" :
        row.flowTrackId.startsWith("cyberpunk-jazz") ? "Cyberpunk Jazz" :
          row.flowTrackId.startsWith("chill-synthwave") ? "Neo Synthwave" : "Lofi"
    ) ? "true" : "false",
  })));
  const creatorCatalog = parseFlowCatalog().filter((entry) => CREATOR_GENRES.has(entry.genre));
  writeCsvIfLive("creator_catalog_v2_manifest.csv", creatorCatalog.map((entry) => {
    const mp3Path = path.join(ROOT, "flowstate/public", entry.hlsUrl.replace(/^\//, "").replaceAll("/", path.sep));
    const mp3Exists = fs.existsSync(mp3Path);
    return {
      flowTrackId: entry.id,
      flowAliasTitle: entry.title,
      recordingArtist: "Chill Music Division",
      displayCredit: "Virzy Guns Production",
      labelLicensor: "Virzy Guns Production",
      externalTitle: NEW_RELEASE_TITLES[entry.id] ?? null,
      isrc: null,
      spotifyUrl: null,
      existingMp3Path: entry.hlsUrl,
      existingMp3Bytes: mp3Exists ? fs.statSync(mp3Path).size : null,
      existingMp3Sha256: mp3Exists && !skipHashes ? sha256File(mp3Path) : null,
      fingerprintStatus: mp3Exists && !skipHashes ? "hashed" : mp3Exists ? "not_hashed" : "missing",
    };
  }));
  writeCsvIfLive("spotify_track_verification_queue.csv", rows
    .filter((row) => row.verificationStatus !== "verified")
    .map((row) => ({
      flowTrackId: row.flowTrackId,
      flowAliasTitle: row.flowAliasTitle,
      expectedTitle: row.dspTitle,
      status: "manual_owner_verification",
    })));
  writeCsvIfLive("youtube_video_verification_queue.csv", rows.map((row) => ({
    flowTrackId: row.flowTrackId,
    flowAliasTitle: row.flowAliasTitle,
    youtubeVideoId: row.youtubeVideoId,
    status: "manual_owner_verification",
  })));

  const planned = rows.filter((row) => row.matchMethod === "planned_new_release");
  const releaseAssetById = new Map();
  if (!dryRun && copyReleaseAssets) {
    const assetDir = path.join(runDir, "dsp_release_assets");
    fs.mkdirSync(assetDir, { recursive: true });
    for (const row of rows.filter((item) => item.matchMethod === "planned_new_release")) {
      const sourceRow = source.find((item) => item.flowTrackId === row.flowTrackId);
      if (!sourceRow) continue;
      const safeTitle = String(row.dspTitle ?? row.flowAliasTitle).replace(/[<>:"/\\|?*]/g, "-");
      const destination = path.join(assetDir, `${row.flowTrackId.split("/").at(-1)} - ${safeTitle}.wav`);
      fs.copyFileSync(sourceRow.source.absolutePath, destination);
      releaseAssetById.set(row.flowTrackId, destination);
    }
  }

  writeCsvIfLive("dsp_release_package_manifest.csv", planned.map((row, index) => ({
    sequence: index + 1,
    flowTrackId: row.flowTrackId,
    exactMasterWavPath: releaseAssetById.get(row.flowTrackId) ?? null,
    flowAliasTitle: row.flowAliasTitle,
    dspTitle: row.dspTitle,
    primaryArtist: "Chill Music Division",
    label: "Virzy Guns Production",
    status: row.verificationStatus === "planned_release"
      ? "ready_for_owner_upload"
      : "blocked_until_negative_fingerprint",
    firstReleaseRule: "Friday >=21 days after Spotify Upcoming",
    cadence: "14 days",
    pitchRule: "one active pitch; submit >=7 days before release",
  })));
  if (!dryRun) {
    const report = [
      `# Catalog identity run ${runStamp}`,
      "",
      `- Source masters indexed: ${source.length}`,
      `- DistroKid backup audio indexed: ${external.length}`,
      `- Verified matches: ${rows.filter((row) => row.verificationStatus === "verified").length}`,
      `- Candidate/manual rows: ${rows.filter((row) => row.verificationStatus === "candidate" || row.verificationStatus === "manual_review").length}`,
      `- Planned new releases: ${planned.length}`,
      `- Full negative fingerprint: ${fullNegativeFingerprint ? "complete" : catalogOnly ? "not_run (catalog_only; planned releases remain blocked)" : "not_run (planned releases remain blocked)"}`,
      "",
      "No DistroKid, Spotify, YouTube, or Flow upload was performed by this script.",
      "",
    ].join("\n");
    fs.writeFileSync(path.join(runDir, "MASTER_EXECUTION_REPORT.md"), report, "utf8");
    fs.writeFileSync(path.join(runDir, "Where_I_disagreed_with_the_supplied_strategy.md"), [
      "# Where I disagreed with the supplied strategy",
      "",
      "- Public product credit, recording artist, label/licensor, and historical license identity remain separate fields.",
      "- YouTube-first is discovery only; native Flow audio remains the product player.",
      "- A click or embed load is not a stream or conversion.",
      "- Cyberpunk Jazz 033-038 remain blocked until a full negative fingerprint scan completes.",
      "- Lofi remains Flow-only and outside the 174-track creator-license catalog.",
      "",
    ].join("\n"), "utf8");
    const outputFiles = walkOutputFiles(runDir).filter((name) => name !== "OUTPUT_SHA256SUMS.txt");
    fs.writeFileSync(path.join(runDir, "OUTPUT_SHA256SUMS.txt"), outputFiles
      .map((name) => `${sha256File(path.join(runDir, name))}  ${name}`).join("\n") + "\n", "utf8");
  }
}

async function main() {
  const traffic = validateTrafficPack();
  console.error("catalog: validating traffic pack");
  const source = await sourceRecords();
  console.error("catalog: indexing official masters");
  const external = catalogOnly ? [] : await externalRecords();
  console.error("catalog: indexing CMD backup");
  const rows = matchRecords(source, external, fullNegativeFingerprint && !catalogOnly);
  console.error("catalog: matching");
  writeRun(source, external, rows, traffic);
  console.log(JSON.stringify({
    runStamp,
    runDir,
    dryRun,
    sourceMasters: source.length,
    externalAudio: external.length,
    verified: rows.filter((row) => row.verificationStatus === "verified").length,
    candidates: rows.filter((row) => row.verificationStatus === "candidate").length,
    planned: rows.filter((row) => row.matchMethod === "planned_new_release").length,
    blocked: rows.filter((row) => row.reviewReason).length,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
