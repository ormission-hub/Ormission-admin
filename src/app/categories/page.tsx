"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  FolderTree,
  CheckCircle2,
  RefreshCw,
  X,
  Edit2,
  Eye,
  EyeOff,
  Search,
  FlaskConical,
  Stethoscope,
  Calculator,
  Building2,
  GraduationCap,
  BookOpen,
  Briefcase,
  Globe,
  Code,
  Atom,
  Microscope,
  Award,
  Sparkles,
  Brain,
  Laptop,
  Compass,
  Palette,
  Layers,
  ArrowUpRight,
  LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { dbService, type DbCategory } from "@/lib/supabase/db-service";

// Curated Educational Icon Options for categories
export const ICON_OPTIONS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "flask", label: "Science & Lab", icon: FlaskConical },
  { id: "stethoscope", label: "Medical & Health", icon: Stethoscope },
  { id: "calculator", label: "Engineering & Math", icon: Calculator },
  { id: "building", label: "University Campus", icon: Building2 },
  { id: "graduation", label: "Board Exam / SSC", icon: GraduationCap },
  { id: "book", label: "Arts & Commerce", icon: BookOpen },
  { id: "briefcase", label: "Career & Tech", icon: Briefcase },
  { id: "globe", label: "English & Global", icon: Globe },
  { id: "code", label: "Programming & Web", icon: Code },
  { id: "atom", label: "Physics & Theory", icon: Atom },
  { id: "microscope", label: "Biology & Research", icon: Microscope },
  { id: "award", label: "Excellence & Badges", icon: Award },
  { id: "sparkles", label: "Special Edition", icon: Sparkles },
  { id: "brain", label: "Mental Agility & GK", icon: Brain },
  { id: "laptop", label: "Computer Science", icon: Laptop },
  { id: "compass", label: "Guidance & Strategy", icon: Compass },
  { id: "palette", label: "Creative & Design", icon: Palette },
  { id: "layers", label: "General Course", icon: Layers },
];

