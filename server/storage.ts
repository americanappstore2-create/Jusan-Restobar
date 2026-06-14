import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

function getS3Client() {
  return new S3Client({
    region: "auto",
    endpoint: process.env.AWS_ENDPOINT_URL,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
    },
    forcePathStyle: false,
  });
}

function getBucket() {
  const bucket = process.env.AWS_S3_BUCKET;
  if (!bucket) throw new Error("AWS_S3_BUCKET is not configured");
  return bucket;
}

function getPublicUrl(key: string): string {
  const publicUrl = process.env.S3_PUBLIC_URL;
  if (publicUrl) return `${publicUrl.replace(/\/$/, "")}/${key}`;
  const endpoint = process.env.AWS_ENDPOINT_URL;
  const bucket = getBucket();
  if (endpoint) return `${endpoint.replace(/\/$/, "")}/${bucket}/${key}`;
  return `https://${bucket}.s3.amazonaws.com/${key}`;
}

function appendHashSuffix(relKey: string): string {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const s3 = getS3Client();
  const bucket = getBucket();
  const key = appendHashSuffix(normalizeKey(relKey));
  console.log(`[Storage] Uploading bucket=${bucket} key=${key}`);
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: data instanceof Buffer ? data : Buffer.from(data as any),
      ContentType: contentType,
    })
  );
  const url = getPublicUrl(key);
  console.log(`[Storage] Success: ${url}`);
  return { key, url };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  return { key, url: getPublicUrl(key) };
}

export async function storageGetSignedUrl(relKey: string): Promise<string> {
  return getPublicUrl(normalizeKey(relKey));
}