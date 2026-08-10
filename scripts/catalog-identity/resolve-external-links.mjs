#!/usr/bin/env node

/**
 * Resolve verified DistroKid ISRCs to public Spotify track URLs.
 *
 * This is an evidence collector only. It never mutates Flow or promotes a
 * fuzzy title match. A row is accepted only when the returned service record
 * contains the exact same ISRC and a canonical Spotify track URL.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseCsv, renderCsv } from "../organic-discovery/generate-pack.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const INPUT = process.env.CATALOG_CROSSWALK ||
  "G:/My Drive/codex_traffic_pack/runs/20260810T120000Z/catalog_identity_crosswalk_v2.csv";
const OUTPUT = process.env.CATALOG_LINK_OUTPUT ||
  "G:/My Drive/codex_traffic_pack/runs/20260810T120000Z/external_links_resolution.csv";
const REGISTRY_OUTPUT = process.env.CATALOG_REGISTRY_OUTPUT ||
  "G:/My Drive/codex_traffic_pack/runs/20260810T120000Z/external_track_registry_songstats.csv";
const SIDECAR_OUTPUT = process.env.CATALOG_SIDECAR_OUTPUT ||
  "G:/My Drive/codex_traffic_pack/runs/20260810T120000Z/spotify_verified_sidecar.csv";
const CONFLICT_OUTPUT = process.env.CATALOG_CONFLICT_OUTPUT ||
  "G:/My Drive/codex_traffic_pack/runs/20260810T120000Z/catalog_identity_conflicts_songstats.csv";
const RESOLUTION_INPUT = process.env.CATALOG_RESOLUTION_INPUT || "";
const API_BASE = "https://data.songstats.com/api/v1/which_music/search";
const concurrency = Math.max(1, Math.min(8, Number(process.env.LINK_RESOLVE_CONCURRENCY || 4)));
const timeoutMs = Math.max(5000, Number(process.env.LINK_RESOLVE_TIMEOUT_MS || 45000));
const retries = Math.max(0, Math.min(4, Number(process.env.LINK_RESOLVE_RETRIES || 2)));

function cleanIsrc(row) {
  if (row.isrc) return row.isrc.trim().toUpperCase();
  const match = String(row.dspTitle || "").match(/\[([A-Z0-9]{12})\]\s*$/i);
  return match ? match[1].toUpperCase() : "";
}

function canonicalSpotifyUrl(value) {
  const match = String(value || "").match(/^https:\/\/open\.spotify\.com\/track\/([A-Za-z0-9]+)(?:\?.*)?$/);
  return match ? `https://open.spotify.com/track/${match[1]}` : null;
}

async function fetchJson(url) {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        headers: { accept: "application/json", "user-agent": "VGP-catalog-identity/1.0" },
        signal: controller.signal,
      });
      const text = await response.text();
      let payload = null;
      try { payload = text ? JSON.parse(text) : null; } catch { /* handled as HTTP error */ }
      if (response.ok) return { status: response.status, payload };
      if (response.status !== 429 && response.status < 500) {
        return { status: response.status, payload };
      }
      if (attempt < retries) await new Promise((resolve) => setTimeout(resolve, 600 * (attempt + 1)));
    } catch (error) {
      if (attempt === retries) return { status: 0, payload: null, error: error?.message || String(error) };
      await new Promise((resolve) => setTimeout(resolve, 600 * (attempt + 1)));
    } finally {
      clearTimeout(timer);
    }
  }
  return { status: 0, payload: null, error: "unreachable" };
}

function matchCandidates(payload, isrc) {
  const rows = Array.isArray(payload?.results) ? payload.results : [];
  return rows
    .filter((item) => String(item?.primaryIsrc || "").toUpperCase() === isrc)
    .flatMap((item) => {
      const isrcRows = Array.isArray(item?.isrcs) ? item.isrcs : [];
      const exactIsrc = isrcRows.find((candidate) => String(candidate?.code || "").toUpperCase() === isrc);
      const spotify = Array.isArray(item?.links)
        ? item.links.find((link) => String(link?.sourceId || "").toLowerCase() === "spotify")
        : null;
      const spotifyUrl = canonicalSpotifyUrl(spotify?.url);
      if (!exactIsrc || !spotifyUrl) return [];
      return [{
        spotifyUrl,
        title: item.title || "",
        artistName: item.artistName || "",
        releaseDate: item.releaseDate || "",
        imageUrl: item.imageUrl || "",
        previewUrl: item.previewUrl || "",
        sourceIds: Array.isArray(exactIsrc.sourceIds) ? exactIsrc.sourceIds : [],
        sourceCount: Number.isFinite(exactIsrc.sourceCount) ? exactIsrc.sourceCount : "",
        isrc,
        songstatsTrackId: item.songstatsTrackId || "",
      }];
    });
}

