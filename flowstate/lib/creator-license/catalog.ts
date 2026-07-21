import rawCatalog from "@/public/tracks/catalog.json";
import {
  CREATOR_RELEASE_LABEL,
  CREATOR_RIGHTS_VERSION,
  isCreatorGenre,
  safeCreatorDownloadFilename,
  type CreatorGenre,
} from "@/lib/creator-license/policy";
import { CREATOR_RIGHTS_VERIFIED_AT } from "@/lib/creator-license/contract-v1";

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
  /** Date of the signed rights-owner attestation for this catalog snapshot. */
  rightsVerifiedAt: string;
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
    rightsVerifiedAt: CREATOR_RIGHTS_VERIFIED_AT,
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
