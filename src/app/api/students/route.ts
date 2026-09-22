import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET: Fetch all registered students with full metadata, profile, orders, and enrollments
export async function GET() {
  try {
    // 1. Fetch all Auth Users (contains email, phone, user_metadata with address, timestamps)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) {
      console.error("Error listing auth users in admin:", authError);
      return NextResponse.json({ success: false, error: authError.message }, { status: 500 });
    }

    const authUsers = authData?.users || [];

    // 2. Fetch profiles from database
    const { data: profiles, error: profError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profError) {
      console.warn("Warning fetching profiles:", profError);
    }

    const profilesMap = new Map((profiles || []).map((p) => [p.id, p]));

    // 3. Fetch enrollments with course details
    const { data: enrollments, error: enrollError } = await supabaseAdmin
      .from("enrollments")
      .select(`
        id,
        user_id,
        course_id,
        enrolled_at,
        is_active,
        courses:course_id (id, title, title_bn, slug)
      `);

    if (enrollError) {
      console.warn("Warning fetching enrollments:", enrollError);
    }

    const enrollmentsByUser: Record<string, any[]> = {};
    (enrollments || []).forEach((enr) => {
      if (enr.user_id) {
        if (!enrollmentsByUser[enr.user_id]) enrollmentsByUser[enr.user_id] = [];
        enrollmentsByUser[enr.user_id].push(enr);
      }
    });

    // 4. Fetch orders with course details
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from("orders")
      .select(`
        id,
        order_number,
        user_id,
        course_id,
        final_amount,
        status,
        payment_method,
        created_at,
        courses:course_id (id, title, title_bn, slug)
      `)
      .order("created_at", { ascending: false });

    if (ordersError) {
      console.warn("Warning fetching orders:", ordersError);
    }

    const ordersByUser: Record<string, any[]> = {};
    (orders || []).forEach((ord) => {
      if (ord.user_id) {
        if (!ordersByUser[ord.user_id]) ordersByUser[ord.user_id] = [];
        ordersByUser[ord.user_id].push(ord);
      }
    });

    // 5. Merge all sources into a unified student record
    // We iterate over authUsers, and also include any profile that might not have matching authUser
    const userIdsSeen = new Set<string>();
    const students: any[] = [];

    for (const u of authUsers) {
      userIdsSeen.add(u.id);
      const prof = profilesMap.get(u.id);
      const meta = u.user_metadata || {};

      students.push({
        id: u.id,
        full_name: prof?.full_name || meta.full_name || meta.name || u.email?.split("@")[0] || "অজ্ঞাত শিক্ষার্থী",
        email: u.email || "",
        phone: meta.phone || prof?.phone || u.phone || "",
        address: meta.address || meta.district || "",
        academic_level: meta.academic_level || meta.target || "",
        avatar_url: prof?.avatar_url || meta.avatar_url || null,
        role: prof?.role || "student",
        is_active: prof?.is_active !== undefined ? prof.is_active : true,
        email_verified: Boolean(u.email_confirmed_at || meta.email_verified),
        created_at: u.created_at || prof?.created_at || new Date().toISOString(),
        last_sign_in_at: u.last_sign_in_at || null,
        enrollments: enrollmentsByUser[u.id] || [],
        orders: ordersByUser[u.id] || [],
        enrollments_count: (enrollmentsByUser[u.id] || []).length,
        orders_count: (ordersByUser[u.id] || []).length,
      });
    }

    // Add any profile that wasn't in authUsers
    for (const [pId, prof] of profilesMap.entries()) {
      if (!userIdsSeen.has(pId)) {
        students.push({
          id: prof.id,
          full_name: prof.full_name || "অজ্ঞাত শিক্ষার্থী",
          email: "",
          phone: prof.phone || "",
          address: "",
          academic_level: "",
          avatar_url: prof.avatar_url || null,
          role: prof.role || "student",
          is_active: prof.is_active !== undefined ? prof.is_active : true,
          email_verified: false,
          created_at: prof.created_at || new Date().toISOString(),
          last_sign_in_at: null,
          enrollments: enrollmentsByUser[prof.id] || [],
          orders: ordersByUser[prof.id] || [],
          enrollments_count: (enrollmentsByUser[prof.id] || []).length,
          orders_count: (ordersByUser[prof.id] || []).length,
        });
      }
    }

    // Sort by creation date descending
    students.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({ success: true, data: students });
  } catch (err: any) {
    console.error("Error in GET /api/students:", err);
    return NextResponse.json({ success: false, error: err?.message || "Internal Server Error" }, { status: 500 });
  }
}

// PATCH: Toggle student status (active / suspended)
export async function PATCH(req: Request) {
  try {
    const { id, is_active } = await req.json();
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing student ID" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("profiles")
      .upsert({ id, is_active: Boolean(is_active), updated_at: new Date().toISOString() }, { onConflict: "id" });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, is_active: Boolean(is_active) });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Internal Server Error" }, { status: 500 });
  }
}
