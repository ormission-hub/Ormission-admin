"use client";

import { useEffect, useState, useRef } from "react";
import {
  Plus,
  Trash2,
  GraduationCap,
  RefreshCw,
  X,
  CheckCircle2,
  Edit2,
  Upload,
  User,
  Loader2,
  Image as ImageIcon,
  Star,
  Eye,
  EyeOff,
  TrendingUp,
  Save,
  BookOpen,
  Award,
  Users,
  Quote,
} from "lucide-react";
import { dbService, type DbInstructor } from "@/lib/supabase/db-service";

interface FormState {
  name_bn: string;
  name: string;
  institution: string;
  designation: string;
  credentials: string; // Headline / Motto
  seo_title: string;   // Tag / Badge
  bio: string;
  photo_url: string;
  display_order: number;
  is_featured: boolean;
  is_published: boolean;
}

const DEFAULT_FORM: FormState = {
  name_bn: "",
  name: "",
  institution: "Ormission Education",
  designation: "প্রভাষক / মেন্টর",
  credentials: "",
  seo_title: "",
  bio: "",
  photo_url: "",
  display_order: 1,
  is_featured: true,
  is_published: true,
};

interface AboutSettings {
  stat1_value: string;
  stat1_label: string;
  stat2_value: string;
  stat2_label: string;
  stat3_value: string;
  stat3_label: string;
  default_badge?: string;
  default_headline?: string;
  default_description?: string;
}

const DEFAULT_ABOUT_SETTINGS: AboutSettings = {
  stat1_value: "10+",
  stat1_label: "Courses",
  stat2_value: "10K+",
  stat2_label: "Exams",
  stat3_value: "100K+",
  stat3_label: "Students",
  default_badge: "🎯 স্বপ্ন ছোঁয়ার প্রস্তুতি",
  default_headline: 'স্বপ্ন ছোঁয়ার আশা থাকলে সেই স্বপ্নের ভিত তৈরিতে সাথে আছে "ওরমিশন"',
  default_description:
    'অনলাইন বিশ্ববিদ্যালয় ভর্তি ও বোর্ড পরীক্ষার প্রস্তুতির জন্য দেশের সেরা প্ল্যাটফর্মগুলোর অন্যতম একটি হলো "ওরমিশন"। ভর্তি প্রস্তুতি নেওয়া শিক্ষার্থীদের সঠিক দিকনির্দেশনা, নিয়মিত পরীক্ষা, মানসম্মত ক্লাস এবং ধারাবাহিক প্রস্তুতির মাধ্যমে নিজেদের লক্ষ্যে পৌঁছাতে আমরা কাজ করে যাচ্ছি।',
};

