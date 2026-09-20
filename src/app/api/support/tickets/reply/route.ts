import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { SupportTicket } from "../route";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ticketId, senderName, message, status } = body;

    if (!ticketId || !message?.trim()) {
      return NextResponse.json(
        { success: false, error: "টিকিট আইডি ও রিপ্লাই বার্তা আবশ্যক।" },
        { status: 400 }
      );
    }

    const storageKey = `ticket_${ticketId}`;
    const { data: record, error: fetchErr } = await supabaseAdmin
      .from("site_settings")
      .select("*")
      .eq("key", storageKey)
      .maybeSingle();

    if (fetchErr || !record?.value) {
      return NextResponse.json({ success: false, error: "টিকিট পাওয়া যায়নি।" }, { status: 404 });
    }

    const ticket = record.value as SupportTicket;
    const now = new Date().toISOString();

    const newReply = {
      id: `msg_${Date.now()}`,
      sender: "admin" as const,
      sender_name: senderName || "Ormission সাপোর্ট টিম (অ্যাডমিন)",
      message: message.trim(),
      created_at: now,
    };

    if (!Array.isArray(ticket.replies)) {
      ticket.replies = [];
    }
    ticket.replies.push(newReply);
    ticket.updated_at = now;

    if (status) {
      ticket.status = status;
    } else if (ticket.status === "open") {
      ticket.status = "in_progress";
    }

    const { error: saveErr } = await supabaseAdmin.from("site_settings").upsert({
      key: storageKey,
      value: ticket,
      updated_at: now,
    });

    if (saveErr) {
      return NextResponse.json({ success: false, error: saveErr.message }, { status: 500 });
    }

    // Send in-app notification to student
    if (ticket.user_id) {
      try {
        await supabaseAdmin.from("notifications").insert({
          user_id: ticket.user_id,
          type: "support_reply",
          title: `সাপোর্ট টিকিট #${ticket.id}-এ অ্যাডমিন উত্তর দিয়েছেন`,
          body: `${newReply.sender_name}: "${message.slice(0, 50)}..."`,
          link: `/dashboard/support`,
          is_read: false,
        });
      } catch {}
    }

    return NextResponse.json({ success: true, ticket, reply: newReply });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "রিপ্লাই প্রক্রিয়া করতে সমস্যা হয়েছে";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
