"use client";

import { useEffect, useState, useRef } from "react";
import {
  Plus,
  Trash2,
  Star,
  MessageSquare,
  RefreshCw,
  CheckCircle2,
  X,
  Edit2,
  Upload,
  User,
  Loader2,
  Sparkles,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";
import { dbService, type DbTestimonial } from "@/lib/supabase/db-service";

export default function AdminTestimonialsPage() {
  const [list, setList] = useState<DbTestimonial[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Add & Edit
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<DbTestimonial | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingReviewImage, setIsUploadingReviewImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reviewImageInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    student_name: "",
    batch: "",
    course_name: "",
    rating: 5,
    review_type: "text" as "text" | "image",
    review: "",
    review_image: "",
    student_photo: "",
    display_order: 1,
    is_published: true,
  });

  const loadTestimonials = async () => {
    setLoading(true);
    const data = await dbService.getTestimonials();
    // Sort by display_order ascending, then by id descending
    const sorted = [...data].sort(
      (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
    );
    setList(sorted);
    setLoading(false);
  };

  useEffect(() => {
    loadTestimonials();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setForm({
      student_name: "",
      batch: "",
      course_name: "অনলাইন এডমিশন প্রস্তুতি",
      rating: 5,
      review_type: "text",
      review: "",
      review_image: "",
      student_photo: "",
      display_order: list.length + 1,
      is_published: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item: DbTestimonial) => {
    setEditingItem(item);
    const rawReview = item.review || "";
    const isImg =
      rawReview.startsWith("[IMAGE]:") ||
      rawReview.startsWith("http://") ||
      rawReview.startsWith("https://") ||
      rawReview.startsWith("/uploads/") ||
      /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(rawReview.split("||")[0].trim());

    const imgUrl = isImg
      ? (rawReview.startsWith("[IMAGE]:")
          ? rawReview.replace("[IMAGE]:", "").split("||")[0].trim()
          : rawReview.split("||")[0].trim())
      : "";

    const textVal = rawReview.includes("||")
      ? rawReview.split("||")[1].trim()
      : (!isImg ? rawReview : "");

    setForm({
      student_name: item.student_name || "",
      batch: item.batch || "",
      course_name: item.course_name || "",
      rating: item.rating || 5,
      review_type: isImg ? "image" : "text",
      review: textVal,
      review_image: imgUrl,
      student_photo: item.student_photo || "",
      display_order: item.display_order ?? list.length + 1,
      is_published: item.is_published ?? true,
    });
    setShowModal(true);
  };

  const handleToggleApproved = async (id: number | string, currentApproved: boolean) => {
    const ok = await dbService.toggleTestimonialApproval(id, currentApproved);
    if (ok) {
      setList((prev) =>
        prev.map((t) => (t.id === id ? { ...t, is_published: !currentApproved } : t))
      );
    } else {
      alert("স্ট্যাটাস পরিবর্তন করা যায়নি।");
    }
  };

  const handleDelete = async (id: number | string, name: string) => {
    if (!confirm(`আপনি কি নিশ্চিত যে "${name}"-এর মতামত ও রিভিউটি মুছে ফেলতে চান?`)) {
      return;
    }
    const ok = await dbService.deleteTestimonial(id);
    if (ok) {
      setList((prev) => prev.filter((t) => t.id !== id));
      alert("টেস্টিমোনিয়াল সফলভাবে মুছে ফেলা হয়েছে।");
    } else {
      alert("মুছে ফেলতে সমস্যা হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।");
    }
  };

  // Direct device file upload for student photo
  const handlePhotoUpload = async (file: File) => {
    if (!file) return;
    const validMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validMimes.includes(file.type)) {
      alert("শুধুমাত্র JPG, PNG বা WEBP ফরম্যাটের ছবি আপলোড করুন।");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("ছবির সাইজ সর্বোচ্চ ৫ মেগাবাইট হতে পারবে।");
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.url) {
        throw new Error(data.error || "ছবি আপলোড ব্যর্থ হয়েছে।");
      }
      setForm((prev) => ({ ...prev, student_photo: data.url }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "ছবি আপলোড ব্যর্থ হয়েছে";
      alert(msg);
    } finally {
      setIsUploadingPhoto(false);
    }
  };


  // Direct device file upload for review screenshot / photo
  const handleReviewImageUpload = async (file: File) => {
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

    setIsUploadingReviewImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.url) {
        throw new Error(data.error || "ছবি আপলোড ব্যর্থ হয়েছে।");
      }
      setForm((prev) => ({ ...prev, review_image: data.url }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "ছবি আপলোড ব্যর্থ হয়েছে";
      alert(msg);
    } finally {
      setIsUploadingReviewImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.student_name.trim()) {
      alert("শিক্ষার্থীর পুরো নাম অবশ্যই পূরণ করুন।");
      return;
    }

    let finalReview = "";
    if (form.review_type === "image") {
      if (!form.review_image.trim()) {
        alert("অনুগ্রহ করে রিভিউয়ের ছবি বা স্ক্রিনশট আপলোড করুন অথবা ছবির লিংক দিন।");
        return;
      }
      finalReview = form.review.trim()
        ? `[IMAGE]:${form.review_image.trim()}|${form.review.trim()}`
        : `[IMAGE]:${form.review_image.trim()}`;
    } else {
      if (!form.review.trim()) {
        alert("শিক্ষার্থীর রিভিউ বা মন্তব্য অবশ্যই পূরণ করুন।");
        return;
      }
      finalReview = form.review.trim();
    }

    setSubmitting(true);
    try {
      if (editingItem) {
        // Update existing testimonial
        const updates: Partial<DbTestimonial> = {
          student_name: form.student_name.trim(),
          batch: form.batch.trim(),
          course_name: form.course_name.trim(),
          rating: Number(form.rating) || 5,
          review: finalReview,
          student_photo: form.student_photo.trim() || null,
          display_order: Number(form.display_order) || 1,
          is_published: form.is_published,
        };

        const ok = await dbService.updateTestimonial(editingItem.id, updates);
        if (ok) {
          await loadTestimonials();
          setShowModal(false);
          alert("মতামত সফলভাবে আপডেট করা হয়েছে!");
        } else {
          alert("আপডেট ব্যর্থ হয়েছে।");
        }
      } else {
        // Add new testimonial
        const newPayload: Partial<DbTestimonial> = {
          student_name: form.student_name.trim(),
          batch: form.batch.trim(),
          course_name: form.course_name.trim() || "অনলাইন এডমিশন প্রস্তুতি",
          rating: Number(form.rating) || 5,
          review: form.review.trim(),
          student_photo: form.student_photo.trim() || null,
          display_order: Number(form.display_order) || list.length + 1,
          is_published: form.is_published,
        };

        const created = await dbService.createTestimonial(newPayload);
        if (created) {
          await loadTestimonials();
          setShowModal(false);
          alert("নতুন মতামত সফলভাবে যুক্ত করা হয়েছে!");
        } else {
          alert("যুক্ত করতে সমস্যা হয়েছে।");
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "ত্রুটি ঘটেছে";
      alert("ত্রুটি: " + msg);
    } finally {
      setSubmitting(false);
    }
  };

  const publishedCount = list.filter((t) => t.is_published).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-bengali">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-lg sm:text-2xl font-black text-text tracking-tight">
              শিক্ষার্থীদের মতামত ও রিভিউ ({list.length})
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              লাইভ {publishedCount}টি
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            মেইন ওয়েবসাইটের হোমপেজে প্রদর্শিত শিক্ষার্থীদের মতামত ও সাফল্য স্লাইডার পরিচালনা করুন
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={loadTestimonials}
            disabled={loading}
            className="btn btn-outline btn-sm text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
            <span>রিফ্রেশ</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="btn btn-primary btn-sm font-bold flex items-center gap-1.5 shadow-sm shadow-primary/25"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">নতুন রিভিউ যোগ করুন</span>
            <span className="sm:hidden">যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* Quick Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-surface border border-border flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted">মোট মতামত</p>
            <h4 className="text-2xl font-black text-text font-sans mt-0.5">{list.length}</h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted">ওয়েবসাইটে লাইভ প্রদর্শিত</p>
            <h4 className="text-2xl font-black text-emerald-600 font-sans mt-0.5">
              {publishedCount}
            </h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted">৫-স্টার রিভিউ</p>
            <h4 className="text-2xl font-black text-amber-500 font-sans mt-0.5">
              {list.filter((t) => (t.rating || 5) === 5).length}
            </h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Star className="w-5 h-5 fill-amber-500" />
          </div>
        </div>
      </div>

      {/* Testimonials List */}
      {loading ? (
        <div className="bg-surface rounded-2xl border border-border p-16 text-center text-sm text-text-muted">
          <RefreshCw className="w-7 h-7 mx-auto mb-3 animate-spin text-primary" />
          শিক্ষার্থীদের মতামত লোড হচ্ছে...
        </div>
      ) : list.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-border p-16 text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30 text-text-muted" />
          <h3 className="text-base font-bold text-text mb-1">কোনো মতামত পাওয়া যায়নি</h3>
          <p className="text-xs text-text-muted mb-5">
            নতুন শিক্ষার্থী রিভিউ যুক্ত করুন যাতে তা হোমপেজ স্লাইডারে প্রদর্শিত হয়।
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="btn btn-primary btn-sm font-bold inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>প্রথম রিভিউটি যোগ করুন</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map((item) => (
            <div
              key={item.id}
              className="bg-surface rounded-2xl border border-border/80 p-5 shadow-xs flex flex-col justify-between hover:border-primary/40 hover:shadow-md transition-all duration-200 group"
            >
              <div>
                {/* Header: Rating & Status Toggle */}
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(item.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                    <span className="text-[11px] font-bold text-text font-sans ml-1">
                      {item.rating || 5}.0
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleApproved(item.id, item.is_published)}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all border ${
                      item.is_published
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
                    }`}
                    title="ক্লিক করে লাইভ প্রকাশ বা ড্রাফট করুন"
                  >
                    {item.is_published ? "অনুমোদিত (Live)" : "অপেক্ষমান (Draft)"}
                  </button>
                </div>

                {/* Course Name Tag */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {item.course_name && (
                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary line-clamp-1">
                      {item.course_name}
                    </span>
                  )}
                  {((item.review || "").startsWith("[IMAGE]:") || /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(item.review || "")) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                      <ImageIcon className="w-3 h-3" />
                      <span>ছবি রিভিউ</span>
                    </span>
                  )}
                </div>

                {/* Review Text or Image */}
                {(() => {
                  const rawReview = item.review || "";
                  const isImg =
                    rawReview.startsWith("[IMAGE]:") ||
                    rawReview.startsWith("http://") ||
                    rawReview.startsWith("https://") ||
                    rawReview.startsWith("/uploads/") ||
                    /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(rawReview.split("||")[0].trim());

                  const imgUrl = isImg
                    ? (rawReview.startsWith("[IMAGE]:")
                        ? rawReview.replace("[IMAGE]:", "").split("||")[0].trim()
                        : rawReview.split("||")[0].trim())
                    : "";

                  const caption = rawReview.includes("||") ? rawReview.split("||")[1].trim() : "";

                  if (isImg && imgUrl) {
                    return (
                      <div className="mb-4">
                        <div className="relative rounded-xl overflow-hidden border border-border/80 bg-slate-900/40 p-1.5 flex items-center justify-center max-h-36 group/img">
                          <img
                            src={imgUrl}
                            alt={item.student_name}
                            className="max-h-32 w-auto object-contain rounded-lg"
                          />
                          <a
                            href={imgUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1 backdrop-blur-2xs"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>বড় করে দেখুন</span>
                          </a>
                        </div>
                        {caption && (
                          <p className="text-[11px] text-text-muted mt-1.5 italic line-clamp-1">
                            &ldquo;{caption}&rdquo;
                          </p>
                        )}
                      </div>
                    );
                  }

                  return (
                    <p className="text-xs text-text-muted leading-relaxed mb-4 line-clamp-4 italic">
                      &ldquo;{item.review}&rdquo;
                    </p>
                  );
                })()}
              </div>

              {/* Bottom: Student Info & Action Buttons */}
              <div className="pt-3.5 border-t border-border/70 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-primary/10 border border-primary/20 shrink-0 flex items-center justify-center text-primary relative">
                    {item.student_photo ? (
                      <img
                        src={item.student_photo}
                        alt={item.student_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-text truncate leading-tight">
                      {item.student_name}
                    </h5>
                    <p className="text-[10px] text-text-muted truncate mt-0.5">
                      {item.batch || "সফল শিক্ষার্থী"}
                    </p>
                  </div>
                </div>

                {/* Action Buttons: Edit & Delete */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-surface-secondary transition-colors"
                    title="সম্পাদনা করুন"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.student_name)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Testimonial Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/65 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  {editingItem ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <h3 className="font-bold text-base text-text">
                  {editingItem ? "মতামত সম্পাদনা (Edit Review)" : "নতুন শিক্ষার্থী রিভিউ যুক্ত করুন"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-secondary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Student Photo Upload Section */}
              <div className="bg-surface-secondary/50 p-3.5 rounded-xl border border-border space-y-2.5">
                <label className="block text-xs font-bold text-text">শিক্ষার্থীর ছবি (Photo)</label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-900 border border-border shrink-0 flex items-center justify-center relative">
                    {form.student_photo ? (
                      <img
                        src={form.student_photo}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePhotoUpload(file);
                      }}
                    />
                    <button
                      type="button"
                      disabled={isUploadingPhoto}
                      onClick={() => fileInputRef.current?.click()}
                      className="btn btn-outline btn-sm text-xs w-full flex items-center justify-center gap-1.5"
                    >
                      {isUploadingPhoto ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                          <span>আপলোড হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>ডিভাইস থেকে ছবি আপলোড করুন</span>
                        </>
                      )}
                    </button>
                    <input
                      type="url"
                      placeholder="অথবা ছবির অনলাইন URL পেস্ট করুন..."
                      value={form.student_photo}
                      onChange={(e) => setForm({ ...form, student_photo: e.target.value })}
                      className="input text-xs w-full font-sans"
                    />
                  </div>
                </div>
              </div>

              {/* Student Name & Batch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text mb-1">
                    শিক্ষার্থীর পুরো নাম *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="উদা: সাদমান ইসলাম"
                    value={form.student_name}
                    onChange={(e) => setForm({ ...form, student_name: e.target.value })}
                    className="input text-xs w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text mb-1">
                    ব্যাচ বা অর্জন (University / Batch)
                  </label>
                  <input
                    type="text"
                    placeholder="উদা: বুয়েট CSE (ব্যাচ '২৫)"
                    value={form.batch}
                    onChange={(e) => setForm({ ...form, batch: e.target.value })}
                    className="input text-xs w-full"
                  />
                </div>
              </div>

              {/* Course Name & Rating */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text mb-1">
                    কোর্সের নাম (Course Title)
                  </label>
                  <input
                    type="text"
                    placeholder="উদা: HSC 2026 Academic & Admission"
                    value={form.course_name}
                    onChange={(e) => setForm({ ...form, course_name: e.target.value })}
                    className="input text-xs w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text mb-1">রেটিং (Rating)</label>
                  <select
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                    className="input text-xs w-full"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ ৫ স্টার (চমৎকার)</option>
                    <option value={4}>⭐⭐⭐⭐ ৪ স্টার (খুব ভালো)</option>
                    <option value={3}>⭐⭐⭐ ৩ স্টার (ভালো)</option>
                  </select>
                </div>
              </div>

              {/* Review Format Selector (Text vs Image) */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-bold text-text">
                  রিভিউয়ের মাধ্যম (Review Type) *
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-surface-secondary/70 border border-border">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, review_type: "text" })}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                      form.review_type === "text"
                        ? "bg-primary text-white shadow-xs"
                        : "text-text-muted hover:text-text"
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>টেক্সট মন্তব্য</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, review_type: "image" })}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                      form.review_type === "image"
                        ? "bg-primary text-white shadow-xs"
                        : "text-text-muted hover:text-text"
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>ছবি / স্ক্রিনশট রিভিউ</span>
                  </button>
                </div>
              </div>

              {/* Conditional Inputs based on Review Format */}
              {form.review_type === "image" ? (
                <div className="bg-surface-secondary/50 p-3.5 rounded-xl border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-text">
                      রিভিউয়ের ছবি বা চ্যাট স্ক্রিনশট *
                    </label>
                    {form.review_image && (
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, review_image: "" })}
                        className="text-[11px] text-error hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>ছবি মুছুন</span>
                      </button>
                    )}
                  </div>

                  {/* Image Preview if available */}
                  {form.review_image ? (
                    <div className="relative rounded-xl overflow-hidden border border-border bg-black/20 p-2 flex items-center justify-center max-h-48 group">
                      <img
                        src={form.review_image}
                        alt="Review Preview"
                        className="max-h-44 w-auto object-contain rounded-lg"
                      />
                      <a
                        href={form.review_image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>পূর্ণাঙ্গ ছবি দেখুন</span>
                      </a>
                    </div>
                  ) : null}

                  {/* Upload button & URL Input */}
                  <div className="space-y-2">
                    <input
                      type="file"
                      ref={reviewImageInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleReviewImageUpload(file);
                      }}
                    />
                    <button
                      type="button"
                      disabled={isUploadingReviewImage}
                      onClick={() => reviewImageInputRef.current?.click()}
                      className="btn btn-outline btn-sm text-xs w-full flex items-center justify-center gap-1.5"
                    >
                      {isUploadingReviewImage ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                          <span>ছবি আপলোড হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>ডিভাইস থেকে স্ক্রিনশট/ছবি আপলোড করুন</span>
                        </>
                      )}
                    </button>
                    <input
                      type="url"
                      placeholder="অথবা ছবির সরাসরি URL পেস্ট করুন..."
                      value={form.review_image}
                      onChange={(e) => setForm({ ...form, review_image: e.target.value })}
                      className="input text-xs w-full font-sans"
                    />
                  </div>

                  {/* Optional Caption */}
                  <div>
                    <label className="block text-[11px] font-bold text-text-muted mb-1">
                      সংক্ষিপ্ত ক্যাপশন বা নোট (ঐচ্ছিক)
                    </label>
                    <input
                      type="text"
                      placeholder="উদা: ফেসবুক গ্রুপ থেকে প্রাপ্ত রিভিউ..."
                      value={form.review}
                      onChange={(e) => setForm({ ...form, review: e.target.value })}
                      className="input text-xs w-full"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-text mb-1">
                    শিক্ষার্থীর রিভিউ বা মন্তব্য *
                  </label>
                  <textarea
                    rows={3}
                    required={form.review_type === "text"}
                    placeholder="শিক্ষার্থীর প্রশংসা, কোর্সের অভিজ্ঞতা বা অর্জনের কথা..."
                    value={form.review}
                    onChange={(e) => setForm({ ...form, review: e.target.value })}
                    className="input text-xs w-full py-2 resize-none leading-relaxed"
                  />
                </div>
              )}

              {/* Display Order & Live Publish Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-text mb-1">
                    স্লাইডারের প্রদর্শনের ক্রম (Display Order)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.display_order}
                    onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
                    className="input text-xs w-full font-sans"
                  />
                </div>

                <div className="flex items-end pb-2">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-text select-none">
                    <input
                      type="checkbox"
                      checked={form.is_published}
                      onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                      className="checkbox checkbox-primary rounded w-4 h-4"
                    />
                    <span>ওয়েবসাইটে লাইভ প্রদর্শন করুন</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-outline btn-sm text-xs"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting || isUploadingPhoto || isUploadingReviewImage}
                  className="btn btn-primary btn-sm text-xs font-bold flex items-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>সংরক্ষণ হচ্ছে...</span>
                    </>
                  ) : (
                    <span>{editingItem ? "পরিবর্তন সংরক্ষণ করুন" : "রিভিউ সংরক্ষণ করুন"}</span>
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
