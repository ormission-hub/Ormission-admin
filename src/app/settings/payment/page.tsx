"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  Save,
  CheckCircle2,
  RefreshCw,
  Smartphone,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  Settings2,
  HelpCircle,
  QrCode,
  Flame,
} from "lucide-react";
import Image from "next/image";
import { dbService } from "@/lib/supabase/db-service";

interface WalletConfig {
  enabled: boolean;
  accountType: "merchant" | "personal" | "agent";
  number: string;
  instruction: string;
  qrCodeUrl?: string;
}

interface PaymentSettingsData {
  mode: "automatic" | "manual" | "both";
  bkash: WalletConfig;
  nagad: WalletConfig;
  rocket: WalletConfig;
  sslcommerz: {
    enabled: boolean;
    storeId: string;
    storeSecret: string;
    isSandbox: boolean;
  };
}

const defaultPaymentSettings: PaymentSettingsData = {
  mode: "both",
  bkash: {
    enabled: true,
    accountType: "merchant",
    number: "01700000000",
    instruction: "বিকাশ অ্যাপের 'Payment' অপশনে যান অথবা 'Send Money' করুন। রেফারেন্সে আপনার মোবাইল নম্বর দিন এবং ট্রানজ্যাকশন আইডি (TrxID) সংরক্ষণ করুন।",
    qrCodeUrl: "",
  },
  nagad: {
    enabled: true,
    accountType: "merchant",
    number: "01800000000",
    instruction: "নগদ অ্যাপ থেকে 'মার্চেন্ট পে' অথবা 'সেন্ড মানি' করুন। পেমেন্ট শেষে ট্রানজ্যাকশন আইডি সংরক্ষণ করুন।",
    qrCodeUrl: "",
  },
  rocket: {
    enabled: true,
    accountType: "personal",
    number: "01900000000-9",
    instruction: "ডাচ-বাংলা রকেট ওয়ালেট থেকে সেন্ড মানি করুন এবং সফল লেনদেনের ট্রানজ্যাকশন আইডি ইনপুট দিন।",
    qrCodeUrl: "",
  },
  sslcommerz: {
    enabled: true,
    storeId: "ormission_live",
    storeSecret: "••••••••••••••••",
    isSandbox: true,
  },
};

