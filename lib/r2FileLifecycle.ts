import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/prisma";
import { deleteFromR2 } from "@/lib/r2";

/*
 * ============================================================
 * R2 FILE LIFECYCLE & ORPHAN CLEANUP
 * ============================================================
 *
 * This module cross-references every real R2 object key stored in the
 * bucket against every column in the database that legitimately holds
 * an R2 object key -- never anything that merely looks like a URL.
 *
 * IMPORTANT DISTINCTION (do not add fields to REFERENCED_KEY_QUERIES
 * without re-checking this): several columns that superficially look
 * like file references are actually free-text URLs an admin typed into
 * a form (an external video host, a CDN link, etc.) -- they were never
 * produced by uploadToR2() and never correspond to a key inside OUR
 * bucket. Treating one of those as an R2 key here would make this
 * utility "purge" a key that never existed in the bucket (harmless --
 * deleteFromR2 on a missing key is a no-op) but, more importantly,
 * would make the reference-scan silently assume that field protects a
 * bucket object it does not actually protect, which could let a
 * genuine orphan hide behind it. Confirmed excluded for this reason:
 *   - MediaItem.mediaUrl          (admin-entered, may be external)
 *   - LibraryResource.fileUrl     (admin-entered, may be external)
 *   - AlumniProfile.photoUrl      (admin-entered, may be external)
 *
 * Confirmed INCLUDED because every value is produced exclusively by
 * uploadToR2() in this codebase (grep-verified against every call site
 * of uploadToR2 before this file was written):
 *   - Book.r2FileKey
 *   - User.avatarUrl
 *   - AdmissionApplication.{identityDocumentUrl, passportPictureUrl,
 *     transcriptsUrl, certificateUrl, testimonialUrl, recommendationUrl}
 *   - Submission.fileUrl (student assignment submissions)
 *   - ExerciseSubmission.fileUrl (discussion exercise uploads)
 *   - TranscriptIssue.pdfUrl
 *   - ManuscriptRevision.fileUrl (no live writer yet, included for when
 *     one exists -- an empty table contributes zero keys today)
 */

export type OrphanScanResult = {
  bucketObjectCount: number;
  referencedKeyCount: number;
  orphanKeys: string[];
  scannedAt: string;
};

function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 credentials are not fully configured.");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

function getBucket(): string {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) {
    throw new Error("R2_BUCKET_NAME is missing.");
  }
  return bucket;
}

// Lists every object key currently in the bucket, paginating through
// ListObjectsV2's 1000-key page limit rather than assuming a small
// bucket.
export async function listAllR2Keys(): Promise<string[]> {
  const client = getR2Client();
  const bucket = getBucket();
  const keys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: continuationToken,
      })
    );

    for (const object of response.Contents ?? []) {
      if (object.Key) keys.push(object.Key);
    }

    continuationToken = response.IsTruncated
      ? response.NextContinuationToken
      : undefined;
  } while (continuationToken);

  return keys;
}

// Queries every model column above and returns the full set of keys
// that are genuinely referenced by a live database row. A key in this
// set must never be deleted, however long it has sat in the bucket.
export async function getAllReferencedR2Keys(): Promise<Set<string>> {
  const referenced = new Set<string>();

  const addAll = (rows: Array<Record<string, string | null>>, field: string) => {
    for (const row of rows) {
      const value = row[field];
      if (value) referenced.add(value);
    }
  };

  const [
    books,
    users,
    admissions,
    submissions,
    exerciseSubmissions,
    transcriptIssues,
    manuscriptRevisions,
  ] = await Promise.all([
    prisma.book.findMany({ select: { r2FileKey: true } }),
    prisma.user.findMany({ select: { avatarUrl: true } }),
    prisma.admissionApplication.findMany({
      select: {
        identityDocumentUrl: true,
        passportPictureUrl: true,
        transcriptsUrl: true,
        certificateUrl: true,
        testimonialUrl: true,
        recommendationUrl: true,
      },
    }),
    prisma.submission.findMany({ select: { fileUrl: true } }),
    prisma.exerciseSubmission.findMany({ select: { fileUrl: true } }),
    prisma.transcriptIssue.findMany({ select: { pdfUrl: true } }),
    prisma.manuscriptRevision.findMany({ select: { fileUrl: true } }),
  ]);

  addAll(books, "r2FileKey");
  addAll(users, "avatarUrl");
  for (const row of admissions) {
    for (const field of [
      "identityDocumentUrl",
      "passportPictureUrl",
      "transcriptsUrl",
      "certificateUrl",
      "testimonialUrl",
      "recommendationUrl",
    ] as const) {
      const value = row[field];
      if (value) referenced.add(value);
    }
  }
  addAll(submissions, "fileUrl");
  addAll(exerciseSubmissions, "fileUrl");
  addAll(transcriptIssues, "pdfUrl");
  addAll(manuscriptRevisions, "fileUrl");

  return referenced;
}

