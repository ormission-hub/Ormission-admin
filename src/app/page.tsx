"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import { dbService, type DbOrder } from "@/lib/supabase/db-service";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [kpis, setKpis] = useState<{
    totalRevenue: number;
    totalStudents: number;
    totalCourses: number;
    totalOrders: number;
    recentOrders: any[];
  }>({
    totalRevenue: 0,
    totalStudents: 0,
    totalCourses: 0,
    totalOrders: 0,
    recentOrders: [],
  });

  const loadData = async () => {
    setLoading(true);
    const data = await dbService.getDashboardKPIs();
    setKpis(data);
    setLoading(false);
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

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-bold text-text font-bengali tracking-tight">
              অ্যাডমিন ড্যাশবোর্ড ও বিশ্লেষণ
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
              লাইভ ডেটা
            </span>
          </div>
          <p className="text-xs text-text-muted font-bengali mt-1">
            সুপাবেস ডাটাবেজের সরাসরি কোর্স বিক্রয়, শিক্ষার্থী পরিসংখ্যান ও অর্ডার পরিচালনা
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="btn btn-outline btn-sm font-bengali text-xs flex items-center gap-1.5 shadow-xs"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
            <span>রিফ্রেশ</span>
          </button>

          <Link
            href="/courses/new"
            className="btn btn-primary btn-sm font-bengali text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>নতুন কোর্স তৈরি</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-surface rounded-xl border border-border p-5 shadow-xs hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-text-muted font-bengali font-medium">মোট রাজস্ব</span>
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-text font-sans mb-1">
            {loading ? "..." : `৳${kpis.totalRevenue.toLocaleString()}`}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-success font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+১৮.২% এই মাসে</span>
          </div>
        </div>

        {/* Active Students */}
        <div className="bg-surface rounded-xl border border-border p-5 shadow-xs hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-text-muted font-bengali font-medium">নিবন্ধিত শিক্ষার্থী</span>
            <div className="w-9 h-9 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-text font-sans mb-1">
            {loading ? "..." : kpis.totalStudents.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-success font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>সক্রিয় অ্যাকাউন্ট</span>
          </div>
        </div>

        {/* Total Courses */}
        <div className="bg-surface rounded-xl border border-border p-5 shadow-xs hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-text-muted font-bengali font-medium">সক্রিয় কোর্স সংখ্যা</span>
            <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-text font-sans mb-1">
            {loading ? "..." : `${kpis.totalCourses}টি`}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium">
            <span>ক্যাটালগে অন্তর্ভুক্ত</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-surface rounded-xl border border-border p-5 shadow-xs hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-text-muted font-bengali font-medium">মোট অর্ডার</span>
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-text font-sans mb-1">
            {loading ? "..." : `${kpis.totalOrders}টি`}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-success font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>সফল ট্রানজ্যাকশন</span>
          </div>
        </div>
      </div>

      {/* Database Empty Banner (Helpful for fresh start) */}
      {!loading && kpis.totalCourses === 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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

      {/* Analytics Chart & Quick Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Visual */}
        <div className="lg:col-span-2 bg-surface rounded-xl border border-border p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-text font-bengali">
                মাসিক রাজস্ব ও বিক্রয় প্রবণতা
              </h2>
              <p className="text-xs text-text-muted font-bengali mt-0.5">
                বিগত ৩০ দিনের দৈনিক আয় এবং ভর্তি হার
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-secondary text-text border border-border">
              সর্বশেষ ৩০ দিন
            </span>
          </div>

          {/* Responsive Bar Chart Visual */}
          <div className="h-48 w-full flex items-end justify-between gap-1 sm:gap-2 pt-6 border-b border-border">
            {[35, 52, 44, 68, 85, 70, 92, 60, 78, 88, 95, 80, 110, 90].map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <div
                  style={{ height: `${(val / 110) * 100}%` }}
                  className="w-full rounded-t-sm bg-primary/25 group-hover:bg-primary transition-all duration-150 relative cursor-pointer"
                >
                  <span className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-surface text-text px-1 py-0.5 rounded shadow-sm border border-border pointer-events-none whitespace-nowrap transition-opacity">
                    ৳{val * 350}
                  </span>
                </div>
                <span className="text-[9px] text-text-muted hidden sm:block">
                  {idx + 1}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-text-muted mt-4 font-bengali">
            <span>১ম সপ্তাহ</span>
            <span>২য় সপ্তাহ</span>
            <span>৩য় সপ্তাহ</span>
            <span>৪র্থ সপ্তাহ</span>
          </div>
        </div>

        {/* Quick Operations Shortcuts */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-text font-bengali mb-1">
              দ্রুত অ্যাকশন শর্টকাট
            </h2>
            <p className="text-xs text-text-muted font-bengali mb-4">
              নিয়মিত প্রশাসনিক কাজগুলোর সরাসরি লিংক
            </p>

            <div className="space-y-2.5">
              <Link
                href="/courses/new"
                className="flex items-center justify-between p-3 rounded-lg bg-surface-secondary hover:bg-border transition-colors group text-xs font-semibold text-text"
              >
                <div className="flex items-center gap-2.5">
                  <PlusCircle className="w-4 h-4 text-primary" />
                  <span className="font-bengali">কোর্স তৈরি উইজার্ড</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/resources"
                className="flex items-center justify-between p-3 rounded-lg bg-surface-secondary hover:bg-border transition-colors group text-xs font-semibold text-text"
              >
                <div className="flex items-center gap-2.5">
                  <FileDown className="w-4 h-4 text-secondary" />
                  <span className="font-bengali">ফ্রি স্টাডি শিট আপলোড</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/orders"
                className="flex items-center justify-between p-3 rounded-lg bg-surface-secondary hover:bg-border transition-colors group text-xs font-semibold text-text"
              >
                <div className="flex items-center gap-2.5">
                  <Receipt className="w-4 h-4 text-accent" />
                  <span className="font-bengali">পেমেন্ট ও অর্ডার অডিট</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/settings"
                className="flex items-center justify-between p-3 rounded-lg bg-surface-secondary hover:bg-border transition-colors group text-xs font-semibold text-text"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span className="font-bengali">SSLCommerz গেটওয়ে সেটিংস</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-border flex items-center justify-between text-xs text-text-muted">
            <span className="font-bengali">ডাটাবেজ ইঞ্জিন</span>
            <span className="font-mono text-primary font-bold">PostgreSQL RLS</span>
          </div>
        </div>
      </div>

      {/* Live Recent Orders Stream */}
      <div className="bg-surface rounded-xl border border-border p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-text font-bengali">
              সাম্প্রতিক অর্ডারসমূহ
            </h2>
            <p className="text-xs text-text-muted font-bengali mt-0.5">
              ডাটাবেজে যুক্ত হওয়া সর্বশেষ শিক্ষার্থী রেজিস্ট্রেশন ও পেমেন্ট
            </p>
          </div>
          <Link
            href="/orders"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 font-bengali"
          >
            <span>সকল অর্ডার দেখুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-text-muted font-bengali">
            <RefreshCw className="w-5 h-5 mx-auto mb-2 animate-spin text-primary" />
            ডাটা লোড হচ্ছে...
          </div>
        ) : kpis.recentOrders.length === 0 ? (
          <div className="py-12 text-center text-xs text-text-muted font-bengali">
            <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40 text-text-muted" />
            এখনো কোনো সাম্প্রতিক অর্ডার নেই।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border text-text-muted uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-3 font-semibold">অর্ডার আইডি</th>
                  <th className="py-3 px-3 font-semibold">শিক্ষার্থী</th>
                  <th className="py-3 px-3 font-semibold">পরিমাণ</th>
                  <th className="py-3 px-3 font-semibold">পদ্ধতি</th>
                  <th className="py-3 px-3 font-semibold">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {kpis.recentOrders.map((ord: any) => (
                  <tr key={ord.id} className="hover:bg-surface-secondary/50 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-medium text-text">
                      {ord.order_number || ord.id.slice(0, 8)}
                    </td>
                    <td className="py-3.5 px-3 font-medium text-text">
                      {ord.profiles?.full_name || "শিক্ষার্থী"}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-text">
                      ৳{Number(ord.paid_amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-text-muted">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-secondary text-text border border-border">
                        {ord.payment_method || "bKash"}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 text-success font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>সফল</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
