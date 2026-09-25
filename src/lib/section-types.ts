export const KNOWN_SECTION_TYPES = [
  "demo",
  "outline",
  "academic",
  "basic",
  "solving",
  "exam",
  "pre_admission",
  "admission",
  "resource",
  "other",
  "custom",
  "content",
] as const;

export type KnownSectionType = (typeof KNOWN_SECTION_TYPES)[number];
export type SectionType = KnownSectionType | string;

export type LessonItemType = "video" | "exam" | "material" | "live" | "resource";

export const ITEM_TYPE_INFO: Record<
  LessonItemType,
  { label: string; color: string; badge: string; description: string }
> = {
  video: {
    label: "ভিডিও ক্লাস",
    color: "text-blue-500",
    badge: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    description: "রেকর্ডেড লেকচার বা ক্লাস ভিডিও",
  },
  exam: {
    label: "পরীক্ষা / কুইজ",
    color: "text-emerald-500",
    badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    description: "অনলাইন এক্সাম, কুইজ বা মডেল টেস্ট",
  },
  material: {
    label: "লেকচার শিট / নোট",
    color: "text-amber-500",
    badge: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    description: "পিডিএফ হ্যান্ডনোট, শিট বা ডিজিটাল বই",
  },
  live: {
    label: "লাইভ ক্লাস",
    color: "text-rose-500",
    badge: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    description: "জুম, মিট বা ইউটিউব লাইভ ক্লাস",
  },
  resource: {
    label: "রিসোর্স / লিংক",
    color: "text-purple-500",
    badge: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    description: "ফেসবুক গ্রুপ, ট্র্যাকার বা এক্সটার্নাল লিংক",
  },
};

export const STANDARD_SUBJECTS = [
  "পদার্থবিজ্ঞান ১ম পত্র",
  "পদার্থবিজ্ঞান ২য় পত্র",
  "রসায়ন ১ম পত্র",
  "রসায়ন ২য় পত্র",
  "উচ্চতর গণিত ১ম পত্র",
  "উচ্চতর গণিত ২য় পত্র",
  "জীববিজ্ঞান ১ম পত্র",
  "জীববিজ্ঞান ২য় পত্র",
  "বাংলা ১ম পত্র",
  "বাংলা ২য় পত্র",
  "ইংরেজি",
  "আইসিটি",
  "সাধারণ জ্ঞান",
  "সাধারণ বিজ্ঞান",
  "মেডিকেল জিকে ও ইংলিশ",
] as const;

export interface ParsedSectionType {
  sectionType: SectionType;
  tabLabel?: string;
  subject?: string;
  cleanTitle: string;
  cleanTitleBn: string;
  hasTag: boolean;
}

export const SECTION_TYPE_LABELS: Record<string, string> = {
  demo: "ডেমো ক্লাস",
  outline: "সিলেবাস ও গাইড",
  academic: "একাডেমিক প্রস্তুতি",
  content: "একাডেমিক প্রস্তুতি",
  basic: "একাডেমিক বেসিক ক্লাস",
  solving: "সলভিং ক্লাস",
  exam: "একাডেমিক এক্সাম",
  pre_admission: "প্রি অ্যাডমিশন",
  admission: "ফুল অ্যাডমিশন",
  resource: "রিসোর্স ও টুলস",
  other: "অন্যান্য",
  custom: "কাস্টম ট্যাব (নিজে নাম দিন)",
};

export const SECTION_TYPE_GROUPS: { group: string; options: { value: SectionType; label: string }[] }[] = [
  {
    group: "ক্লাস ও প্রস্তুতি",
    options: [
      { value: "demo", label: "ডেমো ক্লাস" },
      { value: "academic", label: "একাডেমিক প্রস্তুতি" },
      { value: "basic", label: "একাডেমিক বেসিক ক্লাস" },
      { value: "solving", label: "সলভিং ক্লাস" },
    ],
  },
  {
    group: "পরীক্ষা ও ভর্তি",
    options: [
      { value: "exam", label: "একাডেমিক এক্সাম" },
      { value: "pre_admission", label: "প্রি অ্যাডমিশন" },
      { value: "admission", label: "ফুল অ্যাডমিশন" },
    ],
  },
  {
    group: "গাইড, টুলস ও কাস্টম",
    options: [
      { value: "outline", label: "সিলেবাস ও গাইড" },
      { value: "resource", label: "রিসোর্স ও টুলস" },
      { value: "other", label: "অন্যান্য" },
      { value: "custom", label: "কাস্টম ট্যাব (নিজে নাম দিন)" },
    ],
  },
];

