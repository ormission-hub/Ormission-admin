import { INSTRUCTORS, type Instructor } from "./instructors";
import { CATEGORIES } from "./categories";

export interface Lesson {
  id: string;
  title: string;
  titleBn: string;
  duration: string; // e.g. "24:15"
  isFreePreview: boolean;
  videoUrl?: string;
  resourcesCount?: number;
}

export interface CurriculumSection {
  id: string;
  title: string;
  titleBn: string;
  lessons: Lesson[];
}

export interface CourseFAQ {
  question: string;
  answer: string;
}

export interface StudentReview {
  id: string;
  studentName: string;
  avatar?: string;
  rating: number;
  date: string;
  batch: string;
  comment: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  titleBn: string;
  subtitle: string;
  subtitleBn: string;
  categoryId: string;
  categorySlug: string;
  categoryNameBn: string;
  subcategorySlug: string;
  subcategoryNameBn: string;
  instructorId: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  enrolledCount: number;
  durationHours: number;
  totalLessons: number;
  level: "All Levels" | "Beginner" | "Intermediate" | "Advanced";
  language: string;
  thumbnail: string;
  previewVideoUrl: string;
  isFeatured: boolean;
  isPopular: boolean;
  badge?: string;
  badgeColor?: "primary" | "secondary" | "accent";
  description: string;
  descriptionBn: string;
  highlights: string[];
  prerequisites: string[];
  curriculum: CurriculumSection[];
  faqs: CourseFAQ[];
  reviews: StudentReview[];
}

