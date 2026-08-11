export type CatalogMatchMethod =
  | "sha256_exact"
  | "pcm_fingerprint_exact"
  | "normalized_title_and_duration"
  | "planned_new_release"
  | "manual_review";

export type ExternalCatalogIdentity = {
  flowTrackId: string;
  flowAliasTitle: string;
  displayCredit: "Virzy Guns Production";
  recordingArtist: "Chill Music Division" | null;
  label: "Virzy Guns Production";
  dspTitle: string | null;
  isrc: string | null;
  spotifyUrl: string | null;
  youtubeVideoId: string | null;
  matchMethod: CatalogMatchMethod;
  verificationStatus: "verified" | "candidate" | "planned_release" | "manual_review";
};

const NEW_RELEASE_TITLES: Record<string, string> = {
  "cyberpunk-jazz/cyberpunk-jazz-033": "Obsidian Mainframe",
  "cyberpunk-jazz/cyberpunk-jazz-034": "Neon Circuit Dreamwalk",
  "cyberpunk-jazz/cyberpunk-jazz-035": "Digital Serpent Protocol",
  "cyberpunk-jazz/cyberpunk-jazz-036": "Rogue Terminal After Dark",
  "cyberpunk-jazz/cyberpunk-jazz-037": "Voltage Requiem",
  "cyberpunk-jazz/cyberpunk-jazz-038": "Wired Skyline at 3AM",
};

const CREATOR_GENRES = new Set(["City Pop", "Cyberpunk Jazz", "Neo Synthwave"]);

/**
 * Public, exact external identities resolved from the DistroKid ISRC and a
 * canonical Spotify track URL. This is intentionally an allow-list: a fuzzy
 * title match, an artist URL, or a record with multiple ISRCs is not enough to
 * render a track-level CTA.
 */
