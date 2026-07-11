import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * DEV-ONLY audio delivery — mirrors the production worker's anti-sniff
 * behaviour on localhost so download managers (IDM etc.) have nothing to
 * grab during development either:
 *   - the URL carries a base64url token, never a ".mp3" string;
 *   - the response is an opaque `application/octet-stream`, never `audio/*`.
 * Every player path (music + ambient) is fetch → decodeAudioData, which
 * ignores content-type, so playback is unaffected.
 *
 * Hard-disabled in production builds: audio must come from the signed
 * worker there, never from the app server.
 */

const KEY_RE = /^(tracks|sounds)\/[a-z0-9._/-]{1,180}\.(mp3|wav|m4a)$/i;

export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const token = new URL(req.url).searchParams.get("p") ?? "";
  let key: string;
  try {
    key = Buffer.from(token, "base64url").toString("utf8");
  } catch {
    return NextResponse.json({ error: "bad token" }, { status: 400 });
  }
  if (!KEY_RE.test(key)) {
    return NextResponse.json({ error: "bad path" }, { status: 400 });
  }

  // Resolve inside /public only — the regex already forbids traversal, this
  // is defence in depth.
  const publicDir = path.join(process.cwd(), "public");
  const filePath = path.resolve(publicDir, key);
  if (!filePath.startsWith(publicDir)) {
    return NextResponse.json({ error: "bad path" }, { status: 400 });
  }

  try {
    const buf = await readFile(filePath);
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "content-type": "application/octet-stream",
        "content-disposition": 'inline; filename="stream.bin"',
        "cache-control": "private, no-store",
        "x-content-type-options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
