import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3_URL_CONST } from "./s3-url-const";
import { env } from "@/shared/infrastructure/env";

// 2h
const DEFAULT_EXPIRES_IN_SECONDS = 7200;

export const s3Client = new S3Client({
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
  region: env.AWS_REGION,
});

export async function uploadObject(file: Buffer, key: string) {
  const command = new PutObjectCommand({
    Bucket: env.AWS_BUCKET,
    Key: key,
    Body: file,
  });
  return await s3Client.send(command);
}

export async function getObject(key: string) {
  const command = new GetObjectCommand({
    Bucket: env.AWS_BUCKET,
    Key: key,
    ResponseExpires: new Date(Date.now() + DEFAULT_EXPIRES_IN_SECONDS * 1000),
  });
  return await s3Client.send(command);
}

export async function deleteObject(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: env.AWS_BUCKET,
    Key: key,
  });
  return await s3Client.send(command);
}

export async function createPresignedUrl(key: string) {
  const command = new PutObjectCommand({
    Bucket: env.AWS_BUCKET,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, {
    expiresIn: DEFAULT_EXPIRES_IN_SECONDS,
  });
}

export async function getPresignedUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: env.AWS_BUCKET,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, {
    expiresIn: DEFAULT_EXPIRES_IN_SECONDS,
  });
}

export async function saveQRCodeToS3(base64Image: string, paymentId: string) {
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

  const imageBuffer = Buffer.from(base64Data, "base64");

  const command = new PutObjectCommand({
    Bucket: env.AWS_BUCKET,
    Key: `pix/qrcodes/${paymentId}.png`,
    Body: imageBuffer,
    ContentType: "image/png",
  });

  await s3Client.send(command);

  return `${S3_URL_CONST}pix/qrcodes/${paymentId}.png`;
}

function getMenuItemPhotoKey(itemId: string, photoId: string, ext: string) {
  return `menu/items/${itemId}/photos/${photoId}.${ext}`;
}

export async function uploadMenuItemPhoto(
  itemId: string,
  photoId: string,
  file: Buffer,
  contentType: string,
  ext: string
): Promise<{ publicUrl: string; presignedUrl: string }> {
  const key = getMenuItemPhotoKey(itemId, photoId, ext);
  const command = new PutObjectCommand({
    Bucket: env.AWS_BUCKET,
    Key: key,
    Body: file,
    ContentType: contentType,
  });
  await s3Client.send(command);
  const publicUrl = `${S3_URL_CONST}${key}`;
  const presignedUrl = await getSignedUrl(
    s3Client,
    new PutObjectCommand({
      Bucket: env.AWS_BUCKET,
      Key: key,
    }),
    { expiresIn: DEFAULT_EXPIRES_IN_SECONDS }
  );
  return { publicUrl, presignedUrl };
}

export async function deleteMenuItemPhoto(
  itemId: string,
  photoId: string,
  ext: string
) {
  const key = getMenuItemPhotoKey(itemId, photoId, ext);
  const command = new DeleteObjectCommand({
    Bucket: env.AWS_BUCKET,
    Key: key,
  });
  await s3Client.send(command);
}

export async function getMenuItemPhotoPresignedUrl(
  itemId: string,
  photoId: string,
  ext: string
) {
  const key = getMenuItemPhotoKey(itemId, photoId, ext);
  return await getSignedUrl(
    s3Client,
    new PutObjectCommand({
      Bucket: env.AWS_BUCKET,
      Key: key,
    }),
    { expiresIn: DEFAULT_EXPIRES_IN_SECONDS }
  );
}
