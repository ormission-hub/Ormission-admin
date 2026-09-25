"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import {
  PlusCircle,
  Search,
  Trash2,
  ExternalLink,
  BookOpen,
  Pin,
  Sparkles,
  Edit3,
  Upload,
  X,
  RefreshCw,
  Loader2,
  CheckCircle2,
  ShoppingBag,
  Star,
  Layers,
  LayoutGrid,
  Table as TableIcon,
  ArrowUp,
  ArrowDown,
  Copy,
  FileText,
  Truck,
  Check,
  AlertTriangle,
  Eye,
  SlidersHorizontal,
  BookmarkCheck,
  Tag,
  Boxes,
  HelpCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { dbService, DbCategory } from "@/lib/supabase/db-service";

export interface OrmissionBook {
  id: string;
  title: string;
  subtitle: string;
  author?: string;
  edition?: string;
  publisher?: string;
  category: string;
  category_id?: number | string;
  category_slug?: string;
  price: number;
  original_price: number;
  cover_gradient?: string;
  cover_image?: string;
  pages: string;
  format: string;
  stock_status?: "in_stock" | "low_stock" | "pre_order" | "out_of_stock";
  stock_quantity?: number;
  rating: number;
  reviews_count: number;
  features: string[];
  is_popular: boolean;
  is_pinned: boolean;
  display_order: number;
  order_url?: string;
  preview_pdf_url?: string;
  delivery_info?: string;
  isbn?: string;
  created_at?: string;
}

export const GRADIENT_OPTIONS = [
  { label: "Ocean Indigo", value: "from-blue-600 via-indigo-600 to-sky-700", preview: "bg-gradient-to-br from-blue-600 to-sky-700" },
  { label: "Royal Velvet", value: "from-purple-700 via-indigo-800 to-slate-900", preview: "bg-gradient-to-br from-purple-700 to-slate-900" },
  { label: "Emerald Mint", value: "from-emerald-600 via-teal-700 to-cyan-800", preview: "bg-gradient-to-br from-emerald-600 to-cyan-800" },
  { label: "Sunset Fire", value: "from-orange-600 via-amber-600 to-red-600", preview: "bg-gradient-to-br from-orange-600 to-red-600" },
  { label: "Rose Crimson", value: "from-rose-600 via-pink-700 to-purple-800", preview: "bg-gradient-to-br from-rose-600 to-purple-800" },
  { label: "Deep Obsidian", value: "from-slate-800 via-slate-900 to-black", preview: "bg-gradient-to-br from-slate-800 to-black" },
  { label: "Cyber Neon", value: "from-cyan-600 via-blue-700 to-violet-900", preview: "bg-gradient-to-br from-cyan-600 to-violet-900" },
  { label: "Golden Amber", value: "from-amber-500 via-orange-600 to-yellow-700", preview: "bg-gradient-to-br from-amber-500 to-yellow-700" },
];

const DEFAULT_CATEGORIES = [
  "এইচএসসি বিজ্ঞান",
  "ইঞ্জিনিয়ারিং ভর্তি",
  "মেডিকেল ভর্তি",
  "বিশ্ববিদ্যালয় ভর্তি",
  "এইচএসসি একাডেমি",
  "স্কিল ও ক্যারিয়ার",
];

