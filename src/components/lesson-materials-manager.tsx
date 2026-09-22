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
    <div className="mt-3 p-3.5 rounded-xl bg-surface-secondary/70 border border-border/80 space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-text font-bengali">
            ক্লাস স্টাডি ম্যাটেরিয়াল ও লেকচার নোট
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
            {materials.length}টি সংযুক্ত
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bengali">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            ফ্রি ক্লাউড স্টোরেজ (সুপাবেজ কোটা মুক্ত)
          </span>
        </div>

        {/* Upload Buttons */}
        <div className="flex items-center gap-2">
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
            className="btn btn-outline btn-xs font-bengali text-[11px] flex items-center gap-1.5 hover:border-primary hover:text-primary cursor-pointer"
            title="৪MB পর্যন্ত সরাসরি PDF বা ফাইল আপলোড করুন"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-primary" />
                <span>আপলোড হচ্ছে...</span>
              </>
            ) : (
              <>
                <Upload className="w-3 h-3 text-primary" />
                <span>সরাসরি আপলোড (&lt;৪MB)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowExternalInput((prev) => !prev)}
            className="btn btn-primary btn-xs font-bengali text-[11px] flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="বড় ফাইল বা গুগল ড্রাইভের লিংক যুক্ত করুন"
          >
            <Link2 className="w-3 h-3" />
            <span>গুগল ড্রাইভ লিংক (বড় ফাইল)</span>
          </button>
        </div>
      </div>

      {/* Upload Error */}
      {uploadError && (
        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bengali flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Inline External Link Form */}
      {showExternalInput && (
        <form
          onSubmit={handleAddExternalLink}
          className="p-3 rounded-lg bg-surface border border-border space-y-2 text-xs font-bengali animate-in fade-in"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-text flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-sky-500" />
              গুগল ড্রাইভ বা এক্সটার্নাল লিংক যোগ করুন
            </span>
            <button
              type="button"
              onClick={() => setShowExternalInput(false)}
              className="text-text-muted hover:text-text"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-700 dark:text-sky-300 text-[11px] leading-relaxed flex items-start gap-2">
            <span className="shrink-0 text-sm">💡</span>
            <div>
              <strong>বড় সাইজের PDF/ফাইলের জন্য সমাধান:</strong> আপনার ফ্রি গুগল ড্রাইভে (১৫GB ফ্রি) ফাইলটি রাখুন এবং শেয়ার অপশন থেকে <em>"Anyone with the link can view"</em> করে লিংকটি নিচে দিন।
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="url"
              required
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="https://drive.google.com/file/d/..."
              className="input text-xs font-mono w-full"
            />
            <input
              type="text"
              value={externalTitle}
              onChange={(e) => setExternalTitle(e.target.value)}
              placeholder="ম্যাটেরিয়াল টাইটেল (যেমন: অধ্যায় ১ লেকচার শিট)"
              className="input text-xs font-bengali w-full"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowExternalInput(false)}
              className="btn btn-outline btn-xs font-bengali text-[11px]"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-xs font-bengali text-[11px] font-bold"
            >
              যুক্ত করুন
            </button>
          </div>
        </form>
      )}

      {/* Materials List */}
      {materials.length === 0 ? (
        <div className="py-2.5 px-3 rounded-lg border border-dashed border-border/80 text-center text-[11px] text-text-muted font-bengali">
          এই ক্লাসে এখনও কোনো স্টাডি ম্যাটেরিয়াল সংযুক্ত করা হয়নি। উপরের বাটন দিয়ে PDF, ওয়ার্ড বা ড্রাইভ লিংক যুক্ত করুন।
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
                className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-border hover:border-primary/30 transition-all text-xs"
              >
                {/* File Type Badge */}
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 border ${meta.bg} ${meta.color}`}
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
                    className="bg-transparent border-none p-0 text-xs font-semibold text-text focus:outline-none focus:ring-0 w-full truncate"
                  />
                  <div className="flex items-center gap-2 text-[10px] text-text-muted">
                    <span className="font-mono uppercase">{meta.label}</span>
                    {sizeStr && <span>• {sizeStr}</span>}
                    <span className="truncate max-w-[180px] sm:max-w-xs font-mono text-text-muted/60">
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
                    className="p-1.5 rounded-md text-text-muted hover:text-primary hover:bg-surface-secondary transition-colors"
                    title="ফাইলটি নতুন ট্যাবে দেখুন"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleRemoveMaterial(idx)}
                    className="p-1.5 rounded-md text-text-muted hover:text-error hover:bg-error/10 transition-colors"
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
