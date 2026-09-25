"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);

  // If already logged in as admin, redirect to dashboard
  useEffect(() => {
    async function checkExisting() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Check role in profiles
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .maybeSingle();

          if (profile?.role === "admin" || session.user.email?.includes("admin") || session.user.email === "ohidrashed0@gmail.com" || session.user.email === "anas226788@gmail.com") {
            router.replace("/");
            return;
          }
        }
      } catch (err) {
        console.warn("Session check error:", err);
      } finally {
        setCheckingSession(false);
      }
    }
    checkExisting();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const cleanEmail = email.trim();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setErrorMsg("ভুল ইমেইল বা পাসওয়ার্ড দেওয়া হয়েছে। দয়া করে সঠিক তথ্য দিন।");
        } else if (error.message.includes("Email not confirmed")) {
          setErrorMsg("ইমেইল ভেরিফাই করা নেই। দয়া করে অ্যাডমিন ইমেইল চেক করুন।");
        } else {
          setErrorMsg(error.message || "লগইন করতে সমস্যা হচ্ছে। আবার চেষ্টা করুন।");
        }
        setLoading(false);
        return;
      }

      if (!data.user) {
        setErrorMsg("ব্যবহারকারী খুঁজে পাওয়া যায়নি।");
        setLoading(false);
        return;
      }

      // Verify admin role in profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", data.user.id)
        .maybeSingle();

      const isAdmin = profile?.role === "admin" ||
        data.user.email === "admin@ormission.com" ||
        data.user.email === "ohidrashed0@gmail.com" ||
        data.user.email === "anas226788@gmail.com" ||
        data.user.email === "moirashed0@gmail.com";

      if (!isAdmin) {
        // Sign out unauthorized user
        await supabase.auth.signOut();
        setErrorMsg("আপনার এই অ্যাডমিন প্যানেলে প্রবেশের অনুমতি নেই। এটি শুধুমাত্র অনুমোদিত অ্যাডমিনদের জন্য।");
        setLoading(false);
        return;
      }

      // Successful login
      router.replace("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "লগইন ব্যর্থ হয়েছে";
      setErrorMsg(msg);
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="text-xs text-slate-400 font-bengali">অ্যাডমিন সেশন যাচাই করা হচ্ছে...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-[#012c94] to-primary/40 border border-blue-500/30 shadow-xl shadow-blue-950/50 mb-3">
            <Image
              src="/images/brand-logo-v2.png"
              alt="Ormission"
              width={48}
              height={48}
              className="w-12 h-12 object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-bengali">
            ORMISSION অ্যাডমিন পোর্টাল
          </h1>
          <p className="text-xs text-slate-400 font-bengali">
            প্ল্যাটফর্ম পরিচালনা করতে আপনার অ্যাডমিন ক্রেডেনশিয়াল দিয়ে প্রবেশ করুন
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-xs text-rose-400 font-bengali animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div className="flex-1 leading-snug">{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 font-bengali">
                অ্যাডমিন ইমেইল
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ormission.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-sans"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 font-bengali">
                পাসওয়ার্ড
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-primary to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white text-xs font-bold font-bengali shadow-lg shadow-primary/25 transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>যাচাই করা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <span>লগইন করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-500 font-bengali">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>সুরক্ষিত Supabase OAuth 2.0 ও RBAC প্রটেকশন</span>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-600 font-bengali mt-6">
          © {new Date().getFullYear()} Ormission Education. সর্বস্বত্ব সংরক্ষিত।
        </p>
      </div>
    </div>
  );
}
