import QRCode from "qrcode";

export type CertificatePdfParams = {
  certificateId: string;
  grantId: string;
  trackId: string;
  trackTitle: string;
  trackArtist: string;
  trackGenre: string;
  catalogVersion: string;
  termsVersion: string;
  termsDocumentVersion: string;
  termsDocumentSha256: string;
  licenseeName: string;
  licenseeOrganization?: string | null;
  attributionText: string;
  issuedAt: string;
  verifyUrl: string;
};

/**
 * The fonts below are declared /WinAnsiEncoding, so the content stream is
 * written as single-byte CP1252 (see the latin1 Buffer at the end). Typography
 * that is not plain ASCII has to be mapped to its CP1252 byte — emitting UTF-8
 * here is what turned the attribution line's em dash into "â€"".
 */
const WIN_ANSI: Record<string, string> = {
  "—": "\x97", // em dash
  "–": "\x96", // en dash
  "‘": "\x91",
  "’": "\x92",
  "“": "\x93",
  "”": "\x94",
  "…": "\x85", // ellipsis
  "•": "\x95", // bullet
  " ": " ",
};

function toWinAnsi(text: string): string {
  let out = "";
  for (const ch of text) {
    const mapped = WIN_ANSI[ch];
    if (mapped !== undefined) {
      out += mapped;
      continue;
    }
    // Latin-1 passes through unchanged; anything else degrades to "?" so a
    // stray glyph is obvious rather than silently corrupting the byte stream.
    out += (ch.codePointAt(0) ?? 0) <= 0xff ? ch : "?";
  }
  return out;
}

