import { supabase } from "./client";

// ==========================================
// Types
// ==========================================

export interface DbLessonServer {
  id?: number | string;
  lesson_id?: number | string;
  server_name: string;
  server_type: string;
  video_url: string;
  is_enabled: boolean;
  sort_order: number;
}

export interface DbLesson {
  id: number | string;
  course_id?: number | string;
  section_id?: number | string;
  title: string;
  title_bn: string;
  type?: string;
  video_url?: string;
  video_duration?: number;
  content?: string;
  is_preview: boolean;
  is_published?: boolean;
  sort_order: number;
  lesson_servers?: DbLessonServer[];
}

export interface DbCourseSection {
  id: number | string;
  course_id?: number | string;
  title: string;
  title_bn: string;
  sort_order: number;
  lessons?: DbLesson[];
}

export interface DbCourse {
  id: number | string;
  slug: string;
  title: string;
  title_bn: string;
  short_description?: string;
  description?: string;
  thumbnail_url?: string;
  category_id?: number | null;
  subcategory_id?: number | null;
  instructor_id?: number | null;
  instructor_ids?: number[];
  price: number;
  original_price?: number;
  is_free: boolean;
  status: "draft" | "published" | "unpublished" | "archived";
  enrollment_count: number;
  total_lessons: number;
  total_duration: number;
  is_featured: boolean;
  features?: {
    rating?: number;
    reviews_count?: number;
    show_rating?: boolean;
    [key: string]: any;
  } | null;
  rating?: number;
  reviews_count?: number;
  show_rating?: boolean;
  categories?: { id?: number; name: string; name_bn: string; slug: string } | null;
  instructors?: { id?: number; name: string; name_bn: string; institution: string; photo_url?: string } | null;
  course_sections?: DbCourseSection[];
  created_at?: string;
}

export interface DbCategory {
  id: number;
  name: string;
  name_bn: string;
  slug: string;
  description?: string;
  icon_name?: string | null;
  image_url?: string | null;
  display_order: number;
  is_published: boolean;
  subcategories?: DbSubcategory[];
  created_at?: string;
}

export interface DbSubcategory {
  id: number;
  category_id: number;
  name: string;
  name_bn: string;
  slug: string;
  description?: string;
  display_order: number;
  is_published: boolean;
}

export interface DbInstructor {
  id: number;
  name: string;
  name_bn: string;
  slug: string;
  designation?: string;
  institution?: string;
  bio?: string;
  photo_url?: string;
  credentials?: string;
  display_order?: number;
  is_featured: boolean;
  is_published: boolean;
}

export interface DbStudent {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  academic_level?: string;
  avatar_url?: string | null;
  role: string;
  is_active: boolean;
  email_verified?: boolean;
  created_at: string;
  last_sign_in_at?: string | null;
  college?: string;
  target?: string;
  enrollments_count?: number;
  orders_count?: number;
  enrollments?: Array<{
    id: string | number;
    course_id: number;
    enrolled_at?: string;
    is_active?: boolean;
    courses?: { id: number; title: string; title_bn: string; slug: string } | null;
  }>;
  orders?: Array<{
    id: string;
    order_number: string;
    course_id?: number;
    final_amount: number;
    status: string;
    payment_method?: string;
    created_at: string;
    courses?: { id: number; title: string; title_bn: string; slug: string } | null;
  }>;
}

export interface DbOrder {
  id: string;
  order_number: string;
  user_id?: string;
  course_id?: number;
  total_amount: number;
  paid_amount: number;
  discount_amount: number;
  status: "pending" | "paid" | "processing" | "completed" | "failed" | "cancelled" | "refunded";
  payment_method?: string;
  sender_number?: string;
  transaction_id?: string;
  student_name?: string;
  student_phone?: string;
  student_email?: string;
  created_at: string;
  profiles?: { full_name: string; phone: string } | null;
  courses?: { title: string; title_bn: string } | null;
}

export interface DbResource {
  id: number;
  title: string;
  title_bn?: string;
  description?: string;
  category?: string;
  subject?: string;
  file_type?: string;
  file_url: string;
  thumbnail_url?: string;
  download_count: number;
  is_published: boolean;
  created_at?: string;
}

