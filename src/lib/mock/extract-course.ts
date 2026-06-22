import type { Course } from "@/types/courses";

const uid = () => `ext_${Math.random().toString(36).slice(2, 8)}`;

const courseTemplates = [
  {
    name: "Next.js 15 & Supabase — Build a Full-Stack SaaS",
    coverImage: "https://img.youtube.com/vi/d5x0JC4InMA/maxresdefault.jpg",
    lessons: [
      "مقدمة: ما هو Next.js 15 + Supabase؟",
      "إعداد البيئة والأدوات",
      "إنشاء قاعدة البيانات و Schemas",
      "المصادقة عبر GitHub OAuth",
      "Row Level Security — حماية البيانات",
      "Real-time Subscriptions",
      "رفع الملفات إلى Storage",
      "النشر على Vercel",
    ],
  },
  {
    name: "Framer Motion — Motion Design للواجهات",
    coverImage: "https://img.youtube.com/vi/2HOiP6W7iKI/maxresdefault.jpg",
    lessons: [
      "أساسيات الحركة: Animate و Transition",
      "Gestures: Drag & Hover",
      "AnimatePresence — مدخل وخروج العناصر",
      "Layout Animations",
      "Scroll-triggered animations",
      "SVG و Path animations",
      "مشروع ختامي: واجهة تفاعلية",
    ],
  },
  {
    name: "TypeScript Advanced — أنظمة الأنواع المتقدمة",
    coverImage: "https://img.youtube.com/vi/2pZmKW9-I_k/maxresdefault.jpg",
    lessons: [
      "Generics: من الأساس للاحتراف",
      "Conditional Types و infer",
      "Template Literal Types",
      "Mapped Types — تحويل الأنواع",
      "Utility Types المدمجة",
      "Type Guards و Assertions",
      "Declaration Merging",
      "أنماط متقدمة مع Typescript",
    ],
  },
  {
    name: "Tailwind CSS v4 — تصميم عصري وسريع",
    coverImage: "https://img.youtube.com/vi/mr15Xzb1Ook/maxresdefault.jpg",
    lessons: [
      "المفاهيم الجديدة في v4",
      "CSS-first Configuration",
      "الطبقات والمسافات المتقدمة",
      "التجاوب (Responsive Design)",
      "الألوان والتدرجات المخصصة",
      "Animations المدمجة",
      "التكامل مع React و Next.js",
      "مشروع: لوحة تحكم كاملة",
    ],
  },
];

export async function simulateCourseExtraction(
  _url: string,
): Promise<Omit<Course, "id">> {
  await new Promise((r) => setTimeout(r, 1500));

  const template =
    courseTemplates[Math.floor(Math.random() * courseTemplates.length)];

  const baseVideoId = "d5x0JC4InMA";

  return {
    name: template.name,
    platform: "YouTube",
    coverImage: template.coverImage,
    totalLessons: template.lessons.length,
    completedLessons: 0, totalTimeSpent: 0, cost: 0,
    lessons: template.lessons.map((title, i) => ({
      id: uid(),
      title,
      url: `https://youtu.be/${baseVideoId}?t=${i * 180}`,
      isCompleted: false,
    })),
  };
}
