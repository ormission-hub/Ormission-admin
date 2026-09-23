import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// GET: Fetch all instructors
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("instructors")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching instructors (admin):", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST: Create a new instructor
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Generate or validate slug
    let slug = body.slug ? String(body.slug).trim() : "";
    if (!slug || slug === "-" || /^-+$/.test(slug)) {
      const base = (body.name || body.name_bn || "instructor")
        .toString()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      slug = base ? `${base}-${Date.now().toString().slice(-4)}` : `inst-${Date.now()}`;
    }

    // Check if slug already exists; if so, make it unique
    const { data: existing } = await supabaseAdmin
      .from("instructors")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const payload: Record<string, any> = {
      name: body.name?.trim() || body.name_bn?.trim() || "Instructor",
      name_bn: body.name_bn?.trim() || body.name?.trim() || "শিক্ষক",
      slug,
      institution: body.institution?.trim() || "Ormission Education",
      designation: body.designation?.trim() || "শিক্ষক ও মেন্টর",
      bio: body.bio?.trim() || null,
      photo_url: body.photo_url?.trim() || null,
      credentials: body.credentials?.trim() || null,
      website_url: body.website_url?.trim() || null,
      facebook_url: body.facebook_url?.trim() || null,
      linkedin_url: body.linkedin_url?.trim() || null,
      youtube_url: body.youtube_url?.trim() || null,
      display_order: Number(body.display_order) || 1,
      is_featured: body.is_featured ?? true,
      is_published: body.is_published ?? true,
      seo_title: body.seo_title?.trim() || null,
      seo_description: body.seo_description?.trim() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (body.profile_id) {
      payload.profile_id = body.profile_id;
    }

    const { data, error } = await supabaseAdmin
      .from("instructors")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("Error creating instructor (admin):", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PUT: Update an existing instructor
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Instructor ID is required" }, { status: 400 });
    }

    if (updates.slug) {
      let slug = String(updates.slug).trim();
      if (!slug || slug === "-" || /^-+$/.test(slug)) {
        slug = `inst-${id}`;
      }
      
      const { data: existing } = await supabaseAdmin
        .from("instructors")
        .select("id")
        .eq("slug", slug)
        .neq("id", id)
        .maybeSingle();

      if (existing) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }
      updates.slug = slug;
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("instructors")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating instructor (admin):", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// DELETE: Delete an instructor (safely unlinking referencing courses first)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Instructor ID is required" }, { status: 400 });
    }

    // 1. Unlink any courses referencing this instructor
    await supabaseAdmin
      .from("courses")
      .update({ instructor_id: null })
      .eq("instructor_id", id);

    // 2. Delete the instructor record using service role
    const { error } = await supabaseAdmin
      .from("instructors")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting instructor (admin):", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