function escapePdfString(text: string): string {
  return toWinAnsi(text)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

/** Helvetica advance widths in 1/1000 em, enough for the ASCII we render. */
const HELVETICA_WIDTHS: Record<string, number> = {
  " ": 278, "!": 278, '"': 355, "#": 556, $: 556, "%": 889, "&": 667, "'": 191,
  "(": 333, ")": 333, "*": 389, "+": 584, ",": 278, "-": 333, ".": 278, "/": 278,
  ":": 278, ";": 278, "<": 584, "=": 584, ">": 584, "?": 556, "@": 1015,
  "[": 278, "\\": 278, "]": 278, "^": 469, _: 556, "`": 333,
  "{": 334, "|": 260, "}": 334, "~": 584,
  A: 667, B: 667, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722, I: 278,
  J: 500, K: 667, L: 556, M: 833, N: 722, O: 778, P: 667, Q: 778, R: 722,
  S: 667, T: 611, U: 722, V: 667, W: 944, X: 667, Y: 667, Z: 611,
  a: 556, b: 556, c: 500, d: 556, e: 556, f: 278, g: 556, h: 556, i: 222,
  j: 222, k: 500, l: 222, m: 833, n: 556, o: 556, p: 556, q: 556, r: 333,
  s: 500, t: 278, u: 556, v: 500, w: 722, x: 500, y: 500, z: 500,
};

function textWidth(text: string, size: number): number {
  let units = 0;
  for (const ch of text) {
    units += /[0-9]/.test(ch) ? 556 : (HELVETICA_WIDTHS[ch] ?? 556);
  }
  return (units / 1000) * size;
}

/** Greedy word wrap so long clauses stay inside their box instead of clipping. */
function wrapText(text: string, maxWidth: number, size: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && textWidth(candidate, size) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * Generates a self-contained vector PDF 1.4 for the Flow License Certificate.
 */
export async function generateLicenseCertificatePdf(
  params: CertificatePdfParams,
  width = 595.28,
  height = 841.89
): Promise<Buffer> {
  const qr = QRCode.create(params.verifyUrl, { errorCorrectionLevel: "M" });
  const qrSize = qr.modules.size;
  const qrScale = 2.2;
  const qrWidth = qrSize * qrScale;
  const qrX = width - 45 - qrWidth;
  const qrY = 48;

  let s = "";

  // 1. Header background (Navy)
  s += `0.027 0.078 0.180 rg 0 735 595.28 106.89 re f\n`;
  // Accent line (Cyan)
  s += `0.000 0.851 1.000 rg 0 731 595.28 4 re f\n`;

  // Header Text
  s += `BT /F2 10 Tf 1 1 1 rg 45 808 Td (FLOW CREATOR MUSIC) Tj ET\n`;
  s += `BT /F2 22 Tf 1 1 1 rg 45 775 Td (LICENSE CERTIFICATE) Tj ET\n`;
  s += `BT /F1 8.5 Tf 0.72 0.77 0.85 rg 45 754 Td (Evidence of a versioned creator-music license grant) Tj ET\n`;

  // Status Badge top-right
  s += `0.902 0.965 0.984 rg 420 765 130 26 re f\n`;
  s += `0.000 0.655 0.773 RG 1 w 420 765 130 26 re S\n`;
  s += `BT /F2 8 Tf 0.027 0.078 0.180 rg 432 775 Td (VALID PRO LICENSE) Tj ET\n`;

  // 2. Identity & Metadata Table (Y: 590 to 715)
  s += `0.957 0.973 0.988 rg 45 590 505.28 125 re f\n`;
  s += `0.867 0.890 0.925 RG 0.8 w 45 590 505.28 125 re S\n`;
  // Vertical dividing lines
  s += `45 615 505.28 0 M 505.28 0 M S\n`; // Horizontal grid lines
  s += `45 640 505.28 0 M S\n`;
  s += `45 665 505.28 0 M S\n`;
  s += `45 690 505.28 0 M S\n`;
  s += `135 590 0 125 M S\n`; // Vertical divider column 1
  s += `310 590 0 125 M S\n`; // Vertical divider column 2
  s += `400 590 0 125 M S\n`; // Vertical divider column 3

  // Table Content
  const printRow = (y: number, label1: string, val1: string, label2: string, val2: string) => {
    s += `BT /F2 8 Tf 0.027 0.078 0.180 rg 52 ${y} Td (${escapePdfString(label1)}) Tj ET\n`;
    s += `BT /F1 8 Tf 0.09 0.12 0.20 rg 142 ${y} Td (${escapePdfString(val1)}) Tj ET\n`;
    s += `BT /F2 8 Tf 0.027 0.078 0.180 rg 317 ${y} Td (${escapePdfString(label2)}) Tj ET\n`;
    s += `BT /F1 8 Tf 0.09 0.12 0.20 rg 407 ${y} Td (${escapePdfString(val2)}) Tj ET\n`;
  };

  printRow(700, "LICENSEE", params.licenseeName + (params.licenseeOrganization ? ` (${params.licenseeOrganization})` : ""), "CERTIFICATE ID", params.certificateId);
  printRow(675, "TRACK TITLE", `${params.trackTitle} - ${params.trackArtist}`, "GRANT ID", params.grantId);
  printRow(650, "GENRE / ID", `${params.trackGenre} (${params.trackId})`, "ISSUED (UTC)", new Date(params.issuedAt).toISOString().replace("T", " ").slice(0, 19));
  printRow(625, "TERMS VERSION", params.termsVersion, "CATALOG VERSION", params.catalogVersion);
  printRow(600, "LICENSOR", "Chill Music Division / Virzy Guns Production", "GOVERNING LAW", "Indonesia (DJKI / PN Praya)");

  // 3. License Grant Summary
  s += `BT /F2 9.5 Tf 0.027 0.078 0.180 rg 45 565 Td (LICENSE GRANT & PERMISSIONS) Tj ET\n`;
  s += `BT /F1 8.2 Tf 0.09 0.12 0.20 rg 45 550 Td (${escapePdfString("Subject to the complete terms, the Licensor grants the Licensee a non-exclusive, non-transferable license to synchronize")}) Tj ET\n`;
  s += `BT /F1 8.2 Tf 0.09 0.12 0.20 rg 45 538 Td (${escapePdfString("eligible Flow Creator Music as background music in the Licensee's creator works.")}) Tj ET\n`;

  // 4/5. Permission boxes. Every clause is wrapped to the box width — these
  // used to be single absolute-positioned lines and the longer ones ran past
  // the border and got clipped mid-word.
  const BULLET_SIZE = 7.5;
  const BULLET_LEAD = 10;
  const BOX_BOTTOM = 400;
  const BOX_HEIGHT = 520 - BOX_BOTTOM;

  const drawBulletBox = (
    boxX: number,
    boxW: number,
    fill: string,
    stroke: string,
    titleColor: string,
    title: string,
    items: string[]
  ) => {
    s += `${fill} rg ${boxX} ${BOX_BOTTOM} ${boxW} ${BOX_HEIGHT} re f\n`;
    s += `${stroke} RG 0.8 w ${boxX} ${BOX_BOTTOM} ${boxW} ${BOX_HEIGHT} re S\n`;
    const textX = boxX + 10;
    s += `BT /F2 8.5 Tf ${titleColor} rg ${textX} 505 Td (${escapePdfString(title)}) Tj ET\n`;

    let y = 490;
    for (const item of items) {
      const lines = wrapText(item, boxW - 20, BULLET_SIZE);
      lines.forEach((line, i) => {
        // Indent continuations so they read as one clause, not a new bullet.
        const x = i === 0 ? textX : textX + 6;
        s += `BT /F1 ${BULLET_SIZE} Tf 0.09 0.12 0.20 rg ${x} ${y} Td (${escapePdfString(line)}) Tj ET\n`;
        y -= BULLET_LEAD;
      });
    }
  };

  drawBulletBox(45, 245, "0.937 0.984 0.961", "0.659 0.902 0.761", "0.024 0.447 0.290", "YOU MAY", [
    "* Use in monetized videos, livestreams, podcasts, coding & study content.",
    "* Publish on social and creator platforms with unlimited views or streams.",
    "* Retain qualifying works published while Flow Pro was active after cancellation.",
    "* New works require an active Flow Pro creator license at first publication.",
  ]);

  drawBulletBox(305, 245.28, "0.992 0.945 0.945", "0.957 0.647 0.647", "0.800 0.150 0.150", "YOU MAY NOT", [
    "* Sell, upload, or redistribute tracks as standalone music files.",
    "* Register track or music fingerprint with Content ID or rights management.",
    "* Sample, remix, upload to DSPs under your name, or sublicense.",
    "* Use in template libraries, apps, or games without separate written license.",
  ]);

  // 6. Required Attribution Box
  s += `0.918 0.984 1.000 rg 45 335 505.28 50 re f\n`;
  s += `0.545 0.867 0.922 RG 0.8 w 45 335 505.28 50 re S\n`;
  s += `BT /F2 8.5 Tf 0.000 0.550 0.700 rg 55 370 Td (REQUIRED ATTRIBUTION) Tj ET\n`;
  s += `BT /F2 8 Tf 0.027 0.078 0.180 rg 55 355 Td (${escapePdfString(params.attributionText)}) Tj ET\n`;
  s += `BT /F1 7.2 Tf 0.364 0.408 0.478 rg 55 343 Td (${escapePdfString("Include this line in video descriptions, stream panels, or podcast show notes.")}) Tj ET\n`;

  // 7. Important Legal Conditions
  const legalWidth = 505.28 - 10;
  s += `BT /F2 8.5 Tf 0.027 0.078 0.180 rg 45 310 Td (IMPORTANT LEGAL CONDITIONS) Tj ET\n`;
  let legalY = 296;
  for (const condition of [
    "1. Controlling Language & Contract: Bahasa Indonesia terms (creator-license-2026-07-21) control.",
    "2. Evidence Only: This certificate is evidence of an existing grant; it does not transfer copyright ownership.",
    "3. Survival & Cancellation: Qualifying published works survive ordinary cancellation. Fraud or material breach may revoke the grant.",
    `4. Terms Hash: SHA-256 (${params.termsDocumentSha256.slice(0, 16)}...) matches the accepted canonical contract.`,
  ]) {
    for (const line of wrapText(condition, legalWidth, 7.8)) {
      s += `BT /F1 7.8 Tf 0.09 0.12 0.20 rg 45 ${legalY} Td (${escapePdfString(line)}) Tj ET\n`;
      legalY -= 11;
    }
  }

  // 8. Verification Section (Left: text links, Right: Vector QR Code)
  s += `0.965 0.973 0.984 rg 45 40 505.28 205 re f\n`;
  s += `0.867 0.890 0.925 RG 0.8 w 45 40 505.28 205 re S\n`;

  s += `BT /F2 9 Tf 0.027 0.078 0.180 rg 60 222 Td (ONLINE VERIFICATION & COMPLETE TERMS) Tj ET\n`;
  s += `BT /F2 8 Tf 0.000 0.550 0.700 rg 60 202 Td (PUBLIC VERIFIER URL:) Tj ET\n`;
  s += `BT /F1 8 Tf 0.09 0.12 0.20 rg 60 188 Td (${escapePdfString(params.verifyUrl)}) Tj ET\n`;
  s += `BT /F2 8 Tf 0.000 0.550 0.700 rg 60 168 Td (COMPLETE CANONICAL TERMS:) Tj ET\n`;
  s += `BT /F1 8 Tf 0.09 0.12 0.20 rg 60 154 Td (https://flow.virzyguns.com/en/license) Tj ET\n`;
  s += `BT /F1 7.5 Tf 0.364 0.408 0.478 rg 60 134 Td (${escapePdfString("Scan the QR code or visit the public verifier URL to confirm certificate validity.")}) Tj ET\n`;

  // Draw QR code vector
  s += `0 0 0 rg\n`;
  for (let r = 0; r < qrSize; r++) {
    for (let c = 0; c < qrSize; c++) {
      if (qr.modules.get(r, c)) {
        const mx = qrX + c * qrScale;
        const my = qrY + (qrSize - 1 - r) * qrScale;
        s += `${mx.toFixed(2)} ${my.toFixed(2)} ${qrScale.toFixed(2)} ${qrScale.toFixed(2)} re f\n`;
      }
    }
  }

  // Footer bar
  s += `0.364 0.408 0.478 RG 0.5 w 45 25 505.28 0 M S\n`;
  s += `BT /F1 7 Tf 0.364 0.408 0.478 rg 45 15 Td (Flow by Virzy Guns - Official Creator License Certificate) Tj ET\n`;
  s += `BT /F1 7 Tf 0.364 0.408 0.478 rg 435 15 Td (https://flow.virzyguns.com) Tj ET\n`;

  // PDF Object Assembly
  const f1Obj = 3;
  const f2Obj = 4;
  // latin1 throughout: one JS char == one byte, which is what /WinAnsiEncoding
  // expects. Measuring or emitting as utf8 would both corrupt the glyphs and
  // desync the xref offsets.
  const streamLen = Buffer.byteLength(s, "latin1");

  const objects = [
    `<< /Type /Catalog /Pages 2 0 R >>`, // 1
    `<< /Type /Pages /Kids [6 0 R] /Count 1 >>`, // 2
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`, // 3
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`, // 4
    `<< /Length ${streamLen} >>\nstream\n${s}\nendstream`, // 5
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Contents 5 0 R /Resources << /Font << /F1 ${f1Obj} 0 R /F2 ${f2Obj} 0 R >> >> >>`, // 6
  ];

  let pdf = `%PDF-1.4\n%\xFF\xFF\xFF\xFF\n`;
  const offsets: number[] = [0];

  for (let i = 0; i < objects.length; i++) {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, "latin1");
}
