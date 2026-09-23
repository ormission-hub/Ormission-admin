"use client";

import { useState } from "react";
import {
  FileText,
  Link2,
  Trash2,
  ExternalLink,
  Paperclip,
  Plus,
  X,
  Archive,
  Image as ImageIcon,
} from "lucide-react";

export interface LessonMaterialItem {
  id: string | number;
  title: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number | string | null;
  fileSizeFormatted?: string;
  sortOrder?: number;
  isFree?: boolean;
}

interface LessonMaterialsManagerProps {
  materials: LessonMaterialItem[];
  onChange: (materials: LessonMaterialItem[]) => void;
  lessonTitle?: string;
}

export function formatFileSize(bytes?: number | string | null): string {
  if (!bytes) return "";
  const num = typeof bytes === "string" ? parseInt(bytes, 10) : bytes;
  if (isNaN(num) || num <= 0) return "";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(num) / Math.log(k));
  return `${parseFloat((num / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function parseGoogleDriveLink(url: string) {
  if (!url) return null;
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    const id = match[1];
    return {
      id,
      previewUrl: `https://drive.google.com/file/d/${id}/preview`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${id}`,
      viewUrl: `https://drive.google.com/file/d/${id}/view`,
    };
  }
  return null;
}

export function getMaterialIcon(fileType?: string, fileUrl?: string) {
  const type = (fileType || fileUrl?.split(".").pop() || "").toLowerCase();

  if (type.includes("pdf") || fileUrl?.includes("drive.google.com")) {
    return {
      icon: FileText,
      color: "text-rose-500",
      bg: "bg-rose-500/10 border-rose-500/20",
      label: fileUrl?.includes("drive.google.com") ? "DRIVE" : "PDF",
    };
  }
  if (type.includes("doc") || type.includes("word") || type.includes("txt")) {
    return {
      icon: FileText,
      color: "text-blue-500",
      bg: "bg-blue-500/10 border-blue-500/20",
      label: "DOC",
    };
  }
  if (type.includes("ppt") || type.includes("presentation")) {
    return {
      icon: FileText,
      color: "text-amber-500",
      bg: "bg-amber-500/10 border-amber-500/20",
      label: "PPT",
    };
  }
  if (type.includes("zip") || type.includes("rar") || type.includes("tar") || type.includes("7z")) {
    return {
      icon: Archive,
      color: "text-purple-500",
      bg: "bg-purple-500/10 border-purple-500/20",
      label: "ZIP",
    };
  }
  if (type.includes("png") || type.includes("jpg") || type.includes("jpeg") || type.includes("webp")) {
    return {
      icon: ImageIcon,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      label: "IMG",
    };
  }

  return {
    icon: Link2,
    color: "text-sky-500",
    bg: "bg-sky-500/10 border-sky-500/20",
    label: "LINK",
  };
}

