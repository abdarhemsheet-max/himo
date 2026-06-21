"use client";

import { useMemo } from "react";
import { BarChart3 } from "lucide-react";
import { GlassCard } from "@/components/ui";
import { useQuranStore } from "@/store/quran.store";
import { QURAN_SURAHS } from "@/lib/quran-surahs";

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(d: Date) {
  return d.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function QuranPredictorCard() {
  const entries = useQuranStore((s) => s.entries);

  const prediction = useMemo(() => {
    if (entries.length === 0) return null;

    const now = new Date();
    const cutoff30 = new Date(now);
    cutoff30.setDate(cutoff30.getDate() - 30);

    const recentEntries = entries.filter(
      (e) => new Date(e.dateMemorized) >= cutoff30
    );

    const totalAyahsMemorized = recentEntries.reduce(
      (sum, e) => sum + (e.toAyah - e.fromAyah + 1),
      0
    );

    const daysWithData = Math.max(
      Math.ceil(
        (now.getTime() - cutoff30.getTime()) / (1000 * 60 * 60 * 24)
      ),
      1
    );

    const velocity = totalAyahsMemorized / daysWithData;

    if (velocity === 0) return null;

    const lastEntry = entries[entries.length - 1];
    const currentSurah = QURAN_SURAHS.find((s) => s.id === lastEntry.surahId);
    if (!currentSurah) return null;

    const ayahsDoneInSurah = entries
      .filter((e) => e.surahId === currentSurah.id)
      .reduce((sum, e) => sum + (e.toAyah - e.fromAyah + 1), 0);

    const ayahsRemaining = currentSurah.totalAyahs - ayahsDoneInSurah;
    const daysToFinish = Math.ceil(ayahsRemaining / velocity);
    const estDate = addDays(new Date(), daysToFinish);

    const totalDaysToCompleteQuran = Math.ceil(6236 / velocity);
    const estCompletionDate = addDays(new Date(), totalDaysToCompleteQuran);

    return {
      velocity: Math.round(velocity * 10) / 10,
      currentSurahName: currentSurah.name,
      ayahsRemaining,
      daysToFinish,
      estDate,
      totalDaysToCompleteQuran,
      estCompletionDate,
    };
  }, [entries]);

  return (
    <GlassCard className="p-5" hover={false} glow="accent">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={18} className="text-accent-light" />
        <span className="text-sm font-medium text-secondary">المحرك التنبؤي</span>
      </div>
      {!prediction ? (
        <p className="text-xs text-secondary text-center py-6">
          لا توجد بيانات كافية للتنبؤ
        </p>
      ) : (
        <div className="space-y-3 text-sm leading-relaxed" dir="rtl">
          <p className="text-primary">
            بناءً على سرعتك الحالية{" "}
            <span className="text-accent-light font-semibold">
              ({prediction.velocity} آية/يوم)
            </span>
            :
          </p>
          <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
            <p className="text-primary">
              يُتوقع أن تختم سورة{" "}
              <span className="text-accent-light font-semibold">
                {prediction.currentSurahName}
              </span>{" "}
              (<span className="text-accent-light">{prediction.ayahsRemaining}</span> آية متبقية){" "}
              <span className="text-accent-light font-semibold">
                في {formatDate(prediction.estDate)}
              </span>
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
            <p className="text-primary">
              يُتوقع أن تختم القرآن كاملاً{" "}
              <span className="text-green-accent font-semibold">
                في {formatDate(prediction.estCompletionDate)}
              </span>{" "}
              (خلال {prediction.totalDaysToCompleteQuran} يوماً)
            </p>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
