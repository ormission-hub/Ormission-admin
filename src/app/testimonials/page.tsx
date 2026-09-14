"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Star, MessageSquare, RefreshCw, CheckCircle2, X } from "lucide-react";
import { dbService, type DbTestimonial } from "@/lib/supabase/db-service";

export default function AdminTestimonialsPage() {
  const [list, setList] = useState<DbTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    studentName: "",
    batch: "",
    rating: 5,
    content: "",
  });

  const loadTestimonials = async () => {
    setLoading(true);
    const data = await dbService.getTestimonials();
    setList(data);
    setLoading(false);
  };

  useEffect(() => {
    loadTestimonials();
  }, []);

  const handleToggleApproved = async (id: number, currentApproved: boolean) => {
    const ok = await dbService.toggleTestimonialApproval(id, currentApproved);
    if (ok) {
      setList((prev) =>
        prev.map((t) => (t.id === id ? { ...t, is_approved: !currentApproved } : t))
      );
    } else {
      alert("স্ট্যাটাস পরিবর্তন করা যায়নি।");
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentName || !form.content) {
      alert("শিক্ষার্থীর নাম ও মন্তব্য লিখুন।");
      return;
    }
    setSubmitting(true);
    try {
      // Direct insert via dbService or supabase
      const { data, error } = await (await import("@/lib/supabase/client")).supabase
        .from("testimonials")
        .insert([
          {
            student_name: form.studentName,
            batch: form.batch,
            course_name: "অনলাইন কোর্স",
            rating: Number(form.rating) || 5,
            review: form.content,
            display_order: list.length + 1,
            is_published: true,
          },
        ])
        .select()
        .single();

      if (data) {
        setList((prev) => [data, ...prev]);
        setShowModal(false);
        setForm({ studentName: "", batch: "", rating: 5, content: "" });
      } else {
        alert("টেস্টিমোনিয়াল যোগ করা যায়নি।");
      }
    } catch (e: any) {
      alert("ত্রুটি: " + e.message);
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-text font-bengali">
              শিক্ষার্থী টেস্টিমোনিয়াল ও রিভিউ ({list.length})
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
              Supabase Testimonials
            </span>
          </div>
          <p className="text-xs text-text-muted font-bengali mt-0.5">
            হোমপেজ ও কোর্স পাতায় প্রদর্শিত শিক্ষার্থীদের রেটিং ও মতামত পরিচালনা
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadTestimonials}
            disabled={loading}
            className="btn btn-outline btn-sm font-bengali text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
            <span>রিফ্রেশ</span>
          </button>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="btn btn-primary btn-sm font-bengali font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন রিভিউ যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center text-xs text-text-muted font-bengali">
          <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-primary" />
          টেস্টিমোনিয়াল লোড হচ্ছে...
        </div>
      ) : list.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30 text-text-muted" />
          <h3 className="text-base font-bold text-text font-bengali mb-1">
            কোনো টেস্টিমোনিয়াল নেই
          </h3>
          <p className="text-xs text-text-muted font-bengali mb-4">
            নতুন শিক্ষার্থী রিভিউ যোগ করুন অথবা ড্যাশবোর্ড থেকে ডেটা সিড করুন।
          </p>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="btn btn-primary btn-sm font-bengali font-bold"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            প্রথম রিভিউটি যোগ করুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((item) => (
            <div
              key={item.id}
              className="bg-surface rounded-xl border border-border p-5 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-accent">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-accent" />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleApproved(item.id, item.is_published)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.is_published
                        ? "bg-success/10 text-success border border-success/20"
                        : "bg-warning/10 text-warning border border-warning/20"
                    }`}
                  >
                    {item.is_published ? "অনুমোদিত" : "অপেক্ষমান"}
                  </button>
                </div>

                <p className="text-xs text-text-muted font-bengali italic mb-4">
                  &ldquo;{item.review}&rdquo;
                </p>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-text font-bengali">
                    {item.student_name}
                  </div>
                  <div className="text-[10px] text-text-muted font-bengali">
                    {item.batch || "সফল শিক্ষার্থী"}
                  </div>
                </div>

                <span className="text-[10px] font-bold text-primary font-bengali">
                  অনলাইন রিভিউ
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-surface rounded-xl border border-border p-6 max-w-md w-full shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="font-bold text-base text-text font-bengali">
                নতুন শিক্ষার্থী রিভিউ যুক্ত করুন
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-md text-text-muted hover:text-text"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-text font-bengali mb-1">
                  শিক্ষার্থীর নাম *
                </label>
                <input
                  type="text"
                  required
                  placeholder="উদা: সাদমান ইসলাম"
                  value={form.studentName}
                  onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                  className="input text-xs font-bengali w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text font-bengali mb-1">
                  ব্যাচ বা প্রতিষ্ঠান
                </label>
                <input
                  type="text"
                  placeholder="উদা: বুয়েট CSE (ব্যাচ '২৫)"
                  value={form.batch}
                  onChange={(e) => setForm({ ...form, batch: e.target.value })}
                  className="input text-xs font-bengali w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text font-bengali mb-1">
                  রেটিং (১ থেকে ৫)
                </label>
                <select
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                  className="input text-xs w-full"
                >
                  <option value={5}>৫ স্টার (চমৎকার)</option>
                  <option value={4}>৪ স্টার (খুব ভালো)</option>
                  <option value={3}>৩ স্টার (ভালো)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text font-bengali mb-1">
                  রিভিউ বা মন্তব্য *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="শিক্ষার্থীর প্রশংসা বা কোর্সের অভিজ্ঞতা..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="input text-xs font-bengali w-full py-1.5"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-outline btn-sm font-bengali"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary btn-sm font-bengali font-bold"
                >
                  {submitting ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
