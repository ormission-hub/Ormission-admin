"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Filter,
  Receipt,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  ArrowUpDown,
  ExternalLink,
  ChevronDown,
  Eye,
  CheckCheck,
} from "lucide-react";
import { dbService, type DbOrder } from "@/lib/supabase/db-service";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "paid" | "failed">("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<DbOrder | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    const data = await dbService.getOrders();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (id: string, newStatus: DbOrder["status"]) => {
    try {
      setProcessingId(id);
      const ok = await dbService.updateOrderStatus(id, newStatus);
      if (ok) {
        setOrders((prev) =>
          prev.map((ord) => (ord.id === id ? { ...ord, status: newStatus } : ord))
        );
        if (selectedOrder && selectedOrder.id === id) {
          setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      } else {
        alert("অর্ডারের স্ট্যাটাস পরিবর্তন করা যায়নি।");
      }
    } finally {
      setProcessingId(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    if (orders.length === 0) {
      alert("এক্সপোর্ট করার মতো কোনো অর্ডার নেই।");
      return;
    }
    const headers = [
      "Order Number",
      "Student Name",
      "Phone",
      "Course",
      "Sender Mobile",
      "Transaction ID",
      "Paid Amount",
      "Method",
      "Status",
      "Date",
    ];
    const rows = orders.map((o) => [
      o.order_number || o.id,
      o.student_name || o.profiles?.full_name || "N/A",
      o.student_phone || o.profiles?.phone || "N/A",
      o.courses?.title_bn || o.courses?.title || "Course",
      o.sender_number || "N/A",
      o.transaction_id || "N/A",
      o.paid_amount,
      o.payment_method || "bKash",
      o.status,
      o.created_at,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers, ...rows].map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ormission_orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Status-based counts
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const paidCount = orders.filter((o) => o.status === "paid" || o.status === "completed").length;
  const failedCount = orders.filter((o) => o.status === "failed" || o.status === "cancelled").length;
  const totalRevenue = orders
    .filter((o) => o.status === "paid" || o.status === "completed")
    .reduce((sum, o) => sum + (Number(o.paid_amount) || 0), 0);

  const filtered = orders.filter((ord) => {
    const q = query.toLowerCase();
    const matchesSearch =
      !q ||
      (ord.order_number && ord.order_number.toLowerCase().includes(q)) ||
      (ord.student_name && ord.student_name.toLowerCase().includes(q)) ||
      (ord.profiles?.full_name && ord.profiles.full_name.toLowerCase().includes(q)) ||
      (ord.student_phone && ord.student_phone.includes(q)) ||
      (ord.sender_number && ord.sender_number.includes(q)) ||
      (ord.transaction_id && ord.transaction_id.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "paid"
        ? ord.status === "paid" || ord.status === "completed"
        : statusFilter === "pending"
        ? ord.status === "pending"
        : ord.status === "failed" || ord.status === "cancelled";

    const matchesMethod =
      methodFilter === "all" ||
      (ord.payment_method && ord.payment_method.toLowerCase() === methodFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesMethod;
  });

  const getMethodBadge = (m?: string) => {
    const method = (m || "bkash").toLowerCase();
    switch (method) {
      case "bkash":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E2136E]/10 text-[#E2136E] border border-[#E2136E]/20">
            bKash (বিকাশ)
          </span>
        );
      case "nagad":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F7941D]/10 text-[#F7941D] border border-[#F7941D]/20">
            Nagad (নগদ)
          </span>
        );
      case "rocket":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#8C3494]/10 text-[#8C3494] border border-[#8C3494]/20">
            Rocket (রকেট)
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-secondary text-text border border-border uppercase">
            {m || "Card"}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-bengali">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-text font-bengali">
              ম্যানুয়াল পেমেন্ট ভেরিফিকেশন ও অর্ডার অডিট
            </h1>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white animate-pulse">
                {pendingCount} অপেক্ষমান
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted font-bengali mt-0.5">
            শিক্ষার্থীদের বিকাশ, নগদ ও রকেট পেমেন্টের TrxID যাচাই করে কোর্স অনুমোদন করুন
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadOrders}
            disabled={loading}
            className="btn btn-outline btn-sm font-bengali text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
            <span>রিফ্রেশ</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="btn btn-primary btn-sm font-bengali font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>CSV রিপোর্ট ডাউনলোড</span>
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total */}
        <div className="bg-surface rounded-xl border border-border p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted">সর্বমোট অর্ডার</span>
            <Receipt className="w-4 h-4 text-text-muted" />
          </div>
          <div className="text-2xl font-black text-text font-sans mt-2">
            {orders.length}
          </div>
          <div className="text-[11px] text-text-muted mt-1">
            প্ল্যাটফর্মের সকল লেনদেন রেকর্ড
          </div>
        </div>

        {/* Card 2: Pending Verification */}
        <div
          onClick={() => setStatusFilter("pending")}
          className={`cursor-pointer bg-surface rounded-xl border p-4 shadow-xs transition-all ${
            statusFilter === "pending"
              ? "border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/5"
              : "border-border hover:border-amber-500/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 animate-spin-slow" />
              <span>ভেরিফিকেশন অপেক্ষমান</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-sans mt-2">
            {pendingCount}
          </div>
          <div className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-1">
            যাচাই ও অনুমোদনের অপেক্ষায়
          </div>
        </div>

        {/* Card 3: Approved / Paid */}
        <div
          onClick={() => setStatusFilter("paid")}
          className={`cursor-pointer bg-surface rounded-xl border p-4 shadow-xs transition-all ${
            statusFilter === "paid"
              ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-500/5"
              : "border-border hover:border-emerald-500/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>অনুমোদিত ও সফল</span>
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-sans mt-2">
            {paidCount}
          </div>
          <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">
            কোর্স ক্লাসরুম সক্রিয় শিক্ষার্থী
          </div>
        </div>

        {/* Card 4: Total Revenue */}
        <div className="bg-surface rounded-xl border border-border p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted">অনুমোদিত মোট আদায়</span>
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
              BDT
            </span>
          </div>
          <div className="text-2xl font-black text-primary font-sans mt-2">
            ৳{totalRevenue.toLocaleString("en-US")}
          </div>
          <div className="text-[11px] text-text-muted mt-1">
            ভেরিফাইড পেমেন্টের মোট পরিমাণ
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-surface rounded-xl border border-border p-4 shadow-xs space-y-3">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === "all"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                : "text-text-muted hover:text-text hover:bg-surface-secondary"
            }`}
          >
            সকল অর্ডার ({orders.length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              statusFilter === "pending"
                ? "bg-amber-500 text-white shadow-xs"
                : "text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>অপেক্ষমান ভেরিফিকেশন ({pendingCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("paid")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              statusFilter === "paid"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>অনুমোদিত ({paidCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("failed")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              statusFilter === "failed"
                ? "bg-rose-600 text-white shadow-xs"
                : "text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>বাতিলকৃত ({failedCount})</span>
          </button>
        </div>

        {/* Search & Method dropdown */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="অর্ডার আইডি, TrxID, প্রেরক নম্বর বা নাম..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input w-full pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="input text-xs py-1.5"
            >
              <option value="all">সকল পেমেন্ট মাধ্যম</option>
              <option value="bKash">bKash (বিকাশ)</option>
              <option value="Nagad">Nagad (নগদ)</option>
              <option value="Rocket">Rocket (রকেট)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center text-xs text-text-muted font-bengali">
          <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-primary" />
          অর্ডার ও পেমেন্ট বিবরণী লোড হচ্ছে...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center">
          <Receipt className="w-10 h-10 mx-auto mb-3 opacity-30 text-text-muted" />
          <h3 className="text-base font-bold text-text font-bengali mb-1">
            কোনো অর্ডার পাওয়া যায়নি
          </h3>
          <p className="text-xs text-text-muted font-bengali">
            {orders.length === 0
              ? "এখনো কোনো কোর্সের পেমেন্ট রিকোয়েস্ট জমা পড়েনি।"
              : "ফিল্টার অনুসন্ধানের সাথে কোনো অর্ডার মেলেনি।"}
          </p>
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-secondary/70 border-b border-border text-text-muted uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">অর্ডার নম্বর ও তারিখ</th>
                  <th className="py-3.5 px-4 font-semibold">শিক্ষার্থীর বিবরণ</th>
                  <th className="py-3.5 px-4 font-semibold">কোর্স</th>
                  <th className="py-3.5 px-4 font-semibold">পেমেন্ট মেথড</th>
                  <th className="py-3.5 px-4 font-semibold">টাকা পাঠানোর নম্বর</th>
                  <th className="py-3.5 px-4 font-semibold">ট্রানজাকশন আইডি (TrxID)</th>
                  <th className="py-3.5 px-4 font-semibold">মূল্য</th>
                  <th className="py-3.5 px-4 font-semibold">ভেরিফিকেশন স্ট্যাটাস</th>
                  <th className="py-3.5 px-4 font-semibold text-right">অ্যাকশন (যাচাই)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((ord) => {
                  const isPending = ord.status === "pending";
                  const isPaid = ord.status === "paid" || ord.status === "completed";
                  const isFailed = ord.status === "failed" || ord.status === "cancelled";
                  const dateFormatted = ord.created_at
                    ? new Date(ord.created_at).toLocaleDateString("bn-BD", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—";

                  return (
                    <tr
                      key={ord.id}
                      className={`transition-colors ${
                        isPending
                          ? "bg-amber-500/[0.03] hover:bg-amber-500/[0.07]"
                          : "hover:bg-surface-secondary/40"
                      }`}
                    >
                      {/* Order Number & Date */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-text text-xs">
                          {ord.order_number || ord.id.slice(0, 8)}
                        </div>
                        <div className="text-[10px] text-text-muted font-sans mt-0.5">
                          {dateFormatted}
                        </div>
                      </td>

                      {/* Student Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-text text-xs">
                          {ord.student_name || ord.profiles?.full_name || "রেজিস্টার্ড শিক্ষার্থী"}
                        </div>
                        <div className="text-[11px] text-text-muted font-sans">
                          {ord.student_phone || ord.profiles?.phone || "ফোন নম্বর নেই"}
                        </div>
                        {ord.student_email && (
                          <div className="text-[10px] text-text-muted font-sans truncate max-w-[140px]">
                            {ord.student_email}
                          </div>
                        )}
                      </td>

                      {/* Course */}
                      <td className="py-3.5 px-4 max-w-xs truncate text-text font-medium">
                        {ord.courses?.title_bn || ord.courses?.title || "অনলাইন কোর্স"}
                      </td>

                      {/* Method */}
                      <td className="py-3.5 px-4">
                        {getMethodBadge(ord.payment_method)}
                      </td>

                      {/* Sender Number */}
                      <td className="py-3.5 px-4 font-sans font-bold text-text">
                        {ord.sender_number || "—"}
                      </td>

                      {/* TrxID with 1-click copy */}
                      <td className="py-3.5 px-4">
                        {ord.transaction_id ? (
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-surface-secondary border border-border/80 font-mono text-[11px] font-bold text-text">
                            <span>{ord.transaction_id}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(ord.transaction_id!, ord.id)}
                              title="TrxID কপি করুন"
                              className="p-0.5 rounded hover:bg-surface text-text-muted hover:text-text transition-colors"
                            >
                              {copiedId === ord.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-text-muted text-xs">—</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-sans font-bold text-primary text-sm whitespace-nowrap">
                        ৳{Number(ord.paid_amount || ord.total_amount || 0).toLocaleString("en-US")}
                      </td>

                      {/* Verification Status */}
                      <td className="py-3.5 px-4">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                            <Clock className="w-3 h-3 animate-pulse" />
                            <span>অপেক্ষমান (Review)</span>
                          </span>
                        ) : isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>অনুমোদিত (Approved)</span>
                          </span>
                        ) : isFailed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25">
                            <XCircle className="w-3 h-3" />
                            <span>বাতিলকৃত (Rejected)</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-surface-secondary text-text-muted border border-border">
                            {ord.status}
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(ord.id, "paid")}
                                disabled={processingId === ord.id}
                                title="পেমেন্ট যাচাইপূর্বক কোর্স অনুমোদন করুন"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                              >
                                {processingId === ord.id ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <CheckCheck className="w-3.5 h-3.5" />
                                )}
                                <span>অনুমোদন</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm("আপনি কি নিশ্চিত এই পেমেন্ট রিকোয়েস্টটি বাতিল করতে চান?")) {
                                    handleStatusChange(ord.id, "failed");
                                  }
                                }}
                                disabled={processingId === ord.id}
                                title="ভুল/ভুয়া TrxID হলে বাতিল করুন"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-rose-300 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 font-bold text-[11px] transition-colors cursor-pointer disabled:opacity-50"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>বাতিল</span>
                              </button>
                            </>
                          ) : (
                            <select
                              value={ord.status}
                              onChange={(e) => handleStatusChange(ord.id, e.target.value as any)}
                              className="text-[10px] font-bold px-2 py-1 rounded border bg-surface text-text border-border"
                            >
                              <option value="paid">অনুমোদিত (Paid)</option>
                              <option value="pending">অপেক্ষমান (Pending)</option>
                              <option value="failed">বাতিলকৃত (Failed)</option>
                              <option value="refunded">রিফান্ডেড (Refunded)</option>
                            </select>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedOrder(ord)}
                            title="বিস্তারিত দেখুন"
                            className="p-1 rounded-lg hover:bg-surface-secondary text-text-muted hover:text-text transition-colors"
                          >
                            <Eye className="w-4 h-4" />
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
      )}

      {/* Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-border shadow-2xl max-w-lg w-full p-6 space-y-4 font-bengali">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-text">
                  অর্ডার বিস্তারিত: {selectedOrder.order_number}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg hover:bg-surface-secondary text-text-muted hover:text-text"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between p-2.5 rounded-lg bg-surface-secondary/50">
                <span className="text-text-muted">কোর্সের নাম</span>
                <span className="font-bold text-text text-right max-w-[240px]">
                  {selectedOrder.courses?.title_bn || selectedOrder.courses?.title || "অনলাইন কোর্স"}
                </span>
              </div>

              <div className="flex justify-between p-2.5 rounded-lg bg-surface-secondary/50">
                <span className="text-text-muted">শিক্ষার্থীর নাম</span>
                <span className="font-bold text-text">
                  {selectedOrder.student_name || selectedOrder.profiles?.full_name || "শিক্ষার্থী"}
                </span>
              </div>

              <div className="flex justify-between p-2.5 rounded-lg bg-surface-secondary/50">
                <span className="text-text-muted">শিক্ষার্থীর ইমেইল</span>
                <span className="font-sans font-medium text-text">
                  {selectedOrder.student_email || "N/A"}
                </span>
              </div>

              <div className="flex justify-between p-2.5 rounded-lg bg-surface-secondary/50">
                <span className="text-text-muted">টাকা পাঠানোর নম্বর (Sender)</span>
                <span className="font-sans font-bold text-text">
                  {selectedOrder.sender_number || selectedOrder.student_phone || "N/A"}
                </span>
              </div>

              <div className="flex justify-between p-2.5 rounded-lg bg-surface-secondary/50">
                <span className="text-text-muted">ট্রানজাকশন আইডি (TrxID)</span>
                <span className="font-mono font-bold text-primary">
                  {selectedOrder.transaction_id || "N/A"}
                </span>
              </div>

              <div className="flex justify-between p-2.5 rounded-lg bg-surface-secondary/50">
                <span className="text-text-muted">পেমেন্ট মাধ্যম</span>
                <span>{getMethodBadge(selectedOrder.payment_method)}</span>
              </div>

              <div className="flex justify-between p-2.5 rounded-lg bg-surface-secondary/50">
                <span className="text-text-muted">পরিশোধিত অর্থ</span>
                <span className="font-sans font-black text-primary text-base">
                  ৳{Number(selectedOrder.paid_amount || 0).toLocaleString("en-US")}
                </span>
              </div>

              <div className="flex justify-between p-2.5 rounded-lg bg-surface-secondary/50">
                <span className="text-text-muted">বর্তমান স্ট্যাটাস</span>
                <span className="font-bold uppercase">{selectedOrder.status}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
              {selectedOrder.status === "pending" && (
                <>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedOrder.id, "paid")}
                    className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>অনুমোদন করুন (Approve)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedOrder.id, "failed")}
                    className="btn btn-sm btn-outline text-rose-600 border-rose-300 hover:bg-rose-50 font-bold text-xs flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>বাতিল করুন (Reject)</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="btn btn-sm btn-outline text-xs"
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
