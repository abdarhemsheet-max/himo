import { Client, Company, Project, Task } from "@/types/workspace";

const p = (id: string, name: string, status: Project["status"], progress: number): Project => ({ id, name, status, progress });

export const mockClients: Client[] = [
  { id: "c1", name: "أحمد السالم", company: "شركة التقنيات المتطورة", email: "a.salem@techcorp.com", phone: "+966 50 123 4567", activeContracts: 2, totalRevenue: 45000, projects: [p("p1", "تطبيق الجوال", "active", 65), p("p2", "لوحة التحكم", "active", 30)], status: "active" },
  { id: "c2", name: "سارة العنزي", company: "منصة زاد التعليمية", email: "sarah@zad.sa", phone: "+966 55 234 5678", activeContracts: 1, totalRevenue: 22000, projects: [p("p3", "منصة تعليمية", "active", 80)], status: "active" },
  { id: "c3", name: "محمد العتيبي", company: "متاجر الإلكتروني", email: "moh@estore.com", phone: "+966 54 345 6789", activeContracts: 3, totalRevenue: 38000, projects: [p("p4", "متجر إلكتروني", "active", 45), p("p5", "تطبيق كاشير", "on_hold", 20), p("p6", "نظام ولاء", "active", 10)], status: "active" },
  { id: "c4", name: "نورة الدوسري", company: "تطبيق توصيل", email: "noura@tawseel.app", phone: "+966 56 456 7890", activeContracts: 1, totalRevenue: 15000, projects: [p("p7", "تطبيق توصيل", "active", 55)], status: "active" },
  { id: "c5", name: "فهد القحطاني", company: "مؤسسة الحلول البرمجية", email: "fahad@softsol.com", phone: "+966 53 567 8901", activeContracts: 2, totalRevenue: 52000, projects: [p("p8", "نظام محاسبي", "active", 70), p("p9", "تطبيق موارد بشرية", "completed", 100)], status: "active" },
  { id: "c6", name: "لمى الشمري", company: "استوديو تصميم", email: "lama@design.studio", phone: "+966 57 678 9012", activeContracts: 1, totalRevenue: 18000, projects: [p("p10", "موقع محفظة", "active", 25)], status: "active" },
  { id: "c7", name: "عبدالله الزهراني", company: "منصة تعليم ذاتي", email: "abdullah@selflearn.com", phone: "+966 58 789 0123", activeContracts: 2, totalRevenue: 29000, projects: [p("p11", "منصة دورات", "active", 90), p("p12", "تطبيق ويب", "on_hold", 40)], status: "active" },
  { id: "c8", name: "سابق (مؤرشف)", company: "شركة ملغية", email: "old@example.com", phone: "+966 50 000 0000", activeContracts: 0, totalRevenue: 0, projects: [], status: "archived" },
];

export const mockCompanies: Company[] = [
  { id: "comp1", name: "وزارة الإعلام", type: "حكومي", email: "info@media.gov.sa", phone: "+966 11 222 3344", monthlyValue: 45000, recurringServices: ["مونتاج فيديو شهري", "تصميم إنفوجرافيك أسبوعي", "تقرير أداء رقمي", "إدارة حسابات التواصل"], activeTasksCount: 12, status: "active" },
  { id: "comp2", name: "وكالة تسويق", type: "خاص", email: "contact@marketing.sa", phone: "+966 55 555 6677", monthlyValue: 28000, recurringServices: ["تصاميم سوشيال ميديا", "مقطع فيديو ترويجي", "تقرير تحليلات شهري"], activeTasksCount: 8, status: "active" },
  { id: "comp3", name: "مؤسسة التعليم الرقمي", type: "خاص", email: "info@digitaledu.sa", phone: "+966 50 123 4567", monthlyValue: 35000, recurringServices: ["تصميم محتوى تعليمي", "مونتاج فيديوهات كورسات", "إنفوغرافيك تفاعلي", "تقرير تفاعل المتعلمين"], activeTasksCount: 15, status: "active" },
  { id: "comp4", name: "شركة سابقة (مؤرشفة)", type: "خاص", email: "", phone: "", monthlyValue: 0, recurringServices: [], activeTasksCount: 0, status: "archived" },
];

