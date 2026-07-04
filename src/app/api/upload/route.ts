import { NextResponse } from "next/server";
import { requireAdmin, errorResponse } from "@/lib/session";
import { randomUUID } from "crypto";
import { writeFile, mkdir, readdir, stat, unlink } from "fs/promises";
import path from "path";

// Configurable upload directory — set UPLOAD_DIR env var for standalone/production
// Default: <cwd>/public/uploads (works for local dev with `next dev`)
const UPLOAD_BASE = process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");

// ===== OWASP-aligned file upload hardening =====

const ALLOWED_TYPES: Record<string, { ext: string; maxSize: number; category: "image" | "video" }> = {
  "image/jpeg":  { ext: ".jpg",  maxSize: 5 * 1024 * 1024,  category: "image" },
  "image/png":   { ext: ".png",  maxSize: 5 * 1024 * 1024,  category: "image" },
  "image/webp":  { ext: ".webp", maxSize: 5 * 1024 * 1024,  category: "image" },
  "image/svg+xml": { ext: ".svg", maxSize: 5 * 1024 * 1024, category: "image" },
  "video/mp4":   { ext: ".mp4",  maxSize: 50 * 1024 * 1024, category: "video" },
  "video/webm":  { ext: ".webm", maxSize: 50 * 1024 * 1024, category: "video" },
};

// Magic bytes for file-type verification (defense-in-depth beyond MIME sniffing)
const MAGIC_BYTES: { bytes: number[]; mime: string }[] = [
  { bytes: [0xff, 0xd8, 0xff],             mime: "image/jpeg" },
  { bytes: [0x89, 0x50, 0x4e, 0x47],       mime: "image/png" },
  { bytes: [0x52, 0x49, 0x46, 0x46],       mime: "image/webp" }, // RIFF....WEBP
  { bytes: [0x3c, 0x73, 0x76, 0x67],       mime: "image/svg+xml" }, // <svg
  { bytes: [0x3c, 0x3f, 0x78, 0x6d, 0x6c], mime: "image/svg+xml" }, // <?xml (SVG variant)
  { bytes: [0x00, 0x00, 0x00],             mime: "video/mp4" },  // ftyp box (partial)
  { bytes: [0x1a, 0x45, 0xdf, 0xa3],       mime: "video/webm" }, // EBML header
];

function verifyMagicBytes(buffer: ArrayBuffer, declaredMime: string): boolean {
  const arr = new Uint8Array(buffer.slice(0, 8));
  // SVG is text-based; skip magic-byte check for it
  if (declaredMime === "image/svg+xml") return true;

  for (const sig of MAGIC_BYTES) {
    if (sig.mime !== declaredMime) continue;
    const match = sig.bytes.every((b, i) => arr[i] === b);
    if (match) return true;
  }
  return false;
}

export async function POST(req: Request) {
  // 1. Auth gate
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  // 2. Parse multipart form
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return errorResponse("فرمت درخواست نامعتبر است", 400);
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return errorResponse("فایلی ارسال نشده است", 400);
  }

  // 3. MIME type validation (server-side, not trusting the client)
  const mime = file.type;
  const allowed = ALLOWED_TYPES[mime];
  if (!allowed) {
    return errorResponse(
      `نوع فایل مجاز نیست (${mime}). فقط JPG, PNG, WebP, SVG, MP4, WebM مجازند.`,
      415
    );
  }

  // 4. Size limit enforcement (413 Payload Too Large)
  if (file.size > allowed.maxSize) {
    const maxMB = allowed.maxSize / (1024 * 1024);
    return errorResponse(
      `حجم فایل از ${maxMB} مگابایت بیشتر است`,
      413
    );
  }

  // 5. Read buffer & verify magic bytes (defense-in-depth)
  const buffer = Buffer.from(await file.arrayBuffer());
  if (!verifyMagicBytes(buffer.buffer, mime)) {
    return errorResponse("محتوای فایل با نوع اعلام‌شده مطابقت ندارد", 400);
  }

  // 6. Sanitize filename → UUID (no original name stored)
  const safeName = randomUUID() + allowed.ext;
  const subDir = allowed.category === "video" ? "videos" : "images";
  const uploadDir = path.join(UPLOAD_BASE, subDir);
  const filePath = path.join(uploadDir, safeName);

  // 7. Ensure directory exists & write file
  await mkdir(uploadDir, { recursive: true });
  await writeFile(filePath, buffer);

  // 8. Return the public URL
  const url = `/uploads/${subDir}/${safeName}`;

  return NextResponse.json({
    url,
    name: safeName,
    originalName: file.name,
    size: file.size,
    mime,
    category: allowed.category,
  });
}

// GET /api/upload — list all uploaded files (admin only)
export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const baseDir = UPLOAD_BASE;
  const files: { name: string; url: string; size: number; category: string; uploaded: number }[] = [];

  for (const sub of ["images", "videos"] as const) {
    const dir = path.join(baseDir, sub);
    try {
      const entries = await readdir(dir);
      for (const name of entries) {
        const full = path.join(dir, name);
        const s = await stat(full);
        if (s.isFile()) {
          files.push({
            name,
            url: `/uploads/${sub}/${name}`,
            size: s.size,
            category: sub === "images" ? "image" : "video",
            uploaded: s.mtimeMs,
          });
        }
      }
    } catch {
      // directory doesn't exist yet — skip
    }
  }

  files.sort((a, b) => b.uploaded - a.uploaded);
  return NextResponse.json({ files });
}

// DELETE /api/upload — delete a file by URL (admin only)
export async function DELETE(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return errorResponse("بدنه نامعتبر", 400);
  }

  const url = body?.url as string;
  if (!url || typeof url !== "string") {
    return errorResponse("آدرس فایل الزامی است", 400);
  }

  // Only allow deleting files under /uploads/ — path traversal guard
  const normalized = path.normalize(url).replace(/^(\.\.[\/\\])+/, "");
  if (!normalized.startsWith("/uploads/") || normalized.includes("..")) {
    return errorResponse("مسیر فایل نامعتبر است", 400);
  }

  const filePath = path.join(UPLOAD_BASE, normalized.replace(/^\/uploads\/?/, ""));
  try {
    await unlink(filePath);
    return NextResponse.json({ success: true });
  } catch {
    return errorResponse("فایل یافت نشد", 404);
  }
}
