// Standalone CLI companion to lib/r2FileLifecycle.ts's findOrphanFiles()
// / purgeOrphanFiles() -- same logic, reimplemented here in plain .mjs
// because a script run with `node scripts/*.mjs` (see package.json)
// cannot import a TypeScript path-aliased module directly. Keep the
// "which DB columns are real R2 keys vs admin-typed URLs" list in sync
// with lib/r2FileLifecycle.ts's own comment if either changes.
//
// Usage:
//   node scripts/r2-orphan-scan.mjs            -- report only, deletes nothing
//   node scripts/r2-orphan-scan.mjs --purge     -- also deletes the orphans found
import "dotenv/config";
import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import prisma from "../lib/prisma.js";

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

function getBucket() {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) throw new Error("R2_BUCKET_NAME is missing.");
  return bucket;
}

async function listAllR2Keys(client, bucket) {
  const keys = [];
  let continuationToken;

  do {
    const response = await client.send(
      new ListObjectsV2Command({ Bucket: bucket, ContinuationToken: continuationToken })
    );
    for (const object of response.Contents ?? []) {
      if (object.Key) keys.push(object.Key);
    }
    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);

  return keys;
}

async function getAllReferencedR2Keys() {
  const referenced = new Set();

  const [books, users, admissions, submissions, exerciseSubmissions, transcriptIssues, manuscriptRevisions] =
    await Promise.all([
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

  for (const b of books) if (b.r2FileKey) referenced.add(b.r2FileKey);
  for (const u of users) if (u.avatarUrl) referenced.add(u.avatarUrl);
  for (const a of admissions) {
    for (const field of [
      "identityDocumentUrl",
      "passportPictureUrl",
      "transcriptsUrl",
      "certificateUrl",
      "testimonialUrl",
      "recommendationUrl",
    ]) {
      if (a[field]) referenced.add(a[field]);
    }
  }
  for (const s of submissions) if (s.fileUrl) referenced.add(s.fileUrl);
  for (const e of exerciseSubmissions) if (e.fileUrl) referenced.add(e.fileUrl);
  for (const t of transcriptIssues) if (t.pdfUrl) referenced.add(t.pdfUrl);
  for (const m of manuscriptRevisions) if (m.fileUrl) referenced.add(m.fileUrl);

  return referenced;
}

const shouldPurge = process.argv.includes("--purge");

try {
  const client = getR2Client();
  const bucket = getBucket();

  console.log("Listing bucket objects...");
  const bucketKeys = await listAllR2Keys(client, bucket);

  console.log("Querying database for referenced keys...");
  const referencedKeys = await getAllReferencedR2Keys();

  const orphanKeys = bucketKeys.filter(
    (key) => !referencedKeys.has(key) && !key.startsWith("public/")
  );

  console.log(`\nBucket objects: ${bucketKeys.length}`);
  console.log(`Referenced keys: ${referencedKeys.size}`);
  console.log(`Orphan files found: ${orphanKeys.length}\n`);

  for (const key of orphanKeys) {
    console.log(`  ORPHAN: ${key}`);
  }

  if (!shouldPurge) {
    console.log("\nReport only -- pass --purge to delete these files.");
  } else if (orphanKeys.length > 0) {
    console.log("\nPurging orphan files...");
    for (const key of orphanKeys) {
      try {
        await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
        console.log(`  deleted: ${key}`);
      } catch (error) {
        console.error(`  FAILED to delete ${key}:`, error);
      }
    }
  }
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
