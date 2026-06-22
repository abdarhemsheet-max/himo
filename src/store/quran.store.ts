import { create } from "zustand";
import { Memorization } from "@/types/quran";
import { mockMemorizations } from "@/lib/mock/quran";
import { supabase } from "@/lib/supabase";
import { QURAN_SURAHS } from "@/lib/quran-surahs";
import { logger } from "@/lib/logger";

const uid = () => `hifz_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

function todayISO() { return new Date().toISOString().slice(0, 10); }

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

function yesterdayISO() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
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

  fetchAll: () => Promise<void>;
  seedIfEmpty: () => Promise<void>;
  updateStreak: () => void;
  evaluateReviews: () => Promise<void>;
  markAsReviewed: (id: string, difficulty?: Difficulty) => Promise<void>;
  addMemorization: (data: Omit<Memorization, "id" | "lastReviewedDate" | "interval" | "nextReviewDate" | "status">) => Promise<void>;
  deleteMemorization: (id: string) => Promise<void>;
  logFocusSession: (minutes: number) => void;
  getComputed: () => QuranDashboardStats;
}

export const useQuranStore = create<QuranState>((set, get) => ({
  entries: [],
  currentStreak: 0,
  lastActiveDate: "",
  totalFocusMinutes: 0,

  fetchAll: async () => {
    const { data } = await supabase.from("quran_memorizations").select("*");
    if (data) set({ entries: data as unknown as Memorization[] });
  },

  seedIfEmpty: async () => {
    const { data: existing } = await supabase.from("quran_memorizations").select("id").limit(1);
    if (existing && existing.length > 0) return;
    await supabase.from("quran_memorizations").insert(
      mockMemorizations.map(({ id: _m, ...r }) => ({
        surah_id: r.surahId, from_ayah: r.fromAyah, to_ayah: r.toAyah,
        date_memorized: r.dateMemorized, last_reviewed_date: r.lastReviewedDate,
        next_review_date: r.nextReviewDate, interval: r.interval, status: r.status,
      }))
    );
    await get().fetchAll();
  },

  updateStreak: () => {
    const today = todayISO();
    set((s) => {
      if (s.lastActiveDate === today) return s;
      let newStreak = s.currentStreak;
      if (s.lastActiveDate === yesterdayISO()) newStreak += 1;
      else if (s.lastActiveDate && s.lastActiveDate !== today) newStreak = 1;
      else newStreak = 1;
      return { currentStreak: newStreak, lastActiveDate: today };
    });
  },

  evaluateReviews: async () => {
    const today = todayISO();
    const prev = get().entries;
    set((s) => {
      const needsUpdate = s.entries.some((e) => e.nextReviewDate <= today && e.status === "memorized");
      if (!needsUpdate) return s;
      return { entries: s.entries.map((e) =>
        e.nextReviewDate <= today && e.status === "memorized"
          ? { ...e, status: "needs-review" as const } : e
      )};
    });
    const { error } = await supabase.from("quran_memorizations")
      .update({ status: "needs-review" })
      .lte("next_review_date", today)
      .eq("status", "memorized");
    if (error) { logger.api.supabase("evaluate reviews", error); set({ entries: prev }); }
  },

  markAsReviewed: async (id, difficulty = "good") => {
    const today = todayISO();
    get().updateStreak();
    const prev = get().entries;
    set((s) => ({
      entries: s.entries.map((e) => {
        if (e.id !== id) return e;
        const newInterval = applyDifficulty(e.interval, difficulty);
        return { ...e, lastReviewedDate: today, nextReviewDate: addDays(today, newInterval), interval: newInterval, status: "memorized" as const };
      }),
    }));
    const entry = get().entries.find((e) => e.id === id);
    if (entry) {
      const { error } = await supabase.from("quran_memorizations").update({
        last_reviewed_date: entry.lastReviewedDate, next_review_date: entry.nextReviewDate,
        interval: entry.interval, status: entry.status,
      }).eq("id", id);
      if (error) { logger.api.supabase("mark as reviewed", error, { entryId: id }); set({ entries: prev }); }
    }
  },

  addMemorization: async (data) => {
    const today = todayISO();
    get().updateStreak();
    const entry: Memorization = { id: uid(), ...data, lastReviewedDate: today, interval: 1, nextReviewDate: addDays(today, 1), status: "memorized" };
    const prev = get().entries;
    set((s) => ({ entries: [...s.entries, entry] }));

    const { data: inserted, error } = await supabase.from("quran_memorizations").insert({
      surah_id: data.surahId, from_ayah: data.fromAyah, to_ayah: data.toAyah,
      date_memorized: data.dateMemorized, last_reviewed_date: today,
      next_review_date: addDays(today, 1), interval: 1, status: "memorized",
    }).select().single();

    if (error) { logger.api.supabase("insert memorization", error, { surahId: data.surahId }); set({ entries: prev }); return; }
    set((s) => ({ entries: s.entries.map((e) => e.id === entry.id ? { ...e, id: inserted.id } : e) }));
  },

  deleteMemorization: async (id) => {
    const prev = get().entries;
    set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }));
    const { error } = await supabase.from("quran_memorizations").delete().eq("id", id);
    if (error) { logger.api.supabase("delete memorization", error, { entryId: id }); set({ entries: prev }); }
  },

  logFocusSession: (minutes) => set((s) => ({ totalFocusMinutes: s.totalFocusMinutes + minutes })),

  getComputed: () => {
    const state = get();
    const totalAyahs = QURAN_SURAHS.reduce((s, su) => s + su.totalAyahs, 0);
    const memorizedAyahs = state.entries.reduce((sum, e) => sum + (e.toAyah - e.fromAyah + 1), 0);
    const today = todayISO();
    return {
      totalAyahs,
      memorizedAyahs,
      needsReviewCount: state.entries.filter((e) => e.status === "needs-review").length,
      currentStreak: state.currentStreak,
      totalFocusMinutes: state.totalFocusMinutes,
      progressPercent: totalAyahs > 0 ? (memorizedAyahs / totalAyahs) * 100 : 0,
      isActiveToday: state.lastActiveDate === today,
    };
  },
}));
