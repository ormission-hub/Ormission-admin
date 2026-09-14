import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate mime type
    const validMimes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
    ];
    if (!validMimes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file format. Please upload JPG, PNG, WEBP or GIF.",
        },
        { status: 400 }
      );
    }

    // Limit file size (max 8MB)
    const MAX_SIZE = 8 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "File size exceeds 8MB limit." },
        { status: 400 }
      );
    }

    // Determine clean file extension
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const cleanFileName = `hero_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Ensure bucket exists or upload directly to hero_images
    const { data: uploadData, error: uploadError } =
      await supabaseAdmin.storage
        .from("hero_images")
        .upload(cleanFileName, buffer, {
          contentType: file.type,
          upsert: true,
        });

    if (uploadError) {
      console.error("Supabase Storage Upload Error:", uploadError);
      return NextResponse.json(
        { success: false, error: uploadError.message },
        { status: 500 }
      );
    }

    const { data: publicData } = supabaseAdmin.storage
      .from("hero_images")
      .getPublicUrl(cleanFileName);

    return NextResponse.json({
      success: true,
      url: publicData.publicUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server upload error";
    console.error("Upload API Error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