export const COURSES: Course[] = [
  {
    id: "course-1",
    slug: "buet-engineering-physics-mastery",
    title: "BUET Engineering Physics Mastery 2026",
    titleBn: "বুয়েট ও ইঞ্জিনিয়ারিং পদার্থবিজ্ঞান স্পেশাল ব্যাচ",
    subtitle: "Complete problem solving, concept clarity and Olympiad-level approach for BUET admission.",
    subtitleBn: "সম্পূর্ণ কনসেপ্ট ক্লিয়ারিং, বিগত ২০ বছরের প্রশ্ন সমাধান ও কনসেপচুয়াল প্রবলেম সলভিং।",
    categoryId: "admission-prep",
    categorySlug: "admission-prep",
    categoryNameBn: "বিশ্ববিদ্যালয় ভর্তি প্রস্তুতি",
    subcategorySlug: "engineering",
    subcategoryNameBn: "ইঞ্জিনিয়ারিং ও বুয়েট",
    instructorId: "inst-2",
    price: 3850,
    originalPrice: 5500,
    rating: 4.95,
    reviewsCount: 840,
    enrolledCount: 6420,
    durationHours: 65,
    totalLessons: 82,
    level: "Advanced",
    language: "বাংলা",
    thumbnail: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?q=80&w=800&auto=format&fit=crop",
    previewVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    isFeatured: true,
    isPopular: true,
    badge: "বেস্টসেলার",
    badgeColor: "primary",
    description: "The most comprehensive Physics masterclass designed specifically for BUET, CKET and Engineering admission seekers. Learn how to solve complex multi-concept physics problems methodically.",
    descriptionBn: "বুয়েট ও অন্যান্য ইঞ্জিনিয়ারিং বিশ্ববিদ্যালয়ের পদার্থবিজ্ঞান প্রশ্নের প্যাটার্ন ও গভীরতা সাধারণ পরীক্ষার চেয়ে ভিন্ন। এই কোর্সে বেসিক সূত্র থেকে শুরু করে জটিল মেকানিক্স, তাপগতিবিদ্যা এবং আধুনিক পদার্থবিজ্ঞানের প্রতিটি গাণিতিক সমস্যা হাতে-কলমে সমাধান করা হয়েছে।",
    highlights: [
      "৮২টি পূর্ণাঙ্গ রেকর্ডেড ক্লাস ও ডেডিকেটেড সলভ ক্লাস",
      "বিগত ২০ বছরের বুয়েট ভর্তি পরীক্ষার প্রশ্ন বিশ্লেষণ",
      "প্রতিটি অধ্যায়ের সাথে লেকচার শিট ও প্র্যাকটিস শিট PDF",
      "ডাউট ক্লিয়ারিং লাইভ সেশন এবং কনসেপ্ট রিভিশন মডিউল",
      "১ বছর মেয়াদি আনলিমিটেড অ্যাক্সেস ও মোবাইল অ্যাপ অফলাইন ভিউ",
    ],
    prerequisites: [
      "এইচএসসি পদার্থবিজ্ঞান প্রথম ও দ্বিতীয় পত্রের মৌলিক ধারণা",
      "ক্যালকুলাস ও ত্রিকোণমিতির মৌলিক সূত্র প্রয়োগের দক্ষতা",
    ],
    curriculum: [
      {
        id: "sec-1",
        title: "Section 1: Mechanics & Dynamics Foundations",
        titleBn: "অধ্যায় ১: নিউটনিয়ান বলবিদ্যা ও গতিবিদ্যা",
        lessons: [
          { id: "l-1-1", title: "Course Introduction & Strategic Roadmap", titleBn: "কোর্স পরিচিতি ও বুয়েট পদার্থবিজ্ঞান স্ট্র্যাটেজি", duration: "18:40", isFreePreview: true },
          { id: "l-1-2", title: "Inertial Frames & Pseudo Forces in Pulley Systems", titleBn: "জড় প্রসঙ্গ কাঠামো ও পুলি সিস্টেমে অপকেন্দ্র বল", duration: "42:15", isFreePreview: true },
          { id: "l-1-3", title: "Variable Mass Problems: Rocket Propulsion Dynamics", titleBn: "পরিবর্তনশীল ভর: রকেটের গতি ও ত্বরণ বিশ্লেষণ", duration: "38:50", isFreePreview: false },
          { id: "l-1-4", title: "Friction & Rolling Motion on Inclined Plane", titleBn: "ঘর্ষণ বল এবং আনত তলে গড়ানোর গতি", duration: "45:10", isFreePreview: false },
        ],
      },
      {
        id: "sec-2",
        title: "Section 2: Work, Energy & Power Mastery",
        titleBn: "অধ্যায় ২: কাজ, শক্তি ও ক্ষমতা",
        lessons: [
          { id: "l-2-1", title: "Conservative vs Non-Conservative Force Calculus", titleBn: "সংরক্ষণশীল বল ও বিভব শক্তি সমীকরণ", duration: "35:20", isFreePreview: false },
          { id: "l-2-2", title: "Spring Complex Systems & Elastic Potential Energy", titleBn: "স্প্রিং সংযোগ এবং স্থিতিস্থাপক শক্তি সমস্যা", duration: "50:12", isFreePreview: false },
          { id: "l-2-3", title: "Vertical Circular Motion Critical Velocity", titleBn: "উল্লম্ব বৃত্তাকার গতি ও ক্রান্তিক বেগ সমীকরণ", duration: "41:30", isFreePreview: false },
        ],
      },
      {
        id: "sec-3",
        title: "Section 3: Rotational Dynamics & Moment of Inertia",
        titleBn: "অধ্যায় ৩: ঘূর্ণন গতিবিদ্যা ও জড়তার ভ্রামক",
        lessons: [
          { id: "l-3-1", title: "Parallel & Perpendicular Axis Theorems", titleBn: "সমান্তরাল ও লম্ব অক্ষ উপপাদ্যের বাস্তব প্রয়োগ", duration: "46:25", isFreePreview: false },
          { id: "l-3-2", title: "Torque, Angular Momentum Conservation", titleBn: "টর্ক এবং কৌণিক ভরবেগের সংরক্ষণ নীতি", duration: "54:10", isFreePreview: false },
        ],
      },
      {
        id: "sec-4",
        title: "Section 4: Thermodynamics & Heat Engine Cycle",
        titleBn: "অধ্যায় ৪: তাপগতিবিদ্যা ও ইঞ্জিন সাইকেল",
        lessons: [
          { id: "l-4-1", title: "First Law Applications in Isothermal & Adiabatic", titleBn: "সমোষ্ণ ও রুদ্ধতাপীয় প্রক্রিয়ার সম্পূর্ণ গাণিতিক রূপ", duration: "52:00", isFreePreview: false },
          { id: "l-4-2", title: "Carnot Engine & Entropy Variations", titleBn: "কার্নো চক্র ও এনট্রপির নিখুঁত হিসাব", duration: "48:15", isFreePreview: false },
        ],
      },
    ],
    faqs: [
      {
        question: "কোর্সটি কবে পর্যন্ত অ্যাক্সেস করা যাবে?",
        answer: "ভর্তি হওয়ার দিন থেকে পরবর্তী ৩৬৫ দিন পর্যন্ত যেকোনো ডিভাইস থেকে আনলিমিটেড যতবার খুশি ক্লাস দেখতে পারবেন।",
      },
      {
        question: "ক্লাসগুলো কি রেকর্ডেড নাকি লাইভ?",
        answer: "সকল লেকচার হাই-কোয়ালিটি 1080p ফুল এইচডি রেকর্ডেড। সাথে প্রতি মাসে ইন্সট্রাক্টরের সাথে স্পেশাল লাইভ ডাউট সলভিং সেশন থাকবে।",
      },
      {
        question: "লেকচার শিট বা প্র্যাকটিস ম্যাটেরিয়াল কীভাবে পাব?",
        answer: "প্রতিটি ক্লাসের নিচে সংশ্লিষ্ট লেকচার স্লাইড এবং গাণিতিক প্র্যাকটিস শিট এক ক্লিকে ডাউনলোডযোগ্য PDF হিসেবে সংযুক্ত থাকবে।",
      },
      {
        question: "টাকা পরিশোধ করার পর কীভাবে ক্লাসে যুক্ত হব?",
        answer: "পেমেন্ট সফল হওয়ার সাথে সাথেই আপনার ড্যাশবোর্ডে কোর্সটি অ্যাক্টিভ হয়ে যাবে। কোনো ম্যানুয়াল ভেরিফিকেশন বা অনুমোদনের অপেক্ষা নেই।",
      },
    ],
    reviews: [
      {
        id: "rev-1",
        studentName: "সাদমান সাকিব",
        rating: 5,
        date: "১৫ আগস্ট, ২০২৬",
        batch: "বুয়েট ব্যাচ '২৫",
        comment: "তানভীর ভাইয়ার মেকানিক্সের ক্লাসগুলো দেখার পর ফিজিক্সের জটিল প্রবলেম দেখার ভীতি একদম চলে গেছে। বুয়েট ভর্তি পরীক্ষার জন্য অপরিহার্য একটি কোর্স!",
      },
      {
        id: "rev-2",
        studentName: "ফারহানা ইয়াসমিন",
        rating: 5,
        date: "২৮ জুলাই, ২০২৬",
        batch: "এইচএসসি ব্যাচ '২৬",
        comment: "ক্লাসের কনসেপ্ট একদম স্বচ্ছ হয়ে যায়। প্রতিটি সূত্রের পেছনের আসল পদার্থবিজ্ঞান বুঝতে ভাইয়ার চেয়ে ভালো আর কেউ বোঝাতে পারে না।",
      },
    ],
  },
  {
    id: "course-2",
    slug: "medical-biology-question-bank-solve",
    title: "Medical Biology 100% Concept & Question Bank Solve",
    titleBn: "মেডিকেল জীববিজ্ঞান সম্পূর্ণ কনসেপ্ট ও প্রশ্নব্যাংক সলভ",
    subtitle: "Master Botany & Zoology for Medical & Dental Admission with memory hacks and diagrammatic analysis.",
    subtitleBn: "মেডিকেল ভর্তি পরীক্ষার জন্য উদ্ভিদবিজ্ঞান ও প্রাণিবিজ্ঞান শতভাগ আয়ত্ত করার বিশেষ কোর্স।",
    categoryId: "admission-prep",
    categorySlug: "admission-prep",
    categoryNameBn: "বিশ্ববিদ্যালয় ভর্তি প্রস্তুতি",
    subcategorySlug: "medical",
    subcategoryNameBn: "মেডিকেল ও ডেন্টাল",
    instructorId: "inst-1",
    price: 3200,
    originalPrice: 4800,
    rating: 4.92,
    reviewsCount: 650,
    enrolledCount: 5120,
    durationHours: 58,
    totalLessons: 74,
    level: "Intermediate",
    language: "বাংলা",
    thumbnail: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=800&auto=format&fit=crop",
    previewVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    isFeatured: true,
    isPopular: true,
    badge: "জনপ্রিয়",
    badgeColor: "secondary",
    description: "Designed by DMC alumni Dr. Rafiqul Islam, this course breaks down high-yield medical biology chapters using high-retention mnemonic techniques and meticulous past-paper dissection.",
    descriptionBn: "মেডিকেল ভর্তি পরীক্ষায় বায়োলজি অংশে সর্বোচ্চ নম্বর তোলাই মেধা তালিকায় স্থান নিশ্চিত করার প্রধান চাবিকাঠি। হাসান স্যার এবং গাজী আজমল স্যারের বইয়ের প্রতিটি লাইনভিত্তিক গুরুত্বপূর্ণ তথ্য এই কোর্সে সুবিন্যস্তভাবে আলোচনা করা হয়েছে।",
    highlights: [
      "৭৪টি নিবিড় ভিডিও লেকচার (উদ্ভিদবিজ্ঞান + প্রাণিবিজ্ঞান)",
      "মেডিকেল ও ডেন্টাল বিগত ২৫ বছরের প্রশ্ন চুলচেরা বিশ্লেষণ",
      "মনে রাখার শর্ট টেকনিক, নেমোনিক এবং হাই-রেজোলিউশন ডায়াগ্রাম",
      "অধ্যায়ভিত্তিক দাগানো বইয়ের PDF এবং কুইক রিভিশন চার্ট",
    ],
    prerequisites: [
      "এইচএসসি জীববিজ্ঞান প্রথম ও দ্বিতীয় পত্রের সাধারণ প্রস্তুতি",
    ],
    curriculum: [
      {
        id: "sec-m-1",
        title: "Section 1: Cell Biology & Genetics High Yields",
        titleBn: "অধ্যায় ১: কোষ ও কোষের গঠন",
        lessons: [
          { id: "lm-1-1", title: "Course Blueprint & Medical Strategy", titleBn: "মেডিকেল বায়োলজি প্ল্যান ও প্রস্তুতি স্ট্র্যাটেজি", duration: "15:20", isFreePreview: true },
          { id: "lm-1-2", title: "Cell Membrane Models & Transport Mechanisms", titleBn: "কোষঝিল্লি ও তরল মোজাইক মডেলের গভীর বিশ্লেষণ", duration: "36:40", isFreePreview: true },
          { id: "lm-1-3", title: "DNA Replication & Transcription Medical Points", titleBn: "ডিএনএ অনুলিপন ও প্রতিলিপিকরণ থেকে আসার মতো প্রশ্ন", duration: "44:10", isFreePreview: false },
        ],
      },
      {
        id: "sec-m-2",
        title: "Section 2: Human Physiology & Circulatory System",
        titleBn: "অধ্যায় ২: মানব শারীরতত্ত্ব — রক্ত ও সংবহন",
        lessons: [
          { id: "lm-2-1", title: "Cardiac Cycle & ECG Waveform Interpretation", titleBn: "কার্ডিয়াক চক্র এবং ইসিজি তরঙ্গের ক্লিনিক্যাল ব্যাখ্যা", duration: "48:30", isFreePreview: false },
          { id: "lm-2-2", title: "Blood Clotting Cascades & Blood Grouping", titleBn: "রক্ত তঞ্চন প্রক্রিয়া ও ফ্যাক্টরসমূহ মনে রাখার টেকনিক", duration: "39:15", isFreePreview: false },
        ],
      },
    ],
    faqs: [
      {
        question: "দাগানো বইয়ের PDF কি দেওয়া হবে?",
        answer: "হ্যাঁ, জীববিজ্ঞান ১ ও ২য় পত্রের জন্য মেডিকেল স্ট্যান্ডার্ডে দাগানো বইয়ের হাইলাইটেড PDF কোর্স ম্যাটেরিয়ালে অন্তর্ভুক্ত আছে।",
      },
    ],
    reviews: [
      {
        id: "rev-m-1",
        studentName: "তানজিলা আকতার",
        rating: 5,
        date: "১০ আগস্ট, ২০২৬",
        batch: "ডিএমসি '২৬ ব্যাচ",
        comment: "রফিকুল স্যারের পড়ানোর ধরণ অনন্য। বায়োলজির জটিল নামগুলো নেমোনিকের কারণে একদম মাথায় গেঁথে যায়।",
      },
    ],
  },
  {
    id: "course-3",
    slug: "hsc-higher-math-complete-mastery",
    title: "HSC Higher Mathematics Complete 200/200 Prep",
    titleBn: "এইচএসসি উচ্চতর গণিত ১ম ও ২য় পত্র পূর্ণাঙ্গ প্রস্তুতি",
    subtitle: "Complete HSC board syllabus coverage with calculus, coordinate geometry and mechanics shortcuts.",
    subtitleBn: "এইচএসসি বোর্ড পরীক্ষায় পূর্ণাঙ্গ ২০০ নম্বরের প্রস্তুতি ও অ্যাডমিশন ফাউন্ডেশন বিল্ডিং।",
    categoryId: "hsc-academic",
    categorySlug: "hsc-academic",
    categoryNameBn: "এইচএসসি একাডেমিক",
    subcategorySlug: "science",
    subcategoryNameBn: "বিজ্ঞান বিভাগ",
    instructorId: "inst-4",
    price: 3450,
    originalPrice: 4900,
    rating: 4.93,
    reviewsCount: 710,
    enrolledCount: 5800,
    durationHours: 72,
    totalLessons: 90,
    level: "Intermediate",
    language: "বাংলা",
    thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=800&auto=format&fit=crop",
    previewVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    isFeatured: true,
    isPopular: true,
    badge: "নতুন ব্যাচ",
    badgeColor: "accent",
    description: "A complete step-by-step higher mathematics course for HSC Science students. Covers all theoretical derivations, board creative question formats (CQ), and multiple choice question (MCQ) speed tricks.",
    descriptionBn: "উচ্চতর গণিতে শিক্ষার্থীরা সবচেয়ে বেশি ভয় পায় ক্যালকুলাস এবং ত্রিকোণমিতিকে। এই কোর্সে প্রতিটি অধ্যায়ের মৌলিক সূত্র প্রমাণ থেকে শুরু করে বোর্ড পরীক্ষার সৃজনশীল প্রশ্ন এবং এমসিকিউ শর্টকাট কৌশল নিখুঁতভাবে শেখানো হয়েছে।",
    highlights: [
      "৯০টি বিস্তারিত লেকচার ক্লাস ১ম ও ২য় পত্রের সকল অধ্যায় নিয়ে",
      "সকল শিক্ষা বোর্ডের বিগত ১০ বছরের সৃজনশীল প্রশ্ন সমাধান",
      "ক্যালকুলেটর ট্রিকস ও ৩০ সেকেন্ডে MCQ সমাধান কৌশল",
      "হাতে লেখা লেকচার নোটস ও অধ্যায়ভিত্তিক ফর্মুলা বুকলেট PDF",
    ],
    prerequisites: [
      "এসএসসি সাধারণ গণিত ও উচ্চতর গণিতের মৌলিক সূত্রাবলী",
    ],
    curriculum: [
      {
        id: "sec-hm-1",
        title: "Section 1: Matrices & Determinants (1st Paper)",
        titleBn: "অধ্যায় ১: ম্যাট্রিক্স ও নির্ণায়ক",
        lessons: [
          { id: "l-hm-1-1", title: "Matrix Algebra & Multiplication Rules", titleBn: "ম্যাট্রিক্সের প্রকারভেদ ও গুণের নিয়ম", duration: "32:10", isFreePreview: true },
          { id: "l-hm-1-2", title: "Cramer's Rule & Inversion Operations", titleBn: "ক্রেমারের নিয়ম ও বিপরীত ম্যাট্রিক্স নির্ণয়", duration: "41:50", isFreePreview: false },
        ],
      },
      {
        id: "sec-hm-2",
        title: "Section 2: Differential Calculus Foundations",
        titleBn: "অধ্যায় ২: অন্তরীকরণ (ক্যালকুলাস)",
        lessons: [
          { id: "l-hm-2-1", title: "Limits Concept & L'Hopital's Rule", titleBn: "সীমা (Limit) ও এল-হসপিটাল নিয়মের জাদুকরী প্রয়োগ", duration: "44:00", isFreePreview: true },
          { id: "l-hm-2-2", title: "First Principle Derivatives & Chain Rule", titleBn: "মূল নিয়মে অন্তরজ ও চেইন রুলের নির্ভুল প্রয়োগ", duration: "51:30", isFreePreview: false },
        ],
      },
    ],
    faqs: [
      {
        question: "কোর্সে কি ১ম ও ২য় পত্র দুটোই কভার করা হয়েছে?",
        answer: "হ্যাঁ, এইচএসসি ১ম পত্র এবং ২য় পত্রের সবকটি অধ্যায় পূর্ণাঙ্গ সিলেবাস অনুযায়ী সম্পূর্ণ কভার করা হয়েছে।",
      },
    ],
    reviews: [
      {
        id: "rev-hm-1",
        studentName: "নাবিল চৌধুরী",
        rating: 5,
        date: "০২ সেপ্টেম্বর, ২০২৬",
        batch: "নটর ডেম কলেজ",
        comment: "মাহমুদুল স্যারের ক্যালকুলাসের ক্লাসগুলো দেখার পর মনে হয়েছে অংক এত সহজ হতে পারে! বোর্ড পরীক্ষার পাশাপাশি অ্যাডমিশনের জন্যও দারুণ কার্যকরী।",
      },
    ],
  },
  {
    id: "course-4",
    slug: "hsc-chemistry-organic-masterclass",
    title: "HSC Organic Chemistry Mastery & Synthesis",
    titleBn: "জৈব রসায়ন সহজ পাঠ ও বিক্রিয়ার মেকানিজম",
    subtitle: "Overcome fear of organic chemistry with reaction roadmaps, mechanisms and conversion charts.",
    subtitleBn: "জৈব রসায়ন নিয়ে সব ভয় দূর করতে বিক্রিয়ার রোডম্যাপ ও রূপান্তর চার্ট ভিত্তিক মাস্টারক্লাস।",
    categoryId: "hsc-academic",
    categorySlug: "hsc-academic",
    categoryNameBn: "এইচএসসি একাডেমিক",
    subcategorySlug: "science",
    subcategoryNameBn: "বিজ্ঞান বিভাগ",
    instructorId: "inst-3",
    price: 2600,
    originalPrice: 3800,
    rating: 4.88,
    reviewsCount: 520,
    enrolledCount: 4200,
    durationHours: 48,
    totalLessons: 55,
    level: "Intermediate",
    language: "বাংলা",
    thumbnail: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?q=80&w=800&auto=format&fit=crop",
    previewVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    isFeatured: true,
    isPopular: false,
    badge: "স্পেশাল",
    badgeColor: "secondary",
    description: "Organic Chemistry accounts for 30-40% of chemistry marks in HSC and admission tests. Nusrat Jahan simplifies all IUPAC naming, electrophilic/nucleophilic substitutions, aromatic compounds and synthesis conversions.",
    descriptionBn: "জৈব রসায়নের শত শত বিক্রিয়া মুখস্থ না করে মেকানিজমের সাহায্যে বোঝার সবচেয়ে কার্যকরী কোর্স। বিক্রিয়ার রোডম্যাপের মাধ্যমে কীভাবে যেকোনো একটি যৌগ থেকে অন্য যেকোনো যৌগ তৈরি করা যায় তা শেখানো হয়েছে।",
    highlights: [
      "৫৫টি বিক্রিয়া ও মেকানিজম ভিত্তিক ক্লাস",
      "রিয়্যাকশন ফ্লোচার্ট ও রঙিন রোডম্যাপ শিট PDF",
      "বোর্ড সৃজনশীল ও শনাক্তকরণ বিক্রিয়া সমাধান",
      "মেডিকেল ও ভার্সিটি এমসিকিউ শর্টকাট চার্ট",
    ],
    prerequisites: ["পর্যায় সারণি ও রাসায়নিক বন্ধনের মৌলিক ধারণা"],
    curriculum: [
      {
        id: "sec-oc-1",
        title: "Section 1: IUPAC Nomenclature & Isomerism",
        titleBn: "অধ্যায় ১: জৈব যৌগের নামকরণ ও সমাণুতা",
        lessons: [
          { id: "l-oc-1", title: "IUPAC Naming Systematic Rules", titleBn: "জৈব যৌগের ইউপ্যাক নামকরণের সহজ নিয়ম", duration: "35:00", isFreePreview: true },
          { id: "l-oc-2", title: "Geometrical & Optical Isomerism", titleBn: "জ্যামিতিক ও আলোক সমাণুতা চেনার টেকনিক", duration: "48:20", isFreePreview: false },
        ],
      },
    ],
    faqs: [
      {
        question: "বিক্রিয়ার শিটগুলো কি প্রিন্ট করা যাবে?",
        answer: "হ্যাঁ, সকল রোডম্যাপ এবং রঙিন বিক্রিয়া চার্ট হাই-কোয়ালিটি A4 সাইজে প্রিন্ট উপযোগী PDF ফরমেটে দেওয়া আছে।",
      },
    ],
    reviews: [
      {
        id: "rev-oc-1",
        studentName: "মেহজাবিন রহমান",
        rating: 5,
        date: "১২ আগস্ট, ২০২৬",
        batch: "ভিকারুননিসা নূন",
        comment: "জৈব রসায়ন মুখস্থ করতে করতে ক্লান্ত হয়ে গিয়েছিলাম। আপুর রোডম্যাপ চার্ট পেয়ে পুরো অধ্যায় মাত্র দুই পাতায় চলে এসেছে!",
      },
    ],
  },
  {
    id: "course-5",
    slug: "practical-web-development-bootcamp",
    title: "Modern Web Development & Programming Fundamentals",
    titleBn: "বাস্তবমুখী ওয়েব ডেভেলপমেন্ট ও প্রোগ্রামিং ফান্ডামেন্টালস",
    subtitle: "From HTML/CSS and JavaScript basics to creating fullstack apps with Next.js & modern tools.",
    subtitleBn: "স্ক্র্যাচ থেকে কোডিং শুরু করে আধুনিক ওয়েব অ্যাপ্লিকেশন তৈরির পূর্ণাঙ্গ কোর্স।",
    categoryId: "skills-career",
    categorySlug: "skills-career",
    categoryNameBn: "স্কিলস ও ক্যারিয়ার",
    subcategorySlug: "programming",
    subcategoryNameBn: "প্রোগ্রামিং ও ওয়েব",
    instructorId: "inst-6",
    price: 3950,
    originalPrice: 6000,
    rating: 4.89,
    reviewsCount: 380,
    enrolledCount: 3100,
    durationHours: 60,
    totalLessons: 75,
    level: "Beginner",
    language: "বাংলা",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
    previewVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    isFeatured: false,
    isPopular: true,
    description: "Learn how to build modern responsive websites and applications from scratch. Perfect for students wanting to build tech skills alongside their academic studies.",
    descriptionBn: "পড়াশোনার পাশাপাশি ডিজিটাল দক্ষতা অর্জন করে ক্যারিয়ারকে সমৃদ্ধ করার সুযোগ। কোনো পূর্ব কোডিং জ্ঞান ছাড়াই এইচটিএমএল, সিএসএস, জাভাস্ক্রিপ্ট এবং রিয়্যাক্ট দিয়ে প্রজেক্ট ভিত্তিক শিক্ষা।",
    highlights: [
      "৭৫টি ব্যবহারিক প্রজেক্ট-ভিত্তিক ক্লাস",
      "১০টি রিয়েল-ওয়ার্ল্ড ওয়েব প্রজেক্ট তৈরি",
      "গিট ও গিটহাব ভার্সন কন্ট্রোল মাস্টারি",
      "কোর্স সমাপনী সার্টিফিকেট ও গাইডেন্স",
    ],
    prerequisites: ["কম্পিউটার ও ইন্টারনেট ব্যবহারের সাধারণ ধারণা"],
    curriculum: [
      {
        id: "sec-w-1",
        title: "Section 1: Web Foundations (HTML5 & Modern CSS)",
        titleBn: "অধ্যায় ১: ওয়েব ফাউন্ডেশন — এইচটিএমএল ও সিএসএস",
        lessons: [
          { id: "l-w-1", title: "How the Web Works & Developer Setup", titleBn: "ওয়েব কীভাবে কাজ করে ও ডেভেলপমেন্ট সেটআপ", duration: "22:15", isFreePreview: true },
          { id: "l-w-2", title: "Semantic HTML & Accessibility Best Practices", titleBn: "সিমান্টিক এইচটিএমএল ও আধুনিক ট্যাগ", duration: "38:40", isFreePreview: false },
        ],
      },
    ],
    faqs: [
      {
        question: "কোর্স করতে কি শক্তিশালী ল্যাপটপ লাগবে?",
        answer: "না, সাধারণ কোর আই৩ বা ৪ জিবি র‍্যামের যেকোনো কম্পিউটার বা ল্যাপটপ দিয়েই কোডিং শুরু করতে পারবেন।",
      },
    ],
    reviews: [
      {
        id: "rev-w-1",
        studentName: "আরিফ হাসান",
        rating: 5,
        date: "০৫ সেপ্টেম্বর, ২০২৬",
        batch: "এইচএসসি '২৫",
        comment: "কামরুল স্যারের বুঝানোর স্টাইল অসাধারণ। কোনো বোরিং লেকচার নেই, প্রথম দিন থেকেই হাতে-কলমে কোড লিখিয়েছেন।",
      },
    ],
  },
  {
    id: "course-6",
    slug: "du-a-unit-varsity-admission-crash-course",
    title: "DU A-Unit Varsity Admission Complete Crash Course",
    titleBn: "ঢাকা বিশ্ববিদ্যালয় 'ক' ইউনিট ও গুচ্ছ বিজ্ঞান পূর্ণাঙ্গ কোর্স",
    subtitle: "Targeted admission preparation covering Physics, Chemistry, Math & Biology with speed hacks.",
    subtitleBn: "ঢাবি 'ক' ইউনিট ও জিএসটি গুচ্ছ বিজ্ঞান ভর্তি পরীক্ষায় কাঙ্ক্ষিত বিষয় নিশ্চিতের স্পেশাল কোর্স।",
    categoryId: "admission-prep",
    categorySlug: "admission-prep",
    categoryNameBn: "বিশ্ববিদ্যালয় ভর্তি প্রস্তুতি",
    subcategorySlug: "varsity-a",
    subcategoryNameBn: "ভার্সিটি ‘ক’ ইউনিট",
    instructorId: "inst-2",
    price: 3600,
    originalPrice: 5200,
    rating: 4.91,
    reviewsCount: 490,
    enrolledCount: 4800,
    durationHours: 64,
    totalLessons: 78,
    level: "Advanced",
    language: "বাংলা",
    thumbnail: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop",
    previewVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    isFeatured: true,
    isPopular: true,
    badge: "হট পিক",
    badgeColor: "accent",
    description: "Complete preparation for Dhaka University A-Unit and GST cluster admission. High speed MCQ strategies and written answer frameworks to maximize your admission merit position.",
    descriptionBn: "ঢাকা বিশ্ববিদ্যালয় 'ক' ইউনিটের বিগত বছরের প্রশ্নের ট্রেন্ড বিশ্লেষণ করে পদার্থবিজ্ঞান, রসায়ন, গণিত ও জীববিজ্ঞানের প্রতিটি গুরুত্বপূর্ণ টপিকের উপর পূর্ণাঙ্গ দিকনির্দেশনা ও লিখিত অংশের স্পেশাল প্রস্তুতি।",
    highlights: [
      "৭৮টি বিস্তারিত ক্লাস (লিখিত ও নৈর্ব্যক্তিক সমন্বয়)",
      "ঢাবি লিখিত অংশের জন্য স্পেশাল হ্যান্ডবুক PDF",
      "টাইম ম্যানেজমেন্ট ও ক্যালকুলেটর ছাড়া দ্রুত হিসাবের টেকনিক",
      "অধ্যায়ভিত্তিক মডেল প্রশ্ন ও বিস্তারিত সমাধান",
    ],
    prerequisites: ["এইচএসসি বিজ্ঞান বিভাগের পূর্ণাঙ্গ বোর্ড প্রস্তুতি"],
    curriculum: [
      {
        id: "sec-du-1",
        title: "Section 1: DU Written Section Mastery",
        titleBn: "অধ্যায় ১: ঢাবি লিখিত অংশের স্পেশাল টেকনিক",
        lessons: [
          { id: "l-du-1", title: "DU A-Unit Exam Blueprint & Mark Distribution", titleBn: "ঢাবি 'ক' ইউনিট পরীক্ষার প্যাটার্ন ও মানবণ্টন", duration: "16:30", isFreePreview: true },
          { id: "l-du-2", title: "Speed Calculations without Calculator", titleBn: "ক্যালকুলেটর ছাড়া দ্রুত হিসাব করার জাদুকরী কৌশল", duration: "40:15", isFreePreview: true },
        ],
      },
    ],
    faqs: [
      {
        question: "ক্যালকুলেটর ছাড়া হিসাব কীভাবে করব তা কি শেখানো হবে?",
        answer: "হ্যাঁ! ঢাবিতে ক্যালকুলেটর ব্যবহারের সুযোগ নেই, তাই লগারিদম, বর্গমূল, ত্রিকোণমিতিক মানের দ্রুত হিসাবের স্পেশাল টেকনিক কোর্সে শেখানো হয়েছে।",
      },
    ],
    reviews: [
      {
        id: "rev-du-1",
        studentName: "রাকিবুল আনোয়ার",
        rating: 5,
        date: "০১ সেপ্টেম্বর, ২০২৬",
        batch: "ঢাবি ব্যাচ '২৫",
        comment: "ক্যালকুলেটর ছাড়া ফিজিক্স আর কেমিস্ট্রির অংক করার টেকনিকগুলো আমাকে পরীক্ষায় অনেক এগিয়ে রেখেছিল।",
      },
    ],
  },
];

export function getCourseBySlug(slug: string): Course | undefined {
  return COURSES.find((c) => c.slug === slug);
}

export function getCoursesByCategory(categorySlug: string): Course[] {
  return COURSES.filter((c) => c.categorySlug === categorySlug);
}

export function getInstructor(instructorId: string): Instructor | undefined {
  return INSTRUCTORS.find((i) => i.id === instructorId);
}
