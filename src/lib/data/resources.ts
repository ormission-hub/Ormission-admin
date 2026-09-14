export interface FreeResource {
  id: string;
  slug: string;
  title: string;
  titleBn: string;
  category: "HSC" | "SSC" | "Admission" | "General";
  categoryBn: string;
  subject: string;
  subjectBn: string;
  format: "PDF" | "CheatSheet" | "Handnote";
  fileSize: string;
  pages: number;
  downloadsCount: number;
  downloadUrl: string;
  description: string;
  descriptionBn: string;
  featured: boolean;
  publishedAt: string;
}

export const FREE_RESOURCES: FreeResource[] = [
  {
    id: "res-1",
    slug: "hsc-physics-all-formulas-cheat-sheet",
    title: "HSC Physics 1st & 2nd Paper Complete Formula Handbook",
    titleBn: "এইচএসসি পদার্থবিজ্ঞান ১ম ও ২য় পত্র সকল সূত্রের কম্প্যাক্ট শিট",
    category: "HSC",
    categoryBn: "এইচএসসি",
    subject: "Physics",
    subjectBn: "পদার্থবিজ্ঞান",
    format: "CheatSheet",
    fileSize: "4.8 MB",
    pages: 18,
    downloadsCount: 14250,
    downloadUrl: "#",
    description: "Every single formula from HSC Physics 1st and 2nd paper compiled chapter-wise with SI units, dimensional analysis and quick notes.",
    descriptionBn: "এইচএসসি ১ম ও ২য় পত্রের প্রতিটি অধ্যায়ের গাণিতিক সূত্র, একক, মাত্রা এবং বিশেষ শর্তাবলী একসাথে গুছিয়ে দেওয়া হয়েছে।",
    featured: true,
    publishedAt: "২০২৬-০৮-১০",
  },
  {
    id: "res-2",
    slug: "buet-past-20-years-math-analysis",
    title: "BUET Math 20-Year Trend Analysis & Chapter Weightage",
    titleBn: "বুয়েট গণিত বিগত ২০ বছরের অধ্যায়ভিত্তিক প্রশ্ন বিশ্লেষণ",
    category: "Admission",
    categoryBn: "ভর্তি প্রস্তুতি",
    subject: "Higher Math",
    subjectBn: "উচ্চতর গণিত",
    format: "PDF",
    fileSize: "6.2 MB",
    pages: 26,
    downloadsCount: 18900,
    downloadUrl: "#",
    description: "Detailed breakdown of questions asked in BUET undergraduate admission test over the last 20 years with high-yield chapter ratings.",
    descriptionBn: "বিগত ২০ বছরের বুয়েট ভর্তি পরীক্ষায় কোন কোন অধ্যায় থেকে কত মার্কসের প্রশ্ন এসেছে তার নিখুঁত পরিসংখ্যান ও বিশ্লেষণ।",
    featured: true,
    publishedAt: "২০২৬-০৮-১৫",
  },
  {
    id: "res-3",
    slug: "medical-biology-high-yield-mnemonics",
    title: "Medical Admission Biology High-Yield Mnemonics Guide",
    titleBn: "মেডিকেল জীববিজ্ঞান মনে রাখার জাদুকরী নেমোনিক্স হ্যান্ডবুক",
    category: "Admission",
    categoryBn: "ভর্তি প্রস্তুতি",
    subject: "Biology",
    subjectBn: "জীববিজ্ঞান",
    format: "Handnote",
    fileSize: "3.5 MB",
    pages: 14,
    downloadsCount: 16700,
    downloadUrl: "#",
    description: "Handcrafted mnemonics by DMC students to easily memorize biological classifications, cranial nerves, enzymes, and botanical families.",
    descriptionBn: "উদ্ভিদবিজ্ঞান ও প্রাণিবিজ্ঞানের কঠিন বৈজ্ঞানিক নাম, ক্র্যানিয়াল নার্ভ, এনজাইম সহজে মনে রাখার শর্টকাট নেমোনিক।",
    featured: true,
    publishedAt: "২০২৬-০৮-২০",
  },
  {
    id: "res-4",
    slug: "hsc-organic-chemistry-reaction-flowchart",
    title: "HSC Organic Chemistry Full Reaction Flowchart",
    titleBn: "জৈব রসায়ন সম্পূর্ণ বিক্রিয়ার রঙিন ফ্লোচার্ট ও রোডম্যাপ",
    category: "HSC",
    categoryBn: "এইচএসসি",
    subject: "Chemistry",
    subjectBn: "রসায়ন",
    format: "CheatSheet",
    fileSize: "5.1 MB",
    pages: 8,
    downloadsCount: 12400,
    downloadUrl: "#",
    description: "Single-page master roadmaps for Alkane, Alkene, Alkyne, Alcohol, Aldehyde, Ketone and Aromatic conversions.",
    descriptionBn: "অ্যালকেন থেকে শুরু করে অ্যারোমেটিক যৌগের পারস্পরিক রূপান্তরের এক নজরে দেখার মতো রঙিন ফ্লোচার্ট।",
    featured: true,
    publishedAt: "২০২৬-০৮-২৫",
  },
  {
    id: "res-5",
    slug: "ssc-general-math-geometry-theorems",
    title: "SSC General Math Geometry Proofs & Revision Sheet",
    titleBn: "এসএসসি সাধারণ গণিত জ্যামিতির উপপাদ্য ও কুইক রিভিশন শিট",
    category: "SSC",
    categoryBn: "এসএসসি",
    subject: "General Math",
    subjectBn: "সাধারণ গণিত",
    format: "PDF",
    fileSize: "3.9 MB",
    pages: 16,
    downloadsCount: 9800,
    downloadUrl: "#",
    description: "All circle and triangle theorems required for SSC board examinations with step-by-step visual proofs.",
    descriptionBn: "এসএসসি বোর্ড পরীক্ষায় আসার মতো বৃত্ত ও ত্রিভুজের সকল গুরুত্বপূর্ণ উপপাদ্যের সহজ ও নির্ভুল প্রমাণ।",
    featured: false,
    publishedAt: "২০২৬-০৯-০১",
  },
  {
    id: "res-6",
    slug: "du-a-unit-calculatorless-speed-math",
    title: "DU A-Unit Speed Math & Non-Calculator Calculation Tricks",
    titleBn: "ঢাবি ‘ক’ ইউনিট: ক্যালকুলেটর ছাড়া দ্রুত হিসাবের কৌশল",
    category: "Admission",
    categoryBn: "ভর্তি প্রস্তুতি",
    subject: "General Science",
    subjectBn: "সাধারণ বিজ্ঞান",
    format: "Handnote",
    fileSize: "2.8 MB",
    pages: 12,
    downloadsCount: 15300,
    downloadUrl: "#",
    description: "How to estimate roots, logarithms, powers, trigonometric values and chemistry titrations quickly during university exams.",
    descriptionBn: "ক্যালকুলেটর ছাড়া ভগ্নাংশ, রুট, লগ এবং সাইন-কস এর মান মাত্র ৫ সেকেন্ডে অনুমানের বাস্তবমুখী টেকনিক।",
    featured: false,
    publishedAt: "২০২৬-০৯-০৫",
  },
];
