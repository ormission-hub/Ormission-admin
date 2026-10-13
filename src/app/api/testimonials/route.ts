import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// GET: Fetch all testimonials
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("testimonials")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching testimonials (admin):", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST: Create a new testimonial
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      student_name,
      student_photo,
      course_name,
      batch,
      review,
      rating,
      display_order,
      is_published,
    } = body;

    if (!student_name || typeof student_name !== "string" || !student_name.trim()) {
      return NextResponse.json(
        { success: false, error: "শিক্ষার্থীর নাম প্রদান করা আবশ্যক।" },
        { status: 400 }
      );
    }

    if (!review || typeof review !== "string" || !review.trim()) {
      return NextResponse.json(
        { success: false, error: "শিক্ষার্থীর রিভিউ বা মন্তব্য প্রদান করা আবশ্যক।" },
        { status: 400 }
      );
    }

    const payload: Record<string, any> = {
      student_name: student_name.trim(),
      student_photo: student_photo ? String(student_photo).trim() : null,
      course_name: course_name ? String(course_name).trim() : null,
      batch: batch ? String(batch).trim() : null,
      review: review.trim(),
      rating: typeof rating === "number" ? Math.min(Math.max(rating, 1), 5) : 5,
      display_order: typeof display_order === "number" ? display_order : 1,
      is_published: typeof is_published === "boolean" ? is_published : true,
    };

    const { data, error } = await supabaseAdmin
      .from("testimonials")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("Error inserting testimonial (admin):", error);
      return NextResponse.json(
        { success: false, error: `ডাটাবেজ ত্রুটি: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PUT: Update an existing testimonial
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const testimonialId = id;
    if (!testimonialId) {
      return NextResponse.json(
        { success: false, error: "টেস্টিমোনিয়াল আইডি আবশ্যক।" },
        { status: 400 }
      );
    }

    const cleanUpdates: Record<string, any> = {};
    if (updates.student_name !== undefined) cleanUpdates.student_name = String(updates.student_name).trim();
    if (updates.student_photo !== undefined) cleanUpdates.student_photo = updates.student_photo ? String(updates.student_photo).trim() : null;
    if (updates.course_name !== undefined) cleanUpdates.course_name = updates.course_name ? String(updates.course_name).trim() : null;
    if (updates.batch !== undefined) cleanUpdates.batch = updates.batch ? String(updates.batch).trim() : null;
    if (updates.review !== undefined) cleanUpdates.review = String(updates.review).trim();
    if (updates.rating !== undefined) cleanUpdates.rating = Number(updates.rating) || 5;
    if (updates.display_order !== undefined) cleanUpdates.display_order = Number(updates.display_order) || 1;
    if (updates.is_published !== undefined) cleanUpdates.is_published = Boolean(updates.is_published);

    const { data, error } = await supabaseAdmin
      .from("testimonials")
      .update(cleanUpdates)
      .eq("id", testimonialId)
      .select()
      .single();

    if (error) {
      console.error("Error updating testimonial (admin):", error);
      return NextResponse.json(
        { success: false, error: `ডাটাবেজ ত্রুটি: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// DELETE: Delete a testimonial
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Testimonial ID is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("testimonials")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting testimonial (admin):", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
