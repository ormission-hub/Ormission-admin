"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, FileDown, RefreshCw, X, CheckCircle2, ExternalLink } from "lucide-react";
import { dbService, type DbResource } from "@/lib/supabase/db-service";

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<DbResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    titleBn: "",
    title: "",
    fileSize: "3.5 MB",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    format: "PDF",
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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titleBn) {
      alert("রিসোর্সের বাংলা নাম লিখুন।");
      return;
    }
    setSubmitting(true);
    const slug = form.title
      ? form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      : `res-${Date.now()}`;

    const created = await dbService.createResource({
      title: form.title || form.titleBn,
      title_bn: form.titleBn,
      file_url: form.fileUrl,
      file_type: form.format,
      download_count: 0,
      is_published: true,
    });

    if (created) {
      setResources((prev) => [created, ...prev]);
      setShowModal(false);
      setForm({
        titleBn: "",
        title: "",
        fileSize: "3.5 MB",
        fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        format: "PDF",
      });
    } else {
      alert("রিসোর্স সংরক্ষণ করতে সমস্যা হয়েছে।");
    }
    setSubmitting(false);
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
              Supabase Resources
            </span>
          </div>
          <p className="text-xs text-text-muted font-bengali mt-0.5">
            শিক্ষার্থীদের জন্য বিনামূল্যে ডাউনলোডযোগ্য পিডিএফ শিট ও ফর্মুলা বুকলেট প্রকাশনা
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
            onClick={() => setShowModal(true)}
            className="btn btn-primary btn-sm font-bengali font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন শিট আপলোড</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center text-xs text-text-muted font-bengali">
          <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-primary" />
          রিসোর্স ডাটা লোড হচ্ছে...
        </div>
      ) : resources.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center">
          <FileDown className="w-10 h-10 mx-auto mb-3 opacity-30 text-text-muted" />
          <h3 className="text-base font-bold text-text font-bengali mb-1">
            কোনো রিসোর্স নেই
          </h3>
          <p className="text-xs text-text-muted font-bengali mb-4">
            শিক্ষার্থীদের জন্য ফ্রি লেকচার শিট বা ফর্মুলা শিট যোগ করুন।
          </p>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="btn btn-primary btn-sm font-bengali font-bold"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            প্রথম রিসোর্স যোগ করুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map((res) => (
            <div
              key={res.id}
              className="bg-surface rounded-xl border border-border p-5 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary/10 text-secondary border border-secondary/20 uppercase">
                    {res.file_type || "PDF"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(res.id, res.title_bn || res.title)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-sm font-bold text-text font-bengali mb-2 line-clamp-2">
                  {res.title_bn || res.title}
                </h3>

                <div className="flex items-center gap-1 text-xs text-text-muted font-sans mb-3">
                  <FileDown className="w-3.5 h-3.5 text-primary" />
                  <span>{(res.download_count || 0).toLocaleString()} বার ডাউনলোড হয়েছে</span>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-success font-semibold text-[11px] font-bengali">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  লাইভ প্রকাশিত
                </span>
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

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-surface rounded-xl border border-border p-6 max-w-md w-full shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="font-bold text-base text-text font-bengali">
                নতুন ফ্রি লেকচার শিট যোগ করুন
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
                  placeholder="e.g. HSC Physics Formula Sheet"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input text-xs w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text font-bengali mb-1">
                    ফাইলের আকার (Size)
                  </label>
                  <input
                    type="text"
                    placeholder="3.8 MB"
                    value={form.fileSize}
                    onChange={(e) => setForm({ ...form, fileSize: e.target.value })}
                    className="input text-xs w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text font-bengali mb-1">
                    ফরম্যাট
                  </label>
                  <select
                    value={form.format}
                    onChange={(e) => setForm({ ...form, format: e.target.value })}
                    className="input text-xs w-full"
                  >
                    <option value="PDF">PDF</option>
                    <option value="DOCX">DOCX</option>
                    <option value="ZIP">ZIP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text font-bengali mb-1">
                  ডাউনলোড ফাইল লিংক (File URL) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://your-cloud-storage.com/sheet.pdf"
                  value={form.fileUrl}
                  onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                  className="input text-xs font-mono w-full"
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
                  {submitting ? "আপলোড হচ্ছে..." : "প্রকাশ করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
