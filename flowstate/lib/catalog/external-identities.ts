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
 * This is deliberately a sidecar overlay. catalog.json remains the playback
 * source and its historical artist field is not rewritten. External URLs are
 * null until an exact owner-verified track identity is supplied.
 */
export function externalIdentityForTrack(track: {
  id: string;
  title: string;
  genre: string;
}): ExternalCatalogIdentity {
  const plannedTitle = NEW_RELEASE_TITLES[track.id];
  const eligible = CREATOR_GENRES.has(track.genre);
  return {
    flowTrackId: track.id,
    flowAliasTitle: track.title,
    displayCredit: "Virzy Guns Production",
    recordingArtist: eligible ? "Chill Music Division" : null,
    label: "Virzy Guns Production",
    dspTitle: plannedTitle ?? null,
    isrc: null,
    spotifyUrl: null,
    youtubeVideoId: null,
    matchMethod: plannedTitle ? "planned_new_release" : "manual_review",
    verificationStatus: plannedTitle ? "planned_release" : "manual_review",
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
