"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Users,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Eye,
  MapPin,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Receipt,
  Copy,
  Check,
  GraduationCap,
  ShieldCheck,
  AlertCircle,
  Clock,
  ExternalLink,
  X,
} from "lucide-react";
import { dbService, type DbStudent } from "@/lib/supabase/db-service";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<DbStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [selectedStudent, setSelectedStudent] = useState<DbStudent | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await dbService.getStudents();
      setStudents(data);
      if (selectedStudent) {
        const fresh = data.find((s) => s.id === selectedStudent.id);
        if (fresh) setSelectedStudent(fresh);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const copyToClipboard = (text: string, fieldKey: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const toggleStatus = async (id: string, currentStatus: boolean, name: string) => {
    const actionText = currentStatus ? "স্থগিত (Suspend)" : "পুনরায় সক্রিয় (Reactivate)";
    if (confirm(`আপনি কি '${name}'-এর অ্যাকাউন্ট ${actionText} করতে চান?`)) {
      setActionLoading(id);
      try {
        const ok = await dbService.toggleStudentStatus(id, currentStatus);
        if (ok) {
          setStudents((prev) =>
            prev.map((s) => (s.id === id ? { ...s, is_active: !s.is_active } : s))
          );
          if (selectedStudent && selectedStudent.id === id) {
            setSelectedStudent((prev) => (prev ? { ...prev, is_active: !prev.is_active } : null));
          }
        } else {
          alert("স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।");
        }
      } finally {
        setActionLoading(null);
      }
    }
  };

  const activeCount = students.filter((s) => s.is_active).length;
  const suspendedCount = students.filter((s) => !s.is_active).length;

  const filtered = students.filter((s) => {
    // Status filter
    if (statusFilter === "active" && !s.is_active) return false;
    if (statusFilter === "suspended" && s.is_active) return false;

    // Search query
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();
    return (
      (s.full_name && s.full_name.toLowerCase().includes(q)) ||
      (s.phone && s.phone.includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      (s.address && s.address.toLowerCase().includes(q)) ||
      (s.id && s.id.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-bengali">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-text">
              শিক্ষার্থী ব্যবস্থাপনা ({students.length})
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
              Supabase Profiles & Auth
            </span>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            নিবন্ধিত সকল শিক্ষার্থীর ব্যক্তিগত বিবরণ, ফোন নম্বর, পূর্ণাঙ্গ ঠিকানা ও নিরাপত্তা তথ্য
          </p>
        </div>

        <button
          type="button"
          onClick={loadStudents}
          disabled={loading}
          className="btn btn-outline btn-sm text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
          <span>রিফ্রেশ</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-surface rounded-xl border border-border p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="নাম, ফোন নম্বর, ইমেইল বা ঠিকানা দিয়ে খুঁজুন..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input w-full pl-9 text-xs"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 bg-surface-secondary/60 p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === "all"
                  ? "bg-surface text-primary shadow-xs"
                  : "text-text-muted hover:text-text"
              }`}
            >
              সকল ({students.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === "active"
                  ? "bg-surface text-emerald-600 dark:text-emerald-400 shadow-xs"
                  : "text-text-muted hover:text-text"
              }`}
            >
              সক্রিয় ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("suspended")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === "suspended"
                  ? "bg-surface text-rose-600 dark:text-rose-400 shadow-xs"
                  : "text-text-muted hover:text-text"
              }`}
            >
              স্থগিত ({suspendedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center text-xs text-text-muted">
          <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-primary" />
          শিক্ষার্থীদের সকল তথ্য লোড করা হচ্ছে...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30 text-text-muted" />
          <h3 className="text-base font-bold text-text mb-1">
            কোনো শিক্ষার্থী পাওয়া যায়নি
          </h3>
          <p className="text-xs text-text-muted">
            {students.length === 0
              ? "এখনো কোনো শিক্ষার্থী অ্যাকাউন্ট নিবন্ধন করেনি।"
              : "অনুসন্ধানের সাথে কোনো শিক্ষার্থীর তথ্য মেলেনি।"}
          </p>
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-secondary/70 border-b border-border text-text-muted uppercase tracking-wider text-[10.5px]">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">শিক্ষার্থী ও ইমেইল</th>
                  <th className="py-3.5 px-4 font-semibold">মোবাইল নম্বর</th>
                  <th className="py-3.5 px-4 font-semibold">পূর্ণাঙ্গ ঠিকানা (Address)</th>
                  <th className="py-3.5 px-4 font-semibold text-center">কোর্স / অর্ডার</th>
                  <th className="py-3.5 px-4 font-semibold">নিবন্ধন তারিখ</th>
                  <th className="py-3.5 px-4 font-semibold">স্ট্যাটাস</th>
                  <th className="py-3.5 px-4 font-semibold text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((std) => (
                  <tr
                    key={std.id}
                    className="hover:bg-surface-secondary/40 transition-colors group cursor-pointer"
                    onClick={() => setSelectedStudent(std)}
                  >
                    {/* Student & Email */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-sm shrink-0">
                          {std.full_name ? std.full_name.charAt(0).toUpperCase() : "S"}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-text text-sm hover:text-primary transition-colors truncate">
                            {std.full_name || "অজ্ঞাত শিক্ষার্থী"}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-text-muted font-sans truncate">
                            <span>{std.email || "ইমেইল নেই"}</span>
                            {std.email_verified && (
                              <span title="Verified" className="text-emerald-500 shrink-0">✓</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Phone Number */}
                    <td className="py-3.5 px-4 font-sans text-text font-medium whitespace-nowrap">
                      {std.phone ? (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-text-muted" />
                          <span>{std.phone}</span>
                        </span>
                      ) : (
                        <span className="text-text-muted text-[11px]">তথ্য নেই</span>
                      )}
                    </td>

                    {/* Address */}
                    <td className="py-3.5 px-4">
                      {std.address ? (
                        <div className="flex items-start gap-1.5 max-w-[240px]">
                          <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span className="text-text font-medium text-[11.5px] line-clamp-2 leading-tight">
                            {std.address}
                          </span>
                        </div>
                      ) : (
                        <span className="text-text-muted/60 text-[11px] italic">ঠিকানা দেওয়া হয়নি</span>
                      )}
                    </td>

                    {/* Enrolled & Orders Badges */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <span
                          title="এনরোল করা কোর্স"
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                        >
                          {std.enrollments_count || 0} কোর্স
                        </span>
                        <span
                          title="মোট অর্ডার"
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                        >
                          {std.orders_count || 0} অর্ডার
                        </span>
                      </div>
                    </td>

                    {/* Registration Date */}
                    <td className="py-3.5 px-4 text-text-muted font-sans text-[11px] whitespace-nowrap">
                      {std.created_at ? new Date(std.created_at).toLocaleDateString("bn-BD") : "—"}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          std.is_active
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {std.is_active ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>সক্রিয়</span>
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-3 h-3" />
                            <span>স্থগিত</span>
                          </>
                        )}
                      </span>
                    </td>

                    {/* Actions */}
                    <td
                      className="py-3.5 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedStudent(std)}
                          className="btn btn-outline btn-sm text-[11px] font-bold flex items-center gap-1 cursor-pointer hover:border-primary hover:text-primary"
                          title="সম্পূর্ণ বিস্তারিত বিবরণ দেখুন"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>বিস্তারিত</span>
                        </button>

                        <button
                          type="button"
                          disabled={actionLoading === std.id}
                          onClick={() => toggleStatus(std.id, std.is_active, std.full_name)}
                          className={`btn btn-sm text-[11px] font-bold cursor-pointer transition-all ${
                            std.is_active
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/20"
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                          }`}
                        >
                          {std.is_active ? "স্থগিত" : "সক্রিয়"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STUDENT FULL DETAILS MODAL                                    */}
      {/* ============================================================ */}
      {selectedStudent && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedStudent(null)}
        >
          <div
            className="bg-surface rounded-2xl border border-border shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 pb-4 border-b border-border bg-surface-secondary/40 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-xl shadow-md shadow-primary/20 shrink-0">
                  {selectedStudent.full_name ? selectedStudent.full_name.charAt(0).toUpperCase() : "S"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-extrabold text-text">
                      {selectedStudent.full_name || "অজ্ঞাত শিক্ষার্থী"}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        selectedStudent.is_active
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {selectedStudent.is_active ? "সক্রিয় অ্যাকাউন্ট" : "স্থগিত অ্যাকাউন্ট"}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5 flex items-center gap-2">
                    <span>রোল: {selectedStudent.role || "student"}</span>
                    <span>•</span>
                    <span className="font-mono text-[11px]">ID: {selectedStudent.id.slice(0, 12)}...</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="w-8 h-8 rounded-full border border-border bg-surface hover:bg-surface-secondary text-text-muted hover:text-text flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
              {/* Card 1: Personal & Contact Information */}
              <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-border text-primary font-bold text-xs uppercase tracking-wider">
                  <Users className="w-3.5 h-3.5" />
                  <span>ব্যক্তিগত ও যোগাযোগ তথ্য</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  {/* Full Name */}
                  <div className="p-2.5 rounded-lg bg-surface-secondary/50">
                    <span className="text-text-muted block text-[11px] mb-0.5">পূর্ণ নাম:</span>
                    <span className="font-bold text-text text-sm">
                      {selectedStudent.full_name || "তথ্য নেই"}
                    </span>
                  </div>

                  {/* Phone Number */}
                  <div className="p-2.5 rounded-lg bg-surface-secondary/50 flex items-center justify-between">
                    <div>
                      <span className="text-text-muted block text-[11px] mb-0.5">মোবাইল নম্বর:</span>
                      <span className="font-bold text-text font-sans text-sm">
                        {selectedStudent.phone || "তথ্য নেই"}
                      </span>
                    </div>
                    {selectedStudent.phone && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedStudent.phone!, "phone")}
                        className="p-1.5 rounded-md hover:bg-surface text-text-muted hover:text-primary transition-colors cursor-pointer"
                        title="নম্বর কপি করুন"
                      >
                        {copiedField === "phone" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Email Address */}
                  <div className="sm:col-span-2 p-2.5 rounded-lg bg-surface-secondary/50 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-text-muted text-[11px] mb-0.5">
                        <span>ইমেইল ঠিকানা:</span>
                        {selectedStudent.email_verified && (
                          <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                            <ShieldCheck className="w-3 h-3 text-emerald-500" />
                            Verified
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-text font-sans text-xs sm:text-sm">
                        {selectedStudent.email || "ইমেইল প্রদান করা হয়নি"}
                      </span>
                    </div>
                    {selectedStudent.email && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedStudent.email!, "email")}
                        className="p-1.5 rounded-md hover:bg-surface text-text-muted hover:text-primary transition-colors cursor-pointer"
                        title="ইমেইল কপি করুন"
                      >
                        {copiedField === "email" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Full Address (Prominently Highlighted) */}
                  <div className="sm:col-span-2 p-3.5 rounded-xl border border-primary/25 bg-primary/5">
                    <div className="flex items-center gap-1.5 text-primary font-bold text-xs mb-1">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>পূর্ণাঙ্গ ঠিকানা (Address):</span>
                    </div>
                    <p className="text-text font-bold text-sm leading-relaxed">
                      {selectedStudent.address ? (
                        selectedStudent.address
                      ) : (
                        <span className="text-text-muted font-normal italic">
                          শিক্ষার্থী নিবন্ধনের সময় বা প্রোফাইলে এখনও কোনো ঠিকানা যুক্ত করেননি।
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Academic Level */}
                  <div className="sm:col-span-2 p-2.5 rounded-lg bg-surface-secondary/50">
                    <span className="text-text-muted block text-[11px] mb-0.5">শিক্ষা বিভাগ / কোর্স লক্ষ্য:</span>
                    <span className="font-bold text-text">
                      {selectedStudent.academic_level || "সাধারণ শিক্ষা"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Account Security & Timestamps */}
              <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-border text-primary font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>অ্যাকাউন্ট ও নিরাপত্তা তথ্য</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-2.5 rounded-lg bg-surface-secondary/50">
                    <span className="text-text-muted block text-[11px] mb-0.5">নিবন্ধন তারিখ:</span>
                    <span className="font-bold text-text font-sans">
                      {selectedStudent.created_at
                        ? new Date(selectedStudent.created_at).toLocaleString("bn-BD")
                        : "—"}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-surface-secondary/50">
                    <span className="text-text-muted block text-[11px] mb-0.5">সর্বশেষ লগইন:</span>
                    <span className="font-bold text-text font-sans">
                      {selectedStudent.last_sign_in_at
                        ? new Date(selectedStudent.last_sign_in_at).toLocaleString("bn-BD")
                        : "লগইন রেকর্ড নেই"}
                    </span>
                  </div>

                  <div className="sm:col-span-2 p-2.5 rounded-lg bg-surface-secondary/50 flex items-center justify-between">
                    <div>
                      <span className="text-text-muted block text-[11px] mb-0.5">অ্যাকাউন্ট আইডি (UID):</span>
                      <span className="font-mono text-text text-[11px] select-all">
                        {selectedStudent.id}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selectedStudent.id, "uid")}
                      className="p-1.5 rounded-md hover:bg-surface text-text-muted hover:text-primary transition-colors cursor-pointer"
                      title="আইডি কপি করুন"
                    >
                      {copiedField === "uid" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 3: Enrolled Courses */}
              <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>এনরোল করা কোর্সসমূহ</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                    মোট {selectedStudent.enrollments?.length || 0} টি
                  </span>
                </div>

                {selectedStudent.enrollments && selectedStudent.enrollments.length > 0 ? (
                  <div className="space-y-2 pt-1">
                    {selectedStudent.enrollments.map((enr, idx) => (
                      <div
                        key={enr.id || idx}
                        className="p-2.5 rounded-lg bg-surface-secondary/50 flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="font-bold text-text">
                            {enr.courses?.title_bn || enr.courses?.title || `Course #${enr.course_id}`}
                          </div>
                          <div className="text-[11px] text-text-muted">
                            এনরোল তারিখ:{" "}
                            {enr.enrolled_at ? new Date(enr.enrolled_at).toLocaleDateString("bn-BD") : "—"}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                          {enr.is_active !== false ? "অ্যাক্টিভ" : "মেয়াদোত্তীর্ণ"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-muted text-[11px] py-2 italic">
                    শিক্ষার্থী এখনও কোনো কোর্সে এনরোল করেননি।
                  </p>
                )}
              </div>

              {/* Card 4: Orders History */}
              <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                    <Receipt className="w-3.5 h-3.5" />
                    <span>অর্ডার ও পেমেন্ট হিস্টোরি</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    মোট {selectedStudent.orders?.length || 0} টি
                  </span>
                </div>

                {selectedStudent.orders && selectedStudent.orders.length > 0 ? (
                  <div className="space-y-2 pt-1">
                    {selectedStudent.orders.map((ord, idx) => (
                      <div
                        key={ord.id || idx}
                        className="p-2.5 rounded-lg bg-surface-secondary/50 flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="font-bold text-text flex items-center gap-1.5">
                            <span>#{ord.order_number}</span>
                            <span className="text-text-muted font-normal text-[11px]">
                              ({ord.courses?.title_bn || ord.courses?.title || "কোর্স"})
                            </span>
                          </div>
                          <div className="text-[11px] text-text-muted font-sans">
                            {new Date(ord.created_at).toLocaleDateString("bn-BD")} • {ord.payment_method || "bKash"}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-bold text-text font-sans">
                            ৳{ord.final_amount || 0}
                          </div>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase ${
                              ord.status === "paid" || ord.status === "completed"
                                ? "bg-emerald-500/10 text-emerald-600"
                                : ord.status === "pending"
                                ? "bg-amber-500/10 text-amber-600"
                                : "bg-rose-500/10 text-rose-600"
                            }`}
                          >
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-muted text-[11px] py-2 italic">
                    কোনো অর্ডার বা পেমেন্ট রেকর্ড পাওয়া যায়নি।
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-border bg-surface-secondary/40 flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={actionLoading === selectedStudent.id}
                onClick={() => toggleStatus(selectedStudent.id, selectedStudent.is_active, selectedStudent.full_name)}
                className={`btn btn-sm font-bold text-xs cursor-pointer ${
                  selectedStudent.is_active
                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/20"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                }`}
              >
                {selectedStudent.is_active ? "অ্যাকাউন্ট স্থগিত করুন" : "অ্যাকাউন্ট পুনরায় সক্রিয় করুন"}
              </button>

              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="btn btn-outline btn-sm text-xs cursor-pointer"
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
