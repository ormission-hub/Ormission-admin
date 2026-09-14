export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  titleBn: string;
  excerpt: string;
  excerptBn: string;
  category: string;
  categoryBn: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  coverImage: string;
  readTime: string;
  publishedAt: string;
  tags: string[];
  content: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "blog-1",
    slug: "how-to-prepare-for-buet-admission-test",
    title: "How to Build a High-Ranking Preparation Strategy for BUET Admission",
    titleBn: "বুয়েট ভর্তি পরীক্ষায় শীর্ষ মেধা তালিকায় থাকার পূর্ণাঙ্গ প্রস্তুতি কৌশল",
    excerpt: "A structured study framework from BUET alumni covering problem solving speed, book selections, and mock test analysis.",
    excerptBn: "বুয়েট ভর্তি পরীক্ষায় শুধু সূত্র মুখস্থ করে নয়, বরং গভীর কনসেপ্ট ও দ্রুত নির্ভুল সমস্যা সমাধানের কৌশল নিয়ে বাস্তব অভিজ্ঞতাভিত্তিক গাইডলাইন।",
    category: "Admission Guideline",
    categoryBn: "ভর্তি গাইডলাইন",
    authorName: "তানভীর আহমেদ",
    authorRole: "বুয়েট গ্র্যাজুয়েট ও সিনিয়র মেন্টর",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop",
    readTime: "৭ মিনিট পাঠ",
    publishedAt: "০৫ সেপ্টেম্বর, ২০২৬",
    tags: ["BUET", "Engineering", "StudyTips"],
    content: `
## ১. প্রাথমিক কনসেপ্টের গভীরতা নিশ্চিত করা
বুয়েট ভর্তি পরীক্ষায় কোনো মামুলি প্রশ্ন আসে না। প্রতিটি প্রশ্নে দুই বা ততোধিক অধ্যায়ের কনসেপ্ট সমন্বিতভাবে থাকে। তাই পদার্থবিজ্ঞান ও উচ্চতর গণিতে যেকোনো সূত্রের প্রমাণ ও সীমাবদ্ধতা জেনে রাখা অপরিহার্য।

### প্রস্তাবিত বইয়ের তালিকা:
- **পদার্থবিজ্ঞান:** ইসহাক স্যার ও গিয়াসউদ্দিন স্যারের মূল বই, সাথে কনসেপ্ট বুক।
- **রসায়ন:** সঞ্জিত কুমার গুহ স্যার ও হাজারী-নাগ স্যারের বইয়ের প্রতিটি মেকানিজম।
- **উচ্চতর গণিত:** অসীম কুমার সাহা স্যার ও এস ইউ আহাম্মদ স্যারের অনুশীলনী।

## ২. বিগত ২০ বছরের প্রশ্ন সমাধান (প্রশ্নব্যাংক)
প্রশ্নব্যাংক সমাধান করার উদ্দেশ্য প্রশ্ন কমন পাওয়া নয়, বরং বুয়েট শিক্ষকদের চিন্তার ধারা উপলব্ধি করা। প্রতিটি প্রশ্ন সমাধান করার পর চিন্তা করুন—এই প্রশ্নটির ডাটা একটু বদলে দিলে কীভাবে সমাধান করতে হতো।

## ৩. ক্যালকুলেটর ব্যবহারে সর্বোচ্চ দক্ষতা
বুয়েট ভর্তি পরীক্ষায় নন-প্রোগ্রামেবল অনুমোদিত ক্যালকুলেটর (যেমন fx-991EX বা fx-991CW) দিয়ে দ্রুত ম্যাট্রিক্স, সমীকরণ সমাধান এবং ভেক্টর গুণনের শর্টকাট প্র্যাকটিস অত্যন্ত গুরুত্বপূর্ণ।
    `,
  },
  {
    id: "blog-2",
    slug: "effective-study-methods-for-hsc-students",
    title: "5 Scientifically Proven Study Techniques for HSC Science Students",
    titleBn: "এইচএসসি বিজ্ঞান বিভাগের শিক্ষার্থীদের জন্য ৫টি বৈজ্ঞানিক রিভিশন পদ্ধতি",
    excerpt: "Learn how Active Recall, Spaced Repetition, and the Feynman Technique can double your study retention without burnout.",
    excerptBn: "একটানা ঘণ্টার পর ঘণ্টা বই পড়েও ভুলে যাওয়া রোধে এক্টিভ রিকল এবং স্পেসড রিপিটেশন প্রয়োগের বাস্তব রূপরেখা।",
    category: "Study Hacks",
    categoryBn: "পড়াশোনার কৌশল",
    authorName: "ড. রফিকুল ইসলাম",
    authorRole: "ঢাকা মেডিকেল কলেজ ও এডুকেটর",
    authorAvatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&auto=format&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800&auto=format&fit=crop",
    readTime: "৫ মিনিট পাঠ",
    publishedAt: "২৮ আগস্ট, ২০২৬",
    tags: ["StudyHacks", "ActiveRecall", "HSCPrep"],
    content: `
## ১. এক্টিভ রিকল (Active Recall)
প্যাসিভ রিডিং বা শুধু দাগিয়ে যাওয়া রিভিশনের সবচেয়ে দুর্বল মাধ্যম। কোনো অধ্যায় পড়ার পর বই বন্ধ করে একটি ফাঁকা খাতায় লিখে ফেলুন কী কী মনে আছে। মস্তিষ্ক যখন জোর করে তথ্য পুনরুদ্ধার করে, তখনই স্থায়ী স্মৃতি তৈরি হয়।

## ২. স্পেসড রিপিটেশন (Spaced Repetition)
যেকোনো পড়া ১ম দিন পড়ার পর ৩য় দিন, ৭ম দিন এবং ২১তম দিনে সংক্ষিপ্তভাবে চোখ বুলানো উচিত। এতে এভিংহাউসের বিস্মরণ বক্ররেখা (Forgetting Curve) নিষ্ক্রিয় হয়ে যায়।

## ৩. ফাইনম্যান টেকনিক (The Feynman Technique)
একটি জটিল কনসেপ্ট (যেমন তাপগতিবিদ্যার ২য় সূত্র বা ডিএনএ প্রতিলিপন) এমনভাবে নিজের ভাষায় বুঝিয়ে বলুন যেন আপনি ক্লাস এইটের কোনো শিক্ষার্থীকে বোঝাচ্ছেন। আপনি যেখানে আটকে যাবেন, বুঝবেন আপনার নিজের সেই অংশে বোঝায় ফাঁক রয়েছে।
    `,
  },
  {
    id: "blog-3",
    slug: "du-a-unit-admission-guideline-2026",
    title: "Mastering Speed Math for Dhaka University A-Unit Written & MCQ",
    titleBn: "ঢাবি 'ক' ইউনিটের ভর্তি পরীক্ষার লিখিত ও এমসিকিউতে ভালো করার উপায়",
    excerpt: "Strategic time allocation between Physics, Chemistry, Math and Biology when facing negative marking and no calculator.",
    excerptBn: "ক্যালকুলেটর ছাড়া দ্রুত হিসাব এবং লিখিত অংশে পূর্ণ নম্বর নিশ্চিত করার বাস্তবসম্মত টেকনিক ও ভুল এড়ানোর উপায়।",
    category: "Exam Strategy",
    categoryBn: "পরীক্ষার প্রস্তুতি",
    authorName: "মাহমুদুল হাসান",
    authorRole: "সিনিয়র মেন্টর, অর্মিশন",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop",
    readTime: "৬ মিনিট পাঠ",
    publishedAt: "২০ আগস্ট, ২০২৬",
    tags: ["DhakaUniversity", "Admission", "MathTricks"],
    content: `
## ঢাবিতে ক্যালকুলেটরবিহীন পরীক্ষার বাস্তবতা
ঢাকা বিশ্ববিদ্যালয় বিজ্ঞান অনুষদে কোনো প্রকার ক্যালকুলেটর ব্যবহারের সুযোগ নেই। ফলে অনেক ভালো শিক্ষার্থীও জটিল দশমিকের ভাগে এসে মূল্যবান সময় নষ্ট করে।

### দ্রুত হিসাবের মৌলিক নিয়ম:
- পাই (π) এর মান ২২/৭ হিসেবে ধরে কাটাকাটি করা।
- g = 9.8 এর পরিবর্তে প্রাথমিক অনুমানের জন্য 10 বিবেচনা করা।
- লগারিদমের বেস মানগুলো (log 2 = 0.3010, log 3 = 0.4771) মুখস্থ রাখা।

## লিখিত অংশের খাতা মূল্যায়ন
ঢাবি লিখিত অংশে প্রশ্নের নিচে সীমিত জায়গা বরাদ্দ থাকে। তাই খসড়া বাইরে করে চূড়ান্ত নির্ভুল ধাপগুলো পরিচ্ছন্নভাবে সাজিয়ে উপস্থাপন করতে হবে।
    `,
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((b) => b.slug === slug);
}
