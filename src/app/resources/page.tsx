"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Trash2,
  FileDown,
  RefreshCw,
  X,
  CheckCircle2,
  ExternalLink,
  Edit2,
  Search,
  Eye,
  EyeOff,
  Filter,
  FileText,
  BookOpen,
} from "lucide-react";
import { dbService, type DbResource } from "@/lib/supabase/db-service";

const CATEGORY_OPTIONS = [
  { value: "HSC", label: "এইচএসসি (HSC)" },
  { value: "Admission", label: "ভর্তি প্রস্তুতি (Admission)" },
  { value: "SSC", label: "এসএসসি (SSC)" },
  { value: "General", label: "সাধারণ / অন্যান্য (General)" },
];

const FORMAT_OPTIONS = ["PDF", "CheatSheet", "Handnote", "Booklet", "ZIP"];

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<DbResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCatFilter, setSelectedCatFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<"all" | "published" | "draft">("all");

  // Modal State (Add or Edit)
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    titleBn: "",
    title: "",
    category: "HSC",
    subject: "পদার্থবিজ্ঞান",
    description: "",
    fileSize: "3.5 MB",
    fileUrl: "",
    format: "PDF",
    downloadCount: 0,
    isPublished: true,
  });

  const loadResources = async () => {
    setLoading(true);
    const data = await dbService.getResources();
    setResources(data);
    setLoading(false);
  };

  useEffect(() => {
    loadResources();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setForm({
      titleBn: "",
      title: "",
      category: "HSC",
      subject: "পদার্থবিজ্ঞান",
      description: "",
      fileSize: "3.5 MB",
      fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      format: "PDF",
      downloadCount: 0,
      isPublished: true,
    });
    setShowModal(true);
  };

  const openEditModal = (res: DbResource) => {
    setEditingId(res.id);
    setForm({
      titleBn: res.title_bn || res.title || "",
      title: res.title || "",
      category: res.category || "General",
      subject: res.subject || "",
      description: res.description || "",
      fileSize: "3.5 MB",
      fileUrl: res.file_url || "",
      format: res.file_type || "PDF",
      downloadCount: res.download_count || 0,
      isPublished: res.is_published !== false,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titleBn.trim()) {
      alert("রিসোর্সের বাংলা নাম লিখুন।");
      return;
    }
    if (!form.fileUrl.trim()) {
      alert("ডাউনলোড লিংক লিখুন।");
      return;
    }

    setSubmitting(true);

    const payload: Partial<DbResource> = {
      title: form.title.trim() || form.titleBn.trim(),
      title_bn: form.titleBn.trim(),
      category: form.category,
      subject: form.subject.trim(),
      description: form.description.trim(),
      file_url: form.fileUrl.trim(),
      file_type: form.format,
      download_count: Number(form.downloadCount || 0),
      is_published: Boolean(form.isPublished),
    };

    if (editingId) {
      // Edit mode
      const updated = await dbService.updateResource(editingId, payload);
      if (updated) {
        setResources((prev) =>
          prev.map((r) => (r.id === editingId ? { ...r, ...updated } : r))
        );
        setShowModal(false);
      } else {
        alert("রিসোর্স আপডেট করতে সমস্যা হয়েছে।");
      }
    } else {
      // Create mode
      const created = await dbService.createResource(payload);
      if (created) {
        setResources((prev) => [created, ...prev]);
        setShowModal(false);
      } else {
        alert("রিসোর্স তৈরি করতে সমস্যা হয়েছে।");
      }
    }

    setSubmitting(false);
  };

  const handleTogglePublish = async (res: DbResource) => {
    const newStatus = !res.is_published;
    const ok = await dbService.toggleResourcePublished(res.id, newStatus);
    if (ok) {
      setResources((prev) =>
        prev.map((r) => (r.id === res.id ? { ...r, is_published: newStatus } : r))
      );
    } else {
      alert("স্ট্যাটাস পরিবর্তন করা যায়নি।");
    }
  };

  const handleDelete = async (id: number, titleBn?: string) => {
    if (confirm(`আপনি কি নিশ্চিত যে '${titleBn || "এই রিসোর্স"}' মুছে ফেলতে চান?`)) {
      const ok = await dbService.deleteResource(id);
      if (ok) {
        setResources((prev) => prev.filter((r) => r.id !== id));
      } else {
        alert("রিসোর্স মোছা যায়নি।");
      }
    }
  };

  // Filtered list
  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (res.title && res.title.toLowerCase().includes(q)) ||
        (res.title_bn && res.title_bn.toLowerCase().includes(q)) ||
        (res.subject && res.subject.toLowerCase().includes(q)) ||
        (res.description && res.description.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (selectedCatFilter !== "all" && res.category !== selectedCatFilter) {
        return false;
      }

      if (selectedStatusFilter === "published" && !res.is_published) {
        return false;
      }
      if (selectedStatusFilter === "draft" && res.is_published) {
        return false;
      }

      return true;
    });
  }, [resources, searchQuery, selectedCatFilter, selectedStatusFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-text font-bengali">
              ফ্রি রিসোর্স ও লেকচার শিট CMS ({resources.length})
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
              Live Supabase
            </span>
          </div>
          <p className="text-xs text-text-muted font-bengali mt-0.5">
            শিক্ষার্থীদের জন্য বিনামূল্যে ডাউনলোডযোগ্য হ্যান্ডনোট, শিট ও ফর্মুলা বুকলেট ম্যানেজমেন্ট
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadResources}
            disabled={loading}
            className="btn btn-outline btn-sm font-bengali text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
            <span>রিফ্রেশ</span>
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="btn btn-primary btn-sm font-bengali font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন শিট আপলোড</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-surface rounded-xl border border-border p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="রিসোর্স বা বিষয়ের নাম দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 text-xs font-bengali w-full"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto shrink-0">
          <button
            onClick={() => setSelectedCatFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold font-bengali transition-colors ${
              selectedCatFilter === "all"
                ? "bg-primary text-white"
                : "bg-surface-secondary text-text-muted hover:text-text"
            }`}
          >
            সকল ({resources.length})
          </button>
          {CATEGORY_OPTIONS.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCatFilter(cat.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-bengali transition-colors whitespace-nowrap ${
                selectedCatFilter === cat.value
                  ? "bg-primary text-white"
                  : "bg-surface-secondary text-text-muted hover:text-text"
              }`}
            >
              {cat.value}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 bg-surface-secondary p-1 rounded-lg border border-border shrink-0">
          <button
            onClick={() => setSelectedStatusFilter("all")}
            className={`px-2.5 py-1 rounded text-xs font-semibold font-bengali transition-colors ${
              selectedStatusFilter === "all"
                ? "bg-surface text-text shadow-xs"
                : "text-text-muted hover:text-text"
            }`}
          >
            সব
          </button>
          <button
            onClick={() => setSelectedStatusFilter("published")}
            className={`px-2.5 py-1 rounded text-xs font-semibold font-bengali transition-colors ${
              selectedStatusFilter === "published"
                ? "bg-surface text-success shadow-xs"
                : "text-text-muted hover:text-text"
            }`}
          >
            প্রকাশিত
          </button>
          <button
            onClick={() => setSelectedStatusFilter("draft")}
            className={`px-2.5 py-1 rounded text-xs font-semibold font-bengali transition-colors ${
              selectedStatusFilter === "draft"
                ? "bg-surface text-warning shadow-xs"
                : "text-text-muted hover:text-text"
            }`}
          >
            ড্রাফট
          </button>
        </div>
      </div>

      {/* Resources Grid */}
      {loading ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center text-xs text-text-muted font-bengali">
          <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-primary" />
          রিসোর্স ডাটা লোড হচ্ছে...
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center">
          <FileDown className="w-10 h-10 mx-auto mb-3 opacity-30 text-text-muted" />
          <h3 className="text-base font-bold text-text font-bengali mb-1">
            কোনো রিসোর্স খুঁজে পাওয়া যায়নি
          </h3>
          <p className="text-xs text-text-muted font-bengali mb-4">
            অনুসন্ধান বা ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।
          </p>
          <button
            type="button"
            onClick={openAddModal}
            className="btn btn-primary btn-sm font-bengali font-bold"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            নতুন রিসোর্স যোগ করুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResources.map((res) => (
            <div
              key={res.id}
              className={`bg-surface rounded-xl border p-5 shadow-xs flex flex-col justify-between transition-all duration-200 ${
                res.is_published
                  ? "border-border hover:border-primary/40"
                  : "border-dashed border-border/80 opacity-75 bg-surface-secondary/30"
              }`}
            >
              <div>
                {/* Badges & Actions Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                      {res.category || "General"}
                    </span>
                    {res.subject && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-secondary text-text-muted font-bengali border border-border">
                        {res.subject}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary/10 text-secondary border border-secondary/20 uppercase">
                      {res.file_type || "PDF"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditModal(res)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                      title="সম্পাদনা করুন"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(res.id, res.title_bn || res.title)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-text font-bengali mb-1 line-clamp-2 leading-snug">
                  {res.title_bn || res.title}
                </h3>
                {res.title && res.title !== res.title_bn && (
                  <p className="text-[11px] text-text-muted font-sans line-clamp-1 mb-2">
                    {res.title}
                  </p>
                )}

                {/* Description */}
                {res.description && (
                  <p className="text-xs text-text-muted font-bengali line-clamp-2 mb-3 leading-relaxed">
                    {res.description}
                  </p>
                )}

                {/* Downloads count */}
                <div className="flex items-center gap-1.5 text-xs text-text-muted font-sans mb-4">
                  <FileDown className="w-3.5 h-3.5 text-primary" />
                  <span>{(res.download_count || 0).toLocaleString()} বার ডাউনলোড হয়েছে</span>
                </div>
              </div>

              {/* Bottom bar: Publish Toggle & File Link */}
              <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleTogglePublish(res)}
                  className={`inline-flex items-center gap-1 text-[11px] font-bold font-bengali px-2 py-1 rounded-md transition-colors ${
                    res.is_published
                      ? "text-success bg-success/10 hover:bg-success/20"
                      : "text-warning bg-warning/10 hover:bg-warning/20"
                  }`}
                  title={res.is_published ? "অপ্রকাশিত করতে ক্লিক করুন" : "প্রকাশ করতে ক্লিক করুন"}
                >
                  {res.is_published ? (
                    <>
                      <Eye className="w-3 h-3" />
                      <span>লাইভ প্রকাশিত</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3" />
                      <span>ড্রাফট / অপ্রকাশিত</span>
                    </>
                  )}
                </button>

                <a
                  href={res.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  <span>ফাইল দেখুন</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-surface rounded-2xl border border-border p-6 max-w-lg w-full shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-base text-text font-bengali">
                {editingId ? "রিসোর্স সম্পাদনা করুন" : "নতুন ফ্রি লেকচার শিট যোগ করুন"}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-secondary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text font-bengali mb-1">
                  রিসোর্সের বাংলা নাম *
                </label>
                <input
                  type="text"
                  required
                  placeholder="উদা: এইচএসসি পদার্থবিজ্ঞান সম্পূর্ণ সূত্র শিট"
                  value={form.titleBn}
                  onChange={(e) => setForm({ ...form, titleBn: e.target.value })}
                  className="input text-xs font-bengali w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text font-bengali mb-1">
                  ইংরেজি নাম
                </label>
                <input
                  type="text"
                  placeholder="e.g. HSC Physics Complete Formula Sheet"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input text-xs w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text font-bengali mb-1">
                    ক্যাটাগরি *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="input text-xs w-full font-bengali"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text font-bengali mb-1">
                    বিষয় (Subject)
                  </label>
                  <input
                    type="text"
                    placeholder="উদা: পদার্থবিজ্ঞান, গণিত"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="input text-xs font-bengali w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text font-bengali mb-1">
                    ফরম্যাট
                  </label>
                  <select
                    value={form.format}
                    onChange={(e) => setForm({ ...form, format: e.target.value })}
                    className="input text-xs w-full"
                  >
                    {FORMAT_OPTIONS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text font-bengali mb-1">
                    ডাউনলোড সংখ্যা
                  </label>
                  <input
                    type="number"
                    value={form.downloadCount}
                    onChange={(e) =>
                      setForm({ ...form, downloadCount: parseInt(e.target.value, 10) || 0 })
                    }
                    className="input text-xs w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text font-bengali mb-1">
                  সংক্ষিপ্ত বিবরণ / নোট
                </label>
                <textarea
                  rows={2}
                  placeholder="এই শিটে কী কী বিষয় কভার করা হয়েছে..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input text-xs font-bengali w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text font-bengali mb-1">
                  ডাউনলোড ফাইল লিংক (File URL) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/... অথবা PDF ডিরেক্ট লিংক"
                  value={form.fileUrl}
                  onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                  className="input text-xs font-mono w-full"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                />
                <label
                  htmlFor="is_published"
                  className="text-xs font-semibold text-text font-bengali cursor-pointer"
                >
                  ওয়েবসাইটে তাৎক্ষণিক প্রকাশ করুন (Publish Now)
                </label>
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
                  {submitting
                    ? "সংরক্ষণ হচ্ছে..."
                    : editingId
                    ? "আপডেট করুন"
                    : "প্রকাশ করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
