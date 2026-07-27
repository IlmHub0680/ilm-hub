export async function getR2PresignedUrl(key: string, expiresInSeconds: number = 60) {
  return `https://${process.env.R2_BUCKET_NAME || 'storage'}.r2.cloudflarestorage.com/${key}?expires=${expiresInSeconds}`;
}
