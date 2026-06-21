"use client";

import { BookMarked } from "lucide-react";
import { GlassCard, CircularProgress } from "@/components/ui";
import { mockMemorizedAyahs, TOTAL_QURAN_AYAHS } from "@/lib/mock/quran";

export default function QuranTarget() {
  const todayTarget = 7;
  const progress = (mockMemorizedAyahs / TOTAL_QURAN_AYAHS) * 100;

  return (
    <GlassCard className="p-5" glow="accent">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookMarked size={18} className="text-accent-light" />
          <span className="text-sm font-medium text-secondary">هدف الحفظ اليوم</span>
        </div>
        <span className="text-xs text-secondary">هدف اليوم: {todayTarget} آيات</span>
      </div>

      <div className="flex flex-col items-center py-2">
        <div className="relative">
          <CircularProgress
            value={progress}
            size={100}
            strokeWidth={6}
            color="#F97316"
          />
        </div>
        <div className="mt-3 text-center">
          <p className="text-sm text-secondary">
            المحفوظ: {mockMemorizedAyahs.toLocaleString("ar-SA")} /{" "}
            {TOTAL_QURAN_AYAHS.toLocaleString("ar-SA")} آية
          </p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="text-xs text-secondary">تم اليوم:</span>
            <span className="text-sm font-bold text-accent-light">0 / {todayTarget}</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
