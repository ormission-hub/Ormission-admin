"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, GraduationCap, RefreshCw, X, CheckCircle2 } from "lucide-react";
import { dbService, type DbInstructor } from "@/lib/supabase/db-service";

export default function AdminInstructorsPage() {
  const [instructors, setInstructors] = useState<DbInstructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    nameBn: "",
    name: "",
    institution: "",
    designation: "",
    bio: "",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
  });

  const loadInstructors = async () => {
    setLoading(true);
    const data = await dbService.getInstructors();
    setInstructors(data);
    setLoading(false);
  };

  useEffect(() => {
    loadInstructors();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nameBn) {
      alert("শিক্ষকের বাংলা নাম লিখুন।");
      return;
    }
    setSubmitting(true);
    const slug = form.name
      ? form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      : `inst-${Date.now()}`;

    const created = await dbService.createInstructor({
      name: form.name || form.nameBn,
      name_bn: form.nameBn,
      slug: slug,
      institution: form.institution || "বিশ্ববিদ্যালয় শিক্ষক",
      designation: form.designation || "লেকচারার",
      bio: form.bio,
      photo_url: form.photoUrl,
      is_featured: true,
      is_published: true,
    });

    if (created) {
      setInstructors((prev) => [...prev, created]);
      setShowModal(false);
      setForm({
        nameBn: "",
        name: "",
        institution: "",
        designation: "",
        bio: "",
        photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
      });
    } else {
      alert("ইন্সট্রাক্টর যোগ করতে সমস্যা হয়েছে।");
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: number, nameBn: string) => {
    if (confirm(`আপনি কি নিশ্চিত যে '${nameBn}'-এর প্রোফাইল ডাটাবেজ থেকে মুছে ফেলতে চান?`)) {
      const ok = await dbService.deleteInstructor(id);
      if (ok) {
        setInstructors((prev) => prev.filter((i) => i.id !== id));
      } else {
        alert("ইন্সট্রাক্টর মোছা যায়নি। সম্ভবত তার অধীনে কোর্স রয়েছে।");
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
              ইন্সট্রাক্টর প্যানেল ({instructors.length})
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
              Supabase DB
            </span>
          </div>
          <p className="text-xs text-text-muted font-bengali mt-0.5">
            শিক্ষকদের প্রোফাইল, শিক্ষা প্রতিষ্ঠান পরিচিতি ও কোর্স অ্যাসাইনমেন্ট
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadInstructors}
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
            <span>নতুন শিক্ষক যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center text-xs text-text-muted font-bengali">
          <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-primary" />
          ইন্সট্রাক্টরদের তথ্য লোড হচ্ছে...
        </div>
      ) : instructors.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center">
          <GraduationCap className="w-10 h-10 mx-auto mb-3 opacity-30 text-text-muted" />
          <h3 className="text-base font-bold text-text font-bengali mb-1">
            কোনো শিক্ষক নিবন্ধিত নেই
          </h3>
          <p className="text-xs text-text-muted font-bengali mb-4">
            নতুন শিক্ষক যোগ করুন অথবা ড্যাশবোর্ড থেকে প্রাথমিক ডেটা সিড করুন।
          </p>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="btn btn-primary btn-sm font-bengali font-bold"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            প্রথম শিক্ষক যোগ করুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instructors.map((inst) => (
            <div
              key={inst.id}
              className="bg-surface rounded-xl border border-border p-5 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-surface-secondary border border-border overflow-hidden flex-shrink-0 flex items-center justify-center text-primary font-bold text-base">
                      {inst.name_bn ? inst.name_bn.charAt(0) : "T"}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-text font-bengali">
                        {inst.name_bn || inst.name}
                      </h3>
                      <div className="text-xs font-semibold text-primary font-bengali">
                        {inst.institution || "ইনস্টিটিউট শিক্ষক"}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(inst.id, inst.name_bn || inst.name)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs text-text-muted font-bengali line-clamp-3 mb-4">
                  {inst.bio || "অনলাইন কোর্সের সম্মানিত শিক্ষক ও মেন্টর।"}
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-text-muted">
                <span className="inline-flex items-center gap-1 text-success font-semibold text-[11px] font-bengali">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  সক্রিয় ফ্যাকাল্টি
                </span>
                <span className="text-[11px] font-bengali">{inst.designation || "ফ্যাকাল্টি"}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Instructor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-surface rounded-xl border border-border p-6 max-w-md w-full shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="font-bold text-base text-text font-bengali">
                নতুন শিক্ষক যুক্ত করুন
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
                  শিক্ষকের বাংলা নাম *
                </label>
                <input
                  type="text"
                  required
                  placeholder="উদা: ড. মো. রফিকুল ইসলাম"
                  value={form.nameBn}
                  onChange={(e) => setForm({ ...form, nameBn: e.target.value })}
                  className="input text-xs font-bengali w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text font-bengali mb-1">
                  ইংরেজি নাম (English Name)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Rafiqul Islam"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input text-xs w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text font-bengali mb-1">
                  শিক্ষা প্রতিষ্ঠান (Institution) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="উদা: বুয়েট (BUET) / ঢাকা মেডিকেল"
                  value={form.institution}
                  onChange={(e) => setForm({ ...form, institution: e.target.value })}
                  className="input text-xs font-bengali w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text font-bengali mb-1">
                  পদবি (Designation)
                </label>
                <input
                  type="text"
                  placeholder="উদা: সিনিয়র লেকচারার / কনসালট্যান্ট"
                  value={form.designation}
                  onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  className="input text-xs font-bengali w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text font-bengali mb-1">
                  সংক্ষিপ্ত পরিচিতি ও অভিজ্ঞতা
                </label>
                <textarea
                  rows={3}
                  placeholder="শিক্ষকের শিক্ষাগত যোগ্যতা ও সফলতার বিবরণ..."
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
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
