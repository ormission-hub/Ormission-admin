export interface Instructor {
  id: string;
  name: string;
  nameBn: string;
  slug: string;
  institution: string;
  institutionBn: string;
  department: string;
  role: string;
  bio: string;
  bioBn: string;
  avatarUrl: string;
  rating: number;
  reviewsCount: number;
  studentsCount: number;
  coursesCount: number;
  featured: boolean;
  socials?: {
    facebook?: string;
    youtube?: string;
    linkedin?: string;
  };
}

export const INSTRUCTORS: Instructor[] = [
  {
    id: "inst-1",
    name: "Dr. Rafiqul Islam",
    nameBn: "ড. রফিকুল ইসলাম",
    slug: "dr-rafiqul-islam",
    institution: "Dhaka Medical College (DMC)",
    institutionBn: "ঢাকা মেডিকেল কলেজ (DMC)",
    department: "MBBS, FCPS Part-1",
    role: "Senior Biology Faculty",
    bio: "Passionate medical educator with 8+ years of experience mentoring 30,000+ medical admission aspirants.",
    bioBn: "বিগত ৮ বছর ধরে মেডিকেল ভর্তিচ্ছু শিক্ষার্থীদের জীববিজ্ঞানের জটিল ধারণাগুলো সহজভাবে বোঝাতে নিবেদিতপ্রাণ শিক্ষক।",
    avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop",
    rating: 4.9,
    reviewsCount: 1240,
    studentsCount: 32000,
    coursesCount: 5,
    featured: true,
  },
  {
    id: "inst-2",
    name: "Tanvir Ahmed",
    nameBn: "তানভীর আহমেদ",
    slug: "tanvir-ahmed",
    institution: "BUET",
    institutionBn: "বাংলাদেশ প্রকৌশল বিশ্ববিদ্যালয় (BUET)",
    department: "Civil Engineering",
    role: "Lead Physics Instructor",
    bio: "BUET graduate specializing in engineering physics, intuitive problem solving, and Olympiad methodologies.",
    bioBn: "বুয়েট গ্র্যাজুয়েট। শিক্ষার্থীদের মাঝে পদার্থবিজ্ঞানের ভীতি দূর করে বাস্তব জীবনের উদাহরণ দিয়ে পড়ানো তার বিশেষত্ব।",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
    rating: 4.95,
    reviewsCount: 2180,
    studentsCount: 45000,
    coursesCount: 7,
    featured: true,
  },
  {
    id: "inst-3",
    name: "Sayeda Nusrat Jahan",
    nameBn: "সৈয়দা নুসরাত জাহান",
    slug: "sayeda-nusrat-jahan",
    institution: "University of Dhaka (DU)",
    institutionBn: "ঢাকা বিশ্ববিদ্যালয় (DU)",
    department: "Department of Chemistry",
    role: "Head of Chemistry",
    bio: "DU Gold Medalist known for making Organic and Physical Chemistry crystal clear for Board & Varsity exams.",
    bioBn: "ঢাকা বিশ্ববিদ্যালয়ের রসায়ন বিভাগের কৃতি শিক্ষার্থী। জটিল রাসায়নিক বিক্রিয়াকে সহজে উপস্থাপনে অত্যন্ত পারদর্শী।",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop",
    rating: 4.88,
    reviewsCount: 1640,
    studentsCount: 28000,
    coursesCount: 4,
    featured: true,
  },
  {
    id: "inst-4",
    name: "Mahmudul Hasan",
    nameBn: "মাহমুদুল হাসান",
    slug: "mahmudul-hasan",
    institution: "BUET",
    institutionBn: "বাংলাদেশ প্রকৌশল বিশ্ববিদ্যালয় (BUET)",
    department: "Computer Science & Engineering",
    role: "Higher Math & Algorithm Specialist",
    bio: "Ex-software engineer & competitive programmer breaking down calculus, trigonometry and coordinate geometry.",
    bioBn: "উচ্চতর গণিতের জটিল সমীকরণগুলোর পেছনের যুক্তি ও শর্টকাট টেকনিক হাতে-কলমে শেখানোর দীর্ঘ অভিজ্ঞতা।",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
    rating: 4.92,
    reviewsCount: 1890,
    studentsCount: 39000,
    coursesCount: 6,
    featured: true,
  },
  {
    id: "inst-5",
    name: "Ayesha Siddiqua",
    nameBn: "আয়েশা সিদ্দিকা",
    slug: "ayesha-siddiqua",
    institution: "Jahangirnagar University",
    institutionBn: "জাহাঙ্গীরনগর বিশ্ববিদ্যালয়",
    department: "English Literature",
    role: "Senior English Specialist",
    bio: "IELTS 8.5 achiever teaching grammar mastery, vocabulary retention, and admission critical reading techniques.",
    bioBn: "ইংরেজি ব্যাকরণ ও অ্যাডমিশন রিডিং কম্প্রিহেনশনের বাস্তবসম্মত টেকনিক দিয়ে হাজারো শিক্ষার্থীর ভরসার শিক্ষক।",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop",
    rating: 4.85,
    reviewsCount: 950,
    studentsCount: 19000,
    coursesCount: 3,
    featured: false,
  },
  {
    id: "inst-6",
    name: "Kamrul Islam",
    nameBn: "কামরুল ইসলাম",
    slug: "kamrul-islam",
    institution: "Shahjalal University of Science & Technology (SUST)",
    institutionBn: "শাহজালাল বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় (SUST)",
    department: "Software Engineering",
    role: "ICT & Fullstack Instructor",
    bio: "HSC ICT curriculum expert and active web developer simplifying number systems, C programming, and HTML.",
    bioBn: "এইচএসসি আইসিটি বিষয়ের সংখ্যা পদ্ধতি, সি প্রোগ্রামিং এবং ডেটাবেস সহজে সমাধান করার নির্ভরযোগ্য পরামর্শক।",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop",
    rating: 4.89,
    reviewsCount: 1120,
    studentsCount: 22000,
    coursesCount: 4,
    featured: false,
  },
];

export function getInstructorBySlug(slug: string): Instructor | undefined {
  return INSTRUCTORS.find((inst) => inst.slug === slug);
}
