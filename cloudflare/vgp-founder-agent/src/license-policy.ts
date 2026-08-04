import type { LicenseTermSnapshot } from "./contracts";
import { sha256Hex } from "./security";

export const BASIC_MP3_TERMS_V1 = {
  offerId: "basic-mp3",
  version: "owner-confirmed-main-c407209-2026-07-29",
  sourceUri: "owner://vgp/beat-license/basic-mp3/2026-07-29",
  currency: "USD",
  price: 15,
  allowedUse: "Music Recording",
  copiesLimit: 2_000,
  onlineAudioStreamsLimit: 5_000,
  musicVideosLimit: 1,
} as const;

export const BASIC_MP3_TERMS_V1_SHA256 =
  "2581fd62242bfe5abda95915b1065afe5c77aad9f2b8d44d1f572e72f9b59165";

export function canonicalLicenseTermsPayload(): string {
  return JSON.stringify(BASIC_MP3_TERMS_V1);
}

export async function getBasicMp3TermsSnapshot(): Promise<LicenseTermSnapshot> {
  const contentSha256 = await sha256Hex(canonicalLicenseTermsPayload());
  if (contentSha256 !== BASIC_MP3_TERMS_V1_SHA256) {
    throw new Error("LICENSE_POLICY_INTEGRITY_FAILURE");
  }
  return {
    ...BASIC_MP3_TERMS_V1,
    contentSha256,
  };
}
