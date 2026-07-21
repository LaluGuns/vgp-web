import { NextResponse } from "next/server";
import {
  assertCreatorLicenseEnabled,
  creatorLicenseErrorResponse,
  requireCreatorLicenseUser,
} from "@/lib/creator-license/server";
import { createServiceClient } from "@/lib/supabase/server";
import { generateLicenseCertificatePdf } from "@/lib/creator-license/pdf";
import { safeCreatorCertificateFilename } from "@/lib/creator-license/policy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    assertCreatorLicenseEnabled();
    const user = await requireCreatorLicenseUser();
    const { id } = await params;
    if (!UUID_RE.test(id)) {
      return NextResponse.json({ error: "invalid_certificate_id" }, { status: 400 });
    }

    const service = await createServiceClient();
    const { data: cert, error } = await service
      .from("flowstate_creator_license_certificates")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: "license_database_unavailable" }, { status: 503 });
    }
    if (!cert) {
      return NextResponse.json({ error: "certificate_not_found" }, { status: 404 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://flow.virzyguns.com";
    const verifyUrl = `${baseUrl}/en/license/verify/${cert.id}`;

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
      verifyUrl,
    });

    const filename = safeCreatorCertificateFilename(cert.track_title, cert.id);

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  } catch (error) {
    const failure = creatorLicenseErrorResponse(error);
    return NextResponse.json({ error: failure.code }, { status: failure.status });
  }
}
