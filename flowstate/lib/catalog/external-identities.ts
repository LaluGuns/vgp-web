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
