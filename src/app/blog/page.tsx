"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, FileText, RefreshCw, X, CheckCircle2, Clock } from "lucide-react";
import { dbService, type DbBlogPost } from "@/lib/supabase/db-service";

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<DbBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    titleBn: "",
    authorName: "ড. মো. রফিকুল ইসলাম",
    readingTime: 5,
    excerpt: "",
    content: "",
    coverImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80",
  });

  const loadPosts = async () => {
    setLoading(true);
    const data = await dbService.getBlogPosts();
    setPosts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titleBn) {
      alert("আর্টিকেলের শিরোনাম লিখুন।");
      return;
    }
    setSubmitting(true);
    const slug = `article-${Date.now()}`;

    const created = await dbService.createBlogPost({
      title: form.titleBn,
      title_bn: form.titleBn,
      slug: slug,
      excerpt: form.excerpt,
      content: form.content,
      featured_image: form.coverImage,
      status: "published",
    });

    if (created) {
      setPosts((prev) => [created, ...prev]);
      setShowModal(false);
      setForm({
        titleBn: "",
        authorName: "ড. মো. রফিকুল ইসলাম",
        readingTime: 5,
        excerpt: "",
        content: "",
        coverImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80",
      });
    } else {
      alert("ব্লগ পোস্ট সংরক্ষণ করতে সমস্যা হয়েছে।");
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: number, titleBn?: string) => {
    if (confirm(`আপনি কি নিশ্চিত যে '${titleBn || "এই আর্টিকেল"}' মুছে ফেলতে চান?`)) {
      const ok = await dbService.deleteBlogPost(id);
      if (ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert("আর্টিকেল মোছা যায়নি।");
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-text font-bengali">
              ব্লগ ও আর্টিকেল CMS ({posts.length})
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
              Supabase Blog
            </span>
          </div>
          <p className="text-xs text-text-muted font-bengali mt-0.5">
            শিক্ষার্থীদের জন্য পরামর্শমূলক ব্লগ তৈরি, সম্পাদনা ও প্রকাশনা পরিচালনা
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadPosts}
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
            <span>নতুন আর্টিকেল লিখুন</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center text-xs text-text-muted font-bengali">
          <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-primary" />
          ব্লগ পোস্ট লোড হচ্ছে...
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-30 text-text-muted" />
          <h3 className="text-base font-bold text-text font-bengali mb-1">
            কোনো আর্টিকেল প্রকাশিত নেই
          </h3>
          <p className="text-xs text-text-muted font-bengali mb-4">
            ভর্তি প্রস্তুতি বা স্টাডি টিপস নিয়ে প্রথম আর্টিকেলটি লিখুন।
          </p>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="btn btn-primary btn-sm font-bengali font-bold"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            প্রথম আর্টিকেল লিখুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-surface rounded-xl border border-border p-5 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface-secondary text-text border border-border font-bengali">
                    ফ্যাকাল্টি আর্টিকেল
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(post.id, post.title_bn || post.title)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-text font-bengali mb-2 line-clamp-2">
                  {post.title_bn || post.title}
                </h3>

                <p className="text-xs text-text-muted font-bengali line-clamp-3 mb-4">
                  {post.excerpt || post.content || "আর্টিকেলের বিস্তারিত অংশ..."}
                </p>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-text-muted">
                <span className="inline-flex items-center gap-1 text-success font-semibold text-[11px] font-bengali">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {post.status === "published" ? "পাবলিশড" : "ড্রাফট"}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bengali">
                  <Clock className="w-3 h-3" />
                  ৫ মিনিট পাঠ
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Blog Post Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-surface rounded-xl border border-border p-6 max-w-lg w-full shadow-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="font-bold text-base text-text font-bengali">
                নতুন ব্লগ আর্টিকেল লিখুন
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
                  আর্টিকেলের শিরোনাম *
                </label>
                <input
                  type="text"
                  required
                  placeholder="উদা: বুয়েট ভর্তি পরীক্ষার প্রস্তুতি কীভাবে নেবেন?"
                  value={form.titleBn}
                  onChange={(e) => setForm({ ...form, titleBn: e.target.value })}
                  className="input text-xs font-bengali w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text font-bengali mb-1">
                    লেখকের নাম
                  </label>
                  <input
                    type="text"
                    value={form.authorName}
                    onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                    className="input text-xs font-bengali w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text font-bengali mb-1">
                    পড়ার আনুমানিক সময় (মিনিট)
                  </label>
                  <input
                    type="number"
                    value={form.readingTime}
                    onChange={(e) => setForm({ ...form, readingTime: Number(e.target.value) })}
                    className="input text-xs w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text font-bengali mb-1">
                  সংক্ষিপ্ত সারসংক্ষেপ (Excerpt)
                </label>
                <textarea
                  rows={2}
                  placeholder="পাঠকদের আকৃষ্ট করার মতো সংক্ষিপ্ত বিবরণী..."
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  className="input text-xs font-bengali w-full py-1.5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text font-bengali mb-1">
                  সম্পূর্ণ কন্টেন্ট
                </label>
                <textarea
                  rows={5}
                  placeholder="আর্টিকেলের বিস্তারিত অংশ লিখুন..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="input text-xs font-bengali w-full py-2"
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
                  {submitting ? "সংরক্ষণ হচ্ছে..." : "প্রকাশ করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
