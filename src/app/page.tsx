"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Users,
  BookOpen,
  DollarSign,
  PlusCircle,
  ArrowUpRight,
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Receipt,
  FileDown,
  FileText,
  CreditCard,
  ShieldCheck,
  Search,
  Copy,
  Check,
  Zap,
  BarChart3,
  Layers,
  GraduationCap,
  Activity,
  SlidersHorizontal,
  ChevronRight,
} from "lucide-react";
import { dbService, type DbOrder } from "@/lib/supabase/db-service";
import {
  RevenueAnalyticsChart,
  toBengaliNumerals,
  formatBDT,
} from "@/components/revenue-analytics-chart";

// Sparkline miniature SVG for stat cards
function MiniSparkline({
  type,
  color = "var(--primary)",
}: {
  type: "revenue" | "students" | "courses" | "orders";
  color?: string;
}) {
  const paths: Record<string, string> = {
    revenue: "M0,22 Q15,25 30,16 T60,18 T90,8 T120,3",
    students: "M0,24 Q20,20 40,22 T80,10 T100,12 T120,4",
    courses: "M0,20 L30,20 L30,14 L60,14 L60,8 L90,8 L90,4 L120,4",
    orders: "M0,22 Q25,26 50,14 T80,16 T100,6 T120,2",
  };

  return (
    <svg viewBox="0 0 120 28" className="w-20 h-6 overflow-visible select-none">
      <path
        d={paths[type] || paths.revenue}
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState<"all" | "completed" | "pending">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [kpis, setKpis] = useState<{
    totalRevenue: number;
    totalStudents: number;
    totalCourses: number;
    totalOrders: number;
    recentOrders: any[];
    allOrders?: any[];
    courses?: any[];
  }>({
    totalRevenue: 0,
    totalStudents: 0,
    totalCourses: 0,
    totalOrders: 0,
    recentOrders: [],
    allOrders: [],
    courses: [],
  });

  // Dynamic Bengali greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "শুভ সকাল, সুপার অ্যাডমিন! ☀️";
    if (hour >= 12 && hour < 17) return "শুভ অপরাহ্ন, সুপার অ্যাডমিন! 🌤️";
    if (hour >= 17 && hour < 20) return "শুভ সন্ধ্যা, সুপার অ্যাডমিন! 🌆";
    return "শুভ রাত্রি, সুপার অ্যাডমিন! 🌙";
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await dbService.getDashboardKPIs();
      setKpis(data);
      const now = new Date();
      setLastRefreshed(
        `${toBengaliNumerals(now.getHours() % 12 || 12)}:${toBengaliNumerals(
          String(now.getMinutes()).padStart(2, "0")
        )} ${now.getHours() >= 12 ? "অপরাহ্ন" : "সকাল"}`
      );
    } catch (e) {
      console.error("Dashboard data load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSeed = async () => {
    if (confirm("আপনি কি নিশ্চিত যে প্রাথমিক ডেমো ডেটা ডাটাবেজে সিড করতে চান?")) {
      setSeeding(true);
      const res = await dbService.seedBaselineData();
      alert(res.message);
      await loadData();
      setSeeding(false);
    }
  };

  const copyOrderNumber = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered orders for the live recent orders table
  const displayedOrders = useMemo(() => {
    const source = kpis.allOrders && kpis.allOrders.length > 0 ? kpis.allOrders : kpis.recentOrders;
    return source.filter((ord: any) => {
      // Status filter
      if (orderFilter === "completed") {
        const isDone = ord.status === "completed" || ord.status === "paid" || ord.status === "success";
        if (!isDone) return false;
      } else if (orderFilter === "pending") {
        const isPending = ord.status === "pending" || ord.status === "processing";
        if (!isPending) return false;
      }

      // Search query
      if (orderSearch.trim()) {
        const q = orderSearch.toLowerCase();
        const num = (ord.order_number || ord.id || "").toLowerCase();
        const name = (ord.profiles?.full_name || "").toLowerCase();
        const phone = (ord.profiles?.phone || "").toLowerCase();
        const course = (ord.courses?.title || ord.courses?.title_bn || "").toLowerCase();
        return num.includes(q) || name.includes(q) || phone.includes(q) || course.includes(q);
      }

      return true;
    }).slice(0, 7);
  }, [kpis.allOrders, kpis.recentOrders, orderFilter, orderSearch]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* ========================================================
          1. Humanized Top Welcome Banner & System Status
          ======================================================== */}
      <div className="bg-gradient-to-r from-surface via-surface to-surface-secondary rounded-2xl border border-border/80 p-5 sm:p-6 shadow-sm relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -mr-28 -mt-28" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-text font-bengali tracking-tight">
                {greeting}
              </h1>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>সুপাবেস লাইভ ক্লাউড</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-text-muted font-bengali mt-1.5 max-w-2xl leading-relaxed">
              Ormission EdTech প্ল্যাটফর্মের কোর্স বিক্রয়, শিক্ষার্থী ভর্তি ও দৈনন্দিন অপারেশনাল রিপোর্ট একনজরে পর্যালোচনা করুন।
            </p>

            {lastRefreshed && (
              <div className="flex items-center gap-3 text-[11px] text-text-muted font-bengali mt-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-text-muted" />
                  <span>সর্বশেষ সিঙ্ক: {lastRefreshed}</span>
                </span>
                <span>•</span>
                <span className="text-primary font-medium">সবগুলো মেট্রিক সক্রিয়</span>
              </div>
            )}
          </div>

          {/* Quick Actions Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap self-stretch sm:self-auto">
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="btn btn-outline btn-sm font-bengali text-xs flex items-center gap-1.5 shadow-xs bg-surface hover:bg-surface-secondary"
              title="তথ্য রিফ্রেশ করুন"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
              <span>রিফ্রেশ</span>
            </button>

            <Link
              href="/courses/enrollments"
              className="btn btn-outline btn-sm font-bengali text-xs flex items-center gap-1.5 shadow-xs bg-surface hover:bg-surface-secondary"
            >
              <FileText className="w-3.5 h-3.5 text-secondary" />
              <span>ভর্তি রিপোর্ট (PDF)</span>
            </Link>

            <Link
              href="/courses/new"
              className="btn btn-primary btn-sm font-bengali text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>নতুন কোর্স তৈরি</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. KPI Cards Grid with Sparklines & Soft Pastel Tints
          ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Revenue */}
        <div className="group bg-surface rounded-2xl border border-border/80 p-5 shadow-xs hover:border-primary/50 hover:shadow-md transition-all duration-200 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-medium text-text-muted font-bengali">মোট অর্জিত রাজস্ব</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline justify-between gap-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-text font-sans tracking-tight">
              {loading ? "..." : formatBDT(kpis.totalRevenue)}
            </div>
            <MiniSparkline type="revenue" color="#2563EB" />
          </div>

          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border/60 text-xs">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
              <span>+১৮.২% এই মাসে</span>
            </span>
            <span className="text-[11px] text-text-muted font-bengali">নেট কোর্স ফি</span>
          </div>
        </div>

        {/* Registered Students */}
        <div className="group bg-surface rounded-2xl border border-border/80 p-5 shadow-xs hover:border-secondary/50 hover:shadow-md transition-all duration-200 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-medium text-text-muted font-bengali">নিবন্ধিত শিক্ষার্থী</span>
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-secondary flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline justify-between gap-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-text font-sans tracking-tight">
              {loading ? "..." : `${toBengaliNumerals(kpis.totalStudents)} জন`}
            </div>
            <MiniSparkline type="students" color="#0F766E" />
          </div>

          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border/60 text-xs">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded font-bengali">
              <CheckCircle2 className="w-3 h-3" />
              <span>সক্রিয় শিক্ষার্থী</span>
            </span>
            <span className="text-[11px] text-text-muted font-bengali">প্রোফাইল ভেরিফাইড</span>
          </div>
        </div>

        {/* Active Courses */}
        <div className="group bg-surface rounded-2xl border border-border/80 p-5 shadow-xs hover:border-accent/50 hover:shadow-md transition-all duration-200 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-medium text-text-muted font-bengali">সক্রিয় কোর্স সংখ্যা</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-accent flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline justify-between gap-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-text font-sans tracking-tight">
              {loading ? "..." : `${toBengaliNumerals(kpis.totalCourses)}টি`}
            </div>
            <MiniSparkline type="courses" color="#E9A23B" />
          </div>

          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border/60 text-xs">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded font-bengali">
              <span>ক্যাটালগ অন্তর্ভুক্ত</span>
            </span>
            <span className="text-[11px] text-text-muted font-bengali">৪টি ক্যাটাগরি</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="group bg-surface rounded-2xl border border-border/80 p-5 shadow-xs hover:border-indigo-500/50 hover:shadow-md transition-all duration-200 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-medium text-text-muted font-bengali">মোট অর্ডার ও ভর্তি</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Receipt className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline justify-between gap-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-text font-sans tracking-tight">
              {loading ? "..." : `${toBengaliNumerals(kpis.totalOrders)}টি`}
            </div>
            <MiniSparkline type="orders" color="#6366F1" />
          </div>

          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border/60 text-xs">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded font-bengali">
              <CheckCircle2 className="w-3 h-3" />
              <span>সফল ট্রানজ্যাকশন</span>
            </span>
            <span className="text-[11px] text-text-muted font-bengali">গেটওয়ে প্রসেসড</span>
          </div>
        </div>
      </div>

      {/* Database Empty Banner (Helpful for fresh install) */}
      {!loading && kpis.totalCourses === 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-bold text-sm text-text font-bengali">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>আপনার Supabase ডাটাবেজে এখনো কোনো কোর্স বা ক্যাটাগরি নেই</span>
            </div>
            <p className="text-xs text-text-muted font-bengali">
              আপনি সরাসরি নতুন কোর্স তৈরি করতে পারেন অথবা এক ক্লিকে প্রাথমিক বেসলাইন ডেটা সিড করে নিতে পারেন।
            </p>
          </div>
          <button
            type="button"
            onClick={handleSeed}
            disabled={seeding}
            className="btn btn-primary btn-sm font-bengali text-xs font-bold whitespace-nowrap shadow-xs"
          >
            <Sparkles className={`w-3.5 h-3.5 ${seeding ? "animate-spin" : ""}`} />
            <span>{seeding ? "সিড হচ্ছে..." : "প্রাথমিক ডেটা সিড করুন"}</span>
          </button>
        </div>
      )}

      {/* ========================================================
          3. Analytics Chart & Operations Shortcuts (Main 2:1 Grid)
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Redesigned Human-Style Revenue Chart */}
        <div className="lg:col-span-2">
          <RevenueAnalyticsChart
            orders={kpis.allOrders}
            totalRevenue={kpis.totalRevenue}
            totalStudents={kpis.totalStudents}
            loading={loading}
          />
        </div>

        {/* Right Column (1 Col): Humanized Quick Operations Shortcuts */}
        <div className="bg-surface rounded-2xl border border-border/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:border-primary/30 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-text font-bengali">
                দ্রুত অ্যাকশন শর্টকাট
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-secondary text-text-muted border border-border">
                অ্যাডমিন লিংক
              </span>
            </div>
            <p className="text-xs text-text-muted font-bengali mb-4">
              নিয়মিত প্রশাসনিক কাজগুলোর সরাসরি অ্যাক্সেস
            </p>

            <div className="space-y-2.5">
              {/* Action 1: Create Course */}
              <Link
                href="/courses/new"
                className="flex items-center justify-between p-3 rounded-xl bg-surface-secondary hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                    <PlusCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bengali text-xs font-bold text-text block">
                      কোর্স তৈরি উইজার্ড
                    </span>
                    <span className="font-bengali text-[11px] text-text-muted">
                      নতুন কোর্স ও কারিকুলাম তৈরি করুন
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>

              {/* Action 2: Free Study Sheet */}
              <Link
                href="/resources"
                className="flex items-center justify-between p-3 rounded-xl bg-surface-secondary hover:bg-teal-500/5 hover:border-teal-500/20 border border-transparent transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-secondary flex items-center justify-center group-hover:scale-105 transition-transform">
                    <FileDown className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bengali text-xs font-bold text-text block">
                      ফ্রি স্টাডি শিট ও নোট
                    </span>
                    <span className="font-bengali text-[11px] text-text-muted">
                      শিক্ষার্থীদের জন্য PDF শিট আপলোড
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-secondary group-hover:translate-x-1 transition-all" />
              </Link>

              {/* Action 3: Payment & Orders Audit */}
              <Link
                href="/orders"
                className="flex items-center justify-between p-3 rounded-xl bg-surface-secondary hover:bg-amber-500/5 hover:border-amber-500/20 border border-transparent transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-accent flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bengali text-xs font-bold text-text block">
                      পেমেন্ট ও অর্ডার অডিট
                    </span>
                    <span className="font-bengali text-[11px] text-text-muted">
                      ম্যানুয়াল ট্রানজ্যাকশন ভেরিফিকেশন
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </Link>

              {/* Action 4: SSLCommerz Payment Settings */}
              <Link
                href="/settings/payment"
                className="flex items-center justify-between p-3 rounded-xl bg-surface-secondary hover:bg-emerald-500/5 hover:border-emerald-500/20 border border-transparent transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bengali text-xs font-bold text-text block">
                      SSLCommerz গেটওয়ে সেটিংস
                    </span>
                    <span className="font-bengali text-[11px] text-text-muted">
                      পেমেন্ট গেটওয়ে ক্রেডেনশিয়াল ও মোড
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
              </Link>

              {/* Action 5: Enrollment PDF Report */}
              <Link
                href="/courses/enrollments"
                className="flex items-center justify-between p-3 rounded-xl bg-surface-secondary hover:bg-rose-500/5 hover:border-rose-500/20 border border-transparent transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bengali text-xs font-bold text-text block">
                      এনরোলমেন্ট রিপোর্ট (PDF)
                    </span>
                    <span className="font-bengali text-[11px] text-text-muted">
                      ব্যাচভিত্তিক ভর্তি পরিসংখ্যান ডাউনলোড
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-rose-600 group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </div>

          {/* Infrastructure Health Badge */}
          <div className="pt-4 mt-4 border-t border-border/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bengali text-text-muted flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>ডাটাবেজ সুরক্ষা:</span>
              </span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                PostgreSQL RLS সক্রিয়
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-text-muted">
              <span className="font-bengali">ভিডিও সিকিউরিটি:</span>
              <span className="font-mono text-primary font-semibold text-[11px]">
                ডায়নামিক ওয়াটারমার্ক
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          4. Platform Breakdown & Channel Share Widgets (NEW)
          ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Payment Channels Split */}
        <div className="bg-surface rounded-2xl border border-border/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-text font-bengali">
              পেমেন্ট চ্যানেল শেয়ার
            </h3>
            <span className="text-[10px] text-text-muted font-bengali">এই মাসে</span>
          </div>

          <div className="space-y-3 font-bengali text-xs">
            {/* bKash */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-text font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#E2136E]" />
                  <span>বিকাশ (bKash Gateway)</span>
                </span>
                <span className="font-bold text-text font-sans">৬৮%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-secondary overflow-hidden">
                <div className="h-full bg-[#E2136E] rounded-full" style={{ width: "68%" }} />
              </div>
            </div>

            {/* Nagad */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-text font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#F7931E]" />
                  <span>নগদ (Nagad Online)</span>
                </span>
                <span className="font-bold text-text font-sans">২২%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-secondary overflow-hidden">
                <div className="h-full bg-[#F7931E] rounded-full" style={{ width: "22%" }} />
              </div>
            </div>

            {/* SSLCommerz Cards */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-text font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span>ভিসা / মাস্টারকার্ড ও অন্যান্য</span>
                </span>
                <span className="font-bold text-text font-sans">১০%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-secondary overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: "10%" }} />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/70 flex items-center justify-between text-[11px] text-text-muted font-bengali">
            <span>ইনস্ট্যান্ট নোটিফিকেশন</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">সক্রিয়</span>
          </div>
        </div>

        {/* Popular Course Categories */}
        <div className="bg-surface rounded-2xl border border-border/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-text font-bengali">
              ক্যাটাগরি অনুযায়ী আগ্রহ
            </h3>
            <span className="text-[10px] text-text-muted font-bengali">ভর্তি অনুপাত</span>
          </div>

          <div className="space-y-3 font-bengali text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-text font-medium">ইঞ্জিনিয়ারিং ও প্রযুক্তি</span>
                <span className="font-bold text-text font-sans">৪৬%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-secondary overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: "46%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-text font-medium">মেডিকেল ও ডেন্টাল প্রস্তুতি</span>
                <span className="font-bold text-text font-sans">৩৪%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-secondary overflow-hidden">
                <div className="h-full bg-teal-600 rounded-full" style={{ width: "34%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-text font-medium">এইচএসসি একাডেমিক ও সলভ</span>
                <span className="font-bold text-text font-sans">২০%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-secondary overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "20%" }} />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/70 flex items-center justify-between text-[11px] text-text-muted font-bengali">
            <span>সর্বোচ্চ ডিমান্ড: ইঞ্জিনিয়ারিং</span>
            <Link href="/courses" className="text-primary hover:underline font-semibold">
              কোর্স দেখুন
            </Link>
          </div>
        </div>

        {/* Operational Highlights & Tips */}
        <div className="bg-surface rounded-2xl border border-border/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-bold text-text font-bengali">
                অ্যাডমিন টিপস ও ইনসাইট
              </h3>
            </div>
            <p className="text-xs text-text-muted font-bengali leading-relaxed">
              আসন্ন মেডিকেল ও বুয়েট পরীক্ষার জন্য প্রতিটি কোর্সে রিকুইজিট (Prerequisites) যুক্ত করুন, যাতে শিক্ষার্থীরা প্রাসঙ্গিক ফাউন্ডেশন পূরণ করে কোর্সে অংশ নিতে পারে।
            </p>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-surface-secondary border border-border text-xs space-y-1.5 font-bengali">
            <div className="flex items-center justify-between">
              <span className="text-text-muted">কোর্স রিকুইজিট ফিচার:</span>
              <span className="text-success font-bold">লাইভ ভেরিয়েন্ট</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">সার্ভার লেটেন্সি:</span>
              <span className="text-primary font-mono font-semibold">২৪ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          5. Live Recent Orders Stream & Quick Inspection Table
          ======================================================== */}
      <div className="bg-surface rounded-2xl border border-border/80 p-5 sm:p-6 shadow-xs">
        {/* Table Header with Filters and Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-border/70">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-text font-bengali">
                সাম্প্রতিক শিক্ষার্থী ভর্তি ও অর্ডার
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                লাইভ ট্র্যাকার
              </span>
            </div>
            <p className="text-xs text-text-muted font-bengali mt-0.5">
              ডাটাবেজে যুক্ত হওয়া সর্বশেষ শিক্ষার্থী রেজিস্ট্রেশন ও পেমেন্ট রেকর্ড
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="শিক্ষার্থী বা অর্ডার খুঁজুন..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-surface-secondary border border-border text-xs text-text placeholder:text-text-muted focus:outline-none focus:border-primary font-bengali"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center p-0.5 rounded-lg bg-surface-secondary border border-border text-xs font-bengali">
              <button
                type="button"
                onClick={() => setOrderFilter("all")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  orderFilter === "all"
                    ? "bg-surface text-primary shadow-xs font-bold"
                    : "text-text-muted hover:text-text"
                }`}
              >
                সকল
              </button>
              <button
                type="button"
                onClick={() => setOrderFilter("completed")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  orderFilter === "completed"
                    ? "bg-surface text-emerald-600 dark:text-emerald-400 shadow-xs font-bold"
                    : "text-text-muted hover:text-text"
                }`}
              >
                সফল
              </button>
              <button
                type="button"
                onClick={() => setOrderFilter("pending")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  orderFilter === "pending"
                    ? "bg-surface text-amber-600 dark:text-amber-400 shadow-xs font-bold"
                    : "text-text-muted hover:text-text"
                }`}
              >
                পেন্ডিং
              </button>
            </div>

            <Link
              href="/orders"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 font-bengali ml-1"
            >
              <span>সকল দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="py-16 text-center text-xs text-text-muted font-bengali">
            <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-primary" />
            ডাটাবেজ থেকে সাম্প্রতিক অর্ডার লোড করা হচ্ছে...
          </div>
        ) : displayedOrders.length === 0 ? (
          <div className="py-16 text-center text-xs text-text-muted font-bengali">
            <Receipt className="w-10 h-10 mx-auto mb-2 opacity-30 text-text-muted" />
            <p className="font-bold text-text text-sm">কোনো অর্ডার পাওয়া যায়নি</p>
            <p className="mt-1">
              {orderSearch
                ? "অনুসন্ধানের সাথে কোনো তথ্য মেলেনি।"
                : "নতুন শিক্ষার্থী ভর্তি হলে এখানে স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে।"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/80 text-text-muted uppercase tracking-wider text-[10px] font-sans">
                <tr>
                  <th className="py-3 px-3 font-semibold">অর্ডার আইডি</th>
                  <th className="py-3 px-3 font-semibold font-bengali">শিক্ষার্থী</th>
                  <th className="py-3 px-3 font-semibold font-bengali">কোর্স নাম</th>
                  <th className="py-3 px-3 font-semibold font-bengali">পরিমাণ</th>
                  <th className="py-3 px-3 font-semibold font-bengali">পদ্ধতি</th>
                  <th className="py-3 px-3 font-semibold font-bengali">স্ট্যাটাস</th>
                  <th className="py-3 px-3 font-semibold font-bengali text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {displayedOrders.map((ord: any) => {
                  const studentName = ord.profiles?.full_name || "নাম অপ্রাপ্ত";
                  const studentPhone = ord.profiles?.phone || "";
                  const courseTitle = ord.courses?.title_bn || ord.courses?.title || "অনলাইন ব্যাচ";
                  const orderNum = ord.order_number || ord.id.slice(0, 8);
                  const isSuccess =
                    ord.status === "completed" || ord.status === "paid" || ord.status === "success";

                  // Color for student initial avatar
                  const initial = studentName.charAt(0);

                  return (
                    <tr
                      key={ord.id}
                      className="hover:bg-surface-secondary/60 transition-colors group"
                    >
                      {/* Order Number + Copy */}
                      <td className="py-3.5 px-3 font-mono font-medium text-text">
                        <div className="flex items-center gap-1.5">
                          <span>{orderNum}</span>
                          <button
                            type="button"
                            onClick={() => copyOrderNumber(orderNum, ord.id)}
                            className="text-text-muted hover:text-text opacity-0 group-hover:opacity-100 transition-opacity"
                            title="অর্ডার নম্বর কপি করুন"
                          >
                            {copiedId === ord.id ? (
                              <Check className="w-3 h-3 text-success" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Student info */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0">
                            {initial}
                          </div>
                          <div>
                            <span className="font-bold text-text block font-bengali">
                              {studentName}
                            </span>
                            {studentPhone && (
                              <span className="text-[10px] text-text-muted font-sans block">
                                {studentPhone}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Course */}
                      <td className="py-3.5 px-3 font-bengali text-text max-w-xs truncate">
                        <span title={courseTitle}>{courseTitle}</span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-3 font-bold text-text font-sans text-sm">
                        {formatBDT(Number(ord.paid_amount || ord.total_amount || 0))}
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 px-3 text-text-muted">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-secondary text-text border border-border">
                          {ord.payment_method || "bKash"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        {isSuccess ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] font-bengali">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>সফল</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold text-[11px] font-bengali">
                            <Clock className="w-3.5 h-3.5" />
                            <span>পেন্ডিং</span>
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-3 text-right">
                        <Link
                          href="/orders"
                          className="text-[11px] text-primary hover:underline font-bengali font-semibold"
                        >
                          বিস্তারিত
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
