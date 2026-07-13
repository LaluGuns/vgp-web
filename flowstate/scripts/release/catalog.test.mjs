import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const catalog = JSON.parse(fs.readFileSync(new URL("../../public/tracks/catalog.json", import.meta.url), "utf8"));

test("music catalog keeps a useful but bounded free tier", () => {
  const byGenre = new Map();
  for (const track of catalog) {
    const tracks = byGenre.get(track.genre) ?? [];
    tracks.push(track);
    byGenre.set(track.genre, tracks);
  }
  assert.equal(catalog.length, 295);
  assert.equal(byGenre.size, 5);

  for (const [genre, tracks] of byGenre) {
    assert.equal(tracks.filter((track) => !track.isPremium).length, 25, `${genre} free-track count`);
    assert.ok(tracks.some((track) => track.isPremium), `${genre} must contain Pro tracks`);
  }

  assert.equal(catalog.filter((track) => !track.isPremium).length, 125);
  assert.equal(catalog.filter((track) => track.isPremium).length, 170);
});