export default function AdminInstructorsPage() {
  const [instructors, setInstructors] = useState<DbInstructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<DbInstructor | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  // About Us section settings (3 stats + default text)
  const [aboutSettings, setAboutSettings] = useState<AboutSettings>(DEFAULT_ABOUT_SETTINGS);
  const [savingSettings, setSavingSettings] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadInstructors = async () => {
    setLoading(true);
    const data = await dbService.getInstructors();
    setInstructors(data);
    setLoading(false);
  };

  const loadAboutSettings = async () => {
    try {
      const res = await fetch("/api/settings?key=about_settings");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.value && typeof data.value === "object") {
          setAboutSettings((prev) => ({ ...prev, ...data.value }));
        }
      }
    } catch (err) {
      console.error("Error loading about settings:", err);
    }
  };

  const handleSaveAboutSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "about_settings", value: aboutSettings }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification("আমাদের সম্পর্কে পরিসংখ্যান সফলভাবে সংরক্ষিত হয়েছে!");
      } else {
        alert(data.error || "সংরক্ষণ করা যায়নি।");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("সংরক্ষণ ব্যর্থ হয়েছে।");
    } finally {
      setSavingSettings(false);
    }
  };

  useEffect(() => {
    loadInstructors();
    loadAboutSettings();
  }, []);

  const openAddModal = () => {
    setEditingInstructor(null);
    setForm({
      ...DEFAULT_FORM,
      display_order: instructors.length + 1,
    });
    setShowModal(true);
  };

  const openEditModal = (inst: DbInstructor) => {
    setEditingInstructor(inst);
    setForm({
      name_bn: inst.name_bn || "",
      name: inst.name || "",
      institution: inst.institution || "",
      designation: inst.designation || "",
      credentials: inst.credentials || "",
      seo_title: inst.seo_title || "",
      bio: inst.bio || "",
      photo_url: inst.photo_url || "",
      display_order: inst.display_order ?? 1,
      is_featured: inst.is_featured ?? true,
      is_published: inst.is_published ?? true,
    });
    setShowModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      alert("ছবির সাইজ ৮ মেগাবাইট এর কম হতে হবে।");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setForm((prev) => ({ ...prev, photo_url: data.url }));
        showNotification("ছবি সফলভাবে আপলোড হয়েছে!");
      } else {
        alert(data.error || "ছবি আপলোড ব্যর্থ হয়েছে।");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("ছবি আপলোড করার সময় ত্রুটি হয়েছে।");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name_bn.trim()) {
      alert("শিক্ষকের বাংলা নাম লিখুন।");
      return;
    }

    setSubmitting(true);

    try {
      const sanitizedName = form.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      const slug = sanitizedName || `inst-${Date.now().toString().slice(-6)}`;

      if (editingInstructor) {
        // Update existing
        const updated = await dbService.updateInstructor(editingInstructor.id, {
          name: form.name.trim() || form.name_bn.trim(),
          name_bn: form.name_bn.trim(),
          slug: editingInstructor.slug || slug,
          institution: form.institution.trim() || "Ormission Education",
          designation: form.designation.trim() || "শিক্ষক ও মেন্টর",
          credentials: form.credentials.trim() || null,
          seo_title: form.seo_title.trim() || null,
          bio: form.bio.trim() || null,
          photo_url: form.photo_url.trim(),
          display_order: Number(form.display_order) || 1,
          is_featured: form.is_featured,
          is_published: form.is_published,
        });

        if (updated) {
          setInstructors((prev) =>
            prev
              .map((i) => (i.id === updated.id ? updated : i))
              .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
          );
          setShowModal(false);
          showNotification("শিক্ষকের তথ্য সফলভাবে আপডেট করা হয়েছে!");
        } else {
          alert("তথ্য আপডেট করতে সমস্যা হয়েছে।");
        }
      } else {
        // Create new
        const created = await dbService.createInstructor({
          name: form.name.trim() || form.name_bn.trim(),
          name_bn: form.name_bn.trim(),
          slug,
          institution: form.institution.trim() || "Ormission Education",
          designation: form.designation.trim() || "শিক্ষক ও মেন্টর",
          credentials: form.credentials.trim() || null,
          seo_title: form.seo_title.trim() || null,
          bio: form.bio.trim() || null,
          photo_url: form.photo_url.trim(),
          display_order: Number(form.display_order) || instructors.length + 1,
          is_featured: form.is_featured,
          is_published: form.is_published,
        });

        if (created) {
          setInstructors((prev) =>
            [...prev, created].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
          );
          setShowModal(false);
          showNotification("নতুন শিক্ষক সফলভাবে যুক্ত করা হয়েছে!");
        } else {
          alert("নতুন শিক্ষক যোগ করতে সমস্যা হয়েছে।");
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "সমস্যা হয়েছে, পুনরায় চেষ্টা করুন।";
      console.error("Error saving instructor:", err);
      alert(`শিক্ষকের তথ্য সংরক্ষণ করা যায়নি: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const togglePublished = async (inst: DbInstructor) => {
    const nextVal = !inst.is_published;
    try {
      const ok = await dbService.updateInstructor(inst.id, { is_published: nextVal });
      if (ok) {
        setInstructors((prev) =>
          prev.map((i) => (i.id === inst.id ? { ...i, is_published: nextVal } : i))
        );
        showNotification(nextVal ? "শিক্ষক প্রকাশিত হয়েছে।" : "শিক্ষক অপ্রকাশিত করা হয়েছে।");
      }
    } catch (err) {
      console.error("Failed to toggle published:", err);
      alert("স্ট্যাটাস পরিবর্তন করা সম্ভব হয়নি।");
    }
  };

  const toggleFeatured = async (inst: DbInstructor) => {
    const nextVal = !inst.is_featured;
    try {
      const ok = await dbService.updateInstructor(inst.id, { is_featured: nextVal });
      if (ok) {
        setInstructors((prev) =>
          prev.map((i) => (i.id === inst.id ? { ...i, is_featured: nextVal } : i))
        );
        showNotification(
          nextVal
            ? "'আমাদের সম্পর্কে' সেকশনে অন্তর্ভুক্ত করা হয়েছে।"
            : "'আমাদের সম্পর্কে' সেকশন থেকে সরানো হয়েছে।"
        );
      }
    } catch (err) {
      console.error("Failed to toggle featured:", err);
      alert("স্ট্যাটাস পরিবর্তন করা সম্ভব হয়নি।");
    }
  };

  const handleDelete = async (id: number, nameBn: string) => {
    if (confirm(`আপনি কি নিশ্চিত যে '${nameBn}'-এর প্রোফাইল ডাটাবেজ থেকে মুছে ফেলতে চান?`)) {
      const ok = await dbService.deleteInstructor(id);
      if (ok) {
        setInstructors((prev) => prev.filter((i) => i.id !== id));
        showNotification("শিক্ষক মুছে ফেলা হয়েছে।");
      } else {
        alert("ইন্সট্রাক্টর মোছা যায়নি। সম্ভবত তার অধীনে কোর্স রয়েছে।");
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-bengali transition-all duration-300 ${
            notification.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-surface"
              : "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 bg-surface"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-border">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-bold text-text font-bengali">
              শিক্ষক ও মেন্টর প্যানেল ({instructors.length})
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
              রিয়েল ডাটাবেজ
            </span>
          </div>
          <p className="text-xs text-text-muted font-bengali mt-1">
            &ldquo;আমাদের সম্পর্কে&rdquo; সেকশন ও কোর্সের জন্য শিক্ষকদের পরিচিতি ও প্রোফাইল ব্যবস্থাপনা
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
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
            onClick={openAddModal}
            className="btn btn-primary btn-sm font-bengali font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">নতুন শিক্ষক যোগ করুন</span>
            <span className="sm:hidden">যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* ─── About Us Stats & Global Settings Card ─── */}
      <div className="bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-border/70 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-text font-bengali">
                &ldquo;আমাদের সম্পর্কে&rdquo; ৩টি পরিসংখ্যান ও মূল বাণী
              </h2>
              <p className="text-xs text-text-muted font-bengali">
                ওয়েবসাইটের আমাদের সম্পর্কে সেকশনের নিচের ৩টি পরিসংখ্যান (কাউন্টার) এবং ডিফল্ট বাণী
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={savingSettings}
            onClick={() => handleSaveAboutSettings()}
            className="btn btn-primary btn-sm font-bengali font-bold flex items-center gap-1.5 self-end sm:self-auto shadow-xs"
          >
            {savingSettings ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>সংরক্ষণ হচ্ছে...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>পরিসংখ্যান সংরক্ষণ করুন</span>
              </>
            )}
          </button>
        </div>

        {/* 3 Stats inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {/* Stat 1 */}
          <div className="p-3.5 rounded-xl bg-surface-secondary/40 border border-border/70 space-y-2">
            <div className="text-[11px] font-bold text-text-muted font-bengali uppercase tracking-wider flex items-center justify-between">
              <span>পরিসংখ্যান ১ (Courses)</span>
              <BookOpen className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-medium text-text-muted mb-0.5">মান (Value)</label>
                <input
                  type="text"
                  placeholder="10+"
                  value={aboutSettings.stat1_value}
                  onChange={(e) => setAboutSettings({ ...aboutSettings, stat1_value: e.target.value })}
                  className="input text-xs w-full font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-text-muted mb-0.5">লেবেল (Label)</label>
                <input
                  type="text"
                  placeholder="Courses"
                  value={aboutSettings.stat1_label}
                  onChange={(e) => setAboutSettings({ ...aboutSettings, stat1_label: e.target.value })}
                  className="input text-xs w-full"
                />
              </div>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="p-3.5 rounded-xl bg-surface-secondary/40 border border-border/70 space-y-2">
            <div className="text-[11px] font-bold text-text-muted font-bengali uppercase tracking-wider flex items-center justify-between">
              <span>পরিসংখ্যান ২ (Exams)</span>
              <Award className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-medium text-text-muted mb-0.5">মান (Value)</label>
                <input
                  type="text"
                  placeholder="10K+"
                  value={aboutSettings.stat2_value}
                  onChange={(e) => setAboutSettings({ ...aboutSettings, stat2_value: e.target.value })}
                  className="input text-xs w-full font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-text-muted mb-0.5">লেবেল (Label)</label>
                <input
                  type="text"
                  placeholder="Exams"
                  value={aboutSettings.stat2_label}
                  onChange={(e) => setAboutSettings({ ...aboutSettings, stat2_label: e.target.value })}
                  className="input text-xs w-full"
                />
              </div>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="p-3.5 rounded-xl bg-surface-secondary/40 border border-border/70 space-y-2">
            <div className="text-[11px] font-bold text-text-muted font-bengali uppercase tracking-wider flex items-center justify-between">
              <span>পরিসংখ্যান ৩ (Students)</span>
              <Users className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-medium text-text-muted mb-0.5">মান (Value)</label>
                <input
                  type="text"
                  placeholder="100K+"
                  value={aboutSettings.stat3_value}
                  onChange={(e) => setAboutSettings({ ...aboutSettings, stat3_value: e.target.value })}
                  className="input text-xs w-full font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-text-muted mb-0.5">লেবেল (Label)</label>
                <input
                  type="text"
                  placeholder="Students"
                  value={aboutSettings.stat3_label}
                  onChange={(e) => setAboutSettings({ ...aboutSettings, stat3_label: e.target.value })}
                  className="input text-xs w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Global default fallback headline & tag */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-border/60">
          <div>
            <label className="block text-xs font-semibold text-text font-bengali mb-1">
              ডিফল্ট বাণীর হেডলাইন (যদি শিক্ষকের কাস্টম না থাকে)
            </label>
            <input
              type="text"
              value={aboutSettings.default_headline || ""}
              onChange={(e) => setAboutSettings({ ...aboutSettings, default_headline: e.target.value })}
              className="input text-xs font-bengali w-full"
              placeholder='উদা: স্বপ্ন ছোঁয়ার আশা থাকলে সেই স্বপ্নের ভিত তৈরিতে সাথে আছে "ওরমিশন"'
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text font-bengali mb-1">
              ডিফল্ট ট্যাগ / ব্যাজ (Tag Badge)
            </label>
            <input
              type="text"
              value={aboutSettings.default_badge || ""}
              onChange={(e) => setAboutSettings({ ...aboutSettings, default_badge: e.target.value })}
              className="input text-xs font-bengali w-full"
              placeholder="উদা: 🎯 স্বপ্ন ছোঁয়ার প্রস্তুতি"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="bg-surface rounded-2xl border border-border p-12 text-center text-xs text-text-muted font-bengali shadow-xs">
          <RefreshCw className="w-6 h-6 mx-auto mb-2.5 animate-spin text-primary" />
          শিক্ষকদের তথ্য লোড হচ্ছে...
        </div>
      ) : instructors.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-border p-12 text-center shadow-xs">
          <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30 text-text-muted" />
          <h3 className="text-base font-bold text-text font-bengali mb-1">
            কোনো শিক্ষক নিবন্ধিত নেই
          </h3>
          <p className="text-xs text-text-muted font-bengali mb-4 max-w-sm mx-auto">
            &ldquo;আমাদের সম্পর্কে&rdquo; সেকশনে শিক্ষক প্রদর্শন করতে নতুন শিক্ষক যুক্ত করুন।
          </p>
          <button
            type="button"
            onClick={openAddModal}
            className="btn btn-primary btn-sm font-bengali font-bold inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>প্রথম শিক্ষক যোগ করুন</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {instructors.map((inst) => (
            <div
              key={inst.id}
              className={`bg-surface rounded-2xl border transition-all duration-200 p-5 shadow-xs flex flex-col justify-between ${
                inst.is_published
                  ? "border-border hover:border-primary/50 hover:shadow-md"
                  : "border-border/60 opacity-75 bg-surface/60"
              }`}
            >
              <div>
                {/* Card Top: Photo, Names, and Actions */}
                <div className="flex items-start justify-between gap-3 mb-3.5">
                  <div className="flex items-center gap-3.5">
                    {/* Photo with avatar fallback */}
                    <div className="relative w-14 h-14 rounded-full bg-surface-secondary border-2 border-primary/30 overflow-hidden flex-shrink-0 flex items-center justify-center text-primary font-bold text-lg shadow-xs">
                      {inst.photo_url ? (
                        <img
                          src={inst.photo_url}
                          alt={inst.name_bn || inst.name}
                          className="w-full h-full object-cover object-top"
                          onError={(e) => {
                            // Fallback on image load error
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <span>{(inst.name_bn || inst.name || "T").charAt(0)}</span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-base font-bold text-text font-bengali leading-tight">
                          {inst.name_bn || inst.name}
                        </h3>
                        {inst.display_order !== undefined && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-secondary text-text-muted font-sans font-medium border border-border">
                            #{inst.display_order}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-primary font-bengali mt-0.5">
                        {inst.designation || "শিক্ষক ও মেন্টর"}
                      </div>
                      <div className="text-[11px] text-text-muted font-bengali">
                        {inst.institution || "Ormission Education"}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(inst)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                      title="সম্পাদনা করুন"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(inst.id, inst.name_bn || inst.name)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Custom Headline or Tag if set */}
                {(inst.seo_title || inst.credentials) && (
                  <div className="mb-2.5 p-2 rounded-lg bg-surface-secondary/70 border border-border/60 space-y-1">
                    {inst.seo_title && (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bengali">
                        {inst.seo_title}
                      </span>
                    )}
                    {inst.credentials && (
                      <p className="text-xs font-bold text-text font-bengali line-clamp-2">
                        &ldquo;{inst.credentials}&rdquo;
                      </p>
                    )}
                  </div>
                )}

                {/* Bio text */}
                <p className="text-xs text-text-muted font-bengali line-clamp-3 mb-4 leading-relaxed bg-surface-secondary/40 p-2.5 rounded-xl border border-border/60">
                  {inst.bio || "অনলাইন বিশ্ববিদ্যালয় ভর্তি ও বোর্ড পরীক্ষার বিশিষ্ট শিক্ষক ও মেন্টর।"}
                </p>
              </div>

              {/* Badges & Quick Toggles */}
              <div className="pt-3 border-t border-border flex items-center justify-between text-xs gap-2 flex-wrap">
                {/* Published toggle */}
                <button
                  type="button"
                  onClick={() => togglePublished(inst)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold font-bengali transition-colors ${
                    inst.is_published
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                      : "bg-slate-200/60 dark:bg-slate-800 text-slate-500 hover:bg-slate-200"
                  }`}
                  title="ক্লিক করে সক্রিয়/নিষ্ক্রিয় পরিবর্তন করুন"
                >
                  {inst.is_published ? (
                    <>
                      <Eye className="w-3 h-3" />
                      <span>সক্রিয়</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3" />
                      <span>অপ্রকাশিত</span>
                    </>
                  )}
                </button>

                {/* Featured in About Us toggle */}
                <button
                  type="button"
                  onClick={() => toggleFeatured(inst)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold font-bengali transition-colors ${
                    inst.is_featured
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20"
                      : "bg-surface-secondary text-text-muted border border-border hover:bg-surface-secondary/80"
                  }`}
                  title="ক্লিক করে আমাদের সম্পর্কে সেকশনে দেখানো টগল করুন"
                >
                  <Star className={`w-3 h-3 ${inst.is_featured ? "fill-amber-500" : ""}`} />
                  <span>আমাদের সম্পর্কে</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Instructor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-surface rounded-2xl border border-border p-6 max-w-lg w-full shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-base text-text font-bengali">
                  {editingInstructor ? "শিক্ষকের তথ্য সম্পাদনা করুন" : "নতুন শিক্ষক যুক্ত করুন"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-secondary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Photo Upload Section */}
              <div className="p-3.5 rounded-xl bg-surface-secondary/50 border border-border space-y-3">
                <label className="block text-xs font-bold text-text font-bengali">
                  শিক্ষকের ছবি (Teacher Photo)
                </label>

                <div className="flex items-center gap-4">
                  {/* Photo Preview Circle */}
                  <div className="relative w-20 h-20 rounded-full bg-surface border-2 border-primary/40 overflow-hidden flex-shrink-0 flex items-center justify-center text-text-muted shadow-sm">
                    {form.photo_url ? (
                      <img
                        src={form.photo_url}
                        alt="Preview"
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <User className="w-8 h-8 opacity-40" />
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="btn btn-outline btn-sm font-bengali text-xs w-full flex items-center justify-center gap-1.5 py-2 font-bold"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>আপলোড হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5 text-primary" />
                          <span>ডিভাইস থেকে ছবি আপলোড করুন</span>
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-text-muted font-bengali">
                      JPG, PNG, WEBP ফরম্যাট (সর্বোচ্চ ৮ মেগাবাইট)
                    </p>
                  </div>
                </div>

                {/* Manual Photo URL input */}
                <div>
                  <label className="block text-[11px] font-medium text-text-muted font-bengali mb-1">
                    অথবা সরাসরি ছবির লিংক (Photo URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://.../photo.jpg"
                    value={form.photo_url}
                    onChange={(e) => setForm({ ...form, photo_url: e.target.value })}
                    className="input text-xs font-sans w-full"
                  />
                </div>
              </div>

              {/* Name (Bengali & English) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text font-bengali mb-1">
                    শিক্ষকের বাংলা নাম *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="উদা: মোঃ ওহিদ রাশেদ"
                    value={form.name_bn}
                    onChange={(e) => setForm({ ...form, name_bn: e.target.value })}
                    className="input text-xs font-bengali w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text font-bengali mb-1">
                    ইংরেজি নাম (English Name)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Md. Ohid Rashed"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input text-xs w-full"
                  />
                </div>
              </div>

              {/* Designation & Institution */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text font-bengali mb-1">
                    পদবি (Designation) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="উদা: মালিক ও পরিচালক / সিনিয়র মেন্টর"
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    className="input text-xs font-bengali w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text font-bengali mb-1">
                    শিক্ষা প্রতিষ্ঠান (Institution)
                  </label>
                  <input
                    type="text"
                    placeholder="উদা: Ormission Education / চট্টগ্রাম বিশ্ববিদ্যালয়"
                    value={form.institution}
                    onChange={(e) => setForm({ ...form, institution: e.target.value })}
                    className="input text-xs font-bengali w-full"
                  />
                </div>
              </div>

              {/* Custom Headline / Quote & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-surface-secondary/40 border border-border/70">
                <div>
                  <label className="block text-xs font-semibold text-text font-bengali mb-1">
                    বাণীর মূল হেডলাইন (Headline / Quote)
                  </label>
                  <input
                    type="text"
                    placeholder='উদা: স্বপ্ন ছোঁয়ার আশা থাকলে সাথে আছে "ওরমিশন"'
                    value={form.credentials}
                    onChange={(e) => setForm({ ...form, credentials: e.target.value })}
                    className="input text-xs font-bengali w-full"
                  />
                  <p className="text-[10px] text-text-muted mt-0.5 font-bengali">
                    খালি রাখলে ডিফল্ট হেডলাইন প্রদর্শিত হবে
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text font-bengali mb-1">
                    বাণীর ট্যাগ / ব্যাজ (Tag Badge)
                  </label>
                  <input
                    type="text"
                    placeholder="উদা: 🎯 স্বপ্ন ছোঁয়ার প্রস্তুতি"
                    value={form.seo_title}
                    onChange={(e) => setForm({ ...form, seo_title: e.target.value })}
                    className="input text-xs font-bengali w-full"
                  />
                  <p className="text-[10px] text-text-muted mt-0.5 font-bengali">
                    খালি রাখলে ডিফল্ট ব্যাজ প্রদর্শিত হবে
                  </p>
                </div>
              </div>

              {/* Bio / Detailed Narrative */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-text font-bengali">
                    বিস্তারিত বক্তব্য, পরিচিতি ও দিকনির্দেশনা (Bio / Detailed Message)
                  </label>
                  <span className="text-[10px] text-primary font-bold font-bengali">
                    &ldquo;আমাদের সম্পর্কে&rdquo; সেকশনে প্রদর্শিত হবে
                  </span>
                </div>
                <textarea
                  rows={4}
                  placeholder="শিক্ষকের বিস্তারিত বক্তব্য, ছাত্রদের প্রতি দিকনির্দেশনা, দর্শন বা পরিচিতি লিখুন..."
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="input text-xs font-bengali w-full py-2 leading-relaxed"
                />
                <p className="text-[10px] text-text-muted mt-0.5 font-bengali">
                  খালি রাখলে প্ল্যাটফর্মের সাধারণ পরিচিতি প্রদর্শিত হবে।
                </p>
              </div>

              {/* Display Order & Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center pt-1">
                <div>
                  <label className="block text-xs font-semibold text-text font-bengali mb-1">
                    প্রদর্শনের ক্রম (Order)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.display_order}
                    onChange={(e) =>
                      setForm({ ...form, display_order: parseInt(e.target.value) || 1 })
                    }
                    className="input text-xs w-full font-bold"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-4 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.is_published}
                      onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                      className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                    />
                    <span className="text-xs font-semibold text-text font-bengali">
                      প্রকাশিত (Active)
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.is_featured}
                      onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                      className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                    />
                    <span className="text-xs font-semibold text-text font-bengali">
                      আমাদের সম্পর্কে সেকশনে অন্তর্ভুক্ত
                    </span>
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-outline btn-sm font-bengali"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting || isUploading}
                  className="btn btn-primary btn-sm font-bengali font-bold min-w-[100px] flex items-center justify-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>সংরক্ষণ হচ্ছে...</span>
                    </>
                  ) : (
                    <span>সংরক্ষণ করুন</span>
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
