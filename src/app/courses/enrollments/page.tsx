"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FileText,
  Printer,
  Download,
  Users,
  Search,
  Filter,
  ArrowUpDown,
  BookOpen,
  DollarSign,
  TrendingUp,
  Award,
  Calendar,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Eye,
  X,
  CreditCard,
  Phone,
  Mail,
  Copy,
  Check,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import {
  CourseReportItem,
  EnrollmentSummaryData,
  printAllCoursesEnrollmentPdf,
  printSingleCourseRosterPdf,
} from "@/lib/pdf-report-generator";

export default function CourseEnrollmentsReportPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    summary: EnrollmentSummaryData;
    courses: CourseReportItem[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState<"enrolled_desc" | "revenue_desc" | "name_asc">("enrolled_desc");

  // Selected Course for Student Roster Modal
  const [rosterCourse, setRosterCourse] = useState<CourseReportItem | null>(null);
  const [rosterSearch, setRosterSearch] = useState("");
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPhone(text);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/courses/enrollments", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "রিপোর্ট ডাটা লোড করতে ব্যর্থ হয়েছে");
      }
      setData(json.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "ডাটা লোড ত্রুটি";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  // Distinct Categories
  const categoriesList = useMemo(() => {
    if (!data?.courses) return [];
    const set = new Set<string>();
    data.courses.forEach((c) => {
      if (c.category_name) set.add(c.category_name);
    });
    return Array.from(set);
  }, [data?.courses]);

  // Filtered and Sorted Courses
  const filteredCourses = useMemo(() => {
    if (!data?.courses) return [];

    let list = data.courses.filter((c) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        c.title_bn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.instructor_names.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        selectedCategory === "all" || c.category_name === selectedCategory;

      const matchesStatus =
        selectedStatus === "all" || c.status === selectedStatus;

      return matchesSearch && matchesCat && matchesStatus;
    });

    list.sort((a, b) => {
      if (sortBy === "enrolled_desc") return b.total_enrolled - a.total_enrolled;
      if (sortBy === "revenue_desc") return b.total_revenue - a.total_revenue;
      if (sortBy === "name_asc") return a.title_bn.localeCompare(b.title_bn, "bn");
      return 0;
    });

    return list;
  }, [data?.courses, searchQuery, selectedCategory, selectedStatus, sortBy]);

  // Filtered Students in Roster Modal
  const filteredRosterStudents = useMemo(() => {
    if (!rosterCourse?.enrolled_students) return [];
    if (!rosterSearch.trim()) return rosterCourse.enrolled_students;
    const q = rosterSearch.toLowerCase();
    return rosterCourse.enrolled_students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        (s.orderNumber && s.orderNumber.toLowerCase().includes(q))
    );
  }, [rosterCourse, rosterSearch]);

  const maxEnrolledCount = useMemo(() => {
    if (!data?.courses || data.courses.length === 0) return 1;
    return Math.max(...data.courses.map((c) => c.total_enrolled), 1);
  }, [data?.courses]);

  return (
    <div className="space-y-6 pb-16 font-bengali">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-text-muted mb-1.5">
            <Link href="/" className="hover:text-primary transition-colors">
              ড্যাশবোর্ড
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/courses" className="hover:text-primary transition-colors">
              কোর্সসমূহ
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-text font-bold">ভর্তি ও এনরোলমেন্ট রিপোর্ট</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-text flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span>কোর্স ভর্তি ও এনরোলমেন্ট প্রতিবেদন</span>
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            কোন কোর্সে কতজন শিক্ষার্থী ভর্তি হয়েছে, রাজস্ব আয় এবং অফিশিয়াল প্রিন্ট/PDF ডাউনলোড
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={fetchReportData}
            disabled={loading}
            className="btn btn-outline border-border/80 text-text hover:bg-surface-secondary text-xs flex items-center gap-1.5 px-3 py-2 rounded-xl cursor-pointer"
            title="ডাটা রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
            <span className="hidden sm:inline">রিফ্রেশ</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (data) {
                printAllCoursesEnrollmentPdf(data.summary, filteredCourses);
              }
            }}
            disabled={loading || !data || filteredCourses.length === 0}
            className="btn btn-primary text-xs font-bold flex items-center gap-2 px-4 py-2 rounded-xl shadow-md shadow-primary/25 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>সম্পূর্ণ রিপোর্ট PDF ডাউনলোড</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-500 text-xs sm:text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchReportData}
            className="underline font-bold hover:text-rose-400 cursor-pointer"
          >
            আবার চেষ্টা করুন
          </button>
        </div>
      )}

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Courses */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border/80 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-bold">মোট সক্রিয় কোর্স</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-text font-sans">
            {loading ? "..." : (data?.summary.totalCourses || 0).toLocaleString("en-US")}
            <span className="text-xs font-bold text-text-muted ml-1.5 font-bengali">টি</span>
          </div>
          <p className="text-[11px] text-text-muted mt-1.5">প্ল্যাটফর্মে প্রস্তুতকৃত কোর্স</p>
        </div>

        {/* Total Enrolled Students */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-primary/25 bg-gradient-to-br from-primary/5 via-transparent to-transparent shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-bold text-primary">সর্বমোট ভর্তি (Admissions)</span>
            <div className="p-2 rounded-xl bg-primary text-white shadow-xs">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-primary font-sans">
            {loading ? "..." : (data?.summary.totalEnrollments || 0).toLocaleString("en-US")}
            <span className="text-xs font-bold text-primary/80 ml-1.5 font-bengali">জন</span>
          </div>
          <p className="text-[11px] text-text-muted mt-1.5">
            সক্রিয়: <strong>{(data?.summary.totalActiveEnrollments || 0).toLocaleString("en-US")}</strong> জন শিক্ষার্থী
          </p>
        </div>

        {/* Total Revenue */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-emerald-500/25 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">মোট সংগৃহীত কোর্স ফি</span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-sans">
            {loading ? "..." : `৳ ${(data?.summary.totalRevenue || 0).toLocaleString("en-IN")}`}
          </div>
          <p className="text-[11px] text-text-muted mt-1.5">সকল সফল ভর্তির রাজস্ব হিসাব</p>
        </div>

        {/* Top Enrolled Course */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-amber-500/25 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">শীর্ষ জনপ্রিয় কোর্স</span>
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm sm:text-base font-black text-text truncate max-w-full" title={data?.summary.topCourse?.title_bn}>
            {loading ? "..." : data?.summary.topCourse?.title_bn || "কোনো কোর্স নেই"}
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold mt-1.5">
            {data?.summary.topCourse
              ? `${data.summary.topCourse.total_enrolled.toLocaleString("en-US")} জন শিক্ষার্থী ভর্তি`
              : "—"}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface rounded-2xl border border-border/80 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="কোর্সের নাম বা শিক্ষকের নাম দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-4 py-2 bg-surface-secondary/60 border border-border/80 rounded-xl text-xs sm:text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-surface-secondary/60 border border-border/80 rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="all">সকল ক্যাটাগরি</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-surface-secondary/60 border border-border/80 rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="all">সকল স্ট্যাটাস</option>
              <option value="published">চলমান (Published)</option>
              <option value="draft">ড্রাফট (Draft)</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-surface-secondary/60 border border-border/80 rounded-xl px-3 py-2 text-xs text-text font-bold focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="enrolled_desc">ভর্তি সংখ্যা (সর্বোচ্চ আগে)</option>
              <option value="revenue_desc">আয় / রাজস্ব (সর্বোচ্চ আগে)</option>
              <option value="name_asc">কোর্সের নাম (অ-হ)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-surface rounded-2xl border border-border/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-surface-secondary/50 text-text-muted text-[11px] sm:text-xs uppercase tracking-wider font-bold">
                <th className="py-3.5 px-4 text-center w-12">#</th>
                <th className="py-3.5 px-4">কোর্সের বিবরণ</th>
                <th className="py-3.5 px-4 hidden md:table-cell">ক্যাটাগরি ও মেন্টর</th>
                <th className="py-3.5 px-4 text-center">কোর্স ফি</th>
                <th className="py-3.5 px-4 text-center">ভর্তিকৃত শিক্ষার্থী</th>
                <th className="py-3.5 px-4 text-right hidden sm:table-cell">মোট সংগৃহীত আয়</th>
                <th className="py-3.5 px-4 text-center">স্ট্যাটাস</th>
                <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs sm:text-sm">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-text-muted">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                      <span>এনরোলমেন্ট রিপোর্ট ডাটা প্রস্তুত হচ্ছে...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-text-muted">
                    <p className="font-bold text-sm">কোনো কোর্স পাওয়া যায়নি</p>
                    <p className="text-xs mt-1">অনুগ্রহ করে ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।</p>
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course, idx) => {
                  const percentOfMax = Math.min(100, Math.round((course.total_enrolled / maxEnrolledCount) * 100));

                  return (
                    <tr
                      key={course.id}
                      className="hover:bg-surface-secondary/30 transition-colors group"
                    >
                      {/* Row Index */}
                      <td className="py-3 px-4 text-center font-mono text-text-muted font-bold">
                        {idx + 1}
                      </td>

                      {/* Course Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {course.thumbnail_url ? (
                            <div className="relative w-12 h-8 sm:w-14 sm:h-9 rounded-lg overflow-hidden shrink-0 border border-border/80">
                              <Image
                                src={course.thumbnail_url}
                                alt={course.title_bn}
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-8 sm:w-14 sm:h-9 rounded-lg bg-surface-secondary flex items-center justify-center shrink-0 text-text-muted border border-border/80">
                              <BookOpen className="w-4 h-4" />
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-text truncate max-w-xs sm:max-w-md group-hover:text-primary transition-colors">
                              {course.title_bn}
                            </h3>
                            <p className="text-[11px] text-text-muted font-sans truncate max-w-xs">
                              {course.title}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category & Instructors */}
                      <td className="py-3 px-4 hidden md:table-cell">
                        <div className="space-y-1">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-surface-secondary text-text font-medium text-[11px] border border-border/60">
                            {course.category_name}
                          </span>
                          <p className="text-[11px] text-text-muted truncate max-w-[180px]" title={course.instructor_names}>
                            {course.instructor_names}
                          </p>
                        </div>
                      </td>

                      {/* Course Fee */}
                      <td className="py-3 px-4 text-center">
                        {course.is_free ? (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-[11px] font-bold">
                            বিনামূল্যে
                          </span>
                        ) : (
                          <div className="font-mono font-bold text-text">
                            ৳ {course.price.toLocaleString("en-IN")}
                          </div>
                        )}
                      </td>

                      {/* Total Enrolled Students */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="font-mono font-black text-sm sm:text-base text-primary">
                            {course.total_enrolled.toLocaleString("en-US")}
                          </span>
                          {/* Mini Progress Bar compared to max course */}
                          <div className="w-16 h-1.5 bg-surface-secondary rounded-full overflow-hidden mt-1" title={`${course.total_enrolled} জন শিক্ষার্থী`}>
                            <div
                              className="h-full bg-gradient-to-r from-primary to-orange-500 rounded-full"
                              style={{ width: `${percentOfMax}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Total Revenue */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 hidden sm:table-cell">
                        ৳ {course.total_revenue.toLocaleString("en-IN")}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        {course.status === "published" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[11px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>চলমান</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20 text-[11px] font-bold">
                            <span>ড্রাফট</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Students Roster */}
                          <button
                            type="button"
                            onClick={() => {
                              setRosterCourse(course);
                              setRosterSearch("");
                            }}
                            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-surface-secondary hover:bg-primary/10 hover:text-primary border border-border/80 text-text text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                            title="ভর্তিকৃত শিক্ষার্থীদের তালিকা দেখুন"
                          >
                            <Users className="w-3.5 h-3.5 text-primary" />
                            <span className="hidden sm:inline">শিক্ষার্থী তালিকা</span>
                            <span className="font-mono text-[11px] ml-0.5 bg-primary/10 text-primary px-1.5 py-0.2 rounded-full">
                              {course.total_enrolled}
                            </span>
                          </button>

                          {/* Print Single Course PDF */}
                          <button
                            type="button"
                            onClick={() => printSingleCourseRosterPdf(course)}
                            className="p-1.5 rounded-lg bg-surface-secondary hover:bg-primary/15 text-text-muted hover:text-primary border border-border/80 transition-all cursor-pointer"
                            title="এই কোর্সের শিক্ষার্থী তালিকা PDF প্রিন্ট করুন"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Course Student Roster Drawer / Modal */}
      {rosterCourse && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
          <div className="bg-surface border border-border/80 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-border/80 flex items-start justify-between gap-4 bg-surface-secondary/40">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold font-bengali">
                    কোর্স ভর্তি তালিকা
                  </span>
                  <span className="text-xs text-text-muted font-medium">
                    {rosterCourse.category_name}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-text truncate">
                  {rosterCourse.title_bn}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted mt-2 font-bengali">
                  <div>
                    মোট ভর্তি: <strong className="text-primary font-mono font-black">{rosterCourse.total_enrolled}</strong> জন
                  </div>
                  <div>•</div>
                  <div>
                    মোট ফি সংগ্রহ: <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-black">৳ {rosterCourse.total_revenue.toLocaleString("en-IN")}</strong>
                  </div>
                  <div>•</div>
                  <div>
                    ইন্সট্রাক্টর: <span className="font-semibold text-text">{rosterCourse.instructor_names}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => printSingleCourseRosterPdf(rosterCourse)}
                  className="btn btn-primary text-xs font-bold flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl shadow-xs cursor-pointer"
                  title="এই কোর্সের শিক্ষার্থী তালিকা PDF হিসেবে সেভ করুন"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">PDF ডাউনলোড</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRosterCourse(null)}
                  className="p-1.5 rounded-xl hover:bg-surface-secondary text-text-muted hover:text-text cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Search Bar */}
            <div className="p-4 border-b border-border/80 bg-surface">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  placeholder="নাম, ফোন নম্বর, ইমেইল বা অর্ডার নং দিয়ে খুঁজুন..."
                  className="w-full pl-9 pr-4 py-2 bg-surface-secondary/60 border border-border/80 rounded-xl text-xs sm:text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Students Table */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredRosterStudents.length === 0 ? (
                <div className="py-16 text-center text-text-muted">
                  <Users className="w-10 h-10 mx-auto text-text-muted/40 mb-2" />
                  <p className="font-bold text-sm">কোনো শিক্ষার্থী পাওয়া যায়নি</p>
                  <p className="text-xs mt-1">এই কোর্সে এখনো কোনো এনরোলমেন্ট নেই অথবা সার্চ ফিল্টারে মিল পাওয়া যায়নি।</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border/80 text-text-muted text-[11px] uppercase font-bold">
                      <th className="py-2.5 px-3 text-center w-10">#</th>
                      <th className="py-2.5 px-3">শিক্ষার্থীর বিবরণ</th>
                      <th className="py-2.5 px-3 text-center">মোবাইল নম্বর</th>
                      <th className="py-2.5 px-3 text-center">ভর্তির তারিখ</th>
                      <th className="py-2.5 px-3 text-center">অর্ডার নং</th>
                      <th className="py-2.5 px-3 text-right">পরিশোধ</th>
                      <th className="py-2.5 px-3 text-center">অবস্থা</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredRosterStudents.map((std, idx) => (
                      <tr key={std.id || idx} className="hover:bg-surface-secondary/40 transition-colors">
                        <td className="py-2.5 px-3 text-center font-mono text-text-muted font-bold">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-text">{std.name}</div>
                          <div className="text-[11px] text-text-muted font-mono">{std.email || "—"}</div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {std.phone ? (
                            <button
                              type="button"
                              onClick={() => copyToClipboard(std.phone)}
                              className="font-mono text-text hover:text-primary transition-colors flex items-center gap-1 mx-auto"
                              title="কপি করতে ক্লিক করুন"
                            >
                              <span>{std.phone}</span>
                              {copiedPhone === std.phone ? (
                                <Check className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <Copy className="w-3 h-3 text-text-muted opacity-60" />
                              )}
                            </button>
                          ) : (
                            <span className="text-text-muted">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center text-text-muted">
                          {new Date(std.enrolledAt).toLocaleDateString("bn-BD", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-text-muted">
                          {std.orderNumber || "—"}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ৳ {std.amountPaid.toLocaleString("en-IN")}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {std.isActive ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">
                              সক্রিয়
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-bold">
                              নিষ্ক্রিয়
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-border/80 bg-surface-secondary/40 flex items-center justify-between text-xs text-text-muted">
              <span>মোট শিক্ষার্থী: <strong>{filteredRosterStudents.length}</strong> জন</span>
              <button
                type="button"
                onClick={() => setRosterCourse(null)}
                className="btn btn-outline border-border/80 text-xs px-4 py-1.5 rounded-xl cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