const VERIFIED_SPOTIFY_BY_FLOW_ID: Record<string, { isrc: string; spotifyUrl: string }> = {
  "city-pop/city-pop-005": { isrc: "QZTAZ2597867", spotifyUrl: "https://open.spotify.com/track/1a5rqXg4QeAdG4OihRXXFp" },
  "city-pop/city-pop-006": { isrc: "QZTAZ2597868", spotifyUrl: "https://open.spotify.com/track/1QWc12cQwtwStijx3kgiIA" },
  "city-pop/city-pop-007": { isrc: "QZTAZ2597869", spotifyUrl: "https://open.spotify.com/track/1skCOC4FjbrBdrvMmF6TvL" },
  "city-pop/city-pop-008": { isrc: "QZTAZ2597870", spotifyUrl: "https://open.spotify.com/track/3RFdkBEhh8glg5vgZEjsRb" },
  "city-pop/city-pop-009": { isrc: "QZTAZ2597871", spotifyUrl: "https://open.spotify.com/track/24lBvHkDDl6HbVPcko6e4I" },
  "city-pop/city-pop-010": { isrc: "QZTAZ2597872", spotifyUrl: "https://open.spotify.com/track/5i7DOjDLGSgn7C4FXEgZsC" },
  "city-pop/city-pop-011": { isrc: "QZTB32553127", spotifyUrl: "https://open.spotify.com/track/3rQ8Tl7Fv0pu4qV30el2qF" },
  "city-pop/city-pop-012": { isrc: "QZTB32553128", spotifyUrl: "https://open.spotify.com/track/69BYlPEms6PkA4LQPJuGMM" },
  "city-pop/city-pop-013": { isrc: "QZTB32553129", spotifyUrl: "https://open.spotify.com/track/6cRzr3aW2FjngMdzQKnCHz" },
  "city-pop/city-pop-014": { isrc: "QZTB32553130", spotifyUrl: "https://open.spotify.com/track/5yAIVm2YQVMylRQAYoIiro" },
  "city-pop/city-pop-015": { isrc: "QZTB32553131", spotifyUrl: "https://open.spotify.com/track/4y8MbIs7KbpFqMEWgCvseo" },
  "city-pop/city-pop-016": { isrc: "QZTB32553132", spotifyUrl: "https://open.spotify.com/track/1YHSO5jLLHVZb5rfJuV4Zc" },
  "city-pop/city-pop-017": { isrc: "QZTB32553133", spotifyUrl: "https://open.spotify.com/track/1jABXWivlpkM4u9PxQoAc0" },
  "city-pop/city-pop-018": { isrc: "QZTB32553134", spotifyUrl: "https://open.spotify.com/track/6nGa9WRRPKqS6EksSaCuea" },
  "city-pop/city-pop-019": { isrc: "QZTB32553135", spotifyUrl: "https://open.spotify.com/track/7ewG1obg4sUfiCwTwaCzzy" },
  "city-pop/city-pop-020": { isrc: "QZTB32553136", spotifyUrl: "https://open.spotify.com/track/6inbT49bANLftH8P3WY1dW" },
  "city-pop/city-pop-021": { isrc: "QZWFQ2503871", spotifyUrl: "https://open.spotify.com/track/3jRhS1l6FSheXj3er8jnNS" },
  "city-pop/city-pop-023": { isrc: "QZWFQ2503872", spotifyUrl: "https://open.spotify.com/track/4EBkGF7vCGcjHm0wb2Uj9l" },
  "city-pop/city-pop-024": { isrc: "QZWFQ2503873", spotifyUrl: "https://open.spotify.com/track/2UtLdgceHtgb8Bi7HIayaY" },
  "city-pop/city-pop-025": { isrc: "QZWFQ2503874", spotifyUrl: "https://open.spotify.com/track/1pC3LWDmptBXmO4hVfjWCB" },
  "city-pop/city-pop-026": { isrc: "QZWFQ2503875", spotifyUrl: "https://open.spotify.com/track/28muj9u47TusWp6afu46mL" },
  "city-pop/city-pop-027": { isrc: "QZWFQ2503876", spotifyUrl: "https://open.spotify.com/track/3sB3iLeKzzuioU9Mx0hx9a" },
  "city-pop/city-pop-029": { isrc: "QZWFQ2503877", spotifyUrl: "https://open.spotify.com/track/0FhnOb5LchTx4MAPtTPGNI" },
  "city-pop/city-pop-031": { isrc: "QZWFQ2503878", spotifyUrl: "https://open.spotify.com/track/70Q6JhsAG8WUSYwlJxOyCU" },
  "city-pop/city-pop-032": { isrc: "QZWFQ2503879", spotifyUrl: "https://open.spotify.com/track/22crSxP5zyj2fnDj7IaFIt" },
  "city-pop/city-pop-033": { isrc: "QZWFQ2503880", spotifyUrl: "https://open.spotify.com/track/0Pu7BHtzTBHkMcg8GaPEAL" },
  "city-pop/city-pop-034": { isrc: "QT6EU2549801", spotifyUrl: "https://open.spotify.com/track/6tESgZULtkPzn8WLhfschv" },
  "city-pop/city-pop-035": { isrc: "QT6EU2549802", spotifyUrl: "https://open.spotify.com/track/4Wj2gm8wf0Tp1J4LX3Y0i5" },
  "city-pop/city-pop-036": { isrc: "QT6EU2549803", spotifyUrl: "https://open.spotify.com/track/3j2X8mhPlqJkAMSE9UFT5j" },
  "city-pop/city-pop-037": { isrc: "QT6EU2549804", spotifyUrl: "https://open.spotify.com/track/6ewXQAEEDv2AbKXSfIymdB" },
  "city-pop/city-pop-038": { isrc: "QT6EU2549805", spotifyUrl: "https://open.spotify.com/track/6HRnOYOqBTtf2Mi9aYvbsE" },
  "city-pop/city-pop-039": { isrc: "QT6EU2549806", spotifyUrl: "https://open.spotify.com/track/7MOmYvnicmBFJVHDPOKCPb" },
  "city-pop/city-pop-040": { isrc: "QT6EU2549807", spotifyUrl: "https://open.spotify.com/track/6L33rwIJyABhSQFbGUUKvB" },
  "city-pop/city-pop-041": { isrc: "QT6EU2549808", spotifyUrl: "https://open.spotify.com/track/1t4r0bFK15FBnWrc4G5Udo" },
  "city-pop/city-pop-042": { isrc: "QT6FK2536399", spotifyUrl: "https://open.spotify.com/track/500PVMpe31ownNY1NCcCYz" },
  "city-pop/city-pop-043": { isrc: "QT6FK2536400", spotifyUrl: "https://open.spotify.com/track/7iSCL3bvkEPEfn5PzDzhKD" },
  "city-pop/city-pop-044": { isrc: "QT6FK2536401", spotifyUrl: "https://open.spotify.com/track/5rwG74AOWQRFqmc50iZYiH" },
  "city-pop/city-pop-045": { isrc: "QT6FK2536402", spotifyUrl: "https://open.spotify.com/track/6PIRbnYrRlEiN3lfci5qYA" },
  "city-pop/city-pop-046": { isrc: "QT6FK2536403", spotifyUrl: "https://open.spotify.com/track/1qjKtRvuaibZQru1nGRn7z" },
  "city-pop/city-pop-047": { isrc: "QT6FK2536404", spotifyUrl: "https://open.spotify.com/track/27yBSHwPZhyGTHSTXsKK4H" },
  "city-pop/city-pop-048": { isrc: "QT6FK2536405", spotifyUrl: "https://open.spotify.com/track/3WjCQad4YfMAiIZhAY5mR8" },
  "cyberpunk-jazz/cyberpunk-jazz-001": { isrc: "QZZ7T2545938", spotifyUrl: "https://open.spotify.com/track/3N0IsBrNThxX1ORYmC22yk" },
  "cyberpunk-jazz/cyberpunk-jazz-002": { isrc: "QZZ7T2545939", spotifyUrl: "https://open.spotify.com/track/1pKUroUa3f8WE4B4ZwwXmF" },
  "cyberpunk-jazz/cyberpunk-jazz-003": { isrc: "QZZ7T2545940", spotifyUrl: "https://open.spotify.com/track/1zOw2IuWvAuckEmQ9wZ8im" },
  "cyberpunk-jazz/cyberpunk-jazz-004": { isrc: "QZZ7T2545941", spotifyUrl: "https://open.spotify.com/track/0RtuouWzOSZs5PI7YmUpah" },
  "cyberpunk-jazz/cyberpunk-jazz-005": { isrc: "QZZ7T2545942", spotifyUrl: "https://open.spotify.com/track/4KVSA1snTSK9rNSDhIzU8R" },
  "cyberpunk-jazz/cyberpunk-jazz-006": { isrc: "QZZ7T2545943", spotifyUrl: "https://open.spotify.com/track/096NAHZw6FpIs4ioozDctf" },
  "cyberpunk-jazz/cyberpunk-jazz-007": { isrc: "QZZ7T2545944", spotifyUrl: "https://open.spotify.com/track/6QbkVnVQLwW2Hv4D5J2mwX" },
  "cyberpunk-jazz/cyberpunk-jazz-009": { isrc: "QT3FD2517338", spotifyUrl: "https://open.spotify.com/track/0sg3F4m4UH7tFzQNMbVMph" },
  "cyberpunk-jazz/cyberpunk-jazz-010": { isrc: "QT3FD2517339", spotifyUrl: "https://open.spotify.com/track/5XI5iKEpmFTkIMQTmeMnbW" },
  "cyberpunk-jazz/cyberpunk-jazz-011": { isrc: "QT3FD2517340", spotifyUrl: "https://open.spotify.com/track/7obfiUWy2wiO7m5PeRMqZL" },
  "cyberpunk-jazz/cyberpunk-jazz-012": { isrc: "QT3FD2517341", spotifyUrl: "https://open.spotify.com/track/4Z1HacgTpuixIXubaQ9EmW" },
  "cyberpunk-jazz/cyberpunk-jazz-013": { isrc: "QT3FD2517342", spotifyUrl: "https://open.spotify.com/track/7C9lW21VEiTBg03pA1sjeu" },
  "cyberpunk-jazz/cyberpunk-jazz-014": { isrc: "QT3FD2517343", spotifyUrl: "https://open.spotify.com/track/5nikx7fIW2ZDkxdul4lYXt" },
  "cyberpunk-jazz/cyberpunk-jazz-015": { isrc: "QT3FD2517344", spotifyUrl: "https://open.spotify.com/track/45WpGpz34rWSSpeSaVCIYD" },
  "cyberpunk-jazz/cyberpunk-jazz-016": { isrc: "QT3FD2517345", spotifyUrl: "https://open.spotify.com/track/0CVZTY3OLCa5IT65Jx0VrE" },
  "cyberpunk-jazz/cyberpunk-jazz-017": { isrc: "QT3FG2591429", spotifyUrl: "https://open.spotify.com/track/0ub0dPbOp9SBJQrU4cvG5e" },
  "cyberpunk-jazz/cyberpunk-jazz-018": { isrc: "QT3FG2591430", spotifyUrl: "https://open.spotify.com/track/5SJdVG20QjWu9F5TGfqp4g" },
  "cyberpunk-jazz/cyberpunk-jazz-019": { isrc: "QT3FG2591431", spotifyUrl: "https://open.spotify.com/track/12GMFogI5slg0VMK8QqnAL" },
  "cyberpunk-jazz/cyberpunk-jazz-021": { isrc: "QT3FG2591433", spotifyUrl: "https://open.spotify.com/track/2zvB2jfNyvFFT2E49iDXUM" },
  "cyberpunk-jazz/cyberpunk-jazz-022": { isrc: "QT3FG2591434", spotifyUrl: "https://open.spotify.com/track/1KdR1z5vOJAdHpYYFmqC7Q" },
  "cyberpunk-jazz/cyberpunk-jazz-023": { isrc: "QT3FG2591435", spotifyUrl: "https://open.spotify.com/track/5xtBUpg4PRfGWzKBElOXBr" },
  "cyberpunk-jazz/cyberpunk-jazz-025": { isrc: "QT6FG2553717", spotifyUrl: "https://open.spotify.com/track/1dm4v42Tzp5tfHlR76cACH" },
  "cyberpunk-jazz/cyberpunk-jazz-026": { isrc: "QT6FG2553718", spotifyUrl: "https://open.spotify.com/track/74JBu9NSMsRgaSPqiKak0N" },
  "cyberpunk-jazz/cyberpunk-jazz-027": { isrc: "QT6FG2553719", spotifyUrl: "https://open.spotify.com/track/09AHZcfcFvkir7Px8DpgJb" },
  "cyberpunk-jazz/cyberpunk-jazz-028": { isrc: "QT6FG2553720", spotifyUrl: "https://open.spotify.com/track/5VKYJ8N5Tds387qVwofMDu" },
  "cyberpunk-jazz/cyberpunk-jazz-029": { isrc: "QT6FG2553721", spotifyUrl: "https://open.spotify.com/track/4Eq4sv6K02p0G2RDV1pEec" },
  "cyberpunk-jazz/cyberpunk-jazz-030": { isrc: "QT6FG2553722", spotifyUrl: "https://open.spotify.com/track/4VyXdG3JVLcDxXRQnK6Bgk" },
  "cyberpunk-jazz/cyberpunk-jazz-031": { isrc: "QT6FG2553723", spotifyUrl: "https://open.spotify.com/track/0IMTsFWhqonsByKu4D3H1p" },
  "cyberpunk-jazz/cyberpunk-jazz-039": { isrc: "QZHN62610282", spotifyUrl: "https://open.spotify.com/track/7ad3j4ogwDP8snL2W1kNy5" },
  "cyberpunk-jazz/cyberpunk-jazz-041": { isrc: "QZHN62610302", spotifyUrl: "https://open.spotify.com/track/3mF8FMCstycVkkz6QayPR9" },
  "cyberpunk-jazz/cyberpunk-jazz-042": { isrc: "QZHN62610315", spotifyUrl: "https://open.spotify.com/track/1BKUSc4OyLEE6kIKQE8iHg" },
  "cyberpunk-jazz/cyberpunk-jazz-043": { isrc: "QZHN62610319", spotifyUrl: "https://open.spotify.com/track/1yWx8q97cnZTpRkTXS2GsB" },
  "chill-synthwave/akihabara-dreamwave": { isrc: "QZNWU2586271", spotifyUrl: "https://open.spotify.com/track/6Qp2TiVvSK1HzgNDoFflDI" },
  "chill-synthwave/berlin-datastream-echoes": { isrc: "QZPLR2568350", spotifyUrl: "https://open.spotify.com/track/3GgAphwuthGhXoSFwf3P0w" },
  "chill-synthwave/brooklyn-exe": { isrc: "QZNWV2529796", spotifyUrl: "https://open.spotify.com/track/2OluoOIKkeDDSZdcawNVmb" },
  "chill-synthwave/chiba-district-memories": { isrc: "QZNWU2586273", spotifyUrl: "https://open.spotify.com/track/5tQMoh5ganxxDno7SCcCdk" },
  "chill-synthwave/chicago-driftline": { isrc: "QZNWV2529804", spotifyUrl: "https://open.spotify.com/track/4qmUBfSxicu5Nn9Z7DJpHW" },
  "chill-synthwave/downtown-detroit-dream": { isrc: "QZNWV2529797", spotifyUrl: "https://open.spotify.com/track/6uuKGDMTmU0IUgCjUbsVu4" },
  "chill-synthwave/future-love-in-tokyo": { isrc: "QZNWU2586277", spotifyUrl: "https://open.spotify.com/track/5e4crfxh5giM172CUsStWU" },
  "chill-synthwave/helsinki-aurora-upload": { isrc: "QZPLR2568357", spotifyUrl: "https://open.spotify.com/track/23aB7lafR7zERbrS1ZiXMT" },
  "chill-synthwave/kyoto-echo-terminal": { isrc: "QZNWU2586272", spotifyUrl: "https://open.spotify.com/track/4JwitceCn06HWa47ZoCrmy" },
  "chill-synthwave/l-a-night-sequence": { isrc: "QZNWV2529800", spotifyUrl: "https://open.spotify.com/track/19bsG2MyQZ6leTEMoRaeuf" },
  "chill-synthwave/london-offline-pulse": { isrc: "QZPLR2568353", spotifyUrl: "https://open.spotify.com/track/2VGGsUyAFgGDKvzTeelXSB" },
  "chill-synthwave/manhattan-neural-drift": { isrc: "QZPLR2568349", spotifyUrl: "https://open.spotify.com/track/0o06fjWEmuRC64dwo2dTxY" },
  "chill-synthwave/manhattan-pulsewave": { isrc: "QZNWV2529799", spotifyUrl: "https://open.spotify.com/track/7fRsoFcRWFe4vAKarogZky" },
  "chill-synthwave/miami-frequency": { isrc: "QZNWV2529803", spotifyUrl: "https://open.spotify.com/track/3F4bOwzUsirv515oTvgNZA" },
  "chill-synthwave/montreal-midnight-algorithm": { isrc: "QZPLR2568354", spotifyUrl: "https://open.spotify.com/track/0EGErfrg8V0LB66r3emFp5" },
  "chill-synthwave/neo-tokyo-ghost-protocol": { isrc: "QZPLR2568347", spotifyUrl: "https://open.spotify.com/track/73GayBvF3FhAD2vBsl6F3k" },
  "chill-synthwave/neon-rain-in-tokyo-3": { isrc: "QZNWU2586270", spotifyUrl: "https://open.spotify.com/track/72A6OYdWLwJ9xlYGrBXghH" },
  "chill-synthwave/osaka-drift-lounge": { isrc: "QZNWU2586275", spotifyUrl: "https://open.spotify.com/track/0t6ydyymPIZHPUlT5MZ4aN" },
  "chill-synthwave/paris-cybernetic-reverie": { isrc: "QZPLR2568355", spotifyUrl: "https://open.spotify.com/track/305tvg6njhZG2nBSjhnK4T" },
  "chill-synthwave/phoenix-override": { isrc: "QZNWV2529798", spotifyUrl: "https://open.spotify.com/track/1sHFeels6PJBOApApi07KL" },
  "chill-synthwave/san-francisco-glitch-sunset": { isrc: "QZPLR2568352", spotifyUrl: "https://open.spotify.com/track/0MCgA9sYl9Eumdj2O0W1uv" },
  "chill-synthwave/san-francisco-sleepmode": { isrc: "QZNWV2529805", spotifyUrl: "https://open.spotify.com/track/5oP5mvqzjRVDaHS8N0N623" },
  "chill-synthwave/sapporo-8am-skyline": { isrc: "QZNWU2586279", spotifyUrl: "https://open.spotify.com/track/2UuijVO1AgFeutuZyax9KZ" },
  "chill-synthwave/seattle-cloud-sync": { isrc: "QZNWV2529802", spotifyUrl: "https://open.spotify.com/track/4Nl4iWhL44sEXNwmGPBXCS" },
  "chill-synthwave/seoul-5g-dreamwalk": { isrc: "QZPLR2568351", spotifyUrl: "https://open.spotify.com/track/4qExZHp5pg2AZVaczMfcsx" },
  "chill-synthwave/shibuya-ghostline": { isrc: "QZNWU2586274", spotifyUrl: "https://open.spotify.com/track/47G0qvpUGBsy40Z5HDMpDK" },
  "chill-synthwave/shinagawa-transit-404": { isrc: "QZNWU2586276", spotifyUrl: "https://open.spotify.com/track/4Y1QqqskyCZLbGPXqIRoGt" },
  "chill-synthwave/soul-upload-austin-94": { isrc: "QZNWV2529801", spotifyUrl: "https://open.spotify.com/track/4Y4e23rnA7UQLmbGfQ51ye" },
  "chill-synthwave/sydney-sleep-mode-symphony": { isrc: "QZPLR2568356", spotifyUrl: "https://open.spotify.com/track/6sWg649d3daPeTOcI2uh8h" },
  "chill-synthwave/yokohama-slow-signal": { isrc: "QZNWU2586278", spotifyUrl: "https://open.spotify.com/track/4qUlLxKLodKHZNjG82hJrG" },
  "chill-synthwave/afterdust": { isrc: "QZTAT2541356", spotifyUrl: "https://open.spotify.com/track/0aeOOyJdPm2K9uFOixI5Nx" },
  "chill-synthwave/second-sun": { isrc: "QZTAT2541357", spotifyUrl: "https://open.spotify.com/track/2fskrPKmL8EpjusS555fLl" },
  "chill-synthwave/memory-bloom": { isrc: "QZTAT2541358", spotifyUrl: "https://open.spotify.com/track/3vv40Emu8A5Yzv4gVQvK3D" },
  "chill-synthwave/glass-river": { isrc: "QZTAT2541359", spotifyUrl: "https://open.spotify.com/track/4sfZn2rSbD7nkxhrIIjJ1c" },
  "chill-synthwave/new-horizon": { isrc: "QZTAT2541360", spotifyUrl: "https://open.spotify.com/track/48iUtS1zlYjBpSoKb7Wkbt" },
  "chill-synthwave/last-radio": { isrc: "QZTAT2541361", spotifyUrl: "https://open.spotify.com/track/02Ulr6qjvh2YXWY5PQQWsa" },
  "chill-synthwave/citylight-prayer": { isrc: "QZTAT2541362", spotifyUrl: "https://open.spotify.com/track/1nvZfY4yTtnP8PpFNiFCKR" },
  "chill-synthwave/nightflower": { isrc: "QZTAT2541363", spotifyUrl: "https://open.spotify.com/track/4Y9xESHiH8F1aucrTGxnHZ" },
  "chill-synthwave/echo-harbor": { isrc: "QZTAT2541364", spotifyUrl: "https://open.spotify.com/track/2vLPzqGVsEsLBc3qE2KDPl" },
  "chill-synthwave/still-breathing": { isrc: "QZTAT2541365", spotifyUrl: "https://open.spotify.com/track/6t0LGF4cnckFLbPEZnCom6" },
};

