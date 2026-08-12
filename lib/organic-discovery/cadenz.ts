import type { EvidenceTier } from "./types";

export const CADENZ_BPM_COVERAGE = [130, 135, 140, 145, 150, 155, 160, 165, 170, 175, 180] as const;
export type CadenzBpm = (typeof CADENZ_BPM_COVERAGE)[number];

export const CADENZ_INDEXABLE_BPMS = [180, 170, 165, 175, 160, 150] as const satisfies readonly CadenzBpm[];

export const CADENZ_HUB_PATH = "/cadenz/running-music";
export const CADENZ_SPOTIFY_ARTIST_URL = "https://open.spotify.com/artist/13PhVfASmYQp8asSheyAxD";
export const CADENZ_YOUTUBE_MUSIC_PLAYLIST_URL = "https://music.youtube.com/playlist?list=OLAK5uy_nraxYC4BXwCAGc9Q4uAKKoUE02oDqWagQ&si=hvP5RPQIcr4OJGf1";
export const CADENZ_MUSIC_COVER = "/images/cadenz-running-cadence-cover.jpg";

type CadenzIndexableBpm = (typeof CADENZ_INDEXABLE_BPMS)[number];

export type CadenzMusicAsset = {
  bpm: CadenzIndexableBpm;
  title: string;
  artist: "Virzy Guns";
  isrc: string;
  upc: "198675394255";
  releaseTitle: "Cyberpunk Synthwave Beats That Will Improve Your Running Cadence (Cyberpunk Synthwave 1 Hour)";
  releaseDate: "2024-06-08";
  spotifyUrl: string;
  coverImage: typeof CADENZ_MUSIC_COVER;
  youtube: {
    playlistUrl: typeof CADENZ_YOUTUBE_MUSIC_PLAYLIST_URL;
    title: string;
  } | null;
  sessionLabel: string;
  sessionSummary: string;
  useTips: readonly [string, string, string];
  verificationStatus: "verified_exact_isrc";
};

/**
 * Public, publishable CADENZ music assets.
 *
 * Spotify URLs were accepted only when the DistroKid ISRC returned the same
 * ISRC and one canonical open.spotify.com/track URL. YouTube Music uses one
 * owner-supplied CADENZ playlist as a discovery destination; it is deliberately
 * an outbound playlist link rather than a guessed per-video embed.
 */