async function resolve(row) {
  const isrc = cleanIsrc(row);
  const base = {
    flowTrackId: row.flowTrackId || "",
    flowAliasTitle: row.flowAliasTitle || "",
    dspTitle: row.dspTitle || "",
    isrc,
    spotifyUrl: "",
    status: "not_found",
    source: "songstats_which_music_isrc",
    returnedTitle: "",
    returnedArtists: "",
    returnedIsrc: "",
    durationMs: "",
    reccoId: "",
    sourceIds: "",
    sourceCount: "",
    releaseDate: "",
    imageUrl: "",
    previewUrl: "",
    songstatsTrackId: "",
    httpStatus: "",
    reason: "",
  };
  if (!isrc) return { ...base, status: "manual_review", reason: "missing_isrc" };
  const url = `${API_BASE}?q=${encodeURIComponent(isrc)}&tool=whichisrc`;
  const response = await fetchJson(url);
  base.httpStatus = response.status || "";
  if (!response.payload) return { ...base, status: "blocked_external_data", reason: response.error || "empty_api_response" };
  const candidates = matchCandidates(response.payload, isrc);
  if (candidates.length === 1) {
    const match = candidates[0];
    return {
      ...base,
      spotifyUrl: match.spotifyUrl,
      status: "verified_exact_isrc",
      returnedTitle: match.title,
      returnedArtists: match.artistName,
      returnedIsrc: match.isrc,
      sourceIds: match.sourceIds.join(" | "),
      sourceCount: match.sourceCount,
      releaseDate: match.releaseDate,
      imageUrl: match.imageUrl,
      previewUrl: match.previewUrl,
      songstatsTrackId: match.songstatsTrackId,
      reason: "exact_isrc_and_canonical_spotify_url",
    };
  }
  if (candidates.length > 1) {
    return { ...base, status: "manual_review", reason: `multiple_exact_isrc_candidates:${candidates.length}` };
  }
  return { ...base, reason: "isrc_lookup_returned_no_exact_spotify_link" };
}

async function mapConcurrent(rows, limit) {
  const out = new Array(rows.length);
  let next = 0;
  async function worker() {
    while (true) {
      const index = next++;
      if (index >= rows.length) return;
      out[index] = await resolve(rows[index]);
      if ((index + 1) % 10 === 0) console.error(`external-links: resolved ${index + 1}/${rows.length}`);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, rows.length) }, () => worker()));
  return out;
}

const rows = parseCsv(fs.readFileSync(INPUT, "utf8"));
const candidates = rows
  .map((row) => ({ ...row, isrc: cleanIsrc(row) }))
  .filter((row) => row.isrc && row.verificationStatus === "verified");
const outputRows = RESOLUTION_INPUT
  ? parseCsv(fs.readFileSync(RESOLUTION_INPUT, "utf8"))
  : await mapConcurrent(candidates, concurrency);
const columns = [
  "flowTrackId", "flowAliasTitle", "dspTitle", "isrc", "spotifyUrl", "status", "source",
  "returnedTitle", "returnedArtists", "returnedIsrc", "durationMs", "reccoId", "sourceIds", "sourceCount",
  "releaseDate", "imageUrl", "previewUrl", "songstatsTrackId", "httpStatus", "reason",
];
fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, renderCsv(outputRows, columns), "utf8");

