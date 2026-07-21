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

function escapePdfString(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
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

  // 4. YOU MAY Box
  s += `0.937 0.984 0.961 rg 45 440 245 80 re f\n`;
  s += `0.659 0.902 0.761 RG 0.8 w 45 440 245 80 re S\n`;
  s += `BT /F2 8.5 Tf 0.024 0.447 0.290 rg 55 505 Td (YOU MAY) Tj ET\n`;
  s += `BT /F1 7.8 Tf 0.09 0.12 0.20 rg 55 490 Td (${escapePdfString("* Use in monetized videos, livestreams, podcasts, coding & study content.")}) Tj ET\n`;
  s += `BT /F1 7.8 Tf 0.09 0.12 0.20 rg 55 476 Td (${escapePdfString("* Publish on social and creator platforms with unlimited views or streams.")}) Tj ET\n`;
  s += `BT /F1 7.8 Tf 0.09 0.12 0.20 rg 55 462 Td (${escapePdfString("* Retain qualifying works published while Flow Pro was active after cancellation.")}) Tj ET\n`;
  s += `BT /F1 7.8 Tf 0.09 0.12 0.20 rg 55 448 Td (${escapePdfString("* New works require an active Flow Pro creator license at first publication.")}) Tj ET\n`;

  // 5. YOU MAY NOT Box
  s += `0.992 0.945 0.945 rg 305 440 245.28 80 re f\n`;
  s += `0.957 0.647 0.647 RG 0.8 w 305 440 245.28 80 re S\n`;
  s += `BT /F2 8.5 Tf 0.800 0.150 0.150 rg 315 505 Td (YOU MAY NOT) Tj ET\n`;
  s += `BT /F1 7.8 Tf 0.09 0.12 0.20 rg 315 490 Td (${escapePdfString("* Sell, upload, or redistribute tracks as standalone music files.")}) Tj ET\n`;
  s += `BT /F1 7.8 Tf 0.09 0.12 0.20 rg 315 476 Td (${escapePdfString("* Register track or music fingerprint with Content ID or rights management.")}) Tj ET\n`;
  s += `BT /F1 7.8 Tf 0.09 0.12 0.20 rg 315 462 Td (${escapePdfString("* Sample, remix, upload to DSPs under your name, or sublicense.")}) Tj ET\n`;
  s += `BT /F1 7.8 Tf 0.09 0.12 0.20 rg 315 448 Td (${escapePdfString("* Use in template libraries, apps, or games without separate written license.")}) Tj ET\n`;

  // 6. Required Attribution Box
  s += `0.918 0.984 1.000 rg 45 375 505.28 50 re f\n`;
  s += `0.545 0.867 0.922 RG 0.8 w 45 375 505.28 50 re S\n`;
  s += `BT /F2 8.5 Tf 0.000 0.550 0.700 rg 55 410 Td (REQUIRED ATTRIBUTION) Tj ET\n`;
  s += `BT /F2 8 Tf 0.027 0.078 0.180 rg 55 395 Td (${escapePdfString(params.attributionText)}) Tj ET\n`;
  s += `BT /F1 7.2 Tf 0.364 0.408 0.478 rg 55 383 Td (${escapePdfString("Include this line in video descriptions, stream panels, or podcast show notes.")}) Tj ET\n`;

  // 7. Important Legal Conditions
  s += `BT /F2 8.5 Tf 0.027 0.078 0.180 rg 45 350 Td (IMPORTANT LEGAL CONDITIONS) Tj ET\n`;
  s += `BT /F1 7.8 Tf 0.09 0.12 0.20 rg 45 336 Td (${escapePdfString("1. Controlling Language & Contract: Bahasa Indonesia terms (creator-license-2026-07-21) control.")}) Tj ET\n`;
  s += `BT /F1 7.8 Tf 0.09 0.12 0.20 rg 45 324 Td (${escapePdfString("2. Evidence Only: This certificate is evidence of an existing grant; it does not transfer copyright ownership.")}) Tj ET\n`;
  s += `BT /F1 7.8 Tf 0.09 0.12 0.20 rg 45 312 Td (${escapePdfString("3. Survival & Cancellation: Qualifying published works survive ordinary cancellation. Fraud or material breach may revoke the grant.")}) Tj ET\n`;
  s += `BT /F1 7.8 Tf 0.09 0.12 0.20 rg 45 300 Td (${escapePdfString("4. Terms Hash: SHA-256 (" + params.termsDocumentSha256.slice(0, 16) + "...) matches the accepted canonical contract.")}) Tj ET\n`;

  // 8. Verification Section (Left: text links, Right: Vector QR Code)
  s += `0.965 0.973 0.984 rg 45 40 505.28 235 re f\n`;
  s += `0.867 0.890 0.925 RG 0.8 w 45 40 505.28 235 re S\n`;

  s += `BT /F2 9 Tf 0.027 0.078 0.180 rg 60 250 Td (ONLINE VERIFICATION & COMPLETE TERMS) Tj ET\n`;
  s += `BT /F2 8 Tf 0.000 0.550 0.700 rg 60 230 Td (PUBLIC VERIFIER URL:) Tj ET\n`;
  s += `BT /F1 8 Tf 0.09 0.12 0.20 rg 60 216 Td (${escapePdfString(params.verifyUrl)}) Tj ET\n`;
  s += `BT /F2 8 Tf 0.000 0.550 0.700 rg 60 196 Td (COMPLETE CANONICAL TERMS:) Tj ET\n`;
  s += `BT /F1 8 Tf 0.09 0.12 0.20 rg 60 182 Td (https://flow.virzyguns.com/en/license) Tj ET\n`;
  s += `BT /F1 7.5 Tf 0.364 0.408 0.478 rg 60 162 Td (${escapePdfString("Scan the QR code or visit the public verifier URL to confirm certificate validity.")}) Tj ET\n`;

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
  const streamLen = Buffer.byteLength(s, "utf8");

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
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, "utf8");
}