export const CADENZ_MUSIC_ASSETS: Record<CadenzIndexableBpm, CadenzMusicAsset> = {
  150: {
    bpm: 150,
    title: "150 SPM Running Cadence (Cyberpunk Synthwave 1 Hour)",
    artist: "Virzy Guns",
    isrc: "QZNWT2464387",
    upc: "198675394255",
    releaseTitle: "Cyberpunk Synthwave Beats That Will Improve Your Running Cadence (Cyberpunk Synthwave 1 Hour)",
    releaseDate: "2024-06-08",
    spotifyUrl: "https://open.spotify.com/track/3pS5kAdxdMuDnR8rxSeHr7",
    coverImage: CADENZ_MUSIC_COVER,
    youtube: { playlistUrl: CADENZ_YOUTUBE_MUSIC_PLAYLIST_URL, title: "CADENZ Running Cadence on YouTube Music" },
    sessionLabel: "Controlled rhythm",
    sessionSummary: "A measured tempo for runners who want a clear beat without jumping straight to the fastest end of the catalog.",
    useTips: ["Start at a comfortable effort.", "Use the beat as a cue, not a command.", "Adjust or stop if the rhythm feels unnatural."],
    verificationStatus: "verified_exact_isrc",
  },
  160: {
    bpm: 160,
    title: "160 SPM Running Cadence (Cyberpunk Synthwave 1 Hour)",
    artist: "Virzy Guns",
    isrc: "QZNWT2464389",
    upc: "198675394255",
    releaseTitle: "Cyberpunk Synthwave Beats That Will Improve Your Running Cadence (Cyberpunk Synthwave 1 Hour)",
    releaseDate: "2024-06-08",
    spotifyUrl: "https://open.spotify.com/track/1i68JJW6y8nI1HNyS5VssX",
    coverImage: CADENZ_MUSIC_COVER,
    youtube: { playlistUrl: CADENZ_YOUTUBE_MUSIC_PLAYLIST_URL, title: "CADENZ Running Cadence on YouTube Music" },
    sessionLabel: "Steady momentum",
    sessionSummary: "A mid-range cadence track with enough pulse to anchor a steady session while keeping the musical count easy to follow.",
    useTips: ["Settle into your natural stride first.", "Match one step per beat only if it feels comfortable.", "Use half-time counting when that feels more natural."],
    verificationStatus: "verified_exact_isrc",
  },
  165: {
    bpm: 165,
    title: "165 SPM Running Cadence (Cyberpunk Synthwave 1 Hour)",
    artist: "Virzy Guns",
    isrc: "QZNWT2464390",
    upc: "198675394255",
    releaseTitle: "Cyberpunk Synthwave Beats That Will Improve Your Running Cadence (Cyberpunk Synthwave 1 Hour)",
    releaseDate: "2024-06-08",
    spotifyUrl: "https://open.spotify.com/track/6fpXmZbWHYX8TqPYQXAK39",
    coverImage: CADENZ_MUSIC_COVER,
    youtube: { playlistUrl: CADENZ_YOUTUBE_MUSIC_PLAYLIST_URL, title: "CADENZ Running Cadence on YouTube Music" },
    sessionLabel: "Progressive tempo",
    sessionSummary: "A focused bridge between the steady and faster collections, built for listeners who prefer a slightly quicker rhythmic cue.",
    useTips: ["Warm up before changing cadence.", "Let posture and comfort lead the session.", "Move to an adjacent BPM when the cue feels forced."],
    verificationStatus: "verified_exact_isrc",
  },
  170: {
    bpm: 170,
    title: "170 SPM Running Cadence (Cyberpunk Synthwave 1 Hour)",
    artist: "Virzy Guns",
    isrc: "QZNWT2464391",
    upc: "198675394255",
    releaseTitle: "Cyberpunk Synthwave Beats That Will Improve Your Running Cadence (Cyberpunk Synthwave 1 Hour)",
    releaseDate: "2024-06-08",
    spotifyUrl: "https://open.spotify.com/track/2xiBhyorRtN8w88f9XQddv",
    coverImage: CADENZ_MUSIC_COVER,
    youtube: { playlistUrl: CADENZ_YOUTUBE_MUSIC_PLAYLIST_URL, title: "CADENZ Running Cadence on YouTube Music" },
    sessionLabel: "Brisk focus",
    sessionSummary: "A faster, highly legible pulse for runners deliberately exploring the upper-middle range of the CADENZ tempo map.",
    useTips: ["Choose this tempo intentionally.", "Keep the effort appropriate to your plan.", "Drop to 165 or 160 BPM whenever comfort changes."],
    verificationStatus: "verified_exact_isrc",
  },
  175: {
    bpm: 175,
    title: "175 SPM Running Cadence (Cyberpunk Synthwave 1 Hour)",
    artist: "Virzy Guns",
    isrc: "QZNWT2464392",
    upc: "198675394255",
    releaseTitle: "Cyberpunk Synthwave Beats That Will Improve Your Running Cadence (Cyberpunk Synthwave 1 Hour)",
    releaseDate: "2024-06-08",
    spotifyUrl: "https://open.spotify.com/track/18rLXwSbAw3VnfTfnkgpEy",
    coverImage: CADENZ_MUSIC_COVER,
    youtube: { playlistUrl: CADENZ_YOUTUBE_MUSIC_PLAYLIST_URL, title: "CADENZ Running Cadence on YouTube Music" },
    sessionLabel: "Fast turnover",
    sessionSummary: "A quick cadence cue for experienced runners who already know that this range suits their own movement and session plan.",
    useTips: ["Do not chase the number at the expense of form.", "Use shorter blocks if needed.", "Step down to an adjacent tempo without hesitation."],
    verificationStatus: "verified_exact_isrc",
  },
  180: {
    bpm: 180,
    title: "180 SPM Running Cadence (Cyberpunk Synthwave 1 Hour)",
    artist: "Virzy Guns",
    isrc: "QZNWT2464393",
    upc: "198675394255",
    releaseTitle: "Cyberpunk Synthwave Beats That Will Improve Your Running Cadence (Cyberpunk Synthwave 1 Hour)",
    releaseDate: "2024-06-08",
    spotifyUrl: "https://open.spotify.com/track/6rpDryjPJxPzL9qo65HrYm",
    coverImage: CADENZ_MUSIC_COVER,
    youtube: { playlistUrl: CADENZ_YOUTUBE_MUSIC_PLAYLIST_URL, title: "CADENZ Running Cadence on YouTube Music" },
    sessionLabel: "Peak tempo",
    sessionSummary: "The fastest verified destination in this collection, intended for runners who already use a high-turnover musical cue comfortably.",
    useTips: ["Treat 180 as an option, not a universal target.", "Prioritize comfort and control.", "Explore 175 or 170 BPM when a lower cue fits better."],
    verificationStatus: "verified_exact_isrc",
  },
};

