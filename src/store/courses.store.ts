import { create } from "zustand";
import type { Course } from "@/types/courses";
import { mockCourses } from "@/lib/mock/courses";
import { useFinanceStore } from "./finance.store";

let _nextId = 200;
const uid = () => `cr_${++_nextId}_${Date.now()}`;

interface CoursesState {
  courses: Course[];
  selectedCourse: Course | null;

  loadMockData: () => void;
  selectCourse: (course: Course | null) => void;
  addCourse: (data: Omit<Course, "id">) => void;
  toggleLesson: (courseId: string, lessonId: string) => void;
  addTimeSpent: (courseId: string, seconds: number) => void;
}

export const useCoursesStore = create<CoursesState>((set, get) => ({
  courses: [],
  selectedCourse: null,

  loadMockData: () => {
    set({ courses: mockCourses });
  },

  selectCourse: (course) => {
    set({ selectedCourse: course });
  },

  addCourse: (data) => {
    const course: Course = { id: uid(), ...data };
    set({ courses: [...get().courses, course] });
    // Auto-register expense if course has a cost
    if (course.cost > 0) {
      const wallets = useFinanceStore.getState().wallets;
      if (wallets.length > 0) {
        useFinanceStore.getState().addExpense({
          amount: course.cost,
          category: "software",
          tags: ["education", course.platform],
          description: `دورة: ${course.name}`,
          date: new Date().toISOString().slice(0, 10),
          walletId: wallets[0].id,
        });
      }
    }
  },

  toggleLesson: (courseId, lessonId) => {
    const courses = get().courses.map((c) => {
      if (c.id !== courseId) return c;
      const lessons = c.lessons.map((l) =>
        l.id === lessonId ? { ...l, isCompleted: !l.isCompleted } : l
      );
      const completedLessons = lessons.filter((l) => l.isCompleted).length;
      return { ...c, lessons, completedLessons };
    });
    set({ courses, selectedCourse: courses.find((c) => c.id === courseId) || null });
  },

  addTimeSpent: (courseId, seconds) => {
    set({
      courses: get().courses.map((c) =>
        c.id === courseId ? { ...c, totalTimeSpent: c.totalTimeSpent + seconds } : c
      ),
    });
  },
}));
