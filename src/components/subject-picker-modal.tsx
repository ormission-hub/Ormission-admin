"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Search, Plus, Check, X, BookOpen, Sparkles, FolderPlus } from "lucide-react";
import { STANDARD_SUBJECTS } from "@/lib/section-types";

interface SubjectPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSubject?: string;
  onSelect: (subject: string) => void;
  existingSubjects?: string[];
}

export function SubjectPickerModal({
  isOpen,
  onClose,
  currentSubject = "",
  onSelect,
  existingSubjects = [],
}: SubjectPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Combine course-specific subjects and standard subjects without duplicates
  const uniqueCourseSubjects = useMemo(() => {
    return Array.from(
      new Set(
        existingSubjects
          .map((s) => s.trim())
          .filter((s) => s.length > 0 && !STANDARD_SUBJECTS.includes(s as any))
      )
    );
  }, [existingSubjects]);

  const filteredStandardSubjects = useMemo(() => {
    if (!searchQuery.trim()) return [...STANDARD_SUBJECTS];
    const q = searchQuery.toLowerCase().trim();
    return STANDARD_SUBJECTS.filter((s) => s.toLowerCase().includes(q));
  }, [searchQuery]);

  const filteredCourseSubjects = useMemo(() => {
    if (!searchQuery.trim()) return uniqueCourseSubjects;
    const q = searchQuery.toLowerCase().trim();
    return uniqueCourseSubjects.filter((s) => s.toLowerCase().includes(q));
  }, [uniqueCourseSubjects, searchQuery]);

  // Check if search query exactly matches an existing subject
  const exactMatchExists = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const inStandard = STANDARD_SUBJECTS.some((s) => s.toLowerCase() === q);
    const inCourse = uniqueCourseSubjects.some((s) => s.toLowerCase() === q);
    return inStandard || inCourse;
  }, [searchQuery, uniqueCourseSubjects]);

  if (!isOpen) return null;

  const handleSelectSubject = (sub: string) => {
    onSelect(sub);
    onClose();
  };

  const handleCreateNewSubject = () => {
    const trimmed = searchQuery.trim();
    if (trimmed) {
      onSelect(trimmed);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div
        className="bg-surface border border-border rounded-2xl max-w-lg w-full max-h-[90vh] sm:max-h-[85vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-surface-secondary/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text font-bengali">অধ্যায়ের বিষয় নির্বাচন ও তৈরি</h3>
              <p className="text-[11px] text-text-muted font-bengali">
                তালিকায় না থাকলে সরাসরি নতুন বিষয়ের নাম লিখে যোগ করুন
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface transition-colors cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Quick Add Input */}
        <div className="p-4 border-b border-border/80 bg-surface">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim() && !exactMatchExists) {
                  e.preventDefault();
                  handleCreateNewSubject();
                }
              }}
              placeholder="বিষয়ের নাম লিখুন (যেমন: ফিকহ, Spoken English, ইত্যাদি)..."
              className="input pl-9 pr-4 text-xs sm:text-sm font-medium w-full h-10 rounded-xl font-bengali"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Create New Subject Button if query doesn't match */}
          {searchQuery.trim().length > 0 && !exactMatchExists && (
            <button
              type="button"
              onClick={handleCreateNewSubject}
              className="mt-2.5 w-full flex items-center justify-between p-2.5 rounded-xl bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-all cursor-pointer font-bengali text-xs font-bold"
            >
              <div className="flex items-center gap-2 truncate">
                <FolderPlus className="w-4 h-4 shrink-0 text-primary" />
                <span className="truncate">
                  ➕ &ldquo;<span className="text-primary font-extrabold">{searchQuery.trim()}</span>&rdquo; নতুন বিষয় হিসেবে যুক্ত করুন
                </span>
              </div>
              <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-md shrink-0 ml-2">
                তৈরি করুন
              </span>
            </button>
          )}
        </div>

        {/* Scrollable Subjects List */}
        <div className="overflow-y-auto p-4 space-y-4 flex-1">
          {/* Option: Clear / No Subject */}
          <div>
            <button
              type="button"
              onClick={() => handleSelectSubject("")}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold font-bengali transition-colors cursor-pointer text-left ${
                !currentSubject
                  ? "bg-primary/10 border-primary/40 text-primary"
                  : "bg-surface-secondary/40 border-border/70 text-text-muted hover:text-text hover:bg-surface-secondary"
              }`}
            >
              <span>-- সাধারণ / বিষয়হীন (কোনো বিষয় নির্দিষ্ট নয়) --</span>
              {!currentSubject && <Check className="w-4 h-4 text-primary" />}
            </button>
          </div>

          {/* Custom subjects created in this course */}
          {filteredCourseSubjects.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-text-muted font-bengali">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>এই কোর্সে তৈরি করা কাস্টম বিষয়সমূহ:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {filteredCourseSubjects.map((sub) => {
                  const isSelected = currentSubject === sub;
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => handleSelectSubject(sub)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold font-bengali transition-all cursor-pointer text-left ${
                        isSelected
                          ? "bg-primary text-white border-primary shadow-xs"
                          : "bg-surface-secondary/60 border-border/70 text-text hover:border-primary/40 hover:bg-surface-secondary"
                      }`}
                    >
                      <span className="truncate">{sub}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-1.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Standard HSC / Admission subjects */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-text-muted font-bengali">
              এইচএসসি ও এডমিশন মূল বিষয়সমূহ ({filteredStandardSubjects.length}):
            </div>
            {filteredStandardSubjects.length === 0 ? (
              <p className="text-xs text-text-muted font-bengali italic py-2">
                এই নামে কোনো স্ট্যান্ডার্ড বিষয় মেলেনি। ওপরের &ldquo;নতুন বিষয় তৈরি করুন&rdquo; বাটনে ক্লিক করে যোগ করুন।
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {filteredStandardSubjects.map((sub) => {
                  const isSelected = currentSubject === sub;
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => handleSelectSubject(sub)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold font-bengali transition-all cursor-pointer text-left ${
                        isSelected
                          ? "bg-primary text-white border-primary shadow-xs"
                          : "bg-surface border-border/70 text-text hover:border-primary/40 hover:bg-surface-secondary"
                      }`}
                    >
                      <span className="truncate">{sub}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-1.5" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-border bg-surface-secondary/50 flex items-center justify-between text-[11px] text-text-muted font-bengali">
          <span>💡 বিষয় নির্বাচন করলে ওয়েবসাইটে বিষয়ভিত্তিক গ্রুপ আকারে সাজানো থাকবে।</span>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline btn-xs font-bengali cursor-pointer"
          >
            বাতিল
          </button>
        </div>
      </div>
    </div>
  );
}
