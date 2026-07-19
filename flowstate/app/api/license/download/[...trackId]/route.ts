import { NextResponse } from "next/server";
import { CREATOR_TRACK_BY_ID } from "@/lib/creator-license/catalog";
import {
  assertCreatorLicenseEnabled,
  creatorLicenseErrorResponse,
  findCurrentGrant,
  requireActiveCreatorPlan,
  requireCreatorLicenseUser,
} from "@/lib/creator-license/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function configuredWorker(): { origin: string; issueUrl: string; secret: string } | null {
  const base = process.env.NEXT_PUBLIC_AUDIO_WORKER_URL;
  const secret = process.env.CREATOR_DOWNLOAD_SECRET;
  if (!base || !secret || secret.length < 32) return null;
  try {
    const parsed = new URL(base);
    if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") return null;
    return {
      origin: parsed.origin,
      issueUrl: `${parsed.origin}/v1/download-url`,
      secret,
    };
  } catch {
    return null;
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ trackId: string[] }> }
) {
  try {
    assertCreatorLicenseEnabled();
    const worker = configuredWorker();
    if (!worker) {
      return NextResponse.json({ error: "creator_download_not_configured" }, { status: 503 });
    }

    const { trackId: segments } = await params;
    const trackId = segments.map((part) => decodeURIComponent(part)).join("/");
    const track = CREATOR_TRACK_BY_ID.get(trackId);
    if (!track) return NextResponse.json({ error: "track_not_eligible" }, { status: 404 });

    const user = await requireCreatorLicenseUser();
    await requireActiveCreatorPlan(user.id);
    const grant = await findCurrentGrant(user.id);
    if (!grant) {
      return NextResponse.json({ error: "license_grant_required" }, { status: 409 });
    }

    let response: Response;
    try {
      response = await fetch(worker.issueUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-creator-download-secret": worker.secret,
        },
        body: JSON.stringify({
          path: track.creatorDownloadAsset,
          filename: track.creatorDownloadFilename,
        }),
        signal: AbortSignal.timeout(10_000),
        cache: "no-store",
      });
    } catch {
      return NextResponse.json({ error: "creator_download_unavailable" }, { status: 502 });
    }
    if (!response.ok) {
      return NextResponse.json({ error: "creator_download_unavailable" }, { status: 502 });
    }

    const payload = (await response.json().catch(() => null)) as { url?: unknown } | null;
    if (!payload || typeof payload.url !== "string") {
      return NextResponse.json({ error: "creator_download_unavailable" }, { status: 502 });
    }
    const signed = new URL(payload.url);
    if (signed.origin !== worker.origin || signed.pathname !== "/v1/download") {
      return NextResponse.json({ error: "creator_download_unavailable" }, { status: 502 });
    }
    return NextResponse.redirect(signed, 307);
  } catch (error) {
    const failure = creatorLicenseErrorResponse(error);
    return NextResponse.json({ error: failure.code }, { status: failure.status });
  }
}
