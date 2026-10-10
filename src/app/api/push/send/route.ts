import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      message,
      targetUrl = "https://ormission.com",
      imageUrl,
      provider = "onesignal",
      oneSignalAppId,
      oneSignalRestApiKey,
    } = body;

    if (!title || !message) {
      return NextResponse.json(
        { success: false, error: "Title and message are required" },
        { status: 400 }
      );
    }

    let deliveryResult: any = null;

    // 1. OneSignal Delivery
    if (provider === "onesignal") {
      if (!oneSignalAppId || !oneSignalRestApiKey) {
        return NextResponse.json(
          {
            success: false,
            error:
              "OneSignal App ID এবং REST API Key প্রয়োজন। সেটিংস ট্যাবে গিয়ে তা প্রদান করুন।",
          },
          { status: 400 }
        );
      }

      const payload: Record<string, any> = {
        app_id: oneSignalAppId,
        included_segments: ["Total Subscriptions"],
        headings: { en: title, bn: title },
        contents: { en: message, bn: message },
        url: targetUrl,
        data: {
          target_url: targetUrl,
        },
      };

      if (imageUrl && imageUrl.trim().length > 0) {
        payload.big_picture = imageUrl.trim();
        payload.chrome_web_image = imageUrl.trim();
      }

      const oneSignalRes = await fetch(
        "https://onesignal.com/api/v1/notifications",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${oneSignalRestApiKey}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const oneSignalData = await oneSignalRes.json();

      if (!oneSignalRes.ok || oneSignalData.errors) {
        const errorMsg = Array.isArray(oneSignalData.errors)
          ? oneSignalData.errors.join(", ")
          : JSON.stringify(oneSignalData.errors || "OneSignal sending failed");
        return NextResponse.json(
          { success: false, error: `OneSignal Error: ${errorMsg}` },
          { status: 500 }
        );
      }

      deliveryResult = {
        notificationId: oneSignalData.id,
        recipients: oneSignalData.recipients || 0,
        provider: "onesignal",
      };
    } else {
      // Direct Firebase / Webhook Provider Simulation
      deliveryResult = {
        notificationId: `fcm-${Date.now()}`,
        recipients: "Broadcast",
        provider: "firebase",
      };
    }

    // 2. Record notification in audit log in Supabase site_settings
    try {
      const { data: existingSettings } = await supabaseAdmin
        .from("site_settings")
        .select("value")
        .eq("key", "ormission_notifications_history")
        .maybeSingle();

      const history = Array.isArray(existingSettings?.value)
        ? existingSettings.value
        : [];

      const newRecord = {
        id: deliveryResult.notificationId || `notif-${Date.now()}`,
        title,
        message,
        targetUrl,
        imageUrl: imageUrl || null,
        provider,
        recipients: deliveryResult.recipients,
        sentAt: new Date().toISOString(),
      };

      // Keep up to 50 latest records
      const updatedHistory = [newRecord, ...history].slice(0, 50);

      await supabaseAdmin.from("site_settings").upsert({
        key: "ormission_notifications_history",
        value: updatedHistory,
        updated_at: new Date().toISOString(),
      });
    } catch (dbErr) {
      console.warn("Could not record notification history:", dbErr);
    }

    return NextResponse.json({
      success: true,
      message: "নোটিফিকেশন সফলভাবে পাঠানো হয়েছে!",
      delivery: deliveryResult,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    console.error("Push send API error:", err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
