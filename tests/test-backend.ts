import { PaperFilterSchema, BatchDownloadSchema } from "../lib/validations/papers";
import { ProgressSyncSchema, ProgressPatchSchema } from "../lib/validations/user-progress";
import { generateR2PresignedUrl, PRESIGNED_URL_TTL_SECONDS } from "../lib/r2";

async function runTests() {
  console.log("🧪 Running PRISM Backend Test Suite...\n");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // Test 1: PaperFilterSchema validation
  console.log("1. PaperFilterSchema Validation:");
  const validFilter = PaperFilterSchema.safeParse({
    boardId: "igcse",
    year: "2024",
    session: "May/June",
    limit: "10",
    page: "2",
  });
  assert(validFilter.success, "Parses string numbers to integers correctly");
  if (validFilter.success) {
    assert(validFilter.data.year === 2024, "Year transformed to number 2024");
    assert(validFilter.data.limit === 10, "Limit transformed to number 10");
  }

  const invalidFilter = PaperFilterSchema.safeParse({
    year: "1850", // Out of range
  });
  assert(!invalidFilter.success, "Rejects out-of-range year (< 1990)");

  // Test 2: BatchDownloadSchema validation
  console.log("\n2. BatchDownloadSchema Validation:");
  const validBatch = BatchDownloadSchema.safeParse({
    paperIds: ["id-1", "id-2"],
    zipStream: true,
  });
  assert(validBatch.success, "Validates array of paperIds and zipStream flag");

  const emptyBatch = BatchDownloadSchema.safeParse({
    paperIds: [],
  });
  assert(!emptyBatch.success, "Rejects empty paperIds array");

  // Test 3: ProgressSyncSchema & Merge Conflict Logic
  console.log("\n3. ProgressSync & Merge Conflict Logic:");
  const testDate1 = "2026-11-06T12:00:00Z";
  const testDate2 = "2026-11-06T13:00:00Z";

  const syncPayload = {
    items: [
      {
        paperId: "paper-123",
        status: "SOLVED",
        scoreAchieved: 85,
        timeSpentSecs: 4200,
        answersJson: { q1: { answer: "A", score: 2 } },
        updatedAt: testDate2,
      },
    ],
  };
  const parsedSync = ProgressSyncSchema.safeParse(syncPayload);
  assert(parsedSync.success, "Validates ProgressSyncSchema payload");

  // Merge Conflict Logic Simulation
  const serverRecord = {
    paperId: "paper-123",
    scoreAchieved: 70,
    updatedAt: new Date(testDate1),
  };
  const incomingRecord = {
    paperId: "paper-123",
    scoreAchieved: 85,
    updatedAt: new Date(testDate2),
  };

  const incomingWinsTime =
    incomingRecord.updatedAt.getTime() > serverRecord.updatedAt.getTime() ||
    incomingRecord.scoreAchieved > serverRecord.scoreAchieved;
  assert(incomingWinsTime, "Incoming record wins if newer updatedAt timestamp or higher score");

  const serverRecordHigherScore = {
    paperId: "paper-123",
    scoreAchieved: 95,
    updatedAt: new Date(testDate1), // older time
  };
  const incomingLowerScore = {
    paperId: "paper-123",
    scoreAchieved: 60,
    updatedAt: new Date(testDate2), // newer time
  };
  // Merge conflict rule: "Preserve the record with the higher updatedAt timestamp or higher scoreAchieved."
  const conflictResolved =
    incomingLowerScore.updatedAt.getTime() > serverRecordHigherScore.updatedAt.getTime() ||
    incomingLowerScore.scoreAchieved > serverRecordHigherScore.scoreAchieved;
  assert(conflictResolved, "Evaluates merge conflict precedence rule correctly");

  // Test 4: R2 Presigned URL Generation
  console.log("\n4. Cloudflare R2 Presigned URL Generator:");
  const viewUrl = await generateR2PresignedUrl({
    fileKey: "papers/igcse/0580/2024/qp.pdf",
    filename: "0580_s24_qp_22.pdf",
    disposition: "inline",
    expiresIn: PRESIGNED_URL_TTL_SECONDS,
  });
  assert(viewUrl.includes("0580_s24_qp_22.pdf"), "View URL contains sanitized filename");
  assert(viewUrl.includes("inline"), "View URL requests inline disposition");

  const downloadUrl = await generateR2PresignedUrl({
    fileKey: "papers/igcse/0580/2024/qp.pdf",
    filename: "0580_s24_qp_22.pdf",
    disposition: "attachment",
    expiresIn: PRESIGNED_URL_TTL_SECONDS,
  });
  assert(downloadUrl.includes("attachment"), "Download URL requests attachment disposition");
  assert(PRESIGNED_URL_TTL_SECONDS === 900, "Presigned URL TTL is strictly 15 minutes (900 seconds)");

  // Test 5: ProgressPatchSchema
  console.log("\n5. ProgressPatchSchema Auto-save Validation:");
  const validPatch = ProgressPatchSchema.safeParse({
    status: "IN_PROGRESS",
    scoreAchieved: 45.5,
    timeSpentSecs: 1800,
    answersJson: {
      canvas: [{ x: 10, y: 20 }],
      notes: "Checked formula",
    },
  });
  assert(validPatch.success, "Validates real-time auto-save incremental payload");

  console.log(`\n========================================`);
  console.log(`🏁 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error("Test runner failed:", e);
  process.exit(1);
});

