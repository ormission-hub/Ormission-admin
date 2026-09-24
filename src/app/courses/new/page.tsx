"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Plus,
  Trash2,
  Save,
  Video,
  FileDown,
  Layers,
  Sparkles,
  RefreshCw,
  Upload,
  CloudUpload,
  Image as ImageIcon,
  Tag,
  FileText,
  Eye,
  X,
  Play,
  Check,
  Users,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Star,
  GraduationCap,
  ListChecks,
} from "lucide-react";
import { dbService, type DbCategory, type DbInstructor } from "@/lib/supabase/db-service";
import { LessonMaterialsManager, type LessonMaterialItem } from "@/components/lesson-materials-manager";

interface NewLesson {
  id: string;
  titleBn: string;
  duration: string;
  videoUrl: string;
  isFreePreview: boolean;
  materials?: LessonMaterialItem[];
}

interface NewSection {
  id: string;
  titleBn: string;
  lessons: NewLesson[];
}

export default function CreateCourseWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast Notification State
  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    title: string;
    message: string;
  } | null>(null);

  const showToast = (type: "success" | "error" | "info", title: string, message: string) => {
    setToast({ show: true, type, title, message });
    if (type === "success") {
      setTimeout(() => {
        setToast((prev) => (prev?.title === title ? null : prev));
      }, 6000);
    }
  };

  // Lists from DB
  const [categoriesList, setCategoriesList] = useState<DbCategory[]>([]);
  const [instructorsList, setInstructorsList] = useState<DbInstructor[]>([]);
  const [isLoadingLists, setIsLoadingLists] = useState(true);

  // Device upload state
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activeThumbTab, setActiveThumbTab] = useState<"device" | "url">("device");

  // Step 1: Basic Info
  const [basicInfo, setBasicInfo] = useState({
    titleBn: "",
    titleEn: "",
    subtitleBn: "",
    categorySlug: "",
    instructorId: "",
    instructorIds: [] as string[],
    level: "Intermediate",
    badge: "নতুন ব্যাচ",
    initialEnrolled: "0",
    showRating: true,
    ratingScore: "5.0",
    reviewsCount: "125",
    prerequisites: [] as string[],
  });

  // Prerequisites input state
  const [newPrerequisiteInput, setNewPrerequisiteInput] = useState("");

  // Step 2: Pricing
  const [pricing, setPricing] = useState({
    originalPrice: "3500",
    discountPrice: "1999",
    offerTag: "সীমিত সময়ের বিশেষ অফার",
  });

  // Step 3: Media
  const [media, setMedia] = useState({
    thumbnailUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
    previewVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    durationHours: "45",
  });

  // Step 4: Curriculum
  const [curriculum, setCurriculum] = useState<NewSection[]>([
    {
      id: "sec-1",
      titleBn: "অধ্যায় ১: মৌলিক ধারণা ও ভিত্তি তৈরি",
      lessons: [
        {
          id: "les-1",
          titleBn: "কোর্স পরিচিতি ও প্রস্তুতি কৌশল",
          duration: "20:00",
          videoUrl: "https://www.youtube.com/embed/M7lc1UVf-VE",
          isFreePreview: true,
          materials: [],
        },
      ],
    },
  ]);

  // Step 5: SEO & Publishing
  const [seo, setSeo] = useState({
    metaTitle: "",
    metaDescription: "",
    isPublished: true,
  });

  useEffect(() => {
    setIsLoadingLists(true);
    Promise.all([dbService.getCategories(), dbService.getInstructors()])
      .then(([cats, insts]) => {
        setCategoriesList(cats);
        setInstructorsList(insts);
        if (cats.length > 0) {
          setBasicInfo((prev) => ({ ...prev, categorySlug: cats[0].id.toString() }));
        }
        if (insts.length > 0) {
          setBasicInfo((prev) => ({
            ...prev,
            instructorId: insts[0].id.toString(),
            instructorIds: [insts[0].id.toString()],
          }));
        }
      })
      .finally(() => {
        setIsLoadingLists(false);
      });
  }, []);

  const toggleInstructor = (instId: string) => {
    setBasicInfo((prev) => {
      const exists = prev.instructorIds.includes(instId);
      const nextIds = exists
        ? prev.instructorIds.filter((id) => id !== instId)
        : [...prev.instructorIds, instId];
      return {
        ...prev,
        instructorIds: nextIds,
        instructorId: nextIds[0] || "",
      };
    });
  };

  // Handle direct device file upload
  const handleDeviceFileUpload = async (file: File) => {
    if (!file) return;

    const validMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validMimes.includes(file.type)) {
      setUploadError("শুধুমাত্র JPG, PNG বা WEBP ফরম্যাটের ছবি আপলোড করুন।");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setUploadError("ছবির সাইজ সর্বোচ্চ ৮ মেগাবাইট হতে পারবে।");
      return;
    }

    setUploadError(null);
    setIsUploadingThumb(true);
    setUploadProgress(25);

    try {
      const formData = new FormData();
      formData.append("file", file);

      setUploadProgress(60);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setUploadProgress(90);

      if (!res.ok || !data.success || !data.url) {
        throw new Error(data.error || "আপলোড ব্যর্থ হয়েছে।");
      }

      setUploadProgress(100);
      setMedia((prev) => ({ ...prev, thumbnailUrl: data.url }));
      showToast("success", "ছবি আপলোড সম্পন্ন", "কোর্সের থাম্বনেইল সফলভাবে আপলোড হয়েছে।");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "আপলোড ব্যর্থ হয়েছে";
      setUploadError(msg);
      showToast("error", "আপলোড ত্রুটি", msg);
    } finally {
      setIsUploadingThumb(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const addSection = () => {
    const newId = `sec-${Date.now()}`;
    setCurriculum((prev) => [
      ...prev,
      {
        id: newId,
        titleBn: `অধ্যায় ${prev.length + 1}: নতুন অধ্যায়`,
        lessons: [
          {
            id: `les-${Date.now()}`,
            titleBn: "প্রথম লেসন",
            duration: "30:00",
            videoUrl: "",
            isFreePreview: false,
          },
        ],
      },
    ]);
  };

  const removeSection = (secId: string) => {
    if (curriculum.length <= 1) {
      showToast("error", "মুছে ফেলা সম্ভব নয়", "কমপক্ষে একটি অধ্যায় অবশ্যই থাকতে হবে।");
      return;
    }
    setCurriculum((prev) => prev.filter((s) => s.id !== secId));
    showToast("info", "অধ্যায় সরানো হয়েছে", "অধ্যায়টি কারিকুলাম থেকে অপসারিত হয়েছে।");
  };

  const addLesson = (secId: string) => {
    setCurriculum((prev) =>
      prev.map((sec) => {
        if (sec.id === secId) {
          return {
            ...sec,
            lessons: [
              ...sec.lessons,
              {
                id: `les-${Date.now()}`,
                titleBn: `নতুন ক্লাস ${sec.lessons.length + 1}`,
                duration: "30:00",
                videoUrl: "",
                isFreePreview: false,
                materials: [],
              },
            ],
          };
        }
        return sec;
      })
    );
  };

  const removeLesson = (secId: string, lesId: string) => {
    setCurriculum((prev) =>
      prev.map((sec) => {
        if (sec.id === secId) {
          if (sec.lessons.length <= 1) {
            showToast("error", "মুছে ফেলা সম্ভব নয়", "প্রতিটি অধ্যায়ে কমপক্ষে একটি ক্লাস থাকতে হবে।");
            return sec;
          }
          return {
            ...sec,
            lessons: sec.lessons.filter((l) => l.id !== lesId),
          };
        }
        return sec;
      })
    );
  };

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!basicInfo.titleBn.trim()) {
      showToast("error", "কোর্সের নাম আবশ্যক", "অনুগ্রহ করে ধাপ ১-এ গিয়ে কোর্সের পূর্ণ নাম (বাংলায়) লিখুন।");
      setCurrentStep(1);
      return;
    }

    if (curriculum.length === 0) {
      showToast("error", "কারিকুলাম আবশ্যক", "কোর্সে কমপক্ষে একটি অধ্যায় থাকতে হবে।");
      setCurrentStep(4);
      return;
    }

    for (let i = 0; i < curriculum.length; i++) {
      const sec = curriculum[i];
      if (!sec.titleBn.trim()) {
        showToast("error", "অধ্যায়ের নাম আবশ্যক", `অধ্যায় ${i + 1}-এর নাম লিখুন।`);
        setCurrentStep(4);
        return;
      }
      if (!sec.lessons || sec.lessons.length === 0) {
        showToast("error", "ক্লাস আবশ্যক", `'${sec.titleBn}' অধ্যায়ে কমপক্ষে একটি ক্লাস যোগ করুন।`);
        setCurrentStep(4);
        return;
      }
      for (let j = 0; j < sec.lessons.length; j++) {
        const les = sec.lessons[j];
        if (!les.titleBn.trim()) {
          showToast(
            "error",
            "ক্লাসের নাম আবশ্যক",
            `'${sec.titleBn}' অধ্যায়ের ${j + 1} নম্বর ক্লাসের নাম লিখুন।`
          );
          setCurrentStep(4);
          return;
        }
      }
    }

    setSaved(true);
    try {
      const slug = basicInfo.titleEn
        ? basicInfo.titleEn
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
        : `course-${Date.now()}`;

      const selectedInstIds = (basicInfo.instructorIds || []).map(Number).filter((n) => !isNaN(n) && n > 0);
      const primaryInstId = selectedInstIds[0] || (basicInfo.instructorId ? Number(basicInfo.instructorId) : null);

      const res = await dbService.createCourse({
        title: basicInfo.titleEn || basicInfo.titleBn,
        title_bn: basicInfo.titleBn,
        slug: slug,
        short_description: basicInfo.subtitleBn,
        category_id: Number(basicInfo.categorySlug) || null,
        instructor_id: primaryInstId,
        instructor_ids: selectedInstIds,
        price: Number(pricing.discountPrice) || 0,
        original_price: Number(pricing.originalPrice) || 0,
        is_free: Number(pricing.discountPrice) === 0,
        thumbnail_url: media.thumbnailUrl,
        status: seo.isPublished ? "published" : "draft",
        total_lessons: curriculum.reduce((acc, s) => acc + s.lessons.length, 0),
        total_duration: (Number(media.durationHours) || 40) * 60,
        enrollment_count: Number(basicInfo.initialEnrolled) || 0,
        is_featured: false,
        features: {
          rating: Number(basicInfo.ratingScore) || 5.0,
          reviews_count: Number(basicInfo.reviewsCount) || 125,
          show_rating: basicInfo.showRating,
          instructor_ids: selectedInstIds,
          prerequisites: basicInfo.prerequisites.filter((p) => p.trim().length > 0),
        },
        curriculum: curriculum,
      } as any);

      if (res) {
        showToast(
          "success",
          "কোর্স তৈরি সফল!",
          "নতুন কোর্সটি এবং এর সকল ক্লাস কারিকুলাম সফলভাবে তৈরি হয়েছে। রিডাইরেক্ট করা হচ্ছে..."
        );
        setTimeout(() => {
          router.push("/courses");
        }, 1500);
      } else {
        showToast("error", "সংরক্ষণ ব্যর্থ", "কোর্স ডাটাবেজে সংরক্ষণ করা যায়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।");
        setSaved(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "সংরক্ষণ ব্যর্থ হয়েছে";
      alert("ত্রুটি: " + msg);
      setSaved(false);
    }
  };

  const steps = [
    { num: 1, title: "প্রাথমিক তথ্য", icon: FileText, desc: "নাম, ক্যাটাগরি ও মেন্টর" },
    { num: 2, title: "মূল্য ও অফার", icon: Tag, desc: "রেগুলার ও ডিসকাউন্ট ফি" },
    { num: 3, title: "মিডিয়া ও ব্যানার", icon: ImageIcon, desc: "ডিভাইস থাম্বনেইল ও ভিডিও" },
    { num: 4, title: "কারিকুলাম ও লেসন", icon: Layers, desc: "অধ্যায় ও ক্লাস বিন্যাস" },
    { num: 5, title: "এসইও ও প্রকাশনা", icon: Sparkles, desc: "সার্চ ইঞ্জিন ও স্ট্যাটাস" },
  ];

  // Selected Category & Instructor for Live Preview
  const selectedCatObj = categoriesList.find((c) => c.id.toString() === basicInfo.categorySlug);
  const selectedInstObj = instructorsList.find((i) => i.id.toString() === basicInfo.instructorId);

  const discountPercent =
    Number(pricing.originalPrice) > Number(pricing.discountPrice) && Number(pricing.originalPrice) > 0
      ? Math.round(
          ((Number(pricing.originalPrice) - Number(pricing.discountPrice)) /
            Number(pricing.originalPrice)) *
            100
        )
      : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 font-bengali">
      {/* Toast Notification */}
      {toast && toast.show && (
        <div
          role="alert"
          aria-live="assertive"
          className={`fixed top-5 right-5 z-50 max-w-md w-full p-4 rounded-xl shadow-2xl border flex items-start gap-3 backdrop-blur-xl transition-all duration-300 ${
            toast.type === "success"
              ? "bg-emerald-950/95 border-emerald-500 text-emerald-100 shadow-emerald-950/40"
              : toast.type === "error"
              ? "bg-rose-950/95 border-rose-500 text-rose-100 shadow-rose-950/40"
              : "bg-slate-900/95 border-slate-600 text-slate-100 shadow-slate-950/40"
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {toast.type === "success" && (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            )}
            {toast.type === "error" && (
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            )}
            {toast.type === "info" && (
              <Sparkles className="w-5 h-5 text-blue-400" />
            )}
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <h4 className="text-xs font-black tracking-wide">
              {toast.title}
            </h4>
            <p className="text-xs mt-1 leading-relaxed opacity-90 font-normal">
              {toast.message}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="shrink-0 p-1 text-white/60 hover:text-white rounded-lg transition-colors"
            title="বন্ধ করুন"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Navigation Back */}
      <div className="flex items-center justify-between">
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-primary transition-all group font-bengali bg-surface border border-border px-3 py-1.5 rounded-xl hover:shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          <span>সকল কোর্সে ফিরে যান</span>
        </Link>

        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
          <Sparkles className="w-3 h-3" />
          <span>কোর্স স্টুডিও v2.0</span>
        </span>
      </div>

      {/* Page Header */}
      <div className="bg-gradient-to-r from-surface via-surface to-primary/5 p-6 rounded-2xl border border-border shadow-xs">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text font-bengali tracking-tight">
          নতুন অনলাইন কোর্স তৈরির উইজার্ড
        </h1>
        <p className="text-xs sm:text-sm text-text-muted font-bengali mt-1 max-w-2xl">
          ডিভাইস থেকে থাম্বনেইল আপলোড, ভিডিও লিংক, মেন্টর ও কারিকুলাম সেট করে এক ক্লিকেই ওয়েবসাইটে লাইভ পাবলিশ করুন।
        </p>
      </div>

      {/* Modern Interactive Step Progress Bar */}
      <div className="bg-surface rounded-2xl border border-border p-4 shadow-xs">
        {/* Progress Bar Track */}
        <div className="w-full bg-surface-secondary h-1.5 rounded-full overflow-hidden mb-4">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full"
            initial={{ width: "20%" }}
            animate={{ width: `${(currentStep / 5) * 100}%` }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
          {steps.map((step) => {
            const isCurrent = currentStep === step.num;
            const isCompleted = currentStep > step.num;
            const Icon = step.icon;

            return (
              <motion.button
                key={step.num}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentStep(step.num)}
                className={`flex flex-col items-center sm:items-start p-3 rounded-xl transition-all font-bengali relative border text-left ${
                  isCurrent
                    ? "bg-primary text-white font-bold border-primary shadow-md shadow-primary/20"
                    : isCompleted
                    ? "bg-primary/5 text-primary border-primary/25 hover:bg-primary/10"
                    : "bg-surface-secondary/40 text-text-muted border-border/60 hover:border-border hover:bg-surface-secondary"
                }`}
              >
                <div className="flex items-center gap-2 mb-1 w-full justify-between">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                      isCurrent
                        ? "bg-white/20 text-white"
                        : isCompleted
                        ? "bg-primary/20 text-primary"
                        : "bg-border text-text-muted"
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>
                  <span className={`text-[10px] font-mono ${isCurrent ? "text-white/80" : "text-text-muted"}`}>
                    0{step.num}
                  </span>
                </div>
                <span className="text-xs font-bold leading-snug truncate w-full">{step.title}</span>
                <span
                  className={`text-[10px] truncate hidden sm:block ${
                    isCurrent ? "text-white/75" : "text-text-muted/70"
                  }`}
                >
                  {step.desc}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Main Wizard Form Container */}
      <div className="bg-surface rounded-2xl border border-border p-5 sm:p-7 lg:p-8 shadow-sm">
        <AnimatePresence mode="wait">
          {/* STEP 1: Basic Information */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <div className="pb-3 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-text font-bengali">
                    ধাপ ১: কোর্সের মৌলিক বিবরণ
                  </h3>
                  <p className="text-xs text-text-muted font-bengali mt-0.5">
                    কোর্সের শিরোনাম, বিভাগ, স্তর এবং সংশ্লিষ্ট ইন্সট্রাক্টর তথ্য প্রদান করুন
                  </p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono font-bold">
                  Step 1 of 5
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text font-bengali mb-1.5">
                  কোর্সের পূর্ণ নাম (বাংলায়) <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="উদা: বুয়েট ও ইঞ্জিনিয়ারিং পদার্থবিজ্ঞান স্পেশাল কনসেপ্ট ব্যাচ"
                  value={basicInfo.titleBn}
                  onChange={(e) => setBasicInfo({ ...basicInfo, titleBn: e.target.value })}
                  className="input text-sm font-bengali w-full focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text font-bengali mb-1.5">
                  কোর্সের নাম (ইংরেজিতে - URL স্লাগ তৈরিতে ব্যবহৃত হবে)
                </label>
                <input
                  type="text"
                  placeholder="e.g. BUET Engineering Physics Mastery 2026"
                  value={basicInfo.titleEn}
                  onChange={(e) => setBasicInfo({ ...basicInfo, titleEn: e.target.value })}
                  className="input text-sm font-sans w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text font-bengali mb-1.5">
                  কোর্স সাবটাইটেল বা সংক্ষিপ্ত বিবরণী (বাংলায়)
                </label>
                <textarea
                  rows={3}
                  placeholder="কোর্সের মূল উদ্দেশ্য ও শিক্ষার্থীদের প্রাপ্তি সংক্ষেপে লিখুন..."
                  value={basicInfo.subtitleBn}
                  onChange={(e) => setBasicInfo({ ...basicInfo, subtitleBn: e.target.value })}
                  className="input text-sm font-bengali w-full py-2.5"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text font-bengali mb-1.5">
                    শিক্ষা বিভাগ (Category) <span className="text-error">*</span>
                  </label>
                  <select
                    value={basicInfo.categorySlug}
                    onChange={(e) => setBasicInfo({ ...basicInfo, categorySlug: e.target.value })}
                    className="input text-xs sm:text-sm font-bengali w-full"
                  >
                    {isLoadingLists ? (
                      <option value="">ক্যাটাগরি লোড হচ্ছে...</option>
                    ) : (
                      categoriesList.map((c) => (
                        <option key={c.id} value={c.id.toString()}>
                          {c.name_bn || c.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <label className="text-xs font-bold text-text flex items-center gap-1.5 font-bengali">
                      <GraduationCap className="w-4 h-4 text-primary" />
                      <span>কোর্স ইন্সট্রাক্টরবৃন্দ / শিক্ষক (একাধিক নির্বাচনযোগ্য) <span className="text-error">*</span></span>
                    </label>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      একটি কোর্সে ১ জন বা তার বেশি শিক্ষক নির্বাচন করুন। প্রথমে নির্বাচিত শিক্ষক প্রধান শিক্ষক হিসেবে থাকবেন।
                    </p>
                  </div>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 shrink-0 self-start sm:self-auto">
                    নির্বাচিত: {basicInfo.instructorIds.length} জন
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                  {instructorsList.map((inst) => {
                    const isSelected = basicInfo.instructorIds.includes(String(inst.id));
                    const isPrimary = basicInfo.instructorIds[0] === String(inst.id);

                    return (
                      <div
                        key={inst.id}
                        onClick={() => toggleInstructor(String(inst.id))}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all select-none ${
                          isSelected
                            ? "bg-primary/10 border-primary/60 shadow-xs"
                            : "bg-surface-secondary/40 border-border hover:border-border-hover hover:bg-surface-secondary"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-border bg-slate-800">
                            {inst.photo_url ? (
                              <img
                                src={inst.photo_url}
                                alt={inst.name_bn || inst.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-xs text-primary bg-primary/10">
                                {(inst.name_bn?.[0] || inst.name?.[0] || "I").toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h5 className="font-bold text-xs text-text truncate">
                              {inst.name_bn || inst.name}
                            </h5>
                            <p className="text-[10px] text-text-muted truncate">
                              {inst.institution || "Ormission Faculty"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isPrimary && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                              প্রধান
                            </span>
                          )}
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                              isSelected
                                ? "bg-primary border-primary text-white"
                                : "border-border bg-surface"
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {basicInfo.instructorIds.length === 0 && (
                  <p className="text-[11px] text-rose-500 font-bold mt-1">
                    * অনুগ্রহ করে কমপক্ষে একজন ইন্সট্রাক্টর নির্বাচন করুন।
                  </p>
                )}
              </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text font-bengali mb-1.5">
                    কোর্স লেভেল
                  </label>
                  <select
                    value={basicInfo.level}
                    onChange={(e) => setBasicInfo({ ...basicInfo, level: e.target.value })}
                    className="input text-xs font-bengali w-full"
                  >
                    <option value="All Levels">সকল লেভেল (All Levels)</option>
                    <option value="Beginner">বিগিনার (Beginner)</option>
                    <option value="Intermediate">ইন্টারমিডিয়েট</option>
                    <option value="Advanced">অ্যাডভান্সড</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text font-bengali mb-1.5">
                    কোর্স ব্যাজ (Optional Badge)
                  </label>
                  <input
                    type="text"
                    placeholder="উদা: বেস্টসেলার, নতুন ব্যাচ"
                    value={basicInfo.badge}
                    onChange={(e) => setBasicInfo({ ...basicInfo, badge: e.target.value })}
                    className="input text-xs font-bengali w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text font-bengali mb-1.5">
                    প্রাথমিক নথিভুক্ত শিক্ষার্থী (Initial Count)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={basicInfo.initialEnrolled}
                    onChange={(e) => setBasicInfo({ ...basicInfo, initialEnrolled: e.target.value })}
                    className="input text-xs font-sans w-full"
                  />
                </div>
              </div>

              {/* Prerequisites / পূর্বশর্ত Editor */}
              <div className="p-4 sm:p-5 rounded-2xl bg-surface-secondary/50 border border-border space-y-4">
                <div className="flex items-center justify-between border-b border-border/80 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center">
                      <ListChecks className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-text font-bengali">কোর্সের পূর্বশর্ত (Prerequisites)</h4>
                      <p className="text-[11px] text-text-muted font-bengali">শিক্ষার্থীদের এই কোর্স শুরুর আগে কী কী জানা থাকা দরকার</p>
                    </div>
                  </div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                    {basicInfo.prerequisites.length}টি
                  </span>
                </div>

                {/* Add New Prerequisite */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newPrerequisiteInput}
                    onChange={(e) => setNewPrerequisiteInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newPrerequisiteInput.trim()) {
                        e.preventDefault();
                        setBasicInfo((prev) => ({
                          ...prev,
                          prerequisites: [...prev.prerequisites, newPrerequisiteInput.trim()],
                        }));
                        setNewPrerequisiteInput("");
                      }
                    }}
                    placeholder="যেমন: এসএসসি পর্যায়ের বেসিক গণিত ধারণা... (লিখে Enter চাপুন)"
                    className="input text-xs w-full"
                  />
                  <button
                    type="button"
                    disabled={!newPrerequisiteInput.trim()}
                    onClick={() => {
                      if (newPrerequisiteInput.trim()) {
                        setBasicInfo((prev) => ({
                          ...prev,
                          prerequisites: [...prev.prerequisites, newPrerequisiteInput.trim()],
                        }));
                        setNewPrerequisiteInput("");
                      }
                    }}
                    className="btn btn-primary btn-sm text-xs font-bold flex items-center gap-1 shrink-0 disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>যোগ</span>
                  </button>
                </div>

                {/* Prerequisites List */}
                {basicInfo.prerequisites.length > 0 ? (
                  <div className="space-y-1.5">
                    {basicInfo.prerequisites.map((prereq, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-surface/80 border border-border group hover:border-sky-500/30 transition-all"
                      >
                        <span className="w-5 h-5 rounded-full bg-sky-500/10 text-sky-500 flex items-center justify-center text-[9px] font-mono font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-xs text-text flex-1">{prereq}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setBasicInfo((prev) => ({
                              ...prev,
                              prerequisites: prev.prerequisites.filter((_, i) => i !== idx),
                            }));
                          }}
                          className="p-1 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors opacity-0 group-hover:opacity-100"
                          title="মুছে ফেলুন"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-text-muted text-center py-3">এখনো কোনো পূর্বশর্ত যোগ করা হয়নি। উপরে লিখে Enter চাপুন।</p>
                )}
              </div>

              {/* Course Rating & Review Display Settings */}
              <div className="p-4 sm:p-5 rounded-2xl bg-surface-secondary/50 border border-border space-y-4">
                <div className="flex items-center justify-between border-b border-border/80 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-text font-bengali">কোর্স রেটিং ও রিভিউ সেটিংস</h4>
                      <p className="text-[11px] text-text-muted font-bengali">ওয়েবসাইটে রেটিং ডিসপ্লে অন বা অফ রাখুন এবং মান নির্ধারণ করুন</p>
                    </div>
                  </div>

                  <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                    basicInfo.showRating
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-slate-500/10 text-slate-500 border border-slate-500/20"
                  }`}>
                    {basicInfo.showRating ? "রেটিং অন" : "রেটিং অফ (হাইড)"}
                  </span>
                </div>

                {/* Toggle Checkbox */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="new_course_show_rating"
                    checked={basicInfo.showRating}
                    onChange={(e) => setBasicInfo({ ...basicInfo, showRating: e.target.checked })}
                    className="w-4 h-4 mt-0.5 rounded text-primary focus:ring-primary cursor-pointer"
                  />
                  <div className="flex-1">
                    <label htmlFor="new_course_show_rating" className="text-xs font-bold text-text cursor-pointer block">
                      ওয়েবসাইটে এই কোর্সের রেটিং ও রিভিউ সংখ্যা প্রদর্শন করুন
                    </label>
                    <span className="text-[10.5px] text-text-muted block mt-0.5">
                      অফ রাখলে কোর্স কার্ড ও কোর্সের বিস্তারিত পেজে কোনো রেটিং ব্যাজ বা স্টার প্রদর্শিত হবে না।
                    </span>
                  </div>
                </div>

                {/* Rating inputs */}
                {basicInfo.showRating && (
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-text font-bengali mb-1.5 flex items-center gap-1.5">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          রেটিং স্কোর (Rating Score)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="1.0"
                          max="5.0"
                          placeholder="5.0"
                          value={basicInfo.ratingScore}
                          onChange={(e) => setBasicInfo({ ...basicInfo, ratingScore: e.target.value })}
                          className="input text-xs font-sans w-full font-bold"
                        />
                        <span className="text-[10px] text-text-muted font-bengali mt-0.5 block">
                          ১.০ থেকে ৫.০ এর মধ্যে (যেমন: 5.0)
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-text font-bengali mb-1.5">
                          রিভিউ / রেটিং সংখ্যা (Review Count)
                        </label>
                        <input
                          type="number"
                          min="0"
                          placeholder="125"
                          value={basicInfo.reviewsCount}
                          onChange={(e) => setBasicInfo({ ...basicInfo, reviewsCount: e.target.value })}
                          className="input text-xs font-sans w-full font-bold"
                        />
                        <span className="text-[10px] text-text-muted font-bengali mt-0.5 block">
                          মোট কতজন শিক্ষার্থী রেটিং দিয়েছে (যেমন: 125)
                        </span>
                      </div>
                    </div>

                    {/* Live preview */}
                    <div className="p-3 rounded-xl bg-amber-400/5 border border-amber-400/20 flex items-center justify-between">
                      <span className="text-xs text-text-muted font-bold font-bengali">লাইভ প্রিভিউ:</span>
                      <div className="flex items-center gap-1.5 bg-amber-400/15 px-3 py-0.5 rounded-full border border-amber-400/30">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                          {Number(basicInfo.ratingScore || 5.0).toFixed(1)}
                        </span>
                        <span className="text-[11px] font-bold text-text-muted">
                          ({String(basicInfo.reviewsCount || 125).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[+d])})
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 2: Pricing & Discounts */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <div className="pb-3 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-text font-bengali">
                    ধাপ ২: মূল্য নির্ধারণ ও ডিসকাউন্ট অফার
                  </h3>
                  <p className="text-xs text-text-muted font-bengali mt-0.5">
                    কোর্সের নিয়মিত ফি, ছাড় পরবর্তী অফার ফি এবং অফার ব্যানার সেট করুন
                  </p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono font-bold">
                  Step 2 of 5
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="bg-surface-secondary/40 p-4 rounded-xl border border-border">
                  <label className="block text-xs font-semibold text-text font-bengali mb-1.5">
                    নিয়মিত কোর্স ফি (টাকায়) <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-text-muted">
                      ৳
                    </span>
                    <input
                      type="number"
                      required
                      placeholder="3500"
                      value={pricing.originalPrice}
                      onChange={(e) => setPricing({ ...pricing, originalPrice: e.target.value })}
                      className="input pl-8 text-base font-bold font-sans w-full"
                    />
                  </div>
                  <span className="text-[11px] text-text-muted font-bengali mt-1 block">
                    কাটা মূল্যে প্রদর্শিত হবে (Strikethrough)
                  </span>
                </div>

                <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                  <label className="block text-xs font-bold text-primary font-bengali mb-1.5">
                    অফার পরবর্তী চূড়ান্ত বিক্রয়মূল্য (টাকায়) <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-primary text-lg">
                      ৳
                    </span>
                    <input
                      type="number"
                      required
                      placeholder="1999"
                      value={pricing.discountPrice}
                      onChange={(e) => setPricing({ ...pricing, discountPrice: e.target.value })}
                      className="input pl-8 text-base font-extrabold font-sans text-primary w-full border-primary/30 focus:ring-primary/20"
                    />
                  </div>
                  <span className="text-[11px] text-primary font-bengali mt-1 block font-medium">
                    শিক্ষার্থী এই মূল্যে ভর্তি হবে
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text font-bengali mb-1.5">
                  অফার ব্যানার টেক্সট (Offer Tag)
                </label>
                <input
                  type="text"
                  placeholder="উদা: সীমিত সময়ের জন্য ৫০% বিশেষ ছাড়"
                  value={pricing.offerTag}
                  onChange={(e) => setPricing({ ...pricing, offerTag: e.target.value })}
                  className="input text-sm font-bengali w-full"
                />
              </div>

              {/* Price Calculation Card */}
              <div className="p-4 bg-surface-secondary/70 rounded-xl border border-border flex items-center justify-between font-bengali">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-text block">লাইভ ডিসকাউন্ট হিসেব:</span>
                  <p className="text-xs text-text-muted">
                    নিয়মিত ৳{Number(pricing.originalPrice).toLocaleString()} থেকে ছাড় দিয়ে ৳
                    {Number(pricing.discountPrice).toLocaleString()} রাখা হচ্ছে।
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold bg-accent text-white shadow-xs">
                    {discountPercent}% ছাড়
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Media & Device Thumbnail Upload */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <div className="pb-3 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-text font-bengali flex items-center gap-2">
                    <span>ধাপ ৩: ব্যানার ও ডেমো ভিডিও</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      ডিভাইস আপলোড সাপোর্টেড
                    </span>
                  </h3>
                  <p className="text-xs text-text-muted font-bengali mt-0.5">
                    আপনার কম্পিউটার বা মোবাইল থেকে থাম্বনেইল আপলোড করুন অথবা অনলাইন ইমেজ লিংক ব্যবহার করুন
                  </p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono font-bold">
                  Step 3 of 5
                </span>
              </div>

              {/* Thumbnail Selector Tabs */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setActiveThumbTab("device")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all font-bengali border ${
                      activeThumbTab === "device"
                        ? "bg-primary text-white border-primary shadow-xs"
                        : "bg-surface text-text-muted border-border hover:bg-surface-secondary"
                    }`}
                  >
                    <CloudUpload className="w-3.5 h-3.5" />
                    <span>ডিভাইস থেকে আপলোড</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveThumbTab("url")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all font-bengali border ${
                      activeThumbTab === "url"
                        ? "bg-primary text-white border-primary shadow-xs"
                        : "bg-surface text-text-muted border-border hover:bg-surface-secondary"
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>অনলাইন ইমেজ লিংক</span>
                  </button>
                </div>

                {/* Tab 1: Device Upload Zone */}
                {activeThumbTab === "device" && (
                  <div className="space-y-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleDeviceFileUpload(file);
                      }}
                      className="hidden"
                    />

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                        isUploadingThumb
                          ? "border-primary/50 bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-surface-secondary/50"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                        {isUploadingThumb ? (
                          <RefreshCw className="w-6 h-6 animate-spin" />
                        ) : (
                          <CloudUpload className="w-6 h-6" />
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-text font-bengali">
                        {isUploadingThumb ? "ছবি আপলোড হচ্ছে..." : "ডিভাইস থেকে কোর্স থাম্বনেইল নির্বাচন করুন"}
                      </h4>
                      <p className="text-xs text-text-muted font-bengali mt-1">
                        এখানে ক্লিক করুন বা ড্র্যাগ করে ড্রপ করুন (JPG, PNG, WEBP — সর্বোচ্চ ৮ MB, ১৬:৯ অনুপাত)
                      </p>
                    </div>

                    {/* Upload progress */}
                    {isUploadingThumb && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-sans text-text-muted">
                          <span>Supabase Cloud Storage এ আপলোড হচ্ছে...</span>
                          <span className="font-bold">{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-surface-secondary h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-primary h-full transition-all duration-300 rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {uploadError && (
                      <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-xs text-error font-bengali">
                        {uploadError}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: URL Input */}
                {activeThumbTab === "url" && (
                  <div>
                    <label className="block text-xs font-semibold text-text font-bengali mb-1.5">
                      কোর্স থাম্বনেইল ইমেজ URL <span className="text-error">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://..."
                      value={media.thumbnailUrl}
                      onChange={(e) => setMedia({ ...media, thumbnailUrl: e.target.value })}
                      className="input text-xs font-sans w-full"
                    />
                  </div>
                )}
              </div>

              {/* 16:9 Thumbnail Live Preview Card */}
              <div className="bg-surface-secondary/40 p-4 rounded-2xl border border-border">
                <span className="text-xs font-bold text-text font-bengali block mb-2">
                  লাইভ থাম্বনেইল প্রিভিউ (১৬:৯ অনুপাত):
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-border shadow-xs bg-slate-900 flex items-center justify-center">
                    {media.thumbnailUrl ? (
                      <img
                        src={media.thumbnailUrl}
                        alt="Course Thumbnail Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-text-muted p-4">
                        <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-40" />
                        <span className="text-xs font-bengali">কোনো ছবি নেই</span>
                      </div>
                    )}

                    {/* Badges Overlay */}
                    {discountPercent > 0 && (
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[10px] font-bold rounded-full bg-accent text-white shadow-xs font-bengali">
                        {discountPercent}% ছাড়
                      </span>
                    )}

                    {selectedCatObj && (
                      <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 text-[10px] font-bold rounded-full bg-black/70 backdrop-blur-xs text-white border border-white/20 font-bengali">
                        {selectedCatObj.name_bn || selectedCatObj.name}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-xs font-bengali">
                    <div className="font-bold text-text text-sm">
                      {basicInfo.titleBn || "কোর্সের নাম এখানে প্রদর্শিত হবে"}
                    </div>
                    <div className="text-text-muted">
                      ইন্সট্রাক্টর: {selectedInstObj?.name_bn || selectedInstObj?.name || "অনলাইন মেন্টর"}
                    </div>
                    <div className="font-bold text-primary font-sans text-sm">
                      ৳{Number(pricing.discountPrice).toLocaleString()}{" "}
                      {Number(pricing.originalPrice) > Number(pricing.discountPrice) && (
                        <span className="text-xs text-text-muted line-through font-normal">
                          ৳{Number(pricing.originalPrice).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn btn-outline btn-xs font-bengali flex items-center gap-1"
                      >
                        <CloudUpload className="w-3 h-3" />
                        <span>ছবি পরিবর্তন</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Embed URL */}
              <div>
                <label className="block text-xs font-semibold text-text font-bengali mb-1.5">
                  ফ্রি প্রিভিউ / ডেমো ভিডিও Embed URL (YouTube / Bunny / Vimeo)
                </label>
                <div className="relative">
                  <Video className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/embed/..."
                    value={media.previewVideoUrl}
                    onChange={(e) => setMedia({ ...media, previewVideoUrl: e.target.value })}
                    className="input pl-9 text-xs font-sans w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text font-bengali mb-1.5">
                  কোর্সের মোট অনুমিত সময়কাল (ঘণ্টায়)
                </label>
                <input
                  type="number"
                  placeholder="45"
                  value={media.durationHours}
                  onChange={(e) => setMedia({ ...media, durationHours: e.target.value })}
                  className="input text-xs font-sans w-full max-w-xs"
                />
              </div>
            </motion.div>
          )}

          {/* STEP 4: Curriculum & Lessons */}
          {currentStep === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <div className="pb-3 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-text font-bengali">
                    ধাপ ৪: কারিকুলাম ও লেসন বিন্যাস
                  </h3>
                  <p className="text-xs text-text-muted font-bengali mt-0.5">
                    অধ্যায় যোগ করুন এবং প্রতিটি অধ্যায়ে ক্লাস ও ভিডিও লিংক যুক্ত করুন
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addSection}
                  className="btn btn-primary btn-xs font-bengali font-bold flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>নতুন অধ্যায়</span>
                </button>
              </div>

              {/* Sections List */}
              <div className="space-y-4">
                {curriculum.map((section, secIdx) => (
                  <div
                    key={section.id}
                    className="bg-surface-secondary/40 rounded-2xl border border-border p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center font-mono">
                          {secIdx + 1}
                        </span>
                        <input
                          type="text"
                          value={section.titleBn}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCurriculum((prev) =>
                              prev.map((s) => (s.id === section.id ? { ...s, titleBn: val } : s))
                            );
                          }}
                          className="input text-xs font-bengali font-bold flex-1 bg-surface"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => addLesson(section.id)}
                          className="btn btn-outline btn-xs font-bengali flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>লেসন যোগ</span>
                        </button>
                        {curriculum.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSection(section.id)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error/10"
                            title="অধ্যায় মুছুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Lessons inside Section */}
                    <div className="space-y-2 pl-4 sm:pl-8 border-l-2 border-primary/20">
                      {section.lessons.map((lesson, lesIdx) => (
                        <div
                          key={lesson.id}
                          className="bg-surface rounded-xl border border-border p-3 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              value={lesson.titleBn}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCurriculum((prev) =>
                                  prev.map((s) =>
                                    s.id === section.id
                                      ? {
                                          ...s,
                                          lessons: s.lessons.map((l) =>
                                            l.id === lesson.id ? { ...l, titleBn: val } : l
                                          ),
                                        }
                                      : s
                                  )
                                );
                              }}
                              className="input text-xs font-bengali flex-1"
                              placeholder={`লেসন ${lesIdx + 1}: ক্লাসের নাম`}
                            />

                            <input
                              type="text"
                              value={lesson.duration}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCurriculum((prev) =>
                                  prev.map((s) =>
                                    s.id === section.id
                                      ? {
                                          ...s,
                                          lessons: s.lessons.map((l) =>
                                            l.id === lesson.id ? { ...l, duration: val } : l
                                          ),
                                        }
                                      : s
                                  )
                                );
                              }}
                              placeholder="25:00"
                              className="input text-xs font-sans w-20 text-center"
                            />

                            <label className="flex items-center gap-1.5 text-xs text-secondary font-bengali font-semibold whitespace-nowrap cursor-pointer px-2">
                              <input
                                type="checkbox"
                                checked={lesson.isFreePreview}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setCurriculum((prev) =>
                                    prev.map((s) =>
                                      s.id === section.id
                                        ? {
                                            ...s,
                                            lessons: s.lessons.map((l) =>
                                              l.id === lesson.id ? { ...l, isFreePreview: checked } : l
                                            ),
                                          }
                                        : s
                                    )
                                  );
                                }}
                                className="accent-secondary"
                              />
                              <span>আনলক</span>
                            </label>

                            {section.lessons.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeLesson(section.id, lesson.id)}
                                className="text-text-muted hover:text-error p-1 rounded hover:bg-error/10"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="text-xs">
                            <div className="relative">
                              <Video className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                              <input
                                type="url"
                                placeholder="ভিডিও Embed URL (যেমন: https://www.youtube.com/embed/...)"
                                value={lesson.videoUrl}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCurriculum((prev) =>
                                    prev.map((s) =>
                                      s.id === section.id
                                        ? {
                                            ...s,
                                            lessons: s.lessons.map((l) =>
                                              l.id === lesson.id ? { ...l, videoUrl: val } : l
                                            ),
                                          }
                                        : s
                                    )
                                  );
                                }}
                                className="input pl-8 text-xs font-sans w-full"
                              />
                            </div>
                          </div>

                          {/* Lesson Study Materials & Notes (PDF/Drive) */}
                          <LessonMaterialsManager
                            materials={lesson.materials || []}
                            onChange={(newMats) => {
                              setCurriculum((prev) =>
                                prev.map((s) =>
                                  s.id === section.id
                                    ? {
                                        ...s,
                                        lessons: s.lessons.map((l) =>
                                          l.id === lesson.id ? { ...l, materials: newMats } : l
                                        ),
                                      }
                                    : s
                                )
                              );
                            }}
                            lessonTitle={lesson.titleBn}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 5: SEO & Publishing */}
          {currentStep === 5 && (
            <motion.div
              key="step-5"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <div className="pb-3 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-text font-bengali">
                    ধাপ ৫: এসইও ও চূড়ান্ত প্রকাশনা
                  </h3>
                  <p className="text-xs text-text-muted font-bengali mt-0.5">
                    গুগল সার্চ মেটাডাটা ও কোর্সের লাইভ প্রকাশনা স্থিতি নিশ্চিত করুন
                  </p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono font-bold">
                  Step 5 of 5
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text font-bengali mb-1.5">
                  SEO মেটা শিরোনাম (Meta Title)
                </label>
                <input
                  type="text"
                  placeholder={basicInfo.titleBn || "কোর্স টাইটেল | Ormission"}
                  value={seo.metaTitle}
                  onChange={(e) => setSeo({ ...seo, metaTitle: e.target.value })}
                  className="input text-xs font-bengali w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text font-bengali mb-1.5">
                  SEO মেটা বিবরণী (Meta Description)
                </label>
                <textarea
                  rows={3}
                  placeholder="গুগল সার্চে দেখানোর উপযোগী আকর্ষণীয় বিবরণী..."
                  value={seo.metaDescription}
                  onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
                  className="input text-xs font-bengali w-full py-2.5"
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Publish Status Toggle */}
                <div className="p-4 bg-surface-secondary/40 rounded-2xl border border-border flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-text font-bengali">
                      ওয়েবসাইটে লাইভ প্রকাশ (Publish)
                    </h4>
                    <p className="text-[11px] text-text-muted font-bengali mt-0.5">
                      অন করলে শিক্ষার্থীরা সাথে সাথে কোর্সে ভর্তি হতে পারবে
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={seo.isPublished}
                      onChange={(e) => setSeo({ ...seo, isPublished: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
                  </label>
                </div>
              </div>

              {/* Summary Review Card */}
              <div className="p-5 rounded-2xl bg-surface-secondary/70 border border-border font-bengali space-y-2">
                <span className="text-xs font-bold text-text flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>কোর্স সারাংশ যাচাই:</span>
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-text-muted block text-[11px]">কোর্স নাম:</span>
                    <span className="font-bold text-text line-clamp-1">{basicInfo.titleBn || "দেওয়া হয়নি"}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[11px]">বিক্রয়মূল্য:</span>
                    <span className="font-bold text-primary">৳{Number(pricing.discountPrice).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[11px]">মোট অধ্যায় ও লেসন:</span>
                    <span className="font-bold text-text">
                      {curriculum.length}টি অধ্যায় ({curriculum.reduce((acc, s) => acc + s.lessons.length, 0)}টি লেসন)
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[11px]">স্ট্যাটাস:</span>
                    <span className="font-bold text-emerald-500">
                      {seo.isPublished ? "পাবলিশড (লাইভ)" : "ড্রাফট"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wizard Controls Bottom Buttons */}
        <div className="flex items-center justify-between border-t border-border pt-6 mt-8">
          {currentStep > 1 ? (
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="btn btn-outline btn-sm font-bengali font-semibold flex items-center gap-2 px-4 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>পূর্ববর্তী ধাপ</span>
            </motion.button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (currentStep === 1 && !basicInfo.titleBn.trim()) {
                  showToast("error", "কোর্সের নাম আবশ্যক", "অনুগ্রহ করে কোর্সের পূর্ণ নাম (বাংলায়) লিখুন।");
                  return;
                }
                setCurrentStep((prev) => prev + 1);
              }}
              className="btn btn-primary btn-sm font-bengali font-bold flex items-center gap-2 px-5 rounded-xl shadow-md shadow-primary/20 bg-gradient-to-r from-primary to-blue-600 hover:from-primary-hover hover:to-blue-700 text-white"
            >
              <span>পরবর্তী ধাপে যান</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          ) : (
            <motion.button
              type="button"
              disabled={saved}
              whileHover={{ scale: saved ? 1 : 1.03 }}
              whileTap={{ scale: saved ? 1 : 0.97 }}
              onClick={handleFinish}
              className="btn btn-primary btn-sm font-bengali font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 px-7 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
            >
              {saved ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saved ? "সংরক্ষণ করা হচ্ছে..." : "কোর্সটি প্রকাশ করুন"}</span>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
