"use client";

import { useEffect, useState } from "react";
import {
  Headphones,
  Search,
  Filter,
  RefreshCw,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Phone,
  Mail,
  Receipt,
  Send,
  X,
  ChevronRight,
  ShieldCheck,
  Tag,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";

interface TicketReply {
  id: string;
  sender: "student" | "admin";
  sender_name: string;
  message: string;
  created_at: string;
}

interface SupportTicket {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
  category: "payment" | "course_access" | "player" | "account" | "other";
  subject: string;
  message: string;
  order_number?: string;
  course_title?: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "normal" | "high" | "urgent";
  created_at: string;
  updated_at: string;
  replies: TicketReply[];
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Selected Ticket Drawer / Modal
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyStatus, setReplyStatus] = useState<SupportTicket["status"]>("in_progress");
  const [sendingReply, setSendingReply] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deletingTicketId, setDeletingTicketId] = useState<string | null>(null);

  // Load all tickets
  const loadTickets = async () => {
    setLoading(true);
    try {
      let url = "/api/support/tickets";
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      if (searchQuery.trim()) params.set("q", searchQuery.trim());

      const qs = params.toString();
      if (qs) url += `?${qs}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data?.success && Array.isArray(data.data)) {
          setTickets(data.data);
          if (selectedTicket) {
            const updated = data.data.find((t: SupportTicket) => t.id === selectedTicket.id);
            if (updated) setSelectedTicket(updated);
          }
        }
      }
    } catch (err) {
      console.error("Error loading admin tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [statusFilter, categoryFilter]);

  // Handle Search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadTickets();
  };

  // Quick Status Update
  const handleUpdateStatus = async (ticketId: string, newStatus: SupportTicket["status"]) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch("/api/support/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, status: newStatus }),
      });
      const data = await res.json();
      if (data?.success) {
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
        );
        if (selectedTicket && selectedTicket.id === ticketId) {
          setSelectedTicket((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      } else {
        alert(data?.error || "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।");
      }
    } catch (e) {
      console.error("Update status error:", e);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Quick Priority Update
  const handleUpdatePriority = async (ticketId: string, newPriority: SupportTicket["priority"]) => {
    try {
      const res = await fetch("/api/support/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, priority: newPriority }),
      });
      const data = await res.json();
      if (data?.success) {
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? { ...t, priority: newPriority } : t))
        );
        if (selectedTicket && selectedTicket.id === ticketId) {
          setSelectedTicket((prev) => (prev ? { ...prev, priority: newPriority } : null));
        }
      }
    } catch (e) {
      console.error("Update priority error:", e);
    }
  };

  // Send Admin Reply
  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    setSendingReply(true);
    try {
      const payload = {
        ticketId: selectedTicket.id,
        senderName: "Ormission সাপোর্ট টিম (অ্যাডমিন)",
        message: replyText.trim(),
        status: replyStatus,
      };

      const res = await fetch("/api/support/tickets/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data?.success) {
        setReplyText("");
        setSelectedTicket(data.ticket);
        setTickets((prev) =>
          prev.map((t) => (t.id === data.ticket.id ? data.ticket : t))
        );
      } else {
        alert(data?.error || "রিপ্লাই পাঠাতে ব্যর্থ হয়েছে।");
      }
    } catch (err) {
      console.error("Admin reply error:", err);
      alert("নেটওয়ার্ক ত্রুটি, অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setSendingReply(false);
    }
  };

  // Delete Ticket completely from database
  const handleDeleteTicket = async (ticketId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const confirmed = window.confirm(
      `আপনি কি নিশ্চিতভাবে টিকিট #${ticketId} ডাটাবেজ থেকে সম্পূর্ণ মুছে ফেলতে চান?\n\nসতর্কতা: এটি পার্মানেন্টলি ডিলিট হবে এবং আর রিকভার করা যাবে না।`
    );
    if (!confirmed) return;

    setDeletingTicketId(ticketId);
    try {
      const res = await fetch(`/api/support/tickets?ticketId=${ticketId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data?.success) {
        setTickets((prev) => prev.filter((t) => t.id !== ticketId));
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket(null);
        }
      } else {
        alert(data?.error || "টিকিট ডিলিট করতে সমস্যা হয়েছে।");
      }
    } catch (err) {
      console.error("Delete ticket error:", err);
      alert("নেটওয়ার্ক ত্রুটি, অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setDeletingTicketId(null);
    }
  };

  // Helper labels & badges
  const getStatusBadge = (status: SupportTicket["status"]) => {
    switch (status) {
      case "open":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>নতুন / অপেক্ষমান (Open)</span>
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span>প্রক্রিয়াধীন (In Progress)</span>
          </span>
        );
      case "resolved":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>সমাধানকৃত (Resolved)</span>
          </span>
        );
      case "closed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-500 border border-slate-500/20">
            <span>বন্ধ (Closed)</span>
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: SupportTicket["priority"]) => {
    switch (priority) {
      case "urgent":
        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-600 text-white">জরুরি</span>;
      case "high":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">উচ্চ</span>;
      case "normal":
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-500/10 text-text-muted border border-border">সাধারণ</span>;
      case "low":
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-500/10 text-slate-400">নিম্ন</span>;
    }
  };

  const getCategoryLabel = (category: SupportTicket["category"]) => {
    switch (category) {
      case "payment":
        return "পেমেন্ট ও অর্ডার";
      case "course_access":
        return "কোর্স অ্যাক্সেস";
      case "player":
        return "ভিডিও প্লেয়ার";
      case "account":
        return "অ্যাকাউন্ট";
      default:
        return "অন্যান্য";
    }
  };

  // Metrics
  const totalCount = tickets.length;
  const openCount = tickets.filter((t) => t.status === "open").length;
  const inProgressCount = tickets.filter((t) => t.status === "in_progress").length;
  const resolvedCount = tickets.filter((t) => t.status === "resolved").length;

  return (
    <div className="space-y-6 font-bengali p-2 lg:p-4 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary px-2.5 py-0.5 rounded-full bg-primary/10 mb-1">
            <Headphones className="w-3.5 h-3.5" />
            <span>অ্যাডমিন হেল্পডেস্ক ও সাপোর্ট প্যানেল</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-text">
            সাপোর্ট টিকিট ও শিক্ষার্থী সহায়তা
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            শিক্ষার্থীদের জমাকৃত সমস্যা, পেমেন্ট পুনর্যাচাই এবং অভিযোগসমূহ পরিচালনা করুন
          </p>
        </div>

        <button
          type="button"
          onClick={loadTickets}
          className="btn btn-outline btn-sm text-xs flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
          <span>রিফ্রেশ</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface rounded-2xl border border-border p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-text-muted">মোট টিকিট</span>
            <MessageSquare className="w-4 h-4 text-primary" />
          </div>
          <span className="text-3xl font-black text-text font-sans">{totalCount}</span>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">নতুন / খোলা</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-3xl font-black text-amber-600 dark:text-amber-400 font-sans">
            {openCount}
          </span>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">প্রক্রিয়াধীন</span>
            <AlertCircle className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-3xl font-black text-blue-600 dark:text-blue-400 font-sans">
            {inProgressCount}
          </span>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">সমাধানকৃত</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-sans">
            {resolvedCount}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface rounded-2xl border border-border p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-surface-secondary/80 rounded-xl text-xs font-semibold border border-border/60">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === "all" ? "bg-surface text-primary shadow-xs font-bold" : "text-text-muted hover:text-text"
            }`}
          >
            সকল ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("open")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === "open" ? "bg-surface text-amber-600 shadow-xs font-bold" : "text-text-muted hover:text-text"
            }`}
          >
            খোলা ({openCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("in_progress")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === "in_progress" ? "bg-surface text-blue-600 shadow-xs font-bold" : "text-text-muted hover:text-text"
            }`}
          >
            চলমান ({inProgressCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("resolved")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === "resolved" ? "bg-surface text-emerald-600 shadow-xs font-bold" : "text-text-muted hover:text-text"
            }`}
          >
            সমাধানকৃত ({resolvedCount})
          </button>
        </div>

        {/* Category & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface-secondary border border-border text-xs text-text focus:outline-hidden focus:border-primary"
          >
            <option value="all">সকল ক্যাটাগরি</option>
            <option value="payment">পেমেন্ট ও অর্ডার</option>
            <option value="course_access">কোর্স অ্যাক্সেস</option>
            <option value="player">ভিডিও প্লেয়ার</option>
            <option value="account">অ্যাকাউন্ট</option>
            <option value="other">অন্যান্য</option>
          </select>

          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="শিক্ষার্থী, TrxID বা টিকিট আইডি..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-surface-secondary border border-border text-xs text-text focus:outline-hidden focus:border-primary"
            />
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
          </form>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-16 text-center text-xs text-text-muted">
            <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-primary" />
            টিকিট তালিকা লোড হচ্ছে...
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-16 text-center">
            <Headphones className="w-12 h-12 mx-auto mb-3 opacity-30 text-text-muted" />
            <h3 className="text-base font-bold text-text mb-1">কোনো টিকিট পাওয়া যায়নি</h3>
            <p className="text-xs text-text-muted max-w-sm mx-auto">
              ফিল্টারে কোনো ফলাফল নেই অথবা এখনো কোনো সাপোর্ট টিকিট আসেনি।
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-surface-secondary/50 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                  <th className="p-4">টিকিট আইডি</th>
                  <th className="p-4">শিক্ষার্থীর বিবরণ</th>
                  <th className="p-4">বিষয় ও ক্যাটাগরি</th>
                  <th className="p-4">সম্পর্কিত অর্ডার</th>
                  <th className="p-4">গুরুত্ব</th>
                  <th className="p-4">স্ট্যাটাস</th>
                  <th className="p-4">সর্বশেষ বার্তা</th>
                  <th className="p-4 text-right">পদক্ষেপ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tickets.map((ticket) => {
                  const repliesCount = ticket.replies?.length || 1;
                  const lastReply = ticket.replies?.[ticket.replies.length - 1];
                  const isLastAdmin = lastReply?.sender === "admin";
                  const updateDate = new Date(ticket.updated_at).toLocaleDateString("bn-BD", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr
                      key={ticket.id}
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setReplyStatus(ticket.status === "open" ? "in_progress" : ticket.status);
                      }}
                      className="hover:bg-surface-secondary/40 transition-colors cursor-pointer group"
                    >
                      {/* Ticket ID */}
                      <td className="p-4 font-bold font-mono text-primary whitespace-nowrap">
                        {ticket.id}
                      </td>

                      {/* Student Info */}
                      <td className="p-4">
                        <div className="font-bold text-text">{ticket.user_name}</div>
                        <div className="text-[11px] text-text-muted flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" />
                          <span>{ticket.user_email}</span>
                        </div>
                        {ticket.user_phone && (
                          <div className="text-[11px] text-text-muted flex items-center gap-1 font-mono">
                            <Phone className="w-3 h-3" />
                            <span>{ticket.user_phone}</span>
                          </div>
                        )}
                      </td>

                      {/* Subject & Category */}
                      <td className="p-4 max-w-[220px]">
                        <div className="font-bold text-text group-hover:text-primary transition-colors line-clamp-1">
                          {ticket.subject}
                        </div>
                        <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary mt-1">
                          {getCategoryLabel(ticket.category)}
                        </span>
                      </td>

                      {/* Order Info */}
                      <td className="p-4 whitespace-nowrap">
                        {ticket.order_number ? (
                          <div>
                            <span className="font-mono font-bold text-text flex items-center gap-1">
                              <Receipt className="w-3 h-3 text-primary" />
                              #{ticket.order_number}
                            </span>
                            {ticket.course_title && (
                              <span className="text-[11px] text-text-muted block max-w-[140px] truncate">
                                {ticket.course_title}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-text-muted">—</span>
                        )}
                      </td>

                      {/* Priority */}
                      <td className="p-4 whitespace-nowrap">
                        {getPriorityBadge(ticket.priority)}
                      </td>

                      {/* Status */}
                      <td className="p-4 whitespace-nowrap">
                        {getStatusBadge(ticket.status)}
                      </td>

                      {/* Last Update */}
                      <td className="p-4 whitespace-nowrap">
                        <span className="text-[11px] text-text-muted block font-sans">{updateDate}</span>
                        <span
                          className={`text-[11px] font-semibold ${
                            isLastAdmin ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {isLastAdmin ? "✓ অ্যাডমিন উত্তর দিয়েছে" : "⏳ শিক্ষার্থীর বার্তা"} ({repliesCount})
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTicket(ticket);
                              setReplyStatus(ticket.status === "open" ? "in_progress" : ticket.status);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors shadow-xs"
                          >
                            উত্তর দিন
                          </button>
                          <button
                            type="button"
                            disabled={deletingTicketId === ticket.id}
                            onClick={(e) => handleDeleteTicket(ticket.id, e)}
                            className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-500/15 transition-colors border border-rose-500/20 disabled:opacity-50 cursor-pointer"
                            title="ডাটাবেজ থেকে স্থায়ীভাবে ডিলিট করুন"
                          >
                            {deletingTicketId === ticket.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin text-rose-500" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ticket Detail & Reply Drawer Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-border bg-surface-secondary/40 flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-black text-sm text-primary px-2.5 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                    {selectedTicket.id}
                  </span>
                  {getStatusBadge(selectedTicket.status)}
                  {getPriorityBadge(selectedTicket.priority)}
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface border border-border text-text">
                    {getCategoryLabel(selectedTicket.category)}
                  </span>
                </div>

                <h3 className="font-black text-lg text-text leading-snug">
                  {selectedTicket.subject}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={deletingTicketId === selectedTicket.id}
                  onClick={() => handleDeleteTicket(selectedTicket.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                  title="ডাটাবেজ থেকে সম্পূর্ণ মুছে ফেলুন"
                >
                  {deletingTicketId === selectedTicket.id ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>ডিলিট</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="p-1.5 rounded-lg hover:bg-surface text-text-muted hover:text-text transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Student & Linked Order Metadata Panel */}
            <div className="p-4 bg-surface-secondary/25 border-b border-border grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-text-muted block">শিক্ষার্থী</span>
                  <span className="font-bold text-text truncate block">{selectedTicket.user_name}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-text-muted block">ইমেইল ও ফোন</span>
                  <span className="font-semibold text-text truncate block font-sans">
                    {selectedTicket.user_email} {selectedTicket.user_phone ? `• ${selectedTicket.user_phone}` : ""}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-text-muted block">সম্পর্কিত অর্ডার / কোর্স</span>
                  <span className="font-bold text-text truncate block">
                    {selectedTicket.order_number ? `#${selectedTicket.order_number}` : "কোনো অর্ডার নেই"}
                    {selectedTicket.course_title ? ` (${selectedTicket.course_title})` : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Status Control Bar */}
            <div className="px-5 py-2.5 bg-surface border-b border-border flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-text">স্ট্যাটাস পরিবর্তন:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={updatingStatus}
                    onClick={() => handleUpdateStatus(selectedTicket.id, "open")}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                      selectedTicket.status === "open"
                        ? "bg-amber-500 text-white shadow-xs"
                        : "bg-surface-secondary text-text-muted hover:text-text border border-border"
                    }`}
                  >
                    খোলা (Open)
                  </button>
                  <button
                    type="button"
                    disabled={updatingStatus}
                    onClick={() => handleUpdateStatus(selectedTicket.id, "in_progress")}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                      selectedTicket.status === "in_progress"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-surface-secondary text-text-muted hover:text-text border border-border"
                    }`}
                  >
                    চলমান (In Progress)
                  </button>
                  <button
                    type="button"
                    disabled={updatingStatus}
                    onClick={() => handleUpdateStatus(selectedTicket.id, "resolved")}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                      selectedTicket.status === "resolved"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-surface-secondary text-text-muted hover:text-text border border-border"
                    }`}
                  >
                    সমাধানকৃত (Resolved)
                  </button>
                  <button
                    type="button"
                    disabled={updatingStatus}
                    onClick={() => handleUpdateStatus(selectedTicket.id, "closed")}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                      selectedTicket.status === "closed"
                        ? "bg-slate-600 text-white shadow-xs"
                        : "bg-surface-secondary text-text-muted hover:text-text border border-border"
                    }`}
                  >
                    বন্ধ (Closed)
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-text">গুরুত্ব:</span>
                <select
                  value={selectedTicket.priority}
                  onChange={(e) => handleUpdatePriority(selectedTicket.id, e.target.value as any)}
                  className="px-2.5 py-1 rounded-lg bg-surface-secondary border border-border text-xs text-text font-bold"
                >
                  <option value="low">নিম্ন (Low)</option>
                  <option value="normal">সাধারণ (Normal)</option>
                  <option value="high">উচ্চ (High)</option>
                  <option value="urgent">জরুরি (Urgent)</option>
                </select>
              </div>
            </div>

            {/* Conversation Messages */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4 max-h-[42vh] bg-surface-secondary/15">
              {(selectedTicket.replies || []).map((reply, idx) => {
                const isAdmin = reply.sender === "admin";
                return (
                  <div
                    key={reply.id || idx}
                    className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-text-muted">
                      {isAdmin ? (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                          <span className="font-bold text-primary">{reply.sender_name}</span>
                        </>
                      ) : (
                        <>
                          <User className="w-3.5 h-3.5 text-text-muted" />
                          <span className="font-semibold text-text">{reply.sender_name} (শিক্ষার্থী)</span>
                        </>
                      )}
                      <span>•</span>
                      <span className="font-sans">
                        {new Date(reply.created_at).toLocaleTimeString("bn-BD", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed whitespace-pre-wrap ${
                        isAdmin
                          ? "bg-primary text-white shadow-xs"
                          : "bg-surface border border-border text-text shadow-xs"
                      }`}
                    >
                      {reply.message}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Admin Reply Composer Form */}
            <form onSubmit={handleSendAdminReply} className="p-4 border-t border-border bg-surface space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-text">অ্যাডমিন উত্তর রচনা করুন:</span>
                <div className="flex items-center gap-2">
                  <span className="text-text-muted">রিপ্লাইয়ের পর স্ট্যাটাস:</span>
                  <select
                    value={replyStatus}
                    onChange={(e) => setReplyStatus(e.target.value as any)}
                    className="px-2 py-1 rounded bg-surface-secondary border border-border text-[11px] font-bold text-text"
                  >
                    <option value="in_progress">চলমান রাখুন (In Progress)</option>
                    <option value="resolved">সমাধানকৃত হিসেবে চিহ্নিত করুন (Resolved)</option>
                    <option value="closed">বন্ধ করুন (Closed)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <textarea
                  rows={2}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="শিক্ষার্থীকে সহায়তামূলক বার্তা লিখুন (যেমন: আপনার TrxID টি ভেরিফাই করা হয়েছে, ক্লাসরুম চালু হয়েছে)..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-text text-xs focus:outline-hidden focus:border-primary transition-colors resize-none"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim() || sendingReply}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs shrink-0 self-stretch disabled:opacity-50"
                >
                  {sendingReply ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>উত্তর পাঠান</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
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
