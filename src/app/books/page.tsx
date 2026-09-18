"use client";

import { useEffect, useState, useRef } from "react";
import {
  PlusCircle,
  Search,
  Trash2,
  ExternalLink,
  BookOpen,
  Pin,
  Sparkles,
  Edit2,
  Upload,
  X,
  RefreshCw,
  Loader2,
  CheckCircle2,
  ShoppingBag,
  Star,
  Layers,
} from "lucide-react";
import { dbService } from "@/lib/supabase/db-service";

export interface OrmissionBook {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  price: number;
  original_price: number;
  cover_gradient?: string;
  cover_image?: string;
  pages: string;
  format: string;
  rating: number;
  reviews_count: number;
  features: string[];
  is_popular: boolean;
  is_pinned: boolean;
  display_order: number;
  order_url?: string;
}

const GRADIENT_OPTIONS = [
  { label: "Ocean Indigo", value: "from-blue-600 via-indigo-600 to-sky-700" },
  { label: "Royal Velvet", value: "from-purple-700 via-indigo-800 to-slate-900" },
  { label: "Emerald Mint", value: "from-emerald-600 via-teal-700 to-cyan-800" },
  { label: "Sunset Fire", value: "from-orange-600 via-amber-600 to-red-600" },
  { label: "Rose Crimson", value: "from-rose-600 via-pink-700 to-purple-800" },
  { label: "Deep Obsidian", value: "from-slate-800 via-slate-900 to-black" },
];

