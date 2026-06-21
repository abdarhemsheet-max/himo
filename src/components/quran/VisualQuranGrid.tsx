"use client";

import { useMemo } from "react";
import { GlassCard } from "@/components/ui";
import { useQuranStore } from "@/store/quran.store";
import { QURAN_SURAHS } from "@/lib/quran-surahs";

export default function VisualQuranGrid() {
  const entries = useQuranStore((s) => s.entries);

  const surahState = useMemo(() => {
    const map = new Map<number, "memorized" | "needs-review">();
    for (const entry of entries) {
      const existing = map.get(entry.surahId);
      if (entry.status === "needs-review") {
        map.set(entry.surahId, "needs-review");
      } else if (!existing) {
        map.set(entry.surahId, "memorized");
      }
    }
    return map;
  }, [entries]);

  return (
    <GlassCard className="p-5" hover={false}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-medium text-secondary">خريطة السور</span>
        <span className="text-xs text-secondary">(114 سورة)</span>
      </div>
      <div className="flex flex-wrap gap-1.5" dir="rtl">
        {QURAN_SURAHS.map((surah) => {
          const state = surahState.get(surah.id);
          let className = "w-[26px] h-[26px] rounded-md border transition-all duration-300 ";
          if (state === "memorized") {
            className += "bg-[rgba(249,115,22,0.2)] border-[rgba(249,115,22,0.4)] shadow-[0_0_8px_-1px_rgba(249,115,22,0.3)]";
          } else if (state === "needs-review") {
            className += "bg-[rgba(245,158,11,0.2)] border-[rgba(245,158,11,0.4)] shadow-[0_0_8px_-1px_rgba(245,158,11,0.3)] animate-pulse";
          } else {
            className += "bg-white/5 border-white/10";
          }
          return (
            <div
              key={surah.id}
              className={className}
              title={`${surah.id}. ${surah.name} (${surah.totalAyahs})`}
            />
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-4 text-xs text-secondary" dir="rtl">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-white/5 border border-white/10" />
          <span>غير محفوظ</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[rgba(245,158,11,0.2)] border border-[rgba(245,158,11,0.4)]" />
          <span>يحتاج مراجعة</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[rgba(249,115,22,0.2)] border border-[rgba(249,115,22,0.4)]" />
          <span>محفوظ</span>
        </div>
      </div>
    </GlassCard>
  );
}
