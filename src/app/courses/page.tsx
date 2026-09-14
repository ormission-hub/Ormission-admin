"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  PlusCircle,
  Search,
  Trash2,
  ExternalLink,
  BookOpen,
  Users,
  Eye,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Edit2,
  Upload,
  X,
  Save,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import {
  dbService,
  type DbCourse,
  type DbCategory,
  type DbInstructor,
} from "@/lib/supabase/db-service";

export default function AdminCoursesPage() {
  const [coursesList, setCoursesList] = useState<DbCourse[]>([]);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [instructors, setInstructors] = useState<DbInstructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // Edit Modal State
  const [editingCourse, setEditingCourse] = useState<DbCourse | null>(null);
  const [editForm, setEditForm] = useState({
    title_bn: "",
    title: "",
    thumbnail_url: "",
    price: 0,
    original_price: 0,
    category_id: "",
    instructor_id: "",
    is_featured: false,
    status: "published" as DbCourse["status"],
    short_description: "",
  });
  const [isUploadingEditThumb, setIsUploadingEditThumb] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    setLoading(true);
    const [cData, catData, instData] = await Promise.all([
      dbService.getCourses(),
      dbService.getCategories(),
      dbService.getInstructors(),
    ]);
    setCoursesList(cData);
    setCategories(catData);
    setInstructors(instData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleFeatured = async (id: number | string, currentFeatured: boolean) => {
    const nextVal = !currentFeatured;
    // Optimistic UI update
    setCoursesList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_featured: nextVal } : c))
    );
    const ok = await dbService.updateCourse(id, { is_featured: nextVal });
    if (!ok) {
      setCoursesList((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_featured: currentFeatured } : c))
      );
      alert("ফিচার্ড স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।");
    }
  };

  const handleToggleStatus = async (id: number | string, currentStatus: string) => {
    const nextStatus = currentStatus === "published" ? "draft" : "published";
    setCoursesList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: nextStatus as any } : c))
    );
    const ok = await dbService.updateCourse(id, { status: nextStatus as any });
    if (!ok) {
      setCoursesList((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: currentStatus as any } : c))
      );
      alert("স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।");
    }
  };

  const handleDelete = async (id: number | string, titleBn: string) => {
    if (confirm(`আপনি কি নিশ্চিত যে '${titleBn}' কোর্সটি ডাটাবেজ থেকে মুছে ফেলতে চান?`)) {
      const ok = await dbService.deleteCourse(id);
      if (ok) {
        setCoursesList((prev) => prev.filter((c) => c.id !== id));
      } else {
        alert("কোর্স মুছতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      }
    }
  };

  const handleOpenEdit = (c: DbCourse) => {
    setEditingCourse(c);
    setEditForm({
      title_bn: c.title_bn || "",
      title: c.title || "",
      thumbnail_url: c.thumbnail_url || "",
      price: c.price || 0,
      original_price: c.original_price || 0,
      category_id: c.category_id ? String(c.category_id) : "",
      instructor_id: c.instructor_id ? String(c.instructor_id) : "",
      is_featured: !!c.is_featured,
      status: c.status || "published",
      short_description: c.short_description || "",
    });
  };

  const handleEditFileUpload = async (file: File) => {
    if (!file) return;
    const validMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validMimes.includes(file.type)) {
      alert("শুধুমাত্র JPG, PNG বা WEBP ফরম্যাটের ছবি আপলোড করুন।");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      alert("ছবির সাইজ সর্বোচ্চ ৮ মেগাবাইট হতে পারবে।");
      return;
    }

    setIsUploadingEditThumb(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.url) {
        throw new Error(data.error || "আপলোড ব্যর্থ হয়েছে।");
      }
      setEditForm((prev) => ({ ...prev, thumbnail_url: data.url }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "ছবি আপলোড ব্যর্থ হয়েছে";
      alert(msg);
    } finally {
      setIsUploadingEditThumb(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    setIsSavingEdit(true);
    try {
      const updates: Partial<DbCourse> = {
        title_bn: editForm.title_bn,
        title: editForm.title || editForm.title_bn,
        price: Number(editForm.price) || 0,
        is_featured: editForm.is_featured,
        status: editForm.status,
        short_description: editForm.short_description,
      };

      if (editForm.thumbnail_url) {
        updates.thumbnail_url = editForm.thumbnail_url;
      }
      if (editForm.original_price) {
        updates.original_price = Number(editForm.original_price);
      }
      if (editForm.category_id) {
        updates.category_id = Number(editForm.category_id);
      }
      if (editForm.instructor_id) {
        updates.instructor_id = Number(editForm.instructor_id);
      }

      const ok = await dbService.updateCourse(editingCourse.id, updates);
      if (ok) {
        await loadData();
        setEditingCourse(null);
        alert("কোর্স ও থাম্বনেইল সফলভাবে আপডেট করা হয়েছে!");
      } else {
        alert("আপডেট ব্যর্থ হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "আপডেট ত্রুটি";
      alert("ত্রুটি: " + msg);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const totalCourses = coursesList.length;
  const featuredCount = coursesList.filter((c) => c.is_featured).length;
  const publishedCount = coursesList.filter((c) => c.status === "published").length;
  const totalStudents = coursesList.reduce((acc, c) => acc + (c.enrollment_count || 0), 0);

  const filteredCourses = coursesList.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      (c.title_bn && c.title_bn.toLowerCase().includes(q)) ||
      (c.title && c.title.toLowerCase().includes(q));
    const matchesCat =
      filterCategory === "all" ||
      c.category_id?.toString() === filterCategory ||
      c.categories?.slug === filterCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-text font-bengali">
              কোর্স ব্যবস্থাপনা ({filteredCourses.length})
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
              Supabase DB Live
            </span>
          </div>
          <p className="text-xs text-text-muted font-bengali mt-0.5">
            অনলাইন কোর্স ক্যাটালগ, লাইভ পাবলিশ স্ট্যাটাস, মূল্য এবং কন্টেন্ট পরিচালনা
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="btn btn-outline btn-sm font-bengali text-xs flex items-center gap-1.5"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
            <span>রিফ্রেশ</span>
          </button>

          <Link
            href="/courses/new"
            className="btn btn-primary btn-sm font-bengali font-bold flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>নতুন কোর্স তৈরি করুন</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-surface p-4 rounded-xl border border-border shadow-xs">
          <span className="text-[11px] font-medium text-text-muted font-bengali">মোট কোর্স</span>
          <div className="text-xl font-extrabold text-text mt-1">{totalCourses}টি</div>
        </div>
        <div className="bg-surface p-4 rounded-xl border border-border shadow-xs">
          <span className="text-[11px] font-medium text-text-muted font-bengali">হোমপেজে জনপ্রিয়</span>
          <div className="text-xl font-extrabold text-amber-500 mt-1 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>{featuredCount}টি</span>
          </div>
        </div>
        <div className="bg-surface p-4 rounded-xl border border-border shadow-xs">
          <span className="text-[11px] font-medium text-text-muted font-bengali">লাইভ পাবলিশড</span>
          <div className="text-xl font-extrabold text-emerald-500 mt-1">{publishedCount}টি</div>
        </div>
        <div className="bg-surface p-4 rounded-xl border border-border shadow-xs">
          <span className="text-[11px] font-medium text-text-muted font-bengali">মোট শিক্ষার্থী</span>
          <div className="text-xl font-extrabold text-primary mt-1">{totalStudents.toLocaleString()} জন</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface rounded-xl border border-border p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="কোর্সের নাম দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input w-full pl-9 text-xs font-bengali"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input text-xs font-bengali py-1.5"
          >
            <option value="all">সকল ক্যাটাগরি</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id.toString()}>
                {cat.name_bn || cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Courses Table / Cards */}
      {loading ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center text-xs text-text-muted font-bengali">
          <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-primary" />
          ডাটাবেজ থেকে কোর্স লোড হচ্ছে...
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30 text-text-muted" />
          <h3 className="text-base font-bold text-text font-bengali mb-1">
            কোনো কোর্স পাওয়া যায়নি
          </h3>
          <p className="text-xs text-text-muted font-bengali mb-4">
            আপনার অনুসন্ধান মেলেনি অথবা ডাটাবেজে এখনো কোনো কোর্স তৈরি করা হয়নি।
          </p>
          <Link href="/courses/new" className="btn btn-primary btn-sm font-bengali font-bold">
            <PlusCircle className="w-4 h-4 mr-1.5" />
            প্রথম কোর্সটি তৈরি করুন
          </Link>
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-secondary/60 border-b border-border text-text-muted uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">কোর্স</th>
                  <th className="py-3 px-4 font-semibold">ক্যাটাগরি</th>
                  <th className="py-3 px-4 font-semibold">ইন্সট্রাক্টর</th>
                  <th className="py-3 px-4 font-semibold">মূল্য</th>
                  <th className="py-3 px-4 font-semibold">হোমপেজ ফিচার্ড</th>
                  <th className="py-3 px-4 font-semibold">স্ট্যাটাস</th>
                  <th className="py-3 px-4 font-semibold text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-bengali">
                {filteredCourses.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-secondary/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-9 rounded-lg bg-surface-secondary border border-border overflow-hidden flex items-center justify-center flex-shrink-0 text-primary">
                          {c.thumbnail_url ? (
                            <img
                              src={c.thumbnail_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <BookOpen className="w-4 h-4 opacity-70" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-text text-sm hover:text-primary transition-colors line-clamp-1">
                            {c.title_bn || c.title}
                          </div>
                          <div className="text-[11px] text-text-muted font-sans line-clamp-1">
                            /{c.slug}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-text-muted">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-surface-secondary border border-border text-text">
                        {c.categories?.name_bn || c.categories?.name || "সাধারণ"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-text font-medium">
                      {c.instructors?.name_bn || c.instructors?.name || "অনলাইন শিক্ষক"}
                    </td>

                    <td className="py-3.5 px-4 font-sans">
                      <div className="font-bold text-text">
                        {c.price === 0 ? (
                          <span className="text-secondary font-bengali">ফ্রি</span>
                        ) : (
                          `৳${c.price.toLocaleString()}`
                        )}
                      </div>
                      {c.original_price && c.original_price > c.price && (
                        <div className="text-[10px] text-text-muted line-through">
                          ৳{c.original_price.toLocaleString()}
                        </div>
                      )}
                    </td>

                    {/* 1-Click Toggle for Featured status on Homepage */}
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(c.id, !!c.is_featured)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all border ${
                          c.is_featured
                            ? "bg-amber-500/15 text-amber-500 border-amber-500/30 hover:bg-amber-500/25 shadow-xs"
                            : "bg-surface-secondary text-text-muted border-border hover:text-text hover:border-text-muted"
                        }`}
                        title="ক্লিক করে হোমপেজে ফিচার্ড অন বা অফ করুন"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{c.is_featured ? "⭐ জনপ্রিয় (Live)" : "সাধারণ"}</span>
                      </button>
                    </td>

                    {/* 1-Click Toggle for Publish / Draft status */}
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(c.id, c.status)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all border ${
                          c.status === "published"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20"
                        }`}
                        title="ক্লিক করে স্ট্যাটাস পরিবর্তন করুন"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{c.status === "published" ? "পাবলিশড" : "ড্রাফট"}</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-surface-secondary transition-colors"
                          title="কোর্স ও থাম্বনেইল এডিট করুন"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <a
                          href={`${process.env.NEXT_PUBLIC_MAIN_SITE_URL || "http://localhost:3000"}/course/${c.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-surface-secondary transition-colors"
                          title="লাইভ প্রিভিউ দেখুন"
                        >
                          <Eye className="w-4 h-4" />
                        </a>

                        <button
                          type="button"
                          onClick={() => handleDelete(c.id, c.title_bn || c.title)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-text font-bengali">কোর্স সম্পাদনা (Edit Course)</h3>
                  <p className="text-xs text-text-muted font-sans">/{editingCourse.slug}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingCourse(null)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 font-bengali">
              {/* Thumbnail Section */}
              <div className="bg-surface-secondary/40 p-4 rounded-xl border border-border space-y-3">
                <label className="block text-xs font-bold text-text">কোর্স থাম্বনেইল ও ব্যানার</label>
                
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="w-full sm:w-44 aspect-video bg-slate-900 rounded-lg overflow-hidden border border-border shrink-0 flex items-center justify-center relative">
                    {editForm.thumbnail_url ? (
                      <img
                        src={editForm.thumbnail_url}
                        alt="Course Thumbnail"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-3">
                        <ImageIcon className="w-6 h-6 text-text-muted mx-auto mb-1 opacity-50" />
                        <span className="text-[10px] text-text-muted">কোনো ছবি নেই</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-2.5">
                    <input
                      type="file"
                      ref={editFileInputRef}
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleEditFileUpload(file);
                      }}
                    />

                    <button
                      type="button"
                      disabled={isUploadingEditThumb}
                      onClick={() => editFileInputRef.current?.click()}
                      className="btn btn-outline btn-sm text-xs font-bold w-full flex items-center justify-center gap-1.5"
                    >
                      {isUploadingEditThumb ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                          <span>আপলোড হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>ডিভাইস থেকে নতুন ছবি আপলোড করুন</span>
                        </>
                      )}
                    </button>

                    <div className="relative">
                      <input
                        type="url"
                        placeholder="অথবা সরাসরি ছবির URL পেস্ট করুন..."
                        value={editForm.thumbnail_url}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, thumbnail_url: e.target.value }))}
                        className="input text-xs w-full font-sans"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Title Bangla & English */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text mb-1">কোর্সের নাম (বাংলা) *</label>
                  <input
                    type="text"
                    required
                    value={editForm.title_bn}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, title_bn: e.target.value }))}
                    className="input text-xs w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text mb-1">কোর্সের নাম (ইংরেজি)</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                    className="input text-xs w-full font-sans"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text mb-1">বিক্রয় মূল্য (৳)</label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
                    className="input text-xs w-full font-sans"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text mb-1">পূর্বের মূল্য (৳)</label>
                  <input
                    type="number"
                    value={editForm.original_price}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, original_price: Number(e.target.value) }))}
                    className="input text-xs w-full font-sans"
                  />
                </div>
              </div>

              {/* Category & Instructor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text mb-1">ক্যাটাগরি</label>
                  <select
                    value={editForm.category_id}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, category_id: e.target.value }))}
                    className="input text-xs w-full"
                  >
                    <option value="">ক্যাটাগরি নির্বাচন করুন</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name_bn || cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text mb-1">ইন্সট্রাক্টর</label>
                  <select
                    value={editForm.instructor_id}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, instructor_id: e.target.value }))}
                    className="input text-xs w-full"
                  >
                    <option value="">ইন্সট্রাক্টর নির্বাচন করুন</option>
                    {instructors.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name_bn || inst.name} ({inst.institution})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 pt-2 pb-2">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-text">
                  <input
                    type="checkbox"
                    checked={editForm.is_featured}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, is_featured: e.target.checked }))}
                    className="checkbox checkbox-primary rounded w-4 h-4"
                  />
                  <span>হোমপেজে জনপ্রিয় (Featured) দেখান</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-text">
                  <input
                    type="checkbox"
                    checked={editForm.status === "published"}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        status: e.target.checked ? "published" : "draft",
                      }))
                    }
                    className="checkbox checkbox-success rounded w-4 h-4"
                  />
                  <span>ওয়েবসাইটে লাইভ পাবলিশ রাখুন</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="btn btn-outline btn-sm text-xs"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit || isUploadingEditThumb}
                  className="btn btn-primary btn-sm text-xs font-bold flex items-center gap-1.5"
                >
                  {isSavingEdit ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>সংরক্ষণ হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>সংরক্ষণ করুন</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