export function LessonMaterialsManager({
  materials,
  onChange,
  lessonTitle,
}: LessonMaterialsManagerProps) {
  const [showInput, setShowInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [isFreeInput, setIsFreeInput] = useState(false);

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    const trimmedUrl = urlInput.trim();
    const gDrive = parseGoogleDriveLink(trimmedUrl);
    const ext = trimmedUrl.split(".").pop()?.toLowerCase().split("?")[0] || "link";

    const newMaterial: LessonMaterialItem = {
      id: `mat-${Date.now()}`,
      title:
        titleInput.trim() ||
        (gDrive ? "লেকচার শিট (গুগল ড্রাইভ)" : "ক্লাস স্টাডি ম্যাটেরিয়াল"),
      fileUrl: gDrive ? gDrive.viewUrl : trimmedUrl,
      fileType: gDrive ? "pdf" : (ext.length > 5 ? "link" : ext),
      fileSize: null,
      sortOrder: materials.length + 1,
      isFree: isFreeInput,
    };

    onChange([...materials, newMaterial]);
    setUrlInput("");
    setTitleInput("");
    setIsFreeInput(false);
    setShowInput(false);
  };

  const handleUpdateTitle = (index: number, newTitle: string) => {
    const updated = [...materials];
    updated[index] = { ...updated[index], title: newTitle };
    onChange(updated);
  };

  const handleToggleFree = (index: number) => {
    const updated = [...materials];
    updated[index] = { ...updated[index], isFree: !updated[index].isFree };
    onChange(updated);
  };

  const handleRemoveMaterial = (index: number) => {
    const updated = materials.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="mt-3 p-3 rounded-xl bg-surface/90 border border-border/70 space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/50">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Paperclip className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-text font-bengali truncate">
            ক্লাস স্টাডি ম্যাটেরিয়াল ও শিট
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 font-bengali">
            {materials.length}টি সংযুক্ত
          </span>

          <button
            type="button"
            onClick={() => setShowInput((prev) => !prev)}
            className={`btn btn-xs font-bengali text-xs flex items-center gap-1 cursor-pointer transition-all ${
              showInput
                ? "bg-primary text-white border-primary shadow-xs"
                : "btn-outline border-border hover:border-primary/50 text-text"
            }`}
          >
            {showInput ? (
              <>
                <X className="w-3 h-3" />
                <span>বন্ধ করুন</span>
              </>
            ) : (
              <>
                <Plus className="w-3 h-3 text-primary" />
                <span>লিংক যুক্ত করুন</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Add Material Form */}
      {showInput && (
        <form
          onSubmit={handleAddLink}
          className="p-3 rounded-xl bg-surface border border-primary/30 space-y-2.5 text-xs font-bengali shadow-xs animate-in fade-in"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-text flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-primary" />
              গুগল ড্রাইভ বা ক্লাউড লিংক যুক্ত করুন
            </span>
            <button
              type="button"
              onClick={() => setShowInput(false)}
              className="text-text-muted hover:text-text p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-2 rounded-lg bg-primary/5 border border-primary/15 text-text-muted text-[11px] leading-relaxed">
            💡 <strong>টিপস:</strong> গুগল ড্রাইভের শেয়ার লিংক (<em>"Anyone with the link can view"</em>) পেস্ট করলে ছাত্রছাত্রীরা সরাসরি ফুল স্ক্রিনে দেখতে ও ১-ক্লিকে ডাউনলোড করতে পারবে।
          </div>

          <div className="space-y-2">
            <div>
              <label className="text-[11px] text-text-muted block mb-1 font-medium">
                ফাইলের লিংক (Google Drive / Dropbox / PDF লিঙ্ক) *
              </label>
              <input
                type="url"
                required
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://drive.google.com/file/d/..."
                className="input text-xs font-mono w-full"
              />
            </div>

            <div>
              <label className="text-[11px] text-text-muted block mb-1 font-medium">
                টাইটেল (ঐচ্ছিক)
              </label>
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder="যেমন: লেকচার শিট ও প্র্যাকটিস প্রশ্ন"
                className="input text-xs font-bengali w-full"
              />
            </div>

            {/* Free Material Checkbox */}
            <label className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isFreeInput}
                onChange={(e) => setIsFreeInput(e.target.checked)}
                className="checkbox checkbox-xs rounded text-emerald-500"
              />
              <div>
                <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
                  ফ্রি প্রিভিউ ম্যাটেরিয়াল (সবার জন্য উন্মুক্ত)
                </span>
                <span className="block text-[10.5px] text-text-muted">
                  কোর্স বা ক্লাস পেইড হলেও শিক্ষার্থীরা কেনার আগে এই PDF/নোট ফ্রিতে প্রিভিউ দেখতে পারবে।
                </span>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowInput(false)}
              className="btn btn-outline btn-xs font-bengali text-[11px]"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-xs font-bengali text-[11px] font-bold shadow-xs"
            >
              সংরক্ষণ করুন
            </button>
          </div>
        </form>
      )}

      {/* Materials List */}
      {materials.length === 0 ? (
        <div className="py-3 px-3 rounded-xl border border-dashed border-border/80 text-center text-[11px] text-text-muted font-bengali">
          এই ক্লাসে কোনো স্টাডি ম্যাটেরিয়াল যুক্ত করা হয়নি। উপরের <strong>"লিংক যুক্ত করুন"</strong> বাটনে ক্লিক করে গুগল ড্রাইভ বা ক্লাউড লিংক দিন।
        </div>
      ) : (
        <div className="space-y-1.5">
          {materials.map((mat, idx) => {
            const meta = getMaterialIcon(mat.fileType, mat.fileUrl);
            const Icon = meta.icon;
            const sizeStr = mat.fileSizeFormatted || formatFileSize(mat.fileSize);

            return (
              <div
                key={mat.id || idx}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-surface border border-border hover:border-primary/30 transition-all text-xs shadow-2xs"
              >
                {/* File Type Badge */}
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${meta.bg} ${meta.color}`}
                  title={meta.label}
                >
                  <Icon size={14} />
                </div>

                {/* Title Input */}
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={mat.title}
                    onChange={(e) => handleUpdateTitle(idx, e.target.value)}
                    placeholder="ম্যাটেরিয়াল টাইটেল"
                    className="bg-transparent border-none p-0 text-xs font-semibold text-text focus:outline-none focus:ring-0 w-full truncate font-bengali"
                  />
                  <div className="flex items-center gap-1.5 text-[10px] text-text-muted mt-0.5">
                    <span className="font-mono uppercase font-bold text-text-muted/80">{meta.label}</span>
                    {sizeStr && (
                      <>
                        <span>•</span>
                        <span>{sizeStr}</span>
                      </>
                    )}
                    <span>•</span>
                    <span className="truncate max-w-[140px] sm:max-w-[240px] font-mono text-text-muted/60">
                      {mat.fileUrl}
                    </span>
                  </div>
                </div>

                {/* Free / Paid Toggle Badge */}
                <button
                  type="button"
                  onClick={() => handleToggleFree(idx)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-bengali border transition-all cursor-pointer shrink-0 ${
                    mat.isFree
                      ? "bg-emerald-500/15 border-emerald-500/35 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25"
                      : "bg-surface-secondary border-border text-text-muted hover:text-text hover:border-slate-500"
                  }`}
                  title={mat.isFree ? "ফ্রি প্রিভিউ (ক্লিক করে পেইড করুন)" : "পেইড অনলি (ক্লিক করে ফ্রি করুন)"}
                >
                  {mat.isFree ? "✓ ফ্রি" : "পেইড"}
                </button>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={mat.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
                    title="নতুন ট্যাবে দেখুন"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleRemoveMaterial(idx)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
