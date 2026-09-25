import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, newEmail, newPassword } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "ইউজার আইডি পাওয়া যায়নি। অনুগ্রহ করে আবার লগইন করুন।" },
        { status: 400 }
      );
    }

    if (!newEmail && !newPassword) {
      return NextResponse.json(
        { success: false, error: "পরিবর্তন করার জন্য নতুন ইমেইল অথবা পাসওয়ার্ড দিন।" },
        { status: 400 }
      );
    }

    const updatePayload: {
      email?: string;
      password?: string;
      email_confirm?: boolean;
      user_metadata?: Record<string, any>;
    } = {};

    if (newEmail && typeof newEmail === "string" && newEmail.trim()) {
      const cleanEmail = newEmail.trim().toLowerCase();
      // Basic email regex
      if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
        return NextResponse.json(
          { success: false, error: "অনুগ্রহ করে একটি সঠিক ইমেইল এড্রেস লিখুন।" },
          { status: 400 }
        );
      }
      updatePayload.email = cleanEmail;
      updatePayload.email_confirm = true; // Auto confirm so admin doesn't get locked out
    }

    if (newPassword && typeof newPassword === "string" && newPassword.trim()) {
      const cleanPass = newPassword.trim();
      if (cleanPass.length < 6) {
        return NextResponse.json(
          { success: false, error: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।" },
          { status: 400 }
        );
      }
      updatePayload.password = cleanPass;
    }

    // Update via Supabase Admin API
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      updatePayload
    );

    if (updateError) {
      console.error("Error updating admin credentials:", updateError);
      return NextResponse.json(
        { success: false, error: updateError.message || "ক্রেডেনশিয়াল আপডেট করতে সমস্যা হয়েছে।" },
        { status: 500 }
      );
    }

    // Also update role in profiles to ensure admin privileges remain intact
    if (updatePayload.email) {
      await supabaseAdmin.from("profiles").upsert({
        id: userId,
        role: "admin",
        is_active: true,
        updated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: "অ্যাডমিন ক্রেডেনশিয়াল সফলভাবে আপডেট হয়েছে!",
      user: {
        id: updatedUser.user.id,
        email: updatedUser.user.email,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "সার্ভার এরর";
    console.error("Admin credentials API exception:", err);
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
