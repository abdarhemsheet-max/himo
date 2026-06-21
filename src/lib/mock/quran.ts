import type { Memorization } from "@/types/quran";

export const TOTAL_QURAN_AYAHS = 6236;

export const mockMemorizations: Memorization[] = [
  { id: "q1", surahId: 1, fromAyah: 1, toAyah: 7, dateMemorized: "2025-01-01", lastReviewedDate: "2026-06-18", nextReviewDate: "2026-06-25", interval: 7, status: "memorized" },
  { id: "q2", surahId: 36, fromAyah: 1, toAyah: 83, dateMemorized: "2025-03-15", lastReviewedDate: "2026-05-20", nextReviewDate: "2026-06-03", interval: 14, status: "needs-review" },
  { id: "q3", surahId: 67, fromAyah: 1, toAyah: 30, dateMemorized: "2025-05-10", lastReviewedDate: "2026-06-19", nextReviewDate: "2026-06-26", interval: 7, status: "memorized" },
  { id: "q4", surahId: 56, fromAyah: 1, toAyah: 96, dateMemorized: "2025-04-20", lastReviewedDate: "2026-06-01", nextReviewDate: "2026-06-10", interval: 30, status: "needs-review" },
  { id: "q5", surahId: 18, fromAyah: 1, toAyah: 110, dateMemorized: "2025-02-28", lastReviewedDate: "2026-06-15", nextReviewDate: "2026-06-29", interval: 14, status: "memorized" },
  { id: "q6", surahId: 44, fromAyah: 1, toAyah: 59, dateMemorized: "2025-06-05", lastReviewedDate: "2026-06-05", nextReviewDate: "2026-06-06", interval: 1, status: "needs-review" },
  { id: "q7", surahId: 55, fromAyah: 1, toAyah: 78, dateMemorized: "2025-07-12", lastReviewedDate: "2026-06-20", nextReviewDate: "2026-06-27", interval: 7, status: "memorized" },
  { id: "q8", surahId: 78, fromAyah: 1, toAyah: 40, dateMemorized: "2025-08-20", lastReviewedDate: "2026-05-05", nextReviewDate: "2026-05-12", interval: 7, status: "needs-review" },
  { id: "q9", surahId: 67, fromAyah: 1, toAyah: 30, dateMemorized: "2025-09-01", lastReviewedDate: "2026-06-14", nextReviewDate: "2026-06-21", interval: 7, status: "memorized" },
  { id: "q10", surahId: 32, fromAyah: 1, toAyah: 30, dateMemorized: "2025-10-15", lastReviewedDate: "2026-04-20", nextReviewDate: "2026-04-27", interval: 7, status: "needs-review" },
];

export const mockMemorizedAyahs = mockMemorizations.reduce(
  (sum, entry) => sum + (entry.toAyah - entry.fromAyah + 1),
  0
);
