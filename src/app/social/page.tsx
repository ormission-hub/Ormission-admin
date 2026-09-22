"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Share2,
  Save,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Globe,
  Sparkles,
  ShieldCheck,
  Radio,
  Eye,
  MessageCircle,
  Users,
  Check,
  Sliders,
} from "lucide-react";
import { dbService } from "@/lib/supabase/db-service";
import {
  FacebookIcon,
  YouTubeIcon,
  TelegramIcon,
  WhatsAppIcon,
  InstagramIcon,
  LinkedInIcon,
  TwitterXIcon,
  TikTokIcon,
} from "@/components/social-icons";

export interface SocialItem {
  enabled: boolean;
  url: string;
  label: string;
  handle?: string;
}

export interface SocialLinksSettings {
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
    url: "https://wa.me/8801700000000",
    label: "হোয়াটসঅ্যাপ সাপোর্ট",
    handle: "+880 1700-000000",
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

const PLATFORMS = [
  {
    key: "facebook" as const,
    name: "Facebook (ফেসবুক)",
    desc: "অফিসিয়াল ফেসবুক পেজ ও লার্নার্স গ্রুপ",
    icon: FacebookIcon,
    brandColor: "#1877F2",
    badgeBg: "bg-[#1877F2]/10 text-[#1877F2] border-[#1877F2]/20",
    placeholder: "https://facebook.com/ormission",
    defaultLabel: "ফেসবুক পেজ",
  },
  {
    key: "youtube" as const,
    name: "YouTube (ইউটিউব)",
    desc: "ফ্রি ক্লাস, গাইডলাইন ও সেমিনার ভিডিও চ্যানেল",
    icon: YouTubeIcon,
    brandColor: "#FF0000",
    badgeBg: "bg-[#FF0000]/10 text-[#FF0000] border-[#FF0000]/20",
    placeholder: "https://youtube.com/@ormission",
    defaultLabel: "ইউটিউব চ্যানেল",
  },
  {
    key: "telegram" as const,
    name: "Telegram (টেলিগ্রাম)",
    desc: "লাইভ ডিসকাশন, ফ্রি নোটস ও স্টাডি গ্রুপ",
    icon: TelegramIcon,
    brandColor: "#229ED9",
    badgeBg: "bg-[#229ED9]/10 text-[#229ED9] border-[#229ED9]/20",
    placeholder: "https://t.me/ormission_community",
    defaultLabel: "টেলিগ্রাম গ্রুপ",
  },
  {
    key: "whatsapp" as const,
    name: "WhatsApp (হোয়াটসঅ্যাপ)",
    desc: "সরাসরি এডমিশন হেল্প ও ইনস্ট্যান্ট সাপোর্ট",
    icon: WhatsAppIcon,
    brandColor: "#25D366",
    badgeBg: "bg-[#25D366]/10 text-[#25D366] border-[#25D366]/20",
    placeholder: "https://wa.me/8801700000000",
    defaultLabel: "হোয়াটসঅ্যাপ সাপোর্ট",
  },
  {
    key: "instagram" as const,
    name: "Instagram (ইনস্টাগ্রাম)",
    desc: "স্টুডেন্ট সাকসেস স্টোরি, রিলস ও পোস্ট",
    icon: InstagramIcon,
    brandColor: "#E4405F",
    badgeBg: "bg-[#E4405F]/10 text-[#E4405F] border-[#E4405F]/20",
    placeholder: "https://instagram.com/ormission",
    defaultLabel: "ইনস্টাগ্রাম",
  },
  {
    key: "linkedin" as const,
    name: "LinkedIn (লিংকডইন)",
    desc: "অফিসিয়াল ক্যারিয়ার ও ইন্সটিটিউট প্রোফাইল",
    icon: LinkedInIcon,
    brandColor: "#0A66C2",
    badgeBg: "bg-[#0A66C2]/10 text-[#0A66C2] border-[#0A66C2]/20",
    placeholder: "https://linkedin.com/company/ormission",
    defaultLabel: "লিংকডইন",
  },
  {
    key: "twitter" as const,
    name: "Twitter / X (টুইটার)",
    desc: "দ্রুত নোটিশ ও অফিসিয়াল অ্যানাউন্সমেন্ট",
    icon: TwitterXIcon,
    brandColor: "#000000",
    badgeBg: "bg-slate-500/10 text-slate-700 dark:text-slate-200 border-slate-500/20",
    placeholder: "https://twitter.com/ormission",
    defaultLabel: "টুইটার / X",
  },
  {
    key: "tiktok" as const,
    name: "TikTok (টিকটক)",
    desc: "শর্ট টিপস, স্টাডি ট্রিকস ও মোটিভেশন",
    icon: TikTokIcon,
    brandColor: "#EE1D52",
    badgeBg: "bg-[#EE1D52]/10 text-[#EE1D52] border-[#EE1D52]/20",
    placeholder: "https://tiktok.com/@ormission",
    defaultLabel: "টিকটক",
  },
];

export default function SocialLinksAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [social, setSocial] = useState<SocialLinksSettings>(defaultSocialSettings);
  const [previewTab, setPreviewTab] = useState<"footer" | "dashboard">("footer");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    try {
      const allSettings = await dbService.getSiteSettings();
      if (allSettings && allSettings.social_links) {
        const parsed =
          typeof allSettings.social_links === "string"
            ? JSON.parse(allSettings.social_links)
            : allSettings.social_links;

        setSocial({
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
        });
      }
    } catch (e) {
      console.error("Failed to load social settings:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const ok = await dbService.updateSiteSetting("social_links", social);
      if (ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 4000);
      } else {
        alert("লিংক সংরক্ষণ ব্যর্থ হয়েছে। দয়া করে আবার চেষ্টা করুন।");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Error saving settings");
    } finally {
      setSaving(false);
    }
  }

