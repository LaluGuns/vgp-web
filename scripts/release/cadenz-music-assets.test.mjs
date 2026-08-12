import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const catalog = readFileSync(join(root, "lib/organic-discovery/cadenz.ts"), "utf8");
const hub = readFileSync(join(root, "app/cadenz/running-music/page.tsx"), "utf8");
const child = readFileSync(join(root, "app/cadenz/running-music/[bpm]/page.tsx"), "utf8");
const panel = readFileSync(join(root, "components/cadenz/CadenzListenPanel.tsx"), "utf8");
const cover = readFileSync(join(root, "public/images/cadenz-running-cadence-cover.jpg"));
const youtubeThumbnail = readFileSync(join(root, "public/images/cadenz-youtube-thumbnail-hd.webp"));

const youtubePlaylistUrl = "https://music.youtube.com/playlist?list=OLAK5uy_nraxYC4BXwCAGc9Q4uAKKoUE02oDqWagQ&si=hvP5RPQIcr4OJGf1";
const expected = {
  150: ["QZNWT2464387", "https://open.spotify.com/track/3pS5kAdxdMuDnR8rxSeHr7", youtubePlaylistUrl],
  160: ["QZNWT2464389", "https://open.spotify.com/track/1i68JJW6y8nI1HNyS5VssX", youtubePlaylistUrl],
  165: ["QZNWT2464390", "https://open.spotify.com/track/6fpXmZbWHYX8TqPYQXAK39", youtubePlaylistUrl],
  170: ["QZNWT2464391", "https://open.spotify.com/track/2xiBhyorRtN8w88f9XQddv", youtubePlaylistUrl],
  175: ["QZNWT2464392", "https://open.spotify.com/track/18rLXwSbAw3VnfTfnkgpEy", youtubePlaylistUrl],
  180: ["QZNWT2464393", "https://open.spotify.com/track/6rpDryjPJxPzL9qo65HrYm", youtubePlaylistUrl],
};

const spotifyUrls = [];
const isrcs = [];
const playlistUrls = [];
for (const [bpm, [isrc, spotifyUrl, playlistUrl]] of Object.entries(expected)) {
  const block = catalog.match(new RegExp(`  ${bpm}: \\{([\\s\\S]*?)(?=\\n  \\d{3}: \\{|\\n\\};)`));
  assert.ok(block, `missing ${bpm} BPM asset block`);
  assert.match(block[1], new RegExp(`isrc: "${isrc}"`));
  assert.ok(block[1].includes(`spotifyUrl: "${spotifyUrl}"`), `wrong Spotify URL for ${bpm}`);
  assert.ok(block[1].includes('playlistUrl: CADENZ_YOUTUBE_MUSIC_PLAYLIST_URL'), `wrong YouTube Music playlist for ${bpm}`);
  assert.equal(playlistUrl, youtubePlaylistUrl);
  spotifyUrls.push(spotifyUrl);
  isrcs.push(isrc);
  playlistUrls.push(playlistUrl);
}

assert.equal(new Set(spotifyUrls).size, 6, "Spotify URLs must be unique");
assert.equal(new Set(isrcs).size, 6, "ISRCs must be unique");
assert.equal(new Set(playlistUrls).size, 1, "All CADENZ assets must use one shared YouTube Music playlist");
assert.ok(catalog.includes("CADENZ_YOUTUBE_MUSIC_PLAYLIST_URL"));
assert.ok(catalog.includes(youtubePlaylistUrl));
assert.equal((catalog.match(/verificationStatus: "verified_exact_isrc"/g) ?? []).length, 7, "six assets plus the type must carry exact verification status");
assert.equal(createHash("sha256").update(cover).digest("hex").toUpperCase(), "F3EB89456E2D037F412EBAD8C7AA1FA567867CF1B99AE372B8CD1DF64054FBD0");
assert.equal(youtubeThumbnail.length, 107878, "HD YouTube thumbnail WebP size changed unexpectedly");
assert.equal(createHash("sha256").update(youtubeThumbnail).digest("hex").toUpperCase(), "C4AF6548A51A486E3AAD616472E4A0C790CD82148D66C0DFC71A16CB3BB375D5");

assert.ok(hub.includes("CadenzTempoOrbit"));
assert.ok(hub.includes("CadenzListenPanel"));
assert.ok(child.includes("MusicRecording"));
assert.ok(panel.includes("CADENZ_YOUTUBE_MUSIC_PLAYLIST_URL"));
assert.ok(panel.includes("CADENZ_YOUTUBE_THUMBNAIL"));
assert.ok(catalog.includes("CADENZ_YOUTUBE_THUMBNAIL"));
assert.ok(panel.includes("CADENZ_YOUTUBE_MUSIC_EMBED_URL"));
assert.ok(catalog.includes("youtube-nocookie.com/embed/videoseries?list="));
assert.ok(panel.includes("Full 11-BPM album playlist embedded"));
assert.ok(panel.includes("allowFullScreen"));
assert.ok(!panel.includes("videoId:"));
for (const text of [hub, child]) {
  assert.ok(!/Evidence tier|royalty evidence|search proxy|Catalog title evidence/i.test(text), "internal audit copy leaked into visitor UI");
}

console.log("CADENZ asset contract: 6 exact Spotify tracks, embedded 11-BPM YouTube Music album playlist, HD thumbnail and DistroKid cover hash PASS");
