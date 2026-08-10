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
  const track = catalog.find((item) => item.id === "city-pop/city-pop-001");
  assert.ok(track);
  const identity = externalIdentityForTrack(track);
  assert.equal(identity.displayCredit, "Virzy Guns Production");
  assert.equal(identity.recordingArtist, "Chill Music Division");
  assert.equal(identity.label, "Virzy Guns Production");
  assert.equal(identity.spotifyUrl, null);
  assert.notEqual(track.artist, identity.recordingArtist);
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
  const identity = externalIdentityForTrack(catalog[0]);
  assert.equal(isVerifiedSpotifyIdentity(identity), false);
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

