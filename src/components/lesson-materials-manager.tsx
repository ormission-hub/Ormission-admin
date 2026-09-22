"use client";

import { useState, useRef } from "react";
import {
  FileText,
  Upload,
  Link2,
  Trash2,
  ExternalLink,
  Loader2,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  FileDown,
  Archive,
  FileCode,
  Image as ImageIcon,
  Plus,
  X,
} from "lucide-react";

export interface LessonMaterialItem {
  id: string | number;
  title: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number | string | null;
  fileSizeFormatted?: string;
  sortOrder?: number;
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

export function getMaterialIcon(fileType?: string, fileUrl?: string) {
  const type = (fileType || fileUrl?.split(".").pop() || "").toLowerCase();

  if (type.includes("pdf")) {
    return {
      icon: FileText,
      color: "text-rose-500",
      bg: "bg-rose-500/10 border-rose-500/20",
      label: "PDF",
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

export function LessonMaterialsManager({
  materials,
  onChange,
  lessonTitle,
}: LessonMaterialsManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showExternalInput, setShowExternalInput] = useState(false);
  const [externalUrl, setExternalUrl] = useState("");
  const [externalTitle, setExternalTitle] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vercel Serverless Function request body limit check (4.5 MB hard limit)
    const MAX_DIRECT_SIZE = 4.2 * 1024 * 1024; // 4.2 MB safe buffer
    if (file.size > MAX_DIRECT_SIZE) {
      setUploadError(
        `ফাইলের সাইজ (${formatFileSize(file.size)}) ৪ মেগাবাইটের বেশি। Vercel সার্ভারলেস লিমিটের কারণে সরাসরি ৪MB এর বেশি ফাইল আপলোড করা যায় না। বড় সাইজের PDF/ফাইলের জন্য দয়া করে 'গুগল ড্রাইভ লিংক' অপশনটি ব্যবহার করুন (আপনার ফ্রি গুগল ড্রাইভে ফাইলটি রেখে লিংক দিন)।`
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      setShowExternalInput(true);
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/material", {
        method: "POST",
        body: formData,
      });

      if (res.status === 413) {
        throw new Error(
          "ফাইলের সাইজ সার্ভার লিমিটের (৪.৫MB) চেয়ে বড় (413 Payload Too Large)। বড় সাইজের ফাইলের জন্য 'গুগল ড্রাইভ লিংক' ব্যবহার করুন।"
        );
      }

      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          "সার্ভার থেকে সঠিক রেসপন্স পাওয়া যায়নি। বড় ফাইল হলে দয়া করে 'গুগল ড্রাইভ লিংক' ব্যবহার করুন।"
        );
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || "ফাইল আপলোড সম্পন্ন হতে পারেনি");
      }

      const newMaterial: LessonMaterialItem = {
        id: `mat-${Date.now()}`,
        title: data.fileName || file.name,
        fileUrl: data.url,
        fileType: data.fileType || file.name.split(".").pop()?.toLowerCase(),
        fileSize: data.fileSize || file.size,
        fileSizeFormatted: data.fileSizeFormatted || formatFileSize(file.size),
        sortOrder: materials.length + 1,
      };

      onChange([...materials, newMaterial]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "আপলোড ব্যর্থ হয়েছে";
      setUploadError(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAddExternalLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!externalUrl.trim()) return;

    const trimmedUrl = externalUrl.trim();
    const gDrive = parseGoogleDriveLink(trimmedUrl);
    const ext = trimmedUrl.split(".").pop()?.toLowerCase().split("?")[0] || "link";

    const newMaterial: LessonMaterialItem = {
      id: `ext-${Date.now()}`,
      title:
        externalTitle.trim() ||
        (gDrive ? "লেকচার শিট (গুগল ড্রাইভ)" : "ক্লাস স্টাডি রিসোর্স"),
      fileUrl: gDrive ? gDrive.viewUrl : trimmedUrl,
      fileType: gDrive ? "pdf" : (ext.length > 5 ? "link" : ext),
      fileSize: null,
      sortOrder: materials.length + 1,
    };

    onChange([...materials, newMaterial]);
    setExternalUrl("");
    setExternalTitle("");
    setShowExternalInput(false);
    setUploadError(null);
  };

