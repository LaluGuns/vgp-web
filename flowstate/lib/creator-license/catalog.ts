import rawCatalog from "@/public/tracks/catalog.json";
import {
  CREATOR_RELEASE_LABEL,
  CREATOR_RIGHTS_VERSION,
  isCreatorGenre,
  safeCreatorDownloadFilename,
  type CreatorGenre,
} from "@/lib/creator-license/policy";

type RawCatalogEntry = {
  id: string;
  title: string;
  artist: string;
  genre: string;
  category: string;
  durationS: number;
  hlsUrl: string;
  isPremium: boolean;
  source: string;
};

export type CreatorTrack = RawCatalogEntry & {
  creatorLicenseEligible: true;
  creatorGenre: CreatorGenre;
  /** Populated only after the external rights audit is recorded. */
  rightsVerifiedAt: string | null;
  rightsVersion: string;
  spotifyUrl: string | null;
  releaseLabel: string;
  creatorDownloadAsset: string;
  creatorDownloadFilename: string;
};

/**
 * Runtime overlay keeps the generated playback catalog untouched. Eligibility
 * depends on the exact three creator genres, never on Free/Pro playback flags.
 */
export const CREATOR_TRACKS: CreatorTrack[] = (rawCatalog as RawCatalogEntry[])
  .filter((entry) => isCreatorGenre(entry.genre))
  .map((entry) => ({
    ...entry,
    creatorLicenseEligible: true,
    creatorGenre: entry.genre as CreatorGenre,
    rightsVerifiedAt: null,
    rightsVersion: CREATOR_RIGHTS_VERSION,
    spotifyUrl: null,
    releaseLabel: CREATOR_RELEASE_LABEL,
    creatorDownloadAsset: entry.hlsUrl,
    creatorDownloadFilename: safeCreatorDownloadFilename(entry.title, entry.id),
  }));

export const CREATOR_TRACK_BY_ID = new Map(
  CREATOR_TRACKS.map((track) => [track.id, track] as const)
);

export function creatorTracksByGenre(genre: CreatorGenre): CreatorTrack[] {
  return CREATOR_TRACKS.filter((track) => track.creatorGenre === genre);
}

