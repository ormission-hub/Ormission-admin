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
  Clock,
  ArrowUp,
  ArrowDown,
  ListOrdered,
  SlidersHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { dbService } from "@/lib/supabase/db-service";

interface HeroPhoto {
  id: string;
  title: string;
  url: string;
  is_active: boolean;
  order?: number;
  duration?: number; // In seconds (default: 5)
  file_size?: number;
  created_at?: string;
  primary_cta_text?: string;
  primary_cta_url?: string;
  secondary_cta_text?: string;
  secondary_cta_url?: string;
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
  autoplay_interval?: number; // Global default slide duration in seconds (default: 5)
  card_1_title: string;
  card_1_text: string;
  card_2_title: string;
  card_2_text: string;
  photos: HeroPhoto[];
}

const defaultSettings: HeroSettings = {
  badge_text: "🔥 নতুন একাডেমিক ও এডমিশন ব্যাচে ভর্তি চলছে",
  title_line_1: "Learn Today.",
  title_line_2: "Lead Tomorrow.",
  subtitle: "আজ শিখুন। আগামীকাল নেতৃত্ব দিন।",
  primary_cta_text: "Browse Course",
  primary_cta_url: "/courses",
  secondary_cta_text: "Buy Book",
  secondary_cta_url: "/courses",
  active_image_url:
    "https://oorovtqwyfrfjfwuufyi.supabase.co/storage/v1/object/public/hero_images/hero_1789478404991_a7wl8n.jpg",
  autoplay_interval: 5,
  card_1_title: "লাইভ ক্লাস",
  card_1_text: "ইন্টারেক্টিভ লার্নিং",
  card_2_title: "PDF নোটস",
  card_2_text: "হ্যান্ডনোট ও প্রশ্নব্যাংক",
  photos: [
    {
      id: "hero-user-uploaded",
      title: "নতুন আপলোড করা ব্যানার",
      url: "https://oorovtqwyfrfjfwuufyi.supabase.co/storage/v1/object/public/hero_images/hero_1789478404991_a7wl8n.jpg",
      is_active: true,
      order: 1,
      duration: 5,
      created_at: new Date().toISOString(),
    },
    {
      id: "hero-admission-2026",
      title: "Admission 2026 Premium Batch",
      url: "https://oorovtqwyfrfjfwuufyi.supabase.co/storage/v1/object/public/hero_images/hero_1789356392635_x4rpk6.webp",
      is_active: true,
      order: 2,
      duration: 5,
      created_at: new Date().toISOString(),
    },
    {
      id: "hero-model-student",
      title: "Learn Today. Lead Tomorrow. Student Hero (অফিশিয়াল)",
      url: "/images/hero-student-model.jpg",
      is_active: true,
      order: 3,
      duration: 5,
      created_at: new Date().toISOString(),
    },
  ],
};

