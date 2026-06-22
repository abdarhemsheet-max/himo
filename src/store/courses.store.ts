import { create } from "zustand";
import { Course } from "@/types/courses";
import { mockCourses } from "@/lib/mock/courses";
import { supabase } from "@/lib/supabase";
import { useFinanceStore } from "./finance.store";
import { logger } from "@/lib/logger";

let _nextId = 200;
const uid = () => `cr_${++_nextId}_${Date.now()}`;

interface CoursesState {
  courses: Course[];
  selectedCourse: Course | null;

  fetchAll: () => Promise<void>;
  seedIfEmpty: () => Promise<void>;
  selectCourse: (course: Course | null) => void;
  addCourse: (data: Omit<Course, "id">) => Promise<void>;
  toggleLesson: (courseId: string, lessonId: string) => Promise<void>;
  addTimeSpent: (courseId: string, seconds: number) => Promise<void>;
}

export const useCoursesStore = create<CoursesState>((set, get) => ({
  courses: [],
  selectedCourse: null,

  fetchAll: async () => {
    const { data } = await supabase.from("courses").select("*");
    if (data) set({ courses: data as unknown as Course[] });
  },

  seedIfEmpty: async () => {
    const { data: existing } = await supabase.from("courses").select("id").limit(1);
    if (existing && existing.length > 0) return;
    await supabase.from("courses").insert(
      mockCourses.map(({ id: _cid, ...r }) => ({
        name: r.name, platform: r.platform, cover_image: r.coverImage,
        total_lessons: r.totalLessons, completed_lessons: r.completedLessons,
        total_time_spent: r.totalTimeSpent, cost: r.cost,
        lessons: JSON.stringify(r.lessons.map(({ id: _lid, ...lr }) => lr)),
      }))
    );
    await get().fetchAll();
  },

  selectCourse: (course) => set({ selectedCourse: course }),

  addCourse: async (data) => {
    const course: Course = { id: uid(), ...data };
    const prev = get().courses;
    set({ courses: [...prev, course] });

    const { error } = await supabase.from("courses").insert({
      name: data.name, platform: data.platform, cover_image: data.coverImage,
      total_lessons: data.totalLessons, completed_lessons: data.completedLessons,
      total_time_spent: data.totalTimeSpent, cost: data.cost,
      lessons: JSON.stringify(data.lessons.map(({ id: __, ...l }) => l)),
    });

    if (error) { logger.api.supabase("insert course", error, { name: data.name }); set({ courses: prev }); return; }

    if (course.cost > 0) {
      const wallets = useFinanceStore.getState().wallets;
      if (wallets.length > 0) {
        useFinanceStore.getState().addExpense({
          amount: course.cost, category: "software",
          tags: ["education", course.platform],
          description: `دورة: ${course.name}`,
          date: new Date().toISOString().slice(0, 10),
          walletId: wallets[0].id,
        });
      }
    }
  },

  toggleLesson: async (courseId, lessonId) => {
    const prev = get().courses;
    const courses = prev.map((c) => {
      if (c.id !== courseId) return c;
      const lessons = c.lessons.map((l) => l.id === lessonId ? { ...l, isCompleted: !l.isCompleted } : l);
      const completedLessons = lessons.filter((l) => l.isCompleted).length;
      return { ...c, lessons, completedLessons };
    });
    set({ courses, selectedCourse: courses.find((c) => c.id === courseId) || null });

    const updated = courses.find((c) => c.id === courseId);
    if (updated) {
      const { error } = await supabase.from("courses").update({
        completed_lessons: updated.completedLessons,
        lessons: JSON.stringify(updated.lessons.map(({ id: __, ...l }) => l)),
      }).eq("id", courseId);
      if (error) { logger.api.supabase("toggle lesson", error, { courseId, lessonId }); set({ courses: prev, selectedCourse: prev.find((c) => c.id === courseId) || null }); }
    }
  },

  addTimeSpent: async (courseId, seconds) => {
    const prev = get().courses;
    set({ courses: prev.map((c) => c.id === courseId ? { ...c, totalTimeSpent: c.totalTimeSpent + seconds } : c) });
    const updated = get().courses.find((c) => c.id === courseId);
    if (updated) {
      const { error } = await supabase.from("courses").update({ total_time_spent: updated.totalTimeSpent }).eq("id", courseId);
      if (error) { logger.api.supabase("add time spent", error, { courseId }); set({ courses: prev }); }
    }
  },
}));