const SECTION_TYPE_TAG_RE = /\[([a-z_][a-z0-9_]*|custom:[^\]]+)\]/i;
const SECTION_SUBJECT_TAG_RE = /\[subject:([^\]]+)\]/i;

export function stripSectionTypeTag(value?: string | null): string {
  if (!value) return "";
  return value
    .replace(SECTION_SUBJECT_TAG_RE, "")
    .replace(SECTION_TYPE_TAG_RE, "")
    .trim();
}

export function sanitizeTabLabel(label?: string | null): string {
  return (label || "কাস্টম ট্যাব").replace(/[\[\]]/g, "").trim() || "কাস্টম ট্যাব";
}

export function sanitizeSubject(subject?: string | null): string {
  if (!subject) return "";
  return subject.replace(/[\[\]]/g, "").trim();
}

export function normalizeSectionType(raw?: string | null): SectionType {
  if (!raw) return "academic";
  const value = raw.trim().toLowerCase();
  if (value === "content") return "academic";
  return value || "academic";
}

export function parseSectionTypeFromTitles(
  title?: string | null,
  titleBn?: string | null,
  dbType?: string | null
): ParsedSectionType {
  const rawTitle = title || "";
  const rawTitleBn = titleBn || "";

  // 1. Check for subject tag in title or titleBn
  const subjectMatch = rawTitle.match(SECTION_SUBJECT_TAG_RE) || rawTitleBn.match(SECTION_SUBJECT_TAG_RE);
  const subject = subjectMatch?.[1]?.trim() || undefined;

  // 2. Check for section type tag
  const typeMatch = rawTitle.match(SECTION_TYPE_TAG_RE) || rawTitleBn.match(SECTION_TYPE_TAG_RE);
  const tagged = typeMatch?.[1] || dbType || "";

  let sectionType: SectionType = "academic";
  let tabLabel: string | undefined;

  if (tagged.toLowerCase().startsWith("custom:")) {
    sectionType = "custom";
    tabLabel = tagged.slice(tagged.indexOf(":") + 1).trim() || "কাস্টম ট্যাব";
  } else if (tagged) {
    sectionType = normalizeSectionType(tagged);
  }

  return {
    sectionType,
    tabLabel,
    subject,
    cleanTitle: stripSectionTypeTag(rawTitle),
    cleanTitleBn: stripSectionTypeTag(rawTitleBn),
    hasTag: Boolean(typeMatch || subjectMatch),
  };
}

export function encodeSectionTitle(
  sectionType: string | undefined,
  tabLabel: string | undefined,
  title: string,
  subject?: string | undefined
): string {
  const clean = stripSectionTypeTag(title) || "Chapter";
  const type = normalizeSectionType(sectionType);
  const typeTag = type === "custom" ? `[custom:${sanitizeTabLabel(tabLabel)}]` : `[${type}]`;
  const cleanSubject = sanitizeSubject(subject);
  const subjectTag = cleanSubject ? `[subject:${cleanSubject}]` : "";
  return `${typeTag}${subjectTag} ${clean}`.trim();
}

export function sectionTabKey(sectionType?: string | null, tabLabel?: string | null): string {
  const type = normalizeSectionType(sectionType);
  if (type === "custom") return `custom:${sanitizeTabLabel(tabLabel)}`;
  return type;
}

export function labelForTabKey(key: string): string {
  if (key.startsWith("custom:")) return key.slice(7) || "কাস্টম ট্যাব";
  return SECTION_TYPE_LABELS[key] || SECTION_TYPE_LABELS.academic;
}
