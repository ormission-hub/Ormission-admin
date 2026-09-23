import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Fetch all courses with category & instructor relations
    const { data: courses, error: coursesErr } = await supabaseAdmin
      .from("courses")
      .select(`
        id,
        title,
        title_bn,
        slug,
        thumbnail_url,
        price,
        original_price,
        is_free,
        status,
        features,
        instructor_id,
        category_id,
        categories:category_id (id, name, name_bn, slug),
        instructors:instructor_id (id, name, name_bn, institution)
      `)
      .order("created_at", { ascending: false });

    if (coursesErr) {
      console.error("Error fetching courses for enrollment report:", coursesErr);
      return NextResponse.json({ success: false, error: coursesErr.message }, { status: 500 });
    }

    // 2. Fetch all instructors for resolving multi-instructor names
    const { data: allInstructors } = await supabaseAdmin
      .from("instructors")
      .select("id, name, name_bn, institution");
    const instructorsMap = new Map((allInstructors || []).map((i) => [i.id, i]));

    // 3. Fetch all enrollments
    const { data: enrollments, error: enrollErr } = await supabaseAdmin
      .from("enrollments")
      .select("id, user_id, course_id, enrolled_at, is_active");

    if (enrollErr) {
      console.warn("Warning fetching enrollments for report:", enrollErr);
    }

    // 4. Fetch all orders (to calculate revenue & match payments)
    const { data: orders, error: ordersErr } = await supabaseAdmin
      .from("orders")
      .select("id, order_number, user_id, course_id, final_amount, status, payment_method, created_at");

    if (ordersErr) {
      console.warn("Warning fetching orders for report:", ordersErr);
    }

    // 5. Fetch all profiles and auth users to resolve student names, emails, and phone numbers
    const [profilesRes, authDataRes] = await Promise.all([
      supabaseAdmin.from("profiles").select("id, full_name, email, phone, avatar_url"),
      supabaseAdmin.auth.admin.listUsers().catch(() => ({ data: { users: [] }, error: null })),
    ]);

    const profilesMap = new Map((profilesRes.data || []).map((p) => [p.id, p]));
    const authUsers = (authDataRes as any)?.data?.users || [];
    const authMap = new Map(authUsers.map((u: any) => [u.id, u]));

    // Helper to resolve student info
    const resolveStudent = (userId: string) => {
      const prof = profilesMap.get(userId);
      const authUser = authMap.get(userId) as any;
      const meta = authUser?.user_metadata || {};

      const fullName =
        prof?.full_name ||
        meta?.full_name ||
        meta?.name ||
        authUser?.email?.split("@")[0] ||
        "অজ্ঞাত শিক্ষার্থী";

      const email = authUser?.email || prof?.email || meta?.email || "";
      const phone = prof?.phone || meta?.phone || authUser?.phone || "";

      return {
        id: userId,
        fullName,
        email,
        phone,
        avatarUrl: prof?.avatar_url || meta?.avatar_url || null,
      };
    };

    // Index orders by `${userId}_${courseId}`
    const ordersByUserCourse: Record<string, any[]> = {};
    (orders || []).forEach((ord: any) => {
      if (ord.user_id && ord.course_id != null) {
        const key = `${ord.user_id}_${ord.course_id}`;
        if (!ordersByUserCourse[key]) ordersByUserCourse[key] = [];
        ordersByUserCourse[key].push(ord);
      }
    });

    // Group enrollments by course_id
    const enrollmentsByCourse: Record<string | number, any[]> = {};
    (enrollments || []).forEach((enr: any) => {
      if (enr.course_id != null) {
        if (!enrollmentsByCourse[enr.course_id]) enrollmentsByCourse[enr.course_id] = [];
        enrollmentsByCourse[enr.course_id].push(enr);
      }
    });

    let totalGlobalEnrollments = 0;
    let totalGlobalActiveEnrollments = 0;
    let totalGlobalRevenue = 0;

    // Build enriched course report records
    const enrichedCourses = (courses || []).map((c: any) => {
      const courseEnrollments = enrollmentsByCourse[c.id] || [];
      const totalEnrolled = courseEnrollments.length;
      const activeEnrolled = courseEnrollments.filter((e) => e.is_active !== false).length;

      totalGlobalEnrollments += totalEnrolled;
      totalGlobalActiveEnrollments += activeEnrolled;

      // Resolve instructors
      let instructorNames = "";
      const rawInstIds = Array.isArray(c.features?.instructor_ids) && c.features.instructor_ids.length > 0
        ? c.features.instructor_ids
        : (c.instructor_id ? [c.instructor_id] : []);

      if (rawInstIds.length > 0) {
        instructorNames = rawInstIds
          .map((id: any) => {
            const inst = instructorsMap.get(Number(id));
            return inst ? (inst.name_bn || inst.name) : "";
          })
          .filter(Boolean)
          .join(", ");
      }
      if (!instructorNames && c.instructors) {
        const primary = Array.isArray(c.instructors) ? c.instructors[0] : c.instructors;
        if (primary) instructorNames = primary.name_bn || primary.name || "";
      }
      if (!instructorNames) instructorNames = "Ormission মেন্টর প্যানেল";

      // Category Name
      const catObj = Array.isArray(c.categories) ? c.categories[0] : c.categories;
      const categoryName = catObj ? (catObj.name_bn || catObj.name) : "সাধারণ";

      // Map enrolled students with payment/order details
      let courseRevenue = 0;
      const enrolledStudents = courseEnrollments.map((enr: any) => {
        const studentInfo = resolveStudent(enr.user_id);
        const orderList = ordersByUserCourse[`${enr.user_id}_${c.id}`] || [];
        const matchingOrder = orderList[0];

        let amountPaid = 0;
        let paymentMethod = "N/A";
        let orderStatus = "completed";
        let orderNumber = "";

        if (matchingOrder) {
          orderNumber = matchingOrder.order_number || "";
          paymentMethod = matchingOrder.payment_method || "Online";
          orderStatus = matchingOrder.status || "completed";
          if (matchingOrder.status === "completed" || matchingOrder.status === "approved" || matchingOrder.status === "paid") {
            amountPaid = Number(matchingOrder.final_amount) || 0;
          } else {
            amountPaid = Number(c.price) || 0;
          }
        } else {
          // If no explicit order row, use course price if not free
          amountPaid = c.is_free ? 0 : (Number(c.price) || 0);
          paymentMethod = c.is_free ? "বিনামূল্যে (Free)" : "অফলাইন/সিস্টেম";
        }

        courseRevenue += amountPaid;

        return {
          id: enr.id,
          userId: enr.user_id,
          name: studentInfo.fullName,
          email: studentInfo.email,
          phone: studentInfo.phone,
          avatarUrl: studentInfo.avatarUrl,
          enrolledAt: enr.enrolled_at || new Date().toISOString(),
          isActive: enr.is_active !== false,
          amountPaid,
          paymentMethod,
          orderStatus,
          orderNumber,
        };
      });

      // Sort enrolled students by enrolledAt descending
      enrolledStudents.sort(
        (a: any, b: any) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime()
      );

      totalGlobalRevenue += courseRevenue;

      return {
        id: c.id,
        title: c.title || c.title_bn || "Course",
        title_bn: c.title_bn || c.title || "কোর্স",
        slug: c.slug,
        thumbnail_url: c.thumbnail_url || "",
        category_name: categoryName,
        category_id: c.category_id,
        instructor_names: instructorNames,
        price: Number(c.price) || 0,
        original_price: Number(c.original_price) || 0,
        is_free: Boolean(c.is_free || Number(c.price) === 0),
        status: c.status || "published",
        total_enrolled: totalEnrolled,
        active_enrolled: activeEnrolled,
        total_revenue: courseRevenue,
        enrolled_students: enrolledStudents,
      };
    });

    // Sort courses by total_enrolled descending (top courses first)
    enrichedCourses.sort((a, b) => b.total_enrolled - a.total_enrolled);

    const topCourse = enrichedCourses[0]
      ? {
          id: enrichedCourses[0].id,
          title_bn: enrichedCourses[0].title_bn,
          total_enrolled: enrichedCourses[0].total_enrolled,
          total_revenue: enrichedCourses[0].total_revenue,
        }
      : null;

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalCourses: enrichedCourses.length,
          totalEnrollments: totalGlobalEnrollments,
          totalActiveEnrollments: totalGlobalActiveEnrollments,
          totalRevenue: totalGlobalRevenue,
          topCourse,
          generatedAt: new Date().toISOString(),
        },
        courses: enrichedCourses,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    console.error("Exception in enrollment report route:", err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