export default function AdminBooksPage() {
  const [books, setBooks] = useState<OrmissionBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState<OrmissionBook | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    category: "এইচএসসি বিজ্ঞান",
    price: 350,
    original_price: 480,
    cover_gradient: GRADIENT_OPTIONS[0].value,
    cover_image: "",
    pages: "৩২০ পৃষ্ঠা",
    format: "হার্ডকভার + ই-বুক",
    rating: 5.0,
    reviews_count: 850,
    featuresText: "অধ্যায়ভিত্তিক সূত্র ও প্রমাণ\nবিগত ১০ বছরের প্রশ্ন সমাধান\nটাইপভিত্তিক শর্টকাট মেথড",
    is_popular: true,
    is_pinned: true,
    order_url: "",
  });

  const loadBooks = async () => {
    setLoading(true);
    const settings = await dbService.getSiteSettings();
    if (Array.isArray(settings?.ormission_books)) {
      setBooks(settings.ormission_books);
    } else {
      setBooks([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const saveBooksToDb = async (updatedList: OrmissionBook[]) => {
    setBooks(updatedList);
    const ok = await dbService.updateSiteSetting("ormission_books", updatedList);
    if (!ok) {
      alert("বইয়ের ডাটাবেজ আপডেট করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
      loadBooks();
    }
    return ok;
  };

  // 1-Click Toggle for Pin to Home
  const handleTogglePin = async (id: string, currentVal: boolean) => {
    const updated = books.map((b) => (b.id === id ? { ...b, is_pinned: !currentVal } : b));
    await saveBooksToDb(updated);
  };


  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`আপনি কি নিশ্চিত যে "${title}" বইটি তালিকা থেকে মুছে ফেলতে চান?`)) {
      return;
    }
    const updated = books.filter((b) => b.id !== id);
    await saveBooksToDb(updated);
  };

  const handleOpenAdd = () => {
    setEditingBook(null);
    setForm({
      title: "",
      subtitle: "",
      category: "এইচএসসি বিজ্ঞান",
      price: 350,
      original_price: 480,
      cover_gradient: GRADIENT_OPTIONS[0].value,
      cover_image: "",
      pages: "৩২০ পৃষ্ঠা",
      format: "হার্ডকভার + ই-বুক",
      rating: 5.0,
      reviews_count: 850,
      featuresText: "অধ্যায়ভিত্তিক সূত্র ও প্রমাণ\nবিগত ১০ বছরের প্রশ্ন সমাধান\nটাইপভিত্তিক শর্টকাট মেথড",
      is_popular: true,
      is_pinned: true,
      order_url: "",
    });
    setShowModal(true);
  };

  const handleOpenEdit = (b: OrmissionBook) => {
    setEditingBook(b);
    setForm({
      title: b.title || "",
      subtitle: b.subtitle || "",
      category: b.category || "এইচএসসি বিজ্ঞান",
      price: b.price || 0,
      original_price: b.original_price || 0,
      cover_gradient: b.cover_gradient || GRADIENT_OPTIONS[0].value,
      cover_image: b.cover_image || "",
      pages: b.pages || "৩২০ পৃষ্ঠা",
      format: b.format || "হার্ডকভার",
      rating: b.rating || 5.0,
      reviews_count: b.reviews_count || 500,
      featuresText: Array.isArray(b.features) ? b.features.join("\n") : "",
      is_popular: !!b.is_popular,
      is_pinned: !!b.is_pinned,
      order_url: b.order_url || "",
    });
    setShowModal(true);
  };

  const handleCoverUpload = async (file: File) => {
    if (!file) return;
    setIsUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.url) {
        throw new Error(data.error || "আপলোড ব্যর্থ হয়েছে");
      }
      setForm((prev) => ({ ...prev, cover_image: data.url }));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "ছবি আপলোড ব্যর্থ হয়েছে");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert("বইয়ের নাম অবশ্যই লিখুন।");
      return;
    }

    setSubmitting(true);
    const featuresList = form.featuresText
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    let updatedList: OrmissionBook[] = [];

    if (editingBook) {
      updatedList = books.map((b) =>
        b.id === editingBook.id
          ? {
              ...b,
              title: form.title.trim(),
              subtitle: form.subtitle.trim(),
              category: form.category.trim(),
              price: Number(form.price) || 0,
              original_price: Number(form.original_price) || 0,
              cover_gradient: form.cover_gradient,
              cover_image: form.cover_image.trim(),
              pages: form.pages.trim(),
              format: form.format.trim(),
              rating: Number(form.rating) || 5.0,
              reviews_count: Number(form.reviews_count) || 100,
              features: featuresList,
              is_popular: form.is_popular,
              is_pinned: form.is_pinned,
              order_url: form.order_url.trim(),
            }
          : b
      );
    } else {
      const newBook: OrmissionBook = {
        id: `book-${Date.now()}`,
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        category: form.category.trim(),
        price: Number(form.price) || 0,
        original_price: Number(form.original_price) || 0,
        cover_gradient: form.cover_gradient,
        cover_image: form.cover_image.trim(),
        pages: form.pages.trim(),
        format: form.format.trim(),
        rating: Number(form.rating) || 5.0,
        reviews_count: Number(form.reviews_count) || 100,
        features: featuresList,
        is_popular: form.is_popular,
        is_pinned: form.is_pinned,
        display_order: books.length + 1,
        order_url: form.order_url.trim(),
      };
      updatedList = [newBook, ...books];
    }

    const ok = await saveBooksToDb(updatedList);
    setSubmitting(false);
    if (ok) {
      setShowModal(false);
    }
  };

  const filteredBooks = books.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      b.title.toLowerCase().includes(q) ||
      b.subtitle.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q);
    const matchesCat = filterCategory === "all" || b.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  const categories = Array.from(new Set(books.map((b) => b.category)));
  const pinnedCount = books.filter((b) => b.is_pinned).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-text font-bengali">
              বই ও প্রকাশনা ব্যবস্থাপনা ({books.length})
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
              Live DB
            </span>
          </div>
          <p className="text-xs text-text-muted font-bengali mt-0.5">
            হোমপেজের স্লাইডশো ও বুক ক্যাটালগের বইসমূহ, মূল্য ও পিন নিয়ন্ত্রণ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadBooks}
            disabled={loading}
            className="btn btn-outline btn-sm font-bengali text-xs flex items-center gap-1.5"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
            <span>রিফ্রেশ</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="btn btn-primary btn-sm font-bengali font-bold flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>নতুন বই যুক্ত করুন</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-surface p-4 rounded-xl border border-border shadow-xs">
          <span className="text-[11px] font-medium text-text-muted font-bengali">মোট বই</span>
          <div className="text-xl font-extrabold text-text mt-1">{books.length}টি</div>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-border shadow-xs">
          <span className="text-[11px] font-medium text-text-muted font-bengali">হোমপেজে পিন করা (Pinned)</span>
          <div className="text-xl font-extrabold text-primary mt-1 flex items-center gap-1.5">
            <Pin className="w-4 h-4" />
            <span>{pinnedCount}টি</span>
          </div>
        </div>
        <div className="bg-surface p-4 rounded-xl border border-border shadow-xs">
          <span className="text-[11px] font-medium text-text-muted font-bengali">ক্যাটাগরি</span>
          <div className="text-xl font-extrabold text-emerald-500 mt-1">{categories.length}টি</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface rounded-xl border border-border p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="বইয়ের নাম বা বিবরণ দিয়ে খুঁজুন..."
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
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Books Table */}
      {loading ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center text-xs text-text-muted font-bengali">
          <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-primary" />
          ডাটাবেজ থেকে বই লোড হচ্ছে...
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30 text-text-muted" />
          <h3 className="text-base font-bold text-text font-bengali mb-1">
            কোনো বই পাওয়া যায়নি
          </h3>
          <p className="text-xs text-text-muted font-bengali mb-4">
            আপনার অনুসন্ধান মেলেনি অথবা ডাটাবেজে এখনো কোনো বই তৈরি করা হয়নি।
          </p>
          <button onClick={handleOpenAdd} className="btn btn-primary btn-sm font-bengali font-bold">
            <PlusCircle className="w-4 h-4 mr-1.5" />
            প্রথম বইটি যুক্ত করুন
          </button>
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-secondary/60 border-b border-border text-text-muted uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">বইয়ের কাভার ও নাম</th>
                  <th className="py-3 px-4 font-semibold">ক্যাটাগরি</th>
                  <th className="py-3 px-4 font-semibold">ফরম্যাট ও পেজ</th>
                  <th className="py-3 px-4 font-semibold">মূল্য</th>

                  <th className="py-3 px-4 font-semibold text-center">হোমপেজে পিন (Pin)</th>
                  <th className="py-3 px-4 font-semibold text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-bengali">
                {filteredBooks.map((b) => (
                  <tr key={b.id} className="hover:bg-surface-secondary/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {/* Book Mockup Thumbnail */}
                        <div
                          className={`w-12 h-14 rounded-md bg-gradient-to-br ${b.cover_gradient || "from-blue-600 to-indigo-700"} flex items-center justify-center text-white shrink-0 p-1 shadow-xs border border-white/20`}
                        >
                          {b.cover_image ? (
                            <img
                              src={b.cover_image}
                              alt=""
                              className="w-full h-full object-cover rounded-sm"
                            />
                          ) : (
                            <BookOpen className="w-5 h-5 text-white/90" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-text text-sm hover:text-primary transition-colors line-clamp-1">
                            {b.title}
                          </div>
                          <div className="text-[11px] text-text-muted line-clamp-1 mt-0.5">
                            {b.subtitle}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-text-muted">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-surface-secondary border border-border text-text">
                        {b.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-text">
                      <div className="font-semibold text-xs">{b.format}</div>
                      <div className="text-[10px] text-text-muted">{b.pages}</div>
                    </td>

                    <td className="py-3.5 px-4 font-sans">
                      <div className="font-bold text-text">৳{b.price.toLocaleString()}</div>
                      {b.original_price > b.price && (
                        <div className="text-[10px] text-text-muted line-through">
                          ৳{b.original_price.toLocaleString()}
                        </div>
                      )}
                    </td>


                    {/* Pin to Home Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleTogglePin(b.id, b.is_pinned)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all border ${
                          b.is_pinned
                            ? "bg-primary/15 text-primary border-primary/30 hover:bg-primary/25 shadow-xs"
                            : "bg-surface-secondary text-text-muted border-border hover:text-text hover:border-text-muted"
                        }`}
                        title="ক্লিক করে বইটি হোমপেজের স্লাইডশোতে পিন করুন"
                      >
                        <Pin className="w-3 h-3" />
                        <span>{b.is_pinned ? "পিন করা" : "পিন করুন"}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(b)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-surface-secondary transition-colors"
                          title="সম্পাদনা করুন"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(b.id, b.title)}
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

      {/* Add / Edit Book Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/65 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-text">
                  {editingBook ? "বইয়ের তথ্য সম্পাদনা" : "নতুন বই যুক্ত করুন"}
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
              {/* Title & Subtitle */}
              <div>
                <label className="block text-xs font-bold text-text mb-1">বইয়ের নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="উদা: এইচএসসি পদার্থবিজ্ঞান মাস্টার ফর্মুলা বুক"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input text-xs w-full font-bengali"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text mb-1">সংক্ষিপ্ত বিবরণ / সাবটাইটেল</label>
                <input
                  type="text"
                  placeholder="উদা: ১ম ও ২য় পত্রের সকল সূত্রের প্রমাণ ও শর্টকাট ট্রিকস..."
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  className="input text-xs w-full font-bengali"
                />
              </div>

              {/* Category, Format, Pages */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text mb-1">ক্যাটাগরি</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="input text-xs w-full font-bengali"
                    placeholder="উদা: এইচএসসি বিজ্ঞান"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text mb-1">ফরম্যাট</label>
                  <input
                    type="text"
                    value={form.format}
                    onChange={(e) => setForm({ ...form, format: e.target.value })}
                    className="input text-xs w-full font-bengali"
                    placeholder="উদা: হার্ডকভার + ই-বুক"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text mb-1">পৃষ্ঠা সংখ্যা</label>
                  <input
                    type="text"
                    value={form.pages}
                    onChange={(e) => setForm({ ...form, pages: e.target.value })}
                    className="input text-xs w-full font-bengali"
                    placeholder="উদা: ৩২০ পৃষ্ঠা"
                  />
                </div>
              </div>

              {/* Price & Original Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text mb-1">বিক্রয় মূল্য (৳) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="input text-xs w-full font-sans"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text mb-1">নিয়মিত মূল্য (৳)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.original_price}
                    onChange={(e) => setForm({ ...form, original_price: Number(e.target.value) })}
                    className="input text-xs w-full font-sans"
                  />
                </div>
              </div>

              {/* Cover Gradient Selector */}
              <div>
                <label className="block text-xs font-bold text-text mb-1.5">কাভার থিম গ্র্যাডিয়েন্ট</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {GRADIENT_OPTIONS.map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => setForm({ ...form, cover_gradient: g.value })}
                      className={`h-10 rounded-lg bg-gradient-to-br ${g.value} border-2 transition-all flex items-center justify-center text-white text-[10px] font-bold ${
                        form.cover_gradient === g.value
                          ? "border-white ring-2 ring-primary scale-105 shadow-md"
                          : "border-transparent opacity-80 hover:opacity-100"
                      }`}
                      title={g.label}
                    >
                      {form.cover_gradient === g.value && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cover Image Upload (Optional direct upload) */}
              <div className="bg-surface-secondary/50 p-3 rounded-xl border border-border space-y-2">
                <label className="block text-xs font-bold text-text">কাস্টম কাভার ছবি (ঐচ্ছিক)</label>
                <div className="flex items-center gap-2.5">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleCoverUpload(file);
                    }}
                  />
                  <button
                    type="button"
                    disabled={isUploadingCover}
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-outline btn-sm text-xs flex items-center gap-1.5"
                  >
                    {isUploadingCover ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>ছবি আপলোড করুন</span>
                  </button>
                  <input
                    type="url"
                    placeholder="অথবা সরাসরি ছবির URL..."
                    value={form.cover_image}
                    onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
                    className="input text-xs flex-1 font-sans"
                  />
                </div>
              </div>

              {/* Features bullets */}
              <div>
                <label className="block text-xs font-bold text-text mb-1">
                  বইয়ের বিশেষত্ব / ফিচারসমূহ (প্রতি লাইনে একটি)
                </label>
                <textarea
                  rows={3}
                  value={form.featuresText}
                  onChange={(e) => setForm({ ...form, featuresText: e.target.value })}
                  placeholder="অধ্যায়ভিত্তিক সকল সূত্র&#10;টাইপভিত্তিক প্রশ্ন সমাধান..."
                  className="input text-xs w-full py-2 resize-none font-bengali leading-relaxed"
                />
              </div>

              {/* Toggles: Pin to Homepage & Popular */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-text select-none">
                  <input
                    type="checkbox"
                    checked={form.is_pinned}
                    onChange={(e) => setForm({ ...form, is_pinned: e.target.checked })}
                    className="checkbox checkbox-primary rounded w-4 h-4"
                  />
                  <Pin className="w-3.5 h-3.5 text-primary" />
                  <span>হোমপেজের স্লাইডশোতে পিন করুন</span>
                </label>


              </div>

              {/* Submit */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-outline btn-sm text-xs"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary btn-sm text-xs font-bold flex items-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>সংরক্ষণ হচ্ছে...</span>
                    </>
                  ) : (
                    <span>{editingBook ? "পরিবর্তন সংরক্ষণ করুন" : "বইটি সংরক্ষণ করুন"}</span>
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