const presetPhotos = [
  {
    title: "Admission 2026 Premium Batch Banner",
    url: "https://oorovtqwyfrfjfwuufyi.supabase.co/storage/v1/object/public/hero_images/hero_1789356392635_x4rpk6.webp",
    category: "Admission Batch",
  },
  {
    title: "Varsity & Medical Batch Banner",
    url: "https://oorovtqwyfrfjfwuufyi.supabase.co/storage/v1/object/public/hero_images/hero_1789398376442_xjm3yr.webp",
    category: "Medical & Varsity",
  },
  {
    title: "অফিশিয়াল স্টুডেন্ট মডেল (Learn Today. Lead Tomorrow.)",
    url: "/images/hero-student-model.jpg",
    category: "Official Hero",
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

  // Sort photos by serial order
  const sortedPhotos = [...settings.photos].sort(
    (a, b) => (a.order ?? 999) - (b.order ?? 999)
  );
  const activePhotos = sortedPhotos.filter((p) => p.is_active);

  const previewSlides: HeroPhoto[] =
    activePhotos.length > 0
      ? activePhotos
      : sortedPhotos.length > 0
        ? sortedPhotos
        : [
          {
            id: "preview-default",
            title: "Hero Preview",
            url: settings.active_image_url || "/images/hero-student-model.jpg",
            is_active: true,
            order: 1,
            duration: 5,
          },
        ];

  // Auto-slide live mockup in admin preview respecting slide duration
  useEffect(() => {
    if (previewSlides.length <= 1) return;
    const curSlide = previewSlides[previewSlideIndex] || previewSlides[0];
    const durationSeconds = curSlide?.duration || settings.autoplay_interval || 5;
    const timer = setTimeout(() => {
      setPreviewSlideIndex((prev) => (prev + 1) % previewSlides.length);
    }, durationSeconds * 1000);
    return () => clearTimeout(timer);
  }, [previewSlides, previewSlideIndex, settings.autoplay_interval]);

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
        // Strip out any mock/stock photos from unsplash or legacy placeholder
        const rawPhotos = Array.isArray(data.photos) ? data.photos : defaultSettings.photos;
        const cleanedPhotos = rawPhotos.filter(
          (p: any) => p && p.url && !p.url.includes("images.unsplash.com") && p.url !== "/images/hero-student.jpg"
        );
        const mapped = (cleanedPhotos.length > 0 ? cleanedPhotos : defaultSettings.photos).map(
          (p: any, idx: number) => ({
            ...p,
            order: typeof p.order === "number" ? p.order : idx + 1,
            duration: typeof p.duration === "number" ? p.duration : 5,
          })
        );
        mapped.sort((a: any, b: any) => (a.order ?? 999) - (b.order ?? 999));

        const activeImg =
          data.active_image_url &&
          !data.active_image_url.includes("images.unsplash.com") &&
          data.active_image_url !== "/images/hero-student.jpg"
            ? data.active_image_url
            : mapped[0]?.url || "/images/hero-student-model.jpg";

        setSettings({
          ...defaultSettings,
          ...data,
          autoplay_interval: data.autoplay_interval || 5,
          photos: mapped,
          active_image_url: activeImg,
        });
      }
    } catch (e) {
      console.error("Error loading hero settings:", e);
    } finally {
      setLoading(false);
    }
  }

  // Move photo in serial order (Up/Down)
  async function movePhoto(photoId: string, direction: "up" | "down") {
    const sorted = [...settings.photos].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    const idx = sorted.findIndex((p) => p.id === photoId);
    if (idx === -1) return;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;

    const temp = sorted[idx];
    sorted[idx] = sorted[targetIdx];
    sorted[targetIdx] = temp;

    const normalized = sorted.map((p, i) => ({ ...p, order: i + 1 }));
    const firstActive = normalized.find((p) => p.is_active) || normalized[0];

    const newSettings = {
      ...settings,
      photos: normalized,
      active_image_url: firstActive ? firstActive.url : settings.active_image_url,
    };
    setSettings(newSettings);
    await dbService.updateHeroSettings(newSettings);
  }

  // Bring photo to first rank (#1)
  async function makePhotoFirst(photoId: string) {
    const sorted = [...settings.photos].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    const idx = sorted.findIndex((p) => p.id === photoId);
    if (idx <= 0) return;

    const [target] = sorted.splice(idx, 1);
    sorted.unshift(target);

    const normalized = sorted.map((p, i) => ({ ...p, order: i + 1 }));
    const firstActive = normalized.find((p) => p.is_active) || normalized[0];

    const newSettings = {
      ...settings,
      photos: normalized,
      active_image_url: firstActive ? firstActive.url : settings.active_image_url,
    };
    setSettings(newSettings);
    await dbService.updateHeroSettings(newSettings);
  }

  // Update duration in seconds for a specific photo
  async function updatePhotoDuration(photoId: string, seconds: number) {
    const valid = Math.max(1, Math.min(60, Number(seconds) || 5));
    const updatedPhotos = settings.photos.map((p) =>
      p.id === photoId ? { ...p, duration: valid } : p
    );
    const newSettings = {
      ...settings,
      photos: updatedPhotos,
    };
    setSettings(newSettings);
    await dbService.updateHeroSettings(newSettings);
  }

  // Update order directly
  async function updatePhotoOrder(photoId: string, newOrder: number) {
    const valid = Math.max(1, Math.min(settings.photos.length, Number(newOrder) || 1));
    const updatedPhotos = settings.photos.map((p) =>
      p.id === photoId ? { ...p, order: valid } : p
    );
    updatedPhotos.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    const normalized = updatedPhotos.map((p, i) => ({ ...p, order: i + 1 }));
    const firstActive = normalized.find((p) => p.is_active) || normalized[0];

    const newSettings = {
      ...settings,
      photos: normalized,
      active_image_url: firstActive ? firstActive.url : settings.active_image_url,
    };
    setSettings(newSettings);
    await dbService.updateHeroSettings(newSettings);
  }

  // Update global slide interval
  async function updateGlobalInterval(seconds: number) {
    const valid = Math.max(2, Math.min(30, Number(seconds) || 5));
    const newSettings = {
      ...settings,
      autoplay_interval: valid,
    };
    setSettings(newSettings);
    await dbService.updateHeroSettings(newSettings);
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

  // Toggle photo inclusion in the auto-slider carousel & auto-save to database
  async function togglePhotoInSlider(photoId: string) {
    const updatedPhotos = settings.photos.map((p) =>
      p.id === photoId ? { ...p, is_active: !p.is_active } : p
    );
    const firstActive = updatedPhotos.find((p) => p.is_active) || updatedPhotos[0];
    const newSettings = {
      ...settings,
      photos: updatedPhotos,
      active_image_url: firstActive ? firstActive.url : settings.active_image_url,
    };
    setSettings(newSettings);
    await dbService.updateHeroSettings(newSettings);
  }

  // Set ONLY this photo as active (single banner mode) & auto-save
  async function setOnlyActivePhoto(photoId: string) {
    const updatedPhotos = settings.photos.map((p) => ({
      ...p,
      is_active: p.id === photoId,
    }));
    const targetPhoto = updatedPhotos.find((p) => p.id === photoId);
    const newSettings = {
      ...settings,
      photos: updatedPhotos,
      active_image_url: targetPhoto ? targetPhoto.url : settings.active_image_url,
    };
    setSettings(newSettings);
    await dbService.updateHeroSettings(newSettings);
  }

  // Include all photos in the auto-slider carousel & auto-save
  async function selectAllInSlider() {
    const updatedPhotos = settings.photos.map((p) => ({ ...p, is_active: true }));
    const newSettings = {
      ...settings,
      photos: updatedPhotos,
    };
    setSettings(newSettings);
    await dbService.updateHeroSettings(newSettings);
  }

  // Set a photo as active (backward compatible)
  function setActivePhoto(photoId: string) {
    togglePhotoInSlider(photoId);
  }

  // Delete a photo from gallery & auto-save
  async function deletePhoto(photoId: string) {
    const target = settings.photos.find((p) => p.id === photoId);
    if (!confirm(`Are you sure you want to delete "${target?.title}"?`)) return;

    const remaining = settings.photos.filter((p) => p.id !== photoId);
    const firstActive = remaining.find((p) => p.is_active) || remaining[0];
    const newSettings = {
      ...settings,
      photos: remaining,
      active_image_url: firstActive ? firstActive.url : (presetPhotos[0]?.url || "/images/hero-student-model.jpg"),
    };
    setSettings(newSettings);
    await dbService.updateHeroSettings(newSettings);
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
        is_active: true,
        order: settings.photos.length + 1,
        duration: 5,
        file_size: selectedFile.size,
        created_at: new Date().toISOString(),
      };

      const updatedPhotos = [uploadedPhoto, ...settings.photos];
      const newSettings = {
        ...settings,
        photos: updatedPhotos,
        active_image_url: uploadedPhoto.url,
      };
      setSettings(newSettings);

      // Automatically sync to Supabase settings
      await dbService.updateHeroSettings(newSettings);

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
  async function handleAddUrl(e: React.FormEvent) {
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
      is_active: true,
      order: settings.photos.length + 1,
      duration: 5,
      created_at: new Date().toISOString(),
    };

    const updated = [newPhoto, ...settings.photos];
    const newSettings = {
      ...settings,
      photos: updated,
      active_image_url: newPhoto.url,
    };
    setSettings(newSettings);

    await dbService.updateHeroSettings(newSettings);

    closeModal();
  }

  // Add from preset
  async function addPresetPhoto(preset: (typeof presetPhotos)[0]) {
    const exists = settings.photos.some((p) => p.url === preset.url);
    if (exists) {
      alert("This photo is already in your gallery.");
      return;
    }
    const newP: HeroPhoto = {
      id: `hero-${Date.now()}`,
      title: preset.title,
      url: preset.url,
      is_active: true,
      order: settings.photos.length + 1,
      duration: 5,
      created_at: new Date().toISOString(),
    };

    const updated = [newP, ...settings.photos];
    const newSettings = {
      ...settings,
      photos: updated,
      active_image_url: newP.url,
    };
    setSettings(newSettings);
    await dbService.updateHeroSettings(newSettings);
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

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-text tracking-tight flex items-center gap-3">
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Photo</span>
                </button>
              </div>
            </div>

            {/* Gallery Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sortedPhotos.map((photo, idx) => {
                  const isCurActive = photo.is_active;
                  return (
                    <div
                      key={photo.id}
                      className={`
                        group relative rounded-2xl border overflow-hidden transition-all duration-300
                        bg-surface backdrop-blur-md flex flex-col hover:-translate-y-1
                        ${isCurActive
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

                        {/* Top Left Status & Serial Badge */}
                        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/85 text-amber-400 border border-amber-400/40 text-sm font-black shadow-lg backdrop-blur-sm font-mono tracking-tight">
                            #{photo.order ?? idx + 1}
                          </span>
                          {isCurActive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/90 text-white text-[11px] font-bold shadow-md shadow-emerald-600/30 backdrop-blur-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                              <span>In Slider</span>
                              <span className="opacity-80 text-[10px] font-bengali">সক্রিয়</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 text-white/70 text-[10px] font-medium backdrop-blur-xs">
                              Off / অফ
                            </span>
                          )}
                        </div>

                        {/* Top Right: Duration Badge on Image */}
                        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-black/85 text-amber-300 border border-amber-400/30 text-[11px] font-bold shadow-lg backdrop-blur-sm font-mono">
                            <Clock className="w-3 h-3" />
                            {photo.duration || 5}s
                          </span>
                          <button
                            type="button"
                            onClick={() => copyLink(photo.url, photo.id)}
                            className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white text-xs backdrop-blur-xs shadow-sm transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
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

                      {/* Card Content & Sequence/Timing Studio */}
                      <div className="p-3.5 flex-1 flex flex-col justify-between gap-2.5 bg-surface">
                        {/* Title Row */}
                        <div className="flex items-start justify-between gap-2">
                          <h3
                            className="text-xs font-bold text-text truncate flex-1"
                            title={photo.title}
                          >
                            {photo.title}
                          </h3>
                          <div className="flex items-center gap-1.5 text-[10px] text-text-muted shrink-0">
                            <span>
                              {photo.url.includes("supabase.co")
                                ? "☁️ Cloud"
                                : photo.url.startsWith("http")
                                  ? "🔗 Web"
                                  : "📁 Local"}
                            </span>
                            {photo.file_size ? (
                              <span className="font-mono">• {formatBytes(photo.file_size)}</span>
                            ) : null}
                          </div>
                        </div>

                        {/* Serial Sequence Controls — Row */}
                        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-surface-secondary/60 border border-border/50">
                          <div className="flex items-center gap-1.5">
                            <ListOrdered className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="text-[10px] font-bold text-text font-bengali">সিরিয়াল:</span>
                            <span className="w-6 h-6 rounded-lg bg-primary/15 text-primary font-black text-[12px] font-mono flex items-center justify-center">
                              {photo.order ?? idx + 1}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); makePhotoFirst(photo.id); }}
                                className="px-2 py-1 rounded-lg bg-gradient-to-r from-amber-500/15 to-orange-500/15 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-500/25 transition-all cursor-pointer active:scale-95 font-bengali"
                                title="সবার প্রথমে আনুন (#1 করুন)"
                              >
                                #১ করুন
                              </button>
                            )}
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={(e) => { e.stopPropagation(); movePhoto(photo.id, "up"); }}
                              className="w-6 h-6 rounded-lg bg-surface border border-border hover:bg-primary/10 hover:border-primary/40 hover:text-primary text-text-muted disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer active:scale-90 flex items-center justify-center"
                              title="আগে আনুন (Move Up)"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === sortedPhotos.length - 1}
                              onClick={(e) => { e.stopPropagation(); movePhoto(photo.id, "down"); }}
                              className="w-6 h-6 rounded-lg bg-surface border border-border hover:bg-primary/10 hover:border-primary/40 hover:text-primary text-text-muted disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer active:scale-90 flex items-center justify-center"
                              title="পরে নিন (Move Down)"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Duration Controls — Row */}
                        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-surface-secondary/60 border border-border/50">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="text-[10px] font-bold text-text font-bengali">স্থায়িত্ব:</span>
                            <span className="text-[12px] font-black text-amber-500 font-mono">
                              {photo.duration || 5}s
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            {[3, 5, 8, 10].map((sec) => (
                              <button
                                key={sec}
                                type="button"
                                onClick={(e) => { e.stopPropagation(); updatePhotoDuration(photo.id, sec); }}
                                className={`w-8 h-6 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer active:scale-90 flex items-center justify-center ${
                                  (photo.duration || 5) === sec
                                    ? "bg-gradient-to-b from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30 ring-1 ring-amber-400/50"
                                    : "bg-surface border border-border text-text-muted hover:text-amber-500 hover:border-amber-500/40 hover:bg-amber-500/5"
                                }`}
                                title={`${sec} সেকেন্ড স্থায়ী হবে`}
                              >
                                {sec}s
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-border/60">
                          <button
                            type="button"
                            onClick={() => togglePhotoInSlider(photo.id)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95 ${isCurActive
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
                    </div>
                  );
                })}
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
                          className={`transition-all rounded-full cursor-pointer ${idx === previewSlideIndex
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
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. State-of-the-Art Full-Width Landscape Text & Content Studio */}
      {/* ========================================================================= */}
      <div className="rounded-3xl border border-border/80 bg-surface/90 backdrop-blur-xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* Landscape Studio Command Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/80">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary via-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-text tracking-tight">
                  Text & Content Customizer Studio
                </h3>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold font-bengali">
                  ল্যান্ডস্কেপ টেক্সট এডিটর
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5 font-bengali">
                ওয়েবসাইটের মূল হেডলাইন, সাবটাইটেল, বাটনসমূহ এবং অটোপ্লে টাইমিং এক নজরে সাজিয়ে সংরক্ষণ করুন
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() =>
                setSettings((prev) => ({
                  ...prev,
                  title_line_1: "Learn Today.",
                  title_line_2: "Lead Tomorrow.",
                  subtitle: "আজ শিখুন। আগামীকাল নেতৃত্ব দিন।",
                  primary_cta_text: "Browse Course",
                  primary_cta_url: "/courses",
                  secondary_cta_text: "Buy Book",
                  secondary_cta_url: "/courses",
                }))
              }
              className="px-3 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-text bg-surface-secondary/70 hover:bg-surface-secondary border border-border transition-colors font-bengali inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>রিসেট</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-primary via-[#ff6a15] to-[#ff5f00] hover:opacity-95 shadow-md shadow-primary/25 active:scale-[0.98] transition-all disabled:opacity-50 font-bengali cursor-pointer"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>সংরক্ষণ হচ্ছে...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>সংরক্ষিত!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>সেভ করুন (Save)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3-Column Wide Landscape Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Column 1: Announcement Badge & Bengali Subtitle */}
          <div className="space-y-5">
            {/* 1. Announcement Top Badge */}
            <div className="p-4 rounded-2xl bg-surface-secondary/40 border border-border/60 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-text flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Top Badge (শীর্ষ ব্যানার ব্যাজ)</span>
                </label>
                <span className="text-[10px] text-text-muted font-mono">
                  {settings.badge_text.length} chars
                </span>
              </div>

              <input
                type="text"
                value={settings.badge_text}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, badge_text: e.target.value }))
                }
                placeholder="🔥 নতুন ব্যাচে ভর্তি চলছে..."
                className="input w-full text-xs font-bengali bg-surface border-border focus:border-primary"
              />

              {/* Live Pill Preview & Presets */}
              <div className="pt-1 flex flex-col gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-text-muted font-semibold">লাইভ ব্যাজ:</span>
                  {settings.badge_text ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold font-bengali">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>{settings.badge_text}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-text-muted/60 italic">কোনো ব্যাজ নেই</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-text-muted font-bengali">প্রিসেট:</span>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        badge_text: "🔥 নতুন একাডেমিক ও এডমিশন ব্যাচে ভর্তি চলছে",
                      }))
                    }
                    className="px-2 py-0.5 rounded-md bg-surface border border-border text-[10px] text-text-muted hover:text-primary hover:border-primary/40 transition-colors font-bengali cursor-pointer"
                  >
                    ডিফল্ট ব্যাজ
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        badge_text: "⚡ HSC 2026 ক্র্যাশ কোর্সে স্পেশাল ডিসকাউন্ট",
                      }))
                    }
                    className="px-2 py-0.5 rounded-md bg-surface border border-border text-[10px] text-text-muted hover:text-primary hover:border-primary/40 transition-colors font-bengali cursor-pointer"
                  >
                    HSC ক্র্যাশ
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Bengali Subtitle */}
            <div className="p-4 rounded-2xl bg-surface-secondary/40 border border-border/60 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-text flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Bengali Subtitle (বাংলা উপশিরোনাম)</span>
                </label>
                <span className="text-[10px] text-text-muted font-mono">
                  {settings.subtitle.length} chars
                </span>
              </div>

              <textarea
                rows={3}
                value={settings.subtitle}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, subtitle: e.target.value }))
                }
                placeholder="আজ শিখুন। আগামীকাল নেতৃত্ব দিন।"
                className="input w-full text-xs font-bengali font-semibold text-purple-600 dark:text-purple-400 bg-surface border-border focus:border-purple-500 leading-relaxed"
              />

              <div className="flex flex-col gap-2 pt-1">
                <span className="text-[10px] text-text-muted font-bengali">
                  হিরো সেকশনে বেগুনি কালারে ফুটে উঠবে
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-text-muted font-bengali">প্রিসেট:</span>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        subtitle: "আজ শিখুন। আগামীকাল নেতৃত্ব দিন।",
                      }))
                    }
                    className="px-2 py-0.5 rounded-md bg-surface border border-border text-[10px] text-text-muted hover:text-purple-500 hover:border-purple-500/40 transition-colors font-bengali cursor-pointer"
                  >
                    আজ শিখুন...
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        subtitle: "স্বপ্ন যেখানে শীর্ষ বিশ্ববিদ্যালয় ও মেডিকেল প্রস্তুতি",
                      }))
                    }
                    className="px-2 py-0.5 rounded-md bg-surface border border-border text-[10px] text-text-muted hover:text-purple-500 hover:border-purple-500/40 transition-colors font-bengali cursor-pointer"
                  >
                    স্বপ্ন যেখানে...
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Main Headline Typography & Global Slide Duration */}
          <div className="space-y-5">
            {/* Main Headline (Line 1 & Line 2) */}
            <div className="p-4 rounded-2xl bg-surface-secondary/40 border border-border/60 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-text flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span>Main Headline (মূল ২-লাইন হেডলাইন)</span>
                </label>
                <span className="text-[10px] text-text-muted font-semibold">Typography H1</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-semibold text-text-muted mb-1">
                    Line 1 (মুখ্য লাইন - যেমন: Learn Today.)
                  </label>
                  <input
                    type="text"
                    value={settings.title_line_1}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, title_line_1: e.target.value }))
                    }
                    placeholder="Learn Today."
                    className="input w-full text-xs font-sans font-bold bg-surface border-border focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-text-muted mb-1">
                    Line 2 (হাইলাইট লাইন - যেমন: Lead Tomorrow.)
                  </label>
                  <input
                    type="text"
                    value={settings.title_line_2}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, title_line_2: e.target.value }))
                    }
                    placeholder="Lead Tomorrow."
                    className="input w-full text-xs font-sans font-bold bg-surface border-border focus:border-primary"
                  />
                </div>
              </div>

              {/* Live Typographic Look Box */}
              <div className="p-3 rounded-xl bg-surface/90 border border-border/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-text-muted font-semibold block mb-0.5">টাইপোগ্রাফি লুক:</span>
                  <div className="font-sans font-black text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                    <span>{settings.title_line_1 || "Learn Today."}</span>{" "}
                    <span className="text-slate-800 dark:text-slate-300">
                      {settings.title_line_2 || "Lead Tomorrow."}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSettings((prev) => ({
                      ...prev,
                      title_line_1: "Learn Today.",
                      title_line_2: "Lead Tomorrow.",
                    }))
                  }
                  className="px-2 py-1 rounded-lg bg-surface-secondary text-[10px] font-bold text-text-muted hover:text-primary transition-colors cursor-pointer"
                >
                  Reset H1
                </button>
              </div>
            </div>

            {/* Global Slide Timing & Autoplay Controller */}
            <div className="p-4 rounded-2xl bg-surface-secondary/40 border border-border/60 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-text flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Global Slider Timing (ডিফল্ট স্লাইড টাইমার)</span>
                </label>
                <span className="text-[11px] font-bold text-amber-500 font-mono">
                  {settings.autoplay_interval || 5}s interval
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface border border-border/70">
                <div>
                  <div className="text-xs font-bold text-text">অটোপ্লে ট্রানজিশন ইন্টারভাল:</div>
                  <div className="text-[10px] text-text-muted font-bengali mt-0.5">
                    প্রতি স্লাইড কত সেকেন্ড স্থায়ী হবে
                  </div>
                </div>

                {/* Quick Interval Pills */}
                <div className="flex items-center gap-1.5">
                  {[3, 5, 8, 10, 15].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => updateGlobalInterval(sec)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                        (settings.autoplay_interval || 5) === sec
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm shadow-amber-500/30"
                          : "bg-surface-secondary border border-border text-text-muted hover:text-amber-500 hover:border-amber-500/40"
                      }`}
                      title={`Set default interval to ${sec}s`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-text-muted font-bengali">
                💡 টিপ: কোনো ছবিতে নির্দিষ্ট সেকেন্ড না দিলে এই ডিফল্ট সময় কাজ করবে।
              </p>
            </div>
          </div>

          {/* Column 3: Dual Hero Action Buttons (Browse Course & Buy Book) */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-surface-secondary/40 border border-border/60 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-text flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ff5f00]" />
                  <span>Hero Action Buttons (হিরো বাটনসমূহ)</span>
                </div>
                <span className="text-[10px] text-text-muted font-semibold">Dual CTAs</span>
              </div>

              {/* Button 1: Browse Course */}
              <div className="p-3.5 rounded-2xl bg-surface border border-border/70 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#ff5f00] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff5f00]" />
                    <span>বাটন ১ (Primary Button)</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#ff5f00] text-white text-[10px] font-bold shadow-2xs">
                    {settings.primary_cta_text || "Browse Course"}
                  </span>
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
                    placeholder="Browse Course"
                    className="input w-full text-xs font-semibold bg-surface-secondary/40 border-border"
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
                    className="input w-full text-xs font-mono bg-surface-secondary/40 border-border"
                  />
                </div>
              </div>

              {/* Button 2: Buy Book */}
              <div className="p-3.5 rounded-2xl bg-surface border border-border/70 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span>বাটন ২ (Secondary Button)</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full border-2 border-[#ff5f00] text-[#ff5f00] dark:text-white text-[10px] font-bold">
                    {settings.secondary_cta_text || "Buy Book"}
                  </span>
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
                    placeholder="Buy Book"
                    className="input w-full text-xs font-semibold bg-surface-secondary/40 border-border"
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
                    placeholder="/courses"
                    className="input w-full text-xs font-mono bg-surface-secondary/40 border-border"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width Bottom Action Dock */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border">
          <button
            type="button"
            onClick={() =>
              setSettings((prev) => ({
                ...prev,
                title_line_1: "Learn Today.",
                title_line_2: "Lead Tomorrow.",
                subtitle: "আজ শিখুন। আগামীকাল নেতৃত্ব দিন।",
                primary_cta_text: "Browse Course",
                primary_cta_url: "/courses",
                secondary_cta_text: "Buy Book",
                secondary_cta_url: "/courses",
              }))
            }
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-text-muted hover:text-text bg-surface-secondary/60 hover:bg-surface-secondary border border-border transition-colors font-bengali cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>টেক্সট ও বাটন ডিফল্ট রিসেট</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-primary via-[#ff6a15] to-[#ff5f00] hover:opacity-95 shadow-lg shadow-primary/25 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 font-bengali cursor-pointer"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>সংরক্ষণ করা হচ্ছে...</span>
              </>
            ) : saveSuccess ? (
              <>
                <CheckCheck className="w-4 h-4" />
                <span>সফলভাবে সংরক্ষিত হয়েছে!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>পরিবর্তন সংরক্ষণ করুন (Save All Changes)</span>
              </>
            )}
          </button>
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
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === "device"
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
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === "url"
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
                      ${dragOver
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
