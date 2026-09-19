"use client";

import { useState, useEffect, use, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Edit3,
  Video,
  Clock,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Eye,
  RefreshCw,
  Layers,
  Settings,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Upload,
  Image as ImageIcon,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Check,
  Play,
  X,
  Server,
  ToggleLeft,
  ToggleRight,
  Globe,
} from "lucide-react";
import {
  dbService,
  type DbCourse,
  type DbCategory,
  type DbInstructor,
} from "@/lib/supabase/db-service";
import { cleanAndNormalizeVideoUrl, getEmbedUrl } from "@/lib/video-helpers";

interface ServerFormItem {
  id: string | number;
  serverName: string;
  serverType: "youtube" | "streamtape" | "embed" | "direct";
  videoUrl: string;
  isEnabled: boolean;
  sortOrder: number;
}

interface LessonFormItem {
  id: string | number;
  title: string;
  titleBn: string;
  duration: string;
  videoUrl: string;
  isFreePreview: boolean;
  servers: ServerFormItem[];
  showServers?: boolean;
}

interface SectionFormItem {
  id: string | number;
  title: string;
  titleBn: string;
  lessons: LessonFormItem[];
}

export default function EditCourseStudioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;

  // Active Tab: details or curriculum
  const initialTab = searchParams.get("tab") === "curriculum" ? "curriculum" : "details";
  const [activeTab, setActiveTab] = useState<"details" | "curriculum">(initialTab);

  // Data Loading
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  // Meta collections
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [instructors, setInstructors] = useState<DbInstructor[]>([]);

  // Course Details State
  const [detailsForm, setDetailsForm] = useState({
    title_bn: "",
    title: "",
    slug: "",
    short_description: "",
    thumbnail_url: "",
    price: 0,
    original_price: 0,
    category_id: "",
    instructor_id: "",
    status: "published" as DbCourse["status"],
    is_featured: false,
    enrollment_count: 1250,
  });

  // Curriculum State
  const [sections, setSections] = useState<SectionFormItem[]>([]);

  // Thumbnail upload
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Video Test Preview Modal
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [previewServerName, setPreviewServerName] = useState<string | null>(null);

  const loadCourseData = async (isInitial = true) => {
    if (isInitial) setLoading(true);
    setErrorMessage(null);
    try {
      const [courseData, catList, instList] = await Promise.all([
        dbService.getCourseById(courseId),
        dbService.getCategories(),
        dbService.getInstructors(),
      ]);

      setCategories(catList);
      setInstructors(instList);

      if (!courseData) {
        setErrorMessage("কোর্সটি ডাটাবেজে খুঁজে পাওয়া যায়নি।");
        if (isInitial) setLoading(false);
        return;
      }

      setDetailsForm({
        title_bn: courseData.title_bn || "",
        title: courseData.title || "",
        slug: courseData.slug || "",
        short_description: courseData.short_description || "",
        thumbnail_url: courseData.thumbnail_url || "",
        price: courseData.price || 0,
        original_price: courseData.original_price || 0,
        category_id: courseData.category_id ? String(courseData.category_id) : "",
        instructor_id: courseData.instructor_id ? String(courseData.instructor_id) : "",
        status: courseData.status || "published",
        is_featured: !!courseData.is_featured,
        enrollment_count: courseData.enrollment_count ?? 1250,
      });

      // Parse course_sections
      if (Array.isArray(courseData.course_sections) && courseData.course_sections.length > 0) {
        const loadedSections: SectionFormItem[] = courseData.course_sections.map((s) => ({
          id: s.id,
          title: s.title || "",
          titleBn: s.title_bn || s.title || "অধ্যায়",
          lessons: Array.isArray(s.lessons)
            ? s.lessons.map((l: any) => {
                const srvs: ServerFormItem[] = Array.isArray(l.lesson_servers) && l.lesson_servers.length > 0
                  ? [...l.lesson_servers]
                      .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
                      .map((srv: any) => ({
                        id: srv.id,
                        serverName: srv.server_name || `Server ${srv.sort_order || 1}`,
                        serverType: srv.server_type || "youtube",
                        videoUrl: cleanAndNormalizeVideoUrl(srv.video_url || ""),
                        isEnabled: srv.is_enabled !== false,
                        sortOrder: srv.sort_order || 1,
                      }))
                  : l.video_url
                    ? [{ id: `srv-${l.id}-1`, serverName: "Server 1", serverType: "youtube" as const, videoUrl: cleanAndNormalizeVideoUrl(l.video_url), isEnabled: true, sortOrder: 1 }]
                    : [];

                return {
                  id: l.id,
                  title: l.title || "",
                  titleBn: l.title_bn || l.title || "ক্লাস",
                  duration: l.video_duration ? `${l.video_duration}:00` : "30:00",
                  videoUrl: cleanAndNormalizeVideoUrl(l.video_url || (srvs[0]?.videoUrl || "")),
                  isFreePreview: l.is_preview === true,
                  servers: srvs,
                  showServers: srvs.length > 0,
                };
              })
            : [],
        }));
        setSections(loadedSections);
      } else {
        // Default initial template if no sections exist yet
        setSections([
          {
            id: `sec-new-1`,
            title: "Chapter 1: Orientation & Fundamentals",
            titleBn: "অধ্যায় ১: মৌলিক ধারণা ও ওরিয়েন্টেশন",
            lessons: [
              {
                id: `les-new-1`,
                title: "Class 1: Course Overview",
                titleBn: "ক্লাস ১: কোর্স পরিচিতি ও রোডম্যাপ",
                duration: "20:00",
                videoUrl: "",
                isFreePreview: true,
                servers: [],
              },
            ],
          },
        ]);
      }
    } catch (err: unknown) {
      console.error("Error loading course:", err);
      setErrorMessage("ডাটা লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    loadCourseData(true);
  }, [courseId]);

  // Handle Thumbnail File Upload
  const handleThumbnailUpload = async (file: File) => {
    if (!file) return;
    const validMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validMimes.includes(file.type)) {
      showToast("error", "ফরম্যাট ত্রুটি", "শুধুমাত্র JPG, PNG বা WEBP ফরম্যাটের ছবি আপলোড করুন।");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      showToast("error", "সাইজ সীমা অতিক্রম", "ছবির সাইজ সর্বোচ্চ ৮ মেগাবাইট হতে পারবে।");
      return;
    }

    setIsUploadingThumb(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.url) {
        throw new Error(data.error || "আপলোড ব্যর্থ হয়েছে।");
      }
      setDetailsForm((prev) => ({ ...prev, thumbnail_url: data.url }));
      showToast("success", "ছবি আপলোড সফল", "কোর্স থাম্বনেইল সফলভাবে আপলোড করা হয়েছে।");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "ছবি আপলোড ব্যর্থ হয়েছে";
      showToast("error", "আপলোড ত্রুটি", msg);
    } finally {
      setIsUploadingThumb(false);
    }
  };

  // --- Curriculum Actions ---
  const addSection = () => {
    const newSecNum = sections.length + 1;
    const newSec: SectionFormItem = {
      id: `sec-${Date.now()}`,
      title: `Chapter ${newSecNum}: New Chapter`,
      titleBn: `অধ্যায় ${newSecNum}: নতুন অধ্যায়`,
      lessons: [
        {
          id: `les-${Date.now()}`,
          title: `Class 1`,
          titleBn: `ক্লাস ১: নতুন পাঠ`,
          duration: "30:00",
          videoUrl: "",
          isFreePreview: false,
          servers: [],
        },
      ],
    };
    setSections([...sections, newSec]);
  };

  const removeSection = (secId: string | number) => {
    if (sections.length <= 1) {
      showToast("error", "মুছে ফেলা সম্ভব নয়", "কমপক্ষে একটি অধ্যায় অবশ্যই থাকতে হবে।");
      return;
    }
    if (confirm("আপনি কি নিশ্চিত যে এই সম্পূর্ণ অধ্যায় ও এর ভেতরের সকল ক্লাস মুছে ফেলতে চান?")) {
      setSections(sections.filter((s) => s.id !== secId));
      showToast("info", "অধ্যায় অপসারিত", "অধ্যায়টি তালিকা থেকে সরানো হয়েছে। পরিবর্তন স্থায়ী করতে সংরক্ষণ করুন।");
    }
  };

  const updateSectionTitle = (secId: string | number, titleBn: string) => {
    setSections(
      sections.map((s) => (s.id === secId ? { ...s, titleBn, title: titleBn } : s))
    );
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === sections.length - 1)
    ) {
      return;
    }
    const newIndex = direction === "up" ? index - 1 : index + 1;
    const reordered = [...sections];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, moved);
    setSections(reordered);
  };

  const addLesson = (secId: string | number) => {
    setSections(
      sections.map((sec) => {
        if (sec.id === secId) {
          const newLessonNum = sec.lessons.length + 1;
          return {
            ...sec,
            lessons: [
              ...sec.lessons,
              {
                id: `les-${Date.now()}`,
                title: `Class ${newLessonNum}`,
                titleBn: `ক্লাস ${newLessonNum}: নতুন লেসন`,
                duration: "35:00",
                videoUrl: "",
                isFreePreview: false, // Default is Paid/Locked
                servers: [],
              },
            ],
          };
        }
        return sec;
      })
    );
  };

  const removeLesson = (secId: string | number, lesId: string | number) => {
    setSections(
      sections.map((sec) => {
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

  const updateLessonField = (
    secId: string | number,
    lesId: string | number,
    field: keyof LessonFormItem,
    val: any
  ) => {
    setSections(
      sections.map((sec) => {
        if (sec.id === secId) {
          return {
            ...sec,
            lessons: sec.lessons.map((les) => {
              if (les.id === lesId) {
                return { ...les, [field]: val };
              }
              return les;
            }),
          };
        }
        return sec;
      })
    );
  };

  // --- Streaming Server Management ---
  const addServer = (secId: string | number, lesId: string | number) => {
    setSections(
      sections.map((sec) => {
        if (sec.id !== secId) return sec;
        return {
          ...sec,
          lessons: sec.lessons.map((les) => {
            if (les.id !== lesId) return les;
            const newOrder = les.servers.length + 1;
            return {
              ...les,
              showServers: true,
              servers: [
                ...les.servers,
                {
                  id: `srv-${Date.now()}`,
                  serverName: `Server ${newOrder}`,
                  serverType: "youtube" as const,
                  videoUrl: "",
                  isEnabled: true,
                  sortOrder: newOrder,
                },
              ],
            };
          }),
        };
      })
    );
  };

  const removeServer = (secId: string | number, lesId: string | number, srvId: string | number) => {
    setSections(
      sections.map((sec) => {
        if (sec.id !== secId) return sec;
        return {
          ...sec,
          lessons: sec.lessons.map((les) => {
            if (les.id !== lesId) return les;
            return {
              ...les,
              servers: les.servers.filter((s) => s.id !== srvId),
            };
          }),
        };
      })
    );
  };

  const updateServerField = (
    secId: string | number,
    lesId: string | number,
    srvId: string | number,
    field: keyof ServerFormItem,
    val: any
  ) => {
    const finalVal = (field === "videoUrl" && typeof val === "string")
      ? cleanAndNormalizeVideoUrl(val)
      : val;

    setSections(
      sections.map((sec) => {
        if (sec.id !== secId) return sec;
        return {
          ...sec,
          lessons: sec.lessons.map((les) => {
            if (les.id !== lesId) return les;
            return {
              ...les,
              servers: les.servers.map((srv) =>
                srv.id === srvId ? { ...srv, [field]: finalVal } : srv
              ),
            };
          }),
        };
      })
    );
  };

  const moveLesson = (
    secId: string | number,
    lessonIndex: number,
    direction: "up" | "down"
  ) => {
    setSections(
      sections.map((sec) => {
        if (sec.id === secId) {
          if (
            (direction === "up" && lessonIndex === 0) ||
            (direction === "down" && lessonIndex === sec.lessons.length - 1)
          ) {
            return sec;
          }
          const newIndex = direction === "up" ? lessonIndex - 1 : lessonIndex + 1;
          const reorderedLessons = [...sec.lessons];
          const [moved] = reorderedLessons.splice(lessonIndex, 1);
          reorderedLessons.splice(newIndex, 0, moved);
          return { ...sec, lessons: reorderedLessons };
        }
        return sec;
      })
    );
  };



  // Save All Changes with Comprehensive Error Handling & Validation
  const handleSaveAll = async () => {
    // 1. Validation
    if (!detailsForm.title_bn.trim()) {
      showToast("error", "কোর্সের নাম আবশ্যক", "অনুগ্রহ করে কোর্সের পূর্ণ নাম (বাংলা) লিখুন।");
      setActiveTab("details");
      return;
    }

    if (sections.length === 0) {
      showToast("error", "অধ্যায় আবশ্যক", "কোর্সে কমপক্ষে একটি অধ্যায় তৈরি করতে হবে।");
      setActiveTab("curriculum");
      return;
    }

    // Validate sections and lessons
    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];
      if (!sec.titleBn.trim()) {
        showToast("error", "অধ্যায়ের নাম ফাঁকা", `অধ্যায় ${i + 1}-এর নাম লিখুন।`);
        setActiveTab("curriculum");
        return;
      }
      if (!sec.lessons || sec.lessons.length === 0) {
        showToast("error", "ক্লাস আবশ্যক", `'${sec.titleBn}' অধ্যায়ে কমপক্ষে একটি ক্লাস থাকতে হবে।`);
        setActiveTab("curriculum");
        return;
      }
      for (let j = 0; j < sec.lessons.length; j++) {
        const les = sec.lessons[j];
        if (!les.titleBn.trim()) {
          showToast(
            "error",
            "ক্লাসের শিরোনাম ফাঁকা",
            `'${sec.titleBn}' অধ্যায়ের ${j + 1} নম্বর ক্লাসের শিরোনাম লিখুন।`
          );
          setActiveTab("curriculum");
          return;
        }
      }
    }

    setSaving(true);
    setSaveSuccess(false);

    try {
      // 1. Prepare updates payload
      const updates: any = {
        id: courseId,
        title_bn: detailsForm.title_bn.trim(),
        title: detailsForm.title?.trim() || detailsForm.title_bn.trim(),
        short_description: detailsForm.short_description?.trim() || "",
        thumbnail_url: detailsForm.thumbnail_url?.trim() || "",
        price: Number(detailsForm.price) || 0,
        original_price: detailsForm.original_price ? Number(detailsForm.original_price) : null,
        is_free: Number(detailsForm.price) === 0,
        category_id: detailsForm.category_id ? Number(detailsForm.category_id) : null,
        instructor_id: detailsForm.instructor_id ? Number(detailsForm.instructor_id) : null,
        status: detailsForm.status,
        is_featured: detailsForm.is_featured,
        enrollment_count: Number(detailsForm.enrollment_count) || 0,
        curriculum: sections, // Passes all sections & lessons to sync
      };

      const res = await fetch("/api/courses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "সংরক্ষণ করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
      }

      setSaveSuccess(true);
      showToast(
        "success",
        "সফলভাবে সংরক্ষিত হয়েছে!",
        `কোর্সের তথ্য, মোট ${sections.length}টি অধ্যায়ে ${totalLessonsCount}টি ক্লাস (${freeLessonsCount}টি ফ্রি, ${paidLessonsCount}টি পেইড) Supabase ডাটাবেজে সফলভাবে সংরক্ষিত হয়েছে।`
      );

      setTimeout(() => setSaveSuccess(false), 5000);
      await loadCourseData(false); // Background sync without page unmount!
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "সংরক্ষণ ব্যর্থ হয়েছে";
      showToast("error", "সংরক্ষণ ত্রুটি", msg);
    } finally {
      setSaving(false);
    }
  };

  const totalLessonsCount = sections.reduce((acc, s) => acc + s.lessons.length, 0);
  const freeLessonsCount = sections.reduce(
    (acc, s) => acc + s.lessons.filter((l) => l.isFreePreview).length,
    0
  );
  const paidLessonsCount = totalLessonsCount - freeLessonsCount;

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-16 text-center font-bengali space-y-3">
        <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
        <p className="text-sm text-text-muted">কোর্সের তথ্য ও কারিকুলাম লোড হচ্ছে...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center font-bengali space-y-4">
        <AlertCircle className="w-12 h-12 mx-auto text-error opacity-80" />
        <h2 className="text-xl font-bold text-text">{errorMessage}</h2>
        <Link href="/courses" className="btn btn-primary btn-sm inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span>সকল কোর্সে ফিরে যান</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24 font-bengali">
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

      {/* Top Inline Success Banner */}
      {saveSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5 flex items-center justify-between gap-3 text-emerald-400">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold">সফলভাবে সংরক্ষিত:</span> কোর্সের সকল তথ্য, অধ্যায় ও ক্লাস Supabase ডাটাবেজে সফলভাবে আপডেট হয়েছে।
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSaveSuccess(false)}
            className="text-emerald-400/70 hover:text-emerald-300 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <Link
            href="/courses"
            className="p-2 rounded-xl bg-surface border border-border text-text-muted hover:text-primary transition-colors"
            title="সকল কোর্সে ফিরে যান"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-text line-clamp-1">
                {detailsForm.title_bn || "কোর্স সম্পাদনা"}
              </h1>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  detailsForm.status === "published"
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                }`}
              >
                {detailsForm.status === "published" ? "লাইভ প্রকাশিত" : "ড্রাফট"}
              </span>
            </div>
            <p className="text-xs text-text-muted font-sans mt-0.5">/{detailsForm.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <a
            href={`${process.env.NEXT_PUBLIC_MAIN_SITE_URL || "http://localhost:3000"}/course/${detailsForm.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm text-xs flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>প্রিভিউ</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className={`btn btn-sm text-xs font-bold flex items-center gap-1.5 shadow-md flex-1 sm:flex-none justify-center transition-all ${
              saveSuccess
                ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/20"
                : "btn-primary"
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>সংরক্ষণ হচ্ছে...</span>
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span>সফলভাবে সংরক্ষিত হয়েছে!</span>
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

      {/* Course Stats Quick Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-surface p-3.5 rounded-xl border border-border">
          <span className="text-[11px] text-text-muted">মোট অধ্যায় (Sections)</span>
          <div className="text-lg font-black text-text mt-0.5">{sections.length}টি</div>
        </div>
        <div className="bg-surface p-3.5 rounded-xl border border-border">
          <span className="text-[11px] text-text-muted">মোট ক্লাস (Classes)</span>
          <div className="text-lg font-black text-text mt-0.5">{totalLessonsCount}টি</div>
        </div>
        <div className="bg-surface p-3.5 rounded-xl border border-border">
          <span className="text-[11px] text-emerald-500 font-bold flex items-center gap-1">
            <Unlock className="w-3 h-3" />
            ফ্রি প্রিভিউ ক্লাস
          </span>
          <div className="text-lg font-black text-emerald-500 mt-0.5">{freeLessonsCount}টি</div>
        </div>
        <div className="bg-surface p-3.5 rounded-xl border border-border">
          <span className="text-[11px] text-amber-500 font-bold flex items-center gap-1">
            <Lock className="w-3 h-3" />
            পেইড / লকড ক্লাস
          </span>
          <div className="text-lg font-black text-amber-500 mt-0.5">{paidLessonsCount}টি</div>
        </div>
      </div>

      {/* Main Tab Selector */}
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab("curriculum")}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "curriculum"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-text-muted hover:text-text"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>কারিকুলাম ও ক্লাস পরিচালনা ({totalLessonsCount} ক্লাস)</span>
          <span className="px-1.5 py-0.2 rounded-full bg-primary/10 text-primary text-[10px] font-mono">
            v2.0
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("details")}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "details"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-text-muted hover:text-text"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>কোর্সের প্রাথমিক তথ্য ও মূল্য</span>
        </button>
      </div>

      {/* TAB 1: CURRICULUM & CLASSES (CORE TASK) */}
      {activeTab === "curriculum" && (
        <div className="space-y-6">
          <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h3 className="font-bold text-sm text-text flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>ক্লাস ও কারিকুলাম এক্সেস কন্ট্রোল</span>
              </h3>
              <p className="text-xs text-text-muted">
                প্রতিটি ক্লাসে <strong>ফ্রি প্রিভিউ</strong> অথবা <strong>পেইড / লকড ক্লাস</strong> নির্ধারণ করুন। পেইড ক্লাস কোনো AI বা ইন্সপেক্ট দিয়ে বাইপাস করা অসম্ভব।
              </p>
            </div>

            <button
              type="button"
              onClick={addSection}
              className="btn btn-primary btn-sm text-xs font-bold flex items-center gap-1.5 shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন অধ্যায় যোগ করুন</span>
            </button>
          </div>

          {/* Sections List */}
          <div className="space-y-5">
            {sections.map((section, sIdx) => (
              <div
                key={section.id}
                className="bg-surface rounded-2xl border border-border overflow-hidden shadow-xs"
              >
                {/* Section Header */}
                <div className="p-4 bg-surface-secondary/60 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                      {sIdx + 1 < 10 ? `0${sIdx + 1}` : sIdx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={section.titleBn}
                        onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                        placeholder="অধ্যায়ের নাম লিখুন..."
                        className="input text-sm font-bold text-text bg-surface/80 w-full"
                      />
                    </div>
                  </div>

                  {/* Section Controls */}
                  <div className="flex items-center gap-1.5 shrink-0 justify-end">
                    <button
                      type="button"
                      onClick={() => moveSection(sIdx, "up")}
                      disabled={sIdx === 0}
                      className="p-1.5 rounded-lg border border-border bg-surface text-text-muted hover:text-text disabled:opacity-30"
                      title="উপরে নিন"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(sIdx, "down")}
                      disabled={sIdx === sections.length - 1}
                      className="p-1.5 rounded-lg border border-border bg-surface text-text-muted hover:text-text disabled:opacity-30"
                      title="নিচে নিন"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => addLesson(section.id)}
                      className="btn btn-outline btn-sm text-xs font-bold flex items-center gap-1 ml-1"
                      title="এই অধ্যায়ে নতুন ক্লাস যোগ করুন"
                    >
                      <Plus className="w-3.5 h-3.5 text-primary" />
                      <span>ক্লাস যোগ করুন</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => removeSection(section.id)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors ml-1"
                      title="অধ্যায়টি মুছুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Lessons in this Section */}
                <div className="p-3 sm:p-4 space-y-3">
                  {section.lessons.map((lesson, lIdx) => (
                    <div
                      key={lesson.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        lesson.isFreePreview
                          ? "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50"
                          : "border-border bg-surface-secondary/20 hover:border-primary/30"
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        {/* Left: Index, Title, and Free/Paid Toggle */}
                        <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                          <span className="w-6 h-6 rounded-full bg-surface border border-border text-text-muted flex items-center justify-center text-[10px] font-mono shrink-0 mt-1 sm:mt-0">
                            {lIdx + 1}
                          </span>

                          <div className="flex-1 min-w-0 space-y-1">
                            <input
                              type="text"
                              value={lesson.titleBn}
                              onChange={(e) =>
                                updateLessonField(section.id, lesson.id, "titleBn", e.target.value)
                              }
                              placeholder="ক্লাসের শিরোনাম (যেমন: লেকচার ১ - সূচক ও লগারিদম)..."
                              className="input text-xs sm:text-sm font-semibold text-text w-full py-1.5"
                            />
                          </div>

                          {/* Free vs Paid Toggle Badge */}
                          <div className="shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                updateLessonField(
                                  section.id,
                                  lesson.id,
                                  "isFreePreview",
                                  !lesson.isFreePreview
                                )
                              }
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-2xs ${
                                lesson.isFreePreview
                                  ? "bg-emerald-500 text-white border-emerald-600 shadow-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20"
                              }`}
                              title="ক্লিক করে ফ্রি অথবা পেইড পরিবর্তন করুন"
                            >
                              {lesson.isFreePreview ? (
                                <>
                                  <Unlock className="w-3.5 h-3.5" />
                                  <span>ফ্রি প্রিভিউ (Free)</span>
                                </>
                              ) : (
                                <>
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>পেইড / লকড (Paid)</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Right: Duration, Video URL, Preview Button, Reorder & Delete */}
                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
                          {/* Duration input */}
                          <div className="relative w-24">
                            <Clock className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                            <input
                              type="text"
                              value={lesson.duration}
                              onChange={(e) =>
                                updateLessonField(section.id, lesson.id, "duration", e.target.value)
                              }
                              placeholder="30:00"
                              className="input text-xs pl-8 pr-2 py-1.5 font-mono text-center w-full"
                              title="সময়কাল (যেমন: 25:00)"
                            />
                          </div>

                          {/* Streaming Servers Toggle */}
                          <button
                            type="button"
                            onClick={() => updateLessonField(section.id, lesson.id, "showServers", !lesson.showServers)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shrink-0 ${
                              lesson.servers.length > 0
                                ? "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 shadow-2xs"
                                : "bg-surface border-border text-text-muted hover:text-text hover:border-primary/30"
                            }`}
                            title={lesson.showServers ? "সার্ভার প্যানেল লুকান" : "স্ট্রিমিং সার্ভার দেখুন ও পরিচালনা করুন"}
                          >
                            <Server className="w-3.5 h-3.5 text-primary" />
                            <span>{lesson.servers.length > 0 ? `${lesson.servers.length}টি সার্ভার` : "সার্ভার"}</span>
                            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${lesson.showServers ? "rotate-180 text-primary" : "text-text-muted"}`} />
                          </button>

                          {/* Compact badge when servers exist but panel is collapsed */}
                          {lesson.servers.length > 0 && !lesson.showServers && (
                            <div
                              onClick={() => updateLessonField(section.id, lesson.id, "showServers", true)}
                              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-border text-[11px] text-text-muted font-mono truncate max-w-[240px] cursor-pointer hover:border-primary/40 hover:text-text transition-colors"
                              title="ক্লিক করে সকল সার্ভার দেখুন"
                            >
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                              <span className="truncate">{lesson.servers[0]?.serverName || "Server 1"}: {lesson.servers[0]?.videoUrl}</span>
                            </div>
                          )}

                          {/* Legacy Video URL (hidden if servers exist) */}
                          {lesson.servers.length === 0 && (
                            <>
                              <div className="relative flex-1 sm:w-64">
                                <Video className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                                <input
                                  type="text"
                                  value={lesson.videoUrl}
                                  onChange={(e) =>
                                    updateLessonField(section.id, lesson.id, "videoUrl", e.target.value)
                                  }
                                  placeholder="YouTube URL বা ID..."
                                  className="input text-xs pl-8 pr-2 py-1.5 font-mono w-full"
                                  title="YouTube Unlisted URL বা Embed লিংক"
                                />
                              </div>
                              {lesson.videoUrl && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPreviewVideoUrl(lesson.videoUrl);
                                    setPreviewServerName(lesson.titleBn || "ভিডিও প্রিভিউ");
                                  }}
                                  className="p-1.5 rounded-lg border border-border bg-surface text-primary hover:bg-primary/10 transition-colors shrink-0"
                                  title="ভিডিও প্লেয়ার টেস্ট করুন"
                                >
                                  <Play className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          )}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => moveLesson(section.id, lIdx, "up")}
                              disabled={lIdx === 0}
                              className="p-1.5 rounded-lg border border-border bg-surface text-text-muted hover:text-text disabled:opacity-30"
                              title="উপরে নিন"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveLesson(section.id, lIdx, "down")}
                              disabled={lIdx === section.lessons.length - 1}
                              className="p-1.5 rounded-lg border border-border bg-surface text-text-muted hover:text-text disabled:opacity-30"
                              title="নিচে নিন"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeLesson(section.id, lesson.id)}
                              className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors"
                              title="ক্লাসটি মুছুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expandable Streaming Servers Panel */}
                      {lesson.showServers && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <div className="flex items-center justify-between mb-2.5">
                            <div className="flex items-center gap-2 text-xs font-bold text-text-muted">
                              <Server className="w-3.5 h-3.5 text-primary" />
                              <span>স্ট্রিমিং সার্ভার ({lesson.servers.length})</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => addServer(section.id, lesson.id)}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>সার্ভার যোগ করুন</span>
                            </button>
                          </div>

                          {lesson.servers.length === 0 ? (
                            <div className="text-center py-4 text-xs text-text-muted font-bengali">
                              কোনো সার্ভার যোগ করা হয়নি। &quot;সার্ভার যোগ করুন&quot; ক্লিক করুন।
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {lesson.servers.map((srv, srvIdx) => (
                                <div
                                  key={srv.id}
                                  className={`flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 rounded-lg border transition-all ${
                                    srv.isEnabled
                                      ? "border-primary/20 bg-primary/5"
                                      : "border-border bg-surface-secondary/30 opacity-60"
                                  }`}
                                >
                                  {/* Server Order Badge */}
                                  <span className="w-5 h-5 rounded-md bg-surface border border-border text-text-muted flex items-center justify-center text-[9px] font-mono shrink-0">
                                    {srvIdx + 1}
                                  </span>

                                  {/* Server Name */}
                                  <input
                                    type="text"
                                    value={srv.serverName}
                                    onChange={(e) => updateServerField(section.id, lesson.id, srv.id, "serverName", e.target.value)}
                                    placeholder="সার্ভারের নাম (যেমন: Server 1)..."
                                    className="input text-[11px] py-1 px-2.5 w-32 sm:w-36 font-semibold"
                                  />

                                  {/* Server Type Dropdown */}
                                  <select
                                    value={srv.serverType}
                                    onChange={(e) => updateServerField(section.id, lesson.id, srv.id, "serverType", e.target.value)}
                                    className="input text-[11px] py-1 px-2 w-32 bg-surface"
                                  >
                                    <option value="youtube">YouTube</option>
                                    <option value="streamtape">Streamtape</option>
                                    <option value="embed">Embed (iframe)</option>
                                    <option value="direct">Direct URL</option>
                                  </select>

                                  {/* Server Video URL */}
                                  <div className="relative flex-1 min-w-0">
                                    <Globe className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-text-muted" />
                                    <input
                                      type="text"
                                      value={srv.videoUrl}
                                      onChange={(e) => updateServerField(section.id, lesson.id, srv.id, "videoUrl", e.target.value)}
                                      onPaste={(e) => {
                                        const pasted = e.clipboardData.getData("text");
                                        if (pasted && (pasted.includes("<iframe") || pasted.includes("streamtape"))) {
                                          e.preventDefault();
                                          updateServerField(section.id, lesson.id, srv.id, "videoUrl", cleanAndNormalizeVideoUrl(pasted));
                                        }
                                      }}
                                      placeholder={srv.serverType === "youtube" ? "YouTube URL বা ID..." : srv.serverType === "streamtape" ? "Streamtape URL বা iframe embed..." : "Video URL..."}
                                      className="input text-[11px] py-1 pl-7 pr-2 font-mono w-full"
                                    />
                                  </div>

                                  {/* Preview Button */}
                                  {srv.videoUrl && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setPreviewVideoUrl(srv.videoUrl);
                                        setPreviewServerName(srv.serverName || "ভিডিও প্রিভিউ");
                                      }}
                                      className="p-1 rounded-md border border-border bg-surface text-primary hover:bg-primary/10 transition-colors shrink-0"
                                      title="প্রিভিউ"
                                    >
                                      <Play className="w-3 h-3" />
                                    </button>
                                  )}

                                  {/* Enable/Disable Toggle */}
                                  <button
                                    type="button"
                                    onClick={() => updateServerField(section.id, lesson.id, srv.id, "isEnabled", !srv.isEnabled)}
                                    className={`p-1 rounded-md transition-colors shrink-0 ${
                                      srv.isEnabled
                                        ? "text-emerald-500 hover:text-emerald-600"
                                        : "text-text-muted hover:text-text"
                                    }`}
                                    title={srv.isEnabled ? "সচল — ক্লিক করে বন্ধ করুন" : "বন্ধ — ক্লিক করে সচল করুন"}
                                  >
                                    {srv.isEnabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                                  </button>

                                  {/* Delete Server */}
                                  <button
                                    type="button"
                                    onClick={() => removeServer(section.id, lesson.id, srv.id)}
                                    className="p-1 rounded-md text-text-muted hover:text-error hover:bg-error/10 transition-colors shrink-0"
                                    title="এই সার্ভার মুছুন"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={addSection}
              className="btn btn-outline btn-sm font-bengali text-xs flex items-center gap-2 border-dashed border-2 py-2 px-6"
            >
              <Plus className="w-4 h-4 text-primary" />
              <span>আরও একটি অধ্যায় (Section) তৈরি করুন</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: COURSE DETAILS & SETTINGS */}
      {activeTab === "details" && (
        <div className="space-y-6">
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-5">
            <h3 className="font-bold text-base text-text border-b border-border pb-3">
              কোর্সের মৌলিক তথ্য ও বিবরণ
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text">কোর্সের পূর্ণ নাম (বাংলা) *</label>
                <input
                  type="text"
                  value={detailsForm.title_bn}
                  onChange={(e) => setDetailsForm({ ...detailsForm, title_bn: e.target.value })}
                  className="input text-xs w-full"
                  placeholder="যেমন: এইচএসসি ও এডমিশন ফিজিক্স মাস্টারক্লাস"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text">কোর্সের নাম (English)</label>
                <input
                  type="text"
                  value={detailsForm.title}
                  onChange={(e) => setDetailsForm({ ...detailsForm, title: e.target.value })}
                  className="input text-xs w-full font-sans"
                  placeholder="HSC & Admission Physics Masterclass"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text">ক্যাটাগরি</label>
                <select
                  value={detailsForm.category_id}
                  onChange={(e) => setDetailsForm({ ...detailsForm, category_id: e.target.value })}
                  className="input text-xs w-full"
                >
                  <option value="">ক্যাটাগরি নির্বাচন করুন</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id.toString()}>
                      {cat.name_bn || cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text">ইন্সট্রাক্টর / শিক্ষক</label>
                <select
                  value={detailsForm.instructor_id}
                  onChange={(e) => setDetailsForm({ ...detailsForm, instructor_id: e.target.value })}
                  className="input text-xs w-full"
                >
                  <option value="">ইন্সট্রাক্টর নির্বাচন করুন</option>
                  {instructors.map((inst) => (
                    <option key={inst.id} value={inst.id.toString()}>
                      {inst.name_bn || inst.name} ({inst.institution || "Ormission"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-text">সংক্ষিপ্ত সাবটাইটেল / বিবরণ</label>
                <textarea
                  rows={3}
                  value={detailsForm.short_description}
                  onChange={(e) =>
                    setDetailsForm({ ...detailsForm, short_description: e.target.value })
                  }
                  className="input text-xs w-full py-2"
                  placeholder="কোর্সটির মূল আকর্ষণ ও সুবিধা সংক্ষেপে লিখুন..."
                />
              </div>
            </div>
          </div>

          {/* Pricing & Visibility */}
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-5">
            <h3 className="font-bold text-base text-text border-b border-border pb-3">
              মূল্য ও প্রকাশনা স্ট্যাটাস
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text">কোর্স ফি / বিক্রয়মূল্য (৳)</label>
                <input
                  type="number"
                  value={detailsForm.price}
                  onChange={(e) =>
                    setDetailsForm({ ...detailsForm, price: Number(e.target.value) || 0 })
                  }
                  className="input text-xs font-sans w-full"
                  placeholder="1999"
                />
                <span className="text-[10px] text-text-muted">০ টাকা দিলে কোর্সটি সম্পূর্ণ ফ্রি হবে।</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text">নিয়মিত ফি / আসল মূল্য (৳)</label>
                <input
                  type="number"
                  value={detailsForm.original_price}
                  onChange={(e) =>
                    setDetailsForm({ ...detailsForm, original_price: Number(e.target.value) || 0 })
                  }
                  className="input text-xs font-sans w-full"
                  placeholder="3500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text">পাবলিশ স্ট্যাটাস</label>
                <select
                  value={detailsForm.status}
                  onChange={(e) =>
                    setDetailsForm({ ...detailsForm, status: e.target.value as DbCourse["status"] })
                  }
                  className="input text-xs w-full font-bold"
                >
                  <option value="published">লাইভ পাবলিশড (Published)</option>
                  <option value="draft">ড্রাফট (Draft - গোপন)</option>
                  <option value="archived">আর্কাইভড (Archived)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text">ভর্তি শিক্ষার্থীর সংখ্যা (ডিসপ্লে)</label>
                <input
                  type="number"
                  value={detailsForm.enrollment_count}
                  onChange={(e) =>
                    setDetailsForm({
                      ...detailsForm,
                      enrollment_count: Number(e.target.value) || 0,
                    })
                  }
                  className="input text-xs font-sans w-full"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2 flex items-center gap-3 pt-4">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={detailsForm.is_featured}
                  onChange={(e) =>
                    setDetailsForm({ ...detailsForm, is_featured: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-primary focus:ring-primary"
                />
                <label htmlFor="is_featured" className="text-xs font-bold text-text cursor-pointer">
                  হোমপেজের ফিচারড ও পপুলার সেকশনে প্রদর্শন করুন
                </label>
              </div>
            </div>
          </div>

          {/* Thumbnail & Media */}
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-5">
            <h3 className="font-bold text-base text-text border-b border-border pb-3">
              কোর্স থাম্বনেইল ও ব্যানার
            </h3>

            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <div className="w-full sm:w-60 aspect-video bg-slate-900 rounded-xl overflow-hidden border border-border shrink-0 flex items-center justify-center relative shadow-xs">
                {detailsForm.thumbnail_url ? (
                  <img
                    src={detailsForm.thumbnail_url}
                    alt="Course Thumbnail"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-3">
                    <ImageIcon className="w-8 h-8 text-text-muted mx-auto mb-1 opacity-50" />
                    <span className="text-[11px] text-text-muted">কোনো থাম্বনেইল নেই</span>
                  </div>
                )}
              </div>

              <div className="flex-1 w-full space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleThumbnailUpload(file);
                  }}
                />

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={isUploadingThumb}
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-outline btn-sm text-xs font-bold flex items-center gap-2"
                  >
                    {isUploadingThumb ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                        <span>আপলোড হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>ডিভাইস থেকে আপলোড করুন</span>
                      </>
                    )}
                  </button>
                  <span className="text-xs text-text-muted">বা সরাসরি ইমেজ লিংক দিন:</span>
                </div>

                <input
                  type="url"
                  value={detailsForm.thumbnail_url}
                  onChange={(e) =>
                    setDetailsForm({ ...detailsForm, thumbnail_url: e.target.value })
                  }
                  placeholder="https://..."
                  className="input text-xs font-sans w-full"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Save Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-surface/90 backdrop-blur-md border-t border-border p-3.5 shadow-2xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              মোট {sections.length}টি অধ্যায়ে {totalLessonsCount}টি ক্লাস ({freeLessonsCount}টি ফ্রি, {paidLessonsCount}টি পেইড)
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/courses" className="btn btn-outline btn-sm text-xs">
              বাতিল
            </Link>
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={saving}
              className={`btn btn-sm text-xs font-bold flex items-center gap-2 shadow-md transition-all ${
                saveSuccess
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/20"
                  : "btn-primary"
              }`}
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>সংরক্ষণ হচ্ছে...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  <span>সফলভাবে সংরক্ষিত হয়েছে!</span>
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

      {/* Video Preview Modal */}
      {previewVideoUrl && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                  <Video className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white font-bengali">
                      {previewServerName ? `ভিডিও প্রিভিউ — ${previewServerName}` : "ভিডিও প্রিভিউ টেস্ট"}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono truncate max-w-xs sm:max-w-lg mt-0.5">
                    {cleanAndNormalizeVideoUrl(previewVideoUrl)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={cleanAndNormalizeVideoUrl(previewVideoUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bengali flex items-center gap-1.5 transition-colors"
                  title="ব্রাউজারে নতুন ট্যাবে খুলুন"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">নতুন ট্যাবে দেখুন</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewVideoUrl(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="বন্ধ করুন"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Video Frame: 16:9 responsive container with proper aspect ratio and fit */}
            <div className="aspect-video w-full bg-black relative flex items-center justify-center overflow-hidden">
              <iframe
                src={getEmbedUrl(previewVideoUrl)}
                title="Lesson Video Preview"
                className="w-full h-full border-0 absolute inset-0"
                sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
                referrerPolicy="no-referrer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                scrolling="no"
              />
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-2.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-bengali">
              <span>💡 প্লেয়ারের ভেতরে ফুলস্ক্রিন ও কোয়ালিটি বাটন ব্যবহার করে টেস্ট করতে পারেন।</span>
              <button
                type="button"
                onClick={() => setPreviewVideoUrl(null)}
                className="text-xs text-slate-300 hover:text-white font-bold cursor-pointer transition-colors"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
