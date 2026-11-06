import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "./env";

// 15 minutes TTL in seconds (900 seconds)
export const PRESIGNED_URL_TTL_SECONDS = 15 * 60;

export const isR2Configured = Boolean(
  env.R2_ACCOUNT_ID &&
    !env.R2_ACCOUNT_ID.includes("dummy") &&
    env.R2_ACCESS_KEY_ID &&
    !env.R2_ACCESS_KEY_ID.includes("dummy") &&
    env.R2_SECRET_ACCESS_KEY &&
    !env.R2_SECRET_ACCESS_KEY.includes("dummy")
);

const globalForR2 = globalThis as unknown as {
  r2Client: S3Client | undefined;
};

export const r2Client =
  globalForR2.r2Client ??
  new S3Client({
    region: "auto",
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForR2.r2Client = r2Client;
}

export interface PresignedUrlOptions {
  fileKey: string;
  filename: string;
  disposition: "inline" | "attachment";
  expiresIn?: number;
}

/**
 * Generates a short-lived presigned URL directly from Cloudflare R2
 * Enforces zero-egress cost and avoids proxying binary data through serverless functions.
 */
export async function generateR2PresignedUrl({
  fileKey,
  filename,
  disposition,
  expiresIn = PRESIGNED_URL_TTL_SECONDS,
}: PresignedUrlOptions): Promise<string> {
  const sanitizedFilename = filename.replace(/["\\]/g, "_");
  const contentDisposition = `${disposition}; filename="${sanitizedFilename}"`;

  // If live credentials are not provided (development / preview), generate compliant pre-signed R2 mockup URL
  if (!isR2Configured) {
    const base = env.R2_PUBLIC_URL || `https://${env.R2_BUCKET_NAME}.${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
    const params = new URLSearchParams({
      "response-content-disposition": contentDisposition,
      "response-content-type": "application/pdf",
      "X-Amz-Expires": String(expiresIn),
      "X-Amz-Date": new Date().toISOString().replace(/[:-]|\.\d{3}/g, ""),
      "X-Amz-Signature": "dummy_prism_signature",
    });
    return `${base}/${encodeURIComponent(fileKey)}?${params.toString()}`;
  }

  const command = new GetObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: fileKey,
    ResponseContentDisposition: contentDisposition,
    ResponseContentType: "application/pdf",
  });

  return getSignedUrl(r2Client, command, { expiresIn });
}

export default r2Client;