export const mockTasks: Task[] = [
  { id: "t1", title: "تصميم واجهة المستخدم", description: "تصميم صفحة التسجيل", status: "in-progress", clientId: "c1", dueDate: "2026-06-22", priority: "high", billableHours: 0 },
  { id: "t2", title: "تطوير API", description: "بناء REST API للمنتجات", status: "pending", clientId: "c2", dueDate: "2026-06-25", priority: "high", billableHours: 0 },
  { id: "t3", title: "إصلاح ثغرات أمنية", description: "مراجعة أمنية للنظام", status: "pending", clientId: "c3", dueDate: "2026-06-20", priority: "critical", billableHours: 0 },
  { id: "t4", title: "تجهيز تقرير شهري", description: "تقرير أداء المشروع", status: "archived", clientId: "c1", dueDate: "2026-06-15", priority: "medium", billableHours: 3 },
  { id: "t5", title: "اختبار التطبيق", description: "اختبار شامل للوظائف", status: "pending", clientId: "c4", dueDate: "2026-06-28", priority: "medium", billableHours: 0 },
  { id: "t6", title: "تحسين سرعة الموقع", description: "تحسين أداء الصفحات", status: "in-progress", clientId: "c5", dueDate: "2026-06-21", priority: "high", billableHours: 0 },
  { id: "t7", title: "اجتماع أسبوعي", description: "متابعة سير العمل", status: "archived", clientId: "c5", dueDate: "2026-06-14", priority: "low", billableHours: 1.5 },
  { id: "t8", title: "إعداد عرض سعر", description: "عرض سعر لمشروع جديد", status: "pending", clientId: "c6", dueDate: "2026-06-30", priority: "medium", billableHours: 0 },
  { id: "t9", title: "دمج بوابة الدفع", description: "ربط Apple Pay و STC Pay", status: "pending", clientId: "c3", dueDate: "2026-06-23", priority: "high", billableHours: 0 },
  { id: "t10", title: "تصدير البيانات", description: "تصدير تقارير المستخدمين", status: "archived", clientId: "c7", dueDate: "2026-06-13", priority: "low", billableHours: 2 },
  { id: "t11", title: "مونتاج فيديو شهري", description: "فيديو توعوي لشهر يونيو", status: "pending", clientId: "", companyId: "comp1", dueDate: "2026-06-25", priority: "high", billableHours: 0 },
  { id: "t12", title: "تصميم إنفوجرافيك أسبوعي", description: "إنفوجرافيك إنجازات الوزارة", status: "in-progress", clientId: "", companyId: "comp1", dueDate: "2026-06-20", priority: "medium", billableHours: 0 },
  { id: "t13", title: "تقرير أداء رقمي", description: "تقرير أداء المنصات لشهر مايو", status: "archived", clientId: "", companyId: "comp1", dueDate: "2026-06-10", priority: "medium", billableHours: 3 },
  { id: "t14", title: "تصاميم سوشيال ميديا", description: "بوستات أسبوعية للعميل", status: "pending", clientId: "", companyId: "comp2", dueDate: "2026-06-22", priority: "high", billableHours: 0 },
  { id: "t15", title: "مقطع فيديو ترويجي", description: "فيديو إطلاق الخدمة الجديدة", status: "pending", clientId: "", companyId: "comp2", dueDate: "2026-06-28", priority: "critical", billableHours: 0 },
  { id: "t16", title: "تصميم محتوى تعليمي", description: "تصميم 10 شرائح تعليمية", status: "pending", clientId: "", companyId: "comp3", dueDate: "2026-06-30", priority: "high", billableHours: 0 },
  { id: "t17", title: "مونتاج فيديوهات كورسات", description: "مونتاج 4 محاضرات", status: "in-progress", clientId: "", companyId: "comp3", dueDate: "2026-06-24", priority: "high", billableHours: 0 },
];
