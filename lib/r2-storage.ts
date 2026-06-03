import { createHash, createHmac } from "node:crypto";

type R2UploadInput = {
  body: Blob;
  contentType: string;
  key: string;
};

const R2_REGION = "auto";
const R2_SERVICE = "s3";
const EMPTY_BODY_SHA256 = hashHex("");

function hashHex(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

function hmac(key: string | Buffer, value: string) {
  return createHmac("sha256", key).update(value).digest();
}

function hmacHex(key: Buffer, value: string) {
  return createHmac("sha256", key).update(value).digest("hex");
}

function encodeObjectKey(key: string) {
  return key.split("/").map(encodeURIComponent).join("/");
}

function getR2Config() {
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  const bucket = process.env.CLOUDFLARE_R2_BUCKET ?? process.env.NEXT_PUBLIC_R2_BUCKET;
  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
    throw new Error("Cloudflare R2 environment is not configured.");
  }

  return {
    accessKeyId,
    bucket,
    endpointHost: `${accountId}.r2.cloudflarestorage.com`,
    publicUrl: publicUrl.replace(/\/+$/, ""),
    secretAccessKey,
  };
}

function getSigningKey(secretAccessKey: string, dateStamp: string) {
  const dateKey = hmac(`AWS4${secretAccessKey}`, dateStamp);
  const regionKey = hmac(dateKey, R2_REGION);
  const serviceKey = hmac(regionKey, R2_SERVICE);
  return hmac(serviceKey, "aws4_request");
}

function buildSignedHeaders(input: {
  contentSha256: string;
  contentType?: string;
  method: "DELETE" | "PUT";
  objectKey: string;
}) {
  const { accessKeyId, bucket, endpointHost, secretAccessKey } = getR2Config();
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const canonicalUri = `/${bucket}/${encodeObjectKey(input.objectKey)}`;
  const credentialScope = `${dateStamp}/${R2_REGION}/${R2_SERVICE}/aws4_request`;
  const headers: Record<string, string> = {
    host: endpointHost,
    "x-amz-content-sha256": input.contentSha256,
    "x-amz-date": amzDate,
  };

  if (input.contentType) {
    headers["content-type"] = input.contentType;
  }

  const sortedHeaderKeys = Object.keys(headers).sort();
  const canonicalHeaders = sortedHeaderKeys
    .map((key) => `${key}:${headers[key]}`)
    .join("\n");
  const signedHeaders = sortedHeaderKeys.join(";");
  const canonicalRequest = [
    input.method,
    canonicalUri,
    "",
    `${canonicalHeaders}\n`,
    signedHeaders,
    input.contentSha256,
  ].join("\n");
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    hashHex(canonicalRequest),
  ].join("\n");
  const signature = hmacHex(getSigningKey(secretAccessKey, dateStamp), stringToSign);

  return {
    authorization: `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    headers,
  };
}

function publicUrlForObject(key: string) {
  const { publicUrl } = getR2Config();
  return `${publicUrl}/${encodeObjectKey(key)}`;
}

export function getR2ObjectKey(url: string) {
  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL?.replace(/\/+$/, "");

  if (!publicUrl) {
    return "";
  }

  const normalizedPublicUrl = `${publicUrl}/`;

  if (!url.startsWith(normalizedPublicUrl)) {
    return "";
  }

  return decodeURIComponent(url.slice(normalizedPublicUrl.length));
}

export async function uploadR2Object({ body, contentType, key }: R2UploadInput) {
  const { bucket, endpointHost } = getR2Config();
  const bytes = Buffer.from(await body.arrayBuffer());
  const contentSha256 = hashHex(bytes);
  const { authorization, headers } = buildSignedHeaders({
    contentSha256,
    contentType,
    method: "PUT",
    objectKey: key,
  });
  const response = await fetch(
    `https://${endpointHost}/${bucket}/${encodeObjectKey(key)}`,
    {
      body: bytes,
      headers: {
        Authorization: authorization,
        "Content-Type": contentType,
        "x-amz-content-sha256": headers["x-amz-content-sha256"],
        "x-amz-date": headers["x-amz-date"],
      },
      method: "PUT",
    },
  );

  if (!response.ok) {
    throw new Error(await response.text() || `R2 upload failed with ${response.status}.`);
  }

  return publicUrlForObject(key);
}

export async function deleteR2Object(url: string) {
  const key = getR2ObjectKey(url);

  if (!key) {
    return;
  }

  const { bucket, endpointHost } = getR2Config();
  const { authorization, headers } = buildSignedHeaders({
    contentSha256: EMPTY_BODY_SHA256,
    method: "DELETE",
    objectKey: key,
  });
  const response = await fetch(
    `https://${endpointHost}/${bucket}/${encodeObjectKey(key)}`,
    {
      headers: {
        Authorization: authorization,
        "x-amz-content-sha256": headers["x-amz-content-sha256"],
        "x-amz-date": headers["x-amz-date"],
      },
      method: "DELETE",
    },
  );

  if (!response.ok && response.status !== 404) {
    throw new Error(await response.text() || `R2 delete failed with ${response.status}.`);
  }
}
