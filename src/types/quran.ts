export interface Memorization {
  id: string;
  surahId: number;
  fromAyah: number;
  toAyah: number;
  dateMemorized: string;
  lastReviewedDate: string;
  nextReviewDate: string;
  interval: number;
  status: "memorized" | "needs-review";
}
