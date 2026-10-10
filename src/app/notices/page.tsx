"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Send,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  ExternalLink,
  Flame,
  Calendar,
  Layers,
  Key,
  Eye,
  RefreshCw,
  Sparkles,
  Megaphone,
  Pin,
  Clock,
  Check,
} from "lucide-react";
import { dbService } from "@/lib/supabase/db-service";

export interface NoticeItem {
  id: string;
  title: string;
  titleBn?: string;
  content: string;
  contentBn?: string;
  type: "emergency" | "offer" | "exam" | "general";
  showTopBanner: boolean;
  showNoticeBoard: boolean;
  actionText?: string;
  actionUrl?: string;
  isActive: boolean;
  pinned: boolean;
  createdAt: string;
}

export interface PushRecord {
  id: string;
  title: string;
  message: string;
  targetUrl: string;
  imageUrl?: string | null;
  provider: string;
  recipients?: number | string;
  sentAt: string;
}

export default function AdminNoticesPage() {
  const [activeTab, setActiveTab] = useState<"notices" | "push" | "settings">("notices");
  const [loading, setLoading] = useState(true);

  // Notice State
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [isEditingNotice, setIsEditingNotice] = useState(false);
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);
  const [noticeForm, setNoticeForm] = useState<Omit<NoticeItem, "id" | "createdAt">>({
    title: "",
    titleBn: "",
    content: "",
    contentBn: "",
    type: "general",
    showTopBanner: true,
    showNoticeBoard: true,
    actionText: "বিস্তারিত দেখুন",
    actionUrl: "/courses",
    isActive: true,
    pinned: false,
  });

  // Push Sender State
  const [pushForm, setPushForm] = useState({
    title: "",
    message: "",
    targetUrl: "https://ormission.com/courses",
    imageUrl: "",
    alsoPostNotice: false,
    noticeType: "offer" as "emergency" | "offer" | "exam" | "general",
  });
  const [sendingPush, setSendingPush] = useState(false);
  const [pushSuccess, setPushSuccess] = useState<string | null>(null);
  const [pushError, setPushError] = useState<string | null>(null);
  const [pushHistory, setPushHistory] = useState<PushRecord[]>([]);

  // API Settings State
  const [apiSettings, setApiSettings] = useState({
    provider: "onesignal",
    oneSignalAppId: "",
    oneSignalRestApiKey: "",
    fcmServerKey: "",
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Load Initial Data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const settings = await dbService.getSiteSettings();

      // Notices
      if (Array.isArray(settings.ormission_notices)) {
        setNotices(settings.ormission_notices);
      } else {
        // Default initial demo notices
        setNotices([
          {
            id: "notice-1",
            title: "এইচএসসি ও বিশ্ববিদ্যালয় ভর্তি স্পেশাল লাইভ ব্যাচ শুরু!",
            titleBn: "এইচএসসি ও বিশ্ববিদ্যালয় ভর্তি স্পেশাল লাইভ ব্যাচ শুরু!",
            content: "সকল একাডেমিক ও ভর্তি কোর্সে সীমিত সময়ের জন্য বিশেষ ছাড় চলছে। এখনই এনরোল করুন।",
            contentBn: "সকল একাডেমিক ও ভর্তি কোর্সে সীমিত সময়ের জন্য বিশেষ ছাড় চলছে। এখনই এনরোল করুন।",
            type: "offer",
            showTopBanner: true,
            showNoticeBoard: true,
            actionText: "কোর্সগুলো দেখুন",
            actionUrl: "/courses",
            isActive: true,
            pinned: true,
            createdAt: new Date().toISOString(),
          },
        ]);
      }

      // Push History
      if (Array.isArray(settings.ormission_notifications_history)) {
        setPushHistory(settings.ormission_notifications_history);
      }

      // Push API Settings
      if (settings.ormission_push_settings) {
        setApiSettings({
          provider: settings.ormission_push_settings.provider || "onesignal",
          oneSignalAppId: settings.ormission_push_settings.oneSignalAppId || "",
          oneSignalRestApiKey: settings.ormission_push_settings.oneSignalRestApiKey || "",
          fcmServerKey: settings.ormission_push_settings.fcmServerKey || "",
        });
      }
    } catch (err) {
      console.error("Error loading notice settings:", err);
    } finally {
      setLoading(false);
    }
  };

  // Save Notices to Supabase
  const saveNoticesToDb = async (updatedNotices: NoticeItem[]) => {
    setNotices(updatedNotices);
    await dbService.updateSiteSetting("ormission_notices", updatedNotices);
  };

  // Handle Notice Create / Update
  const handleSaveNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeForm.title.trim()) return;

    let updated: NoticeItem[];
    if (editingNoticeId) {
      updated = notices.map((n) =>
        n.id === editingNoticeId
          ? {
              ...n,
              ...noticeForm,
              titleBn: noticeForm.titleBn || noticeForm.title,
              contentBn: noticeForm.contentBn || noticeForm.content,
            }
          : n
      );
    } else {
      const newNotice: NoticeItem = {
        ...noticeForm,
        id: `notice-${Date.now()}`,
        titleBn: noticeForm.titleBn || noticeForm.title,
        contentBn: noticeForm.contentBn || noticeForm.content,
        createdAt: new Date().toISOString(),
      };
      updated = [newNotice, ...notices];
    }

    await saveNoticesToDb(updated);
    setIsEditingNotice(false);
    setEditingNoticeId(null);
    resetNoticeForm();
  };

  const handleEditNotice = (notice: NoticeItem) => {
    setNoticeForm({
      title: notice.title,
      titleBn: notice.titleBn || notice.title,
      content: notice.content,
      contentBn: notice.contentBn || notice.content,
      type: notice.type,
      showTopBanner: notice.showTopBanner,
      showNoticeBoard: notice.showNoticeBoard,
      actionText: notice.actionText || "",
      actionUrl: notice.actionUrl || "",
      isActive: notice.isActive,
      pinned: notice.pinned,
    });
    setEditingNoticeId(notice.id);
    setIsEditingNotice(true);
  };

  const handleDeleteNotice = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিত এই নোটিশটি মুছে ফেলতে চান?")) return;
    const updated = notices.filter((n) => n.id !== id);
    await saveNoticesToDb(updated);
  };

  const handleToggleNoticeStatus = async (id: string) => {
    const updated = notices.map((n) =>
      n.id === id ? { ...n, isActive: !n.isActive } : n
    );
    await saveNoticesToDb(updated);
  };

  const resetNoticeForm = () => {
    setNoticeForm({
      title: "",
      titleBn: "",
      content: "",
      contentBn: "",
      type: "general",
      showTopBanner: true,
      showNoticeBoard: true,
      actionText: "বিস্তারিত দেখুন",
      actionUrl: "/courses",
      isActive: true,
      pinned: false,
    });
  };

  // Handle Send Push
  const handleSendPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushForm.title.trim() || !pushForm.message.trim()) {
      setPushError("টাইটেল এবং মেসেজ প্রদান করুন");
      return;
    }

    setSendingPush(true);
    setPushError(null);
    setPushSuccess(null);

    try {
      const res = await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: pushForm.title,
          message: pushForm.message,
          targetUrl: pushForm.targetUrl,
          imageUrl: pushForm.imageUrl,
          provider: apiSettings.provider,
          oneSignalAppId: apiSettings.oneSignalAppId,
          oneSignalRestApiKey: apiSettings.oneSignalRestApiKey,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "নোটিফিকেশন পাঠানো ব্যর্থ হয়েছে");
      }

      setPushSuccess(
        `সফল হয়েছে! নোটিফিকেশন পাঠানো সম্পন্ন হয়েছে (ID: ${data.delivery?.notificationId || "OK"})`
      );

      // If user also checked "Also Post as Notice"
      if (pushForm.alsoPostNotice) {
        const newNotice: NoticeItem = {
          id: `notice-${Date.now()}`,
          title: pushForm.title,
          titleBn: pushForm.title,
          content: pushForm.message,
          contentBn: pushForm.message,
          type: pushForm.noticeType,
          showTopBanner: true,
          showNoticeBoard: true,
          actionText: "বিস্তারিত দেখুন",
          actionUrl: pushForm.targetUrl,
          isActive: true,
          pinned: true,
          createdAt: new Date().toISOString(),
        };
        const updatedNotices = [newNotice, ...notices];
        await saveNoticesToDb(updatedNotices);
      }

      // Reload push history
      const settings = await dbService.getSiteSettings();
      if (Array.isArray(settings.ormission_notifications_history)) {
        setPushHistory(settings.ormission_notifications_history);
      }

      // Reset form
      setPushForm({
        title: "",
        message: "",
        targetUrl: "https://ormission.com/courses",
        imageUrl: "",
        alsoPostNotice: false,
        noticeType: "offer",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error sending notification";
      setPushError(msg);
    } finally {
      setSendingPush(false);
    }
  };

  // Save Settings
  const handleSaveApiSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    await dbService.updateSiteSetting("ormission_push_settings", apiSettings);
    setSavingSettings(false);
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 3000);
  };

  const getTypeBadge = (type: NoticeItem["type"]) => {
    switch (type) {
      case "emergency":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-500 border border-rose-500/25">জরুরি নোটিশ</span>;
      case "offer":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/25">স্পেশাল অফার</span>;
      case "exam":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-500 border border-blue-500/25">পরীক্ষা ও রুটিন</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/25">সাধারণ নোটিশ</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-text font-bengali">
                নোটিশ বোর্ড ও পুশ নোটিফিকেশন কন্ট্রোল
              </h1>
              <p className="text-xs text-text-muted font-bengali">
                ওয়েবসাইট অ্যানাউন্সমেন্ট, নোটিশ পেজ এবং মোবাইল অ্যাপে পুশ নোটিফিকেশন পাঠানোর কেন্দ্রীয় হাব
              </p>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-secondary rounded-xl border border-border">
          <button
            onClick={() => setActiveTab("notices")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-bengali transition-all flex items-center gap-1.5 ${
              activeTab === "notices"
                ? "bg-primary text-white shadow-xs"
                : "text-text-muted hover:text-text"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>নোটিশ বোর্ড ({notices.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("push")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-bengali transition-all flex items-center gap-1.5 ${
              activeTab === "push"
                ? "bg-primary text-white shadow-xs"
                : "text-text-muted hover:text-text"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>পুশ নোটিফিকেশন</span>
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-bengali transition-all flex items-center gap-1.5 ${
              activeTab === "settings"
                ? "bg-primary text-white shadow-xs"
                : "text-text-muted hover:text-text"
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>API সেটিংস</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: NOTICES MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === "notices" && (
        <div className="space-y-6">
          {/* Action Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-text font-bengali">
                ওয়েবসাইট ও অ্যাপের নোটিশ তালিকা
              </h2>
              <p className="text-xs text-text-muted font-bengali">
                টপ অ্যানাউন্সমেন্ট বার, নোটিশ বোর্ড পেজ (`/notices`) এবং ড্রপডাউন বেল মেনুতে প্রদর্শনযোগ্য
              </p>
            </div>
            <button
              onClick={() => {
                resetNoticeForm();
                setEditingNoticeId(null);
                setIsEditingNotice(true);
              }}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold font-bengali flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন নোটিশ লিখুন</span>
            </button>
          </div>

          {/* Form Modal / Drawer */}
          {isEditingNotice && (
            <div className="p-5 sm:p-6 rounded-2xl border border-primary/30 bg-surface dark:bg-slate-900/90 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h3 className="text-sm sm:text-base font-bold text-text font-bengali flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>{editingNoticeId ? "নোটিশ সম্পাদনা করুন" : "নতুন নোটিশ যোগ করুন"}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditingNotice(false)}
                  className="text-xs text-text-muted hover:text-text"
                >
                  বন্ধ করুন ✕
                </button>
              </div>

              <form onSubmit={handleSaveNotice} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-text font-bengali">
                      নোটিশের শিরোনাম (Title) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: এইচএসসি ২৫ ব্যাচের চূড়ান্ত রিভিশন ক্লাস শুরু"
                      value={noticeForm.title}
                      onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface-secondary text-sm font-bengali focus:outline-hidden focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text font-bengali">
                      ক্যাটাগরি / ধরন
                    </label>
                    <select
                      value={noticeForm.type}
                      onChange={(e) =>
                        setNoticeForm({ ...noticeForm, type: e.target.value as any })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface-secondary text-sm font-bengali focus:outline-hidden focus:border-primary"
                    >
                      <option value="general">সাধারণ নোটিশ</option>
                      <option value="offer">স্পেশাল অফার</option>
                      <option value="emergency">জরুরি নোটিশ</option>
                      <option value="exam">পরীক্ষা ও রুটিন</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text font-bengali">
                    বিস্তারিত বিবরণ (Description)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="নোটিশের বিস্তারিত বিবরণ দিন..."
                    value={noticeForm.content}
                    onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface-secondary text-sm font-bengali focus:outline-hidden focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text font-bengali">
                      অ্যাকশন বাটন টেক্সট (ঐচ্ছিক)
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: ভর্তি হতে ক্লিক করুন"
                      value={noticeForm.actionText}
                      onChange={(e) => setNoticeForm({ ...noticeForm, actionText: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface-secondary text-sm font-bengali focus:outline-hidden focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text font-bengali">
                      অ্যাকশন লিংক / URL
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: /courses অথবা /course/csib"
                      value={noticeForm.actionUrl}
                      onChange={(e) => setNoticeForm({ ...noticeForm, actionUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface-secondary text-sm font-bengali focus:outline-hidden focus:border-primary"
                    />
                  </div>
                </div>

                {/* Placement Options */}
                <div className="p-3.5 rounded-xl bg-surface-secondary/50 border border-border/60 flex flex-wrap gap-5 text-xs font-bengali">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={noticeForm.showTopBanner}
                      onChange={(e) =>
                        setNoticeForm({ ...noticeForm, showTopBanner: e.target.checked })
                      }
                      className="rounded accent-primary"
                    />
                    <span>ওয়েবসাইটের টপ অ্যানাউন্সমেন্ট বারে দেখান</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={noticeForm.showNoticeBoard}
                      onChange={(e) =>
                        setNoticeForm({ ...noticeForm, showNoticeBoard: e.target.checked })
                      }
                      className="rounded accent-primary"
                    />
                    <span>নোটিশ বোর্ড পেজে (`/notices`) দেখান</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={noticeForm.pinned}
                      onChange={(e) =>
                        setNoticeForm({ ...noticeForm, pinned: e.target.checked })
                      }
                      className="rounded accent-primary"
                    />
                    <span>উপরে পিন করে রাখুন (Pinned)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={noticeForm.isActive}
                      onChange={(e) =>
                        setNoticeForm({ ...noticeForm, isActive: e.target.checked })
                      }
                      className="rounded accent-primary"
                    />
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      সক্রিয় রাখুন (Active)
                    </span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingNotice(false)}
                    className="px-4 py-2 rounded-xl border border-border text-xs font-bold font-bengali text-text-muted hover:text-text"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold font-bengali shadow-xs"
                  >
                    {editingNoticeId ? "আপডেট সংরক্ষণ করুন" : "নোটিশ প্রকাশ করুন"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Notices List */}
          {loading ? (
            <div className="py-12 text-center text-text-muted text-xs font-bengali flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-primary" />
              <span>নোটিশ লোড হচ্ছে...</span>
            </div>
          ) : notices.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed border-border text-center space-y-2">
              <p className="text-sm font-bold text-text-muted font-bengali">
                কোনো নোটিশ পাওয়া যায়নি।
              </p>
              <p className="text-xs text-text-muted font-bengali">
                "নতুন নোটিশ লিখুন" বাটনে ক্লিক করে প্রথম নোটিশটি তৈরি করুন।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {notices.map((notice) => (
                <div
                  key={notice.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    notice.isActive
                      ? "bg-surface dark:bg-slate-900 border-border shadow-2xs"
                      : "bg-surface-secondary/40 border-border/50 opacity-60"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {getTypeBadge(notice.type)}
                        {notice.pinned && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary flex items-center gap-1">
                            <Pin className="w-3 h-3 fill-current" />
                            <span>Pinned</span>
                          </span>
                        )}
                        {notice.showTopBanner && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-500/15 text-violet-500">
                            টপ ব্যানার
                          </span>
                        )}
                        <span className="text-[11px] text-text-muted flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(notice.createdAt).toLocaleDateString("bn-BD")}
                          </span>
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-text font-bengali">
                        {notice.title}
                      </h3>

                      {notice.content && (
                        <p className="text-xs text-text-muted font-bengali line-clamp-2">
                          {notice.content}
                        </p>
                      )}

                      {notice.actionUrl && (
                        <div className="pt-1">
                          <a
                            href={notice.actionUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline font-bengali"
                          >
                            <span>লিংক: {notice.actionText || notice.actionUrl}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleNoticeStatus(notice.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold font-bengali transition-colors ${
                          notice.isActive
                            ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-500 hover:bg-slate-300"
                        }`}
                      >
                        {notice.isActive ? "সক্রিয় ✓" : "নিষ্ক্রিয় ✕"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEditNotice(notice)}
                        className="p-2 rounded-lg border border-border hover:bg-surface-secondary text-text-muted hover:text-text transition-colors"
                        title="সম্পাদনা"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteNotice(notice.id)}
                        className="p-2 rounded-lg border border-border hover:bg-rose-500/10 text-text-muted hover:text-rose-500 transition-colors"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PUSH NOTIFICATION SENDER */}
      {/* ========================================================================= */}
      {activeTab === "push" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-5 sm:p-6 rounded-2xl border border-border bg-surface dark:bg-slate-900 shadow-xs space-y-4">
              <div className="pb-3 border-b border-border">
                <h2 className="text-base font-bold text-text font-bengali flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-primary" />
                  <span>রিয়েল-টাইম পুশ নোটিফিকেশন পাঠান</span>
                </h2>
                <p className="text-xs text-text-muted font-bengali mt-0.5">
                  অ্যান্ড্রয়েড অ্যাপ ও ওয়েবসাইটের সাবস্ক্রাইবারদের ডিভাইসে সরাসরি নোটিফিকেশন পৌঁছাবে
                </p>
              </div>

              {pushSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bengali flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{pushSuccess}</span>
                </div>
              )}

              {pushError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bengali flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{pushError}</span>
                </div>
              )}

              <form onSubmit={handleSendPush} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text font-bengali">
                    নোটিফিকেশনের শিরোনাম (Title) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: 📢 বিশেষ অফার: সকল কোর্সে ৩০% ছাড়!"
                    value={pushForm.title}
                    onChange={(e) => setPushForm({ ...pushForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface-secondary text-sm font-bengali focus:outline-hidden focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text font-bengali">
                    মেসেজ বা বার্তা (Message Body) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="যেমন: এইচএসসি ও এডমিশন স্পেশাল ব্যাচে ভর্তি চলছে। এখনই যুক্ত হোন..."
                    value={pushForm.message}
                    onChange={(e) => setPushForm({ ...pushForm, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface-secondary text-sm font-bengali focus:outline-hidden focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text font-bengali">
                    ক্লিক করলে কোন পেজ ওপেন হবে (Target Page / Deep Link)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://ormission.com/courses"
                      value={pushForm.targetUrl}
                      onChange={(e) => setPushForm({ ...pushForm, targetUrl: e.target.value })}
                      className="flex-1 px-3.5 py-2 rounded-xl border border-border bg-surface-secondary text-xs focus:outline-hidden focus:border-primary"
                    />
                  </div>
                  {/* Quick Select Buttons */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setPushForm({ ...pushForm, targetUrl: "https://ormission.com/courses" })}
                      className="px-2.5 py-1 rounded-md text-[10.5px] font-bold bg-surface-secondary hover:bg-primary/10 hover:text-primary transition-colors font-bengali"
                    >
                      সকল কোর্স
                    </button>
                    <button
                      type="button"
                      onClick={() => setPushForm({ ...pushForm, targetUrl: "https://ormission.com/books" })}
                      className="px-2.5 py-1 rounded-md text-[10.5px] font-bold bg-surface-secondary hover:bg-primary/10 hover:text-primary transition-colors font-bengali"
                    >
                      বই সমূহ
                    </button>
                    <button
                      type="button"
                      onClick={() => setPushForm({ ...pushForm, targetUrl: "https://ormission.com/category/ssc" })}
                      className="px-2.5 py-1 rounded-md text-[10.5px] font-bold bg-surface-secondary hover:bg-primary/10 hover:text-primary transition-colors font-bengali"
                    >
                      এসএসসি
                    </button>
                    <button
                      type="button"
                      onClick={() => setPushForm({ ...pushForm, targetUrl: "https://ormission.com/category/hsc" })}
                      className="px-2.5 py-1 rounded-md text-[10.5px] font-bold bg-surface-secondary hover:bg-primary/10 hover:text-primary transition-colors font-bengali"
                    >
                      এইচএসসি
                    </button>
                    <button
                      type="button"
                      onClick={() => setPushForm({ ...pushForm, targetUrl: "https://ormission.com/course/csib" })}
                      className="px-2.5 py-1 rounded-md text-[10.5px] font-bold bg-surface-secondary hover:bg-primary/10 hover:text-primary transition-colors font-bengali"
                    >
                      CSIB কোর্স
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text font-bengali">
                    বড় ব্যানার ছবির URL (ঐচ্ছিক)
                  </label>
                  <input
                    type="url"
                    placeholder="https://ormission.com/images/hero-banner-main.webp"
                    value={pushForm.imageUrl}
                    onChange={(e) => setPushForm({ ...pushForm, imageUrl: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-border bg-surface-secondary text-xs focus:outline-hidden focus:border-primary"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-surface-secondary/60 border border-border/80 flex items-center justify-between text-xs font-bengali">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pushForm.alsoPostNotice}
                      onChange={(e) =>
                        setPushForm({ ...pushForm, alsoPostNotice: e.target.checked })
                      }
                      className="rounded accent-primary"
                    />
                    <span>একই সাথে ওয়েবসাইটের নোটিশ বোর্ডেও প্রকাশ করুন</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={sendingPush}
                  className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold font-bengali flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-70 cursor-pointer"
                >
                  {sendingPush ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>নোটিফিকেশন পাঠানো হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>এখনই পুশ নোটিফিকেশন পাঠান</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Interactive Phone Mockup Preview */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider font-sans">
              Device Notification Preview
            </h3>

            <div className="p-4 sm:p-5 rounded-3xl border border-border/80 bg-slate-950 text-white shadow-xl max-w-sm mx-auto">
              {/* Phone Status Bar */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-sans pb-4 border-b border-slate-800">
                <span>9:41 AM</span>
                <div className="flex items-center gap-1.5">
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Notification Card */}
              <div className="mt-4 p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-primary flex items-center justify-center text-[10px] font-black text-white">
                      O
                    </div>
                    <span className="text-xs font-bold text-slate-200">Ormission</span>
                    <span className="text-[10px] text-slate-500">• Now</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white font-bengali">
                    {pushForm.title || "📢 নোটিফিকেশনের শিরোনাম এখানে দেখাবে"}
                  </h4>
                  <p className="text-[11px] text-slate-300 font-bengali mt-0.5 leading-relaxed">
                    {pushForm.message || "নোটিফিকেশনের মূল বার্তা বা অফার মেসেজটি এখানে প্রদর্শিত হবে।"}
                  </p>
                </div>

                {pushForm.imageUrl && (
                  <div className="mt-2 rounded-xl overflow-hidden border border-slate-800 h-28 bg-slate-800 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={pushForm.imageUrl}
                      alt="Banner"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="pt-1 flex items-center justify-between text-[10px] text-primary font-bengali">
                  <span>ক্লিক করলে নির্দিষ্ট পেজ ওপেন হবে</span>
                  <span>Open ↗</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 text-center font-bengali mt-4">
                ব্যবহারকারীর অ্যান্ড্রয়েড ফোনের স্ট্যাটাস বার ও হোম স্ক্রিনে এই রূপেই ভেসে উঠবে।
              </p>
            </div>

            {/* Recent Push History */}
            <div className="p-4 rounded-2xl border border-border bg-surface dark:bg-slate-900 space-y-2.5">
              <h4 className="text-xs font-bold text-text font-bengali flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>সাম্প্রতিক পুশ হিস্ট্রি ({pushHistory.length})</span>
              </h4>

              {pushHistory.length === 0 ? (
                <p className="text-[11px] text-text-muted font-bengali">
                  এখনও কোনো পুশ নোটিফিকেশন পাঠানো হয়নি।
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                  {pushHistory.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl border border-border/60 bg-surface-secondary/40 text-[11px] font-bengali space-y-1"
                    >
                      <div className="flex items-center justify-between font-bold text-text">
                        <span className="truncate">{item.title}</span>
                        <span className="text-[9.5px] text-text-muted shrink-0 font-sans">
                          {new Date(item.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-text-muted truncate">{item.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: API & INTEGRATION SETTINGS */}
      {/* ========================================================================= */}
      {activeTab === "settings" && (
        <div className="max-w-2xl space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl border border-border bg-surface dark:bg-slate-900 shadow-xs space-y-5">
            <div className="pb-3 border-b border-border">
              <h2 className="text-base font-bold text-text font-bengali flex items-center gap-2">
                <Key className="w-4 h-4 text-primary" />
                <span>পুশ নোটিফিকেশন API সেটিংস</span>
              </h2>
              <p className="text-xs text-text-muted font-bengali mt-0.5">
                OneSignal বা Firebase এর ক্রেডেনশিয়াল সংরক্ষণ করুন যা দিয়ে অ্যাডমিন প্যানেল থেকে পাঠানো হবে
              </p>
            </div>

            {settingsSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bengali flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>API সেটিংস সফলভাবে সংরক্ষিত হয়েছে!</span>
              </div>
            )}

            <form onSubmit={handleSaveApiSettings} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text font-bengali">
                  পুশ নোটিফিকেশন প্রোভাইডার
                </label>
                <select
                  value={apiSettings.provider}
                  onChange={(e) =>
                    setApiSettings({ ...apiSettings, provider: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface-secondary text-sm font-bengali focus:outline-hidden focus:border-primary"
                >
                  <option value="onesignal">OneSignal (রিকমেন্ডেড - সবচেয়ে সহজ ও দ্রুত)</option>
                  <option value="firebase">Firebase Cloud Messaging (FCM)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text font-sans">
                  OneSignal App ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. 5eb7483f-42e1-4567-9102-xxxxxxxxxxxx"
                  value={apiSettings.oneSignalAppId}
                  onChange={(e) =>
                    setApiSettings({ ...apiSettings, oneSignalAppId: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface-secondary text-xs font-mono focus:outline-hidden focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text font-sans">
                  OneSignal REST API Key
                </label>
                <input
                  type="password"
                  placeholder="e.g. os_v2_app_xxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={apiSettings.oneSignalRestApiKey}
                  onChange={(e) =>
                    setApiSettings({ ...apiSettings, oneSignalRestApiKey: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface-secondary text-xs font-mono focus:outline-hidden focus:border-primary"
                />
              </div>

              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2 text-xs font-bengali text-text-muted">
                <h4 className="font-bold text-text flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>OneSignal কী কোথায় পাবেন?</span>
                </h4>
                <ol className="list-decimal list-inside space-y-1 pl-1">
                  <li>
                    <a
                      href="https://onesignal.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline font-bold"
                    >
                      onesignal.com
                    </a>-এ লগইন করে আপনার অ্যাপে যান।
                  </li>
                  <li><strong>Settings &gt; Keys &amp; IDs</strong> অপশনে ক্লিক করুন।</li>
                  <li>সেখান থেকে <strong>OneSignal App ID</strong> এবং <strong>REST API Key</strong> কপি করে উপরের ঘরে পেস্ট করুন।</li>
                </ol>
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold font-bengali shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                {savingSettings ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>সংরক্ষণ হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>সেটিংস সেভ করুন</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
