import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export interface SupportTicket {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
  category: "payment" | "course_access" | "player" | "account" | "other";
  subject: string;
  message: string;
  order_number?: string;
  course_title?: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "normal" | "high" | "urgent";
  created_at: string;
  updated_at: string;
  replies: Array<{
    id: string;
    sender: "student" | "admin";
    sender_name: string;
    message: string;
    created_at: string;
  }>;
}

// GET: Admin fetch all tickets with optional filtering
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const query = searchParams.get("q")?.toLowerCase();

    const { data: records, error } = await supabaseAdmin
      .from("site_settings")
      .select("*")
      .like("key", "ticket_%")
      .order("updated_at", { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    let tickets: SupportTicket[] = (records || [])
      .map((r) => r.value as SupportTicket)
      .filter(Boolean);

    // Status filter
    if (status && status !== "all") {
      tickets = tickets.filter((t) => t.status === status);
    }

    // Category filter
    if (category && category !== "all") {
      tickets = tickets.filter((t) => t.category === category);
    }

    // Search query
    if (query) {
      tickets = tickets.filter(
        (t) =>
          t.id.toLowerCase().includes(query) ||
          t.subject.toLowerCase().includes(query) ||
          t.user_name?.toLowerCase().includes(query) ||
          t.user_email?.toLowerCase().includes(query) ||
          t.user_phone?.includes(query) ||
          t.order_number?.toLowerCase().includes(query)
      );
    }

    // Sort by updated_at descending
    tickets.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    return NextResponse.json({ success: true, data: tickets });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "টিকিট লোড ব্যর্থ হয়েছে";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// PATCH: Update ticket status or priority
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { ticketId, status, priority } = body;

    if (!ticketId) {
      return NextResponse.json({ success: false, error: "টিকিট আইডি আবশ্যক।" }, { status: 400 });
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

    if (status) ticket.status = status;
    if (priority) ticket.priority = priority;
    ticket.updated_at = now;

    const { error: updateErr } = await supabaseAdmin.from("site_settings").upsert({
      key: storageKey,
      value: ticket,
      updated_at: now,
    });

    if (updateErr) {
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, ticket });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "আপডেট ব্যর্থ হয়েছে";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
