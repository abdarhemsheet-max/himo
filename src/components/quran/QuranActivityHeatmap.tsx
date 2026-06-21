"use client";

import { useMemo } from "react";
import { GlassCard } from "@/components/ui";
import { useQuranStore } from "@/store/quran.store";

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function QuranActivityHeatmap({ days = 90 }: { days?: number }) {
  const entries = useQuranStore((s) => s.entries);

  const activeDates = useMemo(() => {
    const set = new Set<string>();
    for (const e of entries) {
      set.add(e.dateMemorized);
      if (e.lastReviewedDate) set.add(e.lastReviewedDate);
    }
    return set;
  }, [entries]);

  const grid = useMemo(() => {
    const cells: { date: string; active: boolean }[] = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = formatDate(d);
      cells.push({ date: key, active: activeDates.has(key) });
    }
    return cells;
  }, [days, activeDates]);

  const totalActive = grid.filter((c) => c.active).length;

  return (
    <GlassCard className="p-5" hover={false}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-secondary">نشاط الحفظ</span>
          <span className="text-xs text-secondary">(آخر {days} يوم)</span>
        </div>
        <span className="text-xs text-green-accent">
          {totalActive} يوم نشط
        </span>
      </div>
      <div className="flex flex-wrap gap-[3px]" dir="ltr">
        {grid.map((cell) => (
          <div
            key={cell.date}
            className={`w-[10px] h-[10px] rounded-sm transition-colors duration-200 ${
              cell.active
                ? "bg-green-500/80 shadow-[0_0_6px_rgba(34,197,94,0.5)]"
                : "bg-white/5"
            }`}
            title={cell.date}
          />
        ))}
      </div>
      <div className="flex items-center gap-3 mt-3 text-xs text-secondary" dir="rtl">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-white/5" />
          <span>غير نشط</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-green-500/80" />
          <span>نشط</span>
        </div>
      </div>
    </GlassCard>
  );
}
