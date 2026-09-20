import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { cleanAndNormalizeVideoUrl } from "@/lib/video-helpers";

export const runtime = "nodejs";

// Helper: Sync course curriculum (sections and lessons) in Supabase
async function syncCurriculum(courseId: number | string, curriculum: any[]): Promise<{ success: boolean; sectionsCount?: number; lessonsCount?: number; error?: string }> {
  if (!Array.isArray(curriculum)) return { success: true, sectionsCount: 0, lessonsCount: 0 };

  try {
    // 1. Delete existing sections (lessons cascade-delete via foreign key)
    const { error: delErr } = await supabaseAdmin
      .from("course_sections")
      .delete()
      .eq("course_id", courseId);

    if (delErr) {
      console.error("Error deleting old sections:", delErr);
      return { success: false, error: delErr.message };
    }

    let totalLessonsCount = 0;
    let totalDurationMinutes = 0;

    // 2. Insert sections and lessons sequentially
    for (let sIdx = 0; sIdx < curriculum.length; sIdx++) {
      const sec = curriculum[sIdx];
      const { data: newSec, error: secErr } = await supabaseAdmin
        .from("course_sections")
        .insert({
          course_id: Number(courseId),
          title: sec.title || sec.titleBn || `Chapter ${sIdx + 1}`,
          title_bn: sec.titleBn || sec.title || `অধ্যায় ${sIdx + 1}`,
          sort_order: sIdx + 1,
        })
        .select()
        .single();

      if (secErr || !newSec) {
        console.error("Error inserting section:", secErr);
        return { success: false, error: `অধ্যায় '${sec.titleBn || sIdx + 1}' তৈরি ব্যর্থ: ${secErr?.message}` };
      }

      if (Array.isArray(sec.lessons) && sec.lessons.length > 0) {
        const lessonsToInsert = sec.lessons.map((les: any, lIdx: number) => {
          totalLessonsCount++;
          let durationMinutes = 0;
          if (typeof les.duration === "number") {
            durationMinutes = les.duration;
          } else if (typeof les.duration === "string") {
            const parts = les.duration.split(":");
            if (parts.length === 2) {
              durationMinutes = parseInt(parts[0], 10) || 0;
            } else {
              durationMinutes = parseInt(les.duration, 10) || 0;
            }
          } else if (les.video_duration) {
            durationMinutes = Number(les.video_duration) || 0;
          }
          totalDurationMinutes += durationMinutes;

          const primaryServerUrl = Array.isArray(les.servers) && les.servers.length > 0
            ? (les.servers[0].videoUrl || les.servers[0].video_url || "")
            : "";
          const rawPrimary = les.videoUrl || les.video_url || primaryServerUrl;
          const primaryVideoUrl = cleanAndNormalizeVideoUrl(rawPrimary);

          return {
            course_id: Number(courseId),
            section_id: newSec.id,
            title: les.title || les.titleBn || `Lesson ${lIdx + 1}`,
            title_bn: les.titleBn || les.title || `ক্লাস ${lIdx + 1}`,
            type: "video",
            video_url: primaryVideoUrl,
            video_duration: durationMinutes,
            is_preview: les.isFreePreview === true || les.is_preview === true,
            is_published: les.is_published ?? true,
            sort_order: lIdx + 1,
          };
        });

        const { data: insertedLessons, error: lesErr } = await supabaseAdmin
          .from("lessons")
          .insert(lessonsToInsert)
          .select("id, sort_order");

        if (lesErr) {
          console.error("Error inserting lessons:", lesErr);
          return { success: false, error: `ক্লাস সংরক্ষণ ব্যর্থ: ${lesErr.message}` };
        }

        // Insert lesson_servers for each lesson
        if (insertedLessons && insertedLessons.length > 0) {
          const allServersToInsert: any[] = [];

          for (let lIdx = 0; lIdx < sec.lessons.length; lIdx++) {
            const lesFormData = sec.lessons[lIdx];
            const insertedLesson = insertedLessons.find((il: any) => il.sort_order === lIdx + 1);
            if (!insertedLesson) continue;

            const servers = Array.isArray(lesFormData.servers) ? lesFormData.servers : [];

            if (servers.length > 0) {
              // Use explicit servers from admin UI
              for (const srv of servers) {
                const srvUrl = srv.videoUrl || srv.video_url;
                if (srvUrl) {
                  const rawName = (srv.serverName || srv.server_name || "").trim();
                  allServersToInsert.push({
                    lesson_id: insertedLesson.id,
                    server_name: rawName || `Server ${srv.sortOrder || srv.sort_order || 1}`,
                    server_type: srv.serverType || srv.server_type || "youtube",
                    video_url: cleanAndNormalizeVideoUrl(srvUrl),
                    is_enabled: srv.isEnabled !== false && srv.is_enabled !== false,
                    sort_order: srv.sortOrder || srv.sort_order || 1,
                  });
                }
              }
            } else if (lesFormData.videoUrl || lesFormData.video_url) {
              // Fallback: create a single server from legacy videoUrl
              allServersToInsert.push({
                lesson_id: insertedLesson.id,
                server_name: "Server 1",
                server_type: "youtube",
                video_url: cleanAndNormalizeVideoUrl(lesFormData.videoUrl || lesFormData.video_url),
                is_enabled: true,
                sort_order: 1,
              });
            }
          }

          if (allServersToInsert.length > 0) {
            const { error: srvErr } = await supabaseAdmin
              .from("lesson_servers")
              .insert(allServersToInsert);

            if (srvErr) {
              console.error("Error inserting lesson_servers:", srvErr);
              return { success: false, error: `সার্ভার সংরক্ষণ ব্যর্থ: ${srvErr.message}` };
            }
          }
        }
      }
    }

    // 3. Update course totals
    const { error: updateErr } = await supabaseAdmin
      .from("courses")
      .update({
        total_lessons: totalLessonsCount,
        total_duration: totalDurationMinutes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", courseId);

    if (updateErr) {
      console.error("Error updating course totals:", updateErr);
    }

    return {
      success: true,
      sectionsCount: curriculum.length,
      lessonsCount: totalLessonsCount,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Curriculum sync error";
    console.error("Error in syncCurriculum:", message);
    return { success: false, error: message };
  }
}

// GET: Fetch all courses OR a single course by ID with curriculum
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const featuredOnly = searchParams.get("featured") === "true";
    const status = searchParams.get("status");

    if (id) {
      const { data, error } = await supabaseAdmin
        .from("courses")
        .select(`
          *,
          categories:category_id (id, name, name_bn, slug),
          instructors:instructor_id (id, name, name_bn, institution, photo_url),
          course_sections (
            id,
            course_id,
            title,
            title_bn,
            sort_order,
            lessons (
              id,
              course_id,
              section_id,
              title,
              title_bn,
              type,
              video_url,
              video_duration,
              is_preview,
              is_published,
              sort_order,
              lesson_servers (
                id,
                server_name,
                server_type,
                video_url,
                is_enabled,
                sort_order
              )
            )
          )
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching single course (admin):", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      if (!data) {
        return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 });
      }

      // Sort sections and lessons by sort_order
      if (Array.isArray(data.course_sections)) {
        data.course_sections.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
        data.course_sections.forEach((s: any) => {
          if (Array.isArray(s.lessons)) {
            s.lessons.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
            s.lessons.forEach((les: any) => {
              if (Array.isArray(les.lesson_servers)) {
                les.lesson_servers.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
              }
            });
          }
        });
      }

      return NextResponse.json({ success: true, data });
    }

    let query = supabaseAdmin
      .from("courses")
      .select(`
        *,
        categories:category_id (id, name, name_bn, slug),
        instructors:instructor_id (id, name, name_bn, institution, photo_url),
        course_sections (
          id,
          lessons (
            id,
            is_preview
          )
        )
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
    const { curriculum, ...rest } = body;

    const incomingFeatures = (rest.features && typeof rest.features === "object") ? rest.features : {};
    const features = {
      ...incomingFeatures,
      rating: rest.rating !== undefined ? Number(rest.rating) : (incomingFeatures.rating !== undefined ? Number(incomingFeatures.rating) : 5.0),
      reviews_count: rest.reviews_count !== undefined ? Number(rest.reviews_count) : (incomingFeatures.reviews_count !== undefined ? Number(incomingFeatures.reviews_count) : 125),
      show_rating: rest.show_rating !== undefined ? Boolean(rest.show_rating) : (incomingFeatures.show_rating !== undefined ? Boolean(incomingFeatures.show_rating) : true),
    };

    const coursePayload = {
      title: rest.title || rest.title_bn,
      title_bn: rest.title_bn,
      slug: rest.slug,
      short_description: rest.short_description || "",
      description: rest.description || "",
      thumbnail_url: rest.thumbnail_url || null,
      category_id: rest.category_id ? Number(rest.category_id) : null,
      subcategory_id: rest.subcategory_id ? Number(rest.subcategory_id) : null,
      instructor_id: rest.instructor_id ? Number(rest.instructor_id) : null,
      price: Number(rest.price) || 0,
      original_price: rest.original_price ? Number(rest.original_price) : null,
      is_free: rest.is_free ?? false,
      status: rest.status || "published",
      is_featured: rest.is_featured ?? false,
      enrollment_count: Number(rest.enrollment_count) || 0,
      total_lessons: Number(rest.total_lessons) || 0,
      total_duration: Number(rest.total_duration) || 0,
      features: features,
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

    if (curriculum && Array.isArray(curriculum) && curriculum.length > 0) {
      await syncCurriculum(data.id, curriculum);
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
    const { id, categories, instructors, course_sections, curriculum, rating, reviews_count, show_rating, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Course ID is required" }, { status: 400 });
    }

    // Merge rating metadata into features JSONB column cleanly
    if (rating !== undefined || reviews_count !== undefined || show_rating !== undefined || updates.features !== undefined) {
      let mergedFeatures: Record<string, any> = {};
      if (updates.features && typeof updates.features === "object") {
        mergedFeatures = { ...updates.features };
      } else {
        const { data: existingCourse } = await supabaseAdmin
          .from("courses")
          .select("features")
          .eq("id", id)
          .maybeSingle();
        if (existingCourse?.features && typeof existingCourse.features === "object") {
          mergedFeatures = { ...existingCourse.features };
        }
      }

      if (rating !== undefined) mergedFeatures.rating = Number(rating);
      if (reviews_count !== undefined) mergedFeatures.reviews_count = Number(reviews_count);
      if (show_rating !== undefined) mergedFeatures.show_rating = Boolean(show_rating);
      updates.features = mergedFeatures;
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

    let curriculumSyncResult = null;
    if (curriculum && Array.isArray(curriculum)) {
      curriculumSyncResult = await syncCurriculum(id, curriculum);
      if (!curriculumSyncResult.success) {
        return NextResponse.json(
          { success: false, error: curriculumSyncResult.error || "কারিকুলাম সংরক্ষণ ব্যর্থ হয়েছে।" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "কোর্স ও সকল ক্লাস সফলভাবে সংরক্ষিত হয়েছে।",
      data,
      curriculumSync: curriculumSyncResult,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// DELETE: Delete a course with complete cascade cleanup of foreign keys
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Course ID is required" }, { status: 400 });
    }

    const courseId = isNaN(Number(id)) ? id : Number(id);

    // 1. Find all orders for this course
    const { data: orders } = await supabaseAdmin
      .from("orders")
      .select("id")
      .eq("course_id", courseId);

    const orderIds = (orders || []).map((o) => o.id);

    // 2. Delete payments referencing those orders
    if (orderIds.length > 0) {
      await supabaseAdmin
        .from("payments")
        .delete()
        .in("order_id", orderIds);

      // 3. Delete orders for this course
      await supabaseAdmin
        .from("orders")
        .delete()
        .eq("course_id", courseId);
    }

    // 4. Find all enrollments for this course
    const { data: enrollments } = await supabaseAdmin
      .from("enrollments")
      .select("id")
      .eq("course_id", courseId);

    const enrollmentIds = (enrollments || []).map((e) => e.id);

    // 5. Delete course progress
    if (enrollmentIds.length > 0) {
      await supabaseAdmin
        .from("course_progress")
        .delete()
        .in("enrollment_id", enrollmentIds);

      // 6. Delete enrollments
      await supabaseAdmin
        .from("enrollments")
        .delete()
        .eq("course_id", courseId);
    }

    // 7. Delete reviews
    await supabaseAdmin
      .from("reviews")
      .delete()
      .eq("course_id", courseId);

    // 8. Find all sections and lessons for this course
    const { data: sections } = await supabaseAdmin
      .from("course_sections")
      .select("id")
      .eq("course_id", courseId);

    const sectionIds = (sections || []).map((s) => s.id);

    const { data: lessons } = await supabaseAdmin
      .from("lessons")
      .select("id")
      .eq("course_id", courseId);

    const lessonIds = (lessons || []).map((l) => l.id);

    // 9. Delete lesson resources
    if (lessonIds.length > 0) {
      await supabaseAdmin
        .from("lesson_resources")
        .delete()
        .in("lesson_id", lessonIds);

      // 10. Delete lessons
      await supabaseAdmin
        .from("lessons")
        .delete()
        .eq("course_id", courseId);
    }

    // 11. Delete sections
    if (sectionIds.length > 0) {
      await supabaseAdmin
        .from("course_sections")
        .delete()
        .eq("course_id", courseId);
    }

    // 12. Delete the course itself
    const { error } = await supabaseAdmin
      .from("courses")
      .delete()
      .eq("id", courseId);

    if (error) {
      console.error("Error deleting course (admin):", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deletedId: courseId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
