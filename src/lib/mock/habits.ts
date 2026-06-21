import { Habit, DailyTodo } from "@/types/habits";

const today = "2026-06-19";

export const mockHabits: Habit[] = [
  { id: "h1", name: "صلاة الفجر", type: "morning", streak: 45, completedDates: ["2026-06-18", "2026-06-17", "2026-06-16", "2026-06-15"], active: true },
  { id: "h2", name: "قراءة ورد يومي", type: "morning", streak: 32, completedDates: ["2026-06-18", "2026-06-17"], active: true },
  { id: "h3", name: "رياضة 30 دقيقة", type: "morning", streak: 12, completedDates: ["2026-06-18", "2026-06-17", "2026-06-16"], active: true },
  { id: "h4", name: "إفطار صحي", type: "morning", streak: 28, completedDates: ["2026-06-18", "2026-06-17"], active: true },
  { id: "h5", name: "قراءة 10 صفحات", type: "evening", streak: 18, completedDates: ["2026-06-18", "2026-06-17", "2026-06-16"], active: true },
  { id: "h6", name: "مراجعة اليوم", type: "evening", streak: 22, completedDates: ["2026-06-18", "2026-06-17"], active: true },
  { id: "h7", name: "أذكار المساء", type: "evening", streak: 50, completedDates: ["2026-06-18", "2026-06-17", "2026-06-16", "2026-06-15", "2026-06-14"], active: true },
  { id: "h8", name: "النوم قبل 12", type: "evening", streak: 7, completedDates: ["2026-06-18", "2026-06-17"], active: true },
];

export const mockTodos: DailyTodo[] = [
  { id: "d1", text: "إنهاء تقرير العميل", completed: false, date: today },
  { id: "d2", text: "شراء مستلزمات البيت", completed: false, date: today },
  { id: "d3", text: "الرد على البريد الإلكتروني", completed: true, date: today },
  { id: "d4", text: "مراجعة حساب شهري", completed: false, date: today },
  { id: "d5", text: "اتصال هاتفي مع عميل", completed: true, date: today },
];