export interface DbBlogPost {
  id: number;
  title: string;
  title_bn?: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  status: "draft" | "published" | "unpublished";
  published_at?: string;
  created_at?: string;
}

export interface DbTestimonial {
  id: number;
  student_name: string;
  student_photo?: string | null;
  course_name?: string | null;
  batch?: string | null;
  review: string;
  rating: number;
  display_order: number;
  is_published: boolean;
  created_at?: string;
}

export interface DbSiteSetting {
  key: string;
  value: any;
  updated_at: string;
}

// ==========================================
// Database Service Methods
// ==========================================

export const dbService = {
  // ---- COURSES ----
  async getCourses(): Promise<DbCourse[]> {
    try {
      const res = await fetch("/api/courses", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch {
      // fallback to direct client below
    }

    try {
      const { data, error } = await supabase
        .from("courses")
        .select(`
          *,
          categories:category_id (name, name_bn, slug),
          instructors:instructor_id (name, name_bn, institution)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error("Error fetching courses from Supabase:", e);
      return [];
    }
  },

  async getCourseById(id: number | string): Promise<DbCourse | null> {
    try {
      const res = await fetch(`/api/courses?id=${id}`, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch {
      // fallback
    }

    try {
      const { data, error } = await supabase
        .from("courses")
        .select(`
          *,
          categories:category_id (name, name_bn, slug),
          instructors:instructor_id (name, name_bn, institution),
          course_sections (
            id,
            course_id,
            title,
            title_bn,
            section_type,
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

      if (error) throw error;
      return data;
    } catch (e) {
      console.error("Error fetching course by id from Supabase:", e);
      return null;
    }
  },

  async saveCourseCurriculum(
    courseId: number | string,
    curriculum: any[]
  ): Promise<boolean> {
    try {
      const res = await fetch("/api/courses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: courseId, curriculum }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return true;
      }
    } catch (e) {
      console.error("Error saving curriculum via API:", e);
    }
    return false;
  },

  async createCourse(courseData: Partial<DbCourse>): Promise<DbCourse | null> {
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseData),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch {
      // fallback
    }

    try {
      const { data, error } = await supabase
        .from("courses")
        .insert([courseData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (e) {
      console.error("Error creating course in Supabase:", e);
      return null;
    }
  },

  async updateCourse(id: number | string, updates: Partial<DbCourse>): Promise<boolean> {
    try {
      const res = await fetch("/api/courses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return true;
      }
    } catch {
      // fallback
    }

    try {
      const { error } = await supabase
        .from("courses")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      return true;
    } catch (e) {
      console.error("Error updating course in Supabase:", e);
      return false;
    }
  },

  async deleteCourse(id: number | string): Promise<boolean> {
    try {
      const res = await fetch(`/api/courses?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (res.ok && json.success) return true;
      console.error("Failed to delete course:", json?.error);
      return false;
    } catch (e) {
      console.error("Error deleting course in API:", e);
      return false;
    }
  },

  // ---- CATEGORIES ----
  async getCategories(): Promise<DbCategory[]> {
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch {
      // fallback to direct client below
    }

    try {
      const { data, error } = await supabase
        .from("categories")
        .select(`
          *,
          subcategories (*)
        `)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error("Error fetching categories from Supabase:", e);
      return [];
    }
  },

  async createCategory(categoryData: Partial<DbCategory>): Promise<DbCategory | null> {
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData),
      });
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
      throw new Error(json.error || "Failed to create category");
    } catch (e) {
      console.error("Error creating category via API, trying direct:", e);
      try {
        const { data, error } = await supabase
          .from("categories")
          .insert([categoryData])
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.error("Direct fallback failed:", err);
        return null;
      }
    }
  },

  async updateCategory(id: number | string, updates: Partial<DbCategory>): Promise<boolean> {
    try {
      const res = await fetch("/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
      const json = await res.json();
      if (json.success) return true;
      throw new Error(json.error || "Failed to update category");
    } catch (e) {
      console.error("Error updating category via API, trying direct:", e);
      try {
        const { error } = await supabase
          .from("categories")
          .update(updates)
          .eq("id", id);

        if (error) throw error;
        return true;
      } catch (err) {
        console.error("Direct fallback failed:", err);
        return false;
      }
    }
  },

  async deleteCategory(id: number | string): Promise<boolean> {
    try {
      const res = await fetch(`/api/categories?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) return true;
      throw new Error(json.error || "Failed to delete category");
    } catch (e) {
      console.error("Error deleting category via API, trying direct:", e);
      try {
        const { error } = await supabase
          .from("categories")
          .delete()
          .eq("id", id);

        if (error) throw error;
        return true;
      } catch (err) {
        console.error("Direct fallback failed:", err);
        return false;
      }
    }
  },

  // ---- INSTRUCTORS ----
  async getInstructors(): Promise<DbInstructor[]> {
    try {
      const res = await fetch("/api/instructors", { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }
      // Fallback directly to client supabase if API is unreachable
      const { data, error } = await supabase
        .from("instructors")
        .select("*")
        .order("display_order", { ascending: true })
        .order("id", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error("Error fetching instructors:", e);
      try {
        const { data } = await supabase
          .from("instructors")
          .select("*")
          .order("display_order", { ascending: true })
          .order("id", { ascending: true });
        return data || [];
      } catch {
        return [];
      }
    }
  },

  async createInstructor(instructorData: Partial<DbInstructor>): Promise<DbInstructor | null> {
    try {
      const res = await fetch("/api/instructors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(instructorData),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error || "Failed to create instructor");
      }
      return json.data;
    } catch (e) {
      console.error("Error creating instructor in Supabase:", e);
      throw e;
    }
  },

  async updateInstructor(id: number, updates: Partial<DbInstructor>): Promise<DbInstructor | null> {
    try {
      const res = await fetch("/api/instructors", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error || "Failed to update instructor");
      }
      return json.data;
    } catch (e) {
      console.error("Error updating instructor in Supabase:", e);
      throw e;
    }
  },

  async deleteInstructor(id: number | string): Promise<boolean> {
    try {
      const res = await fetch(`/api/instructors?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (res.ok && json.success) return true;
      console.error("Failed to delete instructor:", json?.error);
      return false;
    } catch (e) {
      console.error("Error deleting instructor via API:", e);
      return false;
    }
  },

  // ---- STUDENTS (PROFILES & AUTH USERS) ----
  async getStudents(): Promise<DbStudent[]> {
    try {
      const res = await fetch("/api/students", { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }

      // Fallback directly to supabase profiles if API not reachable
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error("Error fetching students:", e);
      return [];
    }
  },

  async toggleStudentStatus(id: string, currentStatus: boolean): Promise<boolean> {
    try {
      const res = await fetch("/api/students", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: !currentStatus }),
      });
      const json = await res.json();
      if (json.success) return true;

      const { error } = await supabase
        .from("profiles")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      return true;
    } catch (e) {
      console.error("Error toggling student status:", e);
      return false;
    }
  },

  // ---- ORDERS ----
  async getOrders(): Promise<DbOrder[]> {
    try {
      const res = await fetch("/api/orders", { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }

      // Fallback directly to supabase if API not reachable
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          profiles:user_id (full_name, phone),
          courses:course_id (title, title_bn)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error("Error fetching orders from Supabase:", e);
      return [];
    }
  },

  async updateOrderStatus(id: string, status: DbOrder["status"]): Promise<boolean> {
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const json = await res.json();
      if (json.success) return true;

      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      return true;
    } catch (e) {
      console.error("Error updating order status:", e);
      return false;
    }
  },

  // ---- RESOURCES ----
  async getResources(): Promise<DbResource[]> {
    try {
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .order("id", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error("Error fetching resources from Supabase:", e);
      return [];
    }
  },

  async createResource(resData: Partial<DbResource>): Promise<DbResource | null> {
    try {
      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resData),
      });
      const json = await res.json();
      if (res.ok && json.success) return json.data;

      const { data, error } = await supabase
        .from("resources")
        .insert([resData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (e) {
      console.error("Error creating resource in Supabase:", e);
      return null;
    }
  },

  async updateResource(id: number | string, resData: Partial<DbResource>): Promise<DbResource | null> {
    try {
      const res = await fetch("/api/resources", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...resData }),
      });
      const json = await res.json();
      if (res.ok && json.success) return json.data;

      const { data, error } = await supabase
        .from("resources")
        .update(resData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (e) {
      console.error("Error updating resource in Supabase:", e);
      return null;
    }
  },

  async toggleResourcePublished(id: number | string, isPublished: boolean): Promise<boolean> {
    const updated = await this.updateResource(id, { is_published: isPublished });
    return !!updated;
  },

  async deleteResource(id: number | string): Promise<boolean> {
    try {
      const res = await fetch(`/api/resources?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (res.ok && json.success) return true;
      console.error("Failed to delete resource:", json?.error);
      return false;
    } catch (e) {
      console.error("Error deleting resource via API:", e);
      return false;
    }
  },

  // ---- BLOG POSTS ----
  async getBlogPosts(): Promise<DbBlogPost[]> {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error("Error fetching blog posts from Supabase:", e);
      return [];
    }
  },

  async createBlogPost(postData: Partial<DbBlogPost>): Promise<DbBlogPost | null> {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .insert([postData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (e) {
      console.error("Error creating blog post:", e);
      return null;
    }
  },

  async deleteBlogPost(id: number | string): Promise<boolean> {
    try {
      const res = await fetch(`/api/blog?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (res.ok && json.success) return true;
      console.error("Failed to delete blog post:", json?.error);
      return false;
    } catch (e) {
      console.error("Error deleting blog post via API:", e);
      return false;
    }
  },

  // ---- TESTIMONIALS ----
  async getTestimonials(): Promise<DbTestimonial[]> {
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("id", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error("Error fetching testimonials from Supabase:", e);
      return [];
    }
  },

  async toggleTestimonialApproval(id: number | string, currentApproved: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("testimonials")
        .update({ is_published: !currentApproved })
        .eq("id", id);

      if (error) throw error;
      return true;
    } catch (e) {
      console.error("Error toggling testimonial approval:", e);
      return false;
    }
  },

  async createTestimonial(data: Partial<DbTestimonial>): Promise<DbTestimonial | null> {
    try {
      const { data: created, error } = await supabase
        .from("testimonials")
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return created;
    } catch (e) {
      console.error("Error creating testimonial in Supabase:", e);
      return null;
    }
  },

  async updateTestimonial(id: number | string, updates: Partial<DbTestimonial>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("testimonials")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      return true;
    } catch (e) {
      console.error("Error updating testimonial in Supabase:", e);
      return false;
    }
  },

  async deleteTestimonial(id: number | string): Promise<boolean> {
    try {
      const res = await fetch(`/api/testimonials?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (res.ok && json.success) return true;
      console.error("Failed to delete testimonial:", json?.error);
      return false;
    } catch (e) {
      console.error("Error deleting testimonial via API:", e);
      return false;
    }
  },

  // ---- SITE SETTINGS ----
  async getSiteSettings(): Promise<Record<string, any>> {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*");

      if (error) throw error;
      const settingsMap: Record<string, any> = {};
      data?.forEach((s) => {
        settingsMap[s.key] = s.value;
      });
      return settingsMap;
    } catch (e) {
      console.error("Error fetching site settings from Supabase:", e);
      return {};
    }
  },

  async updateSiteSetting(key: string, value: any): Promise<boolean> {
    try {
      // First try via secure server API (bypasses RLS with supabaseAdmin)
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) return true;
      }

      // Fallback to direct client call if running on server or offline
      const { error } = await supabase
        .from("site_settings")
        .upsert({ key, value, updated_at: new Date().toISOString() });

      if (error) throw error;
      return true;
    } catch (e) {
      console.error("Error updating site setting in Supabase:", e);
      return false;
    }
  },

  async getHeroSettings(): Promise<any> {
    try {
      // Try fetching via server API
      try {
        const res = await fetch("/api/settings?key=hero_settings");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.value) {
            return data.value;
          }
        }
      } catch {
        // Continue to direct Supabase query
      }

      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "hero_settings")
        .single();

      if (error) throw error;
      return data?.value || null;
    } catch (e) {
      console.error("Error fetching hero settings:", e);
      return null;
    }
  },

  async updateHeroSettings(value: any): Promise<boolean> {
    return this.updateSiteSetting("hero_settings", value);
  },

  // ---- DASHBOARD KPIS & STATS ----
  async getDashboardKPIs() {
    try {
      const [coursesRes, studentsRes, allOrders] = await Promise.all([
        supabase
          .from("courses")
          .select("id, title, title_bn, status, enrollment_count, price, category_id, categories:category_id(id, name, name_bn)", { count: "exact" }),
        supabase
          .from("profiles")
          .select("id, is_active, created_at", { count: "exact" }),
        this.getOrders(),
      ]);

      const totalCourses = coursesRes.count ?? (coursesRes.data?.length || 0);
      const totalStudents = studentsRes.count ?? (studentsRes.data?.length || 0);
      const totalOrders = allOrders.length;

      const completedOrders = allOrders.filter(
        (o) => o.status === "completed" || o.status === "paid"
      );
      const totalRevenue = completedOrders.reduce(
        (sum, o) => sum + (Number(o.paid_amount || o.total_amount) || 0),
        0
      );

      // Recent 8 orders with joined student & course info
      const recentOrders = allOrders.slice(0, 8);

      return {
        totalRevenue,
        totalStudents,
        totalCourses,
        totalOrders,
        recentOrders,
        allOrders,
        courses: coursesRes.data || [],
        profiles: studentsRes.data || [],
      };
    } catch (e) {
      console.error("Error calculating dashboard KPIs:", e);
      return {
        totalRevenue: 0,
        totalStudents: 0,
        totalCourses: 0,
        totalOrders: 0,
        recentOrders: [],
        allOrders: [],
        courses: [],
        profiles: [],
      };
    }
  },

  // ---- ONE-CLICK DATABASE SEEDER ----
  async seedBaselineData(): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Seed Categories
      const categoriesData = [
        { name: "Engineering & Tech", name_bn: "ইঞ্জিনিয়ারিং ও প্রযুক্তি", slug: "engineering-tech", description: "বুয়েট, ইঞ্জিনিয়ারিং ভর্তি প্রস্তুতি ও সফটওয়্যার স্কিলস", display_order: 1, is_published: true },
        { name: "Medical & Dental", name_bn: "মেডিকেল ও ডেন্টাল", slug: "medical-prep", description: "মেডিকেল ভর্তি প্রস্তুতি, জীববিজ্ঞান ও প্রশ্নব্যাংক সমাধান", display_order: 2, is_published: true },
        { name: "HSC Academic", name_bn: "এইচএসসি একাডেমিক", slug: "hsc-academic", description: "এইচএসসি পদার্থ, রসায়ন, উচ্চতর গণিত ও জীববিজ্ঞান সম্পূর্ণ সিলেবাস", display_order: 3, is_published: true },
        { name: "University Admission", name_bn: "বিশ্ববিদ্যালয় ভর্তি", slug: "university-admission", description: "ঢাকা বিশ্ববিদ্যালয় 'ক' ইউনিট ও গুচ্ছ বিজ্ঞান ভর্তি সহায়ক কোর্স", display_order: 4, is_published: true },
      ];

      const { data: catRows, error: catError } = await supabase
        .from("categories")
        .upsert(categoriesData, { onConflict: "slug" })
        .select();

      if (catError) console.warn("Cat upsert notice:", catError.message);

      // 2. Seed Instructors
      const instructorsData = [
        { name: "Dr. Rafiqul Islam", name_bn: "ড. মো. রফিকুল ইসলাম", slug: "dr-rafiqul-islam", designation: "সিনিয়র লেকচারার", institution: "বুয়েট (BUET)", bio: "বুয়েট থেকে পিএইচডি। বিগত ১২ বছর ধরে ভর্তি পরীক্ষার্থীদের পদার্থবিজ্ঞান পড়াচ্ছেন।", photo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80", is_featured: true, is_published: true },
        { name: "Dr. Sayeda Nusrat", name_bn: "ডা. সৈয়দা নুসরাত জাহান", slug: "dr-sayeda-nusrat", designation: "কনসালট্যান্ট", institution: "ঢাকা মেডিকেল কলেজ (DMC)", bio: "ডিএমসি থেকে এমবিবিএস। বিগত ৮ বছর ধরে মেডিকেল ভর্তি পরীক্ষার্থীদের জীববিজ্ঞান মেন্টর।", photo_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80", is_featured: true, is_published: true },
        { name: "Tanvir Ahmed", name_bn: "তানভীর আহমেদ", slug: "tanvir-ahmed", designation: "গণিত বিভাগীয় প্রধান", institution: "ঢাকা বিশ্ববিদ্যালয় (DU)", bio: "গণিতে প্রথম শ্রেণিতে প্রথম। উচ্চতর গণিতের শর্টকাট টেকনিক ও কনসেপ্ট মাস্টার।", photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80", is_featured: true, is_published: true },
      ];

      const { data: instRows, error: instError } = await supabase
        .from("instructors")
        .upsert(instructorsData, { onConflict: "slug" })
        .select();

      if (instError) console.warn("Instructor upsert notice:", instError.message);

      const catMap = (catRows || []).reduce((acc: any, c: any) => ({ ...acc, [c.slug]: c.id }), {});
      const instMap = (instRows || []).reduce((acc: any, i: any) => ({ ...acc, [i.slug]: i.id }), {});

      // 3. Seed Courses
      const coursesData = [
        {
          slug: "buet-engineering-physics-mastery",
          title: "BUET & Engineering Physics Complete Concept & Problem Solving",
          title_bn: "বুয়েট ও ইঞ্জিনিয়ারিং পদার্থবিজ্ঞান স্পেশাল কনসেপ্ট ব্যাচ",
          short_description: "বুয়েট, রুয়েট, কুয়েট ও চুয়েট ভর্তি পরীক্ষার পূর্ণাঙ্গ পদার্থবিজ্ঞান প্রস্তুতি।",
          price: 3850,
          original_price: 5500,
          thumbnail_url: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&q=80",
          category_id: catMap["engineering-tech"] || null,
          instructor_id: instMap["dr-rafiqul-islam"] || null,
          status: "published",
          enrollment_count: 1420,
          total_lessons: 48,
          total_duration: 3600,
          is_featured: true,
        },
        {
          slug: "medical-biology-question-bank-solve",
          title: "Medical Biology 100% Concept & 20-Year Question Bank Solve",
          title_bn: "মেডিকেল জীববিজ্ঞান সম্পূর্ণ কনসেপ্ট ও ২০ বছরের প্রশ্নব্যাংক সলভ",
          short_description: "বোটানি ও জুলজির প্রতিটি অধ্যায়ের পুঙ্খানুপুঙ্খ ব্যাখ্যা ও মেডিকেল স্ট্যান্ডার্ড প্রশ্নব্যাংক।",
          price: 3200,
          original_price: 4500,
          thumbnail_url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80",
          category_id: catMap["medical-prep"] || null,
          instructor_id: instMap["dr-sayeda-nusrat"] || null,
          status: "published",
          enrollment_count: 1890,
          total_lessons: 56,
          total_duration: 4200,
          is_featured: true,
        },
        {
          slug: "hsc-higher-math-complete-mastery",
          title: "HSC Higher Math 1st & 2nd Paper Complete Formula & Board Solving",
          title_bn: "এইচএসসি উচ্চতর গণিত ১ম ও ২য় পত্র পূর্ণাঙ্গ প্রস্তুতি",
          short_description: "বোর্ড পরীক্ষা ও ভর্তি পরীক্ষার সেরা প্রস্তুতির জন্য ক্যালকুলাস, ত্রিকোণমিতি ও স্থিতিবিদ্যা।",
          price: 3450,
          original_price: 4800,
          thumbnail_url: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80",
          category_id: catMap["hsc-academic"] || null,
          instructor_id: instMap["tanvir-ahmed"] || null,
          status: "published",
          enrollment_count: 980,
          total_lessons: 64,
          total_duration: 4800,
          is_featured: true,
        }
      ];

      const { error: courseError } = await supabase
        .from("courses")
        .upsert(coursesData, { onConflict: "slug" });

      if (courseError) console.warn("Course upsert notice:", courseError.message);

      // 4. Seed Sample Resources
      const resourcesData = [
        {
          title: "HSC Physics Formula Sheet 2026",
          title_bn: "এইচএসসি পদার্থবিজ্ঞান সম্পূর্ণ সূত্র ও শর্টকাট শিট",
          slug: "hsc-physics-formula-sheet",
          file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          file_size: "3.8 MB",
          file_format: "PDF",
          download_count: 4320,
          is_free: true,
          is_published: true,
        },
        {
          title: "Medical Biology Botanical Terms Mindmap",
          title_bn: "মেডিকেল জীববিজ্ঞান উদ্ভিদবিজ্ঞান গুরুত্বপূর্ণ টার্মস মাইন্ডম্যাপ",
          slug: "medical-biology-mindmap",
          file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          file_size: "2.4 MB",
          file_format: "PDF",
          download_count: 2890,
          is_free: true,
          is_published: true,
        }
      ];

      await supabase.from("resources").upsert(resourcesData, { onConflict: "slug" });

      // 5. Seed Sample Testimonials
      const testimonialsData = [
        {
          student_name: "সাদমান ইসলাম",
          student_batch: "বুয়েট CSE (ব্যাচ '২৫)",
          rating: 5,
          content: "রফিকুল স্যারের ফিজিক্স ক্লাসের মেকানিক্স ও ইলেকট্রিসিটির কনসেপ্ট না বুঝলে হয়তো বুয়েটে টপ ১০০-তে থাকা সম্ভব হতো না।",
          is_featured: true,
          is_approved: true,
        },
        {
          student_name: "ফারহানা ইয়াসমিন",
          student_batch: "ঢাকা মেডিকেল কলেজ (ব্যাচ '২৫)",
          rating: 5,
          content: "নুসরাত আপুর বায়োলজি ক্লাসের নেমোনিক ও চিত্রভিত্তিক ব্যাখ্যা মেডিকেল বায়োলজিতে ফুল মার্কস পেতে অসীম সাহায্য করেছে।",
          is_featured: true,
          is_approved: true,
        }
      ];

      await supabase.from("testimonials").insert(testimonialsData);

      // 6. Seed Sample Blog Post
      const blogData = [
        {
          title: "How to Prepare for BUET Admission Test Efficiently",
          title_bn: "বুয়েট ভর্তি পরীক্ষার সেরা প্রস্তুতি কীভাবে নেবেন?",
          slug: "how-to-prepare-for-buet-admission",
          excerpt: "ইঞ্জিনিয়ারিং ভর্তি পরীক্ষায় সফলতা অর্জনের জন্য কনসেপ্ট ক্লিয়ারিং, প্রশ্নব্যাংক সমাধান এবং টাইম ম্যানেজমেন্টের বাস্তবমুখী গাইডলাইন।",
          content: "বুয়েট ভর্তি পরীক্ষা বাংলাদেশের সবচেয়ে প্রতিযোগিতামূলক পরীক্ষাগুলোর একটি। সঠিক স্টাডি রুটিন এবং বিগত ২০ বছরের প্রশ্ন অ্যানালাইসিস করাই সফলতার মূল চাবিকাঠি।",
          author_name: "ড. মো. রফিকুল ইসলাম",
          reading_time: 6,
          is_published: true,
        }
      ];

      await supabase.from("blog_posts").upsert(blogData, { onConflict: "slug" });

      return { success: true, message: "বেসলাইন ক্যাটাগরি, ইন্সট্রাক্টর, কোর্স, ফ্রি রিসোর্স ও ব্লগ সফলভাবে ডাটাবেজে যুক্ত করা হয়েছে।" };
    } catch (err: any) {
      console.error("Seed error:", err);
      return { success: false, message: err.message || "সিড করতে সমস্যা হয়েছে।" };
    }
  }
};
