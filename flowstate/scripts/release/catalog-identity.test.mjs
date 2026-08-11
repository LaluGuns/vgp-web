import test from "node:test";
import assert from "node:assert/strict";
import catalog from "../../public/tracks/catalog.json" with { type: "json" };
import {
  externalIdentityForTrack,
  isLofiTrack,
  isVerifiedSpotifyIdentity,
} from "../../lib/catalog/external-identities.ts";

test("Flow catalog identity preserves 295 tracks and 174 eligible / 121 Lofi", () => {
  assert.equal(catalog.length, 295);
  const eligible = catalog.filter((track) =>
    ["City Pop", "Cyberpunk Jazz", "Neo Synthwave"].includes(track.genre)
  );
  assert.equal(eligible.length, 174);
  assert.equal(catalog.filter((track) => isLofiTrack(track)).length, 121);
});

test("CMD, VGP, and Virzy identity fields stay separate", () => {
  const track = catalog.find((item) => item.id === "city-pop/city-pop-005");
  assert.ok(track);
  const identity = externalIdentityForTrack(track);
  assert.equal(identity.displayCredit, "Virzy Guns Production");
  assert.equal(identity.recordingArtist, "Chill Music Division");
  assert.equal(identity.label, "Virzy Guns Production");
  assert.equal(identity.isrc, "QZTAZ2597867");
  assert.equal(identity.spotifyUrl, "https://open.spotify.com/track/1a5rqXg4QeAdG4OihRXXFp");
  assert.equal(identity.verificationStatus, "verified");
  assert.notEqual(track.artist, identity.recordingArtist);
});

test("only unique exact ISRC matches receive a Spotify track CTA", () => {
  const verified = catalog.filter((track) => externalIdentityForTrack(track).verificationStatus === "verified");
  assert.equal(verified.length, 113);
  assert.equal(new Set(verified.map((track) => externalIdentityForTrack(track).spotifyUrl)).size, verified.length);
  for (const track of verified) {
    assert.equal(isVerifiedSpotifyIdentity(externalIdentityForTrack(track)), true);
  }
  // Four Flow aliases have two distinct exact DSP releases and therefore stay
  // manual-review until the owner chooses the intended external recording.
  for (const id of [
    "city-pop/city-pop-001",
    "city-pop/city-pop-002",
    "city-pop/city-pop-003",
    "city-pop/city-pop-004",
  ]) {
    assert.equal(externalIdentityForTrack(catalog.find((item) => item.id === id)).spotifyUrl, null);
  }
});
test("NEON REBORN provides ten exact Neo Synthwave Spotify CTAs", () => {
  const expected = new Map([
    ["chill-synthwave/afterdust", ["QZTAT2541356", "https://open.spotify.com/track/0aeOOyJdPm2K9uFOixI5Nx"]],
    ["chill-synthwave/second-sun", ["QZTAT2541357", "https://open.spotify.com/track/2fskrPKmL8EpjusS555fLl"]],
    ["chill-synthwave/memory-bloom", ["QZTAT2541358", "https://open.spotify.com/track/3vv40Emu8A5Yzv4gVQvK3D"]],
    ["chill-synthwave/glass-river", ["QZTAT2541359", "https://open.spotify.com/track/4sfZn2rSbD7nkxhrIIjJ1c"]],
    ["chill-synthwave/new-horizon", ["QZTAT2541360", "https://open.spotify.com/track/48iUtS1zlYjBpSoKb7Wkbt"]],
    ["chill-synthwave/last-radio", ["QZTAT2541361", "https://open.spotify.com/track/02Ulr6qjvh2YXWY5PQQWsa"]],
    ["chill-synthwave/citylight-prayer", ["QZTAT2541362", "https://open.spotify.com/track/1nvZfY4yTtnP8PpFNiFCKR"]],
    ["chill-synthwave/nightflower", ["QZTAT2541363", "https://open.spotify.com/track/4Y9xESHiH8F1aucrTGxnHZ"]],
    ["chill-synthwave/echo-harbor", ["QZTAT2541364", "https://open.spotify.com/track/2vLPzqGVsEsLBc3qE2KDPl"]],
    ["chill-synthwave/still-breathing", ["QZTAT2541365", "https://open.spotify.com/track/6t0LGF4cnckFLbPEZnCom6"]],
  ]);
  const urls = new Set();
  for (const [id, [isrc, spotifyUrl]] of expected) {
    const track = catalog.find((item) => item.id === id);
    assert.ok(track, `missing ${id}`);
    const identity = externalIdentityForTrack(track);
    assert.equal(identity.isrc, isrc);
    assert.equal(identity.spotifyUrl, spotifyUrl);
    assert.equal(identity.verificationStatus, "verified");
    urls.add(spotifyUrl);
  }
  assert.equal(urls.size, expected.size);
});

test("Lofi stays Flow-only and has no external identity", () => {
  const track = catalog.find((item) => item.genre === "Lofi Chill");
  assert.ok(track);
  const identity = externalIdentityForTrack(track);
  assert.equal(isLofiTrack(track), true);
  assert.equal(identity.recordingArtist, null);
  assert.equal(identity.spotifyUrl, null);
  assert.equal(identity.dspTitle, null);
});

test("the six Cyberpunk Jazz records remain planned releases", () => {
  const expected = new Map([
    ["cyberpunk-jazz/cyberpunk-jazz-033", "Obsidian Mainframe"],
    ["cyberpunk-jazz/cyberpunk-jazz-034", "Neon Circuit Dreamwalk"],
    ["cyberpunk-jazz/cyberpunk-jazz-035", "Digital Serpent Protocol"],
    ["cyberpunk-jazz/cyberpunk-jazz-036", "Rogue Terminal After Dark"],
    ["cyberpunk-jazz/cyberpunk-jazz-037", "Voltage Requiem"],
    ["cyberpunk-jazz/cyberpunk-jazz-038", "Wired Skyline at 3AM"],
  ]);
  for (const [id, title] of expected) {
    const source = catalog.find((item) => item.id === id);
    assert.ok(source);
    const identity = externalIdentityForTrack(source);
    assert.equal(identity.dspTitle, title);
    assert.equal(identity.verificationStatus, "planned_release");
    assert.equal(identity.matchMethod, "planned_new_release");
  }
});

test("Spotify CTA guard accepts only exact verified track URLs", () => {
  const identity = externalIdentityForTrack(catalog.find((item) => item.id === "city-pop/city-pop-005"));
  assert.equal(isVerifiedSpotifyIdentity(identity), true);
  assert.equal(isVerifiedSpotifyIdentity({
    ...identity,
    verificationStatus: "verified",
    spotifyUrl: "https://open.spotify.com/track/abc123",
  }), true);
  assert.equal(isVerifiedSpotifyIdentity({
    ...identity,
    verificationStatus: "verified",
    spotifyUrl: "https://open.spotify.com/artist/21bxd77KSj9RR6vAqW5Hvy",
  }), false);
});

