"use client";

import { useEffect, useState } from "react";
import { Search, Download, CheckCircle2, RefreshCw, Filter, Receipt, ArrowUpDown } from "lucide-react";
import { dbService, type DbOrder } from "@/lib/supabase/db-service";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");

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
    const ok = await dbService.updateOrderStatus(id, newStatus);
    if (ok) {
      setOrders((prev) =>
        prev.map((ord) => (ord.id === id ? { ...ord, status: newStatus } : ord))
      );
    } else {
      alert("অর্ডারের স্ট্যাটাস পরিবর্তন করা যায়নি।");
    }
  };

  const handleExportCSV = () => {
    if (orders.length === 0) {
      alert("এক্সপোর্ট করার মতো কোনো অর্ডার নেই।");
      return;
    }
    const headers = ["Order Number", "Student Name", "Phone", "Course", "Paid Amount", "Method", "Status", "Date"];
    const rows = orders.map((o) => [
      o.order_number || o.id,
      o.profiles?.full_name || "N/A",
      o.profiles?.phone || "N/A",
      o.courses?.title_bn || o.courses?.title || "Course",
      o.paid_amount,
      o.payment_method || "bKash",
      o.status,
      o.created_at,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ormission_orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = orders.filter((ord) => {
    const q = query.toLowerCase();
    const matchesSearch =
      !q ||
      (ord.order_number && ord.order_number.toLowerCase().includes(q)) ||
      (ord.profiles?.full_name && ord.profiles.full_name.toLowerCase().includes(q)) ||
      (ord.profiles?.phone && ord.profiles.phone.includes(q));

    const matchesMethod =
      methodFilter === "all" ||
      (ord.payment_method && ord.payment_method.toLowerCase() === methodFilter.toLowerCase());

    return matchesSearch && matchesMethod;
  });

  const totalAmount = filtered.reduce((sum, ord) => sum + (Number(ord.paid_amount) || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-text font-bengali">
              অর্ডার ও লেনদেন অডিট ({orders.length})
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
              Supabase Orders
            </span>
          </div>
          <p className="text-xs text-text-muted font-bengali mt-0.5">
            সকল অনলাইন পেমেন্ট ট্রানজ্যাকশন, রসিদ এবং পেমেন্ট মেথড বিবরণী
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

      {/* Filter and Revenue Summary Bar */}
      <div className="bg-surface rounded-xl border border-border p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="অর্ডার আইডি বা নাম..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input w-full pl-9 text-xs font-bengali"
            />
          </div>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="input text-xs font-bengali py-1.5"
          >
            <option value="all">সকল পেমেন্ট মেথড</option>
            <option value="bKash">bKash</option>
            <option value="Nagad">Nagad</option>
            <option value="Rocket">Rocket</option>
            <option value="Card">Card</option>
          </select>
        </div>

        <div className="text-right">
          <div className="text-[11px] text-text-muted font-bengali">ফিল্টারকৃত মোট আদায়</div>
          <div className="text-base font-extrabold text-primary font-sans">
            ৳{totalAmount.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center text-xs text-text-muted font-bengali">
          <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-primary" />
          অর্ডার তালিকা লোড হচ্ছে...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center">
          <Receipt className="w-10 h-10 mx-auto mb-3 opacity-30 text-text-muted" />
          <h3 className="text-base font-bold text-text font-bengali mb-1">
            কোনো অর্ডার পাওয়া যায়নি
          </h3>
          <p className="text-xs text-text-muted font-bengali">
            {orders.length === 0
              ? "এখনো কোনো কোর্সের অর্ডার সম্পন্ন হয়নি।"
              : "অনুসন্ধানের সাথে কোনো অর্ডার মেলেনি।"}
          </p>
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-bengali">
              <thead className="bg-surface-secondary/60 border-b border-border text-text-muted uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">অর্ডার আইডি</th>
                  <th className="py-3 px-4 font-semibold">শিক্ষার্থী</th>
                  <th className="py-3 px-4 font-semibold">কোর্স</th>
                  <th className="py-3 px-4 font-semibold">পরিশোধিত অর্থ</th>
                  <th className="py-3 px-4 font-semibold">পেমেন্ট গেটওয়ে</th>
                  <th className="py-3 px-4 font-semibold">তারিখ</th>
                  <th className="py-3 px-4 font-semibold">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((ord) => (
                  <tr key={ord.id} className="hover:bg-surface-secondary/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-text">
                      {ord.order_number || ord.id.slice(0, 8)}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-text text-sm">
                        {ord.profiles?.full_name || "রেজিস্টার্ড শিক্ষার্থী"}
                      </div>
                      <div className="text-[11px] text-text-muted font-sans font-medium">
                        {ord.profiles?.phone || "ফোন নম্বর নেই"}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs truncate text-text-muted">
                      {ord.courses?.title_bn || ord.courses?.title || "অনলাইন কোর্স"}
                    </td>

                    <td className="py-3.5 px-4 font-sans font-bold text-text">
                      ৳{Number(ord.paid_amount || 0).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-secondary text-text border border-border uppercase">
                        {ord.payment_method || "bKash"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-text-muted font-sans text-[11px]">
                      {ord.created_at ? new Date(ord.created_at).toLocaleDateString("bn-BD") : "—"}
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={ord.status}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value as any)}
                        className={`text-[10px] font-bold px-2 py-1 rounded border ${
                          ord.status === "completed"
                            ? "bg-success/10 text-success border-success/20"
                            : ord.status === "refunded"
                            ? "bg-error/10 text-error border-error/20"
                            : "bg-warning/10 text-warning border-warning/20"
                        }`}
                      >
                        <option value="completed">পরিশোধিত (Completed)</option>
                        <option value="pending">অপেক্ষমান (Pending)</option>
                        <option value="refunded">রিফান্ডেড (Refunded)</option>
                      </select>
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