  const handleUpdateTitle = (index: number, newTitle: string) => {
    const updated = [...materials];
    updated[index] = { ...updated[index], title: newTitle };
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

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 font-bengali">
            {materials.length}টি সংযুক্ত
          </span>
        </div>
      </div>

      {/* Responsive 2-Button Action Bar */}
      <div className="grid grid-cols-2 gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.txt,image/*"
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-border bg-surface-secondary/80 hover:bg-surface-secondary text-text text-xs font-bengali font-semibold transition-all cursor-pointer shadow-2xs hover:border-primary/50"
          title="ফাইল আপলোড করুন (সর্বোচ্চ ৪MB)"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary shrink-0" />
              <span className="truncate">আপলোড হচ্ছে...</span>
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate">ফাইল আপলোড</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => setShowExternalInput((prev) => !prev)}
          className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-bengali font-semibold transition-all cursor-pointer shadow-2xs ${
            showExternalInput
              ? "bg-primary text-white border-primary shadow-sm shadow-primary/25"
              : "border-border bg-surface-secondary/80 hover:bg-surface-secondary text-text hover:border-primary/50"
          }`}
          title="গুগল ড্রাইভ বা ক্লাউড লিংক যোগ করুন"
        >
          <Link2 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">ড্রাইভ লিংক</span>
        </button>
      </div>

      {/* Upload Error / Notice */}
      {uploadError && (
        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bengali flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <span className="leading-snug">{uploadError}</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-rose-400 hover:text-rose-600 p-0.5 shrink-0 cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Inline External Link Form */}
      {showExternalInput && (
        <form
          onSubmit={handleAddExternalLink}
          className="p-3 rounded-xl bg-surface border border-primary/30 space-y-2.5 text-xs font-bengali shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-text flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-primary" />
              গুগল ড্রাইভ বা ক্লাউড লিংক যুক্ত করুন
            </span>
            <button
              type="button"
              onClick={() => setShowExternalInput(false)}
              className="text-text-muted hover:text-text p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-2 rounded-lg bg-primary/5 border border-primary/15 text-text-muted text-[11px] leading-relaxed">
            💡 <strong>টিপস:</strong> গুগল ড্রাইভের শেয়ার লিংক (<em>"Anyone with the link"</em>) এখানে পেস্ট করলে স্টুডেন্টরা সরাসরি দেখতে ও ডাউনলোড করতে পারবে।
          </div>

          <div className="space-y-2">
            <div>
              <label className="text-[11px] text-text-muted block mb-1 font-medium">
                ফাইলের লিংক *
              </label>
              <input
                type="url"
                required
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
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
                value={externalTitle}
                onChange={(e) => setExternalTitle(e.target.value)}
                placeholder="যেমন: লেকচার নোট ও হ্যান্ডআউট"
                className="input text-xs font-bengali w-full"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowExternalInput(false)}
              className="btn btn-outline btn-xs font-bengali text-[11px]"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-xs font-bengali text-[11px] font-bold shadow-xs"
            >
              যুক্ত করুন
            </button>
          </div>
        </form>
      )}

      {/* Materials List */}
      {materials.length === 0 ? (
        <div className="py-2.5 px-3 rounded-xl border border-dashed border-border/80 text-center text-[11px] text-text-muted font-bengali">
          এই ক্লাসে কোনো স্টাডি ম্যাটেরিয়াল নেই। উপরের বাটন দিয়ে যুক্ত করুন।
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
                    <span className="truncate max-w-[120px] sm:max-w-[200px] font-mono text-text-muted/60">
                      {mat.fileUrl}
                    </span>
                  </div>
                </div>

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
