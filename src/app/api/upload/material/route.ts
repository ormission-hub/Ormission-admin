import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

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

    // File size limit (50MB)
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "ফাইলের সাইজ ৫০ মেগাবাইটের বেশি হতে পারবে না।" },
        { status: 400 }
      );
    }

    // Clean original file name
    const rawBaseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
    const cleanBaseName = rawBaseName
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "_")
      .substring(0, 40);

    const uniqueStorageKey = `materials/${Date.now()}_${cleanBaseName}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to free Supabase Storage 'course_materials' bucket
    const { data: uploadData, error: uploadError } =
      await supabaseAdmin.storage
        .from("course_materials")
        .upload(uniqueStorageKey, buffer, {
          contentType: file.type || "application/octet-stream",
          upsert: true,
        });

    if (uploadError) {
      console.error("Supabase Storage Material Upload Error:", uploadError);
      return NextResponse.json(
        { success: false, error: `স্টোরেজ আপলোড ব্যর্থ: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public CDN URL
    const { data: publicData } = supabaseAdmin.storage
      .from("course_materials")
      .getPublicUrl(uniqueStorageKey);

    return NextResponse.json({
      success: true,
      url: publicData.publicUrl,
      fileName: file.name,
      fileType: ext,
      fileSize: file.size,
      fileSizeFormatted: formatBytes(file.size),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "ফাইল আপলোড সার্ভার ত্রুটি";
    console.error("Material upload error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