const STOCK_STATUS_OPTIONS = [
  { value: "in_stock", label: "স্টকে আছে (In Stock)", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30" },
  { value: "low_stock", label: "সীমিত স্টক (Low Stock)", color: "text-amber-500 bg-amber-500/10 border-amber-500/30" },
  { value: "pre_order", label: "প্রি-অর্ডার চলছে (Pre-Order)", color: "text-sky-500 bg-sky-500/10 border-sky-500/30" },
  { value: "out_of_stock", label: "স্টক শেষ (Stock Out)", color: "text-rose-500 bg-rose-500/10 border-rose-500/30" },
];

export default function AdminBooksPage() {
  const [books, setBooks] = useState<OrmissionBook[]>([]);
  const [dbCategories, setDbCategories] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "pinned" | "popular" | "in_stock" | "pre_order">("all");
  const [sortBy, setSortBy] = useState<"order" | "price_asc" | "price_desc" | "rating" | "reviews">("order");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState<OrmissionBook | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete Confirmation Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // Active form state with comprehensive metadata
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    author: "অরমিশন একাডেমি টিম",
    edition: "১ম সংস্করণ ২০২৬",
    publisher: "অরমিশন পাবলিকেশন্স",
    category: "SSC",
    category_id: "" as number | string,
    category_slug: "ssc",
    price: 380,
    original_price: 500,
    cover_gradient: GRADIENT_OPTIONS[0].value,
    cover_image: "",
    pages: "৩২০ পৃষ্ঠা",
    format: "হার্ডকভার + ই-বুক",
    stock_status: "in_stock" as "in_stock" | "low_stock" | "pre_order" | "out_of_stock",
    stock_quantity: 150,
    rating: 5.0,
    reviews_count: 850,
    featuresText: "অধ্যায়ভিত্তিক সকল সূত্র ও প্রমাণ\nবিগত ১০ বছরের বোর্ড প্রশ্ন সমাধান\nটাইপভিত্তিক শর্টকাট মেথড",
    is_popular: true,
    is_pinned: true,
    order_url: "",
    preview_pdf_url: "",
    delivery_info: "সারাদেশে ক্যাশ অন ডেলিভারি ২-৩ কার্যদিবসে",
    isbn: "",
  });

  const loadCategories = async () => {
    try {
      const cats = await dbService.getCategories();
      if (Array.isArray(cats) && cats.length > 0) {
        setDbCategories(cats);
      }
    } catch (err) {
      console.warn("Could not load categories in books admin:", err);
    }
  };

  const loadBooks = async () => {
    setLoading(true);
    try {
      const settings = await dbService.getSiteSettings();
      if (Array.isArray(settings?.ormission_books)) {
        // Ensure display_order and category mapping are sanitized
        const sanitized = settings.ormission_books.map((b: OrmissionBook, index: number) => {
          let catId = b.category_id;
          let catSlug = b.category_slug;
          let catName = b.category || "";

          // Auto-normalize existing books that only have string categories
          if (!catSlug && catName) {
            const lower = catName.toLowerCase().trim();
            if (lower === "ssc" || lower.includes("স্কুল")) {
              catSlug = "ssc";
              catId = 9;
              catName = "SSC";
            } else if (lower.includes("hsc") || lower.includes("এইচএসসি")) {
              catSlug = "hsc";
              catId = 6;
              catName = "HSC";
            } else if (lower.includes("admission") || lower.includes("ভর্তি") || lower.includes("ইঞ্জিনিয়ারিং")) {
              catSlug = "admission";
              catId = 5;
              catName = "Admission";
            } else if (lower.includes("medical") || lower.includes("মেডিকেল") || lower.includes("নার্সিং")) {
              catSlug = "nursing-medical";
              catId = 17;
              catName = "Medical & Nursing";
            } else if (lower.includes("arts") || lower.includes("commerce") || lower.includes("মানবিক")) {
              catSlug = "arts-commerce";
              catId = 10;
              catName = "Arts & Commerce";
            }
          }

          return {
            ...b,
            category: catName,
            category_id: catId,
            category_slug: catSlug,
            display_order: typeof b.display_order === "number" ? b.display_order : index + 1,
            author: b.author || "অরমিশন একাডেমি টিম",
            stock_status: b.stock_status || "in_stock",
          };
        });
        setBooks(sanitized);
      } else {
        setBooks([]);
      }
    } catch (err) {
      showToast("বইয়ের ডাটাবেজ লোড করতে সমস্যা হয়েছে।", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
    loadCategories();
  }, []);

  const saveBooksToDb = async (updatedList: OrmissionBook[]) => {
    setBooks(updatedList);
    const ok = await dbService.updateSiteSetting("ormission_books", updatedList);
    if (!ok) {
      showToast("ডাটাবেজে পরিবর্তন সংরক্ষণ করতে ব্যর্থ হয়েছে।", "error");
      loadBooks();
      return false;
    }
    return true;
  };

  // 1-Click Toggle for Pin to Home
  const handleTogglePin = async (id: string, currentVal: boolean) => {
    const updated = books.map((b) => (b.id === id ? { ...b, is_pinned: !currentVal } : b));
    const ok = await saveBooksToDb(updated);
    if (ok) {
      showToast(!currentVal ? "বইটি হোমপেজের স্লাইডশোতে পিন করা হয়েছে" : "হোমপেজ পিন অপসারণ করা হয়েছে", "info");
    }
  };

  // 1-Click Toggle for Popular Badge
  const handleTogglePopular = async (id: string, currentVal: boolean) => {
    const updated = books.map((b) => (b.id === id ? { ...b, is_popular: !currentVal } : b));
    const ok = await saveBooksToDb(updated);
    if (ok) {
      showToast(!currentVal ? "বইটিকে জনপ্রিয় ব্যাজ দেয়া হয়েছে" : "জনপ্রিয় ব্যাজ সরানো হয়েছে", "info");
    }
  };

  // Move Up / Move Down Reordering
  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= books.length) return;

    const newBooks = [...books];
    const temp = newBooks[index];
    newBooks[index] = newBooks[targetIndex];
    newBooks[targetIndex] = temp;

    // Update display_order sequence
    const reordered = newBooks.map((b, i) => ({
      ...b,
      display_order: i + 1,
    }));

    const ok = await saveBooksToDb(reordered);
    if (ok) {
      showToast("বইয়ের ক্রম সফলভাবে আপডেট হয়েছে");
    }
  };

  // 1-Click Duplicate Book
  const handleDuplicate = async (book: OrmissionBook) => {
    const duplicate: OrmissionBook = {
      ...book,
      id: `book-${Date.now()}`,
      title: `${book.title} (কপি)`,
      is_pinned: false,
      display_order: books.length + 1,
      created_at: new Date().toISOString(),
    };
    const updated = [duplicate, ...books];
    const ok = await saveBooksToDb(updated);
    if (ok) {
      showToast(`"${book.title}" সফলভাবে কপি করা হয়েছে।`);
    }
  };

  // Delete Handlers
  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    const updated = books.filter((b) => b.id !== deleteConfirm.id);
    const ok = await saveBooksToDb(updated);
    if (ok) {
      showToast(`"${deleteConfirm.title}" তালিকা থেকে মুছে ফেলা হয়েছে।`);
    }
    setDeleteConfirm(null);
  };

  // Find matching database category
  const findMatchingCategory = (bCat: string, catId?: number | string, catSlug?: string) => {
    if (catId) {
      const match = dbCategories.find((c) => String(c.id) === String(catId));
      if (match) return match;
    }
    if (catSlug) {
      const match = dbCategories.find((c) => c.slug.toLowerCase() === catSlug.toLowerCase());
      if (match) return match;
    }
    const clean = (bCat || "").toLowerCase().trim();
    return dbCategories.find(
      (c) =>
        c.slug.toLowerCase() === clean ||
        c.name.toLowerCase() === clean ||
        (c.name_bn && clean.includes(c.name_bn.toLowerCase())) ||
        (c.slug === "ssc" && clean.includes("ssc")) ||
        (c.slug === "hsc" && (clean.includes("hsc") || clean.includes("এইচএসসি"))) ||
        (c.slug === "admission" && (clean.includes("admission") || clean.includes("ভর্তি") || clean.includes("ইঞ্জিনিয়ারিং"))) ||
        (c.slug === "nursing-medical" && (clean.includes("medical") || clean.includes("মেডিকেল") || clean.includes("নার্সিং"))) ||
        (c.slug === "arts-commerce" && (clean.includes("arts") || clean.includes("commerce") || clean.includes("মানবিক")))
    );
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingBook(null);
    const defaultCat = dbCategories.find((c) => c.slug === "ssc") || dbCategories[0];
    setForm({
      title: "",
      subtitle: "",
      author: "অরমিশন একাডেমি টিম",
      edition: "১ম সংস্করণ ২০২৬",
      publisher: "অরমিশন পাবলিকেশন্স",
      category: defaultCat ? defaultCat.name : "SSC",
      category_id: defaultCat ? defaultCat.id : 9,
      category_slug: defaultCat ? defaultCat.slug : "ssc",
      price: 380,
      original_price: 500,
      cover_gradient: GRADIENT_OPTIONS[0].value,
      cover_image: "",
      pages: "৩২০ পৃষ্ঠা",
      format: "হার্ডকভার + ই-বুক",
      stock_status: "in_stock",
      stock_quantity: 100,
      rating: 5.0,
      reviews_count: 850,
      featuresText: "অধ্যায়ভিত্তিক সকল সূত্র ও প্রমাণ\nবিগত ১০ বছরের বোর্ড প্রশ্ন সমাধান\nটাইপভিত্তিক শর্টকাট মেথড",
      is_popular: true,
      is_pinned: true,
      order_url: "",
      preview_pdf_url: "",
      delivery_info: "সারাদেশে ক্যাশ অন ডেলিভারি ২-৩ কার্যদিবসে",
      isbn: "",
    });
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (b: OrmissionBook) => {
    setEditingBook(b);
    const matched = findMatchingCategory(b.category, b.category_id, b.category_slug);
    setForm({
      title: b.title || "",
      subtitle: b.subtitle || "",
      author: b.author || "অরমিশন একাডেমি টিম",
      edition: b.edition || "১ম সংস্করণ ২০২৬",
      publisher: b.publisher || "অরমিশন পাবলিকেশন্স",
      category: b.category || (matched ? matched.name : "SSC"),
      category_id: b.category_id || (matched ? matched.id : ""),
      category_slug: b.category_slug || (matched ? matched.slug : ""),
      price: b.price || 0,
      original_price: b.original_price || 0,
      cover_gradient: b.cover_gradient || GRADIENT_OPTIONS[0].value,
      cover_image: b.cover_image || "",
      pages: b.pages || "৩২০ পৃষ্ঠা",
      format: b.format || "হার্ডকভার",
      stock_status: b.stock_status || "in_stock",
      stock_quantity: typeof b.stock_quantity === "number" ? b.stock_quantity : 100,
      rating: b.rating || 5.0,
      reviews_count: b.reviews_count || 500,
      featuresText: Array.isArray(b.features) ? b.features.join("\n") : "",
      is_popular: !!b.is_popular,
      is_pinned: !!b.is_pinned,
      order_url: b.order_url || "",
      preview_pdf_url: b.preview_pdf_url || "",
      delivery_info: b.delivery_info || "সারাদেশে ক্যাশ অন ডেলিভারি ২-৩ কার্যদিবসে",
      isbn: b.isbn || "",
    });
    setShowModal(true);
  };

  // Handle Cover Photo Upload via /api/upload
  const handleCoverUpload = async (file: File) => {
    if (!file) return;
    setIsUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.url) {
        throw new Error(data.error || "আপলোড ব্যর্থ হয়েছে");
      }
      setForm((prev) => ({ ...prev, cover_image: data.url }));
      showToast("কাভার ছবি সফলভাবে আপলোড হয়েছে!");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "ছবি আপলোড ব্যর্থ হয়েছে", "error");
    } finally {
      setIsUploadingCover(false);
    }
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showToast("বইয়ের নাম অবশ্যই পূরণ করুন।", "error");
      return;
    }

    setSubmitting(true);
    const featuresList = form.featuresText
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    let updatedList: OrmissionBook[] = [];

    if (editingBook) {
      updatedList = books.map((b) =>
        b.id === editingBook.id
          ? {
              ...b,
              title: form.title.trim(),
              subtitle: form.subtitle.trim(),
              author: form.author.trim(),
              edition: form.edition.trim(),
              publisher: form.publisher.trim(),
              category: form.category.trim(),
              category_id: form.category_id || undefined,
              category_slug: form.category_slug || undefined,
              price: Number(form.price) || 0,
              original_price: Number(form.original_price) || 0,
              cover_gradient: form.cover_gradient,
              cover_image: form.cover_image.trim(),
              pages: form.pages.trim(),
              format: form.format.trim(),
              stock_status: form.stock_status,
              stock_quantity: Number(form.stock_quantity) || 0,
              rating: Number(form.rating) || 5.0,
              reviews_count: Number(form.reviews_count) || 100,
              features: featuresList,
              is_popular: form.is_popular,
              is_pinned: form.is_pinned,
              order_url: form.order_url.trim(),
              preview_pdf_url: form.preview_pdf_url.trim(),
              delivery_info: form.delivery_info.trim(),
              isbn: form.isbn.trim(),
            }
          : b
      );
    } else {
      const newBook: OrmissionBook = {
        id: `book-${Date.now()}`,
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        author: form.author.trim(),
        edition: form.edition.trim(),
        publisher: form.publisher.trim(),
        category: form.category.trim(),
        category_id: form.category_id || undefined,
        category_slug: form.category_slug || undefined,
        price: Number(form.price) || 0,
        original_price: Number(form.original_price) || 0,
        cover_gradient: form.cover_gradient,
        cover_image: form.cover_image.trim(),
        pages: form.pages.trim(),
        format: form.format.trim(),
        stock_status: form.stock_status,
        stock_quantity: Number(form.stock_quantity) || 0,
        rating: Number(form.rating) || 5.0,
        reviews_count: Number(form.reviews_count) || 100,
        features: featuresList,
        is_popular: form.is_popular,
        is_pinned: form.is_pinned,
        display_order: books.length + 1,
        order_url: form.order_url.trim(),
        preview_pdf_url: form.preview_pdf_url.trim(),
        delivery_info: form.delivery_info.trim(),
        isbn: form.isbn.trim(),
        created_at: new Date().toISOString(),
      };
      updatedList = [newBook, ...books];
    }

    const ok = await saveBooksToDb(updatedList);
    setSubmitting(false);
    if (ok) {
      setShowModal(false);
      showToast(editingBook ? "বইয়ের তথ্য সফলভাবে হালনাগাদ করা হয়েছে!" : "নতুন বই সফলভাবে যুক্ত করা হয়েছে!");
    }
  };

  // Categories list derived from DB categories + current books
  const categories = useMemo(() => {
    const dbCatNames = dbCategories.map((c) => c.name);
    const set = new Set([...dbCatNames, ...DEFAULT_CATEGORIES, ...books.map((b) => b.category).filter(Boolean)]);
    return Array.from(set);
  }, [books, dbCategories]);

  // Filtering & Sorting
  const filteredAndSortedBooks = useMemo(() => {
    let result = books.filter((b) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.title.toLowerCase().includes(q) ||
        (b.subtitle && b.subtitle.toLowerCase().includes(q)) ||
        (b.author && b.author.toLowerCase().includes(q)) ||
        b.category.toLowerCase().includes(q) ||
        (b.category_slug && b.category_slug.toLowerCase().includes(q));

      let matchesCat = filterCategory === "all";
      if (!matchesCat) {
        if (b.category_id && String(b.category_id) === filterCategory) {
          matchesCat = true;
        } else if (b.category_slug && b.category_slug.toLowerCase() === filterCategory.toLowerCase()) {
          matchesCat = true;
        } else {
          const bCat = (b.category || "").toLowerCase();
          const selectedDbCat = dbCategories.find(
            (c) => c.slug.toLowerCase() === filterCategory.toLowerCase() || String(c.id) === filterCategory
          );
          if (selectedDbCat) {
            matchesCat =
              bCat === selectedDbCat.slug.toLowerCase() ||
              bCat === selectedDbCat.name.toLowerCase() ||
              (selectedDbCat.name_bn && bCat.includes(selectedDbCat.name_bn.toLowerCase())) ||
              (selectedDbCat.slug === "ssc" && bCat.includes("ssc")) ||
              (selectedDbCat.slug === "hsc" && (bCat.includes("hsc") || b.category.includes("এইচএসসি"))) ||
              (selectedDbCat.slug === "admission" &&
                (bCat.includes("admission") || b.category.includes("ভর্তি") || b.category.includes("ইঞ্জিনিয়ারিং"))) ||
              (selectedDbCat.slug === "nursing-medical" &&
                (bCat.includes("medical") || b.category.includes("মেডিকেল") || b.category.includes("নার্সিং"))) ||
              (selectedDbCat.slug === "arts-commerce" &&
                (bCat.includes("arts") || bCat.includes("commerce") || b.category.includes("মানবিক")));
          } else {
            matchesCat = b.category === filterCategory;
          }
        }
      }

      let matchesStatus = true;
      if (filterStatus === "pinned") matchesStatus = !!b.is_pinned;
      else if (filterStatus === "popular") matchesStatus = !!b.is_popular;
      else if (filterStatus === "in_stock") matchesStatus = b.stock_status === "in_stock" || !b.stock_status;
      else if (filterStatus === "pre_order") matchesStatus = b.stock_status === "pre_order";

      return matchesSearch && matchesCat && matchesStatus;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "reviews") return (b.reviews_count || 0) - (a.reviews_count || 0);
      return (a.display_order || 0) - (b.display_order || 0);
    });

    return result;
  }, [books, searchQuery, filterCategory, filterStatus, sortBy]);

  // Executive KPI calculations
  const totalBooksCount = books.length;
  const pinnedCount = books.filter((b) => b.is_pinned).length;
  const popularCount = books.filter((b) => b.is_popular).length;
  const inStockCount = books.filter((b) => b.stock_status === "in_stock" || !b.stock_status).length;

  // Discount calculation for live preview
  const previewDiscount = useMemo(() => {
    if (form.original_price > form.price && form.original_price > 0) {
      return Math.round(((form.original_price - form.price) / form.original_price) * 100);
    }
    return 0;
  }, [form.price, form.original_price]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold font-bengali border backdrop-blur-md ${
              toast.type === "error"
                ? "bg-rose-500/90 border-rose-400 text-white shadow-rose-500/25"
                : toast.type === "info"
                ? "bg-sky-500/90 border-sky-400 text-white shadow-sky-500/25"
                : "bg-emerald-600/90 border-emerald-400 text-white shadow-emerald-500/25"
            }`}
          >
            {toast.type === "error" ? (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 hover:opacity-80 p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-5 sm:p-6 rounded-2xl border border-border shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-text font-bengali">
                  বই ও প্রকাশনা স্টুডিও
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-primary/15 text-primary border border-primary/25 font-sans">
                  {totalBooksCount} ITEMS
                </span>
              </div>
              <p className="text-xs text-text-muted font-bengali">
                হোমপেজের স্লাইডার, পাবলিকেশন ক্যাটালগ, মূল্যছাড় ও লাইভ অর্ডার নিয়ন্ত্রণ
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={loadBooks}
            disabled={loading}
            className="btn btn-outline btn-sm text-xs font-bengali flex items-center gap-1.5"
            title="ডাটাবেজ রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
            <span className="hidden sm:inline">রিফ্রেশ</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="btn btn-primary btn-sm font-bengali font-bold flex items-center gap-2 shadow-md shadow-primary/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">নতুন বই যুক্ত করুন</span>
            <span className="sm:hidden">বই যুক্ত করুন</span>
          </button>
        </div>
      </div>

      {/* Executive KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div
          onClick={() => setFilterStatus("all")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            filterStatus === "all"
              ? "bg-primary/10 border-primary/40 ring-1 ring-primary/40"
              : "bg-surface border-border hover:border-primary/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted font-bengali">মোট বই ক্যাটালগ</span>
            <div className="w-8 h-8 rounded-lg bg-slate-500/10 text-slate-400 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-text mt-2 font-sans">{totalBooksCount}</div>
          <span className="text-[10px] text-text-muted font-bengali">ক্যাটালগে সক্রিয় রয়েছে</span>
        </div>

        <div
          onClick={() => setFilterStatus(filterStatus === "pinned" ? "all" : "pinned")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            filterStatus === "pinned"
              ? "bg-primary/10 border-primary/40 ring-1 ring-primary/40"
              : "bg-surface border-border hover:border-primary/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary font-bengali">হোমপেজে পিন করা</span>
            <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
              <Pin className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-primary mt-2 font-sans flex items-center gap-1.5">
            <span>{pinnedCount}</span>
            <span className="text-xs font-normal text-text-muted">/ {totalBooksCount}</span>
          </div>
          <span className="text-[10px] text-text-muted font-bengali">সরাসরি হোমপেজ স্লাইডারে দৃশ্যমান</span>
        </div>

        <div
          onClick={() => setFilterStatus(filterStatus === "popular" ? "all" : "popular")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            filterStatus === "popular"
              ? "bg-amber-500/15 border-amber-500/40 ring-1 ring-amber-500/40"
              : "bg-surface border-border hover:border-amber-500/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-500 font-bengali">বেস্টসেলার / জনপ্রিয়</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-500 mt-2 font-sans">{popularCount}</div>
          <span className="text-[10px] text-text-muted font-bengali">টপ রেটেড স্টার ব্যাজসহ</span>
        </div>

        <div
          onClick={() => setFilterStatus(filterStatus === "in_stock" ? "all" : "in_stock")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            filterStatus === "in_stock"
              ? "bg-emerald-500/15 border-emerald-500/40 ring-1 ring-emerald-500/40"
              : "bg-surface border-border hover:border-emerald-500/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-500 font-bengali">ইন-স্টক ও ডেলিভারি রেডি</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-500 mt-2 font-sans">{inStockCount}</div>
          <span className="text-[10px] text-text-muted font-bengali">তাত্ক্ষণিক অর্ডার গ্রহণযোগ্য</span>
        </div>
      </div>

      {/* Filter, Search & View Controls Toolbar */}
      <div className="bg-surface rounded-2xl border border-border p-4 shadow-xs flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search Box */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="বইয়ের নাম, লেখক, বিষয় বা ক্যাটাগরি খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input w-full pl-10 pr-9 text-xs font-bengali"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns & View Mode */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input text-xs font-bengali py-1.5 h-9 font-bold"
          >
            <option value="all">সকল ক্যাটাগরি ({books.length})</option>
            {dbCategories.map((c) => {
              const count = books.filter((b) => {
                if (b.category_id && String(b.category_id) === String(c.id)) return true;
                if (b.category_slug && b.category_slug.toLowerCase() === c.slug.toLowerCase()) return true;
                const bCat = (b.category || "").toLowerCase();
                return (
                  bCat === c.slug.toLowerCase() ||
                  bCat === c.name.toLowerCase() ||
                  (c.name_bn && bCat.includes(c.name_bn.toLowerCase())) ||
                  (c.slug === "ssc" && bCat.includes("ssc")) ||
                  (c.slug === "hsc" && (bCat.includes("hsc") || b.category.includes("এইচএসসি"))) ||
                  (c.slug === "admission" &&
                    (bCat.includes("admission") || b.category.includes("ভর্তি") || b.category.includes("ইঞ্জিনিয়ারিং"))) ||
                  (c.slug === "nursing-medical" &&
                    (bCat.includes("medical") || b.category.includes("মেডিকেল") || b.category.includes("নার্সিং"))) ||
                  (c.slug === "arts-commerce" &&
                    (bCat.includes("arts") || bCat.includes("commerce") || b.category.includes("মানবিক")))
                );
              }).length;
              return (
                <option key={c.id} value={c.slug}>
                  {c.name} {c.name_bn ? `(${c.name_bn})` : ""} ({count})
                </option>
              );
            })}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="input text-xs font-bengali py-1.5 h-9"
          >
            <option value="all">সকল স্ট্যাটাস</option>
            <option value="pinned">📌 হোমপেজে পিন করা</option>
            <option value="popular">⭐ জনপ্রিয় বই</option>
            <option value="in_stock">📦 স্টকে আছে</option>
            <option value="pre_order">⏳ প্রি-অর্ডার</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="input text-xs font-bengali py-1.5 h-9"
          >
            <option value="order">ডিফল্ট ক্রম (Default Order)</option>
            <option value="price_asc">মূল্য: কম থেকে বেশি</option>
            <option value="price_desc">মূল্য: বেশি থেকে কম</option>
            <option value="rating">রেটিং: সর্বোচ্চ</option>
            <option value="reviews">রিভিউ সংখ্যা: সর্বাধিক</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center p-0.5 rounded-xl bg-surface-secondary border border-border">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-surface text-primary shadow-xs"
                  : "text-text-muted hover:text-text"
              }`}
              title="শো-রুম গ্রিড ভিউ"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-surface text-primary shadow-xs"
                  : "text-text-muted hover:text-text"
              }`}
              title="স্প্রেডশীট টেবিল ভিউ"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-surface rounded-2xl border border-border p-16 text-center text-xs text-text-muted font-bengali space-y-3">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin text-primary" />
          <p>ডাটাবেজ থেকে বইয়ের ক্যাটালগ লোড করা হচ্ছে...</p>
        </div>
      ) : filteredAndSortedBooks.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-border p-16 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-text font-bengali mb-1.5">কোনো বই পাওয়া যায়নি</h3>
          <p className="text-xs text-text-muted font-bengali mb-5 leading-relaxed">
            আপনার অনুসন্ধান বা ফিল্টারের সাথে মিলছে এমন কোনো বই নেই। ফিল্টার রিসেট করুন অথবা নতুন বই যুক্ত করুন।
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterCategory("all");
                setFilterStatus("all");
              }}
              className="btn btn-outline btn-sm font-bengali text-xs"
            >
              ফিল্টার রিসেট
            </button>
            <button onClick={handleOpenAdd} className="btn btn-primary btn-sm font-bengali font-bold text-xs">
              <PlusCircle className="w-4 h-4 mr-1.5" />
              নতুন বই যুক্ত করুন
            </button>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        /* ========================================================================= */
        /* STUDIO GRID VIEW (Ultra-Realistic Book Showroom) */
        /* ========================================================================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredAndSortedBooks.map((book, idx) => {
            const discountPct =
              book.original_price > book.price
                ? Math.round(((book.original_price - book.price) / book.original_price) * 100)
                : 0;

            const stockInfo = STOCK_STATUS_OPTIONS.find((s) => s.value === book.stock_status) || STOCK_STATUS_OPTIONS[0];

            return (
              <div
                key={book.id}
                className="group bg-surface rounded-2xl border border-border/90 hover:border-primary/50 overflow-hidden shadow-xs hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 flex flex-col relative"
              >
                {/* Book Card Cover Banner with 3D Spine Mockup */}
                <div
                  className={`relative h-56 w-full bg-gradient-to-br ${
                    book.cover_gradient || GRADIENT_OPTIONS[0].value
                  } p-4 flex flex-col justify-between overflow-hidden`}
                >
                  {/* Backdrop Glow & Texture */}
                  <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
                  <div className="absolute left-0 top-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_70%)] pointer-events-none" />

                  {/* Top Badges */}
                  <div className="relative z-10 flex items-center justify-between gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black text-white bg-black/40 backdrop-blur-md border border-white/20 font-bengali">
                      {book.category}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {book.is_pinned && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black text-white bg-primary shadow-xs font-bengali flex items-center gap-1">
                          <Pin className="w-2.5 h-2.5" />
                          <span>পিন</span>
                        </span>
                      )}
                      {book.is_popular && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black text-amber-900 bg-amber-400 shadow-xs font-bengali flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>বেস্টসেলার</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 3D Realistic Book Spine + Cover Area */}
                  <div className="relative z-10 flex items-center gap-3 my-auto">
                    <div className="relative w-16 h-24 rounded bg-white/10 backdrop-blur-md border border-white/30 shadow-[0_12px_24px_rgba(0,0,0,0.4)] flex flex-col items-center justify-center p-1 text-white shrink-0 group-hover:scale-105 transition-transform duration-300">
                      {/* Realistic book spine shadow on left edge */}
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-black/35 rounded-l border-r border-white/20 pointer-events-none" />

                      {book.cover_image ? (
                        <img
                          src={book.cover_image}
                          alt={book.title}
                          className="w-full h-full object-cover rounded-xs"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-1">
                          <BookOpen className="w-6 h-6 text-white drop-shadow-md mb-1" />
                          <span className="text-[7.5px] font-black tracking-wider text-white/90 uppercase">
                            ORMISSION
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="text-white space-y-1 min-w-0 pr-2">
                      <span className="inline-block px-2 py-0.5 rounded bg-white/20 text-[9.5px] font-bold font-bengali">
                        {book.format || "হার্ডকভার"}
                      </span>
                      <p className="text-xs font-bold text-white/95 font-bengali truncate">
                        {book.pages || "৩২০ পৃষ্ঠা"}
                      </p>
                      {book.edition && (
                        <p className="text-[10px] text-white/80 font-bengali truncate">
                          {book.edition}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bottom Stock Badge on Cover */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold font-bengali bg-black/50 backdrop-blur-md text-white border border-white/20`}>
                      {stockInfo.label.split(" (")[0]}
                    </span>
                    {discountPct > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[9.5px] font-black bg-rose-500 text-white font-sans shadow-xs">
                        -{discountPct}% OFF
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-4 flex flex-col flex-1 space-y-3 font-bengali">
                  <div>
                    <h3 className="text-sm font-black text-text group-hover:text-primary transition-colors line-clamp-1 leading-snug">
                      {book.title}
                    </h3>
                    <p className="text-xs text-text-muted line-clamp-1 mt-0.5 font-medium">
                      {book.subtitle || "পূর্ণাঙ্গ গাইড ও ফর্মুলা বুক"}
                    </p>
                    {book.author && (
                      <p className="text-[11px] text-primary font-bold mt-1 flex items-center gap-1">
                        <span className="text-text-muted font-normal">লেখক:</span>
                        <span className="truncate">{book.author}</span>
                      </p>
                    )}
                  </div>

                  {/* Highlights/Features */}
                  {Array.isArray(book.features) && book.features.length > 0 && (
                    <div className="space-y-1 pt-2 border-t border-border/60">
                      {book.features.slice(0, 2).map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-1.5 text-[11px] text-text-muted">
                          <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Price & Rating Bar */}
                  <div className="pt-2 border-t border-border/60 flex items-center justify-between mt-auto">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-black text-text font-sans">
                          ৳{book.price.toLocaleString("en-US")}
                        </span>
                        {book.original_price > book.price && (
                          <span className="text-xs text-text-muted line-through font-sans">
                            ৳{book.original_price.toLocaleString("en-US")}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-text-muted mt-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-text">{book.rating || 5.0}</span>
                        <span>({book.reviews_count || 100})</span>
                      </div>
                    </div>

                    {/* Quick Pin Toggle Button */}
                    <button
                      type="button"
                      onClick={() => handleTogglePin(book.id, book.is_pinned)}
                      className={`p-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        book.is_pinned
                          ? "bg-primary text-white border-primary shadow-xs"
                          : "bg-surface-secondary text-text-muted border-border hover:text-text hover:border-primary/40"
                      }`}
                      title={book.is_pinned ? "হোমপেজ স্লাইডার থেকে পিন সরান" : "হোমপেজ স্লাইডারে পিন করুন"}
                    >
                      <Pin className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Bottom Actions Toolbar */}
                  <div className="pt-2.5 border-t border-border/70 flex items-center justify-between text-xs">
                    {/* Reorder Up / Down */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 rounded-lg text-text-muted hover:text-text hover:bg-surface-secondary disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        title="উপরে সাজান (Move Up)"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(idx, "down")}
                        disabled={idx === books.length - 1}
                        className="p-1 rounded-lg text-text-muted hover:text-text hover:bg-surface-secondary disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        title="নিচে সাজান (Move Down)"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Duplicate, Edit, Delete */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleTogglePopular(book.id, book.is_popular)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          book.is_popular ? "text-amber-500 hover:bg-amber-500/10" : "text-text-muted hover:text-text hover:bg-surface-secondary"
                        }`}
                        title={book.is_popular ? "জনপ্রিয় ব্যাজ সরান" : "জনপ্রিয় ব্যাজ দিন"}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDuplicate(book)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
                        title="বইটি ডুপ্লিকেট / ক্লোন করুন"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(book)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
                        title="তথ্য সম্পাদনা করুন"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteConfirm({ id: book.id, title: book.title })}
                        className="p-1.5 rounded-lg text-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="বইটি মুছে ফেলুন"
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
      ) : (
        /* ========================================================================= */
        /* DATA TABLE VIEW (Compact Spreadsheet Management) */
        /* ========================================================================= */
        <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-secondary/70 border-b border-border text-text-muted uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-semibold w-12 text-center">ক্রম</th>
                  <th className="py-3 px-4 font-semibold">বই ও প্রকাশনা</th>
                  <th className="py-3 px-4 font-semibold">ক্যাটাগরি</th>
                  <th className="py-3 px-4 font-semibold">স্পেকস</th>
                  <th className="py-3 px-4 font-semibold">মূল্য</th>
                  <th className="py-3 px-4 font-semibold">স্টক স্ট্যাটাস</th>
                  <th className="py-3 px-4 font-semibold text-center">হোমপেজ পিন</th>
                  <th className="py-3 px-4 font-semibold text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-bengali">
                {filteredAndSortedBooks.map((b, idx) => {
                  const stockInfo = STOCK_STATUS_OPTIONS.find((s) => s.value === b.stock_status) || STOCK_STATUS_OPTIONS[0];

                  return (
                    <tr key={b.id} className="hover:bg-surface-secondary/40 transition-colors">
                      {/* Order Controls */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="flex flex-col items-center justify-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleMoveOrder(idx, "up")}
                            disabled={idx === 0}
                            className="text-text-muted hover:text-text disabled:opacity-20 cursor-pointer"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <span className="text-[10px] font-sans font-bold text-text-muted">
                            {idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleMoveOrder(idx, "down")}
                            disabled={idx === books.length - 1}
                            className="text-text-muted hover:text-text disabled:opacity-20 cursor-pointer"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Cover & Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-11 h-14 rounded bg-gradient-to-br ${
                              b.cover_gradient || GRADIENT_OPTIONS[0].value
                            } flex items-center justify-center text-white shrink-0 p-1 shadow-xs border border-white/20`}
                          >
                            {b.cover_image ? (
                              <img
                                src={b.cover_image}
                                alt=""
                                className="w-full h-full object-cover rounded-xs"
                              />
                            ) : (
                              <BookOpen className="w-4 h-4 text-white/90" />
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <div className="font-bold text-text text-sm hover:text-primary transition-colors truncate">
                              {b.title}
                            </div>
                            <div className="text-[11px] text-text-muted truncate">
                              {b.subtitle || b.author || "অরমিশন একাডেমি টিম"}
                            </div>
                            {b.edition && (
                              <span className="text-[10px] text-primary font-bold">
                                {b.edition}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-surface-secondary border border-border text-text">
                          {b.category}
                        </span>
                      </td>

                      {/* Format & Pages */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-text text-xs">{b.format}</div>
                        <div className="text-[11px] text-text-muted">{b.pages}</div>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-sans">
                        <div className="font-black text-text text-sm">৳{b.price.toLocaleString()}</div>
                        {b.original_price > b.price && (
                          <div className="text-[10px] text-text-muted line-through">
                            ৳{b.original_price.toLocaleString()}
                          </div>
                        )}
                      </td>

                      {/* Stock Status */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${stockInfo.color}`}>
                          {stockInfo.label.split(" (")[0]}
                        </span>
                      </td>

                      {/* Pinned Switch */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleTogglePin(b.id, b.is_pinned)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-bold transition-all border cursor-pointer ${
                            b.is_pinned
                              ? "bg-primary/15 text-primary border-primary/30 hover:bg-primary/25 shadow-xs"
                              : "bg-surface-secondary text-text-muted border-border hover:text-text hover:border-text-muted"
                          }`}
                        >
                          <Pin className="w-3 h-3" />
                          <span>{b.is_pinned ? "পিন করা" : "পিন করুন"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDuplicate(b)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
                            title="ক্লোন / ডুপ্লিকেট"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(b)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
                            title="সম্পাদনা"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm({ id: b.id, title: b.title })}
                            className="p-1.5 rounded-lg text-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 font-bengali">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-text">বইটি মুছে ফেলতে চান?</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                আপনি কি নিশ্চিত যে <span className="font-bold text-text">"{deleteConfirm.title}"</span> বইটি ক্যাটালগ ও হোমপেজ থেকে স্থায়ীভাবে মুছে ফেলতে চান?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="btn btn-outline btn-sm text-xs px-5"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="btn btn-sm text-xs font-bold px-5 bg-rose-600 hover:bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20"
              >
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT BOOK MODAL (Split Screen with Real-Time 3D Live Card Preview) */}
      {/* ========================================================================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-surface border border-border rounded-3xl w-full max-w-5xl my-auto max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-surface-secondary/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-text font-bengali">
                    {editingBook ? "বইয়ের তথ্য হালনাগাদ ও সম্পাদনা" : "নতুন বই ও প্রকাশনা যুক্ত করুন"}
                  </h3>
                  <p className="text-xs text-text-muted font-bengali">
                    ডানপাশে লাইভ প্রিভিউ দেখে তথ্যগুলো নিখুঁতভাবে সাজান
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl text-text-muted hover:text-text hover:bg-surface transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Split Screen Body */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 overflow-y-auto flex-1">
              {/* Left Column: Comprehensive Form (7 Cols) */}
              <form id="book-form" onSubmit={handleSubmit} className="lg:col-span-7 space-y-4 font-bengali">
                {/* 1. Basic Info Section */}
                <div className="p-4 rounded-2xl bg-surface-secondary/40 border border-border/80 space-y-3">
                  <span className="text-xs font-black uppercase text-primary tracking-wider font-sans block">
                    ১. মৌলিক বিবরণ (Basic Info)
                  </span>

                  <div>
                    <label className="block text-xs font-bold text-text mb-1">বইয়ের পূর্ণ নাম *</label>
                    <input
                      type="text"
                      required
                      placeholder="উদা: এইচএসসি পদার্থবিজ্ঞান মাস্টার ফর্মুলা বুক"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="input text-xs w-full font-bengali"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text mb-1">সংক্ষিপ্ত উপশিরোনাম / সাবটাইটেল</label>
                    <input
                      type="text"
                      placeholder="উদা: ১ম ও ২য় পত্রের সকল সূত্রের প্রমাণ ও শর্টকাট ট্রিকস..."
                      value={form.subtitle}
                      onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                      className="input text-xs w-full font-bengali"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-text mb-1">লেখক / শিক্ষক / মেন্টর</label>
                      <input
                        type="text"
                        placeholder="উদা: ড. মো. রফিকুল ইসলাম ও টিম"
                        value={form.author}
                        onChange={(e) => setForm({ ...form, author: e.target.value })}
                        className="input text-xs w-full font-bengali"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text mb-1">সংস্করণ (Edition)</label>
                      <input
                        type="text"
                        placeholder="উদা: ১ম সংস্করণ ২০২৬"
                        value={form.edition}
                        onChange={(e) => setForm({ ...form, edition: e.target.value })}
                        className="input text-xs w-full font-bengali"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-text">ক্যাটাগরি নির্ধারণ *</label>
                        {form.category_slug && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono font-bold">
                            slug: {form.category_slug}
                          </span>
                        )}
                      </div>
                      <select
                        value={
                          form.category_id
                            ? String(form.category_id)
                            : form.category_slug || form.category
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          const matched = dbCategories.find(
                            (c) => String(c.id) === val || c.slug === val
                          );
                          if (matched) {
                            setForm((prev) => ({
                              ...prev,
                              category_id: matched.id,
                              category_slug: matched.slug,
                              category: matched.name,
                            }));
                          } else {
                            setForm((prev) => ({
                              ...prev,
                              category: val,
                              category_id: "",
                              category_slug: "",
                            }));
                          }
                        }}
                        className="input text-xs w-full font-bengali h-10 font-bold"
                      >
                        <option value="">-- ক্যাটাগরি বেছে নিন --</option>
                        {dbCategories.map((c) => (
                          <option key={c.id} value={String(c.id)}>
                            {c.name} {c.name_bn ? `(${c.name_bn})` : ""} [ID: {c.id}]
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-text mb-1">প্রকাশনা / পাবলিশার</label>
                      <input
                        type="text"
                        value={form.publisher}
                        onChange={(e) => setForm({ ...form, publisher: e.target.value })}
                        className="input text-xs w-full font-bengali"
                        placeholder="অরমিশন পাবলিকেশন্স"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Pricing & Stock Section */}
                <div className="p-4 rounded-2xl bg-surface-secondary/40 border border-border/80 space-y-3">
                  <span className="text-xs font-black uppercase text-primary tracking-wider font-sans block">
                    ২. মূল্য ও ইনভেন্টরি স্টক (Pricing & Inventory)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-text mb-1">অফার / বিক্রয় মূল্য (৳) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                        className="input text-xs w-full font-sans font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text mb-1">নিয়মিত গায়ের মূল্য (MRP) ৳</label>
                      <input
                        type="number"
                        min="0"
                        value={form.original_price}
                        onChange={(e) => setForm({ ...form, original_price: Number(e.target.value) })}
                        className="input text-xs w-full font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text mb-1">ছাড়ের শতকরা হার</label>
                      <div className="input text-xs w-full font-sans font-bold bg-surface text-primary flex items-center">
                        {previewDiscount > 0 ? `-${previewDiscount}% ছাড়` : "কোনো ছাড় নেই"}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-text mb-1">স্টক প্রাপ্যতা স্ট্যাটাস</label>
                      <select
                        value={form.stock_status}
                        onChange={(e) => setForm({ ...form, stock_status: e.target.value as any })}
                        className="input text-xs w-full font-bengali"
                      >
                        {STOCK_STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-text mb-1">মওজুদ বই সংখ্যা (কপি)</label>
                      <input
                        type="number"
                        min="0"
                        value={form.stock_quantity}
                        onChange={(e) => setForm({ ...form, stock_quantity: Number(e.target.value) })}
                        className="input text-xs w-full font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text mb-1">ডেলিভারি তথ্য / শিপিং নোট</label>
                    <input
                      type="text"
                      value={form.delivery_info}
                      onChange={(e) => setForm({ ...form, delivery_info: e.target.value })}
                      className="input text-xs w-full font-bengali"
                      placeholder="সারাদেশে ক্যাশ অন ডেলিভারি ২-৩ কার্যদিবসে"
                    />
                  </div>
                </div>

                {/* 3. Cover Visuals & Theme */}
                <div className="p-4 rounded-2xl bg-surface-secondary/40 border border-border/80 space-y-3">
                  <span className="text-xs font-black uppercase text-primary tracking-wider font-sans block">
                    ৩. কাভার ভিজ্যুয়াল ও কালার থিম (Cover Art & Gradients)
                  </span>

                  <div>
                    <label className="block text-xs font-bold text-text mb-1.5">
                      কাভার ব্যাকগ্রাউন্ড গ্র্যাডিয়েন্ট থিম (৮টি প্রিমিয়াম অপশন)
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {GRADIENT_OPTIONS.map((g) => (
                        <button
                          key={g.value}
                          type="button"
                          onClick={() => setForm({ ...form, cover_gradient: g.value })}
                          className={`h-9 rounded-xl bg-gradient-to-br ${g.value} border-2 transition-all flex items-center justify-center text-white text-[9px] font-bold cursor-pointer ${
                            form.cover_gradient === g.value
                              ? "border-white ring-2 ring-primary scale-105 shadow-md"
                              : "border-transparent opacity-85 hover:opacity-100"
                          }`}
                          title={g.label}
                        >
                          {form.cover_gradient === g.value && <Check className="w-3.5 h-3.5 text-white drop-shadow" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cover Photo Upload */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-text">বইয়ের কাভার ছবি (Cover Photo)</label>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleCoverUpload(file);
                        }}
                      />
                      <button
                        type="button"
                        disabled={isUploadingCover}
                        onClick={() => fileInputRef.current?.click()}
                        className="btn btn-outline btn-sm text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        {isUploadingCover ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>{isUploadingCover ? "ছবি আপলোড হচ্ছে..." : "ছবি আপলোড করুন"}</span>
                      </button>

                      <input
                        type="url"
                        placeholder="অথবা সরাসরি ছবির URL পেস্ট করুন..."
                        value={form.cover_image}
                        onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
                        className="input text-xs flex-1 min-w-[200px] font-sans"
                      />

                      {form.cover_image && (
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, cover_image: "" })}
                          className="p-2 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                          title="ছবি অপসারণ করুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. Specifications & Highlights */}
                <div className="p-4 rounded-2xl bg-surface-secondary/40 border border-border/80 space-y-3">
                  <span className="text-xs font-black uppercase text-primary tracking-wider font-sans block">
                    ৪. স্পেসিফিকেশন ও বিশেষত্ব (Specifications & Highlights)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-text mb-1">মুদ্রণ ফরম্যাট</label>
                      <input
                        type="text"
                        value={form.format}
                        onChange={(e) => setForm({ ...form, format: e.target.value })}
                        className="input text-xs w-full font-bengali"
                        placeholder="হার্ডকভার + ই-বুক"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text mb-1">মোট পৃষ্ঠা সংখ্যা</label>
                      <input
                        type="text"
                        value={form.pages}
                        onChange={(e) => setForm({ ...form, pages: e.target.value })}
                        className="input text-xs w-full font-bengali"
                        placeholder="৩২০ পৃষ্ঠা"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-text mb-1">
                        নমুনা পাতা / ডেমো PDF লিংক (Look Inside)
                      </label>
                      <input
                        type="url"
                        value={form.preview_pdf_url}
                        onChange={(e) => setForm({ ...form, preview_pdf_url: e.target.value })}
                        className="input text-xs w-full font-sans"
                        placeholder="https://.../sample_chapter.pdf"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text mb-1 flex items-center justify-between">
                        <span>বই অর্ডার / ক্রয়ের লিংক (যেমন: রকমারি লিংক)</span>
                        <span className="text-[10px] text-primary font-normal">রকমারি, ওয়াফিলাইফ ইত্যাদি</span>
                      </label>
                      <input
                        type="url"
                        value={form.order_url}
                        onChange={(e) => setForm({ ...form, order_url: e.target.value })}
                        className="input text-xs w-full font-sans"
                        placeholder="https://www.rokomari.com/book/... বা যেকোনো অর্ডার লিংক"
                      />
                      <p className="text-[10.5px] text-text-muted mt-1 font-bengali">
                        শিক্ষার্থী বইয়ের পেজে &apos;সংগ্রহ করুন&apos; বাটনে ক্লিক করলে সরাসরি এই লিংকে গিয়ে অর্ডার করতে পারবে।
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text mb-1">
                      বইয়ের আকর্ষণীয় ফিচারসমূহ (প্রতি লাইনে একটি)
                    </label>
                    <textarea
                      rows={3}
                      value={form.featuresText}
                      onChange={(e) => setForm({ ...form, featuresText: e.target.value })}
                      placeholder="অধ্যায়ভিত্তিক সকল সূত্র ও মাত্রা&#10;বিগত ১০ বছরের বোর্ড প্রশ্ন সমাধান&#10;টাইপভিত্তিক শর্টকাট মেথড..."
                      className="input text-xs w-full py-2 resize-none font-bengali leading-relaxed"
                    />
                  </div>
                </div>

                {/* 5. Visibility Controls */}
                <div className="p-4 rounded-2xl bg-surface-secondary/40 border border-border/80 flex flex-wrap items-center justify-between gap-4">
                  <label className="inline-flex items-center gap-2.5 cursor-pointer text-xs font-bold text-text select-none">
                    <input
                      type="checkbox"
                      checked={form.is_pinned}
                      onChange={(e) => setForm({ ...form, is_pinned: e.target.checked })}
                      className="checkbox checkbox-primary rounded w-4 h-4 cursor-pointer"
                    />
                    <Pin className="w-4 h-4 text-primary" />
                    <span>হোমপেজের বুক স্লাইডারে পিন রাখুন</span>
                  </label>

                  <label className="inline-flex items-center gap-2.5 cursor-pointer text-xs font-bold text-text select-none">
                    <input
                      type="checkbox"
                      checked={form.is_popular}
                      onChange={(e) => setForm({ ...form, is_popular: e.target.checked })}
                      className="checkbox checkbox-primary rounded w-4 h-4 cursor-pointer"
                    />
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>জনপ্রিয় / বেস্টসেলার ব্যাজ দেখান</span>
                  </label>
                </div>
              </form>

              {/* Right Column: Real-Time 3D Live Card Preview (5 Cols) */}
              <div className="lg:col-span-5 flex flex-col space-y-3 font-bengali">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-text-muted tracking-wider font-sans flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-primary" />
                    <span>লাইভ কার্ড প্রিভিউ (Live Preview)</span>
                  </span>
                  <span className="text-[10px] text-text-muted">হোমপেজ ও ক্যাটালগে যেমন দেখাবে</span>
                </div>

                <div className="sticky top-4 bg-background/60 p-4 rounded-3xl border border-border/90 shadow-inner flex flex-col items-center justify-center">
                  <div className="w-full max-w-xs bg-surface rounded-2xl border border-border overflow-hidden shadow-2xl transition-all flex flex-col">
                    {/* Simulated Cover Area */}
                    <div
                      className={`relative h-56 w-full bg-gradient-to-br ${form.cover_gradient} p-4 flex flex-col justify-between overflow-hidden`}
                    >
                      <div className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full bg-white/10 blur-xl pointer-events-none" />
                      <div className="absolute left-0 top-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_70%)] pointer-events-none" />

                      {/* Top Badges */}
                      <div className="relative z-10 flex items-center justify-between gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[9.5px] font-black text-white bg-black/40 backdrop-blur-md border border-white/20">
                          {form.category || "এইচএসসি বিজ্ঞান"}
                        </span>
                        <div className="flex items-center gap-1">
                          {form.is_pinned && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black text-white bg-primary">
                              পিন
                            </span>
                          )}
                          {form.is_popular && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black text-amber-900 bg-amber-400">
                              জনপ্রিয়
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Realistic Spine + Cover */}
                      <div className="relative z-10 flex items-center gap-3 my-auto">
                        <div className="relative w-16 h-24 rounded bg-white/15 backdrop-blur-md border border-white/30 shadow-2xl flex flex-col items-center justify-center p-1 text-white shrink-0">
                          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-black/40 rounded-l border-r border-white/20 pointer-events-none" />
                          {form.cover_image ? (
                            <img
                              src={form.cover_image}
                              alt=""
                              className="w-full h-full object-cover rounded-xs"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-center p-1">
                              <BookOpen className="w-6 h-6 text-white drop-shadow mb-1" />
                              <span className="text-[7.5px] font-black tracking-wider text-white/90 uppercase">
                                ORMISSION
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="text-white space-y-1 min-w-0 pr-2">
                          <span className="inline-block px-2 py-0.5 rounded bg-white/20 text-[9px] font-bold">
                            {form.format || "হার্ডকভার"}
                          </span>
                          <p className="text-xs font-bold text-white/95 truncate">
                            {form.pages || "৩২০ পৃষ্ঠা"}
                          </p>
                          {form.edition && (
                            <p className="text-[10px] text-white/80 truncate">
                              {form.edition}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Bottom Banner */}
                      <div className="relative z-10 flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-black/50 text-white border border-white/20">
                          {STOCK_STATUS_OPTIONS.find((s) => s.value === form.stock_status)?.label.split(" (")[0]}
                        </span>
                        {previewDiscount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[9.5px] font-black bg-rose-500 text-white font-sans">
                            -{previewDiscount}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content Preview */}
                    <div className="p-4 space-y-2.5">
                      <div>
                        <h4 className="font-black text-text text-sm line-clamp-1">
                          {form.title || "বইয়ের নাম লিখুন"}
                        </h4>
                        <p className="text-xs text-text-muted line-clamp-1">
                          {form.subtitle || "সংক্ষিপ্ত উপশিরোনাম..."}
                        </p>
                        {form.author && (
                          <p className="text-[10.5px] text-primary font-bold mt-0.5 truncate">
                            লেখক: {form.author}
                          </p>
                        )}
                      </div>

                      {/* Features */}
                      {form.featuresText.trim() && (
                        <div className="space-y-1 pt-2 border-t border-border/60">
                          {form.featuresText
                            .split("\n")
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((f, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-[10.5px] text-text-muted">
                                <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />
                                <span className="truncate">{f}</span>
                              </div>
                            ))}
                        </div>
                      )}

                      {/* Pricing & CTA */}
                      <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                        <div>
                          <div className="flex items-baseline gap-1.5 font-sans">
                            <span className="text-lg font-black text-text">
                              ৳{(form.price || 0).toLocaleString()}
                            </span>
                            {form.original_price > form.price && (
                              <span className="text-xs text-text-muted line-through">
                                ৳{(form.original_price || 0).toLocaleString()}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-text-muted">
                            {form.delivery_info || "ক্যাশ অন ডেলিভারি"}
                          </span>
                        </div>

                        <div className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold flex items-center gap-1.5 shadow-xs">
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>সংগ্রহ করুন</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-5 border-t border-border bg-surface-secondary/60 flex items-center justify-between gap-3 font-bengali">
              <span className="text-xs text-text-muted hidden sm:inline">
                💡 যেকোনো পরিবর্তন সরাসরি ডাটাবেজে সংরক্ষণ করা হবে।
              </span>
              <div className="flex items-center gap-2.5 ml-auto">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-outline btn-sm text-xs px-4"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  form="book-form"
                  disabled={submitting}
                  className="btn btn-primary btn-sm text-xs font-bold flex items-center gap-2 shadow-md shadow-primary/25 px-5"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>সংরক্ষণ হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingBook ? "পরিবর্তন সংরক্ষণ করুন" : "বইটি প্রকাশ করুন"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
