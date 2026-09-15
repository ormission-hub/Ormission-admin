"use client";

import { useState, useEffect, useRef } from "react";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Save,
  RotateCcw,
  ExternalLink,
  Layers,
  Eye,
  Check,
  AlertCircle,
  Upload,
  HardDrive,
  Link2,
  Copy,
  FileImage,
  X,
  CloudUpload,
  RefreshCw,
  Sliders,
  CheckCheck,
  ArrowUpRight,
  ShieldCheck,
  Laptop,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { dbService } from "@/lib/supabase/db-service";

interface HeroPhoto {
  id: string;
  title: string;
  url: string;
  is_active: boolean;
  file_size?: number;
  created_at?: string;
}

interface HeroSettings {
  badge_text: string;
  title_line_1: string;
  title_line_2: string;
  subtitle: string;
  primary_cta_text: string;
  primary_cta_url: string;
  secondary_cta_text: string;
  secondary_cta_url: string;
  active_image_url: string;
  card_1_title: string;
  card_1_text: string;
  card_2_title: string;
  card_2_text: string;
  photos: HeroPhoto[];
}

const defaultSettings: HeroSettings = {
  badge_text: "🔥 নতুন একাডেমিক ও এডমিশন ব্যাচে ভর্তি চলছে",
  title_line_1: "স্বপ্ন যেখানে শীর্ষ বিশ্ববিদ্যালয় ও মেডিকেল",
  title_line_2: "প্রস্তুতি হোক শতভাগ নিখুঁত ও আত্মবিশ্বাসী",
  subtitle:
    "অভিজ্ঞ মেন্টরদের লাইভ ক্লাস, বিগত ২০ বছরের প্রশ্নব্যাংক সলভিং ও সার্বক্ষণিক ডাউট সলভিং নিয়ে ঘরে বসেই নিন সেরা প্রস্তুতি।",
  primary_cta_text: "কোর্সগুলো এক্সপ্লোর করুন",
  primary_cta_url: "/courses",
  secondary_cta_text: "ফ্রি নোট ও প্রশ্নব্যাংক",
  secondary_cta_url: "/free-resources",
  active_image_url: "/images/hero-student.jpg",
  card_1_title: "প্রশ্নব্যাংক হ্যাক্স",
  card_1_text: "২০ বছরের নির্ভুল সলভিং",
  card_2_title: "স্টাডি রুটিন",
  card_2_text: "১৪ ঘণ্টার সেরা প্ল্যান",
  photos: [
    {
      id: "hero-1",
      title: "লাইব্রেরিতে অধ্যয়নরত শিক্ষার্থী (অফিশিয়াল)",
      url: "/images/hero-student.jpg",
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "hero-2",
      title: "গ্রুপ স্টাডি ও ডিসকাশন সেশন",
      url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1000&q=80",
      is_active: false,
      created_at: new Date().toISOString(),
    },
    {
      id: "hero-3",
      title: "কম্পিউটার ল্যাব ও কোডিং প্র্যাকটিস",
      url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1000&q=80",
      is_active: false,
      created_at: new Date().toISOString(),
    },
  ],
};

const presetPhotos = [
  {
    title: "আধুনিক ডিজিটাল ক্লাসরুম",
    url: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1000&q=80",
    category: "Classroom",
  },
  {
    title: "মেডিকেল ও সায়েন্স ল্যাব সেশন",
    url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1000&q=80",
    category: "Science",
  },
  {
    title: "অনলাইন ১-অন-১ লাইভ মেন্টরিং",
    url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1000&q=80",
    category: "Mentoring",
  },
];

function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/") && trimmed.length > 1) return true;
  try {
    const parsed = new URL(trimmed);
    return (
      (parsed.protocol === "http:" || parsed.protocol === "https:") &&
      Boolean(parsed.hostname)
    );
  } catch {
    return false;
  }
}

