/**
 * Helper to generate valid, viewable PDF files without external heavy binaries.
 * Uses standard PDF 1.4 specification format.
 */

import fs from "fs";
import path from "path";

export function createSimplePdf(title: string, subtitle: string, lines: string[]): Buffer {
  const contentStream = [
    "BT",
    "/F1 22 Tf",
    "50 780 Td",
    `(${title.replace(/[\(\)\\]/g, "")}) Tj`,
    "/F1 12 Tf",
    "0 -28 Td",
    `(${subtitle.replace(/[\(\)\\]/g, "")}) Tj`,
    "/F1 10 Tf",
    "0 -24 Td",
    "(---------------------------------------------------------------------------------------------------) Tj",
    "0 -20 Td",
    ...lines.map((l, i) => `(${l.replace(/[\(\)\\]/g, "")}) Tj 0 -16 Td`),
    "ET",
  ].join("\n");

  const streamLength = Buffer.byteLength(contentStream);

  const pdf = [
    "%PDF-1.4",
    "1 0 obj",
    "<< /Type /Catalog /Pages 2 0 R >>",
    "endobj",
    "2 0 obj",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "endobj",
    "3 0 obj",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    "endobj",
    "4 0 obj",
    `<< /Length ${streamLength} >>`,
    "stream",
    contentStream,
    "endstream",
    "endobj",
    "5 0 obj",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "endobj",
    "xref",
    "0 6",
    "0000000000 65535 f ",
    "0000000009 00000 n ",
    "0000000058 00000 n ",
    "0000000115 00000 n ",
    "0000000242 00000 n ",
    `0000000${String(310 + streamLength).padStart(3, "0")} 00000 n `,
    "trailer",
    "<< /Size 6 /Root 1 0 R >>",
    "startxref",
    String(400 + streamLength),
    "%%EOF",
  ].join("\n");

  return Buffer.from(pdf, "utf-8");
}