export function getCategoryIcon(iconName?: string | null): LucideIcon {
  if (!iconName) return BookOpen;
  const found = ICON_OPTIONS.find((opt) => opt.id === iconName.toLowerCase().trim());
  return found ? found.icon : BookOpen;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DbCategory | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nameBn: "",
    name: "",
    slug: "",
    description: "",
    iconName: "book",
    displayOrder: 1,
    isPublished: true,
  });

  const loadCategories = async () => {
    setLoading(true);
    const data = await dbService.getCategories();
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({
      nameBn: "",
      name: "",
      slug: "",
      description: "",
      iconName: "flask",
      displayOrder: categories.length + 1,
      isPublished: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: DbCategory) => {
    setEditingCategory(cat);
    setFormData({
      nameBn: cat.name_bn || cat.name,
      name: cat.name || "",
      slug: cat.slug || "",
      description: cat.description || "",
      iconName: cat.icon_name || "book",
      displayOrder: cat.display_order || 1,
      isPublished: cat.is_published ?? true,
    });
    setIsModalOpen(true);
  };

  const handleSlugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameBn.trim()) {
      alert("ক্যাটাগরির বাংলা নাম লিখুন।");
      return;
    }

    setSubmitting(true);
    const slug = formData.slug.trim()
      ? handleSlugify(formData.slug)
      : handleSlugify(formData.name || formData.nameBn) || `cat-${Date.now()}`;

    try {
      if (editingCategory) {
        // Update existing
        const ok = await dbService.updateCategory(editingCategory.id, {
          name: formData.name.trim() || formData.nameBn.trim(),
          name_bn: formData.nameBn.trim(),
          slug: slug,
          description: formData.description.trim(),
          icon_name: formData.iconName,
          display_order: Number(formData.displayOrder) || 1,
          is_published: formData.isPublished,
        });

        if (ok) {
          setCategories((prev) =>
            prev.map((c) =>
              c.id === editingCategory.id
                ? {
                    ...c,
                    name: formData.name.trim() || formData.nameBn.trim(),
                    name_bn: formData.nameBn.trim(),
                    slug: slug,
                    description: formData.description.trim(),
                    icon_name: formData.iconName,
                    display_order: Number(formData.displayOrder) || 1,
                    is_published: formData.isPublished,
                  }
                : c
            )
          );
          setIsModalOpen(false);
        } else {
          alert("ক্যাটাগরি আপডেট করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।");
        }
      } else {
        // Create new
        const created = await dbService.createCategory({
          name: formData.name.trim() || formData.nameBn.trim(),
          name_bn: formData.nameBn.trim(),
          slug: slug,
          description: formData.description.trim(),
          icon_name: formData.iconName,
          display_order: Number(formData.displayOrder) || categories.length + 1,
          is_published: formData.isPublished,
        });

        if (created) {
          setCategories((prev) => [...prev, created]);
          setIsModalOpen(false);
        } else {
          alert("ক্যাটাগরি তৈরিতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
        }
      }
    } catch (err) {
      console.error(err);
      alert("অপ্রত্যাশিত সমস্যা হয়েছে। কনসোল চেক করুন।");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (cat: DbCategory) => {
    const nextStatus = !cat.is_published;
    const ok = await dbService.updateCategory(cat.id, { is_published: nextStatus });
    if (ok) {
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, is_published: nextStatus } : c))
      );
    } else {
      alert("স্ট্যাটাস পরিবর্তন করা সম্ভব হয়নি।");
    }
  };

  const handleDelete = async (id: number, nameBn: string) => {
    if (
      confirm(
        `আপনি কি নিশ্চিত যে '${nameBn}' ক্যাটাগরি মুছে ফেলতে চান?\n\nএটি ডিলিট করলে ওয়েবসাইটে কোর্স গ্রিড স্বয়ংক্রিয়ভাবে ব্যালান্স হয়ে সাজিয়ে যাবে।`
      )
    ) {
      const ok = await dbService.deleteCategory(id);
      if (ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
      } else {
        alert("ক্যাটাগরি মোছা যায়নি। সম্ভবত এতে কোনো কোর্স লিঙ্ক করা আছে।");
      }
    }
  };

  const filteredCategories = categories.filter(
    (c) =>
      c.name_bn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const publishedCount = categories.filter((c) => c.is_published).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-text font-bengali">
                কোর্স ক্যাটাগরি ও বিষয় ব্যবস্থাপনা
              </h1>
              <p className="text-xs text-text-muted font-bengali mt-0.5">
                ওয়েবসাইটের হোমপেজের সকল কোর্স ক্যাটাগরি কার্ড, আইকন ও লেআউট নিয়ন্ত্রণ করুন।
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={loadCategories}
            disabled={loading}
            className="p-2.5 rounded-xl border border-border bg-surface hover:bg-surface-secondary text-text-muted hover:text-text transition-colors"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-primary" : ""}`} />
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-primary via-blue-600 to-primary-hover shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all font-bengali cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন ক্যাটাগরি তৈরি করুন</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs">
          <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider font-mono">
            Total Categories
          </div>
          <div className="text-2xl font-black text-text mt-1">
            {categories.length}{" "}
            <span className="text-xs font-medium text-text-muted">টি ক্যাটাগরি</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs">
          <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider font-mono">
            Live on Website
          </div>
          <div className="text-2xl font-black text-emerald-500 mt-1 flex items-center gap-1.5">
            <span>{publishedCount}</span>
            <span className="text-xs font-medium text-text-muted font-bengali">সক্রিয় কার্ড</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs">
          <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider font-mono">
            Hidden / Draft
          </div>
          <div className="text-2xl font-black text-amber-500 mt-1">
            {categories.length - publishedCount}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs">
          <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider font-mono">
            Layout Engine
          </div>
          <div className="text-xs font-bold text-primary flex items-center gap-1 mt-2 font-bengali">
            <Sparkles className="w-3.5 h-3.5" />
            <span>অটো-ফিট ব্যালান্সড গ্রিড</span>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-surface border border-border">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="ক্যাটাগরির নাম বা স্লাগ দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-surface-secondary/60 rounded-xl border border-border focus:border-primary focus:outline-hidden font-bengali"
          />
        </div>

        <div className="text-xs text-text-muted font-bengali">
          প্রদর্শিত হচ্ছে: <span className="font-bold text-text">{filteredCategories.length}</span> টি
        </div>
      </div>

      {/* 4. Grid of Category Cards */}
      {loading ? (
        <div className="bg-surface rounded-3xl border border-border p-16 text-center text-xs text-text-muted font-bengali">
          <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-primary" />
          <span>ক্যাটাগরি ডেটা লোড হচ্ছে...</span>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-surface rounded-3xl border border-border p-16 text-center space-y-4">
          <FolderTree className="w-12 h-12 mx-auto opacity-30 text-text-muted" />
          <h3 className="text-base font-bold text-text font-bengali">
            {searchQuery ? "কোনো ফলাফল পাওয়া যায়নি" : "কোনো ক্যাটাগরি তৈরি করা নেই"}
          </h3>
          <p className="text-xs text-text-muted font-bengali max-w-sm mx-auto">
            {searchQuery
              ? "অন্য কোনো শব্দ দিয়ে সার্চ করে দেখুন।"
              : "নতুন ক্যাটাগরি যোগ করতে নিচের বাটনে ক্লিক করুন।"}
          </p>
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-hover transition-colors font-bengali"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন ক্যাটাগরি তৈরি করুন</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {filteredCategories.map((cat) => {
              const IconComponent = getCategoryIcon(cat.icon_name);
              const isLive = cat.is_published;

              return (
                <motion.div
                  key={cat.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`
                    group relative rounded-2xl border p-4 transition-all duration-200
                    bg-surface flex flex-col justify-between
                    ${
                      isLive
                        ? "border-border hover:border-primary/50 hover:shadow-md"
                        : "border-dashed border-border/70 opacity-60 bg-surface/50"
                    }
                  `}
                >
                  <div>
                    {/* Top Row: Icon + Badges */}
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                        <IconComponent className="w-5 h-5" />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-surface-secondary text-text-muted text-[10px] font-mono border border-border">
                          #{cat.display_order}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleTogglePublish(cat)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                            isLive
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-slate-500/15 text-slate-500 border border-slate-500/20"
                          }`}
                          title={isLive ? "ক্লিক করে হাইড করুন" : "ক্লিক করে লাইভ করুন"}
                        >
                          {isLive ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>লাইভ</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>হাইড</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Category Title */}
                    <h3
                      className="text-sm font-bold text-text font-bengali leading-snug group-hover:text-primary transition-colors line-clamp-2"
                      title={cat.name_bn || cat.name}
                    >
                      {cat.name_bn || cat.name}
                    </h3>

                    {cat.name && cat.name !== cat.name_bn && (
                      <p className="text-[11px] text-text-muted font-medium truncate mt-0.5">
                        {cat.name}
                      </p>
                    )}

                    {/* Slug & Description */}
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-primary/80 font-mono bg-primary/5 px-2 py-1 rounded-lg w-fit">
                      <span>/{cat.slug}</span>
                      <ArrowUpRight className="w-3 h-3 opacity-60" />
                    </div>

                    {cat.description && (
                      <p className="text-xs text-text-muted font-bengali line-clamp-2 mt-2 leading-relaxed">
                        {cat.description}
                      </p>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-3 mt-4 border-t border-border/60 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => openEditModal(cat)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-text-muted hover:text-text hover:bg-surface-secondary transition-colors cursor-pointer font-bengali"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-primary" />
                      <span>এডিট করুন</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(cat.id, cat.name_bn || cat.name)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* 5. Add / Edit Category Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg rounded-3xl border border-border bg-surface shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                    <FolderTree className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-text font-bengali">
                      {editingCategory ? "ক্যাটাগরি সম্পাদনা করুন" : "নতুন ক্যাটাগরি তৈরি করুন"}
                    </h3>
                    <p className="text-[11px] text-text-muted font-bengali">
                      ওয়েবসাইটের হোমপেজ এবং কোর্স পেইজে প্রদর্শিত তথ্য নির্ধারণ করুন
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-secondary"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Bengali Name */}
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1 font-bengali">
                    ক্যাটাগরির নাম (বাংলা) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="উদা: এইচএসসি সায়েন্স (Physics, Chem, Math, Bio)"
                    value={formData.nameBn}
                    onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                    className="input w-full text-xs font-bengali"
                  />
                </div>

                {/* English Name & Slug */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-text-muted mb-1">
                      English Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. HSC Science"
                      value={formData.name}
                      onChange={(e) => {
                        const newName = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          name: newName,
                          slug: prev.slug ? prev.slug : handleSlugify(newName),
                        }));
                      }}
                      className="input w-full text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-muted mb-1 font-mono">
                      URL Slug *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. hsc-science"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="input w-full text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Icon Picker */}
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1.5 font-bengali">
                    কার্ডের আইকন নির্বাচন করুন
                  </label>
                  <div className="grid grid-cols-6 gap-2 p-3 rounded-2xl bg-surface-secondary/50 border border-border max-h-36 overflow-y-auto">
                    {ICON_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = formData.iconName === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, iconName: opt.id })}
                          className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                            isSelected
                              ? "bg-primary text-white border-primary shadow-xs scale-105"
                              : "bg-surface text-text-muted hover:text-text hover:border-primary/40"
                          }`}
                          title={opt.label}
                        >
                          <Icon className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-text-muted mt-1 font-bengali">
                    নির্বাচিত আইকন: <span className="font-bold text-primary font-mono">{formData.iconName}</span>
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1 font-bengali">
                    সংক্ষিপ্ত বিবরণী (ঐচ্ছিক)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="ক্যাটাগরি সম্পর্কে এক বা দুই লাইনের বিবরণ..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input w-full text-xs font-bengali leading-relaxed py-2"
                  />
                </div>

                {/* Order & Published Toggle */}
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-text-muted mb-1 font-bengali">
                      প্রদর্শনের ক্রম (Display Order)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formData.displayOrder}
                      onChange={(e) =>
                        setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })
                      }
                      className="input w-full text-xs font-mono"
                    />
                  </div>

                  <div className="flex flex-col justify-end pb-1.5">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.isPublished}
                        onChange={(e) =>
                          setFormData({ ...formData, isPublished: e.target.checked })
                        }
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-text font-bengali">
                        ওয়েবসাইটে সক্রিয় রাখুন
                      </span>
                    </label>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-text-muted hover:text-text bg-surface-secondary transition-colors font-bengali cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-hover shadow-md shadow-primary/20 transition-all font-bengali cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>সংরক্ষণ হচ্ছে...</span>
                      </>
                    ) : (
                      <span>{editingCategory ? "আপডেট করুন" : "তৈরি করুন"}</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