function formatBytes(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function HeroSettingsPage() {
  const [settings, setSettings] = useState<HeroSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"device" | "url" | "presets">("device");
  const [newPhotoTitle, setNewPhotoTitle] = useState("");
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-Carousel Preview State
  const [previewSlideIndex, setPreviewSlideIndex] = useState(0);

  const activePhotos = settings.photos.filter((p) => p.is_active);
  const previewSlides: HeroPhoto[] =
    activePhotos.length > 0
      ? activePhotos
      : settings.photos.length > 0
      ? settings.photos
      : [
          {
            id: "preview-default",
            title: "Hero Preview",
            url: settings.active_image_url || "/images/hero-student.jpg",
            is_active: true,
          },
        ];

  // Auto-slide live mockup in admin preview
  useEffect(() => {
    if (previewSlides.length <= 1) return;
    const interval = setInterval(() => {
      setPreviewSlideIndex((prev) => (prev + 1) % previewSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [previewSlides.length]);

  useEffect(() => {
    if (previewSlideIndex >= previewSlides.length) {
      setPreviewSlideIndex(0);
    }
  }, [previewSlides.length, previewSlideIndex]);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    try {
      const data = await dbService.getHeroSettings();
      if (data && typeof data === "object") {
        setSettings({ ...defaultSettings, ...data });
      }
    } catch (e) {
      console.error("Error loading hero settings:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const success = await dbService.updateHeroSettings(settings);
      if (success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert("Failed to save changes. Please try again.");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to save changes to database.");
    } finally {
      setSaving(false);
    }
  }

  // Toggle photo inclusion in the auto-slider carousel
  function togglePhotoInSlider(photoId: string) {
    setSettings((prev) => {
      const updatedPhotos = prev.photos.map((p) =>
        p.id === photoId ? { ...p, is_active: !p.is_active } : p
      );
      const firstActive = updatedPhotos.find((p) => p.is_active);
      return {
        ...prev,
        photos: updatedPhotos,
        active_image_url: firstActive ? firstActive.url : prev.active_image_url,
      };
    });
  }

  // Set ONLY this photo as active (single banner mode)
  function setOnlyActivePhoto(photoId: string) {
    setSettings((prev) => {
      const updatedPhotos = prev.photos.map((p) => ({
        ...p,
        is_active: p.id === photoId,
      }));
      const targetPhoto = updatedPhotos.find((p) => p.id === photoId);
      return {
        ...prev,
        photos: updatedPhotos,
        active_image_url: targetPhoto ? targetPhoto.url : prev.active_image_url,
      };
    });
  }

  // Include all photos in the auto-slider carousel
  function selectAllInSlider() {
    setSettings((prev) => ({
      ...prev,
      photos: prev.photos.map((p) => ({ ...p, is_active: true })),
    }));
  }

  // Set a photo as active (backward compatible)
  function setActivePhoto(photoId: string) {
    togglePhotoInSlider(photoId);
  }

  // Delete a photo from gallery
  function deletePhoto(photoId: string) {
    const target = settings.photos.find((p) => p.id === photoId);
    if (!confirm(`Are you sure you want to delete "${target?.title}"?`)) return;

    setSettings((prev) => {
      const remaining = prev.photos.filter((p) => p.id !== photoId);
      const firstActive = remaining.find((p) => p.is_active) || remaining[0];
      return {
        ...prev,
        photos: remaining,
        active_image_url: firstActive ? firstActive.url : "/images/hero-student.jpg",
      };
    });
  }

  // Copy link
  function copyLink(url: string, id: string) {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  // Handle local file selection
  function handleFileChange(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (JPG, PNG, WEBP, GIF).");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage("File size exceeds 8MB limit. Please choose a smaller photo.");
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);

    // Default title from filename
    const cleanTitle = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    if (!newPhotoTitle) {
      setNewPhotoTitle(cleanTitle);
    }

    // Generate local preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setFilePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  // Handle Drag & Drop
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  }

  // Upload file from device to Supabase Storage
  async function handleDeviceUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage("Please select an image file to upload.");
      return;
    }
    if (!newPhotoTitle.trim()) {
      setErrorMessage("Please enter a title for the photo.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      setUploadProgress(45);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setUploadProgress(85);

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Upload failed");
      }

      setUploadProgress(100);

      const uploadedPhoto: HeroPhoto = {
        id: `hero-${Date.now()}`,
        title: newPhotoTitle.trim(),
        url: data.url,
        is_active: false,
        file_size: selectedFile.size,
        created_at: new Date().toISOString(),
      };

      const updatedPhotos = [uploadedPhoto, ...settings.photos];
      setSettings((prev) => ({
        ...prev,
        photos: updatedPhotos,
      }));

      // Automatically sync to Supabase settings
      await dbService.updateHeroSettings({
        ...settings,
        photos: updatedPhotos,
      });

      closeModal();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload error";
      console.error(err);
      setErrorMessage(`Upload failed: ${msg}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }

  // Handle Web URL add
  function handleAddUrl(e: React.FormEvent) {
    e.preventDefault();
    if (!newPhotoTitle.trim() || !newPhotoUrl.trim()) {
      setErrorMessage("Please provide a photo title and valid image URL.");
      return;
    }
    if (!isValidImageUrl(newPhotoUrl)) {
      setErrorMessage("Please enter a valid HTTP/HTTPS image URL or local path.");
      return;
    }

    const newPhoto: HeroPhoto = {
      id: `hero-${Date.now()}`,
      title: newPhotoTitle.trim(),
      url: newPhotoUrl.trim(),
      is_active: false,
      created_at: new Date().toISOString(),
    };

    const updated = [newPhoto, ...settings.photos];
    setSettings((prev) => ({
      ...prev,
      photos: updated,
    }));

    dbService.updateHeroSettings({
      ...settings,
      photos: updated,
    });

    closeModal();
  }

  // Add from preset
  function addPresetPhoto(preset: (typeof presetPhotos)[0]) {
    const exists = settings.photos.some((p) => p.url === preset.url);
    if (exists) {
      alert("This photo is already in your gallery.");
      return;
    }
    const newP: HeroPhoto = {
      id: `hero-${Date.now()}`,
      title: preset.title,
      url: preset.url,
      is_active: false,
      created_at: new Date().toISOString(),
    };

    const updated = [...settings.photos, newP];
    setSettings((prev) => ({ ...prev, photos: updated }));
    dbService.updateHeroSettings({ ...settings, photos: updated });
  }

  function closeModal() {
    setIsAddModalOpen(false);
    setSelectedFile(null);
    setFilePreview(null);
    setNewPhotoTitle("");
    setNewPhotoUrl("");
    setErrorMessage(null);
    setIsUploading(false);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-xs text-text-muted font-medium animate-pulse">
          Loading Hero CMS Settings & Visuals...
        </p>
      </div>
    );
  }

  const activePhoto = settings.photos.find((p) => p.is_active);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* 1. Header Glassmorphic Command Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-3xl border border-border/80 bg-surface/85 backdrop-blur-xl shadow-xl shadow-primary/5 p-6 sm:p-8"
      >
        {/* Ambient Gradient Glow Accents */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span>Hero Banner & Visuals CMS</span>
              <span className="w-1 h-1 rounded-full bg-primary/40" />
              <span className="text-[11px] text-text-muted font-bengali">হিরো ব্যানার কন্ট্রোল</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight flex items-center gap-3">
              Hero Section & Media Studio
            </h1>

            <p className="text-xs sm:text-sm text-text-muted max-w-2xl leading-relaxed">
              Upload banners directly from your device, manage real-time active photography, and
              customize headlines with instant live preview.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:opacity-95 shadow-md shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Photo</span>
              <span className="text-[10px] opacity-80 font-bengali">ছবি আপলোড</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCheck className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={loadSettings}
              disabled={loading || saving}
              className="p-2.5 rounded-xl text-text-muted hover:text-text bg-surface-secondary/80 hover:bg-surface-secondary border border-border transition-colors"
              title="Reload from Cloud"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick KPI Cards Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-border/60">
          <div className="p-3 rounded-xl bg-surface-secondary/50 border border-border/50">
            <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
              Total Photos
            </div>
            <div className="text-lg font-extrabold text-text mt-0.5">
              {settings.photos.length} <span className="text-xs font-normal text-text-muted">images</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-surface-secondary/50 border border-border/50">
            <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
              Slider Status
            </div>
            <div className="text-xs font-bold text-primary truncate mt-1">
              {activePhotos.length > 1
                ? `${activePhotos.length} slides rotating 🔄`
                : activePhotos.length === 1
                ? "1 active banner 📌"
                : "Default banner"}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-surface-secondary/50 border border-border/50">
            <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
              Storage Engine
            </div>
            <div className="text-xs font-bold text-emerald-500 flex items-center gap-1 mt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Supabase Storage</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-surface-secondary/50 border border-border/50">
            <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
              Status
            </div>
            <div className="text-xs font-bold text-emerald-500 flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live & Synchronized</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Photo Gallery Studio (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Gallery Header Card */}
          <div className="rounded-3xl border border-border/80 bg-surface/85 backdrop-blur-md p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-text flex items-center gap-2">
                  <FileImage className="w-5 h-5 text-primary" />
                  <span>Hero Photo Gallery & Auto-Slider</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                    {settings.photos.length}
                  </span>
                </h2>
                <p className="text-xs text-text-muted mt-0.5 font-bengali">
                  স্লাইডারে এক বা একাধিক ছবি যুক্ত করতে &quot;স্লাইডারে রাখুন&quot; টগল করুন।
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAllInSlider}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-text-muted hover:text-text bg-surface-secondary/80 hover:bg-surface-secondary border border-border hover:border-primary/40 transition-colors"
                  title="Include all photos in auto-slider"
                >
                  All in Slider
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Photo</span>
                </button>
              </div>
            </div>

            {/* Gallery Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AnimatePresence>
                {settings.photos.map((photo) => {
                  const isCurActive = photo.is_active;
                  return (
                    <motion.div
                      key={photo.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ y: -3 }}
                      transition={{ duration: 0.2 }}
                      className={`
                        group relative rounded-2xl border overflow-hidden transition-all duration-200
                        bg-surface backdrop-blur-md flex flex-col
                        ${
                          isCurActive
                            ? "border-primary ring-2 ring-primary/20 shadow-lg shadow-primary/10"
                            : "border-border/80 hover:border-primary/50 hover:shadow-md"
                        }
                      `}
                    >
                      {/* Image Preview Box (16:9) */}
                      <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.url}
                          alt={photo.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/images/hero-student.jpg";
                          }}
                        />

                        {/* Top Left Status Badge */}
                        <div className="absolute top-2.5 left-2.5 z-10">
                          {isCurActive ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600/90 text-white text-[11px] font-bold shadow-md shadow-emerald-600/30 backdrop-blur-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                              <span>In Slider</span>
                              <span className="opacity-80 text-[10px] font-bengali">সক্রিয়</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 text-white/70 text-[10px] font-medium backdrop-blur-xs">
                              Off / অফ
                            </span>
                          )}
                        </div>

                        {/* Top Right Quick Actions */}
                        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => copyLink(photo.url, photo.id)}
                            className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white text-xs backdrop-blur-xs shadow-sm transition-colors"
                            title="Copy Image URL"
                          >
                            {copiedId === photo.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Card Content & Footer Actions */}
                      <div className="p-3.5 flex-1 flex flex-col justify-between gap-3 bg-surface">
                        <div>
                          <h3
                            className="text-xs font-bold text-text truncate"
                            title={photo.title}
                          >
                            {photo.title}
                          </h3>
                          <div className="flex items-center gap-2 text-[10px] text-text-muted mt-0.5">
                            <span>
                              {photo.url.includes("supabase.co")
                                ? "Cloud Storage"
                                : photo.url.startsWith("http")
                                ? "Web Link"
                                : "Local Asset"}
                            </span>
                            {photo.file_size ? (
                              <>
                                <span>•</span>
                                <span>{formatBytes(photo.file_size)}</span>
                              </>
                            ) : null}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60">
                          <button
                            type="button"
                            onClick={() => togglePhotoInSlider(photo.id)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isCurActive
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-red-500/10 hover:text-red-500"
                                : "bg-primary/10 text-primary hover:bg-primary hover:text-white"
                            }`}
                            title={isCurActive ? "Click to remove from slider" : "Click to include in slider"}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{isCurActive ? "In Slider ✓" : "Add to Slider"}</span>
                          </button>

                          <div className="flex items-center gap-1">
                            {!isCurActive && (
                              <button
                                type="button"
                                onClick={() => setOnlyActivePhoto(photo.id)}
                                className="px-2 py-1.5 rounded-lg text-[11px] font-medium text-text-muted hover:text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
                                title="Make this the only active photo"
                              >
                                Only This
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => deletePhoto(photo.id)}
                              className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                              title="Delete from gallery"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Curated Preset Library */}
          <div className="rounded-3xl border border-border/80 bg-surface/85 backdrop-blur-md p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-text flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span>Curated High-Resolution Presets</span>
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Click to add professionally licensed educational banners into your collection:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {presetPhotos.map((preset, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-border overflow-hidden group bg-surface-secondary/40 hover:border-primary/50 transition-all"
                >
                  <div className="relative aspect-video w-full bg-slate-800 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preset.url}
                      alt={preset.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/hero-student.jpg";
                      }}
                    />
                    <span className="absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-xs">
                      {preset.category}
                    </span>
                  </div>

                  <div className="p-3 flex items-center justify-between gap-1">
                    <span className="text-[11px] font-bold text-text truncate">
                      {preset.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => addPresetPhoto(preset)}
                      className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                      title="Add to gallery"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Website Mockup & Copy Customizer (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Preview Browser Mockup */}
          <div className="rounded-3xl border border-border/80 bg-surface/85 backdrop-blur-xl p-5 shadow-lg space-y-4">
            {/* macOS Browser Title Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-[11px] font-bold text-text-muted ml-2 flex items-center gap-1">
                  <Laptop className="w-3 h-3 text-primary" />
                  <span>Live Website Preview</span>
                </span>
              </div>

              <div className="px-2.5 py-0.5 rounded-lg bg-surface-secondary text-[10px] text-text-muted font-mono flex items-center gap-1">
                <span>ormission.com/</span>
              </div>
            </div>

            {/* Browser Window View */}
            {/* Browser Window View: Netflix-Style Billboard Preview */}
            <div className="rounded-2xl border border-border/60 bg-background p-3 relative overflow-hidden shadow-inner space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-text-muted px-1">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span>Hero Banner Billboard</span>
                </span>
                <span className="text-[10px] text-text-muted/70">16:9 Full Slider</span>
              </div>

              {/* Active Image with Auto Carousel Preview (16:9 Aspect Video) */}
              <div className="relative rounded-xl overflow-hidden aspect-video w-full border border-border shadow-md group bg-slate-950">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={previewSlides[previewSlideIndex]?.id || previewSlideIndex}
                    initial={{ opacity: 0, scale: 1.01 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.99 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 w-full h-full"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewSlides[previewSlideIndex]?.url || "/images/hero-student.jpg"}
                      alt="Active Hero Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/hero-student.jpg";
                      }}
                    />

                    {/* Dark gradient overlay for contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                    {/* Over-Image CTA Buttons (Netflix Style Preview) */}
                    <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1.5 pointer-events-none">
                      <span className="px-2.5 py-1 rounded-full bg-primary text-white text-[9px] font-bold shadow-md shadow-primary/30 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>{settings.primary_cta_text || "Start Courses"}</span>
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-black/50 text-white text-[9px] font-bold border border-white/30 backdrop-blur-xs flex items-center gap-1">
                        <BookOpen className="w-2.5 h-2.5" />
                        <span>{settings.secondary_cta_text || "Free Learning"}</span>
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {previewSlides.length > 1 && (
                  <>
                    {/* Top Right Counter */}
                    <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs flex items-center gap-1">
                      <span>{previewSlideIndex + 1}</span>
                      <span className="opacity-50">/</span>
                      <span>{previewSlides.length}</span>
                    </div>

                    {/* Prev / Next Chevrons */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setPreviewSlideIndex(
                          (prev) => (prev - 1 + previewSlides.length) % previewSlides.length
                        );
                      }}
                      className="absolute left-1.5 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setPreviewSlideIndex((prev) => (prev + 1) % previewSlides.length);
                      }}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Bottom Right Dots */}
                    <div className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-xs border border-white/15">
                      {previewSlides.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setPreviewSlideIndex(idx)}
                          className={`transition-all rounded-full cursor-pointer ${
                            idx === previewSlideIndex
                              ? "w-3.5 h-1 bg-primary"
                              : "w-1 h-1 bg-white/50 hover:bg-white/80"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Copy & CTA Customizer Form */}
          <div className="rounded-3xl border border-border/80 bg-surface/85 backdrop-blur-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-text flex items-center gap-2">
                <Sliders className="w-4 h-4 text-primary" />
                <span>Text & Headline Customizer</span>
              </h3>
              <span className="text-[10px] text-text-muted font-bengali">টেক্সট এডিটর</span>
            </div>

            {/* Top Announcement Badge */}
            <div>
              <label className="block text-xs font-bold text-text-muted mb-1">
                Announcement Top Badge
              </label>
              <input
                type="text"
                value={settings.badge_text}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, badge_text: e.target.value }))
                }
                className="input w-full text-xs font-bengali"
              />
            </div>

            {/* Headline Line 1 */}
            <div>
              <label className="block text-xs font-bold text-text-muted mb-1">
                Headline Line 1 (মুখ্য শিরোনাম ১)
              </label>
              <input
                type="text"
                value={settings.title_line_1}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, title_line_1: e.target.value }))
                }
                className="input w-full text-xs font-bengali"
              />
            </div>

            {/* Headline Line 2 */}
            <div>
              <label className="block text-xs font-bold text-text-muted mb-1">
                Headline Line 2 (হাইলাইট শিরোনাম ২)
              </label>
              <input
                type="text"
                value={settings.title_line_2}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, title_line_2: e.target.value }))
                }
                className="input w-full text-xs font-bengali"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-xs font-bold text-text-muted mb-1">
                Subtitle Description (উপশিরোনাম)
              </label>
              <textarea
                rows={3}
                value={settings.subtitle}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, subtitle: e.target.value }))
                }
                className="input w-full text-xs font-bengali leading-relaxed"
              />
            </div>

            {/* CTA Buttons Row: Primary (Start Courses) & Secondary (Free Learning) */}
            <div className="space-y-3 pt-3 border-t border-border/60">
              <div className="text-xs font-bold text-text flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Hero Slider Buttons (হিরো স্লাইডারের বাটনসমূহ)</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {/* Primary CTA (Start Courses) */}
                <div className="p-3 rounded-2xl bg-surface-secondary/40 border border-border/60 space-y-2">
                  <div className="text-[11px] font-bold text-primary flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Primary Button (প্রধান বাটন)</span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-text-muted mb-1">
                      Button Label (বাটন টেক্সট)
                    </label>
                    <input
                      type="text"
                      value={settings.primary_cta_text}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, primary_cta_text: e.target.value }))
                      }
                      placeholder="Start Courses"
                      className="input w-full text-xs font-bengali"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-text-muted mb-1">
                      Button Link (বাটন লিঙ্ক)
                    </label>
                    <input
                      type="text"
                      value={settings.primary_cta_url}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, primary_cta_url: e.target.value }))
                      }
                      placeholder="/courses"
                      className="input w-full text-xs"
                    />
                  </div>
                </div>

                {/* Secondary CTA (Free Learning) */}
                <div className="p-3 rounded-2xl bg-surface-secondary/40 border border-border/60 space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span>Secondary Button (দ্বিতীয় বাটন)</span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-text-muted mb-1">
                      Button Label (বাটন টেক্সট)
                    </label>
                    <input
                      type="text"
                      value={settings.secondary_cta_text}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, secondary_cta_text: e.target.value }))
                      }
                      placeholder="Free Learning"
                      className="input w-full text-xs font-bengali"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-text-muted mb-1">
                      Button Link (বাটন লিঙ্ক)
                    </label>
                    <input
                      type="text"
                      value={settings.secondary_cta_url}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, secondary_cta_url: e.target.value }))
                      }
                      placeholder="/free-resources"
                      className="input w-full text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. State-of-the-Art Add/Upload Photo Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg rounded-3xl border border-border/80 bg-surface backdrop-blur-2xl shadow-2xl p-6 sm:p-7 z-10 space-y-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                    <CloudUpload className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text">Add Hero Banner Photo</h3>
                    <p className="text-[11px] text-text-muted font-bengali">
                      আপনার ডিভাইস থেকে ছবি আপলোড করুন অথবা ওয়েব লিঙ্ক দিন
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-secondary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tabs: Device File vs Web URL */}
              <div className="flex rounded-xl bg-surface-secondary/70 p-1 border border-border">
                <button
                  type="button"
                  onClick={() => setActiveTab("device")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === "device"
                      ? "bg-surface text-primary shadow-xs"
                      : "text-text-muted hover:text-text"
                  }`}
                >
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>Device Upload</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("url")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === "url"
                      ? "bg-surface text-primary shadow-xs"
                      : "text-text-muted hover:text-text"
                  }`}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Web URL</span>
                </button>
              </div>

              {/* Error Message if any */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Tab 1: Device File Upload */}
              {activeTab === "device" && (
                <form onSubmit={handleDeviceUpload} className="space-y-4">
                  {/* Drag and Drop Zone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                      relative rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200
                      ${
                        dragOver
                          ? "border-primary bg-primary/10 scale-[1.01]"
                          : "border-border hover:border-primary/50 hover:bg-surface-secondary/40"
                      }
                    `}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) =>
                        handleFileChange(e.target.files ? e.target.files[0] : null)
                      }
                    />

                    {filePreview ? (
                      <div className="space-y-3">
                        <div className="relative aspect-video w-full max-h-56 rounded-xl overflow-hidden border border-border mx-auto">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={filePreview}
                            alt="Local preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-primary">
                          <span>{selectedFile?.name}</span>
                          <span className="text-text-muted font-normal">
                            ({formatBytes(selectedFile?.size)})
                          </span>
                        </div>
                        <p className="text-[11px] text-text-muted">
                          Click or drag another image to change
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 py-3">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div className="text-xs font-bold text-text">
                          Drag & drop your banner image here, or{" "}
                          <span className="text-primary underline">browse</span>
                        </div>
                        <p className="text-[11px] text-text-muted font-bengali">
                          16:9 ব্যানার (1920x1080 বা 1280x720) • JPG, PNG, WEBP (সর্বোচ্চ ৮ MB)
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Title Input */}
                  <div>
                    <label className="block text-xs font-bold text-text-muted mb-1.5">
                      Photo Title (ছবির শিরোনাম) *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ক্লাসরুমে অধ্যয়নরত শিক্ষার্থী"
                      value={newPhotoTitle}
                      onChange={(e) => setNewPhotoTitle(e.target.value)}
                      className="input w-full text-xs font-bengali"
                      required
                    />
                  </div>

                  {/* Upload Progress Bar */}
                  {isUploading && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-text-muted">
                        <span>Uploading to Supabase Cloud...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-surface-secondary overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300 rounded-full"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Submit / Cancel Buttons */}
                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                    <button
                      type="button"
                      onClick={closeModal}
                      disabled={isUploading}
                      className="btn btn-outline text-xs px-4 py-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!selectedFile || isUploading}
                      className="btn btn-primary text-xs px-5 py-2 inline-flex items-center gap-2"
                    >
                      {isUploading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload & Save</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Tab 2: Web URL input */}
              {activeTab === "url" && (
                <form onSubmit={handleAddUrl} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-text-muted mb-1.5">
                      Photo Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. নতুন ডিজিটাল ল্যাব"
                      value={newPhotoTitle}
                      onChange={(e) => setNewPhotoTitle(e.target.value)}
                      className="input w-full text-xs font-bengali"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-muted mb-1.5">
                      Direct Image URL *
                    </label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/... or /images/..."
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                      className="input w-full text-xs"
                      required
                    />
                  </div>

                  {/* URL Live Preview (16:9) */}
                  {isValidImageUrl(newPhotoUrl) ? (
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-border bg-slate-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={newPhotoUrl.trim()}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    </div>
                  ) : newPhotoUrl.trim() ? (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2 font-bengali">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>সঠিক ইমেজ URL দিন (উদাঃ https://... অথবা /images/...)</span>
                    </div>
                  ) : null}

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="btn btn-outline text-xs px-4 py-2"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary text-xs px-5 py-2">
                      Add to Gallery
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
