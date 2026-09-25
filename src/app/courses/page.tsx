"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  PlusCircle,
  Search,
  Trash2,
  BookOpen,
  Users,
  CheckCircle2,
  RefreshCw,
  Edit2,
  X,
  Pin,
  Layers,
  Check,
  Copy,
  LayoutGrid,
  Table as TableIcon,
  GraduationCap,
  Clock,
  Tag,
  ArrowUpRight,
  Filter,
  FileText,
} from "lucide-react";
import {
  dbService,
  type DbCourse,
  type DbCategory,
  type DbInstructor,
} from "@/lib/supabase/db-service";

function formatDurationBn(minutes: number): string {
  if (!minutes || minutes <= 0) return "০ মিনিট";
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours > 0 && remainingMinutes > 0) {
    return `${hours} ঘণ্টা ${remainingMinutes} মিনিট`;
  }
  if (hours > 0) {
    return `${hours} ঘণ্টা`;
  }
  return `${remainingMinutes} মিনিট`;
}

export default function AdminCoursesPage() {
  const [coursesList, setCoursesList] = useState<DbCourse[]>([]);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [instructors, setInstructors] = useState<DbInstructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft" | "pinned">("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [pinnedCourseIds, setPinnedCourseIds] = useState<(number | string)[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [copiedId, setCopiedId] = useState<string | number | null>(null);

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [cData, catData, instData, settings] = await Promise.all([
        dbService.getCourses(),
        dbService.getCategories(),
        dbService.getInstructors(),
        dbService.getSiteSettings(),
      ]);
      setCoursesList(cData || []);
      setCategories(catData || []);
      setInstructors(instData || []);
      if (Array.isArray(settings?.homepage_pinned_courses)) {
        setPinnedCourseIds(settings.homepage_pinned_courses);
      }
    } catch (err) {
      console.error("Failed to load courses data:", err);
      showNotification("ডাটা লোড করতে সমস্যা হয়েছে", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTogglePin = async (id: number | string) => {
    const numId = Number(id);
    const isCurrentlyPinned = pinnedCourseIds.some((pId) => Number(pId) === numId);
    const nextPinned = isCurrentlyPinned
      ? pinnedCourseIds.filter((pId) => Number(pId) !== numId)
      : [...pinnedCourseIds, numId];

    setPinnedCourseIds(nextPinned);
    const ok = await dbService.updateSiteSetting("homepage_pinned_courses", nextPinned);
    if (!ok) {
      setPinnedCourseIds(pinnedCourseIds);
      showNotification("হোমপেজে পিন স্ট্যাটাস সংরক্ষণ করতে সমস্যা হয়েছে।", "error");
    } else {
      showNotification(isCurrentlyPinned ? "হোমপেজ থেকে আনপিন করা হয়েছে" : "হোমপেজে পিন করা হয়েছে");
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
      showNotification("স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।", "error");
    } else {
      showNotification(nextStatus === "published" ? "কোর্সটি লাইভ পাবলিশ করা হয়েছে" : "কোর্সটি ড্রাফট করা হয়েছে");
    }
  };

  const handleDelete = async (id: number | string, titleBn: string) => {
    if (confirm(`আপনি কি নিশ্চিত যে '${titleBn}' কোর্সটি ডাটাবেজ থেকে মুছে ফেলতে চান?`)) {
      const ok = await dbService.deleteCourse(id);
      if (ok) {
        setCoursesList((prev) => prev.filter((c) => c.id !== id));
        showNotification(`'${titleBn}' কোর্সটি সফলভাবে মুছে ফেলা হয়েছে।`);
      } else {
        showNotification("কোর্স মুছতে সমস্যা হয়েছে। আবার চেষ্টা করুন।", "error");
      }
    }
  };

  const handleCopyLink = (slug: string, id: string | number) => {
    const baseUrl = process.env.NEXT_PUBLIC_MAIN_SITE_URL || "http://localhost:3000";
    const fullUrl = `${baseUrl}/course/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    showNotification("কোর্সের লিংক কপি করা হয়েছে!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Computations for KPI cards
  const totalCourses = coursesList.length;
  const publishedCount = coursesList.filter((c) => c.status === "published").length;
  const draftCount = coursesList.filter((c) => c.status !== "published").length;
  const totalStudents = coursesList.reduce((acc, c) => acc + (c.enrollment_count || 0), 0);
  const totalLessons = coursesList.reduce((acc, c) => acc + (c.total_lessons || 0), 0);
  const totalDuration = coursesList.reduce((acc, c) => acc + (c.total_duration || 0), 0);

  // Filtering Logic
  const filteredCourses = coursesList.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (c.title_bn && c.title_bn.toLowerCase().includes(q)) ||
      (c.title && c.title.toLowerCase().includes(q)) ||
      (c.slug && c.slug.toLowerCase().includes(q));

    const matchesCat =
      filterCategory === "all" ||
      c.category_id?.toString() === filterCategory ||
      c.categories?.slug === filterCategory;

    let matchesStatus = true;
    if (statusFilter === "published") matchesStatus = c.status === "published";
    if (statusFilter === "draft") matchesStatus = c.status !== "published";
    if (statusFilter === "pinned") matchesStatus = pinnedCourseIds.some((pId) => Number(pId) === Number(c.id));

    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div className="space-y-5 sm:space-y-6 max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 pb-16 font-bengali">
      {/* Floating Notification Toast */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border text-xs sm:text-sm font-bold backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
            notification.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-300"
              : "bg-rose-950/90 border-rose-500/40 text-rose-300"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. EXECUTIVE HEADER & ACTIONS (Mobile Responsive)                        */}
      {/* ========================================================================= */}
      <div className="bg-surface/80 backdrop-blur-md rounded-2xl border border-border/80 p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left Title & Status */}
          <div className="flex items-start gap-3 sm:gap-3.5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/20 text-primary flex items-center justify-center shrink-0 shadow-xs">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-text tracking-tight">
                  কোর্স ব্যবস্থাপনা
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
                  {filteredCourses.length}টি কোর্স
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Supabase Live
                </span>
              </div>
              <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
                অনলাইন কোর্স ক্যাটালগ, লাইভ পাবলিশ স্ট্যাটাস, মূল্য এবং কারিকুলাম পরিচালনা করুন
              </p>
            </div>
          </div>

          {/* Right Action Buttons (Responsive Layout) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 shrink-0 w-full md:w-auto self-stretch md:self-auto">
            {/* Primary Action: Always prominent and unclipped, full width on mobile */}
            <Link
              href="/courses/new"
              className="btn btn-primary h-10 sm:h-10 px-4 text-xs sm:text-sm font-bold rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-primary-hover hover:to-blue-700 text-white shadow-md shadow-primary/20 flex items-center justify-center gap-2 transition-all cursor-pointer w-full sm:w-auto order-1 sm:order-2"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span>নতুন কোর্স তৈরি</span>
            </Link>

            {/* Secondary Actions: 2-column grid on mobile, inline on desktop */}
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto order-2 sm:order-1">
              <button
                type="button"
                onClick={loadData}
                disabled={loading}
                className="btn btn-outline h-10 px-3 sm:px-3.5 text-xs font-bold rounded-xl border-border hover:bg-surface-secondary flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                title="ডাটাবেজ রিফ্রেশ করুন"
              >
                <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${loading ? "animate-spin text-primary" : "text-text-muted"}`} />
                <span>রিফ্রেশ</span>
              </button>

              <Link
                href="/courses/enrollments"
                className="btn btn-outline border-primary/30 text-primary hover:bg-primary/10 h-10 px-2.5 sm:px-3.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                title="কোর্সভিত্তিক ভর্তি পরিসংখ্যান ও অফিশিয়াল PDF ডাউনলোড"
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">ভর্তি রিপোর্ট (PDF)</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. KPI STATS CARDS (Phone 2-Col, Desktop 4-Col Grid)                       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Card 1: Total Courses */}
        <div className="bg-surface rounded-2xl border border-border/80 p-3 sm:p-4.5 shadow-xs hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-text-muted">মোট কোর্স</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-text mt-1.5 sm:mt-2 font-sans">
            {totalCourses}টি
          </div>
          <div className="flex items-center gap-1.5 mt-1 sm:mt-1.5 text-[10px] sm:text-[11px] text-text-muted font-medium">
            <span className="text-emerald-500 font-bold">{publishedCount} লাইভ</span>
            <span>•</span>
            <span className="text-amber-500 font-bold">{draftCount} ড্রাফট</span>
          </div>
        </div>

        {/* Card 2: Pinned on Homepage */}
        <div className="bg-surface rounded-2xl border border-border/80 p-3 sm:p-4.5 shadow-xs hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-text-muted">হোমপেজে পিন</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Pin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-amber-500 mt-1.5 sm:mt-2 font-sans flex items-center gap-1">
            <span>{pinnedCourseIds.length}টি</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-text-muted mt-1 sm:mt-1.5 font-medium">
            হোমপেজ টপ কার্ড সেকশনে দৃশ্যমান
          </p>
        </div>

        {/* Card 3: Total Students */}
        <div className="bg-surface rounded-2xl border border-border/80 p-3 sm:p-4.5 shadow-xs hover:border-pink-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-text-muted">ভর্তি শিক্ষার্থী</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-pink-500/10 text-pink-500 flex items-center justify-center">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-pink-500 mt-1.5 sm:mt-2 font-sans">
            {totalStudents.toLocaleString()}
          </div>
          <p className="text-[10px] sm:text-[11px] text-text-muted mt-1 sm:mt-1.5 font-medium">
            কার্ডে লাইভ ডিসপ্লে ব্যাজ
          </p>
        </div>

        {/* Card 4: Curriculum Stats */}
        <div className="bg-surface rounded-2xl border border-border/80 p-3 sm:p-4.5 shadow-xs hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-text-muted">মোট ক্লাস ও ঘণ্টা</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-emerald-500 mt-1.5 sm:mt-2 font-sans">
            {totalLessons}টি
          </div>
          <div className="flex items-center gap-1 mt-1 sm:mt-1.5 text-[10px] sm:text-[11px] text-text-muted font-medium">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>{formatDurationBn(totalDuration)} ভিডিও লেকচার</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SMART SEARCH & FILTER CONTROLS (Full Phone Responsive)                 */}
      {/* ========================================================================= */}
      <div className="bg-surface rounded-2xl border border-border/80 p-3 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search Box with Clear Button */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="কোর্সের নাম বা স্লাগ দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input w-full pl-10 pr-9 text-xs sm:text-sm h-10 rounded-xl bg-surface-secondary/60 border-border focus:border-primary font-bengali"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-text-muted hover:text-text cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown & View Mode Switcher */}
          <div className="flex items-center gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input text-xs sm:text-sm h-10 rounded-xl bg-surface-secondary/60 border-border font-bengali px-3 cursor-pointer shrink-0"
            >
              <option value="all">সকল ক্যাটাগরি ({categories.length})</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id.toString()}>
                  {cat.name_bn || cat.name}
                </option>
              ))}
            </select>

            {/* Desktop View Switcher: Table vs Grid */}
            <div className="hidden sm:flex items-center p-1 rounded-xl bg-surface-secondary/60 border border-border">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "table"
                    ? "bg-surface text-primary shadow-xs border border-border/80"
                    : "text-text-muted hover:text-text"
                }`}
                title="টেবিল ভিউ"
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-surface text-primary shadow-xs border border-border/80"
                    : "text-text-muted hover:text-text"
                }`}
                title="কার্ড ভিউ"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-medium">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-xl border transition-all shrink-0 cursor-pointer ${
              statusFilter === "all"
                ? "bg-primary text-white border-primary shadow-xs font-bold"
                : "bg-surface-secondary/50 border-border text-text-muted hover:text-text"
            }`}
          >
            সকল ({coursesList.length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("published")}
            className={`px-3 py-1.5 rounded-xl border transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              statusFilter === "published"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs font-bold"
                : "bg-surface-secondary/50 border-border text-text-muted hover:text-emerald-500"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>পাবলিশড ({publishedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("draft")}
            className={`px-3 py-1.5 rounded-xl border transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              statusFilter === "draft"
                ? "bg-amber-600 text-white border-amber-600 shadow-xs font-bold"
                : "bg-surface-secondary/50 border-border text-text-muted hover:text-amber-500"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>ড্রাফট ({draftCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("pinned")}
            className={`px-3 py-1.5 rounded-xl border transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              statusFilter === "pinned"
                ? "bg-amber-500 text-slate-950 border-amber-500 shadow-xs font-bold"
                : "bg-surface-secondary/50 border-border text-text-muted hover:text-amber-500"
            }`}
          >
            <Pin className="w-3 h-3" />
            <span>হোমপেজে পিন ({pinnedCourseIds.length})</span>
          </button>

          {(searchQuery || filterCategory !== "all" || statusFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setFilterCategory("all");
                setStatusFilter("all");
              }}
              className="ml-auto px-2.5 py-1 text-[11px] text-text-muted hover:text-error cursor-pointer flex items-center gap-1 transition-colors shrink-0"
            >
              <X className="w-3 h-3" />
              <span>রিসেট ফিল্টার</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. COURSES DISPLAY (Phone Cards + Desktop Adaptive Table)                 */}
      {/* ========================================================================= */}
      {loading ? (
        <div className="bg-surface rounded-2xl border border-border/80 p-8 sm:p-14 text-center space-y-3">
          <RefreshCw className="w-7 h-7 mx-auto animate-spin text-primary" />
          <p className="text-xs sm:text-sm font-bold text-text">কোর্স ডাটা লোড হচ্ছে...</p>
          <p className="text-xs text-text-muted">Supabase ডাটাবেজ থেকে রিয়েল-টাইম ডাটা সিঙ্ক হচ্ছে</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-border/80 p-8 sm:p-14 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-secondary flex items-center justify-center mx-auto mb-3 text-text-muted opacity-50">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-text mb-1">
            কোনো কোর্স পাওয়া যায়নি
          </h3>
          <p className="text-xs sm:text-sm text-text-muted max-w-md mx-auto mb-5">
            {searchQuery || filterCategory !== "all" || statusFilter !== "all"
              ? "আপনার ফিল্টার বা অনুসন্ধানের সাথে কোনো কোর্স মেলেনি। অনুগ্রহ করে ফিল্টার পরিবর্তন করুন।"
              : "ডাটাবেজে এখনো কোনো কোর্স তৈরি করা হয়নি। এখনই নতুন কোর্স তৈরি করুন!"}
          </p>
          <Link
            href="/courses/new"
            className="btn btn-primary h-10 px-5 text-xs font-bold rounded-xl shadow-md"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            নতুন কোর্স তৈরি করুন
          </Link>
        </div>
      ) : (
        <>
          {/* ------------------------------------------------------------------- */}
          {/* A. MOBILE CARDS VIEW (Always on mobile screens, also when grid mode) */}
          {/* ------------------------------------------------------------------- */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 ${viewMode === "grid" ? "block" : "block lg:hidden"}`}>
            {filteredCourses.map((c) => {
              const isPinned = pinnedCourseIds.some((pId) => Number(pId) === Number(c.id));
              const isPublished = c.status === "published";

              return (
                <div
                  key={c.id}
                  className="bg-surface rounded-2xl border border-border/80 overflow-hidden shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between"
                >
                  {/* Top Thumbnail Section */}
                  <div className="relative aspect-video w-full bg-slate-900 overflow-hidden group/thumb">
                    {c.thumbnail_url ? (
                      <img
                        src={c.thumbnail_url}
                        alt={c.title_bn || c.title}
                        className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-surface-secondary">
                        <BookOpen className="w-8 h-8 opacity-40 mb-1" />
                        <span className="text-[10px]">ছবি যুক্ত করা হয়নি</span>
                      </div>
                    )}

                    {/* Overlay Badges */}
                    <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5 z-10">
                      {/* Status badge */}
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(c.id, c.status)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md shadow-xs border transition-transform active:scale-95 cursor-pointer ${
                          isPublished
                            ? "bg-emerald-500/90 text-white border-emerald-400/50"
                            : "bg-amber-500/90 text-slate-950 border-amber-400/50"
                        }`}
                        title="স্ট্যাটাস পরিবর্তন করুন"
                      >
                        {isPublished ? "পাবলিশড" : "ড্রাফট"}
                      </button>

                      {/* Pin button badge */}
                      <button
                        type="button"
                        onClick={() => handleTogglePin(c.id)}
                        className={`p-1 rounded-full backdrop-blur-md border shadow-xs transition-transform active:scale-95 cursor-pointer ${
                          isPinned
                            ? "bg-amber-400 text-slate-950 border-amber-300"
                            : "bg-black/60 text-white/80 border-white/20 hover:text-white"
                        }`}
                        title={isPinned ? "হোমপেজ থেকে আনপিন করুন" : "হোমপেজে পিন করুন"}
                      >
                        <Pin className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Enrollment pill at bottom right of thumbnail */}
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-white text-[10px] font-sans font-bold flex items-center gap-1 border border-white/10">
                      <Users className="w-2.5 h-2.5 text-pink-400" />
                      <span>{(c.enrollment_count || 0).toLocaleString()} জন</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      {/* Category & Instructor */}
                      <div className="flex items-center justify-between gap-2 text-[11px] text-text-muted mb-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-surface-secondary border border-border text-text font-semibold truncate max-w-[150px]">
                          {c.categories?.name_bn || c.categories?.name || "সাধারণ"}
                        </span>
                        <span className="truncate text-text font-medium flex items-center gap-1">
                          <GraduationCap className="w-3 h-3 text-primary shrink-0" />
                          <span>{c.instructors?.name_bn || c.instructors?.name || "অনলাইন শিক্ষক"}</span>
                        </span>
                      </div>

                      {/* Course Title */}
                      <Link
                        href={`/courses/${c.id}/edit`}
                        className="font-extrabold text-sm sm:text-base text-text hover:text-primary transition-colors line-clamp-2 block leading-snug"
                      >
                        {c.title_bn || c.title}
                      </Link>
                      <div className="text-[10px] text-text-muted font-sans mt-0.5 truncate flex items-center gap-1">
                        <span>/{c.slug}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyLink(c.slug, c.id)}
                          className="p-0.5 text-text-muted hover:text-primary cursor-pointer"
                          title="লিংক কপি করুন"
                        >
                          {copiedId === c.id ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Price & Curriculum Bar */}
                    <div className="pt-2 border-t border-border/80 flex items-center justify-between">
                      {/* Price */}
                      <div>
                        <div className="text-sm font-black text-primary font-sans">
                          {c.price === 0 ? "ফ্রি" : `৳${c.price.toLocaleString()}`}
                        </div>
                        {c.original_price && c.original_price > c.price ? (
                          <div className="text-[10px] text-text-muted line-through font-sans">
                            ৳{c.original_price.toLocaleString()}
                          </div>
                        ) : null}
                      </div>

                      {/* Curriculum Badge */}
                      <div className="text-right">
                        <div className="text-[11px] font-bold text-text">
                          {c.course_sections?.length || 0} অধ্যায় • {c.total_lessons || 0} ক্লাস
                        </div>
                        <div className="text-[10px] text-text-muted font-sans">
                          {formatDurationBn(c.total_duration)}
                        </div>
                      </div>
                    </div>

                    {/* Action Bar (Finger-friendly mobile touch targets) */}
                    <div className="pt-2.5 border-t border-border/80 flex items-center gap-2">
                      {/* 1-Click Curriculum Edit */}
                      <Link
                        href={`/courses/${c.id}/edit?tab=curriculum`}
                        className="flex-1 h-9 px-3 rounded-xl text-xs font-bold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                        title="কারিকুলাম ও ক্লাস এডিট করুন"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>ক্লাস এডিট</span>
                      </Link>

                      {/* Full Course Studio Edit */}
                      <Link
                        href={`/courses/${c.id}/edit`}
                        className="h-9 px-3 rounded-xl bg-surface-secondary border border-border text-text hover:text-primary hover:border-primary/40 flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer shrink-0"
                        title="কোর্স স্টুডিও ও সেটিংস"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>স্টুডিও</span>
                      </Link>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id, c.title_bn || c.title)}
                        className="h-9 w-9 rounded-xl bg-surface-secondary border border-border text-text hover:text-error hover:border-error/40 flex items-center justify-center transition-all cursor-pointer shrink-0"
                        title="কোর্স মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* B. DESKTOP LUXURY TABLE VIEW (Rendered on Large Screens in Table Mode) */}
          {/* ------------------------------------------------------------------- */}
          <div className={`bg-surface rounded-2xl border border-border/80 overflow-hidden shadow-xs ${viewMode === "table" ? "hidden lg:block" : "hidden"}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[1100px]">
                <thead className="bg-surface-secondary/60 border-b border-border text-text-muted uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4 font-bold min-w-[280px]">কোর্স ও থাম্বনেইল</th>
                    <th className="py-3.5 px-4 font-bold min-w-[130px]">ক্যাটাগরি</th>
                    <th className="py-3.5 px-4 font-bold min-w-[150px]">ইন্সট্রাক্টর</th>
                    <th className="py-3.5 px-4 font-bold min-w-[110px]">মূল্য</th>
                    <th className="py-3.5 px-4 font-bold min-w-[210px] whitespace-nowrap">কারিকুলাম ও ক্লাস</th>
                    <th className="py-3.5 px-4 font-bold min-w-[130px] whitespace-nowrap">ভর্তি শিক্ষার্থী</th>
                    <th className="py-3.5 px-4 font-bold text-center min-w-[90px] whitespace-nowrap">হোমপেজে পিন</th>
                    <th className="py-3.5 px-4 font-bold min-w-[110px] whitespace-nowrap">স্ট্যাটাস</th>
                    <th className="py-3.5 px-4 font-bold text-right min-w-[100px] whitespace-nowrap">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70 font-bengali">
                  {filteredCourses.map((c) => {
                    const isPinned = pinnedCourseIds.some((pId) => Number(pId) === Number(c.id));
                    const isPublished = c.status === "published";

                    return (
                      <tr
                        key={c.id}
                        className="hover:bg-surface-secondary/40 transition-colors group/row"
                      >
                        {/* Course Column */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-10 rounded-lg bg-surface-secondary border border-border overflow-hidden shrink-0 relative group/thumb">
                              {c.thumbnail_url ? (
                                <img
                                  src={c.thumbnail_url}
                                  alt=""
                                  className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-200"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-text-muted opacity-40">
                                  <BookOpen className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 max-w-[260px]">
                              <Link
                                href={`/courses/${c.id}/edit`}
                                className="font-bold text-text text-sm hover:text-primary transition-colors truncate block"
                                title={c.title_bn || c.title}
                              >
                                {c.title_bn || c.title}
                              </Link>
                              <div className="text-[11px] text-text-muted font-sans truncate flex items-center gap-1.5 mt-0.5">
                                <span className="truncate">/{c.slug}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyLink(c.slug, c.id)}
                                  className="p-0.5 text-text-muted hover:text-primary cursor-pointer opacity-0 group-hover/row:opacity-100 transition-opacity shrink-0"
                                  title="লিংক কপি করুন"
                                >
                                  {copiedId === c.id ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-lg text-[11px] bg-surface-secondary border border-border text-text font-semibold inline-block whitespace-nowrap">
                            {c.categories?.name_bn || c.categories?.name || "সাধারণ"}
                          </span>
                        </td>

                        {/* Instructor */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-text text-xs whitespace-nowrap">
                            {c.instructors?.name_bn || c.instructors?.name || "অনলাইন শিক্ষক"}
                          </div>
                          {c.instructors?.institution && (
                            <div className="text-[10px] text-text-muted truncate max-w-[140px]">
                              {c.instructors.institution}
                            </div>
                          )}
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-4 font-sans whitespace-nowrap">
                          <div className="font-bold text-text text-sm">
                            {c.price === 0 ? (
                              <span className="text-emerald-500 font-bengali">ফ্রি</span>
                            ) : (
                              `৳${c.price.toLocaleString()}`
                            )}
                          </div>
                          {c.original_price && c.original_price > c.price ? (
                            <div className="text-[10px] text-text-muted line-through">
                              ৳{c.original_price.toLocaleString()}
                            </div>
                          ) : null}
                        </td>

                        {/* Curriculum & Classes */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg text-[11px] bg-surface-secondary border border-border text-text font-semibold shrink-0">
                              {c.course_sections?.length || 0} অধ্যায় • {c.total_lessons || 0} ক্লাস
                            </span>
                            <Link
                              href={`/courses/${c.id}/edit?tab=curriculum`}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 transition-all shadow-2xs cursor-pointer shrink-0"
                              title="কারিকুলাম ও ক্লাসসমূহ এডিট করুন"
                            >
                              <Layers className="w-3 h-3" />
                              <span>ক্লাস এডিট</span>
                            </Link>
                          </div>
                        </td>

                        {/* Students */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-pink-500/10 text-pink-500 border border-pink-500/20 font-sans shadow-2xs">
                            <Users className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                            <span>{(c.enrollment_count || 0).toLocaleString()} জন</span>
                          </span>
                        </td>

                        {/* Pin Button */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleTogglePin(c.id)}
                            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                              isPinned
                                ? "bg-amber-500 text-slate-950 border-amber-400 shadow-xs scale-105"
                                : "bg-surface border-border text-text-muted hover:text-text hover:border-amber-500/50"
                            }`}
                            title={isPinned ? "হোমপেজ থেকে আনপিন করুন" : "হোমপেজে পিন করুন"}
                          >
                            <Pin className="w-3.5 h-3.5" />
                          </button>
                        </td>

                        {/* 1-Click Status Toggle */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(c.id, c.status)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all border cursor-pointer ${
                              isPublished
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/25 hover:bg-amber-500/20"
                            }`}
                            title="ক্লিক করে স্ট্যাটাস পরিবর্তন করুন"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? "bg-emerald-400" : "bg-amber-400"}`} />
                            <span>{isPublished ? "পাবলিশড" : "ড্রাফট"}</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Course Studio Edit */}
                            <Link
                              href={`/courses/${c.id}/edit`}
                              className="p-2 rounded-xl text-text-muted hover:text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all cursor-pointer"
                              title="কোর্স স্টুডিও ও বিস্তারিত সেটিংস"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => handleDelete(c.id, c.title_bn || c.title)}
                              className="p-2 rounded-xl text-text-muted hover:text-error hover:bg-error/10 border border-transparent hover:border-error/20 transition-all cursor-pointer"
                              title="কোর্স মুছে ফেলুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
