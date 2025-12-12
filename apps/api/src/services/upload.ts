import { put, del } from "@vercel/blob";
import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const LOCAL_UPLOAD_DIR = process.env.LOCAL_UPLOAD_DIR || "./uploads";

// Ensure local upload directory exists
if (!IS_PRODUCTION) {
  if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
    fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
  }
}

interface UploadResult {
  url: string;
  filename: string;
  size: number;
}

/**
 * Upload a file to Vercel Blob (production) or local filesystem (development)
 */
export async function uploadFile(
  buffer: Buffer,
  originalFilename: string,
  contentType: string
): Promise<UploadResult> {
  const ext = path.extname(originalFilename);
  const filename = `${randomUUID()}${ext}`;
  const size = buffer.length;

  if (IS_PRODUCTION) {
    // Use Vercel Blob in production
    const blob = await put(filename, buffer, {
      access: "public",
      contentType,
    });

    return {
      url: blob.url,
      filename,
      size,
    };
  } else {
    // Use local filesystem in development
    const filePath = path.join(LOCAL_UPLOAD_DIR, filename);
    fs.writeFileSync(filePath, buffer);

    // Return a URL that the frontend can use
    const url = `/uploads/${filename}`;

    return {
      url,
      filename,
      size,
    };
  }
}

/**
 * Delete a file from Vercel Blob or local filesystem
 */
export async function deleteFile(url: string): Promise<void> {
  if (IS_PRODUCTION) {
    // Delete from Vercel Blob
    await del(url);
  } else {
    // Delete from local filesystem
    const filename = path.basename(url);
    const filePath = path.join(LOCAL_UPLOAD_DIR, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

/**
 * Validate that the file is an allowed image type
 */
export function validateImageFile(
  contentType: string,
  size: number
): { valid: boolean; error?: string } {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(contentType)) {
    return {
      valid: false,
      error: "Invalid file type. Allowed: JPEG, PNG, WebP, HEIC",
    };
  }

  if (size > maxSize) {
    return {
      valid: false,
      error: "File too large. Maximum size is 10MB",
    };
  }

  return { valid: true };
}
