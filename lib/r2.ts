import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import {
  getSignedUrl,
} from "@aws-sdk/s3-request-presigner";

function getR2Client() {
  const accountId =
    process.env.R2_ACCOUNT_ID;

  const accessKeyId =
    process.env.R2_ACCESS_KEY_ID;

  const secretAccessKey =
    process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId) {
    throw new Error(
      "R2_ACCOUNT_ID is missing."
    );
  }

  if (!accessKeyId) {
    throw new Error(
      "R2_ACCESS_KEY_ID is missing."
    );
  }

  if (!secretAccessKey) {
    throw new Error(
      "R2_SECRET_ACCESS_KEY is missing."
    );
  }

  return new S3Client({
    region: "auto",

    endpoint:
      `https://${accountId}.r2.cloudflarestorage.com`,

    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

function getBucket() {
  const bucket =
    process.env.R2_BUCKET_NAME;

  if (!bucket) {
    throw new Error(
      "R2_BUCKET_NAME is missing."
    );
  }

  return bucket;
}

export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string
) {
  const cleanKey = key.trim();

  if (!cleanKey) {
    throw new Error(
      "R2 file key is missing."
    );
  }

  const client = getR2Client();

  const command = new PutObjectCommand({
    Bucket: getBucket(),
    Key: cleanKey,
    Body: body,
    ContentType: contentType,
  });

  await client.send(command);

  return cleanKey;
}

export async function deleteFromR2(
  key: string
) {
  const cleanKey = key.trim();

  if (!cleanKey) {
    return;
  }

  const client = getR2Client();

  const command = new DeleteObjectCommand({
    Bucket: getBucket(),
    Key: cleanKey,
  });

  await client.send(command);
}

export async function getR2PresignedUrl(
  key: string,
  expiresInSeconds: number = 60
) {
  const cleanKey =
    key.trim();

  if (!cleanKey) {
    throw new Error(
      "R2 file key is missing."
    );
  }

  const client =
    getR2Client();

  const command =
    new GetObjectCommand({
      Bucket: getBucket(),
      Key: cleanKey,
    });

  return getSignedUrl(
    client,
    command,
    {
      expiresIn:
        expiresInSeconds,
    }
  );
}
