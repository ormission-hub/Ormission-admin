import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// GET: Fetch all courses with category & instructor joins
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const featuredOnly = searchParams.get("featured") === "true";
    const status = searchParams.get("status");

    let query = supabaseAdmin
      .from("courses")
      .select(`
        *,
        categories:category_id (id, name, name_bn, slug),
        instructors:instructor_id (id, name, name_bn, institution, photo_url)
      `)
      .order("created_at", { ascending: false });

    if (featuredOnly) {
      query = query.eq("is_featured", true);
    }
    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching courses (admin):", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST: Create a new course
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const coursePayload = {
      title: body.title || body.title_bn,
      title_bn: body.title_bn,
      slug: body.slug,
      short_description: body.short_description || "",
      description: body.description || "",
      thumbnail_url: body.thumbnail_url || null,
      category_id: body.category_id ? Number(body.category_id) : null,
      subcategory_id: body.subcategory_id ? Number(body.subcategory_id) : null,
      instructor_id: body.instructor_id ? Number(body.instructor_id) : null,
      price: Number(body.price) || 0,
      original_price: body.original_price ? Number(body.original_price) : null,
      is_free: body.is_free ?? false,
      status: body.status || "published",
      is_featured: body.is_featured ?? false,
      enrollment_count: Number(body.enrollment_count) || 0,
      total_lessons: Number(body.total_lessons) || 0,
      total_duration: Number(body.total_duration) || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("courses")
      .insert([coursePayload])
      .select(`
        *,
        categories:category_id (id, name, name_bn, slug),
        instructors:instructor_id (id, name, name_bn, institution)
      `)
      .single();

    if (error) {
      console.error("Error creating course (admin):", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PUT: Update an existing course
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, categories, instructors, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Course ID is required" }, { status: 400 });
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("courses")
      .update(updates)
      .eq("id", id)
      .select(`
        *,
        categories:category_id (id, name, name_bn, slug),
        instructors:instructor_id (id, name, name_bn, institution)
      `)
      .single();

    if (error) {
      console.error("Error updating course (admin):", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// DELETE: Delete a course
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Course ID is required" }, { status: 400 });
    }

    // 1. Unlink any orders referencing this course
    await supabaseAdmin
      .from("orders")
      .update({ course_id: null })
      .eq("course_id", id);

    // 2. Delete enrollments referencing this course
    await supabaseAdmin
      .from("enrollments")
      .delete()
      .eq("course_id", id);

    // 3. Delete lessons referencing this course
    await supabaseAdmin
      .from("lessons")
      .delete()
      .eq("course_id", id);

    // 4. Delete the course
    const { error } = await supabaseAdmin
      .from("courses")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting course (admin):", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
