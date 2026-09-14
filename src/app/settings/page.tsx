"use client";

import { useEffect, useState } from "react";
import { Settings, Save, ShieldCheck, CreditCard, CheckCircle2, RefreshCw, Sparkles, Database } from "lucide-react";
import { dbService } from "@/lib/supabase/db-service";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [settings, setSettings] = useState({
    brandName: "Ormission",
    tagline: "Learn · Build · Grow",
    hotline: "+880 1700-000000",
    whatsapp: "+880 1700-000000",
    email: "info@ormission.com",
    address: "লেভেল ৪, রূপায়ন টাওয়ার, ধানমন্ডি ২৭, ঢাকা-১২০৯",
    sslStoreId: "ormission_live",
    sslSecret: "••••••••••••••••",
    isSandbox: true,
  });

  const loadSettings = async () => {
    setLoading(true);
    const data = await dbService.getSiteSettings();
    setSettings((prev) => ({
      ...prev,
      brandName: data.site_name || prev.brandName,
      tagline: data.site_tagline || prev.tagline,
      email: data.contact_email || prev.email,
      hotline: data.contact_phone || prev.hotline,
      whatsapp: data.contact_whatsapp || prev.whatsapp,
      address: data.contact_address || prev.address,
      sslStoreId: data.ssl_store_id || prev.sslStoreId,
      isSandbox: data.ssl_is_sandbox !== undefined ? data.ssl_is_sandbox : prev.isSandbox,
    }));
    setLoading(false);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await Promise.all([
      dbService.updateSiteSetting("site_name", settings.brandName),
      dbService.updateSiteSetting("site_tagline", settings.tagline),
      dbService.updateSiteSetting("contact_email", settings.email),
      dbService.updateSiteSetting("contact_phone", settings.hotline),
      dbService.updateSiteSetting("contact_whatsapp", settings.whatsapp),
      dbService.updateSiteSetting("contact_address", settings.address),
      dbService.updateSiteSetting("ssl_store_id", settings.sslStoreId),
      dbService.updateSiteSetting("ssl_is_sandbox", settings.isSandbox),
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
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-text font-bengali">
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text font-bengali mb-1">
                  হটলাইন ফোন
                </label>
                <input
                  type="text"
                  value={settings.hotline}
                  onChange={(e) => setSettings({ ...settings, hotline: e.target.value })}
                  className="input text-xs font-mono w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text font-bengali mb-1">
                  হোয়াটসঅ্যাপ (WhatsApp)
                </label>
                <input
                  type="text"
                  value={settings.whatsapp}
                  onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                  className="input text-xs font-mono w-full"
                />
              </div>

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
