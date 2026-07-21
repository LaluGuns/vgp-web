/**
 * Versioned contract registry for Creator Music License.
 */

export type CreatorContractSpec = {
  version: string;
  documentVersion: string;
  documentSha256: string;
  controllingLanguage: "id-ID";
  rightsExecutedAt: string;
  rightsEvidenceDocumentSha256: string;
  rightsManifestSha256: string;
};

export const CREATOR_CONTRACT_2026_07_21: CreatorContractSpec = {
  version: "creator-license-2026-07-21",
  documentVersion: "creator-license-2026-07-21",
  documentSha256: "537c0c9f14b70a95e1339d5142bf4ea4c55cae278c89eaaeadc14cf15277c4ec",
  controllingLanguage: "id-ID",
  rightsExecutedAt: "2026-07-21",
  rightsEvidenceDocumentSha256: "62ec79c8901c550088f1d47a21f420345451839e41ef25a1f04659c996def69e",
  rightsManifestSha256: "bb4c0f2ff6373e2cb2360f4331ce0001f72297519968aed025035e89ca47cdd5",
};

export const CREATOR_CONTRACT_V1_HISTORICAL: CreatorContractSpec = {
  version: "creator-license-v1",
  documentVersion: "creator-license-v1",
  documentSha256: "d2b4c6eca30c1b74586f44a0aceb2e38a5d5f6cf88303f85bd83779235656274",
  controllingLanguage: "id-ID",
  rightsExecutedAt: "2026-07-19",
  rightsEvidenceDocumentSha256: "",
  rightsManifestSha256: "bb4c0f2ff6373e2cb2360f4331ce0001f72297519968aed025035e89ca47cdd5",
};

export const CREATOR_CONTRACT_REGISTRY = new Map<string, CreatorContractSpec>([
  [CREATOR_CONTRACT_2026_07_21.version, CREATOR_CONTRACT_2026_07_21],
  [CREATOR_CONTRACT_V1_HISTORICAL.version, CREATOR_CONTRACT_V1_HISTORICAL],
]);

// Current default contract constants
export const CREATOR_TERMS_DOCUMENT_VERSION = CREATOR_CONTRACT_2026_07_21.documentVersion;
export const CREATOR_TERMS_DOCUMENT_SHA256 = CREATOR_CONTRACT_2026_07_21.documentSha256;
export const CREATOR_RIGHTS_VERIFIED_AT = CREATOR_CONTRACT_2026_07_21.rightsExecutedAt;
export const CREATOR_RIGHTS_EVIDENCE_DOCUMENT_SHA256 = CREATOR_CONTRACT_2026_07_21.rightsEvidenceDocumentSha256;

export function getCreatorContractSpec(version: string): CreatorContractSpec | null {
  return CREATOR_CONTRACT_REGISTRY.get(version) ?? null;
}
