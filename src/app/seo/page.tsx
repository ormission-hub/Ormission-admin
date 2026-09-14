"use client";

import { useEffect, useState } from "react";
import { Search, Save, Globe, CheckCircle2, RefreshCw } from "lucide-react";
import { dbService } from "@/lib/supabase/db-service";

export default function AdminSEOPage() {
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [seo, setSeo] = useState({
    siteTitle: "Ormission — Learn · Build · Grow",
    metaDescription: "দেশসেরা শিক্ষক ও মেন্টরদের পরিচালিত এইচএসসি ও বিশ্ববিদ্যালয় ভর্তি প্রস্তুতির নির্ভরযোগ্য অনলাইন প্ল্যাটফর্ম।",
    googleConsole: "",
    ga4Id: "",
    fbPixelId: "",
  });

  useEffect(() => {
    dbService.getSiteSettings().then((settings) => {
      setSeo({
        siteTitle: settings.seo_title || "Ormission — Learn · Build · Grow",
        metaDescription: settings.seo_description || "দেশসেরা শিক্ষক ও মেন্টরদের পরিচালিত এইচএসসি ও বিশ্ববিদ্যালয় ভর্তি প্রস্তুতির নির্ভরযোগ্য অনলাইন প্ল্যাটফর্ম।",
        googleConsole: settings.seo_google_console || "",
        ga4Id: settings.analytics_ga4_id || "",
        fbPixelId: settings.analytics_fb_pixel || "",
      });
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await Promise.all([
      dbService.updateSiteSetting("seo_title", seo.siteTitle),
      dbService.updateSiteSetting("seo_description", seo.metaDescription),
      dbService.updateSiteSetting("seo_google_console", seo.googleConsole),
      dbService.updateSiteSetting("analytics_ga4_id", seo.ga4Id),
      dbService.updateSiteSetting("analytics_fb_pixel", seo.fbPixelId),
    ]);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-text font-bengali">
              সার্চ ইঞ্জিন অপটিমাইজেশন (SEO) সেটিংস
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
              Supabase Settings
            </span>
          </div>
          <p className="text-xs text-text-muted font-bengali mt-0.5">
            গুগল সার্চ ও সামাজিক মাধ্যমে সাইটের দৃশ্যমানতা, মেটাডাটা ও ট্র্যাকিং পিক্সেল
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-3.5 bg-success/10 border border-success/20 rounded-xl text-xs font-bengali text-success flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>SEO সেটিংস সফলভাবে Supabase ডাটাবেজে সংরক্ষিত হয়েছে!</span>
        </div>
      )}

      {loading ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center text-xs text-text-muted font-bengali">
          <RefreshCw className="w-5 h-5 mx-auto mb-2 animate-spin text-primary" />
          সেটিংস লোড হচ্ছে...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-surface rounded-xl border border-border p-6 shadow-xs space-y-5">
          <div>
            <label className="block text-xs font-semibold text-text font-bengali mb-1.5">
              গ্লোবাল সাইট শিরোনাম (Default Meta Title) *
            </label>
            <input
              type="text"
              required
              value={seo.siteTitle}
              onChange={(e) => setSeo({ ...seo, siteTitle: e.target.value })}
              className="input text-xs font-bengali w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text font-bengali mb-1.5">
              গ্লোবাল মেটা বিবরণী (Meta Description) *
            </label>
            <textarea
              rows={3}
              required
              value={seo.metaDescription}
              onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
              className="input text-xs font-bengali w-full py-2"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text font-bengali mb-1.5">
                Google Search Console Verification Tag
              </label>
              <input
                type="text"
                placeholder="google-site-verification=XXXXXXXXXXXX"
                value={seo.googleConsole}
                onChange={(e) => setSeo({ ...seo, googleConsole: e.target.value })}
                className="input text-xs font-mono w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text font-bengali mb-1.5">
                Google Analytics 4 (GA4 Measurement ID)
              </label>
              <input
                type="text"
                placeholder="G-XXXXXXXXXX"
                value={seo.ga4Id}
                onChange={(e) => setSeo({ ...seo, ga4Id: e.target.value })}
                className="input text-xs font-mono w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text font-bengali mb-1.5">
              Meta / Facebook Pixel ID
            </label>
            <input
              type="text"
              placeholder="XXXXXXXXXXXXXXXX"
              value={seo.fbPixelId}
              onChange={(e) => setSeo({ ...seo, fbPixelId: e.target.value })}
              className="input text-xs font-mono w-full"
            />
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-border">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary btn-sm font-bengali font-bold flex items-center gap-1.5 px-6 shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "সংরক্ষণ হচ্ছে..." : "সেটিংস সংরক্ষণ করুন"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