export const CADENZ_BPM_TITLES: Record<CadenzBpm, readonly string[]> = {
  130: ["Launch Sequence (130 BPM)", "Horizon Line (130 BPM)", "Leg Flush 130 SPM Running Cadence Active Recovery"],
  135: ["Rusted Walk (135 SPM Running Cadence)", "Cosmic Cruise (135 SPM Running/Cycling Cadence) - Zone 2: Easy Run", "Shadow Kinetic (135 SPM Warm Up Jog)"],
  140: ["Asphalt Grid (140 SPM Running/Cycling Cadence) - Zone 2: Endurance Base", "Grid Navigation (140 SPM Running/Cycling Cadence) - Zone 2: Endurance", "Zone Two 140 SPM Running Cadence Easy Aerobic"],
  145: ["Digital Drift (145 SPM Running/Cycling Cadence) - Zone 2: Base Pace", "145 SPM Running Cadence: Zone 2 Warm-up", "Muscle Decay (145 SPM Running Cadence)"],
  150: ["150 SPM Running Cadence (Cyberpunk Synthwave 1 Hour)", "Neon Pulse (150 SPM Running/Cycling Cadence) - Zone 3: Tempo", "150 SPM Running Cadence"],
  155: ["Circuit Breaker (155 SPM Running/Cycling Cadence) - Zone 3: Steady State", "155 SPM Running Cadence (Cyberpunk Synthwave 1 Hour)", "155 SPM Running Cadence: Aerobic Base Builder"],
  160: ["160 SPM Running Cadence: Marathon Rhythm", "160 SPM Running Cadence (Cyberpunk Synthwave 1 Hour)", "160 SPM Running Cadence"],
  165: ["165 SPM Running Cadence (Cyberpunk Synthwave 1 Hour)", "165 SPM Running Cadence: Tempo Run Foundation", "165 SPM Running Cadence"],
  170: ["170 SPM Running Cadence (Cyberpunk Synthwave 1 Hour)", "170 SPM Running Cadence: Lactate Threshold Pacer", "170 SPM Running Cadence"],
  175: ["175 SPM Running Cadence (Cyberpunk Synthwave 1 Hour)", "175 SPM Running Cadence", "175 SPM Running Cadence: High-Performance Stride"],
  180: ["180 SPM Running Cadence (Cyberpunk Synthwave 1 Hour)", "Apex Break (180 BPM)", "180 SPM Running Cadence: Peak Efficiency (Golden Cadence)"],
};

export const CADENZ_BPM_EVIDENCE: Record<CadenzBpm, { tier: EvidenceTier; indexable: boolean; note: string }> = {
  130: { tier: "C", indexable: false, note: "Coverage retained in the hub; standalone demand and asset utility need more first-party evidence." },
  135: { tier: "C", indexable: false, note: "Coverage retained in the hub; standalone demand and asset utility need more first-party evidence." },
  140: { tier: "C", indexable: false, note: "Coverage retained in the hub; standalone demand and asset utility need more first-party evidence." },
  145: { tier: "C", indexable: false, note: "Coverage retained in the hub; standalone demand and asset utility need more first-party evidence." },
  150: { tier: "B", indexable: true, note: "Direct CADENZ fit with H1 royalty evidence and measurable running-music search proxy." },
  155: { tier: "C", indexable: false, note: "Coverage retained in the hub; standalone demand and asset utility need more first-party evidence." },
  160: { tier: "B", indexable: true, note: "Direct CADENZ fit with H1 royalty evidence and measurable running-music search proxy." },
  165: { tier: "B", indexable: true, note: "Direct CADENZ fit with strong H1 royalty evidence and owner-observed search signal pending GSC confirmation." },
  170: { tier: "B", indexable: true, note: "Direct CADENZ fit with strong H1 royalty evidence and measurable running-music search proxy." },
  175: { tier: "B", indexable: true, note: "Direct CADENZ fit with meaningful H1 royalty evidence despite sparse exact-query proxy data." },
  180: { tier: "B", indexable: true, note: "Direct CADENZ fit with the strongest supplied exact-query and royalty evidence." },
};

export function isCadenzBpm(value: number): value is CadenzBpm {
  return (CADENZ_BPM_COVERAGE as readonly number[]).includes(value);
}

export function isCadenzIndexableBpm(value: number): value is (typeof CADENZ_INDEXABLE_BPMS)[number] {
  return (CADENZ_INDEXABLE_BPMS as readonly number[]).includes(value);
}

export function cadenzBpmPath(bpm: CadenzBpm) {
  return `${CADENZ_HUB_PATH}/${bpm}-bpm`;
}
