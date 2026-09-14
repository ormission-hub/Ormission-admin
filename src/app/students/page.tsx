"use client";

import { useEffect, useState } from "react";
import { Search, Users, ShieldAlert, CheckCircle2, RefreshCw, UserCheck, UserX } from "lucide-react";
import { dbService, type DbStudent } from "@/lib/supabase/db-service";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<DbStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const loadStudents = async () => {
    setLoading(true);
    const data = await dbService.getStudents();
    setStudents(data);
    setLoading(false);
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const toggleStatus = async (id: string, currentStatus: boolean, name: string) => {
    const actionText = currentStatus ? "স্থগিত (Suspend)" : "পুনরায় সক্রিয় (Reactivate)";
    if (confirm(`আপনি কি '${name}'-এর অ্যাকাউন্ট ${actionText} করতে চান?`)) {
      const ok = await dbService.toggleStudentStatus(id, currentStatus);
      if (ok) {
        setStudents((prev) =>
          prev.map((s) => (s.id === id ? { ...s, is_active: !s.is_active } : s))
        );
      } else {
        alert("স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।");
      }
    }
  };

  const filtered = students.filter(
    (s) =>
      (s.full_name && s.full_name.toLowerCase().includes(query.toLowerCase())) ||
      (s.phone && s.phone.includes(query))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-text font-bengali">
              শিক্ষার্থী ব্যবস্থাপনা ({students.length})
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
              Supabase Profiles
            </span>
          </div>
          <p className="text-xs text-text-muted font-bengali mt-0.5">
            নিবন্ধিত সকল শিক্ষার্থীর তথ্য, সক্রিয় অবস্থা ও অ্যাকাউন্ট নিরাপত্তা পরিচালনা
          </p>
        </div>

        <button
          type="button"
          onClick={loadStudents}
          disabled={loading}
          className="btn btn-outline btn-sm font-bengali text-xs flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
          <span>রিফ্রেশ</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-surface rounded-xl border border-border p-4 shadow-xs">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="শিক্ষার্থীর নাম বা ফোন নম্বর দিয়ে খুঁজুন..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input w-full pl-9 text-xs font-bengali"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center text-xs text-text-muted font-bengali">
          <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-primary" />
          শিক্ষার্থী তালিকা লোড হচ্ছে...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30 text-text-muted" />
          <h3 className="text-base font-bold text-text font-bengali mb-1">
            কোনো শিক্ষার্থী পাওয়া যায়নি
          </h3>
          <p className="text-xs text-text-muted font-bengali">
            {students.length === 0
              ? "এখনো কোনো শিক্ষার্থী অ্যাকাউন্ট রেজিস্ট্রেশন করেনি।"
              : "অনুসন্ধানের সাথে কোনো শিক্ষার্থীর তথ্য মেলেনি।"}
          </p>
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-bengali">
              <thead className="bg-surface-secondary/60 border-b border-border text-text-muted uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">শিক্ষার্থী</th>
                  <th className="py-3 px-4 font-semibold">ফোন নম্বর</th>
                  <th className="py-3 px-4 font-semibold">রোল / ধরন</th>
                  <th className="py-3 px-4 font-semibold">রেজিস্ট্রেশন তারিখ</th>
                  <th className="py-3 px-4 font-semibold">স্ট্যাটাস</th>
                  <th className="py-3 px-4 font-semibold text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((std) => (
                  <tr key={std.id} className="hover:bg-surface-secondary/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          {std.full_name ? std.full_name.charAt(0) : "S"}
                        </div>
                        <div>
                          <div className="font-bold text-text text-sm">
                            {std.full_name || "অজ্ঞাত শিক্ষার্থী"}
                          </div>
                          <div className="text-[10px] text-text-muted font-mono font-sans">
                            ID: {std.id.slice(0, 8)}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-sans text-text-muted font-medium">
                      {std.phone || "তথ্য নেই"}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-secondary border border-border text-text uppercase">
                        {std.role || "student"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-text-muted font-sans text-[11px]">
                      {std.created_at ? new Date(std.created_at).toLocaleDateString("bn-BD") : "—"}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          std.is_active
                            ? "bg-success/10 text-success border border-success/20"
                            : "bg-error/10 text-error border border-error/20"
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

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => toggleStatus(std.id, std.is_active, std.full_name)}
                        className={`btn btn-sm text-[11px] font-bengali font-bold ${
                          std.is_active
                            ? "bg-error/10 text-error hover:bg-error/20"
                            : "bg-success/10 text-success hover:bg-success/20"
                        }`}
                      >
                        {std.is_active ? "স্থগিত করুন" : "সক্রিয় করুন"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
