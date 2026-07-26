import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const inventoryPath = path.join(root, 'data', 'beatstars-inventory-verified.json');
const outputPath = path.join(root, 'data', 'beatstars-track-metadata.json');
const filterOutputPath = path.join(root, 'data', 'beatstars-filter-index.json');
const endpoint = 'https://core.prod.beatstars.net/graphql?op=getNewTrackV3';
const expectedUsername = 'virzyguns';

const query = `
  query getNewTrackV3($id: String!) {
    track(id: $id) {
      profile { username }
      bundle {
        stream { duration }
        hls { duration }
      }
      metadata {
        bpm
        genres { value }
        tags
        keyNote { value }
      }
      activities { play purchase like }
    }
  }
`;

const inventory = JSON.parse(await fs.readFile(inventoryPath, 'utf8'));
const tracks = inventory.filter((item) => item.verificationStatus === 'verified' && item.beatstarsTrackId);

async function fetchTrack(item) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      operationName: 'getNewTrackV3',
      variables: { id: `TK${item.beatstarsTrackId}` },
      query,
    }),
  });

  if (!response.ok) throw new Error(`${item.beatstarsTrackId}: HTTP ${response.status}`);

  const payload = await response.json();
  const track = payload?.data?.track;
  if (!track || track.profile?.username?.toLowerCase() !== expectedUsername) {
    throw new Error(`${item.beatstarsTrackId}: owner validation failed`);
  }

  return {
    trackId: item.beatstarsTrackId,
    title: item.exactWidgetPreviewTitle || item.exactListTitle,
    bpm: track.metadata?.bpm || null,
    key: track.metadata?.keyNote?.value || null,
    duration: track.bundle?.hls?.duration || track.bundle?.stream?.duration || null,
    genres: track.metadata?.genres?.flatMap((genre) => genre.value ? [genre.value] : []) || [],
    tags: track.metadata?.tags || [],
    plays: track.activities?.play ?? null,
    purchases: track.activities?.purchase ?? null,
    likes: track.activities?.like ?? null,
  };
}

const results = [];
const failures = [];
let cursor = 0;
const concurrency = 8;

async function worker() {
  while (cursor < tracks.length) {
    const item = tracks[cursor++];
    try {
      results.push(await fetchTrack(item));
    } catch (error) {
      failures.push({
        trackId: item.beatstarsTrackId,
        title: item.exactWidgetPreviewTitle || item.exactListTitle,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));
results.sort((a, b) => Number(b.trackId) - Number(a.trackId));

await fs.writeFile(outputPath, `${JSON.stringify({
  extractedAt: new Date().toISOString(),
  owner: expectedUsername,
  source: endpoint,
  verifiedTrackCount: tracks.length,
  successCount: results.length,
  failureCount: failures.length,
  tracks: results,
  failures,
}, null, 2)}\n`, 'utf8');

await fs.writeFile(filterOutputPath, `${JSON.stringify(Object.fromEntries(results.map((track) => [
  track.trackId,
  {
    bpm: track.bpm,
    key: track.key,
    duration: track.duration,
    genres: track.genres,
    tags: track.tags,
  },
])), null, 2)}\n`, 'utf8');

console.log(`Wrote ${results.length}/${tracks.length} tracks to ${outputPath}`);
console.log(`Wrote catalog filter index to ${filterOutputPath}`);
if (failures.length) {
  console.log(`Failures: ${failures.length}`);
  process.exitCode = 1;
}