// A Flow alias may have more than one exact DSP release (the current pack has
// four such collisions). Keep those rows in the registry for auditability but
// do not publish either external identity until the owner chooses one.
const byFlowId = new Map();
for (const row of outputRows) {
  const bucket = byFlowId.get(row.flowTrackId) || [];
  bucket.push(row);
  byFlowId.set(row.flowTrackId, bucket);
}
const resolvedByFlowId = new Map();
const conflicts = [];
for (const [flowTrackId, bucket] of byFlowId) {
  const exact = bucket.filter((row) => row.status === "verified_exact_isrc");
  const distinct = new Map(exact.map((row) => [`${row.isrc}|${row.spotifyUrl}`, row]));
  if (distinct.size === 1) resolvedByFlowId.set(flowTrackId, exact[0]);
  if (distinct.size > 1) {
    conflicts.push({
      flowTrackId,
      flowAliasTitle: bucket[0].flowAliasTitle,
      collision: "true",
      reviewReason: "multiple_exact_external_releases_for_flow_alias",
      externalCandidates: [...distinct.values()].map((row) => `${row.isrc}|${row.spotifyUrl}`).join(" ; "),
    });
  }
}

const registryColumns = [
  "flowTrackId", "flowAliasTitle", "displayCredit", "recordingArtist", "labelLicensor", "dspTitle",
  "isrc", "spotifyUrl", "youtubeVideoId", "matchMethod", "verificationStatus", "collision", "reviewReason",
  "externalLinkStatus", "externalLinkSource", "externalLinkReason",
];
const registryRows = rows.map((row) => {
  const match = resolvedByFlowId.get(row.flowTrackId);
  const collision = conflicts.some((item) => item.flowTrackId === row.flowTrackId);
  return {
    flowTrackId: row.flowTrackId || "",
    flowAliasTitle: row.flowAliasTitle || "",
    displayCredit: row.displayCredit || "Virzy Guns Production",
    recordingArtist: row.recordingArtist || "Chill Music Division",
    labelLicensor: row.labelLicensor || "Virzy Guns Production",
    dspTitle: row.dspTitle || "",
    isrc: collision ? "" : match?.isrc || "",
    spotifyUrl: collision ? "" : match?.spotifyUrl || "",
    youtubeVideoId: row.youtubeVideoId || "",
    matchMethod: row.matchMethod || "manual_review",
    verificationStatus: row.verificationStatus || "manual_review",
    collision: collision ? "true" : row.collision || "false",
    reviewReason: collision ? "multiple_exact_external_releases_for_flow_alias" : row.reviewReason || "",
    externalLinkStatus: collision ? "manual_review" : match ? "verified_exact_isrc" : "blocked_external_data",
    externalLinkSource: match?.source || "songstats_which_music_isrc",
    externalLinkReason: collision ? "owner_must_select_exact_external_release" : match?.reason || "songstats_rate_limit_or_unavailable",
  };
});
fs.mkdirSync(path.dirname(REGISTRY_OUTPUT), { recursive: true });
fs.writeFileSync(REGISTRY_OUTPUT, renderCsv(registryRows, registryColumns), "utf8");
fs.writeFileSync(SIDECAR_OUTPUT, renderCsv([...resolvedByFlowId.values()].map((row) => ({
  flowTrackId: row.flowTrackId,
  flowAliasTitle: row.flowAliasTitle,
  isrc: row.isrc,
  spotifyUrl: row.spotifyUrl,
  verificationStatus: "verified",
  matchMethod: "sha256_exact",
  source: row.source,
  reason: row.reason,
})), ["flowTrackId", "flowAliasTitle", "isrc", "spotifyUrl", "verificationStatus", "matchMethod", "source", "reason"]), "utf8");
fs.writeFileSync(CONFLICT_OUTPUT, renderCsv(conflicts, ["flowTrackId", "flowAliasTitle", "collision", "reviewReason", "externalCandidates"]), "utf8");
const counts = Object.fromEntries([...new Set(outputRows.map((row) => row.status))].sort().map((status) => [status, outputRows.filter((row) => row.status === status).length]));
console.log(JSON.stringify({ input: INPUT, output: OUTPUT, registry: REGISTRY_OUTPUT, sidecar: SIDECAR_OUTPUT, conflictOutput: CONFLICT_OUTPUT, rows: outputRows.length, uniqueExactFlowIds: resolvedByFlowId.size, conflictCount: conflicts.length, counts }, null, 2));