export default function PaymentSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState<PaymentSettingsData>(defaultPaymentSettings);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const allSettings = await dbService.getSiteSettings();
      if (allSettings.payment_settings) {
        let parsed = allSettings.payment_settings;
        if (typeof parsed === "string") {
          try {
            parsed = JSON.parse(parsed);
          } catch (e) {
            // use default
          }
        }
        setSettings((prev) => ({
          ...prev,
          ...parsed,
          bkash: { ...prev.bkash, ...(parsed.bkash || {}) },
          nagad: { ...prev.nagad, ...(parsed.nagad || {}) },
          rocket: { ...prev.rocket, ...(parsed.rocket || {}) },
          sslcommerz: { ...prev.sslcommerz, ...(parsed.sslcommerz || {}) },
        }));
      }
    } catch (e) {
      console.error("Error loading payment settings:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const ok = await dbService.updateSiteSetting("payment_settings", settings);
      if (ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert("সংরক্ষণ করতে সমস্যা হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("সংরক্ষণ করতে ব্যর্থ হয়েছে");
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-text font-bengali">
                পেমেন্ট মেথড ও ওয়ালেট কনফিগারেশন
              </h1>
              <p className="text-xs text-text-muted font-bengali mt-0.5">
                বিকাশ, নগদ ও রকেটের অফিশিয়াল নম্বর, অ্যাকাউন্ট টাইপ ও শিক্ষার্থীদের নির্দেশনা সেট করুন
              </p>
            </div>
          </div>
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
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs sm:text-sm font-bengali text-emerald-600 dark:text-emerald-400 flex items-center gap-2.5 shadow-xs">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>পেমেন্ট সেটিংস সফলভাবে Supabase ডেটাবেজে সংরক্ষিত হয়েছে! ব্যবহারকারীরা এখন এই তথ্য দেখতে পাবেন।</span>
        </div>
      )}

      {loading ? (
        <div className="bg-surface rounded-2xl border border-border p-12 text-center text-xs text-text-muted font-bengali">
          <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-primary" />
          পেমেন্ট সেটিংস লোড হচ্ছে...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Payment Mode */}
          <div className="bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm sm:text-base text-text font-bengali">
                  পেমেন্ট কালেকশন মোড (Payment Acceptance Mode)
                </h3>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bengali">
                গ্লোবাল রুল
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <label
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  settings.mode === "automatic"
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border hover:border-border/80 bg-surface-secondary/40"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs sm:text-sm text-text font-bengali">
                    ১. অটোমেটিক গেটওয়ে
                  </span>
                  <input
                    type="radio"
                    name="paymentMode"
                    value="automatic"
                    checked={settings.mode === "automatic"}
                    onChange={() => setSettings({ ...settings, mode: "automatic" })}
                    className="text-primary focus:ring-primary"
                  />
                </div>
                <p className="text-[11px] text-text-muted font-bengali leading-relaxed">
                  SSLCommerz অটোমেটেড গেটওয়ের মাধ্যমে তাৎক্ষণিক কার্ড/বিকাশ ডিটেকশন।
                </p>
              </label>

              <label
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  settings.mode === "manual"
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border hover:border-border/80 bg-surface-secondary/40"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs sm:text-sm text-text font-bengali">
                    ২. ম্যানুয়াল মোবাইল ওয়ালেট
                  </span>
                  <input
                    type="radio"
                    name="paymentMode"
                    value="manual"
                    checked={settings.mode === "manual"}
                    onChange={() => setSettings({ ...settings, mode: "manual" })}
                    className="text-primary focus:ring-primary"
                  />
                </div>
                <p className="text-[11px] text-text-muted font-bengali leading-relaxed">
                  অ্যাডমিনের বিকাশ/নগদ/রকেট নম্বরে টাকা পাঠিয়ে TrxID সাবমিট করবে।
                </p>
              </label>

              <label
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  settings.mode === "both"
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border hover:border-border/80 bg-surface-secondary/40"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs sm:text-sm text-text font-bengali">
                    ৩. উভয় মোড (প্রস্তাবিত)
                  </span>
                  <input
                    type="radio"
                    name="paymentMode"
                    value="both"
                    checked={settings.mode === "both"}
                    onChange={() => setSettings({ ...settings, mode: "both" })}
                    className="text-primary focus:ring-primary"
                  />
                </div>
                <p className="text-[11px] text-text-muted font-bengali leading-relaxed">
                  অটোমেটিক গেটওয়ে ও ম্যানুয়াল নম্বর উভয় মাধ্যমই শিক্ষার্থীদের উন্মুক্ত থাকবে।
                </p>
              </label>
            </div>
          </div>

          {/* 1. bKash Settings */}
          <div className="bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-9 px-2.5 py-1 bg-white rounded-lg shadow-2xs border border-slate-200 flex items-center justify-center">
                  <span className="font-black text-sm text-[#E2136E] font-sans tracking-tight">bKash</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-text font-bengali">
                    বিকাশ (bKash) সেটিংস ও নম্বর
                  </h3>
                  <p className="text-[11px] text-text-muted font-bengali">
                    চেকআউট পেজে শিক্ষার্থীর জন্য দৃশ্যমান বিকাশ পেমেন্ট তথ্য
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-text font-bengali">সক্রিয়:</span>
                <input
                  type="checkbox"
                  checked={settings.bkash.enabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      bkash: { ...settings.bkash, enabled: e.target.checked },
                    })
                  }
                  className="w-4 h-4 text-[#E2136E] focus:ring-[#E2136E] rounded"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text font-bengali mb-1.5">
                  বিকাশ অ্যাকাউন্ট টাইপ *
                </label>
                <select
                  value={settings.bkash.accountType}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      bkash: { ...settings.bkash, accountType: e.target.value as any },
                    })
                  }
                  className="input text-xs font-bengali w-full"
                >
                  <option value="merchant">মার্চেন্ট অ্যাকাউন্ট (Payment অপশন)</option>
                  <option value="personal">ব্যক্তিগত অ্যাকাউন্ট (Send Money অপশন)</option>
                  <option value="agent">এজেন্ট অ্যাকাউন্ট (Cash In অপশন)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text font-bengali mb-1.5">
                  বিকাশ নম্বর *
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    placeholder="017XXXXXXXX"
                    value={settings.bkash.number}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        bkash: { ...settings.bkash, number: e.target.value },
                      })
                    }
                    className="input text-xs font-mono font-bold w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(settings.bkash.number, "bkash")}
                    className="absolute right-2.5 text-text-muted hover:text-text cursor-pointer p-1"
                    title="নম্বর কপি করুন"
                  >
                    {copiedKey === "bkash" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-text font-bengali mb-1.5">
                  শিক্ষার্থীদের জন্য পেমেন্ট নির্দেশনা (Instructions)
                </label>
                <textarea
                  rows={2}
                  value={settings.bkash.instruction}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      bkash: { ...settings.bkash, instruction: e.target.value },
                    })
                  }
                  placeholder="বিকাশ অ্যাপে কীভাবে পেমেন্ট করবে তার সহজ নির্দেশনা..."
                  className="input text-xs font-bengali w-full py-2"
                />
              </div>
            </div>
          </div>

          {/* 2. Nagad Settings */}
          <div className="bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-9 px-2.5 py-1 bg-white rounded-lg shadow-2xs border border-slate-200 flex items-center justify-center">
                  <span className="font-black text-sm text-[#F7941D] font-sans tracking-tight">Nagad</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-text font-bengali">
                    নগদ (Nagad) সেটিংস ও নম্বর
                  </h3>
                  <p className="text-[11px] text-text-muted font-bengali">
                    চেকআউট পেজে শিক্ষার্থীর জন্য দৃশ্যমান নগদ পেমেন্ট তথ্য
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-text font-bengali">সক্রিয়:</span>
                <input
                  type="checkbox"
                  checked={settings.nagad.enabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      nagad: { ...settings.nagad, enabled: e.target.checked },
                    })
                  }
                  className="w-4 h-4 text-[#F7941D] focus:ring-[#F7941D] rounded"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text font-bengali mb-1.5">
                  নগদ অ্যাকাউন্ট টাইপ *
                </label>
                <select
                  value={settings.nagad.accountType}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      nagad: { ...settings.nagad, accountType: e.target.value as any },
                    })
                  }
                  className="input text-xs font-bengali w-full"
                >
                  <option value="merchant">মার্চেন্ট অ্যাকাউন্ট (Merchant Pay)</option>
                  <option value="personal">ব্যক্তিগত অ্যাকাউন্ট (Send Money)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text font-bengali mb-1.5">
                  নগদ নম্বর *
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    placeholder="018XXXXXXXX"
                    value={settings.nagad.number}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        nagad: { ...settings.nagad, number: e.target.value },
                      })
                    }
                    className="input text-xs font-mono font-bold w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(settings.nagad.number, "nagad")}
                    className="absolute right-2.5 text-text-muted hover:text-text cursor-pointer p-1"
                    title="নম্বর কপি করুন"
                  >
                    {copiedKey === "nagad" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-text font-bengali mb-1.5">
                  শিক্ষার্থীদের জন্য পেমেন্ট নির্দেশনা (Instructions)
                </label>
                <textarea
                  rows={2}
                  value={settings.nagad.instruction}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      nagad: { ...settings.nagad, instruction: e.target.value },
                    })
                  }
                  placeholder="নগদ অ্যাপ বা *167# ডায়াল করে কীভাবে পেমেন্ট করবে..."
                  className="input text-xs font-bengali w-full py-2"
                />
              </div>
            </div>
          </div>

          {/* 3. Rocket Settings */}
          <div className="bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-9 px-2.5 py-1 bg-white rounded-lg shadow-2xs border border-slate-200 flex items-center justify-center">
                  <span className="font-black text-sm text-[#8C3494] font-sans tracking-tight">Rocket</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-text font-bengali">
                    রকেট (Rocket) সেটিংস ও নম্বর
                  </h3>
                  <p className="text-[11px] text-text-muted font-bengali">
                    ডাচ-বাংলা ব্যাংক মোবাইল ব্যাংকিং রকেট অ্যাকাউন্ট তথ্য
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-text font-bengali">সক্রিয়:</span>
                <input
                  type="checkbox"
                  checked={settings.rocket.enabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      rocket: { ...settings.rocket, enabled: e.target.checked },
                    })
                  }
                  className="w-4 h-4 text-[#8C3494] focus:ring-[#8C3494] rounded"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text font-bengali mb-1.5">
                  রকেট অ্যাকাউন্ট টাইপ *
                </label>
                <select
                  value={settings.rocket.accountType}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      rocket: { ...settings.rocket, accountType: e.target.value as any },
                    })
                  }
                  className="input text-xs font-bengali w-full"
                >
                  <option value="personal">ব্যক্তিগত অ্যাকাউন্ট (Send Money)</option>
                  <option value="merchant">মার্চেন্ট অ্যাকাউন্ট (Merchant Pay)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text font-bengali mb-1.5">
                  রকেট নম্বর (১২ ডিজিট) *
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    placeholder="019XXXXXXXX-X"
                    value={settings.rocket.number}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        rocket: { ...settings.rocket, number: e.target.value },
                      })
                    }
                    className="input text-xs font-mono font-bold w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(settings.rocket.number, "rocket")}
                    className="absolute right-2.5 text-text-muted hover:text-text cursor-pointer p-1"
                    title="নম্বর কপি করুন"
                  >
                    {copiedKey === "rocket" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-text font-bengali mb-1.5">
                  শিক্ষার্থীদের জন্য পেমেন্ট নির্দেশনা (Instructions)
                </label>
                <textarea
                  rows={2}
                  value={settings.rocket.instruction}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      rocket: { ...settings.rocket, instruction: e.target.value },
                    })
                  }
                  placeholder="রকেট অ্যাপ থেকে কীভাবে পেমেন্ট করবে..."
                  className="input text-xs font-bengali w-full py-2"
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary font-bengali font-bold flex items-center gap-2 px-8 py-3 shadow-md hover:shadow-lg active:scale-98 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "ডেটাবেজে সংরক্ষণ হচ্ছে..." : "পেমেন্ট সেটিংস সংরক্ষণ করুন"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
