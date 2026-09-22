"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import brandLogoImg from "../../public/images/brand-logo-v2.png";
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  FolderTree,
  Users,
  Receipt,
  GraduationCap,
  FileDown,
  FileText,
  MessageSquare,
  Search,
  Settings,
  CreditCard,
  Menu,
  X,
  Bell,
  CheckCircle2,
  Sun,
  Moon,
  ChevronRight,
  ChevronLeft,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
  Headphones,
  Share2,
} from "lucide-react";
import { useTheme } from "./theme-provider";

interface NavItem {
  label: string;
  labelBn: string;
  href: string;
  icon: any;
  badge?: string;
}

interface NavGroup {
  title: string;
  titleBn: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: "Academics & Courses",
    titleBn: "কোর্স ও শিক্ষা ব্যবস্থাপনা",
    items: [
      { label: "Dashboard", labelBn: "ড্যাশবোর্ড", href: "/", icon: LayoutDashboard },
      { label: "All Courses", labelBn: "সকল কোর্স", href: "/courses", icon: BookOpen },
      { label: "Book Management", labelBn: "বই ব্যবস্থাপনা", href: "/books", icon: BookOpen, badge: "Live" },
      { label: "Create Course", labelBn: "নতুন কোর্স তৈরি", href: "/courses/new", icon: PlusCircle },
      { label: "Categories", labelBn: "ক্যাটাগরি ও বিষয়", href: "/categories", icon: FolderTree },
      { label: "Instructors", labelBn: "ইন্সট্রাক্টর প্যানেল", href: "/instructors", icon: GraduationCap },
    ],
  },
  {
    title: "Operations & Sales",
    titleBn: "অপারেশনস ও সেলস",
    items: [
      { label: "Students", labelBn: "শিক্ষার্থী তালিকা", href: "/students", icon: Users },
      { label: "Orders & Billing", labelBn: "অর্ডার ও পেমেন্ট", href: "/orders", icon: Receipt },
      { label: "Support Tickets", labelBn: "সাপোর্ট টিকিট ও হেল্পডেস্ক", href: "/support", icon: Headphones, badge: "Live" },
      { label: "Payment Settings", labelBn: "পেমেন্ট মেথড সেটিংস", href: "/settings/payment", icon: CreditCard, badge: "Live" },
    ],
  },
  {
    title: "Content & Marketing CMS",
    titleBn: "কন্টেন্ট ও মার্কেটিং CMS",
    items: [
      { label: "Hero Banner & CMS", labelBn: "হিরো ফটো ও ব্যানার", href: "/hero", icon: Layers, badge: "Live" },
      { label: "Social Media Links", labelBn: "সোশ্যাল ও কমিউনিটি লিংক", href: "/social", icon: Share2, badge: "Live" },
      { label: "Free Resources", labelBn: "ফ্রি রিসোর্স CMS", href: "/resources", icon: FileDown },
      { label: "Testimonials", labelBn: "টেস্টিমোনিয়াল", href: "/testimonials", icon: MessageSquare },
      { label: "SEO & Metadata", labelBn: "এসইও মেটাডাটা", href: "/seo", icon: Search },
      { label: "Site Settings", labelBn: "সাইট সেটিংস", href: "/settings", icon: Settings },
    ],
  },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { resolvedTheme, toggleTheme } = useTheme();
  const navScrollRef = useRef<HTMLDivElement>(null);
  const activeNavRef = useRef<HTMLAnchorElement>(null);

  // Load saved sidebar state from localStorage safely after mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ormission_admin_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Auto-scroll active nav item into view when pathname changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeNavRef.current && navScrollRef.current) {
        activeNavRef.current.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("ormission_admin_sidebar_collapsed", String(next));
      } catch {
        // Ignore localStorage errors
      }
      return next;
    });
  }, []);

  // Keyboard shortcut: Ctrl + B or Cmd + B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleCollapse();
      }
      if (e.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen, toggleCollapse]);

  // Determine current breadcrumb
  const currentNav = navGroups
    .flatMap((g) => g.items)
    .find((item) => item.href === pathname);

  return (
    <div className="admin-shell-root">
      {/* Top Header Bar — fixed at top */}
      <header className="admin-header">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile hamburger toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-text-muted hover:text-text hover:bg-surface-secondary transition-colors border border-border/60 shrink-0"
            aria-label="Toggle mobile navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Desktop sidebar collapse / expand toggle */}
          <button
            type="button"
            onClick={toggleCollapse}
            className="hidden lg:flex items-center justify-center p-2 rounded-xl text-text-muted hover:text-text hover:bg-surface-secondary transition-all border border-transparent hover:border-border shrink-0"
            title={isCollapsed ? "সাইডবার বড় করুন / Expand sidebar (Ctrl+B)" : "সাইডবার লুকান / Collapse sidebar (Ctrl+B)"}
            aria-label="Toggle sidebar collapse"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-5 h-5 text-primary transition-transform hover:scale-110" />
            ) : (
              <PanelLeftClose className="w-5 h-5 transition-transform hover:scale-110" />
            )}
          </button>

          {/* Brand Logo & Tag */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-xs border border-blue-600/30 bg-[#012c94] flex items-center justify-center group-hover:border-blue-500 transition-colors shrink-0">
              <Image
                src={brandLogoImg}
                alt="Ormission Logo"
                width={36}
                height={36}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="hidden sm:block">
              <div className="font-extrabold text-sm tracking-wide text-text uppercase">
                ORM<span className="text-primary">ISSION</span>
              </div>
              <div className="text-[10px] text-text-muted font-medium -mt-0.5">
                Admin Console
              </div>
            </div>
          </Link>

          {/* Breadcrumbs on Desktop */}
          <div className="hidden md:flex items-center gap-2 text-xs text-text-muted ml-3 pl-3 border-l border-border min-w-0">
            <span className="shrink-0">Console</span>
            <ChevronRight className="w-3 h-3 text-text-muted/60 shrink-0" />
            <span className="text-text font-semibold truncate">
              {currentNav ? currentNav.label : "Dashboard"}
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Dark Mode Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-text-muted hover:text-text hover:bg-surface-secondary transition-colors border border-transparent hover:border-border"
            title={resolvedTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="w-4 h-4 text-accent animate-spin-once" />
            ) : (
              <Moon className="w-4 h-4 text-primary" />
            )}
          </button>

          {/* Notification Bell */}
          <button
            type="button"
            className="relative p-2 rounded-xl text-text-muted hover:text-text hover:bg-surface-secondary transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
          </button>

          {/* Admin Avatar Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-border">
            <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs border border-primary/25">
              AD
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-bold text-text leading-none">Super Admin</div>
              <div className="text-[10px] text-text-muted mt-0.5">admin@ormission.com</div>
            </div>
          </div>
        </div>
      </header>

      {/* Body: Sidebar + Content */}
      <div className="admin-body">
        {/* Backdrop for Mobile Drawer */}
        {isMobileMenuOpen && (
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity animate-in fade-in"
            aria-hidden="true"
          />
        )}

        {/* Left Sidebar */}
        <aside
          className={`admin-sidebar ${
            isMobileMenuOpen
              ? "admin-sidebar--open"
              : "admin-sidebar--closed"
          } ${isCollapsed ? "admin-sidebar--collapsed" : "admin-sidebar--expanded"}`}
        >
          {/* Mobile Drawer Top Header */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-surface-secondary/50 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#012c94] p-0.5 border border-blue-600/40">
                <Image
                  src={brandLogoImg}
                  alt="Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <div>
                <div className="font-extrabold text-xs tracking-wide uppercase">
                  ORM<span className="text-primary">ISSION</span>
                </div>
                <p className="text-[10px] text-text-muted">Admin Console</p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-secondary transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Nav groups */}
          <div
            ref={navScrollRef}
            className="admin-sidebar-nav"
          >
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                {/* Group Title or Divider */}
                {isCollapsed ? (
                  <div className="hidden lg:flex items-center justify-center my-2.5">
                    <div className="w-6 h-px bg-border/80" />
                  </div>
                ) : (
                  <div className="px-3 flex items-center justify-between text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                    <span>{group.title}</span>
                    <span className="text-[10px] font-normal text-text-muted/60 font-bengali hidden sm:inline">
                      {group.titleBn}
                    </span>
                  </div>
                )}

                {/* Items */}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        ref={isActive ? activeNavRef : undefined}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        title={`${item.label} (${item.labelBn})`}
                        className={`
                          relative flex items-center rounded-xl text-xs font-medium
                          transition-all duration-200 group
                          ${isCollapsed ? "lg:justify-center p-2.5" : "justify-between px-3 py-2"}
                          ${
                            isActive
                              ? "bg-primary/10 text-primary font-bold shadow-xs border border-primary/25"
                              : "text-text-muted hover:text-text hover:bg-surface-secondary/80 border border-transparent"
                          }
                        `}
                      >
                        <div
                          className={`flex items-center ${
                            isCollapsed ? "lg:justify-center" : "gap-2.5 min-w-0"
                          }`}
                        >
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                              isActive ? "text-primary" : "text-text-muted group-hover:text-primary"
                            }`}
                          />
                          {/* Label visible when not collapsed (or on mobile drawer) */}
                          <div
                            className={`flex flex-col min-w-0 ${
                              isCollapsed ? "lg:hidden" : "block"
                            }`}
                          >
                            <span className="text-xs font-semibold leading-tight truncate">
                              {item.label}
                            </span>
                            <span className="text-[10px] text-text-muted/70 font-bengali leading-none truncate mt-0.5">
                              {item.labelBn}
                            </span>
                          </div>
                        </div>

                        {/* Badge */}
                        {item.badge && (
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0 ${
                              isCollapsed ? "lg:hidden" : "inline-block"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}

                        {/* Active vertical indicator bar */}
                        {isActive && (
                          <span
                            className={`absolute top-1/2 -translate-y-1/2 rounded-r bg-primary shadow-sm shadow-primary left-0 ${
                              isCollapsed ? "lg:w-1 lg:h-6 w-1 h-5" : "w-1 h-5"
                            }`}
                          />
                        )}

                        {/* Floating Tooltip card in collapsed mode on Desktop */}
                        {isCollapsed && (
                          <div className="hidden lg:group-hover:flex absolute left-full ml-3 z-50 flex-col items-start min-w-[150px] px-3 py-2 rounded-xl bg-surface/95 dark:bg-slate-900/95 border border-border shadow-xl backdrop-blur-md pointer-events-none animate-in fade-in slide-in-from-left-2 duration-150">
                            <div className="flex items-center gap-1.5 w-full justify-between">
                              <span className="text-xs font-bold text-text">{item.label}</span>
                              {item.badge && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-text-muted font-bengali mt-0.5">
                              {item.labelBn}
                            </span>
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Controls in Sidebar */}
          <div className="p-3 border-t border-border bg-surface-secondary/40 space-y-2 shrink-0">
            {/* Dedicated Desktop Collapse / Expand Button */}
            <button
              type="button"
              onClick={toggleCollapse}
              className={`
                hidden lg:flex items-center rounded-xl text-xs font-medium text-text-muted
                hover:text-text hover:bg-surface-secondary transition-all w-full border border-border/50
                ${isCollapsed ? "justify-center p-2.5" : "justify-between px-3 py-2"}
              `}
              title={isCollapsed ? "সাইডবার বড় করুন / Expand (Ctrl+B)" : "সাইডবার লুকান / Collapse (Ctrl+B)"}
            >
              <div className="flex items-center gap-2">
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-primary" />
                ) : (
                  <>
                    <ChevronLeft className="w-4 h-4" />
                    <span>সাইডবার লুকান (Collapse)</span>
                  </>
                )}
              </div>
              {!isCollapsed && (
                <kbd className="text-[10px] font-mono bg-surface px-1.5 py-0.5 rounded border border-border text-text-muted/70">
                  Ctrl+B
                </kbd>
              )}
            </button>

            {/* Version Information */}
            {!isCollapsed ? (
              <div className="pt-1">
                <div className="flex items-center justify-between text-[11px] text-text-muted">
                  <span>সিস্টেম সংস্করণ</span>
                  <span className="font-mono font-bold text-text bg-surface px-1.5 py-0.5 rounded border border-border text-[10px]">
                    v2.0-live
                  </span>
                </div>
                <div className="text-[10px] text-text-muted mt-0.5 font-bengali">
                  Ormission EdTech Engine
                </div>
              </div>
            ) : (
              <div className="hidden lg:flex justify-center py-1" title="Ormission v2.0-live">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            )}
          </div>
        </aside>

        {/* Page Content Container */}
        <main className="admin-main">
          {children}
        </main>
      </div>
    </div>
  );
}
