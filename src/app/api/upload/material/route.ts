import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Allowed extensions for educational resources and study materials
const ALLOWED_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "ppt",
  "pptx",
  "xls",
  "xlsx",
  "zip",
  "rar",
  "txt",
  "png",
  "jpg",
  "jpeg",
  "webp",
];

function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "কোনো ফাইল নির্বাচন করা হয়নি" },
        { status: 400 }
      );
    }

    // Determine extension
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        {
          success: false,
          error: `অননুমোদিত ফাইল ফরম্যাট (.${ext})। অনুগ্রহ করে PDF, Word, PowerPoint, Excel, ZIP বা ইমেজ ফাইল আপলোড করুন।`,
        },
        { status: 400 }
      );
    }

    // File size limit (Catbox allows up to 200MB free per file)
    const MAX_SIZE = 200 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "ফাইলের সাইজ ২০০ মেগাবাইটের বেশি হতে পারবে না।" },
        { status: 400 }
      );
    }

    // Upload directly to 100% Free Cloud Storage (Catbox.moe)
    // ZERO bytes stored in Supabase -> 100% Supabase free tier preserved!
    const catboxForm = new FormData();
    catboxForm.append("reqtype", "fileupload");

    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: file.type || "application/octet-stream" });
    catboxForm.append("fileToUpload", blob, file.name);

    const catboxResponse = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: catboxForm,
    });

    const responseText = await catboxResponse.text();
    const cdnUrl = responseText.trim();

    if (!catboxResponse.ok || !cdnUrl.startsWith("http")) {
      console.error("Catbox Free Upload Error:", cdnUrl);
      return NextResponse.json(
        {
          success: false,
          error: `ফ্রি ক্লাউড স্টোরেজে আপলোড ব্যর্থ হয়েছে: ${cdnUrl || "নেটওয়ার্ক ত্রুটি"}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: cdnUrl,
      fileName: file.name,
      fileType: ext,
      fileSize: file.size,
      fileSizeFormatted: formatBytes(file.size),
      storageProvider: "catbox_free",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "ফাইল আপলোড সার্ভার ত্রুটি";
    console.error("Material upload error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
