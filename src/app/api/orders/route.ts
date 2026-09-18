import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// GET: Fetch all orders with student, course, and payment details
export async function GET() {
  try {
    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select(`
        *,
        courses:course_id (id, title, title_bn, slug, price)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders in admin:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Fetch matching profiles for user_ids safely
    const userIds = Array.from(
      new Set((orders || []).map((o) => o.user_id).filter(Boolean))
    );
    let profilesMap: Record<string, { full_name?: string; phone?: string }> = {};

    if (userIds.length > 0) {
      try {
        const { data: profiles } = await supabaseAdmin
          .from("profiles")
          .select("id, full_name, phone")
          .in("id", userIds);

        if (profiles) {
          profilesMap = Object.fromEntries(profiles.map((p) => [p.id, p]));
        }
      } catch (profErr) {
        console.warn("Profiles fetch warning:", profErr);
      }
    }

    // Format and parse notes
    const formattedOrders = (orders || []).map((ord) => {
      let parsedNotes: any = {};
      try {
        if (ord.notes && ord.notes.startsWith("{")) {
          parsedNotes = JSON.parse(ord.notes);
        } else if (ord.notes) {
          const senderMatch = ord.notes.match(/Sender:\s*([^|]+)/);
          const trxMatch = ord.notes.match(/TrxID:\s*([^|]+)/);
          if (senderMatch) parsedNotes.sender_number = senderMatch[1].trim();
          if (trxMatch) parsedNotes.transaction_id = trxMatch[1].trim();
        }
      } catch {
        // ignore
      }

      const profile = profilesMap[ord.user_id] || null;

      const orderNumber =
        ord.order_number ||
        parsedNotes.order_number ||
        `ORM-${ord.id.slice(0, 6).toUpperCase()}`;

      const senderNumber =
        parsedNotes.sender_number ||
        profile?.phone ||
        "";

      const transactionId =
        parsedNotes.transaction_id ||
        "";

      return {
        id: ord.id,
        order_number: orderNumber,
        user_id: ord.user_id,
        course_id: ord.course_id,
        total_amount: Number(ord.original_amount || ord.final_amount || 0),
        paid_amount: Number(ord.final_amount || ord.paid_amount || 0),
        discount_amount: Number(ord.discount_amount || 0),
        status: ord.status,
        payment_method: ord.payment_method || parsedNotes.payment_method || "bKash",
        sender_number: senderNumber,
        transaction_id: transactionId,
        student_name: profile?.full_name || parsedNotes.student_name || "শিক্ষার্থী",
        student_phone: profile?.phone || parsedNotes.student_phone || senderNumber,
        student_email: parsedNotes.student_email || "",
        created_at: ord.created_at,
        profiles: profile,
        courses: ord.courses,
      };
    });

    return NextResponse.json({ success: true, data: formattedOrders });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    console.error("Admin orders GET error:", err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// PATCH: Update order status (e.g. manual verify & approve or reject)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "অর্ডার আইডি ও স্ট্যাটাস আবশ্যক।" },
        { status: 400 }
      );
    }

    // Map status for orders table
    // Allowed values: 'pending', 'paid', 'failed', 'cancelled', 'refunded'
    let orderDbStatus = status;
    if (status === "completed") orderDbStatus = "paid";

    const { error: orderErr } = await supabaseAdmin
      .from("orders")
      .update({
        status: orderDbStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (orderErr) {
      console.error("Error updating order status:", orderErr);
      return NextResponse.json({ success: false, error: orderErr.message }, { status: 500 });
    }

    // Fetch order details to manage enrollment
    const { data: currentOrder } = await supabaseAdmin
      .from("orders")
      .select("id, user_id, course_id, status")
      .eq("id", id)
      .single();

    // Synchronize student enrollment in enrollments table
    if (currentOrder?.user_id && currentOrder?.course_id) {
      if (orderDbStatus === "paid") {
        try {
          const { data: existingEnrollment } = await supabaseAdmin
            .from("enrollments")
            .select("id")
            .eq("user_id", currentOrder.user_id)
            .eq("course_id", currentOrder.course_id)
            .maybeSingle();

          if (existingEnrollment) {
            await supabaseAdmin
              .from("enrollments")
              .update({
                is_active: true,
                order_id: id,
                enrolled_at: new Date().toISOString(),
              })
              .eq("id", existingEnrollment.id);
          } else {
            await supabaseAdmin.from("enrollments").insert({
              user_id: currentOrder.user_id,
              course_id: currentOrder.course_id,
              order_id: id,
              is_active: true,
              enrolled_at: new Date().toISOString(),
            });
          }
        } catch (enrErr) {
          console.warn("Enrollment activation warning:", enrErr);
        }
      } else if (["failed", "cancelled", "refunded"].includes(orderDbStatus)) {
        try {
          await supabaseAdmin
            .from("enrollments")
            .update({ is_active: false })
            .eq("user_id", currentOrder.user_id)
            .eq("course_id", currentOrder.course_id);
        } catch (enrErr) {
          console.warn("Enrollment deactivation warning:", enrErr);
        }
      }
    }

    // Update matching payments record
    try {
      const paymentStatus =
        orderDbStatus === "paid"
          ? "success"
          : orderDbStatus === "failed" || orderDbStatus === "cancelled"
          ? "failed"
          : "pending";

      await supabaseAdmin
        .from("payments")
        .update({
          status: paymentStatus,
          paid_at: orderDbStatus === "paid" ? new Date().toISOString() : null,
        })
        .eq("order_id", id);
    } catch (payErr) {
      console.warn("Payment status update warning:", payErr);
    }

    return NextResponse.json({ success: true, status: orderDbStatus });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    console.error("Admin orders PATCH error:", err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
