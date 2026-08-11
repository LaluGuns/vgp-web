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

const expected = {
  150: ["QZNWT2464387", "https://open.spotify.com/track/3pS5kAdxdMuDnR8rxSeHr7", "LajiPxpOYF4"],
  160: ["QZNWT2464389", "https://open.spotify.com/track/1i68JJW6y8nI1HNyS5VssX", "1X1qkeaPwx4"],
  165: ["QZNWT2464390", "https://open.spotify.com/track/6fpXmZbWHYX8TqPYQXAK39", "CCxy5QjHXuY"],
  170: ["QZNWT2464391", "https://open.spotify.com/track/2xiBhyorRtN8w88f9XQddv", "YZFNlCNp5OI"],
  175: ["QZNWT2464392", "https://open.spotify.com/track/18rLXwSbAw3VnfTfnkgpEy", "F9sRuwHMejs"],
  180: ["QZNWT2464393", "https://open.spotify.com/track/6rpDryjPJxPzL9qo65HrYm", null],
};

const spotifyUrls = [];
const isrcs = [];
for (const [bpm, [isrc, spotifyUrl, youtubeId]] of Object.entries(expected)) {
  const block = catalog.match(new RegExp(`  ${bpm}: \\{([\\s\\S]*?)(?=\\n  \\d{3}: \\{|\\n\\};)`));
  assert.ok(block, `missing ${bpm} BPM asset block`);
  assert.match(block[1], new RegExp(`isrc: "${isrc}"`));
  assert.ok(block[1].includes(`spotifyUrl: "${spotifyUrl}"`), `wrong Spotify URL for ${bpm}`);
  if (youtubeId) assert.ok(block[1].includes(`videoId: "${youtubeId}"`), `wrong YouTube ID for ${bpm}`);
  else assert.match(block[1], /youtube: null/);
  spotifyUrls.push(spotifyUrl);
  isrcs.push(isrc);
}

assert.equal(new Set(spotifyUrls).size, 6, "Spotify URLs must be unique");
assert.equal(new Set(isrcs).size, 6, "ISRCs must be unique");
assert.equal((catalog.match(/verificationStatus: "verified_exact_isrc"/g) ?? []).length, 7, "six assets plus the type must carry exact verification status");
assert.equal(createHash("sha256").update(cover).digest("hex").toUpperCase(), "F3EB89456E2D037F412EBAD8C7AA1FA567867CF1B99AE372B8CD1DF64054FBD0");

assert.ok(hub.includes("CadenzTempoOrbit"));
assert.ok(hub.includes("CadenzListenPanel"));
assert.ok(child.includes("MusicRecording"));
assert.ok(panel.includes("youtube-nocookie.com"));
assert.ok(panel.includes("The YouTube preview is a separate official Virzy Guns catalog upload"));
for (const text of [hub, child]) {
  assert.ok(!/Evidence tier|royalty evidence|search proxy|Catalog title evidence/i.test(text), "internal audit copy leaked into visitor UI");
}

console.log("CADENZ asset contract: 6 exact Spotify tracks, 5 verified YouTube videos, cover hash and visitor copy PASS");