/**
 * This is deliberately a sidecar overlay. catalog.json remains the playback
 * source and its historical artist field is not rewritten. External URLs are
 * populated only for a unique exact ISRC + canonical Spotify match.
 */
export function externalIdentityForTrack(track: {
  id: string;
  title: string;
  genre: string;
}): ExternalCatalogIdentity {
  const plannedTitle = NEW_RELEASE_TITLES[track.id];
  const eligible = CREATOR_GENRES.has(track.genre);
  const verifiedSpotify = VERIFIED_SPOTIFY_BY_FLOW_ID[track.id];
  return {
    flowTrackId: track.id,
    flowAliasTitle: track.title,
    displayCredit: "Virzy Guns Production",
    recordingArtist: eligible ? "Chill Music Division" : null,
    label: "Virzy Guns Production",
    dspTitle: plannedTitle ?? null,
    isrc: verifiedSpotify?.isrc ?? null,
    spotifyUrl: verifiedSpotify?.spotifyUrl ?? null,
    youtubeVideoId: null,
    matchMethod: verifiedSpotify ? "sha256_exact" : plannedTitle ? "planned_new_release" : "manual_review",
    verificationStatus: verifiedSpotify ? "verified" : plannedTitle ? "planned_release" : "manual_review",
  };
}

export function isVerifiedSpotifyIdentity(
  identity: ExternalCatalogIdentity | null | undefined,
): identity is ExternalCatalogIdentity & { spotifyUrl: string; verificationStatus: "verified" } {
  return Boolean(
    identity &&
      identity.verificationStatus === "verified" &&
      typeof identity.spotifyUrl === "string" &&
      /^https:\/\/open\.spotify\.com\/track\/[A-Za-z0-9]+(?:\?.*)?$/.test(identity.spotifyUrl),
  );
}

export function isLofiTrack(track: { genre: string }): boolean {
  return track.genre === "Lofi Chill" || track.genre === "Lofi Jazz";
}
