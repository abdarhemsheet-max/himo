import { create } from "zustand";
import type { Memorization } from "@/types/quran";
import { mockMemorizations } from "@/lib/mock/quran";
import { QURAN_SURAHS } from "@/lib/quran-surahs";

const uid = () => `hifz_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

type Difficulty = "hard" | "good" | "easy";

function applyDifficulty(currentInterval: number, difficulty: Difficulty) {
  if (difficulty === "hard") return 1;
  if (difficulty === "good") return Math.round(currentInterval * 1.5);
  return Math.round(currentInterval * 2.5);
}

export interface QuranDashboardStats {
  totalAyahs: number;
  memorizedAyahs: number;
  needsReviewCount: number;
  currentStreak: number;
  totalFocusMinutes: number;
  progressPercent: number;
  isActiveToday: boolean;
}

interface QuranState {
  entries: Memorization[];
  currentStreak: number;
  lastActiveDate: string;
  totalFocusMinutes: number;

  updateStreak: () => void;
  loadMockData: () => void;
  evaluateReviews: () => void;
  markAsReviewed: (id: string, difficulty?: Difficulty) => void;
  addMemorization: (data: Omit<Memorization, "id" | "lastReviewedDate" | "interval" | "nextReviewDate" | "status">) => void;
  deleteMemorization: (id: string) => void;
  logFocusSession: (minutes: number) => void;
  getComputed: () => QuranDashboardStats;
}

function yesterdayISO() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export const useQuranStore = create<QuranState>((set, get) => ({
  entries: [],
  currentStreak: 0,
  lastActiveDate: "",
  totalFocusMinutes: 0,

  loadMockData: () => {
    set({ entries: mockMemorizations });
  },

  updateStreak: () => {
    const today = todayISO();
    set((s) => {
      if (s.lastActiveDate === today) return s;
      let newStreak = s.currentStreak;
      if (s.lastActiveDate === yesterdayISO()) {
        newStreak += 1;
      } else if (s.lastActiveDate && s.lastActiveDate !== today) {
        newStreak = 1;
      } else {
        newStreak = 1;
      }
      return { currentStreak: newStreak, lastActiveDate: today };
    });
  },

  evaluateReviews: () => {
    const today = todayISO();
    set((s) => {
      const needsUpdate = s.entries.some(
        (e) => e.nextReviewDate <= today && e.status === "memorized"
      );
      if (!needsUpdate) return s;
      return {
        entries: s.entries.map((e) =>
          e.nextReviewDate <= today && e.status === "memorized"
            ? { ...e, status: "needs-review" as const }
            : e
        ),
      };
    });
  },

  markAsReviewed: (id, difficulty = "good") => {
    const today = todayISO();
    get().updateStreak();
    set((s) => ({
      entries: s.entries.map((e) => {
        if (e.id !== id) return e;
        const newInterval = applyDifficulty(e.interval, difficulty);
        return {
          ...e,
          lastReviewedDate: today,
          nextReviewDate: addDays(today, newInterval),
          interval: newInterval,
          status: "memorized" as const,
        };
      }),
    }));
  },

  addMemorization: (data) => {
    const today = todayISO();
    get().updateStreak();
    const entry: Memorization = {
      id: uid(),
      ...data,
      lastReviewedDate: today,
      interval: 1,
      nextReviewDate: addDays(today, 1),
      status: "memorized",
    };
    set((s) => ({ entries: [...s.entries, entry] }));
  },

  deleteMemorization: (id) => {
    set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }));
  },

  logFocusSession: (minutes) => {
    set((s) => ({ totalFocusMinutes: s.totalFocusMinutes + minutes }));
  },

  getComputed: () => {
    const state = get();
    const entries = state.entries;
    const totalAyahs = QURAN_SURAHS.reduce((s, su) => s + su.totalAyahs, 0);
    const memorizedAyahs = entries.reduce(
      (sum, e) => sum + (e.toAyah - e.fromAyah + 1),
      0
    );
    const needsReviewCount = entries.filter(
      (e) => e.status === "needs-review"
    ).length;
    const today = todayISO();
    return {
      totalAyahs,
      memorizedAyahs,
      needsReviewCount,
      currentStreak: state.currentStreak,
      totalFocusMinutes: state.totalFocusMinutes,
      progressPercent: totalAyahs > 0 ? (memorizedAyahs / totalAyahs) * 100 : 0,
      isActiveToday: state.lastActiveDate === today,
    };
  },
}));