  const togglePlatform = (key: keyof typeof defaultSocialSettings) => {
    if (key === "communityTitle" || key === "communitySubtitle") return;
    setSocial((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        enabled: !prev[key].enabled,
      },
    }));
  };

  const updatePlatformUrl = (key: keyof typeof defaultSocialSettings, url: string) => {
    if (key === "communityTitle" || key === "communitySubtitle") return;
    setSocial((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        url,
      },
    }));
  };

  const updatePlatformHandle = (key: keyof typeof defaultSocialSettings, handle: string) => {
    if (key === "communityTitle" || key === "communitySubtitle") return;
    setSocial((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        handle,
      },
    }));
  };

  const activeCount = PLATFORMS.filter((p) => social[p.key]?.enabled && social[p.key]?.url?.trim()).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <h1 className="text-lg sm:text-2xl font-bold text-text font-bengali">
              সোশ্যাল মিডিয়া ও কমিউনিটি লিংক
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-sans">
              {activeCount} Active Channels
            </span>
          </div>
          <p className="text-xs text-text-muted font-bengali">
            এখানে যুক্ত লিংকসমূহ স্বয়ংক্রিয়ভাবে মূল ওয়েবসাইটের ফুটার এবং স্টুডেন্টদের ড্যাশবোর্ডে প্রদর্শিত হবে।
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={loadSettings}
            disabled={loading}
            className="btn btn-outline btn-sm font-bengali text-xs flex items-center gap-1.5"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
            <span className="hidden sm:inline">রিফ্রেশ</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="btn btn-primary btn-sm font-bengali font-bold flex items-center gap-1.5 shadow-md shadow-primary/20"
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>সংরক্ষণ হচ্ছে...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>পরিবর্তন সংরক্ষণ করুন</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {saved && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs sm:text-sm font-bengali text-emerald-600 dark:text-emerald-400 flex items-center gap-2.5 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
          <div className="flex-1">
            <span className="font-bold">সফলভাবে সংরক্ষিত হয়েছে!</span>{" "}
            সোশ্যাল মিডিয়া ও কমিউনিটি লিঙ্কসমূহ আপডেট হয়ে গেছে। ওয়েবসাইট ফুটার এবং স্টুডেন্ট ড্যাশবোর্ডে এগুলো লাইভ দেখা যাচ্ছে।
          </div>
        </div>
      )}

      {/* Sync Status Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-blue-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-md shadow-primary/25">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-text font-bengali">
                ফুটার ও ড্যাশবোর্ড লাইভ সিঙ্ক অ্যাক্টিভ
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-500 border border-emerald-500/25">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync
              </span>
            </div>
            <p className="text-[11px] text-text-muted font-bengali mt-0.5">
              যে চ্যানেলগুলো আপনি <span className="text-emerald-600 dark:text-emerald-400 font-bold">ON</span> করে রাখবেন শুধুমাত্র সেগুলোই স্টুডেন্টদের সামনে দৃশ্যমান হবে।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <Link
            href="/"
            target="_blank"
            className="btn btn-outline btn-xs font-bengali text-[11px] flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            <span>লাইভ ফুটার দেখুন</span>
          </Link>
        </div>
      </div>

      {/* Community Banner Copy Settings */}
      <div className="bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-border">
          <Users className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-text font-bengali">
            স্টুডেন্ট ড্যাশবোর্ড কমিউনিটি ব্যানার কন্টেন্ট
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-text font-bengali mb-1.5">
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
            <label className="block text-xs font-semibold text-text font-bengali mb-1.5">
              ব্যানার সাবটাইটেল (Description)
            </label>
            <input
              type="text"
              value={social.communitySubtitle || ""}
              onChange={(e) => setSocial({ ...social, communitySubtitle: e.target.value })}
              placeholder="যেকোনো আপডেট, লাইভ ক্লাস অ্যালার্ট এবং সরাসরি মেন্টর সাপোর্টের জন্য..."
              className="input text-xs font-bengali w-full"
            />
          </div>
        </div>
      </div>

      {/* Platforms Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-text font-bengali">
              সকল সোশ্যাল মিডিয়া চ্যানেল কনফিগারেশন ({PLATFORMS.length})
            </h2>
          </div>
          <span className="text-[11px] text-text-muted font-bengali">
            টগল করে অন/অফ করুন
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PLATFORMS.map((platform) => {
            const item = social[platform.key] || {
              enabled: false,
              url: "",
              label: platform.defaultLabel,
              handle: "",
            };
            const Icon = platform.icon;
            const isEnabled = !!item.enabled;
            const hasValidUrl = item.url && item.url.trim().length > 0;

            return (
              <div
                key={platform.key}
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-4 shadow-xs ${
                  isEnabled
                    ? "bg-surface border-border hover:border-primary/40"
                    : "bg-surface/50 border-dashed border-border/70 opacity-70"
                }`}
              >
                {/* Card Top: Icon, Name & Toggle Switch */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs border"
                      style={{
                        backgroundColor: isEnabled ? `${platform.brandColor}15` : undefined,
                        borderColor: isEnabled ? `${platform.brandColor}30` : undefined,
                        color: platform.brandColor,
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-text font-sans">
                          {platform.name}
                        </span>
                        {isEnabled ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bengali">
                            সক্রিয়
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-500 border border-slate-500/20 font-bengali">
                            বন্ধ
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-text-muted font-bengali mt-0.5">
                        {platform.desc}
                      </p>
                    </div>
                  </div>

                  {/* Big ON/OFF Switch */}
                  <button
                    type="button"
                    onClick={() => togglePlatform(platform.key)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      isEnabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                    role="switch"
                    aria-checked={isEnabled}
                    title={isEnabled ? "বন্ধ করুন (Turn OFF)" : "চালু করুন (Turn ON)"}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        isEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Form Fields: URL & Handle */}
                <div className="space-y-2.5 pt-2 border-t border-border/60">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-text font-bengali">
                        চ্যানেল বা পেজ লিংক (URL) *
                      </label>
                      {hasValidUrl && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-primary font-bold hover:underline inline-flex items-center gap-1"
                        >
                          <span>লিংক টেস্ট করুন</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                    <input
                      type="url"
                      value={item.url || ""}
                      onChange={(e) => updatePlatformUrl(platform.key, e.target.value)}
                      placeholder={platform.placeholder}
                      className="input text-xs font-mono w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-text-muted font-bengali mb-1">
                      হ্যান্ডেল বা লেবেল (যেমন: @ormission)
                    </label>
                    <input
                      type="text"
                      value={item.handle || ""}
                      onChange={(e) => updatePlatformHandle(platform.key, e.target.value)}
                      placeholder={platform.defaultLabel}
                      className="input text-xs font-bengali w-full"
                    />
                  </div>
                </div>

                {/* Status Footer */}
                <div className="flex items-center justify-between text-[11px] pt-2 text-text-muted font-bengali">
                  <span>
                    ফুটার স্ট্যাটাস:{" "}
                    <strong className={isEnabled && hasValidUrl ? "text-emerald-600 dark:text-emerald-400" : "text-amber-500"}>
                      {isEnabled && hasValidUrl ? "প্রদর্শিত হবে ✓" : isEnabled ? "URL দিন" : "লুকানো থাকবে"}
                    </strong>
                  </span>
                  <span className="text-[10px] text-text-muted/60 font-mono uppercase">
                    key: {platform.key}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Preview Section */}
      <div className="bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-text font-bengali">
              লাইভ প্রিভিউ (ওয়েবসাইটে কেমন দেখাবে)
            </h2>
          </div>

          <div className="flex items-center gap-1 bg-surface-secondary p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setPreviewTab("footer")}
              className={`px-3 py-1 text-xs font-bold font-bengali rounded-lg transition-all ${
                previewTab === "footer"
                  ? "bg-surface text-primary shadow-xs"
                  : "text-text-muted hover:text-text"
              }`}
            >
              ফুটার আইকনস
            </button>
            <button
              type="button"
              onClick={() => setPreviewTab("dashboard")}
              className={`px-3 py-1 text-xs font-bold font-bengali rounded-lg transition-all ${
                previewTab === "dashboard"
                  ? "bg-surface text-primary shadow-xs"
                  : "text-text-muted hover:text-text"
              }`}
            >
              স্টুডেন্ট ড্যাশবোর্ড কার্ড
            </button>
          </div>
        </div>

        {/* Tab 1: Footer Live Mockup */}
        {previewTab === "footer" && (
          <div className="p-6 rounded-2xl bg-[#0B132B] text-slate-100 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-sm font-extrabold tracking-wide uppercase">
                  ORM<span className="text-blue-500">ISSION</span>
                </div>
                <p className="text-xs text-slate-400 font-bengali mt-1">
                  অরমিশন - বাংলাদেশের অন্যতম সেরা অনলাইন লার্নিং প্ল্যাটফর্ম
                </p>
              </div>

              {/* Active Social Icon Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {PLATFORMS.filter((p) => social[p.key]?.enabled && social[p.key]?.url?.trim()).map((platform) => {
                  const Icon = platform.icon;
                  const item = social[platform.key];
                  return (
                    <a
                      key={platform.key}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all bg-slate-800 hover:bg-slate-700 text-slate-200 hover:scale-110 shadow-xs"
                      style={{
                        color: platform.brandColor,
                      }}
                      title={item.label || platform.name}
                    >
                      <Icon size={18} />
                    </a>
                  );
                })}
              </div>
            </div>
            <div className="pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-500">
              © {new Date().getFullYear()} Ormission. সর্বস্বত্ব সংরক্ষিত।
            </div>
          </div>
        )}

        {/* Tab 2: Dashboard Banner Mockup */}
        {previewTab === "dashboard" && (
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0B132B] via-[#101D42] to-[#0D1B2A] text-white border border-blue-500/20 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold tracking-wider uppercase text-blue-400 flex items-center gap-1.5 font-bengali">
                  <Sparkles className="w-3.5 h-3.5" />
                  কমিউনিটি কানেক্ট
                </span>
                <h3 className="text-lg font-bold font-bengali text-white">
                  {social.communityTitle || defaultSocialSettings.communityTitle}
                </h3>
                <p className="text-xs text-slate-300 font-bengali max-w-xl leading-relaxed">
                  {social.communitySubtitle || defaultSocialSettings.communitySubtitle}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {social.telegram?.enabled && social.telegram?.url && (
                  <a
                    href={social.telegram.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl text-xs font-bold font-bengali text-white bg-[#229ED9] hover:bg-[#1f8fc4] shadow-md shadow-[#229ED9]/25 flex items-center gap-1.5 transition-all"
                  >
                    <TelegramIcon size={16} />
                    <span>টেলিগ্রাম গ্রুপ</span>
                  </a>
                )}
                {social.facebook?.enabled && social.facebook?.url && (
                  <a
                    href={social.facebook.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl text-xs font-bold font-bengali text-white bg-[#1877F2] hover:bg-[#166fe5] shadow-md shadow-[#1877F2]/25 flex items-center gap-1.5 transition-all"
                  >
                    <FacebookIcon size={16} />
                    <span>ফেসবুক পেজ</span>
                  </a>
                )}
                {social.whatsapp?.enabled && social.whatsapp?.url && (
                  <a
                    href={social.whatsapp.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl text-xs font-bold font-bengali text-white bg-[#25D366] hover:bg-[#20bd5a] shadow-md shadow-[#25D366]/25 flex items-center gap-1.5 transition-all"
                  >
                    <WhatsAppIcon size={16} />
                    <span>হোয়াটসঅ্যাপ</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sticky Save Floating Bar for Ease of Use */}
      <div className="sticky bottom-4 z-20 bg-surface/95 backdrop-blur-md p-4 rounded-2xl border border-border shadow-lg flex items-center justify-between gap-4">
        <div className="text-xs font-bengali text-text-muted hidden sm:block">
          সব পরিবর্তন শেষে সংরক্ষণ বাটনে ক্লিক করুন যাতে পরিবর্তনসমূহ লাইভ হয়ে যায়।
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={loadSettings}
            disabled={loading}
            className="btn btn-outline btn-sm font-bengali text-xs"
          >
            বাতিল / রিলোড
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="btn btn-primary btn-sm font-bengali font-bold flex items-center gap-1.5 shadow-md shadow-primary/20 px-6"
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>সংরক্ষণ হচ্ছে...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>পরিবর্তন সংরক্ষণ করুন</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
