"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Settings,
  Save,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Database,
  ArrowRight,
  Share2,
  ExternalLink,
  Globe,
  PhoneCall,
  Phone,
  MessageCircle,
  Key,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { dbService } from "@/lib/supabase/db-service";
import { supabase } from "@/lib/supabase/client";
import {
  FacebookIcon,
  YouTubeIcon,
  TelegramIcon,
  WhatsAppIcon,
  MessengerIcon,
  InstagramIcon,
  LinkedInIcon,
  TwitterXIcon,
  TikTokIcon,
} from "@/components/social-icons";

interface SocialItem {
  enabled: boolean;
  url: string;
  label: string;
  handle?: string;
}

interface SocialLinksSettings {
  facebook: SocialItem;
  youtube: SocialItem;
  telegram: SocialItem;
  whatsapp: SocialItem;
  instagram: SocialItem;
  linkedin: SocialItem;
  twitter: SocialItem;
  tiktok: SocialItem;
  communityTitle?: string;
  communitySubtitle?: string;
}

const defaultSocialSettings: SocialLinksSettings = {
  facebook: {
    enabled: true,
    url: "https://facebook.com/ormission",
    label: "ফেসবুক পেজ",
    handle: "@ormission",
  },
  youtube: {
    enabled: true,
    url: "https://youtube.com/@ormission",
    label: "ইউটিউব চ্যানেল",
    handle: "@ormission",
  },
  telegram: {
    enabled: true,
    url: "https://t.me/ormission_community",
    label: "টেলিগ্রাম গ্রুপ",
    handle: "@ormission_community",
  },
  whatsapp: {
    enabled: true,
    url: "https://wa.me/8801728477095",
    label: "হোয়াটসঅ্যাপ সাপোর্ট",
    handle: "+880 1728-477095",
  },
  instagram: {
    enabled: true,
    url: "https://instagram.com/ormission",
    label: "ইনস্টাগ্রাম",
    handle: "@ormission",
  },
  linkedin: {
    enabled: false,
    url: "https://linkedin.com/company/ormission",
    label: "লিংকডইন",
    handle: "Ormission",
  },
  twitter: {
    enabled: false,
    url: "https://twitter.com/ormission",
    label: "টুইটার / X",
    handle: "@ormission",
  },
  tiktok: {
    enabled: false,
    url: "https://tiktok.com/@ormission",
    label: "টিকটক",
    handle: "@ormission",
  },
  communityTitle: "আমাদের অফিশিয়াল কমিউনিটিতে যুক্ত হোন",
  communitySubtitle: "যেকোনো আপডেট, লাইভ ক্লাস অ্যালার্ট এবং সরাসরি মেন্টর সাপোর্টের জন্য ফেসবুক ও টেলিগ্রামে আমাদের সাথে থাকুন।",
};

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [settings, setSettings] = useState({
    brandName: "Ormission",
    tagline: "Learn · Build · Grow",
    hotline: "01741347039",
    whatsapp: "01741347039",
    messenger: "https://m.me/ormission",
    email: "info@ormission.com",
    address: "বাংলাদেশ",
    sslStoreId: "ormission_live",
    sslSecret: "••••••••••••••••",
    isSandbox: true,
  });

  const [social, setSocial] = useState<SocialLinksSettings>(defaultSocialSettings);

  // Admin credentials state
  const [currentAdminEmail, setCurrentAdminEmail] = useState("");
  const [currentAdminId, setCurrentAdminId] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [confirmAdminPassword, setConfirmAdminPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [updatingCreds, setUpdatingCreds] = useState(false);
  const [credSuccessMsg, setCredSuccessMsg] = useState("");
  const [credErrorMsg, setCredErrorMsg] = useState("");

  const loadSettings = async () => {
    setLoading(true);
    const data = await dbService.getSiteSettings();

    let parsedSocial = defaultSocialSettings;
    if (data.social_links) {
      let parsed = data.social_links;
      if (typeof parsed === "string") {
        try { parsed = JSON.parse(parsed); } catch {}
      }
      parsedSocial = {
        ...defaultSocialSettings,
        ...parsed,
        facebook: { ...defaultSocialSettings.facebook, ...(parsed.facebook || {}) },
        youtube: { ...defaultSocialSettings.youtube, ...(parsed.youtube || {}) },
        telegram: { ...defaultSocialSettings.telegram, ...(parsed.telegram || {}) },
        whatsapp: { ...defaultSocialSettings.whatsapp, ...(parsed.whatsapp || {}) },
        instagram: { ...defaultSocialSettings.instagram, ...(parsed.instagram || {}) },
        linkedin: { ...defaultSocialSettings.linkedin, ...(parsed.linkedin || {}) },
        twitter: { ...defaultSocialSettings.twitter, ...(parsed.twitter || {}) },
        tiktok: { ...defaultSocialSettings.tiktok, ...(parsed.tiktok || {}) },
      };
      setSocial(parsedSocial);
    }

    const defaultMessengerLink = parsedSocial?.facebook?.url
      ? (parsedSocial.facebook.url.includes("m.me") ? parsedSocial.facebook.url : `https://m.me/${parsedSocial.facebook.url.replace(/\/+$/, "").split("/").pop()}`)
      : "https://m.me/ormission";

    setSettings((prev) => ({
      ...prev,
      brandName: data.site_name || prev.brandName,
      tagline: data.site_tagline || prev.tagline,
      email: data.contact_email || prev.email,
      hotline: data.contact_phone || "01741347039",
      whatsapp: data.contact_whatsapp || parsedSocial?.whatsapp?.handle || parsedSocial?.whatsapp?.url || "01741347039",
      messenger: data.contact_messenger || defaultMessengerLink,
      address: data.contact_address || prev.address,
      sslStoreId: data.ssl_store_id || prev.sslStoreId,
      isSandbox: data.ssl_is_sandbox !== undefined ? data.ssl_is_sandbox : prev.isSandbox,
    }));

    setLoading(false);
  };

  useEffect(() => {
    loadSettings();

    async function loadCurrentAdmin() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setCurrentAdminId(session.user.id);
          setCurrentAdminEmail(session.user.email || "");
          setNewAdminEmail(session.user.email || "");
        }
      } catch (e) {
        console.warn("Could not load current admin session:", e);
      }
    }
    loadCurrentAdmin();
  }, []);

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredErrorMsg("");
    setCredSuccessMsg("");

    if (!newAdminEmail.trim() && !newAdminPassword.trim()) {
      setCredErrorMsg("পরিবর্তন করার জন্য নতুন ইমেইল অথবা পাসওয়ার্ড দিন।");
      return;
    }

    if (newAdminPassword && newAdminPassword.length < 6) {
      setCredErrorMsg("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।");
      return;
    }

    if (newAdminPassword && newAdminPassword !== confirmAdminPassword) {
      setCredErrorMsg("নতুন পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মিলছে না!");
      return;
    }

    setUpdatingCreds(true);
    try {
      const res = await fetch("/api/admin/update-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentAdminId,
          newEmail: newAdminEmail.trim() !== currentAdminEmail ? newAdminEmail.trim() : undefined,
          newPassword: newAdminPassword.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setCredErrorMsg(data.error || "আপডেট ব্যর্থ হয়েছে।");
      } else {
        setCredSuccessMsg("অ্যাডমিন ইমেইল ও পাসওয়ার্ড সফলভাবে আপডেট হয়েছে! পরবর্তী লগইনে এই তথ্য ব্যবহার করুন।");
        if (newAdminEmail.trim()) {
          setCurrentAdminEmail(newAdminEmail.trim());
        }
        setNewAdminPassword("");
        setConfirmAdminPassword("");
      }
    } catch {
      setCredErrorMsg("সার্ভারের সাথে যোগাযোগ করতে সমস্যা হয়েছে।");
    } finally {
      setUpdatingCreds(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const rawWa = settings.whatsapp?.trim() || "";
    let waDigits = rawWa.replace(/[^0-9]/g, "");
    if (waDigits.startsWith("0")) {
      waDigits = "880" + waDigits.slice(1);
    } else if (waDigits.length === 10 && waDigits.startsWith("1")) {
      waDigits = "880" + waDigits;
    }
    const waUrl = rawWa.startsWith("http") ? rawWa : (waDigits ? `https://wa.me/${waDigits}` : social.whatsapp.url);

    const updatedSocial = {
      ...social,
      whatsapp: {
        ...social.whatsapp,
        url: waUrl,
        handle: rawWa || social.whatsapp.handle,
      },
    };

    await Promise.all([
      dbService.updateSiteSetting("site_name", settings.brandName),
      dbService.updateSiteSetting("site_tagline", settings.tagline),
      dbService.updateSiteSetting("contact_email", settings.email),
      dbService.updateSiteSetting("contact_phone", settings.hotline),
      dbService.updateSiteSetting("contact_whatsapp", settings.whatsapp),
      dbService.updateSiteSetting("contact_messenger", settings.messenger),
      dbService.updateSiteSetting("contact_address", settings.address),
      dbService.updateSiteSetting("ssl_store_id", settings.sslStoreId),
      dbService.updateSiteSetting("ssl_is_sandbox", settings.isSandbox),
      dbService.updateSiteSetting("social_links", updatedSocial),
    ]);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSeedData = async () => {
    if (confirm("আপনি কি নিশ্চিত যে বেসলাইন ক্যাটাগরি, কোর্স ও শিক্ষক ডেটাবেজে সিড করতে চান?")) {
      setSeeding(true);
      const res = await dbService.seedBaselineData();
      alert(res.message);
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-bold text-text font-bengali">
              প্ল্যাটফর্ম ও পেমেন্ট গেটওয়ে সেটিংস
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
              Supabase Site Settings
            </span>
          </div>
          <p className="text-xs text-text-muted font-bengali mt-0.5">
            ব্র্যান্ড পরিচিতি, হেল্পলাইন এবং SSLCommerz পেমেন্ট গেটওয়ে ক্রেডেনশিয়াল
          </p>
        </div>

        <button
          type="button"
          onClick={loadSettings}
          disabled={loading}
          className="btn btn-outline btn-sm font-bengali text-xs flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
          <span>রিফ্রেশ</span>
        </button>
      </div>

      {saved && (
        <div className="p-3.5 bg-success/10 border border-success/20 rounded-xl text-xs font-bengali text-success flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>সাইট সেটিংস সফলভাবে Supabase ডাটাবেজে সংরক্ষিত হয়েছে!</span>
        </div>
      )}

      {/* Database Quick Utilities Card */}
      <div className="bg-surface rounded-xl border border-border p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-text font-bengali">
              ডাটাবেজ বেসলাইন সিডার (Database Seeder)
            </h3>
            <p className="text-xs text-text-muted font-bengali">
              এক ক্লিকে মূল শিক্ষা বিভাগ, বুয়েট/মেডিকেল কোর্স ও ফ্যাকাল্টি ডাটাবেজে যুক্ত করুন।
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSeedData}
          disabled={seeding}
          className="btn btn-primary btn-sm font-bengali font-bold flex items-center gap-1.5 whitespace-nowrap shadow-xs"
        >
          <Sparkles className={`w-3.5 h-3.5 ${seeding ? "animate-spin" : ""}`} />
          <span>{seeding ? "সিড হচ্ছে..." : "প্রাথমিক ডেটা সিড করুন"}</span>
        </button>
      </div>

      {/* Payment Wallet Setup Banner Card */}
      <div className="bg-gradient-to-r from-primary/10 via-secondary/5 to-surface rounded-xl border border-primary/20 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-xs shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-text font-bengali">
                বিকাশ, নগদ ও রকেট ওয়ালেট ও গেটওয়ে সেটিংস
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary text-white font-bengali">
                নতুন
              </span>
            </div>
            <p className="text-xs text-text-muted font-bengali mt-0.5">
              অ্যাডমিনের বিকাশ/নগদ/রকেট নম্বর, মার্চেন্ট অ্যাকাউন্ট ও শিক্ষার্থীদের জন্য পেমেন্ট নির্দেশনা কনফিগার করুন।
            </p>
          </div>
        </div>

        <Link
          href="/settings/payment"
          className="btn btn-primary btn-sm font-bengali font-bold flex items-center gap-1.5 whitespace-nowrap shadow-xs shrink-0"
        >
          <span>পেমেন্ট সেটিংস কনফিগার করুন</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Admin Login Credentials & Security Card (Email & Password change) */}
      <div id="security" className="bg-surface rounded-2xl border-2 border-primary/30 shadow-md p-6 sm:p-7 relative overflow-hidden transition-all scroll-mt-20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent rounded-full blur-2xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-primary to-blue-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-text font-bengali">
                  অ্যাডমিন লগইন ও সিকিউরিটি ক্রেডেনশিয়াল
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 font-bengali">
                  সরাসরি পরিবর্তন
                </span>
              </div>
              <p className="text-xs text-text-muted font-bengali mt-0.5">
                অ্যাডমিন প্যানেলে লগইন করার মূল ইমেইল বা নতুন পাসওয়ার্ড এখান থেকেই সরাসরি পরিবর্তন ও সেট করুন।
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right px-3.5 py-1.5 rounded-xl bg-surface-secondary/70 border border-border">
            <div className="text-[10px] text-text-muted font-bengali">বর্তমান লগইন ইমেইল:</div>
            <div className="text-xs font-mono font-bold text-primary truncate max-w-[220px]">
              {currentAdminEmail || "লোড হচ্ছে..."}
            </div>
          </div>
        </div>

        {credSuccessMsg && (
          <div className="mt-4 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-bengali text-emerald-700 dark:text-emerald-300 flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{credSuccessMsg}</span>
          </div>
        )}

        {credErrorMsg && (
          <div className="mt-4 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs font-bengali text-rose-700 dark:text-rose-300 flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{credErrorMsg}</span>
          </div>
        )}

        <form onSubmit={handleUpdateCredentials} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* New Email */}
            <div>
              <label className="block text-xs font-semibold text-text font-bengali mb-1.5">
                নতুন অ্যাডমিন ইমেইল (Admin Email)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="admin@ormission.com"
                  style={{ paddingLeft: "2.75rem", paddingRight: "0.75rem" }}
                  className="w-full py-2 bg-surface border border-border rounded-xl text-xs font-mono text-text placeholder:text-text-muted/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <p className="text-[10px] text-text-muted font-bengali mt-1">
                ইমেইল পরিবর্তন করতে চাইলে নতুন ইমেইল লিখুন।
              </p>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-text font-bengali mb-1.5">
                নতুন পাসওয়ার্ড (New Password)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="কমপক্ষে ৬ অক্ষর..."
                  style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }}
                  className="w-full py-2 bg-surface border border-border rounded-xl text-xs font-mono text-text placeholder:text-text-muted/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text cursor-pointer transition-colors"
                  title={showNewPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-text-muted font-bengali mt-1">
                পাসওয়ার্ড পরিবর্তন না করতে চাইলে খালি রাখুন।
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-text font-bengali mb-1.5">
                কনফার্ম পাসওয়ার্ড (Confirm)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={confirmAdminPassword}
                  onChange={(e) => setConfirmAdminPassword(e.target.value)}
                  placeholder="পুনরায় পাসওয়ার্ড লিখুন..."
                  style={{ paddingLeft: "2.75rem", paddingRight: "0.75rem" }}
                  className="w-full py-2 bg-surface border border-border rounded-xl text-xs font-mono text-text placeholder:text-text-muted/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              {newAdminPassword && confirmAdminPassword && (
                <p className={`text-[10px] font-bengali mt-1 ${newAdminPassword === confirmAdminPassword ? "text-emerald-500 font-bold" : "text-rose-500 font-bold"}`}>
                  {newAdminPassword === confirmAdminPassword ? "✓ পাসওয়ার্ড মিলেছে" : "✕ পাসওয়ার্ড মিলছে না"}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-border">
            <div className="text-[11px] text-text-muted font-bengali flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>ইমেইল বা পাসওয়ার্ড পরিবর্তন সাথে সাথে ডাটাবেজে আপডেট হবে এবং পরবর্তী লগইনে কার্যকর হবে।</span>
            </div>

            <button
              type="submit"
              disabled={updatingCreds || (!newAdminPassword && newAdminEmail.trim() === currentAdminEmail)}
              className="btn btn-primary btn-sm font-bengali font-bold flex items-center gap-2 whitespace-nowrap shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {updatingCreds ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>আপডেট হচ্ছে...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>লগইন ক্রেডেনশিয়াল সেভ করুন</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center text-xs text-text-muted font-bengali">
          <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-primary" />
          সেটিংস লোড হচ্ছে...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Brand Info */}
          <div className="bg-surface rounded-xl border border-border p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-text font-bengali pb-2 border-b border-border">
              ব্র্যান্ড ও সাধারণ তথ্য
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text font-bengali mb-1">
                  ব্র্যান্ড নাম *
                </label>
                <input
                  type="text"
                  required
                  value={settings.brandName}
                  onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
                  className="input text-xs font-bengali w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text font-bengali mb-1">
                  ট্যাগলাইন (Tagline) *
                </label>
                <input
                  type="text"
                  required
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="input text-xs font-bengali w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text font-bengali mb-1">
                  সাপোর্ট ইমেইল *
                </label>
                <input
                  type="email"
                  required
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="input text-xs font-mono w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text font-bengali mb-1">
                  অফিস ঠিকানা
                </label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="input text-xs font-bengali w-full"
                />
              </div>
            </div>
          </div>

          {/* Quick Contact & Floating Call Widget Card (Direct Call, WhatsApp, Messenger) */}
          <div className="bg-surface rounded-xl border-2 border-emerald-500/25 dark:border-emerald-500/35 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-xs shrink-0">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm sm:text-base text-text font-bengali">
                      সরাসরি যোগাযোগ ও ফ্লোটিং কল বাটন সেটিংস (Direct Call, WhatsApp, Messenger)
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Live Widget
                    </span>
                  </div>
                  <p className="text-xs text-text-muted font-bengali mt-0.5">
                    মূল ওয়েবসাইটের নিচের ফ্লোটিং কল বাটনে ক্লিক করলে যে ৩টি অপশন (WhatsApp, Messenger, Direct Call) আসে, সেগুলোর নম্বর ও লিংক এখান থেকে সরাসরি পরিবর্তন করুন।
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* 1. Direct Call Phone Number */}
              <div className="p-4 rounded-xl bg-surface-secondary/60 border border-teal-500/20 dark:border-teal-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <label className="text-xs font-bold text-text font-bengali">
                      Direct Call নম্বর *
                    </label>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 font-semibold font-bengali">
                    সরাসরি কল
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={settings.hotline}
                  onChange={(e) => setSettings({ ...settings, hotline: e.target.value })}
                  placeholder="01741347039"
                  className="input text-xs font-mono font-bold w-full bg-surface"
                />
                <p className="text-[11px] text-text-muted font-bengali leading-relaxed">
                  ওয়েবসাইটের <strong className="text-teal-600 dark:text-teal-400">Direct Call</strong> অপশনে ক্লিক করলে সরাসরি এই নম্বরে ফোন কল যাবে।
                </p>
              </div>

              {/* 2. WhatsApp Number */}
              <div className="p-4 rounded-xl bg-surface-secondary/60 border border-emerald-500/20 dark:border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#25D366]/15 text-[#25D366] flex items-center justify-center">
                      <WhatsAppIcon size={16} />
                    </div>
                    <label className="text-xs font-bold text-text font-bengali">
                      WhatsApp নম্বর / চ্যাট *
                    </label>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold font-bengali">
                    চ্যাট
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={settings.whatsapp}
                  onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                  placeholder="01741347039"
                  className="input text-xs font-mono font-bold w-full bg-surface"
                />
                <p className="text-[11px] text-text-muted font-bengali leading-relaxed">
                  ওয়েবসাইটের <strong className="text-emerald-600 dark:text-emerald-400">WhatsApp</strong> অপশনে ক্লিক করলে এই নম্বরে সরাসরি চ্যাট শুরু হবে।
                </p>
              </div>

              {/* 3. Messenger Link */}
              <div className="p-4 rounded-xl bg-surface-secondary/60 border border-blue-500/20 dark:border-blue-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#0084FF]/15 text-[#0084FF] flex items-center justify-center">
                      <MessengerIcon size={15} />
                    </div>
                    <label className="text-xs font-bold text-text font-bengali">
                      Messenger লিঙ্ক / ইউজারনেম *
                    </label>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold font-bengali">
                    ফেসবুক
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={settings.messenger}
                  onChange={(e) => setSettings({ ...settings, messenger: e.target.value })}
                  placeholder="https://m.me/ormission অথবা ormission"
                  className="input text-xs font-mono font-bold w-full bg-surface"
                />
                <p className="text-[11px] text-text-muted font-bengali leading-relaxed">
                  ওয়েবসাইটের <strong className="text-blue-600 dark:text-blue-400">Messenger</strong> অপশনে ক্লিক করলে সরাসরি ফেসবুক চ্যাট ওপেন হবে।
                </p>
              </div>
            </div>

            {/* Quick Live Preview Bar */}
            <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-bengali">
              <div className="flex items-center gap-2 text-text">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  সরাসরি কল: <strong className="font-mono text-teal-600 dark:text-teal-400">{settings.hotline || "০১৭৪১-৩৪৭০৩৯"}</strong> | হোয়াটসঅ্যাপ: <strong className="font-mono text-emerald-600 dark:text-emerald-400">{settings.whatsapp || "০১৭৪১-৩৪৭০৩৯"}</strong> | মেসেঞ্জার: <strong className="font-mono text-blue-600 dark:text-blue-400">{settings.messenger || "https://m.me/ormission"}</strong>
                </span>
              </div>
              <span className="text-[11px] text-text-muted shrink-0">
                পরিবর্তন করে নিচে &quot;সেটিংস সংরক্ষণ করুন&quot; বাটনে চাপুন
              </span>
            </div>
          </div>

          {/* Admin Login Credentials & Security Card */}
          <div id="security" className="bg-surface rounded-xl border-2 border-primary/25 dark:border-primary/35 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm sm:text-base text-text font-bengali">
                      অ্যাডমিন লগইন ইমেইল ও পাসওয়ার্ড পরিবর্তন (Admin Credentials)
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                      Security & Auth
                    </span>
                  </div>
                  <p className="text-xs text-text-muted font-bengali mt-0.5">
                    আপনার বর্তমান অ্যাডমিন অ্যাকাউন্টের লগইন ইমেইল ও নতুন পাসওয়ার্ড এখান থেকে সরাসরি আপডেট করুন।
                  </p>
                </div>
              </div>
            </div>

            {credSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2.5 text-xs text-emerald-600 dark:text-emerald-400 font-bengali animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{credSuccessMsg}</span>
              </div>
            )}

            {credErrorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center gap-2.5 text-xs text-rose-500 font-bengali animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{credErrorMsg}</span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-surface-secondary/60 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-bengali">
              <span className="text-text-muted">বর্তমানে লগইন থাকা অ্যাডমিন ইমেইল:</span>
              <span className="font-mono font-bold text-text bg-surface px-2.5 py-1 rounded border border-border">
                {currentAdminEmail || "admin@ormission.com"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* New Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text font-bengali">
                  অ্যাডমিন ইমেইল এড্রেস
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-text-muted pointer-events-none" />
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="admin@ormission.com"
                    className="input text-xs font-mono w-full pl-9"
                  />
                </div>
                <p className="text-[10px] text-text-muted font-bengali">
                  নতুন ইমেইল দিলে পরবর্তী সময়ে এই ইমেইল দিয়ে লগইন করতে হবে।
                </p>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text font-bengali">
                  নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-text-muted pointer-events-none" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="নতুন পাসওয়ার্ড লিখুন"
                    className="input text-xs font-mono w-full pl-9 pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2.5 top-2.5 text-text-muted hover:text-text cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-text-muted font-bengali">
                  পাসওয়ার্ড পরিবর্তন না করতে চাইলে ঘরটি ফাঁকা রাখুন।
                </p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text font-bengali">
                  পাসওয়ার্ড নিশ্চিত করুন
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-text-muted pointer-events-none" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={confirmAdminPassword}
                    onChange={(e) => setConfirmAdminPassword(e.target.value)}
                    placeholder="পাসওয়ার্ড পুনরায় লিখুন"
                    className="input text-xs font-mono w-full pl-9"
                  />
                </div>
                <p className="text-[10px] text-text-muted font-bengali">
                  উপরে দেওয়া পাসওয়ার্ডটি হুবহু পুনরায় লিখুন।
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
              <span className="text-[11px] text-text-muted font-bengali">
                💡 নিরাপত্তা সতর্কতা: আপডেট করার সাথে সাথে নতুন পাসওয়ার্ড বা ইমেইল কার্যকর হবে।
              </span>
              <button
                type="button"
                onClick={handleUpdateCredentials}
                disabled={updatingCreds}
                className="btn btn-primary btn-sm font-bengali font-bold flex items-center gap-1.5 shadow-sm"
              >
                {updatingCreds ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>আপডেট হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>অ্যাডমিন ক্রেডেনশিয়াল আপডেট করুন</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Social Media & Community Links */}
          <div className="bg-surface rounded-xl border border-border p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-text font-bengali">
                    সোশ্যাল মিডিয়া ও কমিউনিটি লিংক সেটিংস
                  </h3>
                  <p className="text-[11px] text-text-muted font-bengali">
                    এখানে দেওয়া লিঙ্কগুলো ওয়েবসাইটের ফুটার এবং স্টুডেন্টদের ড্যাশবোর্ডে স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে।
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bengali">
                  ফুটার ও ড্যাশবোর্ড সিঙ্ক
                </span>
                <Link
                  href="/social"
                  className="btn btn-outline btn-xs font-bengali text-[11px] flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>ফুল পেজে ম্যানেজ করুন →</span>
                </Link>
              </div>
            </div>

            {/* Community Banner Copy */}
            <div className="p-4 bg-surface-secondary/50 rounded-xl border border-border/80 space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-text font-bengali">
                  স্টুডেন্ট ড্যাশবোর্ড কমিউনিটি ব্যানার টেক্সট
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-text-muted font-bengali mb-1">
                    ব্যানার শিরোনাম (Title)
                  </label>
                  <input
                    type="text"
                    value={social.communityTitle || ""}
                    onChange={(e) => setSocial({ ...social, communityTitle: e.target.value })}
                    placeholder="আমাদের অফিশিয়াল কমিউনিটিতে যুক্ত হোন"
                    className="input text-xs font-bengali w-full"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-text-muted font-bengali mb-1">
                    ব্যানার সাবটাইটেল (Description)
                  </label>
                  <input
                    type="text"
                    value={social.communitySubtitle || ""}
                    onChange={(e) => setSocial({ ...social, communitySubtitle: e.target.value })}
                    placeholder="লাইভ ক্লাস নোটিফিকেশন, সরাসরি মেন্টরশিপ..."
                    className="input text-xs font-bengali w-full"
                  />
                </div>
              </div>
            </div>

            {/* Platform Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  key: "facebook" as const,
                  name: "Facebook (ফেসবুক)",
                  icon: FacebookIcon,
                  iconColor: "text-[#1877F2]",
                  bgColor: "bg-[#1877F2]/10 border-[#1877F2]/20",
                  placeholder: "https://facebook.com/ormission",
                  defaultLabel: "ফেসবুক পেজ / গ্রুপ",
                },
                {
                  key: "youtube" as const,
                  name: "YouTube (ইউটিউব)",
                  icon: YouTubeIcon,
                  iconColor: "text-[#FF0000]",
                  bgColor: "bg-[#FF0000]/10 border-[#FF0000]/20",
                  placeholder: "https://youtube.com/@ormission",
                  defaultLabel: "ইউটিউব চ্যানেল",
                },
                {
                  key: "telegram" as const,
                  name: "Telegram (টেলিগ্রাম)",
                  icon: TelegramIcon,
                  iconColor: "text-[#229ED9]",
                  bgColor: "bg-[#229ED9]/10 border-[#229ED9]/20",
                  placeholder: "https://t.me/ormission_community",
                  defaultLabel: "টেলিগ্রাম গ্রুপ ও চ্যানেল",
                },
                {
                  key: "whatsapp" as const,
                  name: "WhatsApp (হোয়াটসঅ্যাপ)",
                  icon: WhatsAppIcon,
                  iconColor: "text-[#25D366]",
                  bgColor: "bg-[#25D366]/10 border-[#25D366]/20",
                  placeholder: "https://wa.me/8801700000000",
                  defaultLabel: "হোয়াটসঅ্যাপ সাপোর্ট",
                },
                {
                  key: "instagram" as const,
                  name: "Instagram (ইনস্টাগ্রাম)",
                  icon: InstagramIcon,
                  iconColor: "text-[#E4405F]",
                  bgColor: "bg-[#E4405F]/10 border-[#E4405F]/20",
                  placeholder: "https://instagram.com/ormission",
                  defaultLabel: "ইনস্টাগ্রাম প্রোফাইল",
                },
                {
                  key: "linkedin" as const,
                  name: "LinkedIn (লিংকডইন)",
                  icon: LinkedInIcon,
                  iconColor: "text-[#0A66C2]",
                  bgColor: "bg-[#0A66C2]/10 border-[#0A66C2]/20",
                  placeholder: "https://linkedin.com/company/ormission",
                  defaultLabel: "লিংকডইন পেজ",
                },
                {
                  key: "twitter" as const,
                  name: "Twitter / X (টুইটার)",
                  icon: TwitterXIcon,
                  iconColor: "text-slate-900 dark:text-white",
                  bgColor: "bg-slate-500/10 border-border",
                  placeholder: "https://twitter.com/ormission",
                  defaultLabel: "টুইটার / X",
                },
                {
                  key: "tiktok" as const,
                  name: "TikTok (টিকটক)",
                  icon: TikTokIcon,
                  iconColor: "text-slate-900 dark:text-white",
                  bgColor: "bg-slate-500/10 border-border",
                  placeholder: "https://tiktok.com/@ormission",
                  defaultLabel: "টিকটক চ্যানেল",
                },
              ].map(({ key, name, icon: Icon, iconColor, bgColor, placeholder, defaultLabel }) => {
                const item = social[key] || { enabled: false, url: "", label: defaultLabel, handle: "" };
                return (
                  <div
                    key={key}
                    className={`rounded-xl border p-4 transition-all ${
                      item.enabled
                        ? "bg-surface border-border shadow-2xs"
                        : "bg-surface-secondary/40 border-border/60 opacity-75"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-border/70">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg ${bgColor} flex items-center justify-center shrink-0 ${iconColor}`}>
                          <Icon size={15} />
                        </div>
                        <span className="text-xs font-bold text-text font-bengali">
                          {name}
                        </span>
                      </div>

                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={item.enabled}
                          onChange={(e) =>
                            setSocial({
                              ...social,
                              [key]: { ...item, enabled: e.target.checked },
                            })
                          }
                          className="w-3.5 h-3.5 text-primary rounded border-border"
                        />
                        <span className={`text-[10px] font-bold font-bengali ${item.enabled ? "text-emerald-600 dark:text-emerald-400" : "text-text-muted"}`}>
                          {item.enabled ? "সক্রিয়" : "বন্ধ"}
                        </span>
                      </label>
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[10px] font-medium text-text-muted font-bengali mb-0.5">
                          লিংক URL (Full Web Link)
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="url"
                            value={item.url || ""}
                            onChange={(e) =>
                              setSocial({
                                ...social,
                                [key]: { ...item, url: e.target.value },
                              })
                            }
                            placeholder={placeholder}
                            className="input text-xs font-mono w-full"
                          />
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="টেস্ট লিংক"
                              className="p-2 rounded-lg bg-surface-secondary border border-border hover:text-primary transition-colors shrink-0"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-medium text-text-muted font-bengali mb-0.5">
                            বাটন লেবেল
                          </label>
                          <input
                            type="text"
                            value={item.label || ""}
                            onChange={(e) =>
                              setSocial({
                                ...social,
                                [key]: { ...item, label: e.target.value },
                              })
                            }
                            placeholder={defaultLabel}
                            className="input text-xs font-bengali w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-medium text-text-muted font-bengali mb-0.5">
                            হ্যান্ডেল / ইউজারনেম
                          </label>
                          <input
                            type="text"
                            value={item.handle || ""}
                            onChange={(e) =>
                              setSocial({
                                ...social,
                                [key]: { ...item, handle: e.target.value },
                              })
                            }
                            placeholder="@ormission"
                            className="input text-xs font-mono w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SSLCommerz Gateway */}
          <div className="bg-surface rounded-xl border border-border p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm text-text font-bengali">
                  SSLCommerz পেমেন্ট গেটওয়ে কনফিগারেশন
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-secondary/10 text-secondary border border-secondary/20">
                bKash · Nagad · Cards
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text font-bengali mb-1">
                  স্টোর আইডি (Store ID)
                </label>
                <input
                  type="text"
                  value={settings.sslStoreId}
                  onChange={(e) => setSettings({ ...settings, sslStoreId: e.target.value })}
                  className="input text-xs font-mono w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text font-bengali mb-1">
                  স্টোর পাসওয়ার্ড / সিক্রেট কি
                </label>
                <input
                  type="password"
                  value={settings.sslSecret}
                  onChange={(e) => setSettings({ ...settings, sslSecret: e.target.value })}
                  className="input text-xs font-mono w-full"
                />
              </div>
            </div>

            <div className="p-3.5 bg-surface-secondary rounded-lg border border-border flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-text font-bengali">
                  স্যান্ডবক্স / টেস্ট মোড (Sandbox Mode)
                </div>
                <div className="text-[11px] text-text-muted font-bengali">
                  সক্রিয় রাখলে ফেক পেমেন্ট সিমুলেশন চলবে। লাইভ চালু করার সময় বন্ধ করুন।
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.isSandbox}
                onChange={(e) => setSettings({ ...settings, isSandbox: e.target.checked })}
                className="w-4 h-4 text-primary rounded border-border"
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary btn-sm font-bengali font-bold flex items-center gap-1.5 px-6 shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "সংরক্ষণ হচ্ছে..." : "সকল সেটিংস সংরক্ষণ করুন"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
