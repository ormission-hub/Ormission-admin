export interface Subcategory {
  id: string;
  name: string;
  nameBn: string;
  slug: string;
  courseCount: number;
}

export interface Category {
  id: string;
  name: string;
  nameBn: string;
  slug: string;
  description: string;
  iconName: string;
  color: string;
  courseCount: number;
  subcategories: Subcategory[];
}

export const CATEGORIES: Category[] = [
  {
    id: "hsc-academic",
    name: "HSC Academic",
    nameBn: "এইচএসসি একাডেমিক",
    slug: "hsc-academic",
    description: "এইচএসসি বিজ্ঞান, মানবিক ও ব্যবসায় শিক্ষা শাখার পূর্ণাঙ্গ প্রস্তুতি",
    iconName: "GraduationCap",
    color: "#2563EB",
    courseCount: 42,
    subcategories: [
      { id: "hsc-science", name: "Science", nameBn: "বিজ্ঞান বিভাগ", slug: "science", courseCount: 24 },
      { id: "hsc-arts", name: "Humanities", nameBn: "মানবিক বিভাগ", slug: "humanities", courseCount: 10 },
      { id: "hsc-commerce", name: "Business Studies", nameBn: "ব্যবসায় শিক্ষা", slug: "business-studies", courseCount: 8 },
    ],
  },
  {
    id: "admission-prep",
    name: "Admission Prep",
    nameBn: "বিশ্ববিদ্যালয় ভর্তি প্রস্তুতি",
    slug: "admission-prep",
    description: "বুয়েট, মেডিকেল, ঢাকা বিশ্ববিদ্যালয় ও গুচ্ছ ভর্তি পরীক্ষার স্পেশাল কোর্স",
    iconName: "Compass",
    color: "#0F766E",
    courseCount: 36,
    subcategories: [
      { id: "engineering", name: "Engineering / BUET", nameBn: "ইঞ্জিনিয়ারিং ও বুয়েট", slug: "engineering", courseCount: 12 },
      { id: "medical", name: "Medical / Dental", nameBn: "মেডিকেল ও ডেন্টাল", slug: "medical", courseCount: 11 },
      { id: "varsity-ka", name: "Varsity A-Unit", nameBn: "ভার্সিটি ‘ক’ ইউনিট", slug: "varsity-a", courseCount: 8 },
      { id: "iba-bup", name: "IBA & BUP", nameBn: "আইবিএ ও বিইউপি", slug: "iba-bup", courseCount: 5 },
    ],
  },
  {
    id: "ssc-academic",
    name: "SSC Academic",
    nameBn: "এসএসসি একাডেমিক",
    slug: "ssc-academic",
    description: "নবম ও দশম শ্রেণির বোর্ড পরীক্ষার নিশ্চিত এ+ প্রস্তুতির কোর্সসমূহ",
    iconName: "BookOpen",
    color: "#E9A23B",
    courseCount: 28,
    subcategories: [
      { id: "ssc-science", name: "SSC Science", nameBn: "এসএসসি বিজ্ঞান", slug: "ssc-science", courseCount: 16 },
      { id: "ssc-general", name: "SSC General", nameBn: "এসএসসি সাধারণ বিষয়", slug: "ssc-general", courseCount: 12 },
    ],
  },
  {
    id: "skills-career",
    name: "Skills & Development",
    nameBn: "স্কিলস ও ক্যারিয়ার",
    slug: "skills-career",
    description: "বাস্তব জীবনের প্রয়োজনীয় ডিজিটাল দক্ষতা ও ভাষাশিক্ষা",
    iconName: "Laptop",
    color: "#16805C",
    courseCount: 18,
    subcategories: [
      { id: "programming", name: "Programming & Web", nameBn: "প্রোগ্রামিং ও ওয়েব", slug: "programming", courseCount: 8 },
      { id: "english-skills", name: "Practical English", nameBn: "ব্যবহারিক ইংরেজি", slug: "english", courseCount: 6 },
      { id: "productivity", name: "Productivity Tools", nameBn: "প্রোডাক্টিভিটি টুলস", slug: "productivity", courseCount: 4 },
    ],
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
