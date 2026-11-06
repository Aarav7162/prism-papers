/**
 * PRISM Past-Paper Ingestion & R2 Uploader CLI
 *
 * Uploads a local examination PDF directly to Cloudflare R2 and creates the
 * corresponding relational Paper & Question records in PostgreSQL.
 *
 * Usage:
 *   npx tsx scripts/upload-paper.ts \
 *     --board=igcse \
 *     --subjectCode=0580 \
 *     --year=2024 \
 *     --session="May/June" \
 *     --variant=22 \
 *     --type=QUESTION_PAPER \
 *     --file=./sample_paper.pdf
 */

import fs from "fs";
import path from "path";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "../lib/prisma";
import { r2Client, isR2Configured } from "../lib/r2";
import { env } from "../lib/env";
import { PaperType } from "@prisma/client";

function getArg(flag: string): string | undefined {
  const arg = process.argv.find((a) => a.startsWith(`--${flag}=`));
  return arg ? arg.split("=")[1] : undefined;
}

async function main() {
  const boardId = getArg("board")?.toLowerCase() || "igcse";
  const subjectCode = getArg("subjectCode") || "0580";
  const yearStr = getArg("year") || "2024";
  const session = getArg("session") || "May/June";
  const variant = getArg("variant") || "22";
  const paperTypeStr = getArg("type") || "QUESTION_PAPER";
  const filePath = getArg("file");
  const totalMarksStr = getArg("marks") || "80";
  const durationMinsStr = getArg("duration") || "90";

  console.log("📄 PRISM Past-Paper Ingestion Engine\n");
  console.log(`  Board:        ${boardId.toUpperCase()}`);
  console.log(`  Subject Code: ${subjectCode}`);
  console.log(`  Year:         ${yearStr}`);
  console.log(`  Session:      ${session}`);
  console.log(`  Variant:      ${variant}`);
  console.log(`  Type:         ${paperTypeStr}`);

  // 1. Resolve Subject in Database
  const subject = await prisma.subject.findFirst({
    where: {
      boardId,
      code: subjectCode,
    },
  });

  if (!subject) {
    console.error(`❌ Subject with code "${subjectCode}" under board "${boardId}" was not found.`);
    console.log("   Available subjects can be seeded via: npm run prisma:seed");
    process.exit(1);
  }

  const year = parseInt(yearStr, 10);
  const totalMarks = parseInt(totalMarksStr, 10);
  const durationMins = parseInt(durationMinsStr, 10);
  const paperType = paperTypeStr as PaperType;

  // 2. Compute standardized Cloudflare R2 Key
  const typeAbbr = paperType === "QUESTION_PAPER" ? "qp" : paperType === "MARK_SCHEME" ? "ms" : "er";
  const fileKey = `papers/${boardId}/${subjectCode}/${year}_${session.replace(/[\/\s]+/g, "_").toLowerCase()}/${subjectCode}_${year}_${typeAbbr}_${variant}.pdf`;

  console.log(`  R2 File Key:  ${fileKey}`);

  // 3. Upload file to Cloudflare R2 (if file path is provided and file exists)
  if (filePath) {
    const resolvedPath = path.resolve(filePath);
    if (!fs.existsSync(resolvedPath)) {
      console.error(`❌ Local file not found: ${resolvedPath}`);
      process.exit(1);
    }

    const fileBuffer = fs.readFileSync(resolvedPath);
    console.log(`\n☁️  Uploading ${fileBuffer.length} bytes to Cloudflare R2...`);

    if (isR2Configured) {
      await r2Client.send(
        new PutObjectCommand({
          Bucket: env.R2_BUCKET_NAME,
          Key: fileKey,
          Body: fileBuffer,
          ContentType: "application/pdf",
        })
      );
      console.log("✅ Successfully uploaded to Cloudflare R2 bucket!");
    } else {
      console.log("⚠️  Live R2 credentials not set in .env (running in mockup mode).");
    }
  } else {
    console.log("\n⚠️  No local file provided (--file=...). Registering paper metadata in database with target R2 fileKey.");
  }

  // 4. Create or update Paper record in PostgreSQL
  const paper = await prisma.paper.create({
    data: {
      subjectId: subject.id,
      year,
      session,
      variant,
      paperType,
      fileKey,
      totalMarks,
      durationMins,
    },
  });

  console.log(`\n🎉 Paper record created in PostgreSQL!`);
  console.log(`   Paper ID: ${paper.id}`);
  console.log(`   View API: /api/papers/${paper.id}/view`);
  console.log(`   Download API: /api/papers/${paper.id}/download`);
}

main()
  .catch((err) => {
    console.error("Ingestion failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
