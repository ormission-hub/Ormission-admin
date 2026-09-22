import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// GET: Fetch all resources
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("resources")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching resources (admin):", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST: Create a new resource
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.title_bn && !body.title) {
      return NextResponse.json(
        { success: false, error: "রিসোর্সের নাম আবশ্যক" },
        { status: 400 }
      );
    }
    if (!body.file_url) {
      return NextResponse.json(
        { success: false, error: "ফাইল ডাউনলোড লিংক আবশ্যক" },
        { status: 400 }
      );
    }

    const payload = {
      title: body.title || body.title_bn,
      title_bn: body.title_bn || body.title,
      description: body.description || "",
      category: body.category || "General",
      subject: body.subject || "",
      file_type: body.file_type || "PDF",
      file_url: body.file_url,
      thumbnail_url: body.thumbnail_url || null,
      download_count: Number(body.download_count || 0),
      display_order: Number(body.display_order || 0),
      is_published: body.is_published !== undefined ? Boolean(body.is_published) : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("resources")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("Error creating resource (admin):", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PUT / PATCH: Update an existing resource
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const id = body.id;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Resource ID is required" },
        { status: 400 }
      );
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.title !== undefined) updates.title = body.title;
    if (body.title_bn !== undefined) updates.title_bn = body.title_bn;
    if (body.description !== undefined) updates.description = body.description;
    if (body.category !== undefined) updates.category = body.category;
    if (body.subject !== undefined) updates.subject = body.subject;
    if (body.file_type !== undefined) updates.file_type = body.file_type;
    if (body.file_url !== undefined) updates.file_url = body.file_url;
    if (body.thumbnail_url !== undefined) updates.thumbnail_url = body.thumbnail_url;
    if (body.download_count !== undefined) updates.download_count = Number(body.download_count);
    if (body.display_order !== undefined) updates.display_order = Number(body.display_order);
    if (body.is_published !== undefined) updates.is_published = Boolean(body.is_published);

    const { data, error } = await supabaseAdmin
      .from("resources")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating resource (admin):", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// DELETE: Delete a resource
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Resource ID is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("resources")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting resource (admin):", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