// Cross-references the live bucket against every legitimate database
// reference and returns the keys that exist in the bucket but are
// referenced by nothing -- true orphans, safe to purge. Never deletes
// anything itself; callers decide (see purgeOrphanFiles below), so a
// scan can always be reviewed before anything is removed.
export async function findOrphanFiles(): Promise<OrphanScanResult> {
  const [bucketKeys, referencedKeys] = await Promise.all([
    listAllR2Keys(),
    getAllReferencedR2Keys(),
  ]);

  // "public/" assets (see app/api/assets/[...key]/route.js) are brand
  // imagery served outside the DB reference model entirely -- never
  // treat them as orphans.
  const orphanKeys = bucketKeys.filter(
    (key) => !referencedKeys.has(key) && !key.startsWith("public/")
  );

  return {
    bucketObjectCount: bucketKeys.length,
    referencedKeyCount: referencedKeys.size,
    orphanKeys,
    scannedAt: new Date().toISOString(),
  };
}

export type PurgeResult = {
  attempted: number;
  deleted: string[];
  failed: Array<{ key: string; error: string }>;
};

// Actually deletes the given keys from R2. Callers should always pass
// keys that came from a fresh findOrphanFiles() scan (or, for a manual
// admin-confirmed purge, a subset of one), never an arbitrary key list
// -- this function does not itself re-verify a key is unreferenced.
export async function purgeOrphanFiles(keys: string[]): Promise<PurgeResult> {
  const result: PurgeResult = { attempted: keys.length, deleted: [], failed: [] };

  for (const key of keys) {
    try {
      await deleteFromR2(key);
      result.deleted.push(key);
    } catch (error) {
      result.failed.push({
        key,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return result;
}

/*
 * ============================================================
 * TRANSACTIONAL-SAFE DELETE WRAPPER
 * ============================================================
 *
 * Mirrors the pattern already proven in
 * app/api/admin/publishing/books/[id]/asset/route.ts (upload-then-
 * commit, clean up on failure) and generalizes it for the common
 * "delete a DB record that owns exactly one R2 object" case:
 *
 *   1. Run the DB mutation FIRST.
 *   2. Only if the DB mutation succeeds, attempt to delete the R2
 *      object.
 *   3. If the R2 delete fails, the DB mutation is NOT rolled back --
 *      deleting a database row and deleting a bucket object are two
 *      separate systems with no shared transaction, so pretending
 *      otherwise (e.g. by making a failed R2 delete undo a completed
 *      DB delete) would resurrect a record that also has to explain
 *      why it looks like it was deleted. Instead the failure is
 *      logged AND the orphaned key is captured so the same key gets
 *      caught and can be retried by the next findOrphanFiles() scan --
 *      "the corresponding cloud bucket resource is safely addressed or
 *      flagged for deletion" (the flagging path), rather than blocked
 *      indefinitely on a transient R2 outage.
 */
export async function deleteRecordWithR2Cleanup<T>(options: {
  r2Key: string | null | undefined;
  deleteRecord: () => Promise<T>;
}): Promise<{ record: T; r2CleanupSucceeded: boolean; r2CleanupError?: string }> {
  const record = await options.deleteRecord();

  if (!options.r2Key) {
    return { record, r2CleanupSucceeded: true };
  }

  try {
    await deleteFromR2(options.r2Key);
    return { record, r2CleanupSucceeded: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(
      `R2 cleanup failed for key "${options.r2Key}" after its database record was deleted. ` +
        `This key will surface as an orphan on the next scan and can be purged from there. Error: ${message}`
    );
    return { record, r2CleanupSucceeded: false, r2CleanupError: message };
  }
}

/*
 * ============================================================
 * UPLOAD VALIDATION
 * ============================================================
 */
export type UploadValidationRule = {
  allowedMimeTypes: string[];
  maxSizeBytes: number;
};

export function validateUpload(
  file: { type: string; size: number; name?: string },
  rule: UploadValidationRule
): { valid: true } | { valid: false; error: string } {
  if (!rule.allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported file type "${file.type || "unknown"}". Allowed types: ${rule.allowedMimeTypes.join(", ")}.`,
    };
  }

  if (file.size <= 0) {
    return { valid: false, error: "The uploaded file is empty." };
  }

  if (file.size > rule.maxSizeBytes) {
    const maxMB = (rule.maxSizeBytes / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File exceeds the ${maxMB}MB size limit.`,
    };
  }

  return { valid: true };
}
