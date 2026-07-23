import { NextResponse } from "next/server";
import { CREATOR_TRACK_BY_ID } from "@/lib/creator-license/catalog";
import {
  assertCreatorLicenseEnabled,
  creatorLicenseErrorResponse,
  findCurrentGrant,
  getOrCreateCertificate,
  requireActiveCreatorPlan,
  requireCreatorLicenseUser,
} from "@/lib/creator-license/server";
import { generateLicenseCertificatePdf } from "@/lib/creator-license/pdf";
import { safeCreatorCertificateFilename } from "@/lib/creator-license/policy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Returns the licence certificate PDF for a track the caller is entitled to.
 *
 * The catalog UI has no way to learn a certificate id — certificates are minted
 * server-side — so resolving by track id keeps the client from having to track
 * one. getOrCreateCertificate is idempotent per (grant, track), so repeat hits
 * return the same certificate rather than issuing a new one.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ trackId: string[] }> }
) {
  try {
    assertCreatorLicenseEnabled();

    const user = await requireCreatorLicenseUser();
    await requireActiveCreatorPlan(user.id);

    const { trackId: segments } = await params;
    const trackId = segments.map((part) => decodeURIComponent(part)).join("/");
    if (!CREATOR_TRACK_BY_ID.has(trackId)) {
      return NextResponse.json({ error: "track_not_eligible" }, { status: 404 });
    }

    const grant = await findCurrentGrant(user.id);
    if (!grant) {
      return NextResponse.json({ error: "license_grant_required" }, { status: 409 });
    }

    const licenseeNameInput =
      new URL(request.url).searchParams.get("licenseeName") ?? undefined;
    const cert = await getOrCreateCertificate(user.id, grant, trackId, licenseeNameInput);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://flow.virzyguns.com";
    const pdfBuffer = await generateLicenseCertificatePdf({
      certificateId: cert.id,
      grantId: cert.grant_id,
      trackId: cert.track_id,
      trackTitle: cert.track_title,
      trackArtist: cert.track_artist,
      trackGenre: cert.track_genre,
      catalogVersion: cert.catalog_version,
      termsVersion: cert.terms_version,
      termsDocumentVersion: cert.terms_document_version,
      termsDocumentSha256: cert.terms_document_sha256,
      licenseeName: cert.licensee_name,
      licenseeOrganization: cert.licensee_organization,
      attributionText: cert.attribution_text,
      issuedAt: cert.issued_at,
      verifyUrl: `${baseUrl}/en/license/verify/${cert.id}`,
    });

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeCreatorCertificateFilename(cert.track_title, cert.id)}"`,
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  } catch (error) {
    const failure = creatorLicenseErrorResponse(error);
    return NextResponse.json({ error: failure.code }, { status: failure.status });
  }
}
